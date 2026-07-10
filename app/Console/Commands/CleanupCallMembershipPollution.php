<?php

namespace App\Console\Commands;

use App\Models\CallMembershipCleanupAudit;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CleanupCallMembershipPollution extends Command
{
    protected $signature = 'calls:cleanup-membership-pollution {--dry-run} {--apply}';

    protected $description = 'Cleanup conversation members that were added by legacy call invite leakage';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $dryRun = !$apply || (bool) $this->option('dry-run');

        $this->info($dryRun
            ? 'Running in dry-run mode. No conversation membership will be changed.'
            : 'Running in apply mode. Conversation membership pollution will be removed.');

        $privateRemoved = $this->cleanupPrivateConversations($dryRun);
        $groupRemoved = $this->cleanupFlaggedGroups($dryRun);

        $this->info("Private conversations scanned cleanup candidates: {$privateRemoved}");
        $this->info("Flagged group conversations scanned cleanup candidates: {$groupRemoved}");

        return self::SUCCESS;
    }

    private function cleanupPrivateConversations(bool $dryRun): int
    {
        $count = 0;

        $conversations = Conversation::query()
            ->where('type', 'private')
            ->with(['participants' => function ($query) {
                $query->orderBy('conversation_user.joined_at');
            }])
            ->get();

        foreach ($conversations as $conversation) {
            $participants = $conversation->participants;
            if ($participants->count() <= 2) {
                continue;
            }

            $keepers = $participants->take(2)->pluck('id')->map(fn($id) => (string) $id)->all();
            $toRemove = $participants
                ->filter(fn($participant) => !in_array((string) $participant->id, $keepers, true));

            foreach ($toRemove as $participant) {
                $count++;
                $this->auditAndMaybeRemove(
                    conversationId: (string) $conversation->id,
                    userId: (string) $participant->id,
                    scope: 'private',
                    reason: 'private_over_capacity',
                    dryRun: $dryRun,
                    meta: [
                        'kept_user_ids' => $keepers,
                        'joined_at' => (string) ($participant->pivot?->joined_at ?? ''),
                    ],
                );
            }
        }

        return $count;
    }

    private function cleanupFlaggedGroups(bool $dryRun): int
    {
        $count = 0;

        $groupConversations = Conversation::query()
            ->where('type', 'group')
            ->with('participants')
            ->get();

        foreach ($groupConversations as $conversation) {
            $nonCallMessageExists = Message::query()
                ->where('conversation_id', (string) $conversation->id)
                ->where('message_type', '!=', 'call')
                ->exists();

            $hasCallHistory = Message::query()
                ->where('conversation_id', (string) $conversation->id)
                ->where('message_type', 'call')
                ->exists();

            if (!$hasCallHistory || !$nonCallMessageExists) {
                continue;
            }

            /** @var Collection<int,mixed> $participants */
            $participants = $conversation->participants;
            foreach ($participants as $participant) {
                $joinedAt = $participant->pivot?->joined_at;
                if (!$joinedAt || $joinedAt <= $conversation->created_at) {
                    continue;
                }

                $hasNonCallMessages = Message::query()
                    ->where('conversation_id', (string) $conversation->id)
                    ->where('user_id', (string) $participant->id)
                    ->where('message_type', '!=', 'call')
                    ->exists();

                if ($hasNonCallMessages) {
                    continue;
                }

                $hasCallRecordMessages = Message::query()
                    ->where('conversation_id', (string) $conversation->id)
                    ->where('message_type', 'call')
                    ->whereJsonContains('attachments', [['type' => 'call_record']])
                    ->exists();

                if (!$hasCallRecordMessages) {
                    continue;
                }

                $count++;
                $this->auditAndMaybeRemove(
                    conversationId: (string) $conversation->id,
                    userId: (string) $participant->id,
                    scope: 'group_flagged',
                    reason: 'legacy_call_invite_pattern',
                    dryRun: $dryRun,
                    meta: [
                        'joined_at' => (string) $joinedAt,
                        'conversation_created_at' => (string) $conversation->created_at,
                    ],
                );
            }
        }

        return $count;
    }

    /**
     * @param  array<string,mixed>  $meta
     */
    private function auditAndMaybeRemove(
        string $conversationId,
        string $userId,
        string $scope,
        string $reason,
        bool $dryRun,
        array $meta = [],
    ): void {
        DB::transaction(function () use ($conversationId, $userId, $scope, $reason, $dryRun, $meta) {
            CallMembershipCleanupAudit::query()->create([
                'id' => (string) Str::uuid(),
                'conversation_id' => $conversationId,
                'user_id' => $userId,
                'scope' => $scope,
                'reason' => $reason,
                'dry_run' => $dryRun,
                'meta' => $meta,
                'cleaned_at' => $dryRun ? null : now(),
            ]);

            if (!$dryRun) {
                DB::table('conversation_user')
                    ->where('conversation_id', $conversationId)
                    ->where('user_id', $userId)
                    ->delete();
            }
        });
    }
}
