<?php

namespace App\Services\Grok\DTOs;

class DocumentGenerationRequest
{
    public function __construct(
        public string $title,
        public string $content,
        public string $documentType = 'general',
        public string $format = 'pdf',
        public array $options = [],
        public ?int $chatId = null
    ) {}
}