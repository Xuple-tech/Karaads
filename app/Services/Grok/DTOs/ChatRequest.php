<?php

namespace App\Services\Grok\DTOs;

class ChatRequest
{
    public function __construct(
        public string $prompt,
        public string $model = 'grok-4',
        public array $history = [],
        public array $tools = [],
        public ?array $format = null,
        public bool $autoTools = true,
        public array $files = [],
        public ?string $customSystemPrompt = null,
        public ?bool $callByName = false,
        public ?string $userName = null,
        public ?string $chatId = null
    ) {}
}