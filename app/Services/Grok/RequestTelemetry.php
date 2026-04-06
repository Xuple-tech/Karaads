<?php

namespace App\Services\Grok;

use App\Models\ApiUsageLog;
use Illuminate\Support\Facades\Log;

class RequestTelemetry
{
    public function logApiUsage(array $data): void
    {
        try {
            ApiUsageLog::logUsage($data);
        } catch (\Exception $e) {
            Log::error('Failed to log API usage: ' . $e->getMessage());
        }
    }

    public function estimateTokens(array $messages): int
    {
        $totalTokens = 0;

        foreach ($messages as $message) {
            if (is_string($message)) {
                $totalTokens += (int) ceil(strlen($message) / 4);
                continue;
            }

            if (!is_array($message) || !isset($message['content'])) {
                continue;
            }

            $content = $message['content'];
            if (is_string($content)) {
                $totalTokens += (int) ceil(strlen($content) / 4);
                continue;
            }

            if (!is_array($content)) {
                continue;
            }

            foreach ($content as $item) {
                if (isset($item['text']) && is_string($item['text'])) {
                    $totalTokens += (int) ceil(strlen($item['text']) / 4);
                }
            }
        }

        return max(1, $totalTokens);
    }

    public function sanitizePayloadForLogging(array $payload): array
    {
        $sanitized = $payload;

        if (!isset($sanitized['messages']) || !is_array($sanitized['messages'])) {
            return $sanitized;
        }

        foreach ($sanitized['messages'] as &$message) {
            if (isset($message['content']) && is_string($message['content']) && strlen($message['content']) > 100) {
                $message['content'] = substr($message['content'], 0, 100) . '... [truncated]';
            }

            if (!isset($message['content']) || !is_array($message['content'])) {
                continue;
            }

            foreach ($message['content'] as &$item) {
                if (isset($item['text']) && is_string($item['text']) && strlen($item['text']) > 100) {
                    $item['text'] = substr($item['text'], 0, 100) . '... [truncated]';
                }

                if (isset($item['image_url']['url'])) {
                    $item['image_url']['url'] = '[REDACTED_IMAGE_URL]';
                }
            }
        }

        return $sanitized;
    }
}
