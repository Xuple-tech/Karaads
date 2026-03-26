<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\TeamMember;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\TeamManagementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeamController extends Controller
{
    protected TeamManagementService $teamService;

    public function __construct(TeamManagementService $teamService)
    {
        $this->teamService = $teamService;
        $this->middleware('auth');
    }

    /**
     * GET /api/teams - List user's teams
     */
    public function index()
    {
        $teams = $this->teamService->getUserTeams(Auth::user());

        return response()->json([
            'data' => $teams->map(fn($team) => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'type' => $team->type,
                'description' => $team->description,
                'owner_id' => $team->owner_id,
                'member_count' => $team->members()->count(),
                'role' => $team->getMemberRole(Auth::user()),
            ]),
        ]);
    }

    /**
     * POST /api/teams - Create team
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:enterprise,department,project',
        ]);

        $team = $this->teamService->createTeam(
            Auth::user(),
            $validated['name'],
            $validated['type'] ?? 'enterprise',
            $validated['description'] ?? ''
        );

        return response()->json([
            'data' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
        ], 201);
    }

    /**
     * GET /api/teams/{team} - Get team details
     */
    public function show(Team $team)
    {
        $this->authorize('view', $team);

        $stats = $this->teamService->getTeamStats($team);

        return response()->json(['data' => $stats]);
    }

    /**
     * POST /api/teams/{team}/members - Invite member
     */
    public function inviteMember(Request $request, Team $team)
    {
        $this->authorize('manage_members', $team);

        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'in:admin,manager,member,viewer',
        ]);

        try {
            $invitation = $this->teamService->inviteToTeam(
                $team,
                $validated['email'],
                $validated['role'] ?? 'member',
                Auth::user()
            );

            return response()->json([
                'data' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'token' => $invitation->token,
                    'expires_at' => $invitation->expires_at->toIso8601String(),
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * GET /api/teams/{team}/members - List team members
     */
    public function listMembers(Team $team)
    {
        $this->authorize('view', $team);

        $members = $this->teamService->getTeamMembers($team);

        return response()->json(['data' => $members]);
    }

    /**
     * PUT /api/team-members/{member} - Update member role
     */
    public function updateMemberRole(Request $request, TeamMember $member)
    {
        $this->authorize('manage_members', $member->team);

        $validated = $request->validate([
            'role' => 'required|in:admin,manager,member,viewer',
        ]);

        try {
            $this->teamService->updateMemberRole($member, $validated['role'], Auth::user());
            return response()->json(['message' => 'Role updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * DELETE /api/team-members/{member} - Remove member
     */
    public function removeMember(TeamMember $member)
    {
        $this->authorize('manage_members', $member->team);

        try {
            $this->teamService->removeMember($member->team, $member->user, Auth::user());
            return response()->json(['message' => 'Member removed successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/invitations/{token}/accept - Accept invitation
     */
    public function acceptInvitation(string $token)
    {
        $invitation = TeamInvitation::where('token', $token)->first();

        if (!$invitation) {
            return response()->json(['error' => 'Invitation not found'], 404);
        }

        try {
            $member = $this->teamService->acceptInvitation($invitation, Auth::user());
            return response()->json(['data' => [
                'team_id' => $invitation->team_id,
                'role' => $member->role,
            ]]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * GET /api/teams/{team}/activity - Get team activity logs
     */
    public function activityLogs(Team $team)
    {
        $this->authorize('view', $team);

        $logs = $this->teamService->getActivityLogs($team, 100);

        return response()->json(['data' => $logs]);
    }

    /**
     * GET /api/teams/{team}/stats - Get team statistics
     */
    public function stats(Team $team)
    {
        $this->authorize('view', $team);

        $stats = $this->teamService->getTeamStats($team);

        return response()->json(['data' => $stats]);
    }
}
