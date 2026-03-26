<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailAccount;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;

class GoogleController extends Controller
{
    /**
     * Redirect to Google OAuth
     * Optionally include link_email=1 to enable Gmail account linking after login
     */
    public function redirectToGoogle(Request $request)
    {
        // Store link_email flag in session if provided
        if ($request->query('link_email') === '1') {
            session(['oauth_link_email' => true]);
        }

        return Socialite::driver('google')
            ->scopes(['email', 'profile'])
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     * Can also link Gmail account if link_email=1 was in original redirect
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Ensure we have an email address
            if (!$googleUser->email) {
                throw new \Exception('Google account does not have an email address');
            }

            $user = User::where('email', $googleUser->email)->first();

            // Create user if doesn't exist
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => bcrypt(Str::random(16)),
                    'email_verified_at' => now(),
                ]);
                Log::info('New user created via Google OAuth', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }

            // Login the user
            Auth::login($user);

            // Check if we should link Gmail account
            $linkEmail = session('oauth_link_email', false);
            session()->forget('oauth_link_email');

            if ($linkEmail === true) {
                $this->linkGmailAccount($user, $googleUser);
                Log::info('Gmail account linked during Google login', [
                    'user_id' => $user->id,
                    'email_address' => $googleUser->email,
                ]);
            }

            return redirect()->intended('/new');

        } catch (\Exception $e) {
            Log::error('Google OAuth callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect('/login')->with('error', 'Google login failed: ' . $e->getMessage());
        }
    }

    /**
     * Link Gmail account using OAuth tokens from Google login
     * This automatically creates an EmailAccount record for Gmail automation
     */
    private function linkGmailAccount(User $user, $googleUser)
    {
        try {
            // Check if Gmail is already linked
            $existingAccount = EmailAccount::where('user_id', $user->id)
                ->where('email_address', $googleUser->email)
                ->where('provider', 'gmail')
                ->first();

            if ($existingAccount) {
                Log::info('Gmail account already linked for user', [
                    'user_id' => $user->id,
                    'email_address' => $googleUser->email,
                ]);
                return;
            }

            // Get the access token and token expiry from Socialite
            $accessToken = $googleUser->token;
            $refreshToken = $googleUser->refreshToken;
            $expiresIn = $googleUser->expiresIn ?? 3600;

            // Calculate expiration time
            $expiresAt = now()->addSeconds($expiresIn);

            // Prepare credentials (encrypted)
            $credentials = [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at' => $expiresAt->toDateTimeString(),
                'token_type' => 'Bearer',
                'scope' => 'https://www.googleapis.com/auth/gmail.readonly',
            ];

            // Create EmailAccount for Gmail
            $emailAccount = EmailAccount::create([
                'user_id' => $user->id,
                'provider' => 'gmail',
                'email_address' => $googleUser->email,
                'credentials' => $credentials, // Will be encrypted by Laravel
                'settings' => [
                    'linked_via' => 'google_oauth_login',
                    'linked_at' => now()->toDateTimeString(),
                    'auto_sync' => true,
                ],
                'is_active' => true,
            ]);

            Log::info('Gmail account successfully linked via Google OAuth login', [
                'user_id' => $user->id,
                'email_account_id' => $emailAccount->id,
                'email_address' => $googleUser->email,
            ]);

            return $emailAccount;

        } catch (\Exception $e) {
            Log::error('Failed to link Gmail account', [
                'user_id' => $user->id,
                'email_address' => $googleUser->email ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Don't throw - we still want to let user login even if linking fails
        }
    }
}
