<?php

namespace App\Http\Controllers;

use App\Models\User;
use Google\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect(): mixed
    {
        $client = $this->getGoogleClient();
        $client->addScope('email');
        $client->addScope('profile');

        return redirect()->away($client->createAuthUrl());
    }

    public function callback(Request $request): mixed
    {
        $code = $request->query('code');

        if (! $code) {
            return redirect()->route('login')->withErrors(['message' => 'Authorization failed']);
        }

        try {
            $client = $this->getGoogleClient();
            $token = $client->fetchAccessTokenWithAuthCode($code);
            $client->setAccessToken($token);

            $service = new \Google\Service\Oauth2($client);
            $googleUser = $service->userinfo->get();

            $user = User::where('google_id', $googleUser->id)->first();

            if ($user) {
                // Update existing user's tokens
                $user->update([
                    'google_token' => $token['access_token'],
                    'google_refresh_token' => $token['refresh_token'] ?? $user->google_refresh_token,
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'id' => (string) Str::uuid(),
                    'google_id' => $googleUser->id,
                    'name' => $googleUser->name ?? $googleUser->email,
                    'email' => $googleUser->email,
                    'email_verified_at' => now(),
                    'google_token' => $token['access_token'],
                    'google_refresh_token' => $token['refresh_token'] ?? null,
                ]);
            }

            Auth::login($user);

            return redirect()->intended(route('dashboard'));
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['message' => 'Authentication failed: '.$e->getMessage()]);
        }
    }

    protected function getGoogleClient(): Client
    {
        $client = new Client;
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect'));

        return $client;
    }
}
