<?php

namespace App\Console\Commands;

use App\Models\EmailAccount;
use App\Services\EmailAutomationService;
use App\Services\EmailProviderManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:sync
                            {--account= : Specific account ID to sync}
                            {--all : Sync all active accounts}
                            {--limit=50 : Number of emails to fetch per account}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync emails from connected email accounts';

    protected EmailProviderManager $emailManager;
    protected EmailAutomationService $automationService;

    public function __construct(
        EmailProviderManager $emailManager,
        EmailAutomationService $automationService
    ) {
        parent::__construct();
        $this->emailManager = $emailManager;
        $this->automationService = $automationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $accountId = $this->option('account');
        $syncAll = $this->option('all');
        $limit = (int) $this->option('limit');

        if ($accountId) {
            $account = EmailAccount::find($accountId);
            if (!$account) {
                $this->error("Email account with ID {$accountId} not found.");
                return 1;
            }

            $this->syncAccount($account, $limit);
        } elseif ($syncAll) {
            $accounts = EmailAccount::active()->get();
            $this->info("Found {$accounts->count()} active email accounts to sync.");

            $progressBar = $this->output->createProgressBar($accounts->count());
            $progressBar->start();

            foreach ($accounts as $account) {
                try {
                    $this->syncAccount($account, $limit);
                    $progressBar->advance();
                } catch (\Exception $e) {
                    $this->error("Failed to sync account {$account->email_address}: {$e->getMessage()}");
                    Log::error("Email sync failed for account {$account->id}: {$e->getMessage()}");
                }
            }

            $progressBar->finish();
            $this->newLine();
            $this->info('Email sync completed for all accounts.');
        } else {
            $this->error('Please specify either --account=<id> or --all');
            return 1;
        }

        return 0;
    }

    /**
     * Sync emails for a specific account
     */
    private function syncAccount(EmailAccount $account, int $limit): void
    {
        $this->info("Syncing emails for {$account->email_address} ({$account->provider})");

        try {
            // Get last sync time
            $since = $account->last_synced_at?->format('Y-m-d H:i:s');

            // Sync emails
            $emails = $this->emailManager->syncEmails($account, $limit, $since);

            // Process emails with automation
            if ($emails->isNotEmpty()) {
                $this->automationService->processIncomingEmails($emails);
            }

            // Update last synced timestamp
            $account->update(['last_synced_at' => now()]);

            $this->info("Successfully synced {$emails->count()} emails for {$account->email_address}");

        } catch (\Exception $e) {
            $this->error("Failed to sync account {$account->email_address}: {$e->getMessage()}");
            Log::error("Email sync error for account {$account->id}: {$e->getMessage()}", [
                'account_id' => $account->id,
                'provider' => $account->provider,
                'email_address' => $account->email_address,
            ]);
            throw $e;
        }
    }
}
