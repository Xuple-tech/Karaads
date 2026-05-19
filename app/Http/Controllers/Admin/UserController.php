<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role !== '') {
            $query->where('role', $request->role);
        }

        $users = $query->withCount('referrals')
                      ->with('referrer:id,name,email')
                      ->orderBy('created_at', 'desc')
                      ->paginate(15)
                      ->through(function ($user) {
                          return [
                              'id' => $user->id,
                              'name' => $user->name,
                              'email' => $user->email,
                              'role' => $user->role,
                              'referral_code' => $user->referral_code,
                              'referrals_count' => $user->referrals_count,
                              'referred_by_name' => $user->referrer?->name,
                              'referred_by_email' => $user->referrer?->email,
                              'email_verified_at' => $user->email_verified_at,
                              'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                              'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                          ];
                      });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|in:admin,staff,saas_owner,user',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load('referrer:id,name,email', 'referrals:id,name,email,created_at');

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'google_id' => $user->google_id,
                'avatar' => $user->avatar,
                'language' => $user->language,
                'preferences' => $user->getPreferences(),
                'referral_code' => $user->referral_code,
                'referred_by_name' => $user->referrer?->name,
                'referred_by_email' => $user->referrer?->email,
                'referrals' => $user->referrals->map(fn($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'email' => $r->email,
                    'joined_at' => $r->created_at->format('Y-m-d'),
                ]),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'language' => $user->language,
                'call_by_name' => $user->call_by_name,
                'ai_mode_id' => $user->ai_mode_id,
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'nullable|string|in:admin,staff,saas_owner,user',
            'language' => 'nullable|string',
            'call_by_name' => 'boolean',
            'ai_mode_id' => 'nullable|string',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role ?? $user->role,
            'language' => $request->language ?? $user->language,
            'call_by_name' => $request->call_by_name ?? $user->call_by_name,
            'ai_mode_id' => $request->ai_mode_id ?? $user->ai_mode_id,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
