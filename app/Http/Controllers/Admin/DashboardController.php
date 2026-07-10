<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Api\HomeEngagementController;
use App\Http\Controllers\Controller;
use App\Models\AppDownloadTrack;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdPlacement;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\AdsV2\AdProviderAdapter;
use App\Models\AdsV2\AdWalletLedger;
use App\Models\Earning;
use App\Models\LiveStream;
use App\Models\Post;
use App\Models\User;
use App\Models\VerificationRequest;
use App\Models\WithdrawalRequest;
use App\Support\UserPresence;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use App\Services\InterfaceApiService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private const MONETIZATION_FEE_AMOUNT = 5000.00;

    public function index(Request $request)
    {
        // Today's date range
        $today = now()->toDateString();
        $rewardedWithdrawals = $this->rewardedWithdrawalRecords();
        $userSearch = trim((string) $request->query('user_search', ''));
        $badgePaymentsOnly = $request->boolean('badge_payments');

        $dashboardUsers = collect();
        if ($userSearch !== '' || $badgePaymentsOnly) {
            $dashboardUsers = User::query()
                ->select(['id', 'name', 'email', 'username', 'status', 'kara_verified_at', 'created_at'])
                ->addSelect([
                    'kara_badge_payment_status' => VerificationRequest::query()
                        ->select('payment_status')
                        ->whereColumn('user_id', 'users.id')
                        ->whereNotNull('payment_status')
                        ->latest()
                        ->limit(1),
                    'kara_badge_payment_amount' => VerificationRequest::query()
                        ->select('payment_amount')
                        ->whereColumn('user_id', 'users.id')
                        ->where('payment_status', 'paid')
                        ->latest()
                        ->limit(1),
                    'kara_badge_paid_at' => VerificationRequest::query()
                        ->select('updated_at')
                        ->whereColumn('user_id', 'users.id')
                        ->where('payment_status', 'paid')
                        ->latest()
                        ->limit(1),
                ])
                ->where(function ($query) use ($userSearch) {
                    $query->where('name', 'like', "%{$userSearch}%")
                        ->orWhere('email', 'like', "%{$userSearch}%")
                        ->orWhere('username', 'like', "%{$userSearch}%");
                })
                ->when($badgePaymentsOnly, function ($query) {
                    $query->whereHas('verificationRequests', function ($requestQuery) {
                        $requestQuery->where('payment_status', 'paid');
                    });
                })
                ->latest()
                ->limit($badgePaymentsOnly ? 25 : 8)
                ->get();
        }

        $pendingAdCampaigns = AdCampaign::query()
            ->with('user:id,name,email,username')
            ->whereNotNull('last_funded_at')
            ->where('status', 'in_review')
            ->latest()
            ->limit(5)
            ->get(['id', 'user_id', 'name', 'status', 'budget_total', 'currency', 'post_id', 'last_funded_at', 'created_at']);

        $pendingAdCreatives = AdCreative::query()
            ->with('campaign:id,name,status,last_funded_at,user_id')
            ->where(function ($query) {
                $query->where('status', 'in_review')
                    ->orWhere(function ($draftQuery) {
                        $draftQuery->whereIn('status', ['draft', 'rejected'])
                            ->whereHas('campaign', fn ($campaignQuery) => $campaignQuery
                                ->whereNotNull('last_funded_at')
                                ->whereIn('status', ['approved', 'active']));
                    });
            })
            ->latest()
            ->limit(5)
            ->get(['id', 'campaign_id', 'title', 'status', 'media_type', 'created_at']);

        // Platform Stats
        $platformStats = [
            'totalUsers' => User::count(),
            'totalCreators' => User::has('posts')->count(),
            'totalPosts' => Post::count(),
            'totalAds' => AdCreative::count(),
            'totalAdProviders' => AdProviderAdapter::count(),
            'totalActiveCampaigns' => AdCampaign::where('status', 'active')->count(),
            'totalAdSpaces' => AdPlacement::where('status', true)->count(),
            'totalPendingWithdrawals' => WithdrawalRequest::where('status', 'pending')->count()
                + $rewardedWithdrawals->where('status', 'pending')->count(),
            'totalAppDownloads' => AppDownloadTrack::count(),
        ];

        // Revenue Stats
        $badgeRevenue = VerificationRequest::where('payment_status', 'paid')->sum('payment_amount');
        $monetizationRevenue = (clone $this->monetizationPaidUsersQuery())
            ->get(['monetization_payment_amount'])
            ->sum(fn (User $user) => (float) ($user->monetization_payment_amount ?? self::MONETIZATION_FEE_AMOUNT));
        $adWalletFunding = AdPayment::whereIn('status', ['successful', 'success', 'paid'])->sum('amount');
        $userEarnings = Earning::sum('amount');
        $completedManualWithdrawals = WithdrawalRequest::where('status', 'completed');
        $completedRewardedWithdrawals = $rewardedWithdrawals->filter(fn (array $withdrawal) => in_array((string) ($withdrawal['status'] ?? ''), ['completed', 'success'], true));

        $totalWithdrawn = (clone $completedManualWithdrawals)->sum('amount')
            + $completedRewardedWithdrawals->sum('amount');
        $pendingWithdrawal = WithdrawalRequest::where('status', 'pending')->sum('amount')
            + $rewardedWithdrawals->where('status', 'pending')->sum('amount');
        $completedWithdrawalCount = (clone $completedManualWithdrawals)->count() + $completedRewardedWithdrawals->count();
        $requestedWithdrawalCount = WithdrawalRequest::count() + $rewardedWithdrawals->count();

        $revenueStats = [
            'totalPlatformRevenue' => AdEvent::where('is_billable', true)->sum('billed_amount'),
            'totalCreatorEarnings' => AdPayoutItem::where('source', 'creator')->sum('amount'),
            'totalViewerEarnings' => AdPayoutItem::where('source', 'rewarded')->sum('amount'),
            'totalWithdrawn' => $totalWithdrawn,
            'pendingWithdrawal' => $pendingWithdrawal,
            'badgeRevenue' => $badgeRevenue,
            'monetizationRevenue' => $monetizationRevenue,
            'adWalletFunding' => $adWalletFunding,
            'userEarnings' => $userEarnings,
            'allTransactionValue' => $badgeRevenue + $monetizationRevenue + $adWalletFunding + abs((float) $userEarnings),
        ];

        $monetizationPayers = $this->monetizationPaidUsersQuery()
            ->select([
                'id',
                'name',
                'email',
                'username',
                'monetization_activated_at',
                'monetization_paid_at',
                'monetization_payment_provider',
                'monetization_payment_reference',
                'monetization_payment_status',
                'monetization_payment_amount',
            ])
            ->with('wallet:id,user_id,balance,currency')
            ->latest('monetization_paid_at')
            ->limit(12)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'amount' => (float) ($user->monetization_payment_amount ?? self::MONETIZATION_FEE_AMOUNT),
                'provider' => $user->monetization_payment_provider ?: 'legacy_activation',
                'reference' => $user->monetization_payment_reference,
                'status' => $user->monetization_payment_status ?: 'paid',
                'wallet_balance' => (float) ($user->wallet?->balance ?? 0),
                'wallet_currency' => $user->wallet?->currency ?: 'NGN',
                'paid_at' => $user->monetization_paid_at?->toIso8601String(),
                'activated_at' => $user->monetization_activated_at?->toIso8601String(),
            ]);

        $financialTransactions = [
            'summary' => [
                'badge_payments' => [
                    'count' => VerificationRequest::where('payment_status', 'paid')->count(),
                    'amount' => (float) $badgeRevenue,
                ],
                'monetization_payments' => [
                    'count' => (clone $this->monetizationPaidUsersQuery())->count(),
                    'amount' => (float) $monetizationRevenue,
                ],
                'ad_wallet_payments' => [
                    'count' => AdPayment::whereIn('status', ['successful', 'success', 'paid'])->count(),
                    'amount' => (float) $adWalletFunding,
                ],
                'user_earnings' => [
                    'count' => Earning::count(),
                    'amount' => (float) $userEarnings,
                ],
                'wallet_ledger' => [
                    'count' => AdWalletLedger::count(),
                    'amount' => (float) AdWalletLedger::sum('amount'),
                ],
                'withdrawals' => [
                    'count' => $completedWithdrawalCount,
                    'requested_count' => $requestedWithdrawalCount,
                    'amount' => (float) (WithdrawalRequest::sum('amount') + $rewardedWithdrawals->sum('amount')),
                    'completed_amount' => (float) $totalWithdrawn,
                    'pending_amount' => (float) $pendingWithdrawal,
                ],
            ],
            'recent' => $this->recentFinancialTransactions($rewardedWithdrawals),
            'monetization_payers' => $monetizationPayers,
        ];

        // Daily Stats
        $dailyStats = [
            'newUsers' => User::whereDate('created_at', $today)->count(),
            'newPosts' => Post::whereDate('created_at', $today)->count(),
            'adImpressions' => AdEvent::query()
                ->whereDate('created_at', $today)
                ->where('event_type', 'impression')
                ->count(),
            'adClicks' => AdEvent::query()
                ->whereDate('created_at', $today)
                ->where('event_type', 'click')
                ->count(),
            'dailyRevenue' => AdEvent::query()
                ->whereDate('created_at', $today)
                ->where('is_billable', true)
                ->sum('billed_amount'),
            'appDownloadsToday' => AppDownloadTrack::whereDate('created_at', $today)->count(),
            'dailyWithdrawals' => WithdrawalRequest::whereDate('created_at', $today)
                ->where('status', 'completed')
                ->sum('amount')
                + $rewardedWithdrawals
                    ->where('status', 'completed')
                    ->filter(fn (array $withdrawal) => str_starts_with((string) $withdrawal['created_at'], $today))
                    ->sum('amount'),
        ];

        // Recent Activities
        $recentActivities = [
            'recentWithdrawals' => WithdrawalRequest::with('user')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn (WithdrawalRequest $withdrawal) => [
                    'user' => $withdrawal->user,
                    'amount' => (float) $withdrawal->amount,
                    'status' => $withdrawal->status,
                    'created_at' => optional($withdrawal->created_at)?->toISOString(),
                    'source' => 'manual',
                ])
                ->concat($rewardedWithdrawals->take(10))
                ->sortByDesc('created_at')
                ->take(10)
                ->values(),
            'recentEarnings' => AdWalletLedger::with('wallet.account')
                ->latest()
                ->limit(10)
                ->get(),
            'recentAds' => AdCreative::with('campaign')
                ->latest()
                ->limit(10)
                ->get(),
            'recentPosts' => Post::with('user')
                ->latest()
                ->limit(10)
                ->get(),
        ];

        // Chart Data
        $revenueChartData = $this->getRevenueChartData();
        $userGrowthChartData = $this->getUserGrowthChartData();
        $adPerformanceChartData = $this->getAdPerformanceChartData();

        // Top Performers
        $topCreators = User::withSum('earnings', 'amount')
            ->has('earnings')
            ->orderBy('earnings_sum_amount', 'desc')
            ->limit(10)
            ->get();

        $topPosts = Post::with(['user', 'monetization'])
            ->has('monetization')
            ->withSum('earnings', 'amount')
            ->orderBy('earnings_sum_amount', 'desc')
            ->limit(10)
            ->get();

        $topAds = AdCreative::with('campaign')
            ->withCount('deliveries')
            ->orderBy('deliveries_count', 'desc')
            ->limit(10)
            ->get();

        $userActivityReport = $this->userActivityReport();
        $userLocationReport = $this->userLocationReport();
        $activeUsers = collect($userActivityReport['online_users'])->take(12)->values();
        $monthlyPlatformReport = $this->monthlyPlatformReport();

        $liveStreams = LiveStream::query()
            ->with('user:id,name,email,username,avatar')
            ->where('status', 'live')
            ->latest('last_activity_at')
            ->limit(8)
            ->get(['id', 'user_id', 'title', 'status', 'viewer_count', 'last_activity_at', 'started_at']);

        $recentEngagement = HomeEngagementController::recentEngagement(30);

        // Fetch kwatibank interface account balance
        $interfaceBalance = null;
        try {
            $interfaceService = app(InterfaceApiService::class);
            $interfaceBalance = Cache::remember('admin_interface_balance', 60, fn () => $interfaceService->balance());
        } catch (\Throwable $e) {
            // silently fail — balance unavailable
        }

        return Inertia::render('Admin/Dashboard/Index', [
            'platformStats' => $platformStats,
            'revenueStats' => $revenueStats,
            'financialTransactions' => $financialTransactions,
            'dailyStats' => $dailyStats,
            'recentActivities' => $recentActivities,
            'revenueChartData' => $revenueChartData,
            'userGrowthChartData' => $userGrowthChartData,
            'adPerformanceChartData' => $adPerformanceChartData,
            'topCreators' => $topCreators,
            'topPosts' => $topPosts,
            'topAds' => $topAds,
            'dashboardUsers' => $dashboardUsers,
            'pendingAdCampaigns' => $pendingAdCampaigns,
            'pendingAdCreatives' => $pendingAdCreatives,
            'activeUsers' => $activeUsers,
            'userActivityReport' => $userActivityReport,
            'userLocationReport' => $userLocationReport,
            'monthlyPlatformReport' => $monthlyPlatformReport,
            'liveStreams' => $liveStreams,
            'recentEngagement' => $recentEngagement,
            'filters' => [
                'user_search' => $userSearch,
                'badge_payments' => $badgePaymentsOnly,
            ],
            'interfaceBalance' => $interfaceBalance,
        ]);
    }

    private function monetizationPaidUsersQuery()
    {
        return User::query()
            ->where(function ($query) {
                $query->where('monetization_payment_status', 'paid')
                    ->orWhereNotNull('monetization_activated_at');
            });
    }

    private function rewardedWithdrawalRecords()
    {
        return AdPayoutItem::query()
            ->with('user')
            ->where('source', 'rewarded')
            ->whereNotNull('meta->withdrawal_reference')
            ->get()
            ->groupBy(fn (AdPayoutItem $item) => (string) ((is_array($item->meta) ? ($item->meta['withdrawal_reference'] ?? '') : '') ?: ''))
            ->filter(fn ($items, $reference) => $reference !== '')
            ->map(function ($items, string $reference) {
                /** @var AdPayoutItem|null $latest */
                $latest = $items->sortByDesc('updated_at')->first();
                $meta = $latest && is_array($latest->meta) ? $latest->meta : [];
                $transfer = is_array($meta['withdrawal_response'] ?? null) ? $meta['withdrawal_response'] : [];

                $requestedAt = (string) ($meta['withdrawal_requested_at'] ?? '');

                return [
                    'reference' => $reference,
                    'user' => $latest?->user,
                    'amount' => round((float) ($meta['withdrawal_gross_amount'] ?? $items->sum('amount')), 2),
                    'status' => $this->rewardedWithdrawalStatus($latest?->status, $meta, $transfer),
                    'created_at' => $requestedAt ?: $items->sortBy('created_at')->first()?->created_at?->toISOString(),
                    'source' => 'rewarded',
                ];
            })
            ->values();
    }

    private function rewardedWithdrawalStatus(?string $itemStatus, array $meta, array $transfer): string
    {
        $withdrawalStatus = strtolower((string) ($meta['withdrawal_status'] ?? ''));
        if (in_array($withdrawalStatus, ['returned', 'failed', 'cancelled'], true)
            || filter_var($meta['withdrawal_failed'] ?? false, FILTER_VALIDATE_BOOLEAN)
        ) {
            return 'failed';
        }
        if (in_array($withdrawalStatus, ['success', 'completed'], true)) {
            return 'completed';
        }

        $tsqStatus = strtolower((string) ($meta['tsq_status'] ?? ''));
        if (in_array($tsqStatus, ['success', 'failed', 'pending'], true)) {
            return $tsqStatus === 'success' ? 'completed' : $tsqStatus;
        }

        $transferStatus = strtolower((string) ($transfer['status'] ?? ''));
        $transferCode = (int) ($transfer['status_code'] ?? 0);
        $transferMessage = strtolower((string) ($transfer['message'] ?? ''));

        if ($transferStatus === 'success' || $transferCode === 200 || str_contains($transferMessage, 'completed')) {
            return 'completed';
        }

        if (in_array($transferStatus, ['failed', 'error'], true)
            || str_contains($transferMessage, 'failed')
            || str_contains($transferMessage, 'unavailable')
        ) {
            return 'failed';
        }

        return $itemStatus === 'processing' ? 'pending' : ($itemStatus ?: 'pending');
    }

    private function userActivityReport(): array
    {
        $presence = app(UserPresence::class);
        $cutoff = now()->subDay();
        $users = User::query()
            ->select(['id', 'name', 'email', 'username', 'avatar', 'status', 'last_login_at', 'updated_at'])
            ->latest('updated_at')
            ->limit(2000)
            ->get();

        $mapped = $users->map(function (User $user) use ($presence) {
            $lastSeenAt = $presence->lastSeenAt($user);
            $lastLoginAt = $user->last_login_at;
            $lastActivityAt = $lastSeenAt && (! $lastLoginAt || $lastSeenAt->greaterThan($lastLoginAt))
                ? $lastSeenAt
                : $lastLoginAt;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'status' => $user->status,
                'is_online' => $presence->isOnline($user),
                'last_seen_at' => $lastSeenAt?->toIso8601String(),
                'last_login_at' => $lastLoginAt?->toIso8601String(),
                'last_activity_at' => $lastActivityAt?->toIso8601String(),
            ];
        });

        $onlineUsers = $mapped
            ->filter(fn (array $user) => $user['is_online'])
            ->sortByDesc('last_activity_at')
            ->values();

        $recent24hUsers = $mapped
            ->filter(fn (array $user) => $user['last_activity_at'] && \Illuminate\Support\Carbon::parse($user['last_activity_at'])->greaterThanOrEqualTo($cutoff))
            ->sortByDesc('last_activity_at')
            ->values();

        return [
            'active_user_count' => User::where('status', 'active')->count(),
            'online_user_count' => $onlineUsers->count(),
            'login_24h_count' => $recent24hUsers->count(),
            'online_users' => $onlineUsers->take(20)->values(),
            'login_24h_users' => $recent24hUsers->take(20)->values(),
        ];
    }

    private function userLocationReport(): array
    {
        try {
            $usersHasIpAddress = Schema::hasColumn('users', 'ip_address');
            $profileLocationColumns = collect(['country', 'state', 'location'])
                ->filter(fn (string $column) => Schema::hasColumn('users', $column))
                ->values();
            $sessionIps = $this->recentSessionIpsByUser();
            $selectColumns = collect(['id', 'name', 'email', 'username', 'last_login_at', 'updated_at'])
                ->when($usersHasIpAddress, fn ($columns) => $columns->push('ip_address'))
                ->merge($profileLocationColumns)
                ->unique()
                ->values()
                ->all();

            $recentUsers = User::query()
                ->select($selectColumns)
                ->where(function ($query) use ($sessionIps, $usersHasIpAddress, $profileLocationColumns) {
                    if ($profileLocationColumns->isNotEmpty()) {
                        $query->where(function ($profileQuery) use ($profileLocationColumns) {
                            foreach ($profileLocationColumns as $column) {
                                $profileQuery->orWhere(function ($columnQuery) use ($column) {
                                    $columnQuery->whereNotNull($column)
                                        ->where($column, '!=', '');
                                });
                            }
                        });
                    }

                    if ($usersHasIpAddress) {
                        $profileLocationColumns->isNotEmpty()
                            ? $query->orWhereNotNull('ip_address')
                            : $query->whereNotNull('ip_address');
                    }

                    if ($sessionIps->isNotEmpty()) {
                        ($usersHasIpAddress || $profileLocationColumns->isNotEmpty())
                            ? $query->orWhereIn('id', $sessionIps->keys()->all())
                            : $query->whereIn('id', $sessionIps->keys()->all());
                    }
                })
                ->latest('updated_at')
                ->limit(200)
                ->get()
                ->map(function (User $user) use ($sessionIps, $usersHasIpAddress) {
                    $session = $sessionIps->get((string) $user->id);
                    $sessionSeenAt = isset($session['last_activity'])
                        ? Carbon::createFromTimestamp((int) $session['last_activity'])
                        : null;
                    $lastSeenAt = $sessionSeenAt && (! $user->last_login_at || $sessionSeenAt->greaterThan($user->last_login_at))
                        ? $sessionSeenAt
                        : ($user->last_login_at ?: $user->updated_at);

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'username' => $user->username,
                        'country' => $user->country ?? null,
                        'state' => $user->state ?? null,
                        'location' => $user->location ?? null,
                        'ip_address' => ($usersHasIpAddress ? $user->ip_address : null) ?: ($session['ip_address'] ?? null),
                        'ip_source' => ($usersHasIpAddress && $user->ip_address) ? 'login' : 'session',
                        'last_seen_at' => $lastSeenAt?->toIso8601String(),
                    ];
                })
                ->map(function (array $user) {
                    $profileLocation = $this->profileLocationForUser($user);

                    if ($profileLocation !== null) {
                        return array_merge($user, $profileLocation, [
                            'source' => 'profile',
                        ]);
                    }

                    if (filled($user['ip_address'])) {
                        return array_merge($user, $this->locationForIp($user['ip_address']), [
                            'source' => $user['ip_source'] ?? 'login',
                        ]);
                    }

                    return null;
                })
                ->filter()
                ->take(50)
                ->values();
        } catch (\Throwable) {
            $recentUsers = collect();
        }

        $topLocations = $recentUsers
            ->groupBy(fn (array $user) => $user['location_name'] ?: $user['ip_address'])
            ->map(function ($users, string $locationName) {
                $latestUser = $users->sortByDesc('last_seen_at')->first();
                $coordinates = $this->coordinatesFromValues(
                    $latestUser['latitude'] ?? null,
                    $latestUser['longitude'] ?? null,
                ) ?? $this->coordinatesForLocationName(
                    $latestUser['city'] ?? null,
                    $latestUser['state'] ?? null,
                    $latestUser['country'] ?? null,
                    $locationName,
                );

                return [
                    'location_name' => $locationName,
                    'ip_address' => $latestUser['ip_address'] ?? null,
                    'city' => $latestUser['city'] ?? null,
                    'state' => $latestUser['state'] ?? null,
                    'country' => $latestUser['country'] ?? null,
                    'latitude' => $coordinates['latitude'] ?? null,
                    'longitude' => $coordinates['longitude'] ?? null,
                    'source' => $users->contains(fn (array $user) => ($user['source'] ?? null) === 'profile')
                        ? 'profile'
                        : ($latestUser['source'] ?? 'login'),
                    'profile_users' => $users->where('source', 'profile')->count(),
                    'users' => $users->count(),
                    'last_seen_at' => $latestUser['last_seen_at'] ?? null,
                ];
            })
            ->sortByDesc('users')
            ->take(8)
            ->values();

        return [
            'tracked_user_count' => $recentUsers->count(),
            'profile_location_count' => $recentUsers->where('source', 'profile')->count(),
            'top_locations' => $topLocations,
            'recent_users' => $recentUsers->take(20)->values(),
        ];
    }

    private function coordinatesFromValues(mixed $latitude, mixed $longitude): ?array
    {
        if (! is_numeric($latitude) || ! is_numeric($longitude)) {
            return null;
        }

        $lat = (float) $latitude;
        $lng = (float) $longitude;

        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return null;
        }

        return [
            'latitude' => round($lat, 6),
            'longitude' => round($lng, 6),
        ];
    }

    private function coordinatesForLocationName(?string $city, ?string $state, ?string $country, ?string $locationName): ?array
    {
        $query = collect([$city, $state, $country])
            ->filter()
            ->unique()
            ->values()
            ->implode(', ');

        if (blank($query)) {
            $query = trim((string) $locationName);
        }

        if (blank($query) || in_array($query, ['Unknown location', 'Private network'], true)) {
            return null;
        }

        return Cache::remember('admin:user-location-geocode:'.sha1(strtolower($query)), now()->addDays(30), function () use ($query) {
            try {
                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                    'User-Agent' => 'Karaads admin dashboard location map (https://karaads.com)',
                ])
                    ->timeout(2)
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'q' => $query,
                        'format' => 'jsonv2',
                        'limit' => 1,
                    ]);

                if (! $response->ok()) {
                    return null;
                }

                $first = $response->json('0');

                if (! is_array($first)) {
                    return null;
                }

                return $this->coordinatesFromValues($first['lat'] ?? null, $first['lon'] ?? null);
            } catch (\Throwable) {
                return null;
            }
        });
    }

    private function profileLocationForUser(array $user): ?array
    {
        $city = trim((string) ($user['location'] ?? ''));
        $state = trim((string) ($user['state'] ?? ''));
        $country = trim((string) ($user['country'] ?? ''));
        $parts = collect([$city, $state, $country])
            ->filter()
            ->unique()
            ->values();

        if ($parts->isEmpty()) {
            return null;
        }

        return [
            'location_name' => $parts->implode(', '),
            'city' => $city ?: null,
            'state' => $state ?: null,
            'country' => $country ?: null,
        ];
    }

    private function locationForIp(?string $ipAddress): array
    {
        if (! $ipAddress || ! filter_var($ipAddress, FILTER_VALIDATE_IP)) {
            return $this->unknownLocation();
        }

        if (! filter_var($ipAddress, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return [
                'location_name' => 'Private network',
                'city' => null,
                'state' => null,
                'country' => null,
                'latitude' => null,
                'longitude' => null,
            ];
        }

        return Cache::remember('admin:user-location:'.sha1($ipAddress), now()->addDays(14), function () use ($ipAddress) {
            try {
                $response = Http::timeout(2)
                    ->retry(1, 100)
                    ->get("http://ip-api.com/json/{$ipAddress}", [
                        'fields' => 'status,country,regionName,city,lat,lon,query,message',
                    ]);

                if (! $response->ok() || $response->json('status') !== 'success') {
                    return $this->unknownLocation();
                }

                $city = trim((string) $response->json('city'));
                $state = trim((string) $response->json('regionName'));
                $country = trim((string) $response->json('country'));
                $parts = collect([$city, $state, $country])
                    ->filter()
                    ->unique()
                    ->values();

                return [
                    'location_name' => $parts->isNotEmpty() ? $parts->implode(', ') : $this->unknownLocation()['location_name'],
                    'city' => $city ?: null,
                    'state' => $state ?: null,
                    'country' => $country ?: null,
                    'latitude' => is_numeric($response->json('lat')) ? (float) $response->json('lat') : null,
                    'longitude' => is_numeric($response->json('lon')) ? (float) $response->json('lon') : null,
                ];
            } catch (\Throwable) {
                return $this->unknownLocation();
            }
        });
    }

    private function unknownLocation(): array
    {
        return [
            'location_name' => 'Unknown location',
            'city' => null,
            'state' => null,
            'country' => null,
            'latitude' => null,
            'longitude' => null,
        ];
    }

    private function recentSessionIpsByUser()
    {
        if (! Schema::hasTable('sessions')
            || ! Schema::hasColumn('sessions', 'user_id')
            || ! Schema::hasColumn('sessions', 'ip_address')
            || ! Schema::hasColumn('sessions', 'last_activity')) {
            return collect();
        }

        return DB::table('sessions')
            ->whereNotNull('user_id')
            ->whereNotNull('ip_address')
            ->where('last_activity', '>=', now()->subDays(7)->timestamp)
            ->orderByDesc('last_activity')
            ->limit(500)
            ->get(['user_id', 'ip_address', 'last_activity'])
            ->unique('user_id')
            ->mapWithKeys(fn ($session) => [(string) $session->user_id => [
                'ip_address' => $session->ip_address,
                'last_activity' => $session->last_activity,
            ]]);
    }

    private function recentFinancialTransactions($rewardedWithdrawals)
    {
        $badgePayments = VerificationRequest::query()
            ->with('user:id,name,email,username')
            ->where('payment_status', 'paid')
            ->latest('paid_at')
            ->limit(8)
            ->get()
            ->map(fn (VerificationRequest $request) => [
                'id' => $request->id,
                'type' => 'Badge payment',
                'user' => $request->user,
                'amount' => (float) $request->payment_amount,
                'status' => $request->payment_status,
                'reference' => $request->payment_reference,
                'created_at' => $request->paid_at?->toIso8601String() ?? $request->updated_at?->toIso8601String(),
            ]);

        $adPayments = AdPayment::query()
            ->with('wallet.account.user:id,name,email,username')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (AdPayment $payment) => [
                'id' => $payment->id,
                'type' => 'Ad wallet payment',
                'user' => $payment->wallet?->account?->user,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'reference' => $payment->reference,
                'created_at' => $payment->created_at?->toIso8601String(),
            ]);

        $earnings = Earning::query()
            ->with('user:id,name,email,username')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Earning $earning) => [
                'id' => $earning->id,
                'type' => 'User earning',
                'user' => $earning->user,
                'amount' => (float) $earning->amount,
                'status' => $earning->status,
                'reference' => $earning->transaction_id,
                'created_at' => $earning->created_at?->toIso8601String(),
            ]);

        $withdrawals = WithdrawalRequest::query()
            ->with('user:id,name,email,username')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (WithdrawalRequest $withdrawal) => [
                'id' => $withdrawal->id,
                'type' => 'Withdrawal',
                'user' => $withdrawal->user,
                'amount' => (float) $withdrawal->amount,
                'status' => $withdrawal->status,
                'reference' => $withdrawal->transaction_id,
                'created_at' => $withdrawal->created_at?->toIso8601String(),
            ]);

        $rewarded = $rewardedWithdrawals
            ->take(8)
            ->map(fn (array $withdrawal) => [
                'id' => $withdrawal['reference'] ?? '',
                'type' => 'Rewarded withdrawal',
                'user' => $withdrawal['user'] ?? null,
                'amount' => (float) ($withdrawal['amount'] ?? 0),
                'status' => $withdrawal['status'] ?? 'pending',
                'reference' => $withdrawal['reference'] ?? null,
                'created_at' => $withdrawal['created_at'] ?? null,
            ]);

        return $badgePayments
            ->concat($adPayments)
            ->concat($earnings)
            ->concat($withdrawals)
            ->concat($rewarded)
            ->sortByDesc('created_at')
            ->take(15)
            ->values();
    }

    private function monthlyPlatformReport(): array
    {
        $startMonth = $this->earliestReportMonth();
        $endMonth = now()->startOfMonth();
        $monthKeys = [];
        $cursor = $startMonth->copy();

        while ($cursor->lte($endMonth)) {
            $monthKeys[] = $cursor->format('Y-m');
            $cursor->addMonthNoOverflow();
        }

        $userRows = User::query()
            ->selectRaw($this->monthExpression('created_at') . ' as month')
            ->selectRaw('COUNT(*) as onboarded_users')
            ->selectRaw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_accounts")
            ->selectRaw("SUM(CASE WHEN status <> 'active' THEN 1 ELSE 0 END) as inactive_accounts")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $activeUserRows = User::query()
            ->where('status', 'active')
            ->whereNotNull('last_login_at')
            ->selectRaw($this->monthExpression('last_login_at') . ' as month')
            ->selectRaw('COUNT(*) as active_users')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $badgeRevenueRows = VerificationRequest::query()
            ->where('payment_status', 'paid')
            ->whereNotNull('paid_at')
            ->selectRaw($this->monthExpression('COALESCE(paid_at, updated_at)') . ' as month')
            ->selectRaw('SUM(COALESCE(payment_amount, 0)) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $monetizationRevenueRows = User::query()
            ->where(function ($query) {
                $query->whereNotNull('monetization_paid_at')
                    ->orWhereNotNull('monetization_activated_at');
            })
            ->selectRaw($this->monthExpression('COALESCE(monetization_paid_at, monetization_activated_at)') . ' as month')
            ->selectRaw('SUM(COALESCE(monetization_payment_amount, ' . self::MONETIZATION_FEE_AMOUNT . ')) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $adWalletRevenueRows = AdPayment::query()
            ->whereIn('status', ['successful', 'success', 'paid'])
            ->selectRaw($this->monthExpression('created_at') . ' as month')
            ->selectRaw('SUM(amount) as amount')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        $cumulativeOnboarded = 0;
        $totalBadgeRevenue = 0.0;
        $totalMonetizationRevenue = 0.0;
        $totalAdWalletRevenue = 0.0;

        foreach ($monthKeys as $monthKey) {
            $userRow = $userRows->get($monthKey);
            $activeUserRow = $activeUserRows->get($monthKey);
            $badgeRevenueRow = $badgeRevenueRows->get($monthKey);
            $monetizationRevenueRow = $monetizationRevenueRows->get($monthKey);
            $adWalletRevenueRow = $adWalletRevenueRows->get($monthKey);

            $onboardedUsers = (int) ($userRow->onboarded_users ?? 0);
            $activeAccounts = (int) ($userRow->active_accounts ?? 0);
            $inactiveAccounts = (int) ($userRow->inactive_accounts ?? 0);
            $activeUsers = (int) ($activeUserRow->active_users ?? 0);
            $badgeRevenue = round((float) ($badgeRevenueRow->amount ?? 0), 2);
            $monetizationRevenue = round((float) ($monetizationRevenueRow->amount ?? 0), 2);
            $adWalletRevenue = round((float) ($adWalletRevenueRow->amount ?? 0), 2);
            $monthRevenue = round($badgeRevenue + $monetizationRevenue + $adWalletRevenue, 2);

            $cumulativeOnboarded += $onboardedUsers;
            $totalBadgeRevenue += $badgeRevenue;
            $totalMonetizationRevenue += $monetizationRevenue;
            $totalAdWalletRevenue += $adWalletRevenue;

            $months[] = [
                'month' => $monthKey,
                'label' => Carbon::createFromFormat('Y-m', $monthKey)->format('M Y'),
                'onboarded_users' => $onboardedUsers,
                'cumulative_users' => $cumulativeOnboarded,
                'active_accounts' => $activeAccounts,
                'inactive_accounts' => $inactiveAccounts,
                'active_users' => $activeUsers,
                'badge_revenue' => $badgeRevenue,
                'monetization_revenue' => $monetizationRevenue,
                'ad_wallet_revenue' => $adWalletRevenue,
                'total_revenue' => $monthRevenue,
            ];
        }

        return [
            'months' => $months,
            'summary' => [
                'total_onboarded' => User::count(),
                'active_accounts' => User::where('status', 'active')->count(),
                'inactive_accounts' => User::where('status', '!=', 'active')->count(),
                'active_users' => User::where('status', 'active')->whereNotNull('last_login_at')->count(),
                'badge_revenue' => round($totalBadgeRevenue, 2),
                'monetization_revenue' => round($totalMonetizationRevenue, 2),
                'ad_wallet_revenue' => round($totalAdWalletRevenue, 2),
                'total_revenue' => round($totalBadgeRevenue + $totalMonetizationRevenue + $totalAdWalletRevenue, 2),
            ],
        ];
    }

    private function earliestReportMonth(): Carbon
    {
        $dates = collect([
            User::query()->selectRaw('MIN(created_at) as earliest')->value('earliest'),
            User::query()->whereNotNull('last_login_at')->selectRaw('MIN(last_login_at) as earliest')->value('earliest'),
            VerificationRequest::query()->where('payment_status', 'paid')->selectRaw('MIN(COALESCE(paid_at, updated_at)) as earliest')->value('earliest'),
            User::query()
                ->where(function ($query) {
                    $query->whereNotNull('monetization_paid_at')
                        ->orWhereNotNull('monetization_activated_at');
                })
                ->selectRaw('MIN(COALESCE(monetization_paid_at, monetization_activated_at)) as earliest')
                ->value('earliest'),
            AdPayment::query()->selectRaw('MIN(created_at) as earliest')->value('earliest'),
        ])
            ->filter()
            ->map(fn ($date) => Carbon::parse((string) $date)->startOfMonth())
            ->sort()
            ->values();

        return $dates->first() ?: now()->startOfMonth();
    }

    private function monthExpression(string $columnExpression): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', {$columnExpression})",
            'pgsql' => "to_char({$columnExpression}, 'YYYY-MM')",
            default => "DATE_FORMAT({$columnExpression}, '%Y-%m')",
        };
    }

    private function getRevenueChartData()
    {
        $data = [];
        for ($i = 30; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $revenue = AdEvent::query()
                ->whereDate('created_at', $date)
                ->where('is_billable', true)
                ->sum('billed_amount');
            $data[] = [
                'date' => $date,
                'revenue' => (float) $revenue,
            ];
        }

        return $data;
    }

    private function getUserGrowthChartData()
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subMonths($i)->startOfMonth()->toDateString();
            $totalUsers = User::whereDate('created_at', '<=', $date)->count();
            $newUsers = User::whereYear('created_at', now()->subMonths($i)->year)
                ->whereMonth('created_at', now()->subMonths($i)->month)
                ->count();
            $data[] = [
                'month' => now()->subMonths($i)->format('M Y'),
                'totalUsers' => $totalUsers,
                'newUsers' => $newUsers,
            ];
        }

        return $data;
    }

    private function getAdPerformanceChartData()
    {
        $data = [];
        for ($i = 7; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $impressions = AdEvent::query()
                ->whereDate('created_at', $date)
                ->where('event_type', 'impression')
                ->count();
            $clicks = AdEvent::query()
                ->whereDate('created_at', $date)
                ->where('event_type', 'click')
                ->count();
            $ctr = $impressions > 0 ? ($clicks / $impressions) * 100 : 0;
            $data[] = [
                'date' => $date,
                'impressions' => $impressions,
                'clicks' => $clicks,
                'ctr' => round($ctr, 2),
            ];
        }

        return $data;
    }
}
