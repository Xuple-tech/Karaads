<?php

namespace App\Services\Grok\DTOs;

class ImageGenerationRequest
{
    public function __construct(
        public string $prompt,
        public int $n = 1,
        public string $model = 'sd3.5',
        public string $size = '1024x1024',
        public ?string $directory = null,
        public ?int $chatId = null
    ) {}
}