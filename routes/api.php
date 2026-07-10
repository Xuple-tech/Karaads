<?php

use App\Http\Controllers\Api\AppDownloadTrackController;
use App\Http\Controllers\Api\BusinessPageController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\KwatiAiController;
use App\Http\Controllers\Api\HomeEngagementController;
use App\Http\Controllers\Api\LiveStreamArchiveController;
use App\Http\Controllers\Api\LiveStreamController;
use App\Http\Controllers\Api\UnifiedFeedController;
use App\Http\Controllers\Api\ReverbHealthController;
use App\Http\Controllers\Api\V2\AdsCampaignController as AdsV2CampaignController;
use App\Http\Controllers\Api\V2\AdsCreativeController as AdsV2CreativeController;
use App\Http\Controllers\Api\V2\AdsDeliveryController as AdsV2DeliveryController;
use App\Http\Controllers\Api\V2\AdsEventController as AdsV2EventController;
use App\Http\Controllers\Api\V2\AdsWalletController as AdsV2WalletController;
use App\Http\Controllers\Api\V2\RewardedController as RewardedV2Controller;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PushTokenController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserVerificationRequestController;
use App\Http\Controllers\Api\Mobile\AccountActivationController as MobileAccountActivationController;
use App\Http\Controllers\Api\Mobile\AuthController as MobileAuthController;
use App\Http\Controllers\Api\Mobile\EmailVerificationController as MobileEmailVerificationController;
use App\Http\Controllers\Api\Mobile\PasswordController as MobilePasswordController;
use App\Http\Controllers\Api\Mobile\PasswordResetController as MobilePasswordResetController;
use App\Http\Controllers\Api\Mobile\TwoFactorController as MobileTwoFactorController;
use App\Http\Middleware\WrapV12ApiResponse;
use App\Http\Controllers\ReferralController;
use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function () {
    Route::get('/posts/{post}', [PostController::class, 'show'])
        ->whereUuid('post');

    // Paystack callback route (browser redirect after checkout)
    Route::get('/v2/payment/9eiru848596845/wallet/top-up/webhook', [AdsV2WalletController::class, 'topUpWebhook']);
    Route::get('/payment/kara-verified/paystack/callback', [UserVerificationRequestController::class, 'paystackCallback']);
    Route::get('/payment/monetization/paystack/callback', [UserController::class, 'monetizationPaystackCallback']);
});

// Paystack server webhook route (must be publicly reachable)
Route::post('/v2/ads/wallet/top-up/webhook', [AdsV2WalletController::class, 'topUpWebhook'])
    ->middleware('throttle:240,1');
Route::post('/payment/kara-verified/paystack/webhook', [UserVerificationRequestController::class, 'paystackWebhook'])
    ->middleware('throttle:240,1');
Route::post('/payment/monetization/paystack/webhook', [UserController::class, 'monetizationPaystackWebhook'])
    ->middleware('throttle:240,1');

// App download tracking (public, throttled)
Route::post('/app/download-track', [AppDownloadTrackController::class, 'store'])
    ->middleware(['web', 'throttle:60,1']);

