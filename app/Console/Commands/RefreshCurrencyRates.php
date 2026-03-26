<?php

namespace App\Console\Commands;

use App\Services\CurrencyService;
use Illuminate\Console\Command;

class RefreshCurrencyRates extends Command
{
    protected $signature = 'currency:refresh {--force : Force refresh all rates}';
    protected $description = 'Refresh all currency exchange rates from Open Exchange Rates API';

    public function __construct(private CurrencyService $currencyService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting currency rate refresh...');

        try {
            $refreshed = $this->currencyService->refreshAllRates();
            $this->info("✓ Successfully refreshed {$refreshed} currency rates");
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("✗ Failed to refresh currency rates: {$e->getMessage()}");
            return self::FAILURE;
        }
    }
}
