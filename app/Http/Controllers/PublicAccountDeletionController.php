<?php

namespace App\Http\Controllers;

use App\Mail\AccountDeletionConfirmation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicAccountDeletionController extends Controller
{
    /**
     * Show the public account deletion request form.
     * Users can request account deletion via email if they don't remember their password.
     */
    public function show(): Response
    {
        return Inertia::render('account-deletion-request');
    }

    /**
     * Send account deletion confirmation email.
     */
    public function sendConfirmationEmail(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $deletionToken = bin2hex(random_bytes(32));

            $user->update([
                'deletion_token' => hash('sha256', $deletionToken),
                'deletion_token_expires_at' => now()->addHours(24),
            ]);

            if (app()->environment('production')) {
                Mail::to($user->email)->send(new AccountDeletionConfirmation($user, $deletionToken));
            }
        }

        return back()->with('success', 'A confirmation email has been sent to your email address. Please check your inbox.');
    }

    /**
     * Show the account deletion confirmation page with token validation.
     */
    public function showConfirmation(string $token): Response
    {
        $user = User::where('deletion_token', $this->hashDeletionToken($token))
            ->where('deletion_token_expires_at', '>', now())
            ->first();

        if (! $user) {
            abort(404, 'Invalid or expired deletion token.');
        }

        return Inertia::render('account-deletion-confirm', [
            'token' => $token,
        ]);
    }

    /**
     * Confirm and process account deletion via email token.
     */
    public function confirmDeletion(Request $request, string $token): RedirectResponse
    {
        $request->validate([
            'password' => ['required'],
        ]);

        $user = User::where('deletion_token', $this->hashDeletionToken($token))
            ->where('deletion_token_expires_at', '>', now())
            ->firstOrFail();

        // Verify password if user remembers it
        if (! Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'The password is incorrect.']);
        }

        // Delete the user account
        $this->deleteUserAccount($user);

        return redirect('/')->with('message', 'Your account has been permanently deleted.');
    }

    /**
     * Delete user account and all associated data.
     */
    private function deleteUserAccount(User $user): void
    {
        DB::beginTransaction();

        try {
            // Delete user's avatar if it exists
            $avatarPaths = [$user->avatar];
            if (is_array($user->avatar_variants)) {
                $avatarPaths = array_merge($avatarPaths, array_values($user->avatar_variants));
            }

            $deletableAvatars = array_values(array_filter(array_unique($avatarPaths), function ($path) {
                return is_string($path) && $path !== '' && !Str::startsWith($path, ['http://', 'https://']);
            }));

            if ($deletableAvatars !== []) {
                Storage::disk('public')->delete($deletableAvatars);
            }

            // Delete all user's posts and associated data
            $user->posts()->delete();

            // Delete all user's comments
            $user->comments()->delete();

            // Delete all user's likes
            $user->likes()->delete();

            // Delete all user's messages
            $user->messages()->delete();

            // Delete conversations created by user
            $user->createdConversations()->delete();

            // Delete followers relationships
            $user->followers()->detach();
            $user->following()->detach();

            // Delete conversations (user as participant)
            $user->conversations()->detach();

            // Delete wallet and related financial data
            $user->wallet()->delete();
            $user->earnings()->delete();
            $user->withdrawalRequests()->delete();
            $user->postMonetizations()->delete();

            // Delete referral relationships
            $user->referrals()->delete();

            // Clear any active sessions/tokens
            $user->tokens()->delete();

            // Delete the user account
            $user->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            throw $e;
        }
    }

    private function hashDeletionToken(string $token): string
    {
        return hash('sha256', $token);
    }
}
