<?php

use App\Http\Controllers\Api\AppDownloadTrackController;
use App\Http\Controllers\Api\BusinessPageController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\HomeEngagementController;
use App\Http\Controllers\Api\KwatiAiController;
use App\Http\Controllers\Api\LiveStreamArchiveController;
use App\Http\Controllers\Api\LiveStreamController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\Mobile\AccountActivationController as MobileAccountActivationController;
use App\Http\Controllers\Api\Mobile\AuthController as MobileAuthController;
use App\Http\Controllers\Api\Mobile\EmailVerificationController as MobileEmailVerificationController;
use App\Http\Controllers\Api\Mobile\PasswordController as MobilePasswordController;
use App\Http\Controllers\Api\Mobile\PasswordResetController as MobilePasswordResetController;
use App\Http\Controllers\Api\Mobile\TwoFactorController as MobileTwoFactorController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PushTokenController;
use App\Http\Controllers\Api\ReverbHealthController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\UnifiedFeedController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserVerificationRequestController;
use App\Http\Controllers\Api\V2\AdsCampaignController as AdsV2CampaignController;
use App\Http\Controllers\Api\V2\AdsAnalyticsController as AdsV2AnalyticsController;
use App\Http\Controllers\Api\V2\AdsCreativeController as AdsV2CreativeController;
use App\Http\Controllers\Api\V2\AdsDeliveryController as AdsV2DeliveryController;
use App\Http\Controllers\Api\V2\AdsEventController as AdsV2EventController;
use App\Http\Controllers\Api\V2\AdsWalletController as AdsV2WalletController;
use App\Http\Controllers\Api\V2\RewardedController as RewardedV2Controller;
use App\Http\Controllers\ReferralController;
use App\Http\Middleware\WrapV12ApiResponse;
use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| KaraAds Mobile API v3
|--------------------------------------------------------------------------
| Base URL : https://karaads.com/api/v3
| Auth     : Authorization: Bearer {sanctum_token}
| Format   : { success, data, message, meta? }
|
|  01 Authentication & Account
|  02 Feed & Discovery
|  03 Posts
|  04 Comments
|  05 Stories
|  06 Users & Profiles
|  07 Social (Follow / Block)
|  08 Notifications
|  09 Conversations & Messages
|  10 Calls (WebRTC)
|  11 Live Streams
|  12 Earn & Rewards
|  13 Ads Management (Advertiser)
|  14 Wallet
|  15 Business Pages
|  16 Referrals
|  21 Payments (Paystack + Kwatibank)
|  17 Settings & Preferences
|  18 Push Tokens
|  19 AI Assistant
|  20 App / Utilities
*/

