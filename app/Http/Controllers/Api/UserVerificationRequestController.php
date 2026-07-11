<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Services\KaraVerifiedBadgePaymentService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use RuntimeException;

class UserVerificationRequestController extends Controller
{
    private const BADGE_FEE_AMOUNT = 5000.0;
    private const STALE_PENDING_PAYMENT_MINUTES = 30;

    public function __construct(private readonly KaraVerifiedBadgePaymentService $badgePaymentService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $latest = $this->resolveRequestForDisplay($request->user());

        return response()->json([
            'data' => $latest ? $this->payload($latest) : null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasActiveKaraVerifiedBadge()) {
            return response()->json([
                'message' => 'Your account already has an active Kara Verified badge. You can renew after it expires.',
            ], 422);
        }

        $validated = $request->validate([
            'category' => ['required', Rule::in(['creator', 'public_figure', 'brand', 'business'])],
            'full_name' => ['required', 'string', 'max:255'],
            'contact_email' => ['required', 'email', 'max:255'],
            'reason' => ['required', 'string', 'min:30', 'max:2000'],
            'portfolio_url' => ['nullable', 'url', 'max:2048'],
            'social_url' => ['nullable', 'url', 'max:2048'],
            'payment_method' => ['nullable', Rule::in(['paystack'])],
        ]);

        $paymentMethod = $validated['payment_method'] ?? 'paystack';
        $this->expireStalePendingPayments($user);

        $pendingRequest = $user->verificationRequests()
            ->where('status', VerificationRequest::STATUS_PENDING)
            ->where(function ($query): void {
                $query->whereNull('payment_status')
                    ->orWhereIn('payment_status', array_filter(KaraVerifiedBadgePaymentService::ACTIVE_PAYMENT_STATUSES));
            })
            ->latest()
            ->first();

        if ($pendingRequest) {
            try {
                $pendingRequest = $this->badgePaymentService
                    ->markPaystackPaymentIfSuccessful($pendingRequest)
                    ->fresh();
            } catch (RuntimeException $e) {
                Log::warning('Unable to reconcile existing Kara Verified payment before retry', [
                    'verification_request_id' => $pendingRequest->id,
                    'reference' => $pendingRequest->payment_reference,
                    'error' => $e->getMessage(),
                ]);

                // We couldn't confirm the old attempt's outcome with Paystack (network
                // blip, API error, unrecognized reference, etc). Don't leave the user
                // blocked for up to 30 minutes on a status we can't verify — let them
                // retry now. If the original payment did succeed, the Paystack webhook
                // reconciles and approves it independently of this record's status.
                $pendingRequest = $this->badgePaymentService->markPaymentFailed(
                    $pendingRequest,
                    'abandoned',
                    'Could not verify the previous payment attempt with Paystack. The user was allowed to start a new payment.'
                );
            }

            if ($pendingRequest && $pendingRequest->payment_status === 'paid') {
                return response()->json([
                    'message' => 'Payment confirmed. Your Kara Verified badge is now active for 30 days.',
                    'data' => $this->payload($pendingRequest),
                ], 200);
            }

            if ($pendingRequest && ! $this->badgePaymentService->isActivePaymentStatus($pendingRequest->payment_status)) {
                $pendingRequest = null;
            }
        }

        if ($pendingRequest) {
            return response()->json([
                'message' => 'You already have a pending badge payment. Verify it or wait a few minutes before starting another one.',
            ], 422);
        }

        if ($paymentMethod === 'paystack') {
            return $this->initializePaystackPayment($request, $validated);
        }

        return response()->json([
            'message' => 'Kara Verified badge payments are Paystack only.',
        ], 422);
    }

    public function verifyPaystack(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reference' => ['nullable', 'string', 'max:120'],
        ]);

        $verificationRequest = $request->user()
            ->verificationRequests()
            ->when($validated['reference'] ?? null, function ($query, string $reference): void {
                $query->where('payment_reference', $reference);
            }, function ($query): void {
                $query->where('payment_provider', 'paystack')->latest();
            })
            ->firstOrFail();

        $this->badgePaymentService->markPaystackPaymentIfSuccessful($verificationRequest);

