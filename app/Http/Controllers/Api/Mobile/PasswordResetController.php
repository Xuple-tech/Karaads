<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\ResetsUserPasswords;
use Throwable;

class PasswordResetController extends Controller
{
    private const MAIL_RATE_LIMIT_CACHE_KEY = 'mail:smtp-rate-limited:password-reset';

    public function forgot(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $validated['email'];
        if (config('fortify.lowercase_usernames')) {
            $email = Str::lower($email);
        }

        if (Cache::has(self::MAIL_RATE_LIMIT_CACHE_KEY)) {
            throw ValidationException::withMessages([
                'email' => ['Email sending is temporarily busy. Please wait a few minutes and try again.'],
            ]);
        }

        try {
            $status = Password::broker(config('fortify.passwords'))
                ->sendResetLink(['email' => $email]);
        } catch (Throwable $exception) {
            Log::warning('Mobile password reset email delivery failed', [
                'email' => $email,
                'message' => $exception->getMessage(),
            ]);

            $message = strtolower($exception->getMessage());
            if (
                str_contains($message, 'ratelimit')
                || str_contains($message, 'timeout')
                || str_contains($message, 'too many')
                || str_contains($message, '421')
                || str_contains($message, '451')
                || str_contains($message, 'smtp')
            ) {
                Cache::put(self::MAIL_RATE_LIMIT_CACHE_KEY, true, now()->addMinutes(30));
            }

            throw ValidationException::withMessages([
                'email' => ['Email sending is temporarily busy. Please wait a few minutes and try again.'],
            ]);
        }

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'reset-link-sent',
            ],
        ]);
    }

    public function reset(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'password_confirmation' => ['required', 'string'],
        ]);

        $email = $validated['email'];
        if (config('fortify.lowercase_usernames')) {
            $email = Str::lower($email);
        }

        $status = Password::broker(config('fortify.passwords'))->reset(
            [
                'email' => $email,
                'token' => $validated['token'],
                'password' => $validated['password'],
                'password_confirmation' => $validated['password_confirmation'],
            ],
            function ($user, $password) {
                app(ResetsUserPasswords::class)->reset($user, [
                    'password' => $password,
                ]);

                $user->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'password-reset',
            ],
        ]);
    }
}
