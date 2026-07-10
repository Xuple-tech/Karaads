<?php

namespace App\Domain\AdsV2\Services;

use App\Models\AdsV2\AdWallet;
use App\Models\AdsV2\AdWalletLedger;
use Illuminate\Support\Str;
use RuntimeException;

class WalletLedgerService
{
    public function deposit(AdWallet $wallet, float $amount, ?string $idempotencyKey = null, array $meta = []): AdWalletLedger
    {
        return $this->writeEntry($wallet, 'credit', 'deposit', $amount, $idempotencyKey, $meta);
    }

    public function reserve(AdWallet $wallet, float $amount, ?string $referenceType = null, ?string $referenceId = null, ?string $idempotencyKey = null): AdWalletLedger
    {
        $existing = $this->existingEntry($idempotencyKey);
        if ($existing) {
            return $existing;
        }

        $this->assertSpendable($wallet, $amount);

        $availableCash = max(0.0, (float) $wallet->balance);
        $fromCash = min($availableCash, $amount);
        $fromCredit = max(0.0, $amount - $fromCash);

        $wallet->balance = max(0.0, $availableCash - $fromCash);
        if ($fromCredit > 0) {
            $wallet->credit_used = (float) $wallet->credit_used + $fromCredit;
        }
        $wallet->save();

        $entry = $this->writeEntry($wallet, 'debit', 'reserve', $amount, $idempotencyKey, [
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'source' => $fromCredit > 0 ? 'cash_credit' : 'cash',
            'from_cash' => $fromCash,
            'from_credit' => $fromCredit,
        ]);

        return $entry;
    }

    public function commit(AdWallet $wallet, float $amount, ?string $referenceType = null, ?string $referenceId = null, ?string $idempotencyKey = null): AdWalletLedger
    {
        $existing = $this->existingEntry($idempotencyKey);
        if ($existing) {
            return $existing;
        }

        return $this->writeEntry($wallet, 'debit', 'commit', $amount, $idempotencyKey, [
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);
    }

    public function release(
        AdWallet $wallet,
        float $amount,
        ?string $referenceType = null,
        ?string $referenceId = null,
        ?string $idempotencyKey = null,
        array $meta = [],
    ): AdWalletLedger
    {
        $existing = $this->existingEntry($idempotencyKey);
        if ($existing) {
            return $existing;
        }

        $fromCash = is_numeric($meta['from_cash'] ?? null)
            ? min($amount, max(0.0, (float) $meta['from_cash']))
            : $amount;
        $fromCredit = is_numeric($meta['from_credit'] ?? null)
            ? min(max(0.0, (float) $meta['from_credit']), max(0.0, $amount - $fromCash))
            : max(0.0, $amount - $fromCash);

        $wallet->balance = (float) $wallet->balance + $fromCash;
        if ($fromCredit > 0) {
            $wallet->credit_used = max(0.0, (float) $wallet->credit_used - $fromCredit);
        }
        $wallet->save();

        $entry = $this->writeEntry($wallet, 'credit', 'release', $amount, $idempotencyKey, [
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'source' => $fromCredit > 0 ? 'cash_credit' : 'cash',
            'from_cash' => $fromCash,
            'from_credit' => $fromCredit,
            ...$meta,
        ]);

        return $entry;
    }

    public function chargeWithCreditFallback(AdWallet $wallet, float $amount, ?string $referenceType = null, ?string $referenceId = null, ?string $idempotencyKey = null): AdWalletLedger
    {
        $existing = $this->existingEntry($idempotencyKey);
        if ($existing) {
            return $existing;
        }

        $availableCash = (float) $wallet->balance;

        if ($availableCash >= $amount) {
            $wallet->balance = $availableCash - $amount;
            $wallet->save();

            return $this->writeEntry($wallet, 'debit', 'commit', $amount, $idempotencyKey, [
                'source' => 'cash',
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);
        }

        $creditRoom = $wallet->is_credit_approved
            ? max(0, (float) $wallet->credit_limit - (float) $wallet->credit_used)
            : 0;

        $totalAvailable = $availableCash + $creditRoom;
        if ($totalAvailable < $amount) {
            throw new RuntimeException('Insufficient wallet balance and credit limit.');
        }

        $fromCash = $availableCash;
        $fromCredit = $amount - $fromCash;

        $wallet->balance = 0;
        $wallet->credit_used = (float) $wallet->credit_used + $fromCredit;
        $wallet->save();

        return $this->writeEntry($wallet, 'debit', 'commit', $amount, $idempotencyKey, [
            'source' => 'cash_credit',
            'from_cash' => $fromCash,
            'from_credit' => $fromCredit,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);
    }

    private function assertSpendable(AdWallet $wallet, float $amount): void
    {
        $availableCash = (float) $wallet->balance;
        $creditRoom = $wallet->is_credit_approved
            ? max(0, (float) $wallet->credit_limit - (float) $wallet->credit_used)
            : 0;

        if (($availableCash + $creditRoom) < $amount) {
            throw new RuntimeException('Not enough available funds.');
        }
    }

    private function existingEntry(?string $idempotencyKey): ?AdWalletLedger
    {
        if (! $idempotencyKey) {
            return null;
        }

        return AdWalletLedger::where('idempotency_key', $idempotencyKey)->first();
    }

    private function writeEntry(
        AdWallet $wallet,
        string $direction,
        string $type,
        float $amount,
        ?string $idempotencyKey,
        array $meta,
    ): AdWalletLedger {
        $idempotencyKey = $idempotencyKey ?: (string) Str::uuid();

        $existing = AdWalletLedger::where('idempotency_key', $idempotencyKey)->first();
        if ($existing) {
            return $existing;
        }

        return AdWalletLedger::create([
            'ad_wallet_id' => $wallet->id,
            'direction' => $direction,
            'entry_type' => $type,
            'amount' => $amount,
            'reference_type' => $meta['reference_type'] ?? null,
            'reference_id' => $meta['reference_id'] ?? null,
            'idempotency_key' => $idempotencyKey,
            'meta' => $meta,
        ]);
    }
}
