<?php

namespace App\Services\EmailProviders;

use App\Models\Email;
use App\Models\EmailAccount;
use Google\Client;
use Google\Service\Gmail;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class GmailProvider implements EmailProviderInterface
{
    private Client $client;
    private Gmail $service;
    private EmailAccount $account;

    public function __construct(EmailAccount $account)
    {
        $this->account = $account;
        $this->initializeClient();
    }

    private function initializeClient(): void
    {
        $this->client = new Client();
        $this->client->setApplicationName('Email Automation App');
        $this->client->setScopes([Gmail::GMAIL_READONLY, Gmail::GMAIL_SEND]);
        $this->client->setAuthConfig([
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect_uri'),
        ]);

        if ($this->account->credentials) {
            $this->client->setAccessToken($this->account->credentials);
        }

        $this->service = new Gmail($this->client);
    }

    public function authenticate(): string
    {
        $authUrl = $this->client->createAuthUrl();
        return $authUrl;
    }

    public function setAccessToken(array $token): void
    {
        $this->client->setAccessToken($token);
        $this->account->update([
            'credentials' => $token,
        ]);
    }

    public function refreshTokenIfNeeded(): bool
    {
        if ($this->client->isAccessTokenExpired()) {
            $refreshToken = $this->account->credentials['refresh_token'] ?? null;
            if ($refreshToken) {
                $this->client->refreshToken($refreshToken);
                $newToken = $this->client->getAccessToken();
                $this->account->update([
                    'credentials' => array_merge($this->account->credentials, $newToken),
                ]);
                return true;
            }
            return false;
        }
        return true;
    }

    public function fetchEmails(int $limit = 50, ?string $since = null): Collection
    {
        if (!$this->refreshTokenIfNeeded()) {
            throw new \Exception('Failed to refresh Gmail access token');
        }

        try {
            $query = 'in:inbox';
            if ($since) {
                $query .= ' after:' . date('Y/m/d', strtotime($since));
            }

            $messages = $this->service->users_messages->listUsersMessages(
                'me',
                [
                    'maxResults' => $limit,
                    'q' => $query,
                ]
            );

            $emails = collect();
            foreach ($messages->getMessages() as $message) {
                $email = $this->fetchEmail($message->getId());
                if ($email) {
                    $emails->push($email);
                }
            }

            return $emails;
        } catch (\Exception $e) {
            Log::error('Gmail fetch emails error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function fetchEmail(string $messageId): ?Email
    {
        try {
            $message = $this->service->users_messages->get('me', $messageId, [
                'format' => 'full'
            ]);

            return $this->parseMessage($message);
        } catch (\Exception $e) {
            Log::error('Gmail fetch email error: ' . $e->getMessage());
            return null;
        }
    }

    private function parseMessage($message): Email
    {
        $headers = collect($message->getPayload()->getHeaders());

        $subject = $headers->firstWhere('name', 'Subject')->value ?? '';
        $from = $this->parseAddress($headers->firstWhere('name', 'From')->value ?? '');
        $to = $this->parseAddresses($headers->firstWhere('name', 'To')->value ?? '');
        $cc = $this->parseAddresses($headers->firstWhere('name', 'Cc')->value ?? '');
        $bcc = $this->parseAddresses($headers->firstWhere('name', 'Bcc')->value ?? '');

        $sentAt = null;
        if ($dateHeader = $headers->firstWhere('name', 'Date')) {
            $sentAt = date('Y-m-d H:i:s', strtotime($dateHeader->value));
        }

        $bodyText = '';
        $bodyHtml = '';
        $attachments = [];

        $this->parsePayload($message->getPayload(), $bodyText, $bodyHtml, $attachments);

        return $this->account->emails()->updateOrCreate(
            ['message_id' => $message->getId()],
            [
                'subject' => $subject,
                'body_text' => $bodyText,
                'body_html' => $bodyHtml,
                'from' => $from,
                'to' => $to,
                'cc' => $cc,
                'bcc' => $bcc,
                'attachments' => $attachments,
                'sent_at' => $sentAt,
                'received_at' => now(),
                'is_read' => !in_array('UNREAD', $message->getLabelIds() ?? []),
                'folder' => 'INBOX',
                'labels' => $message->getLabelIds(),
            ]
        );
    }

    private function parsePayload($payload, &$bodyText, &$bodyHtml, &$attachments): void
    {
        if ($payload->getBody()->getData()) {
            $data = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload->getBody()->getData()));
            if ($payload->getMimeType() === 'text/plain') {
                $bodyText = $data;
            } elseif ($payload->getMimeType() === 'text/html') {
                $bodyHtml = $data;
            }
        }

        if ($payload->getParts()) {
            foreach ($payload->getParts() as $part) {
                if ($part->getMimeType() === 'text/plain' && $part->getBody()->getData()) {
                    $bodyText = base64_decode(str_replace(['-', '_'], ['+', '/'], $part->getBody()->getData()));
                } elseif ($part->getMimeType() === 'text/html' && $part->getBody()->getData()) {
                    $bodyHtml = base64_decode(str_replace(['-', '_'], ['+', '/'], $part->getBody()->getData()));
                } elseif ($part->getFilename()) {
                    $attachments[] = [
                        'filename' => $part->getFilename(),
                        'mime_type' => $part->getMimeType(),
                        'size' => $part->getBody()->getSize(),
                        'attachment_id' => $part->getBody()->getAttachmentId(),
                    ];
                } else {
                    $this->parsePayload($part, $bodyText, $bodyHtml, $attachments);
                }
            }
        }
    }

    private function parseAddress(string $address): array
    {
        // Parse email addresses like "Name <email@example.com>" or "email@example.com"
        if (preg_match('/^(.+?)\s*<(.+?)>$/', $address, $matches)) {
            return [
                'name' => trim($matches[1]),
                'email' => trim($matches[2]),
            ];
        }
        return [
            'name' => '',
            'email' => trim($address),
        ];
    }

    private function parseAddresses(string $addresses): array
    {
        if (empty($addresses)) {
            return [];
        }

        $result = [];
        $addressList = explode(',', $addresses);
        foreach ($addressList as $address) {
            $result[] = $this->parseAddress(trim($address));
        }
        return $result;
    }

    public function sendEmail(array $data): bool
    {
        if (!$this->refreshTokenIfNeeded()) {
            throw new \Exception('Failed to refresh Gmail access token');
        }

        try {
            $message = $this->createMessage($data);
            $this->service->users_messages->send('me', $message);
            return true;
        } catch (\Exception $e) {
            Log::error('Gmail send email error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function createMessage(array $data): \Google\Service\Gmail\Message
    {
        $message = new \Google\Service\Gmail\Message();

        $rawMessage = "To: " . $data['to'] . "\r\n";
        $rawMessage .= "Subject: " . $data['subject'] . "\r\n";

        if (isset($data['cc'])) {
            $rawMessage .= "Cc: " . $data['cc'] . "\r\n";
        }

        $rawMessage .= "\r\n" . $data['body'];

        $message->setRaw(base64_encode($rawMessage));

        return $message;
    }
}
