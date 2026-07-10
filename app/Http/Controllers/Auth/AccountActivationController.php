<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivationCode;
use App\Notifications\ImportedAccountActivationCodeNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AccountActivationController extends Controller
{
    private const MAIL_RATE_LIMIT_CACHE_KEY = 'mail:smtp-rate-limited:activation';

    public function show(Request $request): Response
    {
        return Inertia::render('auth/account-activation', [
            'email' => '',
            'status' => $request->session()->get('status'),
        ]);
    }

    public function sendCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = $this->normalizeEmail($validated['email']);
        $user = User::query()
            ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
            ->first();
        if (! $user || ! $user->must_set_password) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'email' => ['No imported account setup is pending for this email.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'email' => 'No imported account setup is pending for this email.',
            ]);
        }

        try {
            $this->issueActivationCode($user);
        } catch (Throwable $exception) {
            Log::warning('Imported account activation code delivery failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'message' => $exception->getMessage(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'We could not send the activation code right now. Please try again.',
                ], 503);
            }

            return back()->withErrors([
                'email' => 'We could not send the activation code right now. Please try again.',
            ]);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'status' => 'activation-code-sent',
            ]);
        }

        return back()->with('status', 'activation-code-sent');
    }

    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:8'],
        ]);

        $email = $this->normalizeEmail($validated['email']);
        $user = User::query()
            ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
            ->first();
        if (! $user || ! $user->must_set_password) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'email' => ['No imported account setup is pending for this email.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'email' => 'No imported account setup is pending for this email.',
            ]);
        }

        $activation = UserActivationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('created_at')
            ->first();

        if (! $activation || $activation->isExpired()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'code' => ['Code expired or missing. Request a new code.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'code' => 'Code expired or missing. Request a new code.',
            ]);
        }

        $inputCode = strtoupper(trim($validated['code']));
        if (! Hash::check($inputCode, $activation->code_hash)) {
            $activation->increment('attempts');

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'code' => ['Invalid activation code.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'code' => 'Invalid activation code.',
            ]);
        }

        $activation->forceFill([
            'consumed_at' => now(),
        ])->save();

        $request->session()->put('activation_verified_user_id', $user->id);
        $request->session()->put('activation_verified_email', $user->email);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'status' => 'activation-code-verified',
            ]);
        }

        return back()->with('status', 'activation-code-verified');
    }

    public function setPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $verifiedUserId = $request->session()->get('activation_verified_user_id');
        $verifiedEmail = $request->session()->get('activation_verified_email');
        $email = $this->normalizeEmail($validated['email']);

        if (! $verifiedUserId || ! $verifiedEmail || $this->normalizeEmail($verifiedEmail) !== $email) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'email' => ['Verify your activation code before setting password.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'email' => 'Verify your activation code before setting password.',
            ]);
        }

        $user = User::query()
            ->where('id', $verifiedUserId)
            ->whereRaw('LOWER(TRIM(email)) = ?', [$email])
            ->first();
        if (! $user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'email' => ['Activation session is invalid. Restart setup.'],
                    ],
                ], 422);
            }

            return back()->withErrors([
                'email' => 'Activation session is invalid. Restart setup.',
            ]);
        }

        $user->forceFill([
            'password' => $validated['password'],
            'must_set_password' => false,
            'email_verified_at' => now(),
        ])->save();
        event(new Verified($user));

        UserActivationCode::where('user_id', $user->id)->whereNull('consumed_at')->update([
            'consumed_at' => now(),
        ]);

        $request->session()->forget([
            'activation_verified_user_id',
            'activation_verified_email',
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => '/login',
            ]);
        }

        return redirect()->route('login')->with('status', 'password-reset');
    }

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    public function issueActivationCode(User $user): void
    {
        UserActivationCode::where('user_id', $user->id)->whereNull('consumed_at')->update([
            'consumed_at' => now(),
        ]);

        $code = Str::upper(Str::random(8));

        UserActivationCode::create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
        ]);

        $user->notify(new ImportedAccountActivationCodeNotification($code));
    }
}
