<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ExpireStaleCookies;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EnsureAdminPermission;
use App\Http\Middleware\EnsureOnboardingCompleted;
use App\Http\Middleware\TrackUserPresence;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__ . '/../routes/channels.php',
        ['middleware' => ['web', 'auth:sanctum']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.auth' => AdminMiddleware::class,
            'admin.can' => EnsureAdminPermission::class,
            'onboarding.completed' => EnsureOnboardingCompleted::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Exclude broadcasting auth from CSRF verification
        $middleware->validateCsrfTokens(except: ['broadcasting/auth']);

        $middleware->web(append: [
            ExpireStaleCookies::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            TrackUserPresence::class,
        ]);

        $middleware->api(append: [
            TrackUserPresence::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isV12Request = static function (Request $request): bool {
            return str_starts_with($request->path(), 'api/open-labs/oyibo/v1.2')
                || str_starts_with($request->path(), 'api/v3');
        };

        $exceptions->render(function (ValidationException $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'The given data was invalid.',
                    'details' => $e->errors(),
                ],
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'UNAUTHENTICATED',
                    'message' => 'Authentication is required for this endpoint.',
                ],
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'FORBIDDEN',
                    'message' => $e->getMessage() ?: 'You are not allowed to perform this action.',
                ],
            ], 403);
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'NOT_FOUND',
                    'message' => 'Requested resource was not found.',
                ],
            ], 404);
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'RATE_LIMITED',
                    'message' => 'Too many requests. Please retry later.',
                ],
            ], 429);
        });

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) use ($isV12Request) {
            if (!$isV12Request($request)) {
                return null;
            }

            $status = $e->getStatusCode();
            $codeByStatus = [
                401 => 'UNAUTHENTICATED',
                403 => 'FORBIDDEN',
                404 => 'NOT_FOUND',
                409 => 'CONFLICT',
                422 => 'VALIDATION_ERROR',
                429 => 'RATE_LIMITED',
            ];
            $errorCode = $codeByStatus[$status] ?? 'HTTP_ERROR';
            $defaultMessageByStatus = [
                401 => 'Authentication is required for this endpoint.',
                403 => 'You are not allowed to perform this action.',
                404 => 'Requested resource was not found.',
                409 => 'There is a conflict with the current state of the resource.',
                422 => 'The request could not be processed.',
                429 => 'Too many requests. Please retry later.',
            ];

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $errorCode,
                    'message' => $e->getMessage() !== '' ? $e->getMessage() : ($defaultMessageByStatus[$status] ?? 'Request failed.'),
                ],
            ], $status);
        });
    })->create();
