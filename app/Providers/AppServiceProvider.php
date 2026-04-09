<?php

namespace App\Providers;

use App\Contracts\ChatProvider;
use App\Services\Chat\GrokChatProvider;
use App\Services\Grok\AssetWorkflowService;
use App\Services\Grok\ChatTransportService;
use App\Services\Grok\LanguageDetector;
use App\Services\Grok\MessageFormatter;
use App\Services\Grok\NonStreamingProcessor;
use App\Services\Grok\RequestTelemetry;
use App\Services\Grok\StreamingProcessor;
use App\Services\Grok\ToolExecutor;
use App\Services\Grok\ToolRegistry;
use App\Services\GrokApiService;
use App\Services\OpenAISpeechToTextService;
use App\Services\OpenAITextToSpeechService;
use App\Services\PodcastGenerationService;
use App\Services\VoiceConversationService;
use App\Services\Widget\WidgetToolExecutionContext;
use App\Listeners\CreateTrialSubscription;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ChatProvider::class, GrokChatProvider::class);

        $this->app->singleton(LanguageDetector::class);
        $this->app->singleton(MessageFormatter::class);
        $this->app->singleton(RequestTelemetry::class);
        $this->app->singleton(ToolRegistry::class);
        $this->app->singleton(WidgetToolExecutionContext::class);
        $this->app->singleton(AssetWorkflowService::class);
        $this->app->singleton(ToolExecutor::class);
        $this->app->singleton(StreamingProcessor::class);
        $this->app->singleton(NonStreamingProcessor::class);
        $this->app->singleton(ChatTransportService::class);

        $this->app->singleton(PodcastGenerationService::class, function ($app) {
            return new PodcastGenerationService(
                $app->make(GrokApiService::class),
                $app->make(OpenAITextToSpeechService::class),
                $app->make(OpenAISpeechToTextService::class)
            );
        });
        $this->app->singleton(OpenAISpeechToTextService::class, function ($app) {
            return new OpenAISpeechToTextService();
        });

        $this->app->singleton(OpenAITextToSpeechService::class, function ($app) {
            return new OpenAITextToSpeechService();
        });

        $this->app->singleton(VoiceConversationService::class, function ($app) {
            return new VoiceConversationService(
                $app->make(OpenAISpeechToTextService::class),
                $app->make(OpenAITextToSpeechService::class),
                $app->make(\App\Services\GrokApiService::class)
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Event::listen(
            Registered::class,
            CreateTrialSubscription::class
        );
    }
}
