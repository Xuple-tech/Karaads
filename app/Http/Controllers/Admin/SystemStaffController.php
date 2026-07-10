<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SystemStaffController extends Controller
{
    private const STAFF_PERMISSIONS = [
        'manage_ads',
        'manage_campaigns',
        'view_analytics',
        'manage_earnings',
        'manage_withdrawals',
        'view_financial_reports',
        'moderate_content',
        'review_posts',
        'review_comments',
    ];

    public function index(Request $request): Response
    {
        $query = Admin::query();

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', (string) $request->string('role'));
        }

        if ($request->filled('status')) {
            $status = (string) $request->string('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            }
            if ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        return Inertia::render('Admin/SystemStaff/Index', [
            'staff' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => $this->roles(),
            'permissions' => self::STAFF_PERMISSIONS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/SystemStaff/Create', [
            'roles' => $this->roles(),
            'permissions' => self::STAFF_PERMISSIONS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:admins,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'in:' . implode(',', $this->roles())],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'in:' . implode(',', self::STAFF_PERMISSIONS)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        Admin::query()->create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        return redirect()->route('admin.system-staff.index')
            ->with('success', 'System staff created successfully.');
    }

    public function edit(Admin $admin): Response
    {
        return Inertia::render('Admin/SystemStaff/Edit', [
            'staff' => $admin,
            'roles' => $this->roles(),
            'permissions' => self::STAFF_PERMISSIONS,
        ]);
    }

    public function update(Request $request, Admin $admin): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'in:' . implode(',', $this->roles())],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'in:' . implode(',', self::STAFF_PERMISSIONS)],
        ]);

        $admin->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
        ]);

        return redirect()->route('admin.system-staff.index')
            ->with('success', 'System staff updated successfully.');
    }

    public function toggleActive(Admin $admin): RedirectResponse
    {
        $actor = auth('admin')->user();

        if ((string) $actor->id === (string) $admin->id) {
            return back()->with('error', 'You cannot change your own active state.');
        }

        if ($admin->role === Admin::ROLE_SUPER_ADMIN && $admin->is_active && $this->activeSuperAdminCount() <= 1) {
            return back()->with('error', 'Cannot deactivate the last active super admin.');
        }

        $admin->update(['is_active' => ! $admin->is_active]);

        return back()->with('success', 'Staff status updated successfully.');
    }

    public function resetPassword(Request $request, Admin $admin): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $admin->update([
            'password' => Hash::make((string) $request->string('password')),
        ]);

        return back()->with('success', 'Staff password reset successfully.');
    }

    public function destroy(Admin $admin): RedirectResponse
    {
        $actor = auth('admin')->user();

        if ((string) $actor->id === (string) $admin->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($admin->role === Admin::ROLE_SUPER_ADMIN && $admin->is_active && $this->activeSuperAdminCount() <= 1) {
            return back()->with('error', 'Cannot delete the last active super admin.');
        }

        $admin->delete();

        return redirect()->route('admin.system-staff.index')
            ->with('success', 'System staff deleted successfully.');
    }

    private function roles(): array
    {
        return [
            Admin::ROLE_SUPER_ADMIN,
            Admin::ROLE_ADMIN,
            Admin::ROLE_MODERATOR,
            Admin::ROLE_AD_MANAGER,
            Admin::ROLE_FINANCE_MANAGER,
        ];
    }

    private function activeSuperAdminCount(): int
    {
        return Admin::query()
            ->where('role', Admin::ROLE_SUPER_ADMIN)
            ->where('is_active', true)
            ->count();
    }
}
