<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessUsersCsvChunk implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public function __construct(
        public readonly string $path,
        public readonly ?string $requestedByUserId = null,
        public readonly ?int $chunkIndex = null
    ) {
    }

    public function handle(): void
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($this->path)) {
            Log::warning('Admin user import chunk file not found.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
                'chunk_index' => $this->chunkIndex,
            ]);

            return;
        }

        $fullPath = $disk->path($this->path);
        $handle = fopen($fullPath, 'r');

        if ($handle === false) {
            Log::error('Unable to open admin user import CSV chunk.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
                'chunk_index' => $this->chunkIndex,
            ]);

            $disk->delete($this->path);

            return;
        }

        try {
            $headers = fgetcsv($handle);

            if ($headers === false) {
                Log::warning('Admin user import CSV chunk is empty.', [
                    'path' => $this->path,
                    'requested_by_user_id' => $this->requestedByUserId,
                    'chunk_index' => $this->chunkIndex,
                ]);

                return;
            }

            $created = 0;
            $skippedExisting = 0;
            $skippedInvalid = 0;
            $updatedWalletByEmail = 0;
            $skippedExistingByPhoneOnly = 0;
            $skippedExistingNoBalanceInCsv = 0;
            $skippedExistingInvalidBalanceInCsv = 0;
            $skippedExistingBalanceDowngrade = 0;
            $updatedWalletForCreatedUsers = 0;
            $rows = [];
            $emails = [];
            $phones = [];

            while (($row = fgetcsv($handle)) !== false) {
                if ($row === [null] || count(array_filter($row, static fn ($value) => trim((string) $value) !== '')) === 0) {
                    continue;
                }

                $record = [];
                foreach ($headers as $index => $header) {
                    $record[strtolower(trim((string) $header))] = isset($row[$index]) ? trim((string) $row[$index]) : null;
                }

                $email = $record['email'] ?? null;
                $phone = $record['phone'] ?? null;
                $normalizedEmail = ($email !== null && $email !== '') ? strtolower(trim((string) $email)) : null;
                $normalizedPhone = ($phone !== null && $phone !== '') ? trim((string) $phone) : null;

                if (($normalizedEmail === null || $normalizedEmail === '') && ($normalizedPhone === null || $normalizedPhone === '')) {
                    $skippedInvalid++;
                    continue;
                }

                if ($normalizedEmail !== null && $normalizedEmail !== '' && ! filter_var($normalizedEmail, FILTER_VALIDATE_EMAIL)) {
                    $skippedInvalid++;
                    continue;
                }

                if ($normalizedEmail) {
                    $emails[$normalizedEmail] = true;
                }
                if ($normalizedPhone) {
                    $phones[$normalizedPhone] = true;
                }

                $name = $record['name'] ?? null;
                $createdAt = $record['createdat'] ?? null;
                $rows[] = [
                    'name' => $name !== '' ? $name : 'Imported User',
                    'email' => $normalizedEmail !== '' ? $normalizedEmail : null,
                    'phone' => $normalizedPhone !== '' ? $normalizedPhone : null,
                    'created_at' => $createdAt,
                    'current_balance' => $record['currentbalance'] ?? null,
                ];
            }

            $existingUsers = User::query()
                ->when($emails !== [], fn ($query) => $query->orWhereIn('email', array_keys($emails)))
                ->when($phones !== [], fn ($query) => $query->orWhereIn('phone', array_keys($phones)))
                ->get(['id', 'email', 'phone'])
                ->keyBy('id');

            $existingByEmail = [];
            $existingByPhone = [];
            foreach ($existingUsers as $existing) {
                if (! empty($existing->email)) {
                    $existingByEmail[strtolower($existing->email)] = $existing;
                }
                if (! empty($existing->phone)) {
                    $existingByPhone[$existing->phone] = $existing;
                }
            }

            foreach ($rows as $row) {
                $normalizedEmail = $row['email'];
                $normalizedPhone = $row['phone'];

                if ($normalizedEmail && isset($existingByEmail[$normalizedEmail])) {
                    $existingUser = $existingByEmail[$normalizedEmail];
                    $rawBalance = $row['current_balance'];
                    $incomingBalance = $this->parseBalance($rawBalance);

                    if ($incomingBalance !== null) {
                        $existingWallet = UserWallet::firstOrNew(['user_id' => $existingUser->id]);
                        $currentBalance = $existingWallet->exists ? (float) $existingWallet->balance : 0.0;

                        if ($this->isBalanceDowngrade($incomingBalance, $currentBalance)) {
                            $skippedExistingBalanceDowngrade++;
                            continue;
                        }

                        $existingWallet->balance = $incomingBalance;
                        $existingWallet->save();
                        $updatedWalletByEmail++;
                        continue;
                    }

                    if ($rawBalance !== null && $rawBalance !== '') {
                        $skippedExistingInvalidBalanceInCsv++;
                        continue;
                    }

                    $skippedExistingNoBalanceInCsv++;
                    continue;
                }

                if (($normalizedPhone && isset($existingByPhone[$normalizedPhone])) || ($normalizedEmail && isset($existingByEmail[$normalizedEmail]))) {
                    if (! $normalizedEmail && $normalizedPhone && isset($existingByPhone[$normalizedPhone])) {
                        $skippedExistingByPhoneOnly++;
                    }
                    $skippedExisting++;
                    continue;
                }

                $userData = [
                    'name' => $row['name'],
                    'email' => $normalizedEmail,
                    'phone' => $normalizedPhone,
                    'status' => 'active',
                    'password' => Str::random(24),
                    'must_set_password' => true,
                    'email_verified_at' => null,
                ];

                if ($row['created_at'] !== null && $row['created_at'] !== '') {
                    try {
                        $userData['created_at'] = Carbon::parse((string) $row['created_at']);
                    } catch (\Throwable) {
                        // Keep default timestamp when source value is not parseable.
                    }
                }

                $createdUser = User::create($userData);
                if ($normalizedEmail) {
                    $existingByEmail[$normalizedEmail] = $createdUser;
                }
                if ($normalizedPhone) {
                    $existingByPhone[$normalizedPhone] = $createdUser;
                }

                $incomingBalance = $this->parseBalance($row['current_balance']);
                if ($incomingBalance !== null) {
                    $createdWallet = UserWallet::firstOrNew(['user_id' => $createdUser->id]);
                    $currentBalance = $createdWallet->exists ? (float) $createdWallet->balance : 0.0;

                    if (! $this->isBalanceDowngrade($incomingBalance, $currentBalance)) {
                        $createdWallet->balance = $incomingBalance;
                        $createdWallet->save();
                        $updatedWalletForCreatedUsers++;
                    }
                }

                $created++;
            }

            Log::info('Admin user CSV import chunk finished.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
                'chunk_index' => $this->chunkIndex,
                'created' => $created,
                'updated_wallet_by_email' => $updatedWalletByEmail,
                'skipped_existing' => $skippedExisting,
                'skipped_existing_by_phone_only' => $skippedExistingByPhoneOnly,
                'skipped_existing_no_balance_in_csv' => $skippedExistingNoBalanceInCsv,
                'skipped_existing_invalid_balance_in_csv' => $skippedExistingInvalidBalanceInCsv,
                'skipped_existing_balance_downgrade' => $skippedExistingBalanceDowngrade,
                'updated_wallet_for_created_users' => $updatedWalletForCreatedUsers,
                'skipped_invalid' => $skippedInvalid,
            ]);
        } finally {
            fclose($handle);
            $disk->delete($this->path);
        }
    }

    private function parseBalance(mixed $rawBalance): ?float
    {
        if ($rawBalance === null || $rawBalance === '') {
            return null;
        }

        $normalizedBalance = preg_replace('/[^0-9.\-]/', '', (string) $rawBalance);
        if ($normalizedBalance === null || $normalizedBalance === '' || ! is_numeric($normalizedBalance)) {
            return null;
        }

        return (float) $normalizedBalance;
    }

    private function isBalanceDowngrade(float $incomingBalance, float $currentBalance): bool
    {
        return $incomingBalance <= 0 && $currentBalance > 0;
    }
}
