<?php

namespace App\Providers;

use App\Http\Middleware\SecureRouteMiddleware;
use App\Http\Middleware\UuidValidationMiddleware;
use App\Http\Middleware\BotDetection;
use App\Services\SecurityAuditService;
use App\Services\SecureGrokApiService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Routing\Router;

class SecureRoutingServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register security services
        // $this->app->singleton(SecurityAuditService::class);
        // $this->app->singleton(SecureGrokApiService::class);

        // // Merge configuration
        // $this->mergeConfigFrom(
        //     __DIR__ . '/../../config/secure-routing.php',
        //     'secure-routing'
        // );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register middleware
        // $this->registerMiddleware();

        // Register route macros
        // $this->registerRouteMacros();

        // Publish configuration
        // $this->publishes([
        //     __DIR__ . '/../../config/secure-routing.php' => config_path('secure-routing.php'),
        // ], 'secure-routing-config');

        // // Register console commands
        // if ($this->app->runningInConsole()) {
        //     $this->registerCommands();
        // }
    }

    /**
     * Register middleware
     */
    protected function registerMiddleware(): void
    {
        $router = $this->app->make(Router::class);

        // Register middleware aliases
        $router->aliasMiddleware('secure.route', SecureRouteMiddleware::class);
        $router->aliasMiddleware('uuid.validation', UuidValidationMiddleware::class);
        $router->aliasMiddleware('bot.detection', BotDetection::class);

        // Register middleware groups
        $router->middlewareGroup('secure.api', [
            'throttle:60,1',
            'secure.route',
            'uuid.validation',
            'bot.detection',
            'api'
        ]);

        $router->middlewareGroup('secure.web', [
            'web',
            'throttle:120,1',
            'secure.route',
            'uuid.validation',
            'bot.detection'
        ]);

        $router->middlewareGroup('secure.auth', [
            'web',
            'auth',
            'throttle:30,1',
            'secure.route',
            'uuid.validation',
            'bot.detection'
        ]);

        $router->middlewareGroup('secure.admin', [
            'web',
            'auth',
            'admin',
            'throttle:20,1',
            'secure.route',
            'uuid.validation',
            'bot.detection'
        ]);
    }

    /**
     * Register route macros
     */
    protected function registerRouteMacros(): void
    {
        // Secure route macro
        Route::macro('secure', function ($uri, $action) {
            return Route::middleware(['secure.route'])->match(['GET', 'POST'], $uri, $action);
        });

        // UUID route macro
        Route::macro('uuidRoute', function ($uri, $action) {
            return Route::middleware(['uuid.validation'])->get($uri, $action);
        });

        // Admin secure route macro
        Route::macro('adminSecure', function ($uri, $action) {
            return Route::middleware(['secure.admin'])->match(['GET', 'POST', 'PUT', 'DELETE'], $uri, $action);
        });

        // API secure route macro
        Route::macro('apiSecure', function ($uri, $action) {
            return Route::middleware(['secure.api'])->match(['GET', 'POST', 'PUT', 'DELETE'], $uri, $action);
        });
    }

    /**
     * Register console commands
     */
    protected function registerCommands(): void
    {
        $this->commands([
            \App\Console\Commands\GenerateSecureRoutes::class,
            \App\Console\Commands\CleanSecurityAuditLogs::class,
            \App\Console\Commands\SecurityHealthCheck::class,
        ]);
    }
}
