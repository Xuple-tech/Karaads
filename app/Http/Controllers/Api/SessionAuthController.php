<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class SessionAuthController extends Controller
{
    public function session(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'authenticated' => Auth::check(),
            'user' => $request->user(),
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $request->user(),
            'redirect_to' => $request->user()?->is_admin ? '/admin' : '/app',
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
        Auth::login($user, true);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'user' => $user,
            'redirect_to' => '/app',
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

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

    public function verifyEmail(EmailVerificationRequest $request)
    {
        if (! $request->user()->hasVerifiedEmail()) {
            $request->fulfill();
        }

        return redirect('/app?verified=1');
    }

    public function confirmPassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->string('password'),
        ])) {
            throw ValidationException::withMessages([
                'password' => [__('auth.password')],
            ]);
        }

        $request->session()->put('auth.password_confirmed_at', time());

        return response()->json([
            'success' => true,
        ]);
    }
}