Route::prefix('v3')
    ->middleware(WrapV12ApiResponse::class)
    ->name('api.v3.')
    ->group(function () {

        // ============================================================
        // 01. AUTHENTICATION & ACCOUNT
        // ============================================================
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('register',     [MobileAuthController::class, 'register'])->name('register');
            Route::post('login',        [MobileAuthController::class, 'login'])->name('login');
            Route::post('verify-2fa',   [MobileAuthController::class, 'verify2FA'])->name('verify-2fa');
            Route::post('password/forgot', [MobilePasswordResetController::class, 'forgot'])->name('password.forgot');
            Route::post('password/reset',  [MobilePasswordResetController::class, 'reset'])->name('password.reset');

            Route::prefix('account-activation')->name('activation.')->group(function () {
                Route::post('send-code',    [MobileAccountActivationController::class, 'sendCode'])->name('send-code');
                Route::post('verify-code',  [MobileAccountActivationController::class, 'verifyCode'])->name('verify-code');
                Route::post('set-password', [MobileAccountActivationController::class, 'setPassword'])->name('set-password');
            });

            Route::middleware('auth:sanctum')->group(function () {
                Route::post('verify-email/otp/send',   [MobileEmailVerificationController::class, 'sendCode'])->name('verify-email.send');
                Route::post('verify-email/otp/verify', [MobileEmailVerificationController::class, 'verifyCode'])->name('verify-email.verify');
                Route::post('password/change',         [MobilePasswordController::class, 'change'])->name('password.change');
                Route::post('2fa/enable',         [MobileTwoFactorController::class, 'enable'])->name('2fa.enable');
                Route::post('2fa/confirm',        [MobileTwoFactorController::class, 'confirm'])->name('2fa.confirm');
                Route::post('2fa/disable',        [MobileTwoFactorController::class, 'disable'])->name('2fa.disable');
                Route::post('2fa/recovery-codes', [MobileTwoFactorController::class, 'recoveryCodes'])->name('2fa.recovery-codes');
            });

            Route::middleware(['auth:sanctum', 'verified'])->group(function () {
                Route::get('me',      [MobileAuthController::class, 'me'])->name('me');
                Route::post('logout', [MobileAuthController::class, 'logout'])->name('logout');
            });
        });

        Route::get('posts/{post}', [PostController::class, 'show'])->whereUuid('post')->name('posts.show-public');

        // ============================================================
        // AUTHENTICATED ROUTES
        // ============================================================
        Route::middleware(['auth:sanctum', 'verified'])->group(function () {

            // 02. FEED & DISCOVERY
            Route::prefix('feed')->name('feed.')->group(function () {
                Route::get('/',             [UnifiedFeedController::class, 'index'])->name('unified');
                Route::get('moments',       [PostController::class, 'moments'])->name('moments');
                Route::get('trending',      [PostController::class, 'trending'])->name('trending');
                Route::get('following',     [PostController::class, 'feed'])->name('following');
                Route::get('hashtag/{tag}', [PostController::class, 'hashtag'])->name('hashtag');
            });
            Route::get('trending',        [PostController::class, 'getTrendingTopics'])->name('trending');
            Route::get('search',          [PostController::class, 'search'])->name('search');
            Route::get('home/engagement', [HomeEngagementController::class, 'index'])->name('home-engagement');

            // 03. POSTS
            Route::prefix('posts')->name('posts.')->group(function () {
                Route::get('/',         [PostController::class, 'index'])->name('index');
                Route::post('/',        [PostController::class, 'store'])->name('store');
                Route::get('{post}',    [PostController::class, 'show'])->whereUuid('post')->name('show');
                Route::patch('{post}',  [PostController::class, 'update'])->whereUuid('post')->name('update');
                Route::delete('{post}', [PostController::class, 'destroy'])->whereUuid('post')->name('destroy');
                Route::post('{post}/like',      [PostController::class, 'like'])->whereUuid('post')->name('like');
                Route::post('{post}/unlike',    [PostController::class, 'unlike'])->whereUuid('post')->name('unlike');
                Route::post('{post}/engagement',[PostController::class, 'engagement'])->whereUuid('post')->name('engagement');
                Route::post('{post}/reshare',   [PostController::class, 'reshare'])->whereUuid('post')->name('reshare');
                Route::post('{post}/unreshare', [PostController::class, 'unreshare'])->whereUuid('post')->name('unreshare');
                Route::post('{post}/save',      [PostController::class, 'save'])->whereUuid('post')->name('save');
                Route::post('{post}/unsave',    [PostController::class, 'unsave'])->whereUuid('post')->name('unsave');
                Route::post('{post}/report',    [PostController::class, 'report'])->whereUuid('post')->name('report');
            });
            Route::get('bookmarks', [UserController::class, 'bookmarks'])->name('bookmarks');

            // 04. COMMENTS
            Route::prefix('posts/{post}/comments')->whereUuid('post')->name('comments.')->group(function () {
                Route::get('/',              [PostController::class, 'getComments'])->name('index');
                Route::post('/',             [PostController::class, 'comment'])->name('store');
                Route::patch('{comment}',    [PostController::class, 'updateComment'])->name('update');
                Route::delete('{comment}',   [PostController::class, 'destroyComment'])->name('destroy');
                Route::post('{comment}/like',   [PostController::class, 'likeComment'])->name('like');
                Route::post('{comment}/unlike', [PostController::class, 'unlikeComment'])->name('unlike');
                Route::get('{comment}/replies', [PostController::class, 'getCommentReplies'])->name('replies');
            });

            // 05. STORIES
            Route::prefix('stories')->name('stories.')->group(function () {
                Route::get('/',          [StoryController::class, 'index'])->name('index');
                Route::post('/',         [StoryController::class, 'store'])->name('store');
                Route::get('{story}',    [StoryController::class, 'show'])->name('show');
                Route::delete('{story}', [StoryController::class, 'destroy'])->name('destroy');
                Route::post('{story}/view',  [StoryController::class, 'view'])->name('view');
                Route::post('{story}/react', [StoryController::class, 'react'])->name('react');
            });

            // 06. USERS & PROFILES
            Route::prefix('users')->name('users.')->group(function () {
                Route::get('/',                       [UserController::class, 'index'])->name('index');
                Route::get('search',                  [UserController::class, 'index'])->name('search');
                Route::get('me',                      [UserController::class, 'profile'])->name('me');
                Route::patch('me',                    [UserController::class, 'updateProfile'])->name('me.update');
                Route::post('me/avatar',              [UserController::class, 'updateAvatar'])->name('me.avatar');
                Route::post('me/cover',               [UserController::class, 'updateCover'])->name('me.cover');
                Route::get('me/followers',            [UserController::class, 'followers'])->name('me.followers');
                Route::get('me/following',            [UserController::class, 'getFollowing'])->name('me.following');
                Route::get('me/blocked',              [UserController::class, 'blockedUsers'])->name('me.blocked');
                Route::get('by-username/{username}',  [UserController::class, 'byUsername'])->name('by-username');
                Route::get('{user}',                  [UserController::class, 'show'])->name('show');
                Route::get('{user}/posts',            [UserController::class, 'posts'])->name('posts');
                Route::get('{user}/followers',        [UserController::class, 'followers'])->name('followers');
                Route::get('{user}/following',        [UserController::class, 'followingList'])->name('following');
            });

            // 07. SOCIAL
            Route::post('users/{user}/follow',   [UserController::class, 'follow'])->name('users.follow');
            Route::post('users/{user}/unfollow', [UserController::class, 'unfollow'])->name('users.unfollow');
            Route::post('users/{user}/block',    [UserController::class, 'block'])->name('users.block');
            Route::post('users/{user}/unblock',  [UserController::class, 'unblock'])->name('users.unblock');

            // 08. NOTIFICATIONS
            Route::prefix('notifications')->name('notifications.')->group(function () {
                Route::get('/',           [UserController::class, 'notifications'])->name('index');
                Route::post('read-all',   [UserController::class, 'markAllNotificationsRead'])->name('read-all');
                Route::post('{id}/read',  [UserController::class, 'markNotificationRead'])->name('read');
            });

            // 09. CONVERSATIONS & MESSAGES
            Route::prefix('conversations')->name('conversations.')->group(function () {
                Route::get('/',                  [ConversationController::class, 'index'])->name('index');
                Route::post('/',                 [ConversationController::class, 'store'])->name('store');
                Route::post('join/{token}',      [ConversationController::class, 'joinByInvite'])->name('join');
                Route::get('{conversation}',     [ConversationController::class, 'show'])->name('show');
                Route::post('{conversation}',    [ConversationController::class, 'update'])->name('update');
                Route::post('{conversation}/leave', [ConversationController::class, 'leave'])->name('leave');
                Route::post('{conversation}/read',  [ConversationController::class, 'markAsRead'])->name('read');
                Route::prefix('{conversation}/members')->name('members.')->group(function () {
                    Route::post('/',              [ConversationController::class, 'addMembers'])->name('add');
                    Route::delete('{user}',       [ConversationController::class, 'removeMember'])->name('remove');
                    Route::post('{user}/block',   [ConversationController::class, 'blockMember'])->name('block');
                    Route::post('{user}/unblock', [ConversationController::class, 'unblockMember'])->name('unblock');
                });
                Route::prefix('{conversation}/messages')->name('messages.')->group(function () {
                    Route::get('/',            [MessageController::class, 'index'])->name('index');
                    Route::post('/',           [MessageController::class, 'store'])->name('store');
                    Route::get('{message}',    [MessageController::class, 'show'])->name('show');
                    Route::patch('{message}',  [MessageController::class, 'update'])->name('update');
                    Route::delete('{message}', [MessageController::class, 'destroy'])->name('destroy');
                    Route::post('attachments', [MessageController::class, 'uploadAttachment'])->name('attachments');
                });
                Route::post('{conversation}/calls', [CallController::class, 'store'])->name('calls.store');
            });
            Route::post('messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');

            // 10. CALLS (WebRTC)
            Route::prefix('calls')->name('calls.')->group(function () {
                Route::get('active',                                      [CallController::class, 'active'])->name('active');
                Route::get('{callId}',                                    [CallController::class, 'show'])->name('show');
                Route::post('{callId}/accept',                            [CallController::class, 'accept'])->name('accept');
                Route::post('{callId}/decline',                           [CallController::class, 'decline'])->name('decline');
                Route::post('{callId}/end',                               [CallController::class, 'end'])->name('end');
                Route::post('{callId}/leave',                             [CallController::class, 'leave'])->name('leave');
                Route::post('{callId}/heartbeat',                         [CallController::class, 'heartbeat'])->name('heartbeat');
                Route::post('{callId}/invite',                            [CallController::class, 'invite'])->name('invite');
                Route::post('{callId}/kick',                              [CallController::class, 'kick'])->name('kick');
                Route::post('{callId}/join-link',                         [CallController::class, 'createJoinLink'])->name('join-link');
                Route::post('{callId}/join-requests',                     [CallController::class, 'createJoinRequest'])->name('join-requests.store');
                Route::get('{callId}/join-requests',                      [CallController::class, 'listJoinRequests'])->name('join-requests.index');
                Route::post('{callId}/join-requests/{requestId}/approve', [CallController::class, 'approveJoinRequest'])->name('join-requests.approve');
                Route::post('{callId}/join-requests/{requestId}/reject',  [CallController::class, 'rejectJoinRequest'])->name('join-requests.reject');
                Route::post('{callId}/offer',                             [CallController::class, 'offer'])->name('signal.offer');
                Route::post('{callId}/answer',                            [CallController::class, 'answer'])->name('signal.answer');
                Route::post('{callId}/ice',                               [CallController::class, 'ice'])->name('signal.ice');
                Route::get('{callId}/signals/{type}/{signalId}',          [CallController::class, 'signal'])->name('signals.show');
            });

            // 11. LIVE STREAMS
            Route::prefix('live/streams')->name('live.')->group(function () {
                Route::get('/',            [LiveStreamController::class, 'index'])->name('index');
                Route::post('/',           [LiveStreamController::class, 'store'])->name('store');
                Route::get('{stream}',     [LiveStreamController::class, 'show'])->name('show');
                Route::post('{stream}/start',      [LiveStreamController::class, 'start'])->name('start');
                Route::post('{stream}/end',        [LiveStreamController::class, 'end'])->name('end');
                Route::post('{stream}/heartbeat',  [LiveStreamController::class, 'heartbeat'])->name('heartbeat');
                Route::post('{stream}/join',       [LiveStreamController::class, 'join'])->name('join');
                Route::post('{stream}/like',       [LiveStreamController::class, 'toggleLike'])->name('like');
                Route::post('{stream}/share',      [LiveStreamController::class, 'share'])->name('share');
                Route::get('{stream}/analytics',   [LiveStreamController::class, 'analytics'])->name('analytics');
                Route::post('{stream}/livekit/token', [LiveStreamController::class, 'livekitToken'])->name('livekit-token');
                Route::post('{stream}/signal',     [LiveStreamController::class, 'signal'])->name('signal');
                Route::get('{stream}/signals',     [LiveStreamController::class, 'signals'])->name('signals');
                Route::get('{stream}/chat',                [LiveStreamController::class, 'chatIndex'])->name('chat.index');
                Route::post('{stream}/chat',               [LiveStreamController::class, 'chatStore'])->name('chat.store');
                Route::post('{stream}/chat/{message}/pin', [LiveStreamController::class, 'pinChatMessage'])->name('chat.pin');
                Route::delete('{stream}/chat/{message}',   [LiveStreamController::class, 'deleteChatMessage'])->name('chat.destroy');
                Route::post('{stream}/archive/init',                              [LiveStreamArchiveController::class, 'init'])->name('archive.init');
                Route::post('{stream}/archive/chunk',                             [LiveStreamArchiveController::class, 'chunk'])->name('archive.chunk');
                Route::post('{stream}/archive/complete',                          [LiveStreamArchiveController::class, 'complete'])->name('archive.complete');
                Route::get('{stream}/archive/chunks',                             [LiveStreamArchiveController::class, 'chunks'])->name('archive.chunks');
                Route::get('{stream}/archive/chunks/{chunkIndex}',                [LiveStreamArchiveController::class, 'showChunk'])->whereNumber('chunkIndex')->name('archive.chunk.show');
            });

            // 12. EARN & REWARDS
            Route::prefix('earn')->name('earn.')->group(function () {
                Route::get('queue',     [RewardedV2Controller::class, 'queue'])->name('queue');
                Route::post('{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])->middleware('throttle:90,1')->name('complete');
                Route::get('summary',   [RewardedV2Controller::class, 'earnings'])->name('summary');
                Route::get('transactions', [RewardedV2Controller::class, 'transactions'])->name('transactions');
                Route::get('wallet',    [UserController::class, 'wallet'])->name('wallet');
                Route::get('banks',     [RewardedV2Controller::class, 'bankList'])->name('banks');
                Route::post('banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName'])->name('banks.resolve');
                Route::post('withdraw',      [RewardedV2Controller::class, 'withdraw'])->middleware('throttle:15,1')->name('withdraw');
                Route::get('withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])->middleware('throttle:60,1')->name('withdraw.status');
            });

            // 13. ADS MANAGEMENT
            Route::prefix('ads')->name('ads.')->group(function () {
                Route::get('wallet',                      [AdsV2WalletController::class, 'show'])->name('wallet');
                Route::post('wallet/top-up',              [AdsV2WalletController::class, 'topUp'])->name('wallet.top-up');
                Route::post('wallet/top-up/verify',       [AdsV2WalletController::class, 'verify'])->middleware('throttle:30,1')->name('wallet.top-up.verify');
                Route::post('wallet/deposit',             [AdsV2WalletController::class, 'deposit'])->name('wallet.deposit');
                Route::post('wallet/credit-line/request', [AdsV2WalletController::class, 'requestCreditLine'])->name('wallet.credit-line');
                Route::get('campaigns',                   [AdsV2CampaignController::class, 'index'])->name('campaigns.index');
                Route::post('campaigns',                  [AdsV2CampaignController::class, 'store'])->name('campaigns.store');
                Route::patch('campaigns/{campaign}',      [AdsV2CampaignController::class, 'update'])->name('campaigns.update');
                Route::post('campaigns/{campaign}/submit',[AdsV2CampaignController::class, 'reviewSubmit'])->name('campaigns.submit');
                Route::post('campaigns/{campaign}/pause', [AdsV2CampaignController::class, 'pause'])->name('campaigns.pause');
                Route::post('campaigns/{campaign}/resume',[AdsV2CampaignController::class, 'resume'])->name('campaigns.resume');
                Route::get('creatives',              [AdsV2CreativeController::class, 'index'])->name('creatives.index');
                Route::post('creatives',             [AdsV2CreativeController::class, 'store'])->name('creatives.store');
                Route::get('creatives/{creative}',   [AdsV2CreativeController::class, 'show'])->name('creatives.show');
                Route::patch('creatives/{creative}', [AdsV2CreativeController::class, 'update'])->name('creatives.update');
                Route::post('delivery/request',      [AdsV2DeliveryController::class, 'request'])->middleware('throttle:180,1')->name('delivery.request');
                Route::post('events',                [AdsV2EventController::class, 'store'])->middleware('throttle:360,1')->name('events');
                Route::get('analytics',              [AdsV2AnalyticsController::class, 'summary'])->name('analytics');
                Route::get('analytics/{campaign}',   [AdsV2AnalyticsController::class, 'show'])->name('analytics.campaign');
            });

            // 14. WALLET
            Route::get('wallet', [UserController::class, 'wallet'])->name('wallet');

            // 15. BUSINESS PAGES
            Route::prefix('business-pages')->name('business-pages.')->group(function () {
                Route::get('/',                         [BusinessPageController::class, 'index'])->name('index');
                Route::post('/',                        [BusinessPageController::class, 'store'])->name('store');
                Route::get('{businessPage:slug}',       [BusinessPageController::class, 'show'])->name('show');
                Route::get('{businessPage:slug}/posts', [BusinessPageController::class, 'posts'])->name('posts');
                Route::post('{businessPage:slug}/follow',   [BusinessPageController::class, 'follow'])->name('follow');
                Route::post('{businessPage:slug}/unfollow', [BusinessPageController::class, 'unfollow'])->name('unfollow');
                Route::post('{businessPage:slug}/invite',   [BusinessPageController::class, 'invite'])->name('invite');
            });

            // 16. REFERRALS
            Route::prefix('referrals')->name('referrals.')->group(function () {
                Route::get('stats',     [ReferralController::class, 'stats'])->name('stats');
                Route::post('register', [ReferralController::class, 'register'])->name('register');
                Route::post('complete', [ReferralController::class, 'complete'])->name('complete');
            });

            // 17. SETTINGS & PREFERENCES
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('profile',         [UserController::class, 'profile'])->name('profile');
                Route::patch('profile',       [UserController::class, 'updateProfile'])->name('profile.update');
                Route::post('profile/avatar', [UserController::class, 'updateAvatar'])->name('profile.avatar');
                Route::post('profile/cover',  [UserController::class, 'updateCover'])->name('profile.cover');
                Route::get('privacy',         [UserController::class, 'privacy'])->name('privacy');
                Route::patch('privacy',       [UserController::class, 'updatePrivacy'])->name('privacy.update');
                Route::patch('notifications', [UserController::class, 'updateNotificationSettings'])->name('notifications.update');
                Route::get('onboarding',      [UserController::class, 'onboarding'])->name('onboarding');
                Route::post('onboarding',     [UserController::class, 'completeOnboarding'])->name('onboarding.complete');
                Route::get('monetization',    [UserController::class, 'monetizationDashboard'])->name('monetization');
                Route::post('monetization/paystack/init',   [UserController::class, 'initializeMonetizationPaystack'])->name('monetization.paystack.init');
                Route::post('monetization/paystack/verify', [UserController::class, 'verifyMonetizationPaystack'])->name('monetization.paystack.verify');
                Route::get('verification',                  [UserVerificationRequestController::class, 'show'])->name('verification');
                Route::post('verification',                 [UserVerificationRequestController::class, 'store'])->name('verification.store');
                Route::post('verification/paystack/verify', [UserVerificationRequestController::class, 'verifyPaystack'])->name('verification.paystack.verify');
                Route::get('earnings/posts',        [UserController::class, 'postEarnings'])->name('earnings.posts');
                Route::get('earnings/daily',        [UserController::class, 'dailyPostReports'])->name('earnings.daily');
                Route::get('earnings/monetization', [UserController::class, 'monetizationDashboard'])->name('earnings.monetization');
            });

            // 18. PUSH TOKENS
            Route::prefix('push-tokens')->name('push-tokens.')->group(function () {
                Route::get('/',              [PushTokenController::class, 'index'])->name('index');
                Route::post('/',             [PushTokenController::class, 'upsert'])->name('upsert');
                Route::delete('{tokenOrId}', [PushTokenController::class, 'destroy'])->name('destroy');
            });

            // 19. AI ASSISTANT
            Route::post('ai/chat', [KwatiAiController::class, 'chat'])->middleware('throttle:30,1')->name('ai.chat');

            // 20. UTILITIES
            Route::get('ws/health', [ReverbHealthController::class, 'show'])->name('ws.health');

            // ============================================================
            // 21. PAYMENTS — Paystack + Kwatibank
            // ============================================================
            Route::prefix('payments')->name('payments.')->group(function () {

                // -- Kwatibank: bank list & account name verification ----
                Route::get('banks',          [RewardedV2Controller::class, 'bankList'])->name('banks');
                Route::post('banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName'])->name('banks.resolve');

                // -- Kwatibank: withdrawal --------------------------------
                Route::post('withdraw',                      [RewardedV2Controller::class, 'withdraw'])->middleware('throttle:15,1')->name('withdraw');
                Route::get('withdraw/status/{reference}',    [RewardedV2Controller::class, 'withdrawalStatus'])->middleware('throttle:60,1')->name('withdraw.status');
                Route::get('withdraw/balance',               [RewardedV2Controller::class, 'interfaceBalance'])->name('withdraw.balance');

                // -- Paystack: KaraVerified badge -------------------------
                Route::post('badge/init',   [UserVerificationRequestController::class, 'store'])->name('badge.init');
                Route::post('badge/verify', [UserVerificationRequestController::class, 'verifyPaystack'])->name('badge.verify');
                Route::get('badge/status',  [UserVerificationRequestController::class, 'show'])->name('badge.status');

                // -- Paystack: ads wallet top-up --------------------------
                Route::post('ads-wallet/init',   [AdsV2WalletController::class, 'topUp'])->name('ads-wallet.init');
                Route::post('ads-wallet/verify', [AdsV2WalletController::class, 'verify'])->middleware('throttle:30,1')->name('ads-wallet.verify');

                // -- Paystack: monetization unlock ------------------------
                Route::post('monetization/init',   [UserController::class, 'initializeMonetizationPaystack'])->name('monetization.init');
                Route::post('monetization/verify', [UserController::class, 'verifyMonetizationPaystack'])->name('monetization.verify');
            });
        });
    });

// ============================================================
// Paystack server-to-server webhooks (no auth, public)
// Paystack POSTs to these after payment events
// ============================================================
Route::prefix('v3/payments/paystack')->name('api.v3.payments.paystack.')->group(function () {
    Route::post('webhook/badge',        [UserVerificationRequestController::class, 'paystackWebhook'])->name('webhook.badge');
    Route::post('webhook/ads-wallet',   [AdsV2WalletController::class, 'topUpWebhook'])->name('webhook.ads-wallet');
    Route::post('webhook/monetization', [UserController::class, 'monetizationPaystackWebhook'])->name('webhook.monetization');
});

// Broadcasting auth kept outside WrapV12ApiResponse (Reverb expects raw Pusher payload)
Route::post('v3/broadcasting/auth', [BroadcastController::class, 'authenticate'])
    ->middleware('auth:sanctum');