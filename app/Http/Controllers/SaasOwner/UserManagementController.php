<?php

namespace App\Http\Controllers\SaasOwner;

use App\Models\User;
use App\Models\Subscription;
use App\Models\Conversation;
use App\Models\Chat;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * UserManagementController
 *
 * SaaS Owner can view and manage all users
 * Only SaaS Owner role can access these features
 */
class UserManagementController extends \Illuminate\Routing\Controller
{
    /**
     * List all users with pagination and filtering
     */
    public function index(Request $request)
    {
        $query = User::with(['activeSubscription', 'activeSubscription.plan']);

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        // Filter by subscription status
        if ($request->has('subscription_status') && $request->subscription_status) {
            $query->whereHas('subscriptions', function ($q) use ($request) {
                $q->where('status', $request->subscription_status);
            });
        }

        // Search by email or name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%$search%")
                  ->orWhere('name', 'like', "%$search%");
            });
        }

        // Filter by verification status
        if ($request->has('verified') !== null) {
            if ($request->verified === 'true' || $request->verified === '1') {
                $query->whereNotNull('email_verified_at');
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        // Sort options
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate(50)->through(function ($user) {
            $activeSubscription = $user->activeSubscription;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'is_admin' => $user->is_admin,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                'subscription' => $activeSubscription ? [
                    'plan_name' => $activeSubscription->plan->name,
                    'status' => $activeSubscription->status,
                    'renews_at' => $activeSubscription->renews_at,
                ] : null,
                'total_conversations' => $user->conversations()->count(),
                'total_chats' => $user->chats()->count(),
            ];
        });

        return Inertia::render('SaasOwner/Users/Index', [
            'users' => [
                'data' => $users->items(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'filters' => [
                'role' => $request->role,
                'subscription_status' => $request->subscription_status,
                'search' => $request->search,
                'verified' => $request->verified,
            ],
        ]);
    }

    /**
     * Show user details
     */
    public function show(User $user)
    {
        $user->load(['activeSubscription', 'activeSubscription.plan']);

        // Get user stats
        $totalConversations = $user->conversations()->count();
        $totalChats = $user->chats()->count();
        $totalConversationsThisMonth = $user->conversations()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        // Get usage info
        $activeSubscription = $user->activeSubscription;

        return Inertia::render('SaasOwner/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'is_admin' => $user->is_admin,
                'language' => $user->language,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'stats' => [
                'total_conversations' => $totalConversations,
                'total_chats' => $totalChats,
                'conversations_this_month' => $totalConversationsThisMonth,
            ],
            'subscription' => $activeSubscription ? [
                'id' => $activeSubscription->id,
                'plan' => $activeSubscription->plan,
                'status' => $activeSubscription->status,
                'started_at' => $activeSubscription->started_at,
                'renews_at' => $activeSubscription->renews_at,
                'expires_at' => $activeSubscription->expires_at,
                'is_trial' => $activeSubscription->is_trial,
                'trial_ends_at' => $activeSubscription->trial_ends_at,
            ] : null,
        ]);
    }

    /**
     * Show edit user form
     */
    public function edit(User $user)
    {
        return Inertia::render('SaasOwner/Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:user,staff,admin,saas_owner',
            'language' => 'nullable|string',
        ]);

        try {
            $oldValues = $user->toArray();

            $user->update($validated);

            AuditLog::logAction(
                'update',
                'User',
                $user->id,
                $oldValues,
                $validated,
                "SaaS Owner updated user {$user->email}"
            );

            return redirect()->route('saas-owner.users.show', $user->id)
                ->with('success', 'User updated successfully');
        } catch (\Exception $e) {
            Log::error('Failed to update user', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Reset user password
     */
    public function resetPassword(Request $request, User $user)
    {
        // In production, this should send a password reset email
        // For now, we'll generate a temporary password

        $request->validate([
            'send_email' => 'boolean',
        ]);

        try {
            // Generate temporary password
            $temporaryPassword = str()->random(16);

            // Hash and update password
            $user->update([
                'password' => bcrypt($temporaryPassword),
            ]);

            AuditLog::logAction(
                'reset_password',
                'User',
                $user->id,
                null,
                ['email' => $user->email],
                "SaaS Owner reset password for user {$user->email}"
            );

            // TODO: Send email with temporary password if requested
            if ($request->boolean('send_email')) {
                // Mail::send(...);
            }

            return back()->with('success', 'Password reset. Temporary password: ' . $temporaryPassword);
        } catch (\Exception $e) {
            Log::error('Failed to reset password', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to reset password: ' . $e->getMessage());
        }
    }

    /**
     * Toggle user active status
     */
    public function toggleActive(Request $request, User $user)
    {
        try {
            // In production, this might use a 'is_active' field or soft deletes
            // For now we'll just update the role to indicate disabled status
            $oldStatus = $user->role;
            $newStatus = $user->role === 'disabled' ? 'user' : 'disabled';

            $user->update(['role' => $newStatus]);

            AuditLog::logAction(
                'toggle_active',
                'User',
                $user->id,
                ['role' => $oldStatus],
                ['role' => $newStatus],
                "SaaS Owner toggled active status for user {$user->email}"
            );

            return back()->with('success', 'User status updated');
        } catch (\Exception $e) {
            Log::error('Failed to toggle user status', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to toggle user status: ' . $e->getMessage());
        }
    }

    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        try {
            // Soft delete conversations and chats
            $user->conversations()->delete();

            AuditLog::logAction(
                'delete',
                'User',
                $user->id,
                $user->toArray(),
                null,
                "SaaS Owner deleted user {$user->email}"
            );

            $user->delete();

            return redirect()->route('saas-owner.users.index')
                ->with('success', 'User deleted successfully');
        } catch (\Exception $e) {
            Log::error('Failed to delete user', ['error' => $e->getMessage()]);

            return back()->with('error', 'Failed to delete user: ' . $e->getMessage());
        }
    }

    /**
     * Export users list
     */
    public function export(Request $request)
    {
        $query = User::with(['activeSubscription', 'activeSubscription.plan']);

        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->get();

        $csvData = "Name,Email,Role,Created At,Subscription Plan,Status\n";

        foreach ($users as $user) {
            $subscriptionPlan = $user->activeSubscription?->plan->name ?? 'None';
            $subscriptionStatus = $user->activeSubscription?->status ?? 'inactive';

            $csvData .= "\"{$user->name}\",\"{$user->email}\",\"{$user->role}\",\"{$user->created_at}\",\"{$subscriptionPlan}\",\"{$subscriptionStatus}\"\n";
        }

        return response($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users_export.csv"',
        ]);
    }
}
