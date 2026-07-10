<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdsAnalyticsController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;

        $campaignIds = AdCampaign::where('user_id', $userId)->pluck('id');

        $impressions = AdEvent::whereIn('campaign_id', $campaignIds)->where('event_type', 'impression')->count();
        $clicks = AdEvent::whereIn('campaign_id', $campaignIds)->where('event_type', 'click')->count();
        $spend = AdCampaign::whereIn('id', $campaignIds)->sum('spent');
        $budget = AdCampaign::whereIn('id', $campaignIds)->sum('budget_total');
        $reach = AdEvent::whereIn('campaign_id', $campaignIds)
            ->where('event_type', 'impression')
            ->whereRaw('COALESCE(viewer_user_id, fingerprint, session_id, ip_address) IS NOT NULL')
            ->selectRaw('COUNT(DISTINCT COALESCE(viewer_user_id, fingerprint, session_id, ip_address)) as aggregate')
            ->value('aggregate');

        return response()->json([
            'impressions' => $impressions,
            'clicks' => $clicks,
            'reach' => (int) $reach,
            'reach_today' => $this->reachToday($campaignIds->all()),
            'daily_reach' => $this->dailyReach($campaignIds->all()),
            'gender_breakdown' => $this->genderBreakdown($campaignIds->all(), (int) $reach),
            'spend' => (float) $spend,
            'budget_total' => (float) $budget,
            'balance_remaining' => max(0, (float) $budget - (float) $spend),
        ]);
    }

    public function show(Request $request, string $campaignId): JsonResponse
    {
        $campaign = AdCampaign::where('id', $campaignId)
            ->where('user_id', $request->user()?->id)
            ->firstOrFail();

        $events = AdEvent::where('campaign_id', $campaignId);
        $impressions = (clone $events)->where('event_type', 'impression')->count();
        $clicks = (clone $events)->where('event_type', 'click')->count();
        $reach = (clone $events)
            ->where('event_type', 'impression')
            ->whereRaw('COALESCE(viewer_user_id, fingerprint, session_id, ip_address) IS NOT NULL')
            ->selectRaw('COUNT(DISTINCT COALESCE(viewer_user_id, fingerprint, session_id, ip_address)) as aggregate')
            ->value('aggregate');
        $spend = (float) $campaign->spent;
        $ctr = $impressions > 0 ? ($clicks / $impressions) * 100 : 0;
        $cpv = $impressions > 0 ? ($spend / $impressions) : 0;

        return response()->json([
            'campaign' => $campaign,
            'metrics' => [
                'impressions' => $impressions,
                'clicks' => $clicks,
                'reach' => (int) $reach,
                'reach_today' => $this->reachToday([$campaignId]),
                'daily_reach' => $this->dailyReach([$campaignId]),
                'gender_breakdown' => $this->genderBreakdown([$campaignId], (int) $reach),
                'ctr' => $ctr,
                'spend' => $spend,
                'cost_per_view' => $cpv,
                'reach_estimate' => (int) $campaign->reach_estimate,
                'budget_total' => (float) $campaign->budget_total,
                'balance_remaining' => max(0, (float) $campaign->budget_total - $spend),
                'last_funded_at' => $campaign->last_funded_at,
            ],
        ]);
    }

    /**
     * @param  array<int, string>  $campaignIds
     * @return array<int, array{date:string,label:string,reach:int,spend:float}>
     */
    private function dailyReach(array $campaignIds): array
    {
        if ($campaignIds === []) {
            return $this->emptyDailyReach();
        }

        $start = now()->subDays(6)->startOfDay();
        $identity = $this->reachIdentityExpression();

        $rows = AdEvent::query()
            ->whereIn('campaign_id', $campaignIds)
            ->where('event_type', 'impression')
            ->where('created_at', '>=', $start)
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("DATE(created_at) as event_date, COUNT(DISTINCT {$identity}) as reach, SUM(CASE WHEN is_billable = 1 THEN billed_amount ELSE 0 END) as spend")
            ->groupByRaw('DATE(created_at)')
            ->get()
            ->keyBy('event_date');

        return collect(range(0, 6))
            ->map(function (int $offset) use ($rows, $start) {
                $date = $start->copy()->addDays($offset);
                $key = $date->toDateString();
                $row = $rows->get($key);

                return [
                    'date' => $key,
                    'label' => $date->format('D'),
                    'reach' => (int) ($row->reach ?? 0),
                    'spend' => (float) ($row->spend ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $campaignIds
     */
    private function reachToday(array $campaignIds): int
    {
        if ($campaignIds === []) {
            return 0;
        }

        $identity = $this->reachIdentityExpression();

        return (int) AdEvent::query()
            ->whereIn('campaign_id', $campaignIds)
            ->where('event_type', 'impression')
            ->whereDate('created_at', now()->toDateString())
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("COUNT(DISTINCT {$identity}) as aggregate")
            ->value('aggregate');
    }

    /**
     * @param  array<int, string>  $campaignIds
     * @return array{male:int,female:int,unknown:int,total:int}
     */
    private function genderBreakdown(array $campaignIds, int $fallbackReach): array
    {
        if ($campaignIds === []) {
            return ['male' => 0, 'female' => 0, 'unknown' => 0, 'total' => 0];
        }

        $genderColumn = $this->genderColumn();
        if (! $genderColumn) {
            return ['male' => 0, 'female' => 0, 'unknown' => $fallbackReach, 'total' => $fallbackReach];
        }

        $identity = $this->reachIdentityExpression('ad_events_v2');
        $gender = "CASE
            WHEN ad_events_v2.viewer_user_id IS NULL THEN 'unknown'
            WHEN LOWER(users.{$genderColumn}) IN ('male', 'm', 'man') THEN 'male'
            WHEN LOWER(users.{$genderColumn}) IN ('female', 'f', 'woman') THEN 'female'
            ELSE 'unknown'
        END";

        $rows = AdEvent::query()
            ->leftJoin('users', 'users.id', '=', 'ad_events_v2.viewer_user_id')
            ->whereIn('ad_events_v2.campaign_id', $campaignIds)
            ->where('ad_events_v2.event_type', 'impression')
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("{$gender} as gender_group, COUNT(DISTINCT {$identity}) as reach")
            ->groupBy('gender_group')
            ->pluck('reach', 'gender_group');

        $male = (int) ($rows['male'] ?? 0);
        $female = (int) ($rows['female'] ?? 0);
        $unknown = (int) ($rows['unknown'] ?? 0);

        return [
            'male' => $male,
            'female' => $female,
            'unknown' => $unknown,
            'total' => $male + $female + $unknown,
        ];
    }

    /**
     * @return array<int, array{date:string,label:string,reach:int,spend:float}>
     */
    private function emptyDailyReach(): array
    {
        $start = now()->subDays(6)->startOfDay();

        return collect(range(0, 6))
            ->map(fn (int $offset) => [
                'date' => $start->copy()->addDays($offset)->toDateString(),
                'label' => $start->copy()->addDays($offset)->format('D'),
                'reach' => 0,
                'spend' => 0.0,
            ])
            ->all();
    }

    private function reachIdentityExpression(string $table = 'ad_events_v2'): string
    {
        return "COALESCE({$table}.viewer_user_id, {$table}.fingerprint, {$table}.session_id, {$table}.ip_address)";
    }

    private function genderColumn(): ?string
    {
        foreach (['gender', 'sex'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                return $column;
            }
        }

        return null;
    }
}
