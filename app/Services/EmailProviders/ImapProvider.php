<?php

namespace App\Services\EmailProviders;

use App\Models\Email;
use App\Models\EmailAccount;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ImapProvider implements EmailProviderInterface
{
    private $imapStream;
    private EmailAccount $account;

    public function __construct(EmailAccount $account)
    {
        $this->account = $account;
    }

    private function connect(): void
    {
        if ($this->imapStream) {
            return;
        }

        $credentials = $this->account->credentials;
        $host = $credentials['host'];
        $port = $credentials['port'] ?? 993;
        $encryption = $credentials['encryption'] ?? 'ssl';

        $mailbox = "{{$host}:{$port}/imap/{$encryption}}INBOX";

        $this->imapStream = imap_open($mailbox, $this->account->email_address, $credentials['password']);

        if (!$this->imapStream) {
            throw new \Exception('Failed to connect to IMAP server: ' . imap_last_error());
        }
    }

    private function disconnect(): void
    {
        if ($this->imapStream) {
            imap_close($this->imapStream);
            $this->imapStream = null;
        }
    }

    public function authenticate(): string
    {
        // IMAP doesn't use OAuth, just returns success for direct connection
        return 'Direct IMAP connection - no OAuth required';
    }

    public function setAccessToken(array $token): void
    {
        // IMAP doesn't use access tokens
        // This method exists for interface compatibility
    }

    public function refreshTokenIfNeeded(): bool
    {
        // IMAP doesn't use tokens
        return true;
    }

    public function fetchEmails(int $limit = 50, ?string $since = null): Collection
    {
        $this->connect();

        try {
            $emails = collect();
            $totalMessages = imap_num_msg($this->imapStream);

            if ($totalMessages === 0) {
                return $emails;
            }

            $start = max(1, $totalMessages - $limit + 1);
            $end = $totalMessages;

            for ($i = $end; $i >= $start; $i--) {
                $email = $this->fetchEmail((string)$i);
                if ($email) {
                    // Check date filter if provided
                    if ($since && strtotime($email->received_at) < strtotime($since)) {
                        continue;
                    }
                    $emails->push($email);
                }
            }

            return $emails;
        } catch (\Exception $e) {
            Log::error('IMAP fetch emails error: ' . $e->getMessage());
            throw $e;
        } finally {
            $this->disconnect();
        }
    }

    public function fetchEmail(string $messageId): ?Email
    {
        $this->connect();

        try {
            $messageNumber = (int)$messageId;
            $header = imap_headerinfo($this->imapStream, $messageNumber);

            if (!$header) {
                return null;
            }

            $structure = imap_fetchstructure($this->imapStream, $messageNumber);
            $body = imap_body($this->imapStream, $messageNumber, FT_PEEK);

            return $this->parseMessage($messageNumber, $header, $structure, $body);
        } catch (\Exception $e) {
            Log::error('IMAP fetch email error: ' . $e->getMessage());
            return null;
        } finally {
            $this->disconnect();
        }
    }

    private function parseMessage(int $messageNumber, $header, $structure, string $body): Email
    {
        $subject = $this->decodeMimeString($header->subject ?? '');
        $from = $this->parseAddress($header->from[0] ?? null);
        $to = $this->parseAddresses($header->to ?? []);
        $cc = $this->parseAddresses($header->cc ?? []);

        $sentAt = date('Y-m-d H:i:s', $header->udate ?? time());
        $receivedAt = date('Y-m-d H:i:s', $header->udate ?? time());

        $bodyText = '';
        $bodyHtml = '';
        $attachments = [];

        $this->parseBody($structure, $body, $bodyText, $bodyHtml, $attachments, $messageNumber);

        return $this->account->emails()->updateOrCreate(
            ['message_id' => (string)$messageNumber],
            [
                'subject' => $subject,
                'body_text' => $bodyText,
                'body_html' => $bodyHtml,
                'from' => $from,
                'to' => $to,
                'cc' => $cc,
                'bcc' => [], // BCC not available in IMAP headers
                'attachments' => $attachments,
                'sent_at' => $sentAt,
                'received_at' => $receivedAt,
                'is_read' => !($header->Unseen ?? false),
                'folder' => 'INBOX',
                'labels' => [], // IMAP doesn't have labels like Gmail
            ]
        );
    }

    private function parseBody($structure, string $body, &$bodyText, &$bodyHtml, &$attachments, int $messageNumber): void
    {
        if (!$structure) {
            $bodyText = $body;
            return;
        }

        if ($structure->type === 0) { // Text message
            if ($structure->subtype === 'PLAIN') {
                $bodyText = $this->decodeBody($body, $structure->encoding ?? 0);
            } elseif ($structure->subtype === 'HTML') {
                $bodyHtml = $this->decodeBody($body, $structure->encoding ?? 0);
            }
        } elseif ($structure->type === 1) { // Multipart message
            $this->parseMultipart($structure, $body, $bodyText, $bodyHtml, $attachments, $messageNumber);
        }

        // Extract attachments
        if (isset($structure->parts)) {
            foreach ($structure->parts as $partNumber => $part) {
                if ($part->ifdisposition && $part->disposition === 'ATTACHMENT') {
                    $attachments[] = [
                        'filename' => $this->decodeMimeString($part->dparameters[0]->value ?? 'attachment'),
                        'mime_type' => $this->getMimeType($part),
                        'size' => $part->bytes ?? 0,
                    ];
                }
            }
        }
    }

    private function parseMultipart($structure, string $body, &$bodyText, &$bodyHtml, &$attachments, int $messageNumber): void
    {
        if (!isset($structure->parts)) {
            return;
        }

        foreach ($structure->parts as $partNumber => $part) {
            $partBody = imap_fetchbody($this->imapStream, $messageNumber, $partNumber + 1);

            if ($part->type === 0) {
                if ($part->subtype === 'PLAIN') {
                    $bodyText .= $this->decodeBody($partBody, $part->encoding ?? 0);
                } elseif ($part->subtype === 'HTML') {
                    $bodyHtml .= $this->decodeBody($partBody, $part->encoding ?? 0);
                }
            } elseif ($part->type === 1) {
                $this->parseMultipart($part, $partBody, $bodyText, $bodyHtml, $attachments, $messageNumber);
            }
        }
    }

    private function decodeBody(string $body, int $encoding): string
    {
        switch ($encoding) {
            case 1: // 8bit
                return $body;
            case 2: // binary
                return $body;
            case 3: // base64
                return base64_decode($body);
            case 4: // quoted-printable
                return quoted_printable_decode($body);
            default:
                return $body;
        }
    }

    private function getMimeType($part): string
    {
        if ($part->type === 3) { // Application
            return 'application/' . strtolower($part->subtype ?? 'octet-stream');
        } elseif ($part->type === 5) { // Image
            return 'image/' . strtolower($part->subtype ?? 'png');
        } elseif ($part->type === 4) { // Audio
            return 'audio/' . strtolower($part->subtype ?? 'mp3');
        } elseif ($part->type === 6) { // Video
            return 'video/' . strtolower($part->subtype ?? 'mp4');
        } else {
            return 'text/' . strtolower($part->subtype ?? 'plain');
        }
    }

    private function decodeMimeString(?string $string): string
    {
        if (!$string) {
            return '';
        }
        return imap_utf8($string);
    }

    private function parseAddress($address): array
    {
        if (!$address) {
            return ['name' => '', 'email' => ''];
        }

        return [
            'name' => $this->decodeMimeString($address->personal ?? ''),
            'email' => $address->mailbox . '@' . $address->host,
        ];
    }

    private function parseAddresses(array $addresses): array
    {
        $result = [];
        foreach ($addresses as $address) {
            $result[] = $this->parseAddress($address);
        }
        return $result;
    }

    public function sendEmail(array $data): bool
    {
        // IMAP is read-only, sending emails requires SMTP
        // For simplicity, we'll implement basic SMTP sending
        $credentials = $this->account->credentials;

        $smtpHost = $credentials['smtp_host'] ?? str_replace('imap.', 'smtp.', $credentials['host']);
        $smtpPort = $credentials['smtp_port'] ?? 587;

        $headers = "From: {$this->account->email_address}\r\n";
        $headers .= "To: {$data['to']}\r\n";
        $headers .= "Subject: {$data['subject']}\r\n";

        if (isset($data['cc'])) {
            $headers .= "Cc: {$data['cc']}\r\n";
        }

        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        return mail($data['to'], $data['subject'], $data['body'], $headers);
    }
}
