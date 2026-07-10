<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AccountDeletionController extends Controller
{
    /**
     * Show the account deletion page.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('settings/account-deletion');
    }

    /**
     * Delete the user's account and all associated data.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Start a database transaction to ensure all deletions are atomic
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

            // Logout the user
            Auth::logout();

            // Invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect('/')->with('message', 'Your account has been permanently deleted.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'An error occurred while deleting your account. Please try again.']);
        }
    }
}
