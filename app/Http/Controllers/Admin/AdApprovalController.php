<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdApprovalController extends Controller
{
    public function approve(Request $request, Ad $ad): void
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $admin = Auth::guard('admin')->user();

        $ad->update([
            'approval_status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);
    }

    public function reject(Request $request, Ad $ad): void
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        $admin = Auth::guard('admin')->user();

        $ad->update([
            'approval_status' => 'rejected',
            'approved_by' => $admin->id,
            'rejection_reason' => $validated['rejection_reason'],
            'approved_at' => now(),
        ]);
    }
}
