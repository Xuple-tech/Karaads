<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserEmailVerificationCode;
use App\Notifications\EmailVerificationCodeNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Database\Schema\Blueprint;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationOtpController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('auth/email-verification-otp', [
            'email' => $request->user()?->email ?? '',
            'status' => $request->session()->get('status'),
        ]);
    }

    public function sendCode(Request $request)
    {
        $this->ensureVerificationTableExists();

        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        if (! $user || ! $user->email || strtolower($validated['email']) !== strtolower($user->email)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'email' => ['Please use your signed-in account email.'],
                ],
            ], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'status' => 'already-verified',
            ]);
        }

        $this->issueCode($user);

        return response()->json([
            'success' => true,
            'status' => 'verification-code-sent',
        ]);
    }

    public function verifyCode(Request $request)
    {
        $this->ensureVerificationTableExists();

        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:8'],
        ]);

        if (! $user || ! $user->email || strtolower($validated['email']) !== strtolower($user->email)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'email' => ['Please use your signed-in account email.'],
                ],
            ], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => true,
                'status' => 'already-verified',
                'redirect' => '/app',
            ]);
        }

        $verification = UserEmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->latest('created_at')
            ->first();

        if (! $verification || $verification->isExpired()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'code' => ['Code expired or missing. Request a new code.'],
                ],
            ], 422);
        }

        $inputCode = strtoupper(trim($validated['code']));
        if (! Hash::check($inputCode, $verification->code_hash)) {
            $verification->increment('attempts');

            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'code' => ['Invalid verification code.'],
                ],
            ], 422);
        }

        $verification->forceFill([
            'consumed_at' => now(),
        ])->save();

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        event(new Verified($user));

        UserEmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $redirect = $user->hasCompletedOnboarding() ? '/profile' : '/onboarding';

        return response()->json([
            'success' => true,
            'status' => 'email-verified',
            'redirect' => $redirect,
        ]);
    }

    private function issueCode(User $user): void
    {
        $this->ensureVerificationTableExists();

        UserEmailVerificationCode::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = Str::upper(Str::random(8));

        UserEmailVerificationCode::create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
        ]);

        $user->notify(new EmailVerificationCodeNotification($code));
    }

    private function ensureVerificationTableExists(): void
    {
        if (Schema::hasTable('user_email_verification_codes')) {
            return;
        }

        Schema::create('user_email_verification_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('code_hash');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }
}
