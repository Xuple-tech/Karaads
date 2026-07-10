<?php

use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Admin\BadgePaymentController;
use App\Http\Controllers\Admin\ContentModerationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EarningController;
use App\Http\Controllers\Admin\EarningsSettingsController;
use App\Http\Controllers\Admin\MonetizationSettingController;
use App\Http\Controllers\Admin\QrCodeController;
use App\Http\Controllers\Admin\SystemStaffController;
use App\Http\Controllers\Admin\UserEmailController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\UserVerificationRequestController;
use App\Http\Controllers\Admin\WithdrawalController;
use App\Http\Controllers\Admin\V2\AdsAdapterController as AdsV2AdapterController;
use App\Http\Controllers\Admin\V2\AdsDashboardController as AdsV2DashboardController;
use App\Http\Controllers\Admin\V2\AdsFinanceController as AdsV2FinanceController;
use App\Http\Controllers\Admin\V2\AdsModerationController as AdsV2ModerationController;
use App\Http\Controllers\Admin\V2\AdsPlacementController as AdsV2PlacementController;
use App\Http\Controllers\Admin\V2\RecommendationConfigController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return auth('admin')->check()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('admin.login');
    })->name('index');

    // Guest Routes
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AdminAuthController::class, 'showLoginForm'])->name('login');
        Route::post('login', [AdminAuthController::class, 'login'])->name('login.post');
    });

    // Authenticated Admin Routes
    Route::middleware(['auth:admin', 'admin.auth'])->group(function () {
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::get('media/{path}', [AdminMediaController::class, 'show'])
            ->where('path', '.*')
            ->name('media.show');

        // Dashboard
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('badge-payments', [BadgePaymentController::class, 'index'])
            ->middleware('admin.can:role,admin')
            ->name('badge-payments.index');
        Route::get('email-users', [UserEmailController::class, 'create'])
            ->middleware('admin.can:role,admin')
            ->name('email-users.create');
        Route::post('email-users', [UserEmailController::class, 'store'])
            ->middleware('admin.can:role,admin')
            ->name('email-users.store');
        Route::get('qr-code', [QrCodeController::class, 'index'])
            ->middleware('admin.can:role,admin')
            ->name('qr-code.index');

        // System Staff (Super Admin only)
        Route::prefix('system-staff')
            ->name('system-staff.')
            ->middleware('admin.can:role,super_admin')
            ->group(function () {
                Route::get('/', [SystemStaffController::class, 'index'])->name('index');
                Route::get('/create', [SystemStaffController::class, 'create'])->name('create');
                Route::post('/', [SystemStaffController::class, 'store'])->name('store');
                Route::get('/{admin}/edit', [SystemStaffController::class, 'edit'])->name('edit');
                Route::put('/{admin}', [SystemStaffController::class, 'update'])->name('update');
                Route::post('/{admin}/toggle-active', [SystemStaffController::class, 'toggleActive'])->name('toggle-active');
                Route::post('/{admin}/reset-password', [SystemStaffController::class, 'resetPassword'])->name('reset-password');
                Route::delete('/{admin}', [SystemStaffController::class, 'destroy'])->name('destroy');
            });

        // Ads V2 Management
        Route::prefix('v2/ads')->name('v2.ads.')->middleware('admin.can:permission,manage_ads,manage_campaigns')->group(function () {
            Route::get('dashboard', [AdsV2DashboardController::class, 'index'])->name('dashboard');

            // Moderation
            Route::get('moderation/queue', [AdsV2ModerationController::class, 'queue'])->name('moderation.queue');
            Route::post('moderation/campaigns/{campaign}/approve', [AdsV2ModerationController::class, 'approveCampaign'])->name('moderation.campaigns.approve');
            Route::post('moderation/campaigns/{campaign}/reject', [AdsV2ModerationController::class, 'rejectCampaign'])->name('moderation.campaigns.reject');
            Route::post('moderation/campaigns/{campaign}/pause', [AdsV2ModerationController::class, 'pauseCampaign'])->name('moderation.campaigns.pause');
            Route::post('moderation/campaigns/{campaign}/resume', [AdsV2ModerationController::class, 'resumeCampaign'])->name('moderation.campaigns.resume');
            Route::post('moderation/creatives/{creative}/approve', [AdsV2ModerationController::class, 'approveCreative'])->name('moderation.creatives.approve');
            Route::post('moderation/creatives/{creative}/reject', [AdsV2ModerationController::class, 'rejectCreative'])->name('moderation.creatives.reject');

            // External adapters
            Route::get('adapters', [AdsV2AdapterController::class, 'index'])->name('adapters.index');
            Route::post('adapters', [AdsV2AdapterController::class, 'store'])->name('adapters.store');
            Route::patch('adapters/{adapter}', [AdsV2AdapterController::class, 'update'])->name('adapters.update');

            // Placements
            Route::get('placements', [AdsV2PlacementController::class, 'index'])->name('placements.index');
            Route::post('placements', [AdsV2PlacementController::class, 'store'])->name('placements.store');
            Route::patch('placements/{placement}', [AdsV2PlacementController::class, 'update'])->name('placements.update');

            // Finance
            Route::middleware('admin.can:permission,manage_withdrawals,manage_earnings,view_financial_reports')->group(function () {
                Route::get('finance/ledger', [AdsV2FinanceController::class, 'ledger'])->name('finance.ledger');
                Route::get('finance/payout-batches', [AdsV2FinanceController::class, 'payoutBatches'])->name('finance.payout-batches');
                Route::post('finance/payout-batches', [AdsV2FinanceController::class, 'createPayoutBatch'])->name('finance.payout-batches.create');
                Route::post('finance/payout-batches/{batch}/complete', [AdsV2FinanceController::class, 'completePayoutBatch'])->name('finance.payout-batches.complete');
                Route::get('finance/payments', [AdsV2FinanceController::class, 'payments'])->name('finance.payments');
                Route::post('finance/payments/{payment}/approve', [AdsV2FinanceController::class, 'approvePayment'])->name('finance.payments.approve');
                Route::post('finance/payments/{payment}/fail', [AdsV2FinanceController::class, 'failPayment'])->name('finance.payments.fail');
            });
        });

        Route::prefix('v2/reco')->name('v2.reco.')->middleware('admin.can:permission,view_analytics')->group(function () {
            Route::get('configs', [RecommendationConfigController::class, 'index'])->name('configs.index');
            Route::get('history', [RecommendationConfigController::class, 'history'])->name('history.index');
            Route::get('category-stats', [RecommendationConfigController::class, 'categoryStats'])->name('category-stats.index');
            Route::put('configs/{config}', [RecommendationConfigController::class, 'update'])->name('configs.update');
            Route::post('configs/reset-defaults', [RecommendationConfigController::class, 'resetDefaults'])->name('configs.reset-defaults');
            Route::get('configs-page', [RecommendationConfigController::class, 'page'])->name('configs.page');
        });

        // Monetization Settings
        Route::prefix('monetization-settings')->name('monetization-settings.')->middleware('admin.can:permission,manage_earnings,manage_withdrawals,view_financial_reports')->group(function () {
            Route::get('/', [MonetizationSettingController::class, 'index'])->name('index');
            Route::get('/edit', [MonetizationSettingController::class, 'edit'])->name('edit');
            Route::put('/', [MonetizationSettingController::class, 'update'])->name('update');
            Route::post('/reset', [MonetizationSettingController::class, 'reset'])->name('reset');
            Route::get('/revenue-split', [MonetizationSettingController::class, 'revenueSplit'])->name('revenue-split');
            Route::put('/revenue-split', [MonetizationSettingController::class, 'updateRevenueSplit'])->name('update-revenue-split');
            Route::get('/payout-settings', [MonetizationSettingController::class, 'payoutSettings'])->name('payout-settings');
            Route::put('/payout-settings', [MonetizationSettingController::class, 'updatePayoutSettings'])->name('update-payout-settings');
        });

        // Earnings Management
        Route::prefix('earnings')->name('earnings.')->middleware('admin.can:permission,manage_earnings,view_financial_reports')->group(function () {
            Route::get('/', [EarningController::class, 'index'])->name('index');
            Route::get('/daily', [EarningController::class, 'daily'])->name('daily');
            Route::get('/monthly', [EarningController::class, 'monthly'])->name('monthly');
            Route::get('/by-user/{user}', [EarningController::class, 'byUser'])->name('by-user');
            Route::get('/by-post', [EarningController::class, 'byPost'])->name('by-post.index');
            Route::get('/by-post/{post}', [EarningController::class, 'byPost'])->name('by-post');
            Route::put('/by-post/{post}/monetization', [EarningController::class, 'updatePostMonetization'])->name('by-post.monetization');
            Route::post('/process-payout/{earning}', [EarningController::class, 'processPayout'])->name('process-payout');
            Route::post('/batch-process', [EarningController::class, 'batchProcess'])->name('batch-process');
            Route::get('/reports', [EarningController::class, 'reports'])->name('reports');
            Route::post('/export', [EarningController::class, 'export'])->name('export');
        });

        // Withdrawal Management
        Route::prefix('withdrawals')->name('withdrawals.')->middleware('admin.can:permission,manage_withdrawals,view_financial_reports')->group(function () {
            Route::get('/', [WithdrawalController::class, 'index'])->name('index');
            Route::get('/pending', [WithdrawalController::class, 'pending'])->name('pending');
            Route::get('/completed', [WithdrawalController::class, 'completed'])->name('completed');
            Route::get('/rejected', [WithdrawalController::class, 'rejected'])->name('rejected');
            Route::get('/{withdrawalRequest}', [WithdrawalController::class, 'show'])->name('show');
            Route::post('/{withdrawalRequest}/approve', [WithdrawalController::class, 'approve'])->name('approve');
            Route::post('/{withdrawalRequest}/reject', [WithdrawalController::class, 'reject'])->name('reject');
            Route::post('/{withdrawalRequest}/complete', [WithdrawalController::class, 'complete'])->name('complete');
            Route::post('/{withdrawalRequest}/process', [WithdrawalController::class, 'process'])->name('process');
            Route::get('/{withdrawalRequest}/transactions', [WithdrawalController::class, 'transactions'])->name('transactions');
        });

        // User Management
        Route::prefix('users')->name('users.')->middleware('admin.can:role,admin')->group(function () {
            Route::get('/', [UserManagementController::class, 'index'])->name('index');
            Route::post('/import', [UserManagementController::class, 'import'])->name('import');
            Route::get('/creators', [UserManagementController::class, 'creators'])->name('creators');
            Route::get('/viewers', [UserManagementController::class, 'viewers'])->name('viewers');
            Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
            Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
            Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
            Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
            Route::post('/{user}/toggle-status', [UserManagementController::class, 'toggleStatus'])->name('toggle-status');
            Route::post('/{user}/disable', [UserManagementController::class, 'disable'])->name('disable');
            Route::post('/{user}/enable', [UserManagementController::class, 'enable'])->name('enable');
            Route::get('/{user}/earnings', [UserManagementController::class, 'earnings'])->name('earnings');
            Route::get('/{user}/posts', [UserManagementController::class, 'posts'])->name('posts');
            Route::get('/{user}/wallet', [UserManagementController::class, 'wallet'])->name('wallet');
            Route::post('/{user}/adjust-wallet', [UserManagementController::class, 'adjustWallet'])->name('adjust-wallet');
            Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
            Route::post('/{user}/kara-verified/grant', [UserManagementController::class, 'grantKaraVerified'])->name('kara-verified.grant');
            Route::post('/{user}/kara-verified/revoke', [UserManagementController::class, 'revokeKaraVerified'])->name('kara-verified.revoke');
            Route::post('/{user}/verification-request/approve', [UserVerificationRequestController::class, 'approve'])->name('verification-request.approve');
            Route::post('/{user}/verification-request/reject', [UserVerificationRequestController::class, 'reject'])->name('verification-request.reject');
        });

        // Content Moderation
        Route::prefix('content')->name('content.')->middleware('admin.can:permission,moderate_content,review_posts,review_comments')->group(function () {
            Route::get('/posts', [ContentModerationController::class, 'posts'])->name('posts');
            Route::get('/posts/pending', [ContentModerationController::class, 'pendingPosts'])->name('posts.pending');
            Route::get('/posts/reported', [ContentModerationController::class, 'reportedPosts'])->name('posts.reported');
            Route::get('/posts/{post}/preview', [ContentModerationController::class, 'previewPost'])->name('posts.preview');
            Route::get('/comments', [ContentModerationController::class, 'comments'])->name('comments');
            Route::get('/comments/reported', [ContentModerationController::class, 'reportedComments'])->name('comments.reported');
            Route::post('/posts/{post}/approve', [ContentModerationController::class, 'approvePost'])->name('posts.approve');
            Route::post('/posts/{post}/reject', [ContentModerationController::class, 'rejectPost'])->name('posts.reject');
            Route::post('/posts/{post}/disable', [ContentModerationController::class, 'disablePost'])->name('posts.disable');
            Route::post('/posts/{post}/enable', [ContentModerationController::class, 'enablePost'])->name('posts.enable');
            Route::post('/posts/{post}/feature', [ContentModerationController::class, 'featurePost'])->name('posts.feature');
            Route::post('/posts/{post}/pin', [ContentModerationController::class, 'pinPost'])->name('posts.pin');
            Route::post('/comments/{comment}/approve', [ContentModerationController::class, 'approveComment'])->name('comments.approve');
            Route::post('/comments/{comment}/reject', [ContentModerationController::class, 'rejectComment'])->name('comments.reject');
            Route::get('/reports', [ContentModerationController::class, 'reports'])->name('reports');
            Route::post('/reports/{report}/resolve', [ContentModerationController::class, 'resolveReport'])->name('reports.resolve');
        });

        // Analytics
        Route::prefix('analytics')->name('analytics.')->middleware('admin.can:permission,view_analytics,view_financial_reports')->group(function () {
            Route::get('/', [AnalyticsController::class, 'index'])->name('index');
            Route::get('/revenue', [AnalyticsController::class, 'revenue'])->name('revenue');
            Route::get('/users', [AnalyticsController::class, 'users'])->name('users');
            Route::get('/engagement', [AnalyticsController::class, 'engagement'])->name('engagement');
            Route::get('/ads-performance', [AnalyticsController::class, 'adsPerformance'])->name('ads-performance');
            Route::get('/top-creators', [AnalyticsController::class, 'topCreators'])->name('top-creators');
            Route::get('/top-posts', [AnalyticsController::class, 'topPosts'])->name('top-posts');
            Route::get('/platform-earnings', [AnalyticsController::class, 'platformEarnings'])->name('platform-earnings');
            Route::post('/export', [AnalyticsController::class, 'export'])->name('export');
            Route::get('/real-time', [AnalyticsController::class, 'realTime'])->name('real-time');
        });

        // Earnings Settings
        Route::prefix('earnings-settings')->name('earnings-settings.')->middleware('admin.can:permission,manage_earnings,view_financial_reports')->group(function () {
            Route::get('/', [EarningsSettingsController::class, 'index'])->name('index');
            Route::post('/', [EarningsSettingsController::class, 'update'])->name('update');
            Route::get('/analytics', [EarningsSettingsController::class, 'analytics'])->name('analytics');
        });

        // Reports
        Route::prefix('reports')->name('reports.')->middleware('admin.can:permission,view_financial_reports,view_analytics')->group(function () {
            Route::get('/financial', [AnalyticsController::class, 'financialReport'])->name('financial');
            Route::get('/monthly', [AnalyticsController::class, 'monthlyReport'])->name('monthly');
            Route::get('/user-growth', [AnalyticsController::class, 'userGrowthReport'])->name('user-growth');
            Route::get('/content-performance', [AnalyticsController::class, 'contentPerformanceReport'])->name('content-performance');
            Route::get('/ad-performance', [AnalyticsController::class, 'adPerformanceReport'])->name('ad-performance');
        });
    });
});
