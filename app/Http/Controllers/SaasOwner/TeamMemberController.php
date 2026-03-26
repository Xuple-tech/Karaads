<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\SaasTeamMember;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * TeamMemberController
 *
 * Manage team members within SaaS instance
 */
class TeamMemberController extends \Illuminate\Routing\Controller
{
    /**
     * Show team members
     */
    public function index()
    {
        $user = auth()->user();
        $teamMembers = SaasTeamMember::where('saas_owner_id', $user->id)
            ->with('user')
            ->paginate(20)
            ->through(fn ($member) => [
                'id' => $member->id,
                'user' => [
                    'id' => $member->user->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                ],
                'role' => $member->role,
                'permissions' => $member->permissions ?? [],
                'joined_at' => $member->created_at->toIso8601String(),
            ]);

        return Inertia::render('SaasOwner/TeamMembers', [
            'members' => [
                'data' => $teamMembers->items(),
                'current_page' => $teamMembers->currentPage(),
                'last_page' => $teamMembers->lastPage(),
            ],
        ]);
    }

    /**
     * Invite new team member
     */
    public function create()
    {
        return Inertia::render('SaasOwner/TeamMembers/Create');
    }

    /**
     * Store new team member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:member,manager,admin',
            'permissions' => 'nullable|array',
        ]);

        $user = User::where('email', $validated['email'])->first();

        $member = SaasTeamMember::create([
            'saas_owner_id' => auth()->id(),
            'user_id' => $user->id,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'],
            'is_active' => true,
        ]);

        AuditLog::logAction('create', 'SaasTeamMember', $member->id, null, $validated, "Added team member: {$user->email}");

        return redirect()->route('saas-owner.team-members.index')->with('success', 'Team member added');
    }

    /**
     * Edit team member
     */
    public function edit(SaasTeamMember $member)
    {
        if ($member->saas_owner_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('SaasOwner/TeamMembers/Edit', ['member' => $member->load('user')]);
    }

    /**
     * Update team member
     */
    public function update(Request $request, SaasTeamMember $member)
    {
        if ($member->saas_owner_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => 'required|in:member,manager,admin',
            'permissions' => 'nullable|array',
        ]);

        $oldValues = $member->toArray();
        $member->update($validated);

        AuditLog::logAction('update', 'SaasTeamMember', $member->id, $oldValues, $validated, "Updated team member: {$member->user->email}");

        return redirect()->route('saas-owner.team-members.index')->with('success', 'Team member updated');
    }

    /**
     * Remove team member
     */
    public function destroy(SaasTeamMember $member)
    {
        if ($member->saas_owner_id !== auth()->id()) {
            abort(403);
        }

        $email = $member->user->email;
        $member->delete();

        AuditLog::logAction('delete', 'SaasTeamMember', $member->id, $member->toArray(), null, "Removed team member: {$email}");

        return redirect()->route('saas-owner.team-members.index')->with('success', 'Team member removed');
    }

    /**
     * Deactivate team member
     */
    public function deactivate(SaasTeamMember $member)
    {
        if ($member->saas_owner_id !== auth()->id()) {
            abort(403);
        }

        $member->update(['is_active' => false]);

        AuditLog::logAction('deactivate', 'SaasTeamMember', $member->id, null, ['is_active' => false], "Deactivated team member: {$member->user->email}");

        return back()->with('success', 'Team member deactivated');
    }
}
