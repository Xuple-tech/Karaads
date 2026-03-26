<?php

namespace App\Providers;

use App\Console\Commands\ManageOpenRouterApiKeys;
use App\Services\OpenRouter;
use Illuminate\Support\ServiceProvider;

class OpenRouterServiceProvider extends ServiceProvider
{
    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = true;

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return [OpenRouter::class];
    }

    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(OpenRouter::class, function ($app) {
            return new OpenRouter();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                ManageOpenRouterApiKeys::class,
            ]);
        }
    }
}
