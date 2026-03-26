<?php

namespace App\Services\EmailProviders;

use App\Models\Email;
use App\Models\EmailAccount;
use Microsoft\Graph\Graph;
use Microsoft\Graph\Model\Message;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class OutlookProvider implements EmailProviderInterface
{
    private Graph $graph;
    private EmailAccount $account;

    public function __construct(EmailAccount $account)
    {
        $this->account = $account;
        $this->initializeGraph();
    }

    private function initializeGraph(): void
    {
        $this->graph = new Graph();
        if ($this->account->credentials) {
            $this->graph->setAccessToken($this->account->credentials['access_token']);
        }
    }

    public function authenticate(): string
    {
        // Outlook uses OAuth2 flow similar to Gmail
        // Return the Microsoft OAuth URL
        $clientId = config('services.microsoft.client_id');
        $redirectUri = config('services.microsoft.redirect_uri');
        $scope = 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send';

        return "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" . http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'scope' => $scope,
            'response_mode' => 'query',
        ]);
    }

    public function setAccessToken(array $token): void
    {
        $this->graph->setAccessToken($token['access_token']);
        $this->account->update([
            'credentials' => $token,
        ]);
    }

    public function refreshTokenIfNeeded(): bool
    {
        // Microsoft Graph handles token refresh automatically
        // Check if we need to refresh based on expiry
        if (isset($this->account->credentials['expires_at'])) {
            $expiresAt = strtotime($this->account->credentials['expires_at']);
            if (time() >= $expiresAt - 300) { // Refresh 5 minutes before expiry
                return $this->refreshToken();
            }
        }
        return true;
    }

    private function refreshToken(): bool
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
                'form_params' => [
                    'client_id' => config('services.microsoft.client_id'),
                    'client_secret' => config('services.microsoft.client_secret'),
                    'refresh_token' => $this->account->credentials['refresh_token'],
                    'grant_type' => 'refresh_token',
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            $newToken = [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? $this->account->credentials['refresh_token'],
                'expires_at' => date('Y-m-d H:i:s', time() + $data['expires_in']),
                'token_type' => $data['token_type'],
            ];

            $this->setAccessToken($newToken);
            return true;
        } catch (\Exception $e) {
            Log::error('Outlook token refresh error: ' . $e->getMessage());
            return false;
        }
    }

    public function fetchEmails(int $limit = 50, ?string $since = null): Collection
    {
        if (!$this->refreshTokenIfNeeded()) {
            throw new \Exception('Failed to refresh Outlook access token');
        }

        try {
            $queryParams = [
                '$top' => $limit,
                '$orderby' => 'receivedDateTime desc',
            ];

            if ($since) {
                $queryParams['$filter'] = "receivedDateTime ge {$since}";
            }

            $messages = $this->graph->createRequest('GET', '/me/messages')
                ->addHeaders(['Prefer' => 'outlook.body-content-type="text"'])
                ->setQuery($queryParams)
                ->setReturnType(Message::class)
                ->execute();

            $emails = collect();
            foreach ($messages as $message) {
                $email = $this->parseMessage($message);
                $emails->push($email);
            }

            return $emails;
        } catch (\Exception $e) {
            Log::error('Outlook fetch emails error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function fetchEmail(string $messageId): ?Email
    {
        try {
            $message = $this->graph->createRequest('GET', "/me/messages/{$messageId}")
                ->addHeaders(['Prefer' => 'outlook.body-content-type="html"'])
                ->setReturnType(Message::class)
                ->execute();

            return $this->parseMessage($message);
        } catch (\Exception $e) {
            Log::error('Outlook fetch email error: ' . $e->getMessage());
            return null;
        }
    }

    private function parseMessage(Message $message): Email
    {
        $from = $message->getFrom()->getEmailAddress();
        $toRecipients = $message->getToRecipients();
        $ccRecipients = $message->getCcRecipients();

        $to = [];
        if ($toRecipients) {
            foreach ($toRecipients as $recipient) {
                $to[] = [
                    'name' => $recipient->getEmailAddress()->getName() ?? '',
                    'email' => $recipient->getEmailAddress()->getAddress(),
                ];
            }
        }

        $cc = [];
        if ($ccRecipients) {
            foreach ($ccRecipients as $recipient) {
                $cc[] = [
                    'name' => $recipient->getEmailAddress()->getName() ?? '',
                    'email' => $recipient->getEmailAddress()->getAddress(),
                ];
            }
        }

        return $this->account->emails()->updateOrCreate(
            ['message_id' => $message->getId()],
            [
                'subject' => $message->getSubject() ?? '',
                'body_text' => $message->getBody()->getContent() ?? '',
                'body_html' => $message->getBody()->getContent() ?? '',
                'from' => [
                    'name' => $from->getName() ?? '',
                    'email' => $from->getAddress(),
                ],
                'to' => $to,
                'cc' => $cc,
                'bcc' => [], // BCC not available in Microsoft Graph
                'attachments' => $this->parseAttachments($message),
                'sent_at' => $message->getSentDateTime()->format('Y-m-d H:i:s'),
                'received_at' => $message->getReceivedDateTime()->format('Y-m-d H:i:s'),
                'is_read' => $message->getIsRead(),
                'folder' => 'INBOX',
                'labels' => [], // Outlook uses categories instead of labels
            ]
        );
    }

    private function parseAttachments(Message $message): array
    {
        $attachments = [];
        $attachmentCollection = $message->getAttachments();

        if ($attachmentCollection) {
            foreach ($attachmentCollection as $attachment) {
                $attachments[] = [
                    'filename' => $attachment->getName(),
                    'mime_type' => $attachment->getContentType(),
                    'size' => $attachment->getSize(),
                ];
            }
        }

        return $attachments;
    }

    public function sendEmail(array $data): bool
    {
        if (!$this->refreshTokenIfNeeded()) {
            throw new \Exception('Failed to refresh Outlook access token');
        }

        try {
            $message = [
                'message' => [
                    'subject' => $data['subject'],
                    'body' => [
                        'contentType' => 'HTML',
                        'content' => $data['body'],
                    ],
                    'toRecipients' => $this->formatRecipients($data['to']),
                ],
            ];

            if (isset($data['cc'])) {
                $message['message']['ccRecipients'] = $this->formatRecipients($data['cc']);
            }

            $this->graph->createRequest('POST', '/me/sendMail')
                ->attachBody($message)
                ->execute();

            return true;
        } catch (\Exception $e) {
            Log::error('Outlook send email error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function formatRecipients(string $recipients): array
    {
        $result = [];
        $emails = explode(',', $recipients);

        foreach ($emails as $email) {
            $result[] = [
                'emailAddress' => [
                    'address' => trim($email),
                ],
            ];
        }

        return $result;
    }
}
