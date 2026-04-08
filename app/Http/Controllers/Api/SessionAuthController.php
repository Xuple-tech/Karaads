<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class SessionAuthController extends Controller
{
    private const SPA_TOKEN_NAMES = ['spa', 'spa:v1'];

    public function session(Request $request): JsonResponse
    {
        $user = $this->resolveTokenUser($request);

        return response()->json([
            'success' => true,
            'authenticated' => (bool) $user,
            'user' => $user,
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->ensureIsNotRateLimited();

        $user = User::query()->where('email', $request->string('email')->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            \Illuminate\Support\Facades\RateLimiter::hit($request->throttleKey());

            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        \Illuminate\Support\Facades\RateLimiter::clear($request->throttleKey());

        $user->tokens()->whereIn('name', self::SPA_TOKEN_NAMES)->delete();
        $token = $user->createToken('spa:v1')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'redirect_to' => $user->is_admin ? '/admin' : '/app',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        event(new Registered($user));
        $user->tokens()->whereIn('name', self::SPA_TOKEN_NAMES)->delete();
        $token = $user->createToken('spa:v1')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'redirect_to' => '/app',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'success' => true,
            'message' => __('A reset link will be sent if the account exists.'),
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->string('password')),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => __($status),
        ]);
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'success' => true,
            'message' => __('Verification link sent.'),
        ]);
    }

    public function verifyEmail(Request $request, string $id, string $hash)
    {
        abort_unless($request->hasValidSignature(), 403);

        $user = User::findOrFail($id);
        abort_unless(hash_equals((string) $hash, sha1($user->getEmailForVerification())), 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return redirect('/app?verified=1');
    }

    public function confirmPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Hash::check($request->string('password')->toString(), (string) $request->user()?->password)) {
            throw ValidationException::withMessages([
                'password' => [__('auth.password')],
            ]);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    private function resolveTokenUser(Request $request): ?User
    {
        $token = $request->bearerToken();

        if (! $token) {
            Log::info('SPA auth check failed: missing bearer token', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);

        if (! $accessToken) {
            Log::warning('SPA auth check failed: invalid bearer token', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);
            return null;
        }

        $tokenable = $accessToken->tokenable;

        if (! $tokenable instanceof User) {
            Log::warning('SPA auth check failed: token does not belong to a user', [
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);
            return null;
        }

        return $tokenable;
    }
}
