<?php

namespace App\Console\Commands;

use App\Models\StripeWebhookEvent;
use App\Services\StripeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessStripeWebhooks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:process-webhooks {--max=10}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process unprocessed Stripe webhook events';

    /**
     * Execute the console command.
     */
    public function handle(StripeService $stripeService)
    {
        $max = $this->option('max');
        $unprocessed = StripeWebhookEvent::unprocessed()
            ->orderBy('created_at')
            ->limit($max)
            ->get();

        if ($unprocessed->isEmpty()) {
            $this->info('No unprocessed webhook events.');
            return 0;
        }

        $this->info("Processing {$unprocessed->count()} webhook events...");

        $successful = 0;
        $failed = 0;

        foreach ($unprocessed as $event) {
            try {
                $stripeService->processWebhookEvent($event->payload);
                $event->markProcessed();
                $successful++;
                $this->line("  ✓ Processed: {$event->event_type}");
            } catch (\Exception $e) {
                $event->markFailed($e->getMessage());
                $failed++;
                $this->error("  ✗ Failed: {$event->event_type} - " . $e->getMessage());
                Log::error("Webhook processing error for {$event->stripe_event_id}: " . $e->getMessage());
            }
        }

        $this->info("✓ Processing complete: {$successful} succeeded, {$failed} failed");
        return $failed > 0 ? 1 : 0;
    }
}
