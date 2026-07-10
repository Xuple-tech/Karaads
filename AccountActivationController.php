<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Auth\AccountActivationController as WebAccountActivationController;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AccountActivationController extends Controller
{
    private const TOKEN_TTL_MINUTES = 15;
    public function sendCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (! $user || ! $user->must_set_password) {
            throw ValidationException::withMessages([
                'email' => ['No imported account setup is pending for this email.'],
            ]);
        }

        app(WebAccountActivationController::class)->issueActivationCode($user);

        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'activation-code-sent',
            ],
        ]);
    }

    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:8'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (! $user || ! $user->must_set_password) {
            throw ValidationException::withMessages([
                'email' => ['No imported account setup is pending for this email.'],
            ]);
        }

        $activation = UserActivationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('created_at')
            ->first();

        if (! $activation || $activation->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['Code expired or missing. Request a new code.'],
            ]);
        }

        $inputCode = strtoupper(trim($validated['code']));
        if (! Hash::check($inputCode, $activation->code_hash)) {
            $activation->increment('attempts');

            throw ValidationException::withMessages([
                'code' => ['Invalid activation code.'],
            ]);
        }

        $activation->forceFill([
            'consumed_at' => now(),
        ])->save();

        $token = Str::random(64);
        Cache::put($this->tokenCacheKey($token), [
            'user_id' => $user->id,
            'email' => $user->email,
        ], now()->addMinutes(self::TOKEN_TTL_MINUTES));

        return response()->json([
            'success' => true,
            'data' => [
                'activation_token' => $token,
                'expires_in' => self::TOKEN_TTL_MINUTES * 60,
            ],
        ]);
    }

    public function setPassword(Request $request)
    {
        $validated = $request->validate([
            'activation_token' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $payload = Cache::get($this->tokenCacheKey($validated['activation_token']));
        if (! $payload || ! isset($payload['user_id'])) {
            throw ValidationException::withMessages([
                'activation_token' => ['Activation token is invalid or expired.'],
            ]);
        }

        $userQuery = User::where('id', $payload['user_id']);
        if (isset($payload['email'])) {
            $userQuery->where('email', $payload['email']);
        }
        $user = $userQuery->first();

        if (! $user || ! $user->must_set_password) {
            throw ValidationException::withMessages([
                'activation_token' => ['Activation session is invalid. Restart setup.'],
            ]);
        }

        $user->forceFill([
            'password' => $validated['password'],
            'must_set_password' => false,
            'email_verified_at' => now(),
        ])->save();

        UserActivationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        Cache::forget($this->tokenCacheKey($validated['activation_token']));

        return response()->json([
            'success' => true,
            'data' => [
                'status' => 'password-set',
                'next_action' => 'login',
            ],
        ]);
    }

    private function tokenCacheKey(string $token): string
    {
        return 'activation_token:' . $token;
    }
}
