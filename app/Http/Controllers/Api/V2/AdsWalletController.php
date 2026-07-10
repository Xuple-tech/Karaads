<?php

namespace App\Http\Controllers\Api\V2;

use App\Domain\AdsV2\Services\AdPaymentService;
use App\Domain\AdsV2\Services\WalletLedgerService;
use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdAccount;
use App\Models\AdsV2\AdCreditLine;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdWallet;
use App\Models\VerificationRequest;
use App\Services\KaraVerifiedBadgePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class AdsWalletController extends Controller
{
    public function __construct(
        private readonly WalletLedgerService $walletLedgerService,
        private readonly AdPaymentService $adPaymentService,
        private readonly KaraVerifiedBadgePaymentService $badgePaymentService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $account = $this->resolveInternalAccount($request);

        return response()->json([
            'account' => $account,
            'wallet' => $account->wallet,
            'credit_lines' => $account->creditLineRequests()->latest()->limit(10)->get(),
            'ledger' => $account->wallet?->ledger()->latest()->limit(25)->get(),
        ]);
    }

    public function deposit(Request $request): JsonResponse
    {
        abort_unless(
            app()->environment(['local', 'testing']),
            403,
            'Direct wallet deposits are disabled outside local and testing environments.'
        );

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $account = $this->resolveInternalAccount($request);
        $wallet = $account->wallet;

        $wallet->balance = (float) $wallet->balance + (float) $validated['amount'];
        $wallet->save();

        $entry = $this->walletLedgerService->deposit(
            $wallet,
            (float) $validated['amount'],
            'deposit-' . Str::uuid(),
            ['source' => 'manual'],
        );

        return response()->json([
            'message' => 'Deposit recorded.',
            'wallet' => $wallet->fresh(),
            'ledger_entry' => $entry,
        ], 201);
    }

    public function topUp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50',
            'campaign_id' => 'nullable|uuid|exists:ad_campaigns_v2,id',
        ]);

        $account = $this->resolveInternalAccount($request);
        $wallet = $account->wallet;

        $reference = 'paystack_' . Str::uuid();
        $payment = AdPayment::create([
            'ad_wallet_id' => $wallet->id,
            'amount' => $validated['amount'],
            'currency' => 'NGN',
            'provider' => 'paystack',
            'reference' => $reference,
            'status' => 'pending',
            'fees' => 0,
            'meta' => [
                'init_by' => $request->user()?->id,
                'campaign_id' => $validated['campaign_id'] ?? null,
            ],
        ]);

        $email = $request->user()?->email ?? 'customer@example.com';
        $callbackUrl = url('/api/v2/payment/9eiru848596845/wallet/top-up/webhook');

        $requestClient = Http::withToken(config('services.paystack.secret_key'))
            ->acceptJson();

        if (! (bool) config('services.paystack.verify_ssl', true)) {
            $requestClient = $requestClient->withoutVerifying();
        }

        $init = $requestClient
            ->post('https://api.paystack.co/transaction/initialize', [
                'reference' => $reference,
                'amount' => (int) round($validated['amount'] * 100), // kobo
                'email' => $email,
                'currency' => 'NGN',
                'callback_url' => $callbackUrl,
                'metadata' => [
                    'wallet_id' => $wallet->id,
                    'user_id' => $request->user()?->id,
                    'campaign_id' => $validated['campaign_id'] ?? null,
                ],
            ]);

        if (! $init->ok() || ! ($init->json('status') === true)) {
            Log::warning('Paystack init failed', ['response' => $init->json()]);
            return response()->json(['message' => 'Unable to initialize payment'], 502);
        }

        $authUrl = $init->json('data.authorization_url') ?? null;

        return response()->json([
            'reference' => $payment->reference,
            'status' => $payment->status,
            'authorization_url' => $authUrl,
            'message' => 'Payment initialized',
        ]);
    }

    public function topUpWebhook(Request $request)
    {
        $payload = $request->all();
        $reference = $payload['data']['reference'] ?? $payload['reference'] ?? $payload['trxref'] ?? null;
        if (! $reference) {
            return response()->json(['message' => 'Missing reference'], 422);
        }

        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.webhook_secret');
        if ($request->isMethod('post') && $secret && ! $signature) {
            Log::warning('Paystack webhook missing signature', ['reference' => $reference]);
            return response()->json(['message' => 'Missing signature'], 401);
        }

        if ($signature && $secret) {
            $computed = hash_hmac('sha512', $request->getContent(), $secret);
            if (! hash_equals($computed, $signature)) {
                Log::warning('Paystack webhook signature mismatch', ['reference' => $reference]);
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        if (str_starts_with((string) $reference, 'kara_verified_')) {
            $verificationRequest = VerificationRequest::where('payment_reference', $reference)->firstOrFail();

            if ($verificationRequest->payment_status !== 'paid') {
                if (($payload['data']['status'] ?? null) === 'success') {
                    $this->badgePaymentService->processPaystackPayload($verificationRequest, $payload['data']);
                } else {
                    $this->badgePaymentService->markPaystackPaymentIfSuccessful($verificationRequest);
                }
            } else {
                $this->badgePaymentService->approvePaidVerificationRequest($verificationRequest);
            }

            if (! $request->isMethod('get') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Kara Verified badge payment processed',
                    'verification_request' => $verificationRequest->fresh(),
                ]);
            }

            return redirect('/settings/profile?' . http_build_query([
                'verification_payment' => 'paystack',
                'reference' => $reference,
            ]));
        }

        $payment = AdPayment::where('reference', $reference)->firstOrFail();
        if ($payment->status === 'successful') {
            if (! $request->isMethod('get') || $request->expectsJson()) {
                return response()->json(['message' => 'Payment already processed', 'wallet' => $payment->wallet->fresh()]);
            }

            return $this->redirectToAdsIndex($payment);
        }

        $hasEmbeddedStatus = isset($payload['data']['status']) || is_string($payload['status'] ?? null);
        $shouldVerifyReference = $request->isMethod('get')
            || ! $hasEmbeddedStatus
            || ($request->isMethod('post') && empty($signature));

        if ($shouldVerifyReference) {
            try {
                $payload = $this->adPaymentService->verifyPaystackReference((string) $reference);
            } catch (RuntimeException $e) {
                Log::warning('Paystack callback verification failed', [
                    'reference' => $reference,
                    'error' => $e->getMessage(),
                ]);

                if (! $request->isMethod('get') || $request->expectsJson()) {
                    return response()->json(['message' => 'Unable to verify payment'], 502);
                }

                return $this->redirectToAdsIndex($payment);
            }
        }

        $result = $this->adPaymentService->processPaymentOutcome($payment, $payload);
        $freshPayment = $payment->fresh();

        if (! $request->isMethod('get') || $request->expectsJson()) {
            return response()->json(['message' => $result['message'], 'wallet' => $result['wallet']]);
        }

        return $this->redirectToAdsIndex($freshPayment);
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reference' => 'required|string',
        ]);

        $payment = AdPayment::where('reference', $validated['reference'])->firstOrFail();
        $account = $this->resolveInternalAccount($request);

        // Ensure the payment belongs to this user
        if ($payment->ad_wallet_id !== $account->wallet?->id) {
            abort(403, 'Unauthorized payment reference.');
        }

        try {
            $result = $this->adPaymentService->verifyAndProcessPayment($payment);
        } catch (RuntimeException $e) {
            return response()->json(['message' => 'Unable to verify payment'], 502);
        }

        return response()->json([
            'message' => $result['message'],
            'payment' => $payment->fresh(),
            'wallet' => $result['wallet'],
        ]);
    }

    public function requestCreditLine(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requested_amount' => 'required|numeric|min:10',
            'notes' => 'nullable|string|max:2000',
        ]);

        $account = $this->resolveInternalAccount($request);

        $creditLine = AdCreditLine::create([
            'ad_account_id' => $account->id,
            'requested_amount' => $validated['requested_amount'],
            'approved_amount' => 0,
            'status' => 'pending',
            'review_notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Credit line request submitted.',
            'credit_line' => $creditLine,
        ], 201);
    }

    private function resolveInternalAccount(Request $request): AdAccount
    {
        $user = $request->user();

        $account = AdAccount::firstOrCreate(
            ['user_id' => $user->id, 'source_type' => 'internal'],
            ['name' => $user->name . ' Ads Account', 'status' => 'active'],
        );

        AdWallet::firstOrCreate(
            ['ad_account_id' => $account->id],
            ['currency' => 'NGN', 'balance' => 0, 'credit_limit' => 0, 'credit_used' => 0, 'is_credit_approved' => false],
        );

        return $account->fresh('wallet');
    }

    private function redirectToAdsIndex(AdPayment $payment)
    {
        $base = route('ads.index');
        $query = http_build_query([
            'payment_reference' => $payment->reference,
            'payment_status' => $payment->status,
        ]);

        return redirect()->to("{$base}?{$query}");
    }
}
