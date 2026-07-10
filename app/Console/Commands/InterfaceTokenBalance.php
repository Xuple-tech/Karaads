<?php

namespace App\Console\Commands;

use App\Services\InterfaceApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use RuntimeException;
use Throwable;

class InterfaceTokenBalance extends Command
{
    protected $signature = 'interface:token-balance
        {--fresh-token : Clear the cached Interface token before requesting a new one}
        {--source= : Override INTERFACE_SOURCE only for this command run}
        {--bank-name= : Bank name to find in bank list (example: opay)}
        {--account-number= : Account number to verify against the selected bank}
        {--transfer : Execute bank transfer test (requires --bank-name and --account-number)}
        {--amount=100 : Amount to use with --transfer}
        {--narration= : Narration to use with --transfer}';

    protected $description = 'Generate Interface API token and fetch current Interface balance';

    public function __construct(private readonly InterfaceApiService $interfaceApiService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $freshToken = (bool) $this->option('fresh-token');
        $sourceOverride = trim((string) $this->option('source'));
        $bankName = trim((string) $this->option('bank-name'));
        $accountNumber = trim((string) $this->option('account-number'));
        $runTransfer = (bool) $this->option('transfer');
        $amount = (float) $this->option('amount');
        $narration = trim((string) $this->option('narration'));

        if (($bankName === '') xor ($accountNumber === '')) {
            $this->error('Use --bank-name and --account-number together.');

            return self::FAILURE;
        }

        if ($runTransfer && ($bankName === '' || $accountNumber === '')) {
            $this->error('--transfer requires both --bank-name and --account-number.');

            return self::FAILURE;
        }

        if ($runTransfer && $amount <= 0) {
            $this->error('--amount must be greater than 0 when using --transfer.');

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
            $balancePayload = $this->interfaceApiService->balance();
            $bankListPayload = $this->interfaceApiService->bankList();
            $banks = $this->normalizeBankList($bankListPayload);

            $selectedBank = null;
            $verificationPayload = null;
            $transferPayload = null;
            $transferResponse = null;

            if ($bankName !== '') {
                $selectedBank = $this->findBankByName($banks, $bankName);
                if ($selectedBank === null) {
                    throw new RuntimeException("Bank '{$bankName}' was not found in interface bank list.");
                }

                $verificationPayload = $this->interfaceApiService->resolveAccountName(
                    $accountNumber,
                    $selectedBank['code'],
                );

                if ($runTransfer) {
                    $transferPayload = $this->interfaceApiService->buildTransferPayload(
                        $accountNumber,
                        $selectedBank['code'],
                        $amount,
                        $narration !== '' ? $narration : 'Karaads interface transfer test',
                    );

                    $transferResponse = $this->interfaceApiService->bankTransfer($transferPayload);
                }
            }
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        } catch (Throwable $exception) {
            $this->error('Failed to fetch Interface token/balance: ' . $exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Interface token and balance fetched successfully.');
        $this->newLine();
        $this->line('Request Mode: ' . ($freshToken ? 'fresh_token' : 'cached_or_new'));
        if ($sourceOverride !== '') {
            $this->line('Source Override: ' . $sourceOverride);
        }
        $this->line('Token Expires In: ' . ((int) ($tokenPayload['expires_in'] ?? 0)) . ' seconds');
        $this->line('Account Number: ' . (string) ($tokenPayload['account_number'] ?? 'n/a'));
        $this->line('Balance Status: ' . (string) ($balancePayload['status'] ?? 'n/a'));
        $this->line('Bank List Count: ' . count($banks));
        $this->newLine();

        $this->printJsonResponse('Token Response:', $tokenPayload);
        $this->newLine();
        $this->printJsonResponse('Balance Response:', $balancePayload);
        $this->newLine();
        if ($selectedBank !== null) {
            $this->printJsonResponse('Selected Bank:', $selectedBank);
            $this->newLine();
        }
        if (is_array($verificationPayload)) {
            $this->printJsonResponse('Account Verification Response:', $verificationPayload);
            $this->newLine();
        }
        if (is_array($transferPayload)) {
            $this->printJsonResponse('Transfer Payload:', $transferPayload);
            $this->newLine();
        }
        if (is_array($transferResponse)) {
            $this->printJsonResponse('Transfer Response:', $transferResponse);
        }

        return self::SUCCESS;
    }

    private function printJsonResponse(string $title, array $payload): void
    {
        $this->line($title);

        $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $this->line($encoded === false ? '{}' : $encoded);
    }

    private function normalizeBankList(array $payload): array
    {
        if (array_is_list($payload)) {
            return $payload;
        }

        foreach (['data', 'banks', 'bank_list', 'results'] as $key) {
            if (isset($payload[$key]) && is_array($payload[$key])) {
                return $payload[$key];
            }
        }

        return [];
    }

    private function findBankByName(array $banks, string $needle): ?array
    {
        foreach ($banks as $row) {
            if (! is_array($row)) {
                continue;
            }

            $name = $this->extractBankName($row);
            $code = $this->extractBankCode($row);

            if ($name === '' || $code === null) {
                continue;
            }

            if (stripos($name, $needle) !== false) {
                return [
                    'name' => $name,
                    'code' => $code,
                ];
            }
        }

        return null;
    }

    private function extractBankName(array $row): string
    {
        foreach (['bank_name', 'name', 'bank', 'bankName', 'InstitutionName'] as $key) {
            if (isset($row[$key]) && trim((string) $row[$key]) !== '') {
                return trim((string) $row[$key]);
            }
        }

        return '';
    }

    private function extractBankCode(array $row): ?string
    {
        foreach (['bank_code', 'code', 'bankCode', 'bankcode', 'sort_code', 'InstitutionCode'] as $key) {
            if (isset($row[$key]) && trim((string) $row[$key]) !== '') {
                return trim((string) $row[$key]);
            }
        }

        return null;
    }
}
