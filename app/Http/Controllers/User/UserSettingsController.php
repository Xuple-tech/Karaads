<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * UserSettingsController
 *
 * User settings and preferences
 */
class UserSettingsController extends \Illuminate\Routing\Controller
{
    /**
     * Show user settings
     */
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('User/Settings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url ?? null,
                'language' => $user->language ?? 'ENGLISH',
                'theme' => $user->theme ?? 'light',
                'notifications_enabled' => $user->notifications_enabled ?? true,
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ]);
    }
}