// Protected routes (authenticated users only)
Route::middleware(['web', 'auth', 'verified'])->group(function () {
    // Posts - Feed and write operations

    // Public read-only routes (guest or authenticated)
    Route::get('/posts/trending', [PostController::class, 'trending']);
    Route::get('/posts/moments', [PostController::class, 'moments']);
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/hashtag/{tag}', [PostController::class, 'hashtag']);
    Route::get('/trending', [PostController::class, 'getTrendingTopics']);
    Route::get('/business-pages', [BusinessPageController::class, 'index']);
    Route::post('/business-pages', [BusinessPageController::class, 'store']);
    Route::get('/business-pages/{businessPage:slug}', [BusinessPageController::class, 'show']);
    Route::get('/business-pages/{businessPage:slug}/posts', [BusinessPageController::class, 'posts']);
    Route::post('/business-pages/{businessPage:slug}/follow', [BusinessPageController::class, 'follow']);
    Route::post('/business-pages/{businessPage:slug}/unfollow', [BusinessPageController::class, 'unfollow']);
    Route::post('/business-pages/{businessPage:slug}/invite', [BusinessPageController::class, 'invite']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/stories', [StoryController::class, 'index']);
    Route::post('/stories', [StoryController::class, 'store']);
    Route::get('/stories/{story}', [StoryController::class, 'show']);
    Route::post('/stories/{story}/view', [StoryController::class, 'view']);
    Route::post('/stories/{story}/reaction', [StoryController::class, 'react']);
    Route::delete('/stories/{story}', [StoryController::class, 'destroy']);

    Route::get('/posts/feed', [PostController::class, 'feed']);
    Route::get('/feed/unified', [UnifiedFeedController::class, 'index']);
    Route::get('/home/engagement', [HomeEngagementController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::patch('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);
    Route::post('/posts/{post}/like', [PostController::class, 'like']);
    Route::post('/posts/{post}/unlike', [PostController::class, 'unlike']);
    Route::post('/posts/{post}/engagement', [PostController::class, 'engagement']);
    Route::post('/posts/{post}/reshare', [PostController::class, 'reshare']);
    Route::post('/posts/{post}/unreshare', [PostController::class, 'unreshare']);
    Route::post('/posts/{post}/save', [PostController::class, 'save']);
    Route::post('/posts/{post}/unsave', [PostController::class, 'unsave']);
    Route::get('/bookmarks', [UserController::class, 'bookmarks']);
    Route::post('/posts/{post}/comment', [PostController::class, 'comment']);
    Route::get('/posts/{post}/comments', [PostController::class, 'getComments']);
    Route::get('/posts/{post}/comments/{comment}/replies', [PostController::class, 'getCommentReplies']);
    Route::post('/posts/{post}/comments/{comment}/like', [PostController::class, 'likeComment']);
    Route::post('/posts/{post}/comments/{comment}/unlike', [PostController::class, 'unlikeComment']);

    // Users - Profile and write operations
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::patch('/users/profile', [UserController::class, 'updateProfile']);
    Route::get('/users/onboarding', [UserController::class, 'onboarding']);
    Route::post('/users/onboarding', [UserController::class, 'completeOnboarding']);
    Route::get('/users/notifications', [UserController::class, 'notifications']);
    Route::get('/users/post-daily-reports', [UserController::class, 'dailyPostReports']);
    Route::get('/users/post-earnings', [UserController::class, 'postEarnings']);
    Route::get('/users/monetization-dashboard', [UserController::class, 'monetizationDashboard']);
    Route::post('/users/monetization-dashboard/paystack/init', [UserController::class, 'initializeMonetizationPaystack']);
    Route::post('/users/monetization-dashboard/paystack/verify', [UserController::class, 'verifyMonetizationPaystack']);
    Route::get('/users/following', [UserController::class, 'getFollowing']);
    Route::get('/users/search', [UserController::class, 'index']);
    Route::get('/users/privacy', [UserController::class, 'privacy']);
    Route::patch('/users/privacy', [UserController::class, 'updatePrivacy']);
    Route::patch('/users/notification-settings', [UserController::class, 'updateNotificationSettings']);
    Route::get('/users/verification-request', [UserVerificationRequestController::class, 'show']);
    Route::post('/users/verification-request', [UserVerificationRequestController::class, 'store']);
    Route::post('/users/verification-request/paystack/verify', [UserVerificationRequestController::class, 'verifyPaystack']);
    Route::get('/users/blocked', [UserController::class, 'blockedUsers']);
    Route::get('/users/by-username/{username}', [UserController::class, 'byUsername']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::get('/users/{user}/posts', [UserController::class, 'posts']);
    Route::get('/users/{user}/followers', [UserController::class, 'followers']);
    Route::get('/users/{user}/following', [UserController::class, 'followingList']);
    Route::post('/users/{user}/follow', [UserController::class, 'follow']);
    Route::post('/users/{user}/unfollow', [UserController::class, 'unfollow']);
    Route::post('/users/{user}/block', [UserController::class, 'block']);
    Route::post('/users/{user}/unblock', [UserController::class, 'unblock']);

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::post('/conversations/join/{token}', [ConversationController::class, 'joinByInvite']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}', [ConversationController::class, 'update']);
    Route::post('/conversations/{conversation}/members', [ConversationController::class, 'addMembers']);
    Route::delete('/conversations/{conversation}/members/{user}', [ConversationController::class, 'removeMember']);
    Route::post('/conversations/{conversation}/members/{user}/block', [ConversationController::class, 'blockMember']);
    Route::post('/conversations/{conversation}/members/{user}/unblock', [ConversationController::class, 'unblockMember']);
    Route::post('/conversations/{conversation}/leave', [ConversationController::class, 'leave']);
    Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markAsRead']);

    // Messages
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::get('/conversations/{conversation}/messages/{message}', [MessageController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::patch('/conversations/{conversation}/messages/{message}', [MessageController::class, 'update']);
    Route::post('/conversations/{conversation}/attachments', [MessageController::class, 'uploadAttachment']);
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);

    // Calls (WebRTC signaling over Reverb)
    Route::post('/conversations/{conversation}/calls', [CallController::class, 'store']);
    Route::get('/calls/active', [CallController::class, 'active']);
    Route::get('/calls/{callId}', [CallController::class, 'show']);
    Route::post('/calls/{callId}/accept', [CallController::class, 'accept']);
    Route::post('/calls/{callId}/decline', [CallController::class, 'decline']);
    Route::post('/calls/{callId}/end', [CallController::class, 'end']);
    Route::post('/calls/{callId}/leave', [CallController::class, 'leave']);
    Route::post('/calls/{callId}/heartbeat', [CallController::class, 'heartbeat']);
    Route::post('/calls/{callId}/offer', [CallController::class, 'offer']);
    Route::post('/calls/{callId}/answer', [CallController::class, 'answer']);
    Route::post('/calls/{callId}/ice', [CallController::class, 'ice']);
    Route::post('/calls/{callId}/invite', [CallController::class, 'invite']);
    Route::post('/calls/{callId}/kick', [CallController::class, 'kick']);
    Route::post('/calls/{callId}/join-link', [CallController::class, 'createJoinLink']);
    Route::post('/calls/{callId}/join-requests', [CallController::class, 'createJoinRequest']);
    Route::get('/calls/{callId}/join-requests', [CallController::class, 'listJoinRequests']);
    Route::post('/calls/{callId}/join-requests/{requestId}/approve', [CallController::class, 'approveJoinRequest']);
    Route::post('/calls/{callId}/join-requests/{requestId}/reject', [CallController::class, 'rejectJoinRequest']);
    Route::get('/calls/{callId}/signals/{type}/{signalId}', [CallController::class, 'signal']);

    // Reverb health
    Route::get('/reverb/health', [ReverbHealthController::class, 'show']);

    // Live streams (P2P WebRTC + chat + archive)
    Route::get('/live/streams', [LiveStreamController::class, 'index']);
    Route::post('/live/streams', [LiveStreamController::class, 'store']);
    Route::get('/live/streams/{stream}', [LiveStreamController::class, 'show']);
    Route::post('/live/streams/{stream}/start', [LiveStreamController::class, 'start']);
    Route::post('/live/streams/{stream}/end', [LiveStreamController::class, 'end']);
    Route::post('/live/streams/{stream}/heartbeat', [LiveStreamController::class, 'heartbeat']);
    Route::post('/live/streams/{stream}/livekit/token', [LiveStreamController::class, 'livekitToken']);
    Route::post('/live/streams/{stream}/join', [LiveStreamController::class, 'join']);
    Route::post('/live/streams/{stream}/signal', [LiveStreamController::class, 'signal']);
    Route::get('/live/streams/{stream}/signals', [LiveStreamController::class, 'signals']);
    Route::post('/live/streams/{stream}/like', [LiveStreamController::class, 'toggleLike']);
    Route::post('/live/streams/{stream}/share', [LiveStreamController::class, 'share']);
    Route::get('/live/streams/{stream}/analytics', [LiveStreamController::class, 'analytics']);
    Route::get('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatIndex']);
    Route::post('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatStore']);
    Route::post('/live/streams/{stream}/chat/{message}/pin', [LiveStreamController::class, 'pinChatMessage']);
    Route::delete('/live/streams/{stream}/chat/{message}', [LiveStreamController::class, 'deleteChatMessage']);
    Route::post('/live/streams/{stream}/archive/init', [LiveStreamArchiveController::class, 'init']);
    Route::post('/live/streams/{stream}/archive/chunk', [LiveStreamArchiveController::class, 'chunk']);
    Route::post('/live/streams/{stream}/archive/complete', [LiveStreamArchiveController::class, 'complete']);
    Route::get('/live/streams/{stream}/archive/chunks', [LiveStreamArchiveController::class, 'chunks']);
    Route::get('/live/streams/{stream}/archive/chunks/{chunkIndex}', [LiveStreamArchiveController::class, 'showChunk'])
        ->whereNumber('chunkIndex');

    // Ads V2 - Big-bang runtime cutover
    Route::prefix('/v2')->group(function () {
        Route::get('/ads/wallet', [AdsV2WalletController::class, 'show']);
        Route::post('/ads/wallet/deposit', [AdsV2WalletController::class, 'deposit']);
        Route::post('/ads/wallet/credit-line/request', [AdsV2WalletController::class, 'requestCreditLine']);
        Route::post('/ads/wallet/top-up', [AdsV2WalletController::class, 'topUp']);
        Route::post('/ads/wallet/top-up/verify', [AdsV2WalletController::class, 'verify'])
            ->middleware('throttle:30,1');

        Route::get('/ads/campaigns', [AdsV2CampaignController::class, 'index']);
        Route::post('/ads/campaigns', [AdsV2CampaignController::class, 'store']);
        Route::patch('/ads/campaigns/{campaign}', [AdsV2CampaignController::class, 'update']);
        Route::post('/ads/campaigns/{campaign}/review-submit', [AdsV2CampaignController::class, 'reviewSubmit']);
        Route::post('/ads/campaigns/{campaign}/pause', [AdsV2CampaignController::class, 'pause']);
        Route::post('/ads/campaigns/{campaign}/resume', [AdsV2CampaignController::class, 'resume']);

        Route::get('/ads/creatives', [AdsV2CreativeController::class, 'index']);
        Route::post('/ads/creatives', [AdsV2CreativeController::class, 'store']);
        Route::patch('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'update']);
        Route::get('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'show']);

        Route::post('/ads/delivery/request', [AdsV2DeliveryController::class, 'request'])
            ->middleware('throttle:180,1');
        Route::post('/ads/events', [AdsV2EventController::class, 'store'])
            ->middleware('throttle:360,1');
        Route::get('/ads/analytics/summary', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'summary']);
        Route::get('/ads/analytics/campaigns/{campaign}', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'show']);

        Route::get('/rewarded/queue', [RewardedV2Controller::class, 'queue']);
        Route::post('/rewarded/{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])
            ->middleware('throttle:90,1');
        Route::get('/rewarded/earnings', [RewardedV2Controller::class, 'earnings']);
        Route::get('/rewarded/transactions', [RewardedV2Controller::class, 'transactions']);
        Route::get('/rewarded/banks', [RewardedV2Controller::class, 'bankList']);
        Route::post('/rewarded/banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName']);
        Route::post('/rewarded/withdraw', [RewardedV2Controller::class, 'withdraw'])
            ->middleware('throttle:15,1');
        Route::get('/rewarded/withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])
            ->middleware('throttle:60,1');
        Route::get('/rewarded/interface/balance', [RewardedV2Controller::class, 'interfaceBalance']);

    });

    // Wallet - User balance and earnings
    Route::get('/wallet', [UserController::class, 'wallet']);

    // Referrals - Referral program management
    Route::get('/referrals/stats', [ReferralController::class, 'stats']);
    Route::post('/referrals/register', [ReferralController::class, 'register']);
    Route::post('/referrals/complete', [ReferralController::class, 'complete']);
    Route::post('/kwati-ai/chat', [KwatiAiController::class, 'chat'])->middleware('throttle:30,1');
});

// Mobile API v1.1 Routes - Token-based authentication with Sanctum
Route::prefix('open-labs/oyibo/v1.1')->group(function () {
    // Public authentication endpoints (no auth required)
    Route::post('/auth/login', [MobileAuthController::class, 'login']);
    Route::post('/auth/register', [MobileAuthController::class, 'register']);
    Route::post('/auth/verify-2fa', [MobileAuthController::class, 'verify2FA']);

    // Public read endpoints
    Route::get('/posts/{post}', [PostController::class, 'show'])
        ->whereUuid('post');

    // Protected routes (authenticated users only via Sanctum bearer token)
    Route::middleware(['auth:sanctum', 'verified'])->group(function () {
        // Auth endpoints
        Route::post('/auth/logout', [MobileAuthController::class, 'logout']);
        Route::get('/auth/me', [MobileAuthController::class, 'me']);

        // Posts - Feed and write operations
        Route::get('/posts/trending', [PostController::class, 'trending']);
        Route::get('/posts/moments', [PostController::class, 'moments']);
        Route::get('/posts/feed', [PostController::class, 'feed']);
        Route::get('/posts/hashtag/{tag}', [PostController::class, 'hashtag']);
        Route::get('/posts', [PostController::class, 'index']);
        Route::get('/feed/unified', [UnifiedFeedController::class, 'index']);
        Route::get('/home/engagement', [HomeEngagementController::class, 'index']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::patch('/posts/{post}', [PostController::class, 'update']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);
        Route::post('/posts/{post}/like', [PostController::class, 'like']);
        Route::post('/posts/{post}/unlike', [PostController::class, 'unlike']);
        Route::post('/posts/{post}/engagement', [PostController::class, 'engagement']);
        Route::post('/posts/{post}/reshare', [PostController::class, 'reshare']);
        Route::post('/posts/{post}/unreshare', [PostController::class, 'unreshare']);
        Route::post('/posts/{post}/save', [PostController::class, 'save']);
        Route::post('/posts/{post}/unsave', [PostController::class, 'unsave']);
        Route::get('/bookmarks', [UserController::class, 'bookmarks']);
        Route::post('/posts/{post}/comment', [PostController::class, 'comment']);
        Route::get('/posts/{post}/comments', [PostController::class, 'getComments']);
        Route::get('/posts/{post}/comments/{comment}/replies', [PostController::class, 'getCommentReplies']);
        Route::post('/posts/{post}/comments/{comment}/like', [PostController::class, 'likeComment']);
        Route::post('/posts/{post}/comments/{comment}/unlike', [PostController::class, 'unlikeComment']);

        // Business pages
        Route::get('/business-pages', [BusinessPageController::class, 'index']);
        Route::post('/business-pages', [BusinessPageController::class, 'store']);
        Route::get('/business-pages/{businessPage:slug}', [BusinessPageController::class, 'show']);
        Route::get('/business-pages/{businessPage:slug}/posts', [BusinessPageController::class, 'posts']);
        Route::post('/business-pages/{businessPage:slug}/follow', [BusinessPageController::class, 'follow']);
        Route::post('/business-pages/{businessPage:slug}/unfollow', [BusinessPageController::class, 'unfollow']);
        Route::post('/business-pages/{businessPage:slug}/invite', [BusinessPageController::class, 'invite']);

        // Users - Profile and write operations
        Route::get('/users/profile', [UserController::class, 'profile']);
        Route::patch('/users/profile', [UserController::class, 'updateProfile']);
        // Dedicated multipart upload endpoints for mobile (PATCH doesn't reliably carry files)
        Route::post('/users/profile/cover', [UserController::class, 'updateCover']);
        Route::post('/users/profile/avatar', [UserController::class, 'updateAvatar']);
        Route::get('/users/onboarding', [UserController::class, 'onboarding']);
        Route::post('/users/onboarding', [UserController::class, 'completeOnboarding']);
        Route::get('/users/notifications', [UserController::class, 'notifications']);
        Route::get('/users/post-daily-reports', [UserController::class, 'dailyPostReports']);
        Route::get('/users/post-earnings', [UserController::class, 'postEarnings']);
        Route::get('/users/monetization-dashboard', [UserController::class, 'monetizationDashboard']);
        Route::post('/users/monetization-dashboard/paystack/init', [UserController::class, 'initializeMonetizationPaystack']);
        Route::post('/users/monetization-dashboard/paystack/verify', [UserController::class, 'verifyMonetizationPaystack']);
        Route::patch('/users/notification-settings', [UserController::class, 'updateNotificationSettings']);
        Route::get('/users/verification-request', [UserVerificationRequestController::class, 'show']);
        Route::post('/users/verification-request', [UserVerificationRequestController::class, 'store']);
        Route::post('/users/verification-request/paystack/verify', [UserVerificationRequestController::class, 'verifyPaystack']);
        Route::get('/users/following', [UserController::class, 'getFollowing']);
        Route::get('/users/search', [UserController::class, 'index']);
        Route::get('/users/privacy', [UserController::class, 'privacy']);
        Route::patch('/users/privacy', [UserController::class, 'updatePrivacy']);
        Route::get('/users/blocked', [UserController::class, 'blockedUsers']);
        Route::get('/users/by-username/{username}', [UserController::class, 'byUsername']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::get('/users/{user}/posts', [UserController::class, 'posts']);
        Route::get('/users/{user}/followers', [UserController::class, 'followers']);
        Route::get('/users/{user}/following', [UserController::class, 'followingList']);
        Route::post('/users/{user}/follow', [UserController::class, 'follow']);
        Route::post('/users/{user}/unfollow', [UserController::class, 'unfollow']);
        Route::post('/users/{user}/block', [UserController::class, 'block']);
        Route::post('/users/{user}/unblock', [UserController::class, 'unblock']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/wallet', [UserController::class, 'wallet']);

        // Trending
        Route::get('/trending', [PostController::class, 'getTrendingTopics']);

        // Search
        Route::get('/search', [PostController::class, 'search']);

        // Posts - Feed and write operations (continued with new endpoints)
        Route::post('/posts/{post}/report', [PostController::class, 'report']);

        // Stories
        Route::get('/stories', [StoryController::class, 'index']);
        Route::post('/stories', [StoryController::class, 'store']);
        Route::get('/stories/{story}', [StoryController::class, 'show']);
        Route::post('/stories/{story}/view', [StoryController::class, 'view']);
        Route::post('/stories/{story}/reaction', [StoryController::class, 'react']);
        Route::delete('/stories/{story}', [StoryController::class, 'destroy']);

        // Conversations
        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::post('/conversations', [ConversationController::class, 'store']);
        Route::post('/conversations/join/{token}', [ConversationController::class, 'joinByInvite']);
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('/conversations/{conversation}', [ConversationController::class, 'update']);
        Route::post('/conversations/{conversation}/members', [ConversationController::class, 'addMembers']);
        Route::delete('/conversations/{conversation}/members/{user}', [ConversationController::class, 'removeMember']);
        Route::post('/conversations/{conversation}/members/{user}/block', [ConversationController::class, 'blockMember']);
        Route::post('/conversations/{conversation}/members/{user}/unblock', [ConversationController::class, 'unblockMember']);
        Route::post('/conversations/{conversation}/leave', [ConversationController::class, 'leave']);
        Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markAsRead']);

        // Messages
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
        Route::get('/conversations/{conversation}/messages/{message}', [MessageController::class, 'show']);
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
        Route::patch('/conversations/{conversation}/messages/{message}', [MessageController::class, 'update']);
        Route::post('/conversations/{conversation}/attachments', [MessageController::class, 'uploadAttachment']);
        Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);

        // Push tokens
        Route::get('/push-tokens', [PushTokenController::class, 'index']);
        Route::post('/push-tokens', [PushTokenController::class, 'upsert']);
        Route::delete('/push-tokens/{tokenOrId}', [PushTokenController::class, 'destroy']);

        // Calls (WebRTC signaling over Reverb)
        Route::post('/conversations/{conversation}/calls', [CallController::class, 'store']);
        Route::get('/calls/active', [CallController::class, 'active']);
        Route::get('/calls/{callId}', [CallController::class, 'show']);
        Route::post('/calls/{callId}/accept', [CallController::class, 'accept']);
        Route::post('/calls/{callId}/decline', [CallController::class, 'decline']);
        Route::post('/calls/{callId}/end', [CallController::class, 'end']);
        Route::post('/calls/{callId}/leave', [CallController::class, 'leave']);
        Route::post('/calls/{callId}/heartbeat', [CallController::class, 'heartbeat']);
        Route::post('/calls/{callId}/offer', [CallController::class, 'offer']);
        Route::post('/calls/{callId}/answer', [CallController::class, 'answer']);
        Route::post('/calls/{callId}/ice', [CallController::class, 'ice']);
        Route::post('/calls/{callId}/invite', [CallController::class, 'invite']);
        Route::post('/calls/{callId}/kick', [CallController::class, 'kick']);
        Route::post('/calls/{callId}/join-link', [CallController::class, 'createJoinLink']);
        Route::post('/calls/{callId}/join-requests', [CallController::class, 'createJoinRequest']);
        Route::get('/calls/{callId}/join-requests', [CallController::class, 'listJoinRequests']);
        Route::post('/calls/{callId}/join-requests/{requestId}/approve', [CallController::class, 'approveJoinRequest']);
        Route::post('/calls/{callId}/join-requests/{requestId}/reject', [CallController::class, 'rejectJoinRequest']);
        Route::get('/calls/{callId}/signals/{type}/{signalId}', [CallController::class, 'signal']);

        // Reverb health
        Route::get('/reverb/health', [ReverbHealthController::class, 'show']);

        // Live streams
        Route::get('/live/streams', [LiveStreamController::class, 'index']);
        Route::post('/live/streams', [LiveStreamController::class, 'store']);
        Route::get('/live/streams/{stream}', [LiveStreamController::class, 'show']);
        Route::post('/live/streams/{stream}/start', [LiveStreamController::class, 'start']);
        Route::post('/live/streams/{stream}/end', [LiveStreamController::class, 'end']);
        Route::post('/live/streams/{stream}/heartbeat', [LiveStreamController::class, 'heartbeat']);
        Route::post('/live/streams/{stream}/livekit/token', [LiveStreamController::class, 'livekitToken']);
        Route::post('/live/streams/{stream}/join', [LiveStreamController::class, 'join']);
        Route::post('/live/streams/{stream}/signal', [LiveStreamController::class, 'signal']);
        Route::get('/live/streams/{stream}/signals', [LiveStreamController::class, 'signals']);
        Route::post('/live/streams/{stream}/like', [LiveStreamController::class, 'toggleLike']);
        Route::post('/live/streams/{stream}/share', [LiveStreamController::class, 'share']);
        Route::get('/live/streams/{stream}/analytics', [LiveStreamController::class, 'analytics']);
        Route::get('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatIndex']);
        Route::post('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatStore']);
        Route::post('/live/streams/{stream}/chat/{message}/pin', [LiveStreamController::class, 'pinChatMessage']);
        Route::delete('/live/streams/{stream}/chat/{message}', [LiveStreamController::class, 'deleteChatMessage']);
        Route::post('/live/streams/{stream}/archive/init', [LiveStreamArchiveController::class, 'init']);
        Route::post('/live/streams/{stream}/archive/chunk', [LiveStreamArchiveController::class, 'chunk']);
        Route::post('/live/streams/{stream}/archive/complete', [LiveStreamArchiveController::class, 'complete']);
        Route::get('/live/streams/{stream}/archive/chunks', [LiveStreamArchiveController::class, 'chunks']);
        Route::get('/live/streams/{stream}/archive/chunks/{chunkIndex}', [LiveStreamArchiveController::class, 'showChunk'])
            ->whereNumber('chunkIndex');

        // Ads V2
        Route::get('/ads/wallet', [AdsV2WalletController::class, 'show']);
        Route::post('/ads/wallet/deposit', [AdsV2WalletController::class, 'deposit']);
        Route::post('/ads/wallet/credit-line/request', [AdsV2WalletController::class, 'requestCreditLine']);
        Route::post('/ads/wallet/top-up', [AdsV2WalletController::class, 'topUp']);
        Route::post('/ads/wallet/top-up/verify', [AdsV2WalletController::class, 'verify'])
            ->middleware('throttle:30,1');

        Route::get('/ads/campaigns', [AdsV2CampaignController::class, 'index']);
        Route::post('/ads/campaigns', [AdsV2CampaignController::class, 'store']);
        Route::patch('/ads/campaigns/{campaign}', [AdsV2CampaignController::class, 'update']);
        Route::post('/ads/campaigns/{campaign}/review-submit', [AdsV2CampaignController::class, 'reviewSubmit']);
        Route::post('/ads/campaigns/{campaign}/pause', [AdsV2CampaignController::class, 'pause']);
        Route::post('/ads/campaigns/{campaign}/resume', [AdsV2CampaignController::class, 'resume']);

        Route::get('/ads/creatives', [AdsV2CreativeController::class, 'index']);
        Route::post('/ads/creatives', [AdsV2CreativeController::class, 'store']);
        Route::patch('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'update']);
        Route::get('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'show']);

        Route::post('/ads/delivery/request', [AdsV2DeliveryController::class, 'request'])
            ->middleware('throttle:180,1');
        Route::post('/ads/events', [AdsV2EventController::class, 'store'])
            ->middleware('throttle:360,1');
        Route::get('/ads/analytics/summary', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'summary']);
        Route::get('/ads/analytics/campaigns/{campaign}', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'show']);

        Route::get('/rewarded/queue', [RewardedV2Controller::class, 'queue']);
        Route::post('/rewarded/{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])
            ->middleware('throttle:90,1');
        Route::get('/rewarded/earnings', [RewardedV2Controller::class, 'earnings']);
        Route::get('/rewarded/transactions', [RewardedV2Controller::class, 'transactions']);
        Route::get('/rewarded/banks', [RewardedV2Controller::class, 'bankList']);
        Route::post('/rewarded/banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName']);
        Route::post('/rewarded/withdraw', [RewardedV2Controller::class, 'withdraw'])
            ->middleware('throttle:15,1');
        Route::get('/rewarded/withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])
            ->middleware('throttle:60,1');
        Route::get('/rewarded/interface/balance', [RewardedV2Controller::class, 'interfaceBalance']);

        // Earnings aliases for mobile apps (v1.1)
        Route::get('/earnings/queue', [RewardedV2Controller::class, 'queue']);
        Route::post('/earnings/{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])
            ->middleware('throttle:90,1');
        Route::get('/earnings/summary', [RewardedV2Controller::class, 'earnings']);
        Route::get('/earnings/transactions', [RewardedV2Controller::class, 'transactions']);
        Route::get('/earnings/banks', [RewardedV2Controller::class, 'bankList']);
        Route::post('/earnings/banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName']);
        Route::post('/earnings/withdraw', [RewardedV2Controller::class, 'withdraw'])
            ->middleware('throttle:15,1');
        Route::get('/earnings/withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])
            ->middleware('throttle:60,1');
        Route::get('/earnings/interface/balance', [RewardedV2Controller::class, 'interfaceBalance']);
        Route::get('/earnings/wallet', [UserController::class, 'wallet']);

        // Referrals
        Route::get('/referrals/stats', [ReferralController::class, 'stats']);
        Route::post('/referrals/register', [ReferralController::class, 'register']);
        Route::post('/referrals/complete', [ReferralController::class, 'complete']);
        Route::post('/kwati-ai/chat', [KwatiAiController::class, 'chat'])->middleware('throttle:30,1');
    });
});

// Mobile API v1.2 Routes - Normalized response envelope + backward-compatible behavior
Route::prefix('open-labs/oyibo/v1.2')
    ->middleware(WrapV12ApiResponse::class)
    ->group(function () {
        // Public authentication endpoints (no auth required)
        Route::post('/auth/login', [MobileAuthController::class, 'login']);
        Route::post('/auth/register', [MobileAuthController::class, 'register']);
        Route::post('/auth/verify-2fa', [MobileAuthController::class, 'verify2FA']);
        Route::post('/auth/account-activation/send-code', [MobileAccountActivationController::class, 'sendCode']);
        Route::post('/auth/account-activation/verify-code', [MobileAccountActivationController::class, 'verifyCode']);
        Route::post('/auth/account-activation/set-password', [MobileAccountActivationController::class, 'setPassword']);
        Route::post('/auth/password/forgot', [MobilePasswordResetController::class, 'forgot']);
        Route::post('/auth/password/reset', [MobilePasswordResetController::class, 'reset']);

        // Public read endpoints
        Route::get('/posts/{post}', [PostController::class, 'show'])
            ->whereUuid('post');

        // Auth-only endpoints (authenticated users, email not required)
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/auth/verify-email/otp/send-code', [MobileEmailVerificationController::class, 'sendCode']);
            Route::post('/auth/verify-email/otp/verify-code', [MobileEmailVerificationController::class, 'verifyCode']);
            Route::post('/auth/password/change', [MobilePasswordController::class, 'change']);
            Route::post('/auth/2fa/enable', [MobileTwoFactorController::class, 'enable']);
            Route::post('/auth/2fa/confirm', [MobileTwoFactorController::class, 'confirm']);
            Route::post('/auth/2fa/disable', [MobileTwoFactorController::class, 'disable']);
            Route::post('/auth/2fa/recovery-codes', [MobileTwoFactorController::class, 'recoveryCodes']);
        });

        // Protected routes (authenticated users only via Sanctum bearer token)
        Route::middleware(['auth:sanctum', 'verified'])->group(function () {
            // Auth endpoints
            Route::post('/auth/logout', [MobileAuthController::class, 'logout']);
            Route::get('/auth/me', [MobileAuthController::class, 'me']);

            // Posts
            Route::get('/posts/trending', [PostController::class, 'trending']);
            Route::get('/posts/moments', [PostController::class, 'moments']);
            Route::get('/posts/feed', [PostController::class, 'feed']);
            Route::get('/posts/hashtag/{tag}', [PostController::class, 'hashtag']);
            Route::get('/posts', [PostController::class, 'index']);
            Route::get('/feed/unified', [UnifiedFeedController::class, 'index']);
            Route::get('/home/engagement', [HomeEngagementController::class, 'index']);
            Route::post('/posts', [PostController::class, 'store']);
            Route::patch('/posts/{post}', [PostController::class, 'update']);
            Route::delete('/posts/{post}', [PostController::class, 'destroy']);
            Route::post('/posts/{post}/like', [PostController::class, 'like']);
            Route::post('/posts/{post}/unlike', [PostController::class, 'unlike']);
            Route::post('/posts/{post}/engagement', [PostController::class, 'engagement']);
            Route::post('/posts/{post}/reshare', [PostController::class, 'reshare']);
            Route::post('/posts/{post}/unreshare', [PostController::class, 'unreshare']);
            Route::post('/posts/{post}/save', [PostController::class, 'save']);
            Route::post('/posts/{post}/unsave', [PostController::class, 'unsave']);
            Route::get('/bookmarks', [UserController::class, 'bookmarks']);
            Route::post('/posts/{post}/comment', [PostController::class, 'comment']);
            Route::get('/posts/{post}/comments', [PostController::class, 'getComments']);
            Route::get('/posts/{post}/comments/{comment}/replies', [PostController::class, 'getCommentReplies']);
            Route::post('/posts/{post}/comments/{comment}/like', [PostController::class, 'likeComment']);
            Route::post('/posts/{post}/comments/{comment}/unlike', [PostController::class, 'unlikeComment']);
            Route::post('/posts/{post}/report', [PostController::class, 'report']);

            // Business pages
            Route::get('/business-pages', [BusinessPageController::class, 'index']);
            Route::post('/business-pages', [BusinessPageController::class, 'store']);
            Route::get('/business-pages/{businessPage:slug}', [BusinessPageController::class, 'show']);
            Route::get('/business-pages/{businessPage:slug}/posts', [BusinessPageController::class, 'posts']);
            Route::post('/business-pages/{businessPage:slug}/follow', [BusinessPageController::class, 'follow']);
            Route::post('/business-pages/{businessPage:slug}/unfollow', [BusinessPageController::class, 'unfollow']);
            Route::post('/business-pages/{businessPage:slug}/invite', [BusinessPageController::class, 'invite']);

            // Users
            Route::get('/users/profile', [UserController::class, 'profile']);
            Route::patch('/users/profile', [UserController::class, 'updateProfile']);
            Route::post('/users/profile/cover', [UserController::class, 'updateCover']);
            Route::post('/users/profile/avatar', [UserController::class, 'updateAvatar']);
            Route::get('/users/onboarding', [UserController::class, 'onboarding']);
            Route::post('/users/onboarding', [UserController::class, 'completeOnboarding']);
            Route::get('/users/notifications', [UserController::class, 'notifications']);
            Route::get('/users/post-daily-reports', [UserController::class, 'dailyPostReports']);
            Route::get('/users/post-earnings', [UserController::class, 'postEarnings']);
            Route::get('/users/monetization-dashboard', [UserController::class, 'monetizationDashboard']);
            Route::post('/users/monetization-dashboard/paystack/init', [UserController::class, 'initializeMonetizationPaystack']);
            Route::post('/users/monetization-dashboard/paystack/verify', [UserController::class, 'verifyMonetizationPaystack']);
            Route::patch('/users/notification-settings', [UserController::class, 'updateNotificationSettings']);
            Route::get('/users/verification-request', [UserVerificationRequestController::class, 'show']);
            Route::post('/users/verification-request', [UserVerificationRequestController::class, 'store']);
            Route::post('/users/verification-request/paystack/verify', [UserVerificationRequestController::class, 'verifyPaystack']);
            Route::get('/users/following', [UserController::class, 'getFollowing']);
            Route::get('/users/search', [UserController::class, 'index']);
            Route::get('/users/privacy', [UserController::class, 'privacy']);
            Route::patch('/users/privacy', [UserController::class, 'updatePrivacy']);
            Route::get('/users/blocked', [UserController::class, 'blockedUsers']);
            Route::get('/users/by-username/{username}', [UserController::class, 'byUsername']);
            Route::get('/users/{user}', [UserController::class, 'show']);
            Route::get('/users/{user}/posts', [UserController::class, 'posts']);
            Route::get('/users/{user}/followers', [UserController::class, 'followers']);
            Route::get('/users/{user}/following', [UserController::class, 'followingList']);
            Route::post('/users/{user}/follow', [UserController::class, 'follow']);
            Route::post('/users/{user}/unfollow', [UserController::class, 'unfollow']);
            Route::post('/users/{user}/block', [UserController::class, 'block']);
            Route::post('/users/{user}/unblock', [UserController::class, 'unblock']);
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/wallet', [UserController::class, 'wallet']);

            // Trending + search
            Route::get('/trending', [PostController::class, 'getTrendingTopics']);
            Route::get('/search', [PostController::class, 'search']);

            // Stories
            Route::get('/stories', [StoryController::class, 'index']);
            Route::post('/stories', [StoryController::class, 'store']);
            Route::get('/stories/{story}', [StoryController::class, 'show']);
            Route::post('/stories/{story}/view', [StoryController::class, 'view']);
            Route::post('/stories/{story}/reaction', [StoryController::class, 'react']);
            Route::delete('/stories/{story}', [StoryController::class, 'destroy']);

            // Conversations
            Route::get('/conversations', [ConversationController::class, 'index']);
            Route::post('/conversations', [ConversationController::class, 'store']);
            Route::post('/conversations/join/{token}', [ConversationController::class, 'joinByInvite']);
            Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
            Route::post('/conversations/{conversation}', [ConversationController::class, 'update']);
            Route::post('/conversations/{conversation}/members', [ConversationController::class, 'addMembers']);
            Route::delete('/conversations/{conversation}/members/{user}', [ConversationController::class, 'removeMember']);
            Route::post('/conversations/{conversation}/members/{user}/block', [ConversationController::class, 'blockMember']);
            Route::post('/conversations/{conversation}/members/{user}/unblock', [ConversationController::class, 'unblockMember']);
            Route::post('/conversations/{conversation}/leave', [ConversationController::class, 'leave']);
            Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markAsRead']);

            // Messages
            Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
            Route::get('/conversations/{conversation}/messages/{message}', [MessageController::class, 'show']);
            Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
            Route::patch('/conversations/{conversation}/messages/{message}', [MessageController::class, 'update']);
            Route::post('/conversations/{conversation}/attachments', [MessageController::class, 'uploadAttachment']);
            Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);

            // Push tokens
            Route::get('/push-tokens', [PushTokenController::class, 'index']);
            Route::post('/push-tokens', [PushTokenController::class, 'upsert']);
            Route::delete('/push-tokens/{tokenOrId}', [PushTokenController::class, 'destroy']);

            // Calls (WebRTC signaling over Reverb)
            Route::post('/conversations/{conversation}/calls', [CallController::class, 'store']);
            Route::get('/calls/active', [CallController::class, 'active']);
            Route::get('/calls/{callId}', [CallController::class, 'show']);
            Route::post('/calls/{callId}/accept', [CallController::class, 'accept']);
            Route::post('/calls/{callId}/decline', [CallController::class, 'decline']);
            Route::post('/calls/{callId}/end', [CallController::class, 'end']);
            Route::post('/calls/{callId}/leave', [CallController::class, 'leave']);
            Route::post('/calls/{callId}/heartbeat', [CallController::class, 'heartbeat']);
            Route::post('/calls/{callId}/offer', [CallController::class, 'offer']);
            Route::post('/calls/{callId}/answer', [CallController::class, 'answer']);
            Route::post('/calls/{callId}/ice', [CallController::class, 'ice']);
            Route::post('/calls/{callId}/invite', [CallController::class, 'invite']);
            Route::post('/calls/{callId}/kick', [CallController::class, 'kick']);
            Route::post('/calls/{callId}/join-link', [CallController::class, 'createJoinLink']);
            Route::post('/calls/{callId}/join-requests', [CallController::class, 'createJoinRequest']);
            Route::get('/calls/{callId}/join-requests', [CallController::class, 'listJoinRequests']);
            Route::post('/calls/{callId}/join-requests/{requestId}/approve', [CallController::class, 'approveJoinRequest']);
            Route::post('/calls/{callId}/join-requests/{requestId}/reject', [CallController::class, 'rejectJoinRequest']);
            Route::get('/calls/{callId}/signals/{type}/{signalId}', [CallController::class, 'signal']);

            // Reverb health
            Route::get('/reverb/health', [ReverbHealthController::class, 'show']);

            // Live streams
            Route::get('/live/streams', [LiveStreamController::class, 'index']);
            Route::post('/live/streams', [LiveStreamController::class, 'store']);
            Route::get('/live/streams/{stream}', [LiveStreamController::class, 'show']);
            Route::post('/live/streams/{stream}/start', [LiveStreamController::class, 'start']);
            Route::post('/live/streams/{stream}/end', [LiveStreamController::class, 'end']);
            Route::post('/live/streams/{stream}/heartbeat', [LiveStreamController::class, 'heartbeat']);
            Route::post('/live/streams/{stream}/livekit/token', [LiveStreamController::class, 'livekitToken']);
            Route::post('/live/streams/{stream}/join', [LiveStreamController::class, 'join']);
            Route::post('/live/streams/{stream}/signal', [LiveStreamController::class, 'signal']);
            Route::get('/live/streams/{stream}/signals', [LiveStreamController::class, 'signals']);
            Route::post('/live/streams/{stream}/like', [LiveStreamController::class, 'toggleLike']);
            Route::post('/live/streams/{stream}/share', [LiveStreamController::class, 'share']);
            Route::get('/live/streams/{stream}/analytics', [LiveStreamController::class, 'analytics']);
            Route::get('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatIndex']);
            Route::post('/live/streams/{stream}/chat', [LiveStreamController::class, 'chatStore']);
            Route::post('/live/streams/{stream}/chat/{message}/pin', [LiveStreamController::class, 'pinChatMessage']);
            Route::delete('/live/streams/{stream}/chat/{message}', [LiveStreamController::class, 'deleteChatMessage']);
            Route::post('/live/streams/{stream}/archive/init', [LiveStreamArchiveController::class, 'init']);
            Route::post('/live/streams/{stream}/archive/chunk', [LiveStreamArchiveController::class, 'chunk']);
            Route::post('/live/streams/{stream}/archive/complete', [LiveStreamArchiveController::class, 'complete']);
            Route::get('/live/streams/{stream}/archive/chunks', [LiveStreamArchiveController::class, 'chunks']);
            Route::get('/live/streams/{stream}/archive/chunks/{chunkIndex}', [LiveStreamArchiveController::class, 'showChunk'])
                ->whereNumber('chunkIndex');

            // Ads V2
            Route::get('/ads/wallet', [AdsV2WalletController::class, 'show']);
            Route::post('/ads/wallet/deposit', [AdsV2WalletController::class, 'deposit']);
            Route::post('/ads/wallet/credit-line/request', [AdsV2WalletController::class, 'requestCreditLine']);
            Route::post('/ads/wallet/top-up', [AdsV2WalletController::class, 'topUp']);
            Route::post('/ads/wallet/top-up/verify', [AdsV2WalletController::class, 'verify'])
                ->middleware('throttle:30,1');

            Route::get('/ads/campaigns', [AdsV2CampaignController::class, 'index']);
            Route::post('/ads/campaigns', [AdsV2CampaignController::class, 'store']);
            Route::patch('/ads/campaigns/{campaign}', [AdsV2CampaignController::class, 'update']);
            Route::post('/ads/campaigns/{campaign}/review-submit', [AdsV2CampaignController::class, 'reviewSubmit']);
            Route::post('/ads/campaigns/{campaign}/pause', [AdsV2CampaignController::class, 'pause']);
            Route::post('/ads/campaigns/{campaign}/resume', [AdsV2CampaignController::class, 'resume']);

            Route::get('/ads/creatives', [AdsV2CreativeController::class, 'index']);
            Route::post('/ads/creatives', [AdsV2CreativeController::class, 'store']);
            Route::patch('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'update']);
            Route::get('/ads/creatives/{creative}', [AdsV2CreativeController::class, 'show']);

            Route::post('/ads/delivery/request', [AdsV2DeliveryController::class, 'request'])
                ->middleware('throttle:180,1');
            Route::post('/ads/events', [AdsV2EventController::class, 'store'])
                ->middleware('throttle:360,1');
            Route::get('/ads/analytics/summary', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'summary']);
            Route::get('/ads/analytics/campaigns/{campaign}', [\App\Http\Controllers\Api\V2\AdsAnalyticsController::class, 'show']);

            Route::get('/rewarded/queue', [RewardedV2Controller::class, 'queue']);
            Route::post('/rewarded/{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])
                ->middleware('throttle:90,1');
            Route::get('/rewarded/earnings', [RewardedV2Controller::class, 'earnings']);
            Route::get('/rewarded/transactions', [RewardedV2Controller::class, 'transactions']);
            Route::get('/rewarded/banks', [RewardedV2Controller::class, 'bankList']);
            Route::post('/rewarded/banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName']);
            Route::post('/rewarded/withdraw', [RewardedV2Controller::class, 'withdraw'])
                ->middleware('throttle:15,1');
            Route::get('/rewarded/withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])
                ->middleware('throttle:60,1');
            Route::get('/rewarded/interface/balance', [RewardedV2Controller::class, 'interfaceBalance']);

            // Earnings aliases for mobile apps (v1.2)
            Route::get('/earnings/queue', [RewardedV2Controller::class, 'queue']);
            Route::post('/earnings/{deliveryId}/complete', [RewardedV2Controller::class, 'complete'])
                ->middleware('throttle:90,1');
            Route::get('/earnings/summary', [RewardedV2Controller::class, 'earnings']);
            Route::get('/earnings/transactions', [RewardedV2Controller::class, 'transactions']);
            Route::get('/earnings/banks', [RewardedV2Controller::class, 'bankList']);
            Route::post('/earnings/banks/resolve', [RewardedV2Controller::class, 'resolveBankAccountName']);
            Route::post('/earnings/withdraw', [RewardedV2Controller::class, 'withdraw'])
                ->middleware('throttle:15,1');
            Route::get('/earnings/withdraw/status/{reference}', [RewardedV2Controller::class, 'withdrawalStatus'])
                ->middleware('throttle:60,1');
            Route::get('/earnings/interface/balance', [RewardedV2Controller::class, 'interfaceBalance']);
            Route::get('/earnings/wallet', [UserController::class, 'wallet']);

            // Referrals
            Route::get('/referrals/stats', [ReferralController::class, 'stats']);
            Route::post('/referrals/register', [ReferralController::class, 'register']);
            Route::post('/referrals/complete', [ReferralController::class, 'complete']);
            Route::post('/kwati-ai/chat', [KwatiAiController::class, 'chat'])->middleware('throttle:30,1');
        });
    });

// Mobile alias for websocket auth endpoint.
// Kept outside WrapV12ApiResponse middleware because Reverb/Pusher expects raw broadcast auth payload.
Route::post('open-labs/oyibo/v1.2/broadcasting/auth', [BroadcastController::class, 'authenticate'])
    ->middleware('auth:sanctum');

// KaraAds Mobile API v3
require __DIR__.'/api_v3.php';
