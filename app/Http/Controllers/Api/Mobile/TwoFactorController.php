<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class TwoFactorController extends Controller
{
    public function enable(
        Request $request,
        EnableTwoFactorAuthentication $enable,
        GenerateNewRecoveryCodes $generate
    ) {
        $this->ensureCurrentPassword($request);

        $user = $request->user();
        $enable($user, $request->boolean('force', false));

        $user->refresh();
        if (empty($user->two_factor_recovery_codes)) {
            $generate($user);
            $user->refresh();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'qr_svg' => $user->twoFactorQrCodeSvg(),
                'otp_url' => $user->twoFactorQrCodeUrl(),
                'recovery_codes' => $this->decodeRecoveryCodes($user),
                'requires_confirmation' => Features::optionEnabled(
                    Features::twoFactorAuthentication(),
                    'confirm'
                ),
            ],
        ]);
    }

    public function confirm(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $confirm($request->user(), $validated['code']);

        return response()->json([
            'success' => true,
            'data' => [
                'status' => '2fa-confirmed',
            ],
        ]);
    }

    public function disable(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $this->ensureCurrentPassword($request);

        $disable($request->user());

        return response()->json([
            'success' => true,
            'data' => [
                'status' => '2fa-disabled',
            ],
        ]);
    }

    public function recoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        $this->ensureCurrentPassword($request);

        $user = $request->user();
        if (is_null($user->two_factor_secret) || is_null($user->two_factor_recovery_codes)) {
            throw ValidationException::withMessages([
                'two_factor' => ['Two-factor authentication is not enabled.'],
            ]);
        }

        if ($request->boolean('regenerate', false)) {
            $generate($user);
            $user->refresh();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'recovery_codes' => $this->decodeRecoveryCodes($user),
            ],
        ]);
    }

    private function ensureCurrentPassword(Request $request): void
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
        ]);

        $user = $request->user();
        if (! $user || ! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }
    }

    private function decodeRecoveryCodes($user): array
    {
        if (empty($user->two_factor_recovery_codes)) {
            return [];
        }

        $codes = Fortify::currentEncrypter()->decrypt($user->two_factor_recovery_codes);
        $decoded = json_decode($codes, true);

        return is_array($decoded) ? $decoded : [];
    }
}
