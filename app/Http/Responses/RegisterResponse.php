<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request)
    {
        $email = $request->user()?->email ?? $request->input('email');
        $query = array_filter([
            'autoSendCode' => '1',
            'email' => is_string($email) ? $email : null,
        ]);

        $redirect = '/auth/verify-email/otp?' . http_build_query($query);

        if ($request->wantsJson()) {
            return response()->json([
                'redirect' => $redirect,
            ]);
        }

        return redirect()->to($redirect);
    }
}
