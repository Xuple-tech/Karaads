<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Auth\AccountActivationController;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ReferralRewardService;
use App\Support\UserPresence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly ReferralRewardService $referralRewardService,
        private readonly UserPresence $userPresence,
    ) {}

    /**
     * Login user and return API token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user && $user->must_set_password) {
            if (! empty($user->email)) {
                try {
                    app(AccountActivationController::class)->issueActivationCode($user);
                } catch (Throwable $exception) {
                    \Log::warning('Mobile login activation code delivery failed', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                        'message' => $exception->getMessage(),
                    ]);

                    return response()->json([
                        'success' => false,
                        'error' => [
                            'code' => 'ACCOUNT_SETUP_REQUIRED',
                            'message' => 'Account setup is required, but the activation code could not be sent right now. Please try again.',
                            'details' => [
                                'requires_email_verification' => true,
                                'requires_password_setup' => true,
                                'next_actions' => ['verify_email_code', 'set_password'],
                                'activation_email_failed' => true,
                            ],
                        ],
                    ], 503);
                }
            }

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => 'ACCOUNT_SETUP_REQUIRED',
                    'message' => 'Account setup required. Use the 8-character code sent to your email, then set your password.',
                    'details' => [
                        'requires_email_verification' => true,
                        'requires_password_setup' => true,
                        'next_actions' => ['verify_email_code', 'set_password'],
                    ],
                ],
            ], 403);
        }

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if 2FA is enabled
        if ($user->two_factor_secret && !$request->has('two_factor_code')) {
            return response()->json([
                'success' => false,
                'requires_2fa' => true,
                'message' => 'Two-factor authentication required',
            ], 403);
        }

        // Verify 2FA code if provided
        if ($user->two_factor_secret && $request->has('two_factor_code')) {
            $this->verify2FACode($user, $request->input('two_factor_code'));
        }

        // Create API token
        $token = $user->createToken('mobile-app-' . now()->timestamp)->plainTextToken;
        $this->userPresence->markOnline($user);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Register a new user and return API token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
        ]);

        $this->referralRewardService->createPendingReferralForUser($user, $validated['referral_code'] ?? null);

        $token = $user->createToken('mobile-app-' . now()->timestamp)->plainTextToken;
        $this->userPresence->markOnline($user);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Logout and revoke token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $this->userPresence->markOffline($request->user());
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out',
        ], 200);
    }

    /**
     * Get current authenticated user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->loadCount(['followers', 'following']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ], 200);
    }

    /**
     * Verify 2FA code and return token
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ValidationException
     */
    public function verify2FA(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'two_factor_code' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        $this->verify2FACode($user, $validated['two_factor_code']);

        $token = $user->createToken('mobile-app-' . now()->timestamp)->plainTextToken;
        $this->userPresence->markOnline($user);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Verify a 2FA code using Laravel Fortify's 2FA logic
     *
     * @param User $user
     * @param string $code
     * @throws ValidationException
     */
    private function verify2FACode(User $user, string $code): void
    {
        if (!$user->two_factor_secret) {
            throw ValidationException::withMessages([
                'two_factor_code' => ['Two-factor authentication is not enabled.'],
            ]);
        }

        $totp = app('pragmarx.google2fa');
        $window = 1; // Allow ±1 time window for clock drift

        $verified = false;
        for ($i = -$window; $i <= $window; $i++) {
            $timestamp = now()->addMinutes($i * 1)->unix();
            if ($totp->verifyKeyTimestamp($code, $user->two_factor_secret, $i)) {
                $verified = true;
                break;
            }
        }

        if (!$verified && $user->two_factor_recovery_codes) {
            $recoveryCodes = json_decode($user->two_factor_recovery_codes, true);
            $key = array_search($code, $recoveryCodes);

            if ($key !== false) {
                unset($recoveryCodes[$key]);
                $user->update([
                    'two_factor_recovery_codes' => json_encode(array_values($recoveryCodes)),
                ]);
                $verified = true;
            }
        }

        if (!$verified) {
            throw ValidationException::withMessages([
                'two_factor_code' => ['The two-factor code is invalid.'],
            ]);
        }
    }
}
