<?php

namespace App\Console\Commands;

use App\Services\InterfaceApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

class InterfaceTransferTest extends Command
{
    protected $signature = 'interface:transfer-test
        {account_number : Destination account number}
        {bank_code : Destination bank code}
        {amount : Transfer amount}
        {narration : Transfer narration}
        {reference? : Transfer reference; defaults to generated value}
        {--fresh-token : Clear the cached Interface token before requesting a new one}
        {--source= : Override INTERFACE_SOURCE only for this command run}';

    protected $description = 'Run an Interface bank transfer test using the configured Laravel integration';

    public function __construct(private readonly InterfaceApiService $interfaceApiService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $accountNumber = trim((string) $this->argument('account_number'));
        $bankCode = trim((string) $this->argument('bank_code'));
        $amount = (float) $this->argument('amount');
        $narration = trim((string) $this->argument('narration'));
        $reference = trim((string) ($this->argument('reference') ?? ''));
        $freshToken = (bool) $this->option('fresh-token');
        $sourceOverride = trim((string) $this->option('source'));

        if ($accountNumber === '' || $bankCode === '' || $narration === '') {
            $this->error('account_number, bank_code, and narration are required.');

            return self::FAILURE;
        }

        if ($amount <= 0) {
            $this->error('amount must be greater than 0.');

            return self::FAILURE;
        }

        try {
            if ($sourceOverride !== '') {
                config(['services.interface.source' => $sourceOverride]);
            }

            if ($freshToken) {
                Cache::forget('interface_api_token');
            }

            $tokenPayload = $this->interfaceApiService->getToken();
            $fromAccount = trim((string) ($tokenPayload['account_number'] ?? config('services.interface.account_number')));
            $token = trim((string) ($tokenPayload['token'] ?? ''));
            $effectiveReference = $reference !== '' ? $reference : 'REF-TEST-' . now()->format('YmdHis');

            $transferPayload = $this->interfaceApiService->buildTransferPayload(
                $accountNumber,
                $bankCode,
                $amount,
                $narration,
                $effectiveReference,
            );

            $hashInput = implode('|', [
                (string) $this->normalizeAmount($amount),
                $effectiveReference,
                $fromAccount,
                $accountNumber,
                $bankCode,
            ]);

            $transferResponse = $this->interfaceApiService->bankTransfer($transferPayload);
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } catch (Throwable $exception) {
            $this->error('Interface transfer test failed: ' . $exception->getMessage());

            return self::FAILURE;
        }

        $this->line(json_encode([
            'token_response' => [
                'account_number' => $fromAccount,
                'expires_in' => $tokenPayload['expires_in'] ?? null,
                'token' => $this->maskToken($token),
            ],
            'hash_input' => $hashInput,
            'transfer_payload' => $transferPayload,
            'transfer_response' => $transferResponse,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}');

        return self::SUCCESS;
    }

    private function normalizeAmount(float $amount): string
    {
        $normalized = rtrim(rtrim(sprintf('%.8F', $amount), '0'), '.');

        return $normalized === '' ? '0' : $normalized;
    }

    private function maskToken(string $token): string
    {
        if ($token === '') {
            return '';
        }

        if (strlen($token) <= 10) {
            return str_repeat('*', strlen($token));
        }

        return substr($token, 0, 6) . str_repeat('*', strlen($token) - 10) . substr($token, -4);
    }
}
