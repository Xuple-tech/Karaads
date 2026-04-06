<?php

namespace Tests\Unit\Grok;

use App\Services\Grok\ChatTransportService;
use App\Services\Grok\NonStreamingProcessor;
use App\Services\Grok\RequestTelemetry;
use App\Services\Grok\StreamingProcessor;
use GuzzleHttp\Client;
use PHPUnit\Framework\TestCase;

class ChatTransportServiceTest extends TestCase
{
    public function test_it_rejects_invalid_model_for_content_generation(): void
    {
        $service = new ChatTransportService(
            $this->createMock(RequestTelemetry::class),
            $this->createMock(StreamingProcessor::class),
            $this->createMock(NonStreamingProcessor::class),
        );

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid Grok model: invalid-model');

        $service->generateContent(
            client: $this->createMock(Client::class),
            apiEndpoint: 'https://example.test/chat',
            apiKey: 'test-key',
            supportedModels: ['grok-4' => ['name' => 'Grok 4']],
            prompt: 'hello',
            language: 'plaintext',
            model: 'invalid-model',
        );
    }
}
