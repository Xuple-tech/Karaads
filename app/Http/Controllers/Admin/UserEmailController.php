<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminUserEmail;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class UserEmailController extends Controller
{
    public function create(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->select(['id', 'name', 'email', 'username'])
            ->whereNotNull('email')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit(25)
            ->get();

        $totalUsers = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->count();

        return Inertia::render('Admin/Emails/Create', [
            'users' => $users,
            'filters' => [
                'search' => $search,
            ],
            'totalUsers' => $totalUsers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_type' => ['required', 'in:user,all'],
            'user_id' => ['nullable', 'required_if:recipient_type,user', 'uuid', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:10000'],
        ]);

        $admin = $request->user('admin');
        $sent = 0;

        if ($validated['recipient_type'] === 'user') {
            $user = User::query()
                ->whereNotNull('email')
                ->where('email', '!=', '')
                ->findOrFail($validated['user_id']);

            Mail::to($user->email)->send(new AdminUserEmail(
                user: $user,
                emailSubject: $validated['subject'],
                body: $validated['message'],
                admin: $admin,
            ));

            return back()->with('success', "Email sent to {$user->email}.");
        }

        set_time_limit(0);

        User::query()
            ->select(['id', 'name', 'email', 'username'])
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->orderBy('id')
            ->chunkById(100, function ($users) use ($validated, $admin, &$sent) {
                foreach ($users as $user) {
                    Mail::to($user->email)->send(new AdminUserEmail(
                        user: $user,
                        emailSubject: $validated['subject'],
                        body: $validated['message'],
                        admin: $admin,
                    ));

                    $sent++;
                }
            });

        return back()->with('success', "Email sent to {$sent} user" . ($sent === 1 ? '' : 's') . '.');
    }
}
