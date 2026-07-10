<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VerificationRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BadgePaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $provider = trim((string) $request->query('provider', ''));

        $query = VerificationRequest::query()
            ->with('user:id,name,email,username,status,kara_verified_at,kara_verified_expires_at,created_at')
            ->where('payment_status', 'paid')
            ->when($provider !== '', function ($q) use ($provider) {
                if ($provider === 'wallet') {
                    $q->where(function ($walletQuery) {
                        $walletQuery->where('payment_provider', 'wallet')->orWhereNull('payment_provider');
                    });

                    return;
                }

                $q->where('payment_provider', $provider);
            })
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('contact_email', 'like', "%{$search}%")
                        ->orWhere('payment_reference', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('username', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('paid_at')
            ->latest('updated_at');

        $summaryBase = VerificationRequest::query()->where('payment_status', 'paid');

        return Inertia::render('Admin/BadgePayments/Index', [
            'payments' => $query->paginate(30)->withQueryString(),
            'filters' => [
                'search' => $search,
                'provider' => $provider,
            ],
            'summary' => [
                'total_paid' => (clone $summaryBase)->count(),
                'total_amount' => (float) (clone $summaryBase)->sum('payment_amount'),
                'paystack_count' => (clone $summaryBase)->where('payment_provider', 'paystack')->count(),
                'wallet_count' => (clone $summaryBase)->where(function ($q) {
                    $q->where('payment_provider', 'wallet')->orWhereNull('payment_provider');
                })->count(),
            ],
        ]);
    }
}
