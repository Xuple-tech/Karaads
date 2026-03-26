<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;

class SaasOwnerController extends \Illuminate\Routing\Controller
{
    /**
     * Display a listing of SaaS owners.
     */
    public function index()
    {
        $owners = User::where('role', 'saas_owner')->paginate(15);
        return inertia('Admin/SaasOwner/Index', ['owners' => $owners]);
    }

    /**
     * Show the form for creating a new SaaS owner.
     */
    public function create()
    {
        return inertia('Admin/SaasOwner/Create');
    }

    /**
     * Store a newly created SaaS owner in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => 'saas_owner',
            'is_admin' => 0,
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.saas-owners.show', $user->id)
            ->with('success', 'SaaS Owner created successfully');
    }

    /**
     * Display the specified SaaS owner.
     */
    public function show(User $saasOwner)
    {
        return inertia('Admin/SaasOwner/Show', ['owner' => $saasOwner]);
    }

    /**
     * Show the form for editing the specified SaaS owner.
     */
    public function edit(User $saasOwner)
    {
        return inertia('Admin/SaasOwner/Edit', ['owner' => $saasOwner]);
    }

    /**
     * Update the specified SaaS owner in storage.
     */
    public function update(Request $request, User $saasOwner)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $saasOwner->id,
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validated['password'] ?? null) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $saasOwner->update($validated);

        return redirect()->route('admin.saas-owners.show', $saasOwner->id)
            ->with('success', 'SaaS Owner updated successfully');
    }

    /**
     * Remove the specified SaaS owner from storage.
     */
    public function destroy(User $saasOwner)
    {
        $saasOwner->delete();

        return redirect()->route('admin.saas-owners.index')
            ->with('success', 'SaaS Owner deleted successfully');
    }
}
