<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportUserBalancesFromCsv extends Command
{
    protected $signature = 'app:import-user-balances
                            {csv_path : Absolute path or repository-relative CSV path}
                            {--dry-run : Parse and report without writing balances}
                            {--chunk=1000 : Number of CSV rows processed per lookup batch}
                            {--imported-only=1 : Restrict updates to must_set_password imported users (1|0)}';

    protected $description = 'Backfill imported user wallet balances from a CSV file using email matching only.';

    public function handle(): int
    {
        $csvPath = $this->resolveCsvPath((string) $this->argument('csv_path'));
        $chunkSize = max(1, (int) $this->option('chunk'));
        $dryRun = (bool) $this->option('dry-run');
        $importedOnly = $this->parseBooleanOption($this->option('imported-only'), true);

        if ($csvPath === '' || ! is_file($csvPath) || ! is_readable($csvPath)) {
            $this->error('CSV file is missing or unreadable: ' . $csvPath);

            return self::FAILURE;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->error('Unable to open CSV file: ' . $csvPath);

            return self::FAILURE;
        }

        $summary = [
            'total_rows' => 0,
            'invalid_email' => 0,
            'invalid_balance' => 0,
            'unmatched_users' => 0,
            'skipped_downgrade' => 0,
            'updated_wallets' => 0,
            'wallets_created' => 0,
            'dry_run_updates' => 0,
        ];

        try {
            $headers = fgetcsv($handle);
            if ($headers === false) {
                $this->error('CSV is empty.');

                return self::FAILURE;
            }

            $headerIndexes = [];
            foreach ($headers as $index => $header) {
                $normalized = $this->normalizeHeader((string) $header);
                if ($normalized !== '' && ! isset($headerIndexes[$normalized])) {
                    $headerIndexes[$normalized] = $index;
                }
            }

            $emailIndex = $headerIndexes['email'] ?? null;
            $balanceIndex = $headerIndexes['currentbalance'] ?? null;

            if ($emailIndex === null) {
                $this->error('Missing required email column.');

                return self::FAILURE;
            }

            if ($balanceIndex === null) {
                $this->error('Missing required balance column (expected currentBalance/current_balance/currentbalance).');

                return self::FAILURE;
            }

            $batch = [];

            while (($row = fgetcsv($handle)) !== false) {
                if ($row === [null] || count(array_filter($row, static fn ($value) => trim((string) $value) !== '')) === 0) {
                    continue;
                }

                $summary['total_rows']++;

                $email = strtolower(trim((string) ($row[$emailIndex] ?? '')));
                if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $summary['invalid_email']++;
                    continue;
                }

                $incomingBalance = $this->parseBalance($row[$balanceIndex] ?? null);
                if ($incomingBalance === null) {
                    $summary['invalid_balance']++;
                    continue;
                }

                $batch[] = [
                    'email' => $email,
                    'balance' => $incomingBalance,
                ];

                if (count($batch) >= $chunkSize) {
                    $this->processBatch($batch, $importedOnly, $dryRun, $summary);
                    $batch = [];
                }
            }

            if ($batch !== []) {
                $this->processBatch($batch, $importedOnly, $dryRun, $summary);
            }
        } finally {
            fclose($handle);
        }

        $this->info('Balance import summary');
        foreach ($summary as $label => $value) {
            $this->line($label . ': ' . $value);
        }

        if ($dryRun) {
            $this->comment('Dry-run mode: no balances were written.');
        }

        return self::SUCCESS;
    }

    /**
     * @param array<int, array{email:string,balance:float}> $batch
     * @param array<string, int> $summary
     */
    private function processBatch(array $batch, bool $importedOnly, bool $dryRun, array &$summary): void
    {
        $emails = array_values(array_unique(array_column($batch, 'email')));

        $userQuery = User::query()->whereIn('email', $emails);
        if ($importedOnly) {
            $userQuery->where('must_set_password', true);
        }

        $users = $userQuery->get(['id', 'email']);
        $usersByEmail = [];
        foreach ($users as $user) {
            if (! empty($user->email)) {
                $usersByEmail[strtolower((string) $user->email)] = $user;
            }
        }

        $walletsByUserId = UserWallet::query()
            ->whereIn('user_id', $users->pluck('id'))
            ->get()
            ->keyBy('user_id');

        foreach ($batch as $row) {
            $user = $usersByEmail[$row['email']] ?? null;
            if ($user === null) {
                $summary['unmatched_users']++;
                continue;
            }

            $incomingBalance = (float) $row['balance'];
            /** @var UserWallet|null $wallet */
            $wallet = $walletsByUserId->get($user->id);
            $currentBalance = $wallet ? (float) $wallet->balance : 0.0;

            if ($this->isBalanceDowngrade($incomingBalance, $currentBalance)) {
                $summary['skipped_downgrade']++;
                continue;
            }

            $walletMissing = $wallet === null;
            $balanceChanged = abs($currentBalance - $incomingBalance) > 0.0000001;
            if (! $walletMissing && ! $balanceChanged) {
                continue;
            }

            if ($dryRun) {
                if ($walletMissing) {
                    $summary['wallets_created']++;
                }
                $summary['dry_run_updates']++;
                continue;
            }

            if ($walletMissing) {
                $wallet = $this->createDefaultWallet($user->id, $incomingBalance);
                $walletsByUserId->put($user->id, $wallet);
                $summary['wallets_created']++;
                $summary['updated_wallets']++;
                continue;
            }

            $wallet->balance = $incomingBalance;
            $wallet->save();
            $summary['updated_wallets']++;
        }
    }

    private function createDefaultWallet(string $userId, float $balance): UserWallet
    {
        return UserWallet::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'balance' => $balance,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'pending_withdrawal' => 0,
            'currency' => 'NGN',
            'min_payout_amount' => 10,
            'is_active' => true,
        ]);
    }

    private function parseBalance(mixed $rawBalance): ?float
    {
        if ($rawBalance === null || trim((string) $rawBalance) === '') {
            return null;
        }

        $normalized = preg_replace('/[^0-9.\-]/', '', (string) $rawBalance);
        if ($normalized === null || $normalized === '' || ! is_numeric($normalized)) {
            return null;
        }

        return (float) $normalized;
    }

    private function isBalanceDowngrade(float $incomingBalance, float $currentBalance): bool
    {
        return $incomingBalance <= 0 && $currentBalance > 0;
    }

    private function normalizeHeader(string $header): string
    {
        return strtolower(preg_replace('/[^a-z0-9]/i', '', trim($header)) ?? '');
    }

    private function resolveCsvPath(string $path): string
    {
        if ($path === '') {
            return '';
        }

        if ($this->isAbsolutePath($path)) {
            return $path;
        }

        return base_path($path);
    }

    private function isAbsolutePath(string $path): bool
    {
        if (str_starts_with($path, '/')) {
            return true;
        }

        return preg_match('/^[A-Za-z]:[\\\\\\/]/', $path) === 1;
    }

    private function parseBooleanOption(mixed $value, bool $default): bool
    {
        if ($value === null || $value === '') {
            return $default;
        }

        if (is_bool($value)) {
            return $value;
        }

        $normalized = strtolower(trim((string) $value));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }

        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }

        return $default;
    }
}
