<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\InternalUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminSessionController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::guard('internal')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/auth/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::guard('internal')->attempt($credentials, $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'These credentials do not match our records.',
            ])->onlyInput('email');
        }

        /** @var InternalUser $user */
        $user = Auth::guard('internal')->user();

        if (! $user->is_active) {
            Auth::guard('internal')->logout();

            return back()->withErrors([
                'email' => 'This account has been deactivated.',
            ])->onlyInput('email');
        }

        $user->update(['last_login_at' => now()]);

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('internal')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