        return response()->json([
            'message' => $verificationRequest->fresh()->payment_status === 'paid'
                ? 'Payment confirmed. Your Kara Verified badge is now active for 30 days.'
                : 'Payment is still pending.',
            'data' => $this->payload($verificationRequest->fresh()),
        ]);
    }

    public function paystackCallback(Request $request): RedirectResponse
    {
        $reference = (string) ($request->query('reference') ?: $request->query('trxref'));

        if ($reference !== '') {
            $verificationRequest = VerificationRequest::query()
                ->where('payment_reference', $reference)
                ->first();

            if ($verificationRequest) {
                try {
                    $this->badgePaymentService->markPaystackPaymentIfSuccessful($verificationRequest);
                } catch (RuntimeException $e) {
                    Log::warning('Kara Verified Paystack callback verification failed', [
                        'reference' => $reference,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return redirect('/settings/profile?' . http_build_query([
            'verification_payment' => 'paystack',
            'reference' => $reference,
        ]));
    }

    public function paystackWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $reference = (string) ($payload['data']['reference'] ?? $payload['reference'] ?? '');

        if ($reference === '') {
            return response()->json(['message' => 'Missing reference'], 422);
        }

        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.webhook_secret');
        if ($secret && ! $signature) {
            Log::warning('Kara Verified Paystack webhook missing signature', ['reference' => $reference]);

            return response()->json(['message' => 'Missing signature'], 401);
        }

        if ($signature && $secret) {
            $computed = hash_hmac('sha512', $request->getContent(), $secret);
            if (! hash_equals($computed, $signature)) {
                Log::warning('Kara Verified Paystack webhook signature mismatch', ['reference' => $reference]);

                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        $verificationRequest = VerificationRequest::query()
            ->where('payment_reference', $reference)
            ->firstOrFail();

        $paystackData = $payload['data'] ?? [];
        if (is_array($paystackData) && ($paystackData['status'] ?? null) === 'success') {
            $this->badgePaymentService->processPaystackPayload($verificationRequest, $paystackData);
        } else {
            $this->badgePaymentService->markPaystackPaymentIfSuccessful($verificationRequest);
        }

        return response()->json([
            'message' => 'Kara Verified badge payment processed',
            'data' => $this->payload($verificationRequest->fresh()),
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function initializePaystackPayment(Request $request, array $validated): JsonResponse
    {
        $reference = 'kara_verified_' . Str::uuid();

        $verificationRequest = $request->user()->verificationRequests()->create([
            'status' => VerificationRequest::STATUS_PENDING,
            'category' => $validated['category'],
            'full_name' => $validated['full_name'],
            'username_snapshot' => (string) $request->user()->username,
            'contact_email' => $validated['contact_email'],
            'reason' => $validated['reason'],
            'portfolio_url' => $validated['portfolio_url'] ?? null,
            'social_url' => $validated['social_url'] ?? null,
            'followers_count_snapshot' => (int) ($request->user()->followers_count ?? 0),
            'payment_amount' => self::BADGE_FEE_AMOUNT,
            'payment_status' => 'pending',
            'payment_provider' => 'paystack',
            'payment_reference' => $reference,
        ]);

        $requestClient = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $requestClient = $requestClient->withoutVerifying();
        }

        $init = $requestClient->post('https://api.paystack.co/transaction/initialize', [
            'reference' => $reference,
            'amount' => (int) round(self::BADGE_FEE_AMOUNT * 100),
            'email' => $request->user()->email,
            'currency' => 'NGN',
            'callback_url' => url('/api/payment/kara-verified/paystack/callback'),
            'metadata' => [
                'type' => 'kara_verified_badge',
                'user_id' => $request->user()->id,
                'verification_request_id' => $verificationRequest->id,
            ],
        ]);

        if (! $init->ok() || ! ($init->json('status') === true)) {
            Log::warning('Kara Verified Paystack init failed', ['response' => $init->json()]);
            $verificationRequest->update([
                'status' => VerificationRequest::STATUS_REJECTED,
                'payment_status' => 'failed',
                'review_notes' => 'Paystack payment could not be initialized.',
                'reviewed_at' => now(),
            ]);

            return response()->json(['message' => 'Unable to initialize Paystack payment.'], 502);
        }

        $authorizationUrl = $init->json('data.authorization_url');
        $accessCode = $init->json('data.access_code');

        return response()->json([
            'message' => 'Paystack payment initialized.',
            'reference' => $reference,
            'authorization_url' => $authorizationUrl,
            'access_code' => $accessCode,
            'data' => array_merge($this->payload($verificationRequest), [
                // Mobile API clients unwrap the data envelope. Keep checkout
                // fields in both locations so web and mobile receive them.
                'reference' => $reference,
                'authorization_url' => $authorizationUrl,
                'access_code' => $accessCode,
            ]),
        ], 201);
    }

    private function expireStalePendingPayments(User $user): void
    {
        $staleCutoff = now()->subMinutes(self::STALE_PENDING_PAYMENT_MINUTES);

        $user->verificationRequests()
            ->where('status', VerificationRequest::STATUS_PENDING)
            ->where('payment_provider', 'paystack')
            ->where(function ($query): void {
                $query->whereNull('payment_status')
                    ->orWhereIn('payment_status', array_filter(KaraVerifiedBadgePaymentService::ACTIVE_PAYMENT_STATUSES));
            })
            ->where('created_at', '<=', $staleCutoff)
            ->get()
            ->each(function (VerificationRequest $verificationRequest): void {
                $this->badgePaymentService->markPaymentFailed(
                    $verificationRequest,
                    'failed',
                    'Pending badge payment expired before completion. The user can start a new payment.'
                );
            });
    }

    private function resolveRequestForDisplay(User $user): ?VerificationRequest
    {
        $latest = $user->verificationRequests()
            ->latest()
            ->first();

        if (! $latest) {
            return null;
        }

        $latest = $this->synchronizePaidRequest($latest);
        $user->refresh();

        if ($user->hasActiveKaraVerifiedBadge() && ! $this->isApprovedOrPaidRequest($latest)) {
            $badgeRequest = $user->verificationRequests()
                ->where(function ($query): void {
                    $query->where('status', VerificationRequest::STATUS_APPROVED)
                        ->orWhere('payment_status', 'paid');
                })
                ->latest('paid_at')
                ->latest()
                ->first();

            if ($badgeRequest) {
                return $this->synchronizePaidRequest($badgeRequest);
            }
        }

        return $latest;
    }

    private function synchronizePaidRequest(VerificationRequest $verificationRequest): VerificationRequest
    {
        if (
            $verificationRequest->payment_status === 'paid'
            && $verificationRequest->status !== VerificationRequest::STATUS_APPROVED
        ) {
            return $this->badgePaymentService->approvePaidVerificationRequest($verificationRequest)->fresh();
        }

        return $verificationRequest->fresh() ?? $verificationRequest;
    }

    private function isApprovedOrPaidRequest(?VerificationRequest $verificationRequest): bool
    {
        if (! $verificationRequest) {
            return false;
        }

        return $verificationRequest->status === VerificationRequest::STATUS_APPROVED
            || $verificationRequest->payment_status === 'paid';
    }

    private function payload(VerificationRequest $request): array
    {
        return [
            'id' => $request->id,
            'status' => $request->status,
            'category' => $request->category,
            'full_name' => $request->full_name,
            'contact_email' => $request->contact_email,
            'reason' => $request->reason,
            'portfolio_url' => $request->portfolio_url,
            'social_url' => $request->social_url,
            'followers_count_snapshot' => $request->followers_count_snapshot,
            'payment_amount' => $request->payment_amount !== null ? (float) $request->payment_amount : null,
            'payment_status' => $request->payment_status,
            'payment_provider' => $request->payment_provider,
            'payment_reference' => $request->payment_reference,
            'paid_at' => $request->paid_at?->toIso8601String(),
            'review_notes' => $request->review_notes,
            'reviewed_at' => $request->reviewed_at?->toIso8601String(),
            'created_at' => $request->created_at?->toIso8601String(),
        ];
    }
}
