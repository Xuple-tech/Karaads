<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserVerificationRequestController extends Controller
{
    public function approve(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $verificationRequest = $user->verificationRequests()
            ->where('status', VerificationRequest::STATUS_PENDING)
            ->latest()
            ->first();

        if (! $verificationRequest) {
            return back()->withErrors([
                'verification_request' => 'No pending verification request found for this user.',
            ]);
        }

        $verificationRequest->update([
            'status' => VerificationRequest::STATUS_APPROVED,
            'review_notes' => $request->input('review_notes'),
            'reviewed_by' => auth('admin')->id(),
            'reviewed_at' => now(),
        ]);

        $user->forceFill([
            'kara_verified_at' => now(),
            'kara_verified_expires_at' => now()->addDays(30),
        ])->save();

        return back()->with('success', 'Kara Verified has been approved for 30 days.');
    }

    public function reject(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'review_notes' => ['required', 'string', 'max:1000'],
        ]);

        $verificationRequest = $user->verificationRequests()
            ->where('status', VerificationRequest::STATUS_PENDING)
            ->latest()
            ->first();

        if (! $verificationRequest) {
            return back()->withErrors([
                'verification_request' => 'No pending verification request found for this user.',
            ]);
        }

        $verificationRequest->update([
            'status' => VerificationRequest::STATUS_REJECTED,
            'review_notes' => $request->input('review_notes'),
            'reviewed_by' => auth('admin')->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Verification request rejected.');
    }
}
