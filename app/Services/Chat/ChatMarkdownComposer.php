<?php

namespace App\Services\Chat;

use App\Models\ChatMessage;
use Illuminate\Support\Str;

class ChatMarkdownComposer
{
    public function normalize(string $markdown): string
    {
        $markdown = str_replace(["\r\n", "\r"], "\n", $markdown);
        $markdown = preg_replace('/([^\n#])(#{1,6}\s)/', "$1\n\n$2", $markdown) ?? $markdown;
        $markdown = preg_replace('/([^\n])(\n\|)/', "$1\n\n$2", $markdown) ?? $markdown;
        $markdown = preg_replace('/([^\n])(\n[-*+]\s)/', "$1\n\n$2", $markdown) ?? $markdown;
        $markdown = preg_replace('/([^\n])(\n\d+\.\s)/', "$1\n\n$2", $markdown) ?? $markdown;
        $markdown = preg_replace("/\n{3,}/", "\n\n", $markdown) ?? $markdown;

        return trim($markdown);
    }

    public function toPlainText(string $markdown): string
    {
        $text = preg_replace('/```[\s\S]*?```/', '', $markdown) ?? $markdown;
        $text = preg_replace('/`([^`]+)`/', '$1', $text) ?? $text;
        $text = preg_replace('/!\[[^\]]*\]\([^)]+\)/', '', $text) ?? $text;
        $text = preg_replace('/\[[^\]]+\]\(([^)]+)\)/', '$1', $text) ?? $text;
        $text = preg_replace('/[#>*_\-|]/', ' ', $text) ?? $text;
        $text = preg_replace('/\s+/', ' ', $text) ?? $text;

        return trim($text);
    }

    public function composeFinalMarkdown(string $body, array $toolBlocks = [], array $sourceBlocks = [], array $attachmentBlocks = []): string
    {
        $segments = array_values(array_filter([
            $this->normalize($body),
            ...$toolBlocks,
            ...$sourceBlocks,
            ...$attachmentBlocks,
        ]));

        return implode("\n\n", $segments);
    }

    public function toolBlock(array $payload): string
    {
        return "```kwati-tool\n" . json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n```";
    }

    public function sourcesBlock(array $payload): string
    {
        return "```kwati-sources\n" . json_encode(array_values($payload), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n```";
    }

    public function attachmentsBlock(array $payload): string
    {
        return "```kwati-attachments\n" . json_encode(array_values($payload), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n```";
    }

    public function buildFromMessage(ChatMessage $message): string
    {
        $toolBlocks = $message->toolRuns->map(function ($toolRun) {
            return $this->toolBlock([
                'name' => $toolRun->tool_name,
                'status' => $toolRun->status,
                'title' => Str::headline($toolRun->tool_name),
                'summary' => $toolRun->summary,
                'error' => $toolRun->error_message,
            ]);
        })->all();

        $sourcePayload = $message->sources->map(fn ($source) => [
            'title' => $source->title,
            'url' => $source->url,
            'snippet' => $source->snippet,
        ])->filter(fn ($source) => $source['title'] || $source['url'])->values()->all();

        $attachmentPayload = $message->attachments->map(fn ($attachment) => [
            'id' => $attachment->id,
            'kind' => $attachment->kind,
            'url' => $attachment->url,
            'name' => $attachment->name,
            'mime_type' => $attachment->mime_type,
            'size' => $attachment->size,
        ])->values()->all();

        return $this->composeFinalMarkdown(
            $message->content_markdown ?? '',
            $toolBlocks,
            $sourcePayload ? [$this->sourcesBlock($sourcePayload)] : [],
            $attachmentPayload ? [$this->attachmentsBlock($attachmentPayload)] : [],
        );
    }
}
