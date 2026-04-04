<?php

namespace App\Contracts;

interface ChatProvider
{
    public function streamResponse(
        array $messages,
        array $tools,
        array $options,
        callable $onEvent
    ): void;

    public function generateResponse(array $messages, array $tools, array $options): array;

    public function generateTitle(string $prompt): string;
}
