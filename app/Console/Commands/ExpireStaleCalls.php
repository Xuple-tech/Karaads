<?php

namespace App\Console\Commands;

use App\Domain\Calls\CallSessionService;
use App\Models\CallSession;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Throwable;

class ExpireStaleCalls extends Command
{
    protected $signature = 'calls:expire-stale {--dry-run : Print stale sessions without ending them}';

    protected $description = 'Expire stale ringing and accepted call sessions';

    public function __construct(private readonly CallSessionService $calls)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $ringingTimeoutSeconds = max(10, (int) config('calls.ringing_timeout_seconds', 60));
        $acceptedTimeoutSeconds = max(30, (int) config('calls.inactive_accepted_timeout_seconds', 120));

        $ringingCutoff = now()->subSeconds($ringingTimeoutSeconds);
        $acceptedCutoff = now()->subSeconds($acceptedTimeoutSeconds);

        $stats = [
            'ringing' => 0,
            'accepted' => 0,
            'ended' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        CallSession::query()
            ->whereIn('status', ['ringing', 'accepted'])
            ->chunkById(100, function ($sessions) use (
                $acceptedCutoff,
                $dryRun,
                $ringingCutoff,
                &$stats
            ) {
                /** @var CallSession $session */
                foreach ($sessions as $session) {
                    $status = (string) $session->status;
                    if ($status === 'ringing') {
                        if (!$session->created_at || $session->created_at->greaterThan($ringingCutoff)) {
                            $stats['skipped']++;
                            continue;
                        }

                        $stats['ringing']++;
                    } elseif ($status === 'accepted') {
                        $activityAt = $this->resolveActivityTimestamp($session);
                        if (!$activityAt || $activityAt->greaterThan($acceptedCutoff)) {
                            $stats['skipped']++;
                            continue;
                        }

                        $stats['accepted']++;
                    } else {
                        $stats['skipped']++;
                        continue;
                    }

                    if ($dryRun) {
                        $this->line("stale_call {$session->id} status={$status} initiator={$session->initiator_id}");
                        continue;
                    }

                    try {
                        $this->calls->end((string) $session->id, (string) $session->initiator_id);
                        $stats['ended']++;
                    } catch (Throwable $e) {
                        $stats['failed']++;
                        $this->warn("failed_to_end {$session->id} status={$status} error={$e->getMessage()}");
                    }
                }
            }, 'id');

        $this->info(
            'calls:expire-stale complete ' .
            "ringing={$stats['ringing']} accepted={$stats['accepted']} " .
            "ended={$stats['ended']} skipped={$stats['skipped']} failed={$stats['failed']} " .
            'dry_run=' . ($dryRun ? 'true' : 'false')
        );

        return self::SUCCESS;
    }

    private function resolveActivityTimestamp(CallSession $session): ?Carbon
    {
        return $session->last_activity_at
            ?? $session->accepted_at
            ?? $session->updated_at
            ?? $session->created_at;
    }
}
