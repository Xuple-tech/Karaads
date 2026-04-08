<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\AuthenticateConsole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetConsoleSessionConfig;
use App\Http\Middleware\UseConsoleGuard;
use App\Support\AuthRedirect;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware) {
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            return AuthRedirect::sanitize($request->query('redirect'))
                ?? AuthRedirect::sanitize($request->input('redirect'))
                ?? route('home');
        });

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->group('console-web', [
            SetConsoleSessionConfig::class,
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            UseConsoleGuard::class,
            ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            SubstituteBindings::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'auth.console' => AuthenticateConsole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
