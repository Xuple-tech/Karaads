<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Media\QueueUserAvatarUploadAction;
use App\Actions\Media\QueueUserCoverUploadAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request, QueueUserAvatarUploadAction $queueUserAvatarUploadAction, QueueUserCoverUploadAction $queueUserCoverUploadAction): RedirectResponse
    {
        $validated = $request->validated();
        $avatarFile = $request->file('avatar');
        $coverFile = $request->file('cover');
        unset($validated['avatar']);
        unset($validated['cover']);

        $user = $request->user();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($avatarFile) {
            $queueUserAvatarUploadAction->execute($user, $avatarFile);
        }

        if ($coverFile) {
            $queueUserCoverUploadAction->execute($user, $coverFile);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Delete user's avatar if it exists
        $paths = [$user->avatar];
        if (is_array($user->avatar_variants)) {
            $paths = array_merge($paths, array_values($user->avatar_variants));
        }

        // Delete user's cover if it exists
        if ($user->cover) {
            $paths[] = $user->cover;
        }
        if (is_array($user->cover_variants)) {
            $paths = array_merge($paths, array_values($user->cover_variants));
        }

        $deletable = array_values(array_filter(array_unique($paths), function ($path) {
            return is_string($path) && $path !== '' && !Str::startsWith($path, ['http://', 'https://']);
        }));

        if ($deletable !== []) {
            Storage::disk('public')->delete($deletable);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
