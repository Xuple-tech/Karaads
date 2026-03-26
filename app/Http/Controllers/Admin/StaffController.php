<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;

class StaffController extends \Illuminate\Routing\Controller
{
    /**
     * Display a listing of staff members.
     */
    public function index()
    {
        $staff = User::where('role', 'staff')->paginate(15);
        return inertia('Admin/Staff/Index', ['staff' => $staff]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create()
    {
        return inertia('Admin/Staff/Create');
    }

    /**
     * Store a newly created staff member in storage.
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
            'role' => 'staff',
            'is_admin' => 1, // Staff members have admin access
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admin.staff.show', $user->id)
            ->with('success', 'Staff member created successfully');
    }

    /**
     * Display the specified staff member.
     */
    public function show(User $staff)
    {
        return inertia('Admin/Staff/Show', ['staff' => $staff]);
    }

    /**
     * Show the form for editing the specified staff member.
     */
    public function edit(User $staff)
    {
        return inertia('Admin/Staff/Edit', ['staff' => $staff]);
    }

    /**
     * Update the specified staff member in storage.
     */
    public function update(Request $request, User $staff)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->id,
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validated['password'] ?? null) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $staff->update($validated);

        return redirect()->route('admin.staff.show', $staff->id)
            ->with('success', 'Staff member updated successfully');
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy(User $staff)
    {
        $staff->delete();

        return redirect()->route('admin.staff.index')
            ->with('success', 'Staff member deleted successfully');
    }
}
