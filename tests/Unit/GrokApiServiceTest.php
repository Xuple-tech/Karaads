<?php

namespace Tests\Unit;

use App\Services\Grok\ChatTransportService;
use App\Services\Grok\LanguageDetector;
use App\Services\Grok\MessageFormatter;
use App\Services\Grok\NonStreamingProcessor;
use App\Services\Grok\RequestTelemetry;
use App\Services\Grok\StreamingProcessor;
use App\Services\Grok\ToolRegistry;
use App\Services\Grok\AssetWorkflowService;
use App\Services\GrokApiService;
use GuzzleHttp\Client;
use Tests\TestCase;

class GrokApiServiceTest extends TestCase
{
    public function test_powerpoint_logo_upload_is_kept_for_tools_but_not_sent_as_vision_input(): void
    {
        config()->set('services.grok.api_key', 'test-key');

        $transport = new class extends ChatTransportService
        {
            public array $capturedMessages = [];
            public array $capturedFiles = [];
            public string $capturedModel = '';

            public function __construct()
            {
                parent::__construct(
                    new RequestTelemetry(),
                    \Mockery::mock(StreamingProcessor::class),
                    \Mockery::mock(NonStreamingProcessor::class),
                );
            }

            public function generateStreamingChat(
                Client $client,
                string $apiEndpoint,
                string $apiKey,
                array $supportedModels,
                array $tools,
                string $prompt,
                array $messages,
                callable $callback,
                string $model = 'grok-4',
                ?array $format = null,
                array $files = [],
                ?string $chatId = null,
                ?string $detectedLanguage = null,
            ): void {
                $this->capturedMessages = $messages;
                $this->capturedFiles = $files;
                $this->capturedModel = $model;

                $callback(['done' => true]);
            }
        };

        $languageDetector = new LanguageDetector();
        $service = new GrokApiService(
            $this->createMock(AssetWorkflowService::class),
            $transport,
            $languageDetector,
            new MessageFormatter($languageDetector),
            new ToolRegistry(),
        );

        $logo = [
            'name' => 'logo.png',
            'type' => 'image/png',
            'data' => 'data:image/png;base64,'.base64_encode('not-a-real-image'),
        ];

        $service->generateStreamingChat(
            prompt: 'add this logo to the powerpoint',
            callback: fn () => null,
            model: 'grok-4-fast-non-reasoning',
            files: [$logo],
        );

        $serializedMessages = json_encode($transport->capturedMessages, JSON_UNESCAPED_SLASHES);

        $this->assertStringNotContainsString('image_url', $serializedMessages);
        $this->assertStringContainsString('add this logo to the powerpoint', $serializedMessages);
        $this->assertSame([$logo], $transport->capturedFiles);
        $this->assertSame('grok-4-fast-non-reasoning', $transport->capturedModel);
    }

    public function test_follow_up_logo_upload_uses_powerpoint_history_even_when_prompt_does_not_say_powerpoint(): void
    {
        config()->set('services.grok.api_key', 'test-key');

        $transport = new class extends ChatTransportService
        {
            public array $capturedMessages = [];
            public array $capturedFiles = [];
            public string $capturedModel = '';

            public function __construct()
            {
                parent::__construct(
                    new RequestTelemetry(),
                    \Mockery::mock(StreamingProcessor::class),
                    \Mockery::mock(NonStreamingProcessor::class),
                );
            }

            public function generateStreamingChat(
                Client $client,
                string $apiEndpoint,
                string $apiKey,
                array $supportedModels,
                array $tools,
                string $prompt,
                array $messages,
                callable $callback,
                string $model = 'grok-4',
                ?array $format = null,
                array $files = [],
                ?string $chatId = null,
                ?string $detectedLanguage = null,
            ): void {
                $this->capturedMessages = $messages;
                $this->capturedFiles = $files;
                $this->capturedModel = $model;

                $callback(['done' => true]);
            }
        };

        $languageDetector = new LanguageDetector();
        $service = new GrokApiService(
            $this->createMock(AssetWorkflowService::class),
            $transport,
            $languageDetector,
            new MessageFormatter($languageDetector),
            new ToolRegistry(),
        );

        $logo = [
            'name' => 'logo.png',
            'type' => 'image/png',
            'data' => 'data:image/png;base64,'.base64_encode('not-a-real-image'),
        ];

        $service->generateStreamingChat(
            prompt: 'this the logo add it up',
            callback: fn () => null,
            model: 'grok-4-fast-non-reasoning',
            history: [[
                'role' => 'assistant',
                'content' => 'Previous PowerPoint generation context: {"tool":"generate_powerpoint_presentation","arguments":{"title":"Business Plan","content":"# Slide 1"}}',
            ]],
            files: [$logo],
        );

        $serializedMessages = json_encode($transport->capturedMessages, JSON_UNESCAPED_SLASHES);

        $this->assertStringNotContainsString('image_url', $serializedMessages);
        $this->assertStringContainsString('this the logo add it up', $serializedMessages);
        $this->assertStringContainsString('Previous PowerPoint generation context', $serializedMessages);
        $this->assertSame([$logo], $transport->capturedFiles);
        $this->assertSame('grok-4-fast-non-reasoning', $transport->capturedModel);
    }
}
