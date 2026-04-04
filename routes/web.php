<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\User;
use App\Http\Controllers\Meta\MetaAccountController;
use App\Http\Controllers\Meta\MetaMessageController;
use App\Http\Controllers\Meta\MetaPreferenceController;
use App\Http\Controllers\Meta\MetaWebhookController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ConversationShareController;
use App\Http\Middleware\ImageGenerationRateLimit;
use App\Http\Middleware\CheckSubscriptionRateLimit;
use App\Models\Feedback;
use App\Models\User as ModelsUser;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Torann\GeoIP\Facades\GeoIP;
use Torann\GeoIP\Services\IPApi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

// Public chat route
Route::get('/', [ChatController::class, 'index'])->name('home');
Route::get('/app', [ChatController::class, 'index'])->name('app');
Route::get('/new', [ChatController::class, 'index'])->name('new');
Route::get('/privacy-policy', [ChatController::class, 'privacyPolicy'])->name('privacy-policy');
// Route::get('/c/{id}', [ChatController::class, 'index'])->name('cshow');

Route::middleware('auth')->get('/dashboard', function () {
    return Inertia::render('new');
})->name('dashboard');

// Conversation management routes
Route::middleware(['web',])->withoutMiddleware(VerifyCsrfToken::class)->prefix('api')->group(function () {
    // Conversation CRUD
    Route::get('/conversations/new-api-new-users0request', [ChatController::class, 'list'])->name('conversations.list');
    Route::post('/conversations/c-sdnsnd-smmsm', [ChatController::class, 'create'])->name('conversations.create');
    Route::put('/conversations/{id}', [ChatController::class, 'update'])->name('conversations.update');
    Route::delete('/conversations/{id}', [ChatController::class, 'destroy'])->name('conversations.delete');
    Route::delete('/conversations/clear', [ChatController::class, 'clearAll'])->name('conversations.clear');

    // Conversation features
    Route::get('/conversations/{id}/export', [ChatController::class, 'export'])->name('conversations.export');
    Route::get('/conversations/statistics', [ChatController::class, 'statistics'])->name('conversations.statistics');
    Route::post('/create/challenge/message', [ChatController::class, 'chat'])->name('chat.sendm')->middleware([
        // CheckSubscriptionRateLimit::class
    ]);
    Route::post('/generate-canvas-content', [ChatController::class, 'generateCanvasContent'])->name('canvas.generate')->middleware(CheckSubscriptionRateLimit::class);

    // Search conversations
    Route::get('/conversations/search', [ChatController::class, 'search'])->name('conversations.search');
    Route::get('/conversations/list', [ChatController::class, 'list'])->name('conversations.search');

    // Email API routes
    Route::middleware('auth')->group(function () {
        // Email accounts
        Route::post('/emails/accounts/imap', [MailController::class, 'connectImap'])->name('emails.accounts.imap');
        Route::delete('/emails/accounts/{accountId}', [MailController::class, 'disconnectAccount'])->name('emails.accounts.disconnect');
        Route::post('/emails/accounts/{accountId}/sync', [MailController::class, 'syncEmails'])->name('emails.accounts.sync');

        // Emails
        Route::get('/emails/accounts/{accountId}/emails', [MailController::class, 'getEmails'])->name('emails.list');
        Route::post('/emails/{emailId}/process', [MailController::class, 'processEmail'])->name('emails.process');

        // Email rules
        Route::get('/emails/rules', [MailController::class, 'getRules'])->name('emails.rules.list');
        Route::post('/emails/rules', [MailController::class, 'createRule'])->name('emails.rules.create');
        Route::put('/emails/rules/{ruleId}', [MailController::class, 'updateRule'])->name('emails.rules.update');
        Route::delete('/emails/rules/{ruleId}', [MailController::class, 'deleteRule'])->name('emails.rules.delete');

        // Email responses
        Route::post('/emails/responses/{responseId}/send', [MailController::class, 'sendResponse'])->name('emails.responses.send');
    });
});

// Public chat routes (existing)
Route::middleware(['web'])->group(function () {
    Route::get('/c/new', [ChatController::class, 'create'])->name('chat.new');
    Route::get('/c/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('/create-two-step-challagene', [ChatController::class, 'chat'])->name('chat.send')->withoutMiddleware(VerifyCsrfToken::class)->middleware(CheckSubscriptionRateLimit::class);
    Route::post('/c/{messageId}/regenerate', [ChatController::class, 'regenerateMessage'])->name('chat.regenerate')->withoutMiddleware(VerifyCsrfToken::class)->middleware(CheckSubscriptionRateLimit::class);
    Route::post('/user/setting/language', [User::class, 'saveLanguage'])->name('user.setting.language')->withoutMiddleware(VerifyCsrfToken::class);

    // Shared Conversation Routes (Public Access)
    Route::get('/share/{token}', [ConversationShareController::class, 'viewShare'])->name('share.view');
    Route::get('/api/share/{token}/data', [ConversationShareController::class, 'getSharedConversationData'])->name('share.data');
});

Route::middleware('auth')->group(function () {
    // Conversation Sharing Routes
    Route::prefix('api/conversations/{conversationId}/share')->name('api.conversations.share.')->group(function () {
        Route::post('/create', [ConversationShareController::class, 'createShare'])->name('create');
        Route::get('/details', [ConversationShareController::class, 'getShare'])->name('details');
        Route::put('/update', [ConversationShareController::class, 'updateShare'])->name('update');
        Route::post('/revoke', [ConversationShareController::class, 'revokeShare'])->name('revoke');
    });

    Route::get('/api/shares/list', [ConversationShareController::class, 'listUserShares'])->name('api.shares.list');

    // voice conversation routes
    Route::get('/voice-chat', [ChatController::class, 'voiceChat'])->name('voice.chat');
    Route::get('/mails', [MailController::class, 'mails'])->name('user.library');
    Route::get('/emails/accounts/{accountId}/emails', [MailController::class, 'showEmails'])->name('emails.accounts.show');
    Route::get('/emails/rules', [MailController::class, 'rules'])->name('emails.rules.index');

    // Email OAuth routes
    Route::get('/emails/connect/gmail', [MailController::class, 'connectGmail'])->name('emails.connect.gmail');
    Route::get('/emails/callback/gmail', [MailController::class, 'gmailCallback'])->name('emails.callback.gmail');
    Route::get('/emails/connect/outlook', [MailController::class, 'connectOutlook'])->name('emails.connect.outlook');
    Route::get('/emails/callback/outlook', [MailController::class, 'outlookCallback'])->name('emails.callback.outlook');

    // Meta Platform Routes (Facebook, Instagram, WhatsApp)
    Route::prefix('meta')->name('meta.')->group(function () {
        // Accounts
        Route::get('/dashboard', [MetaAccountController::class, 'dashboard'])->name('accounts.dashboard');
        Route::get('/accounts', [MetaAccountController::class, 'index'])->name('accounts.index');

        Route::post('/accounts/initiate-oauth', [MetaAccountController::class, 'initiateOAuth'])->name('oauth.initiate');
        Route::get('/oauth/callback', [MetaAccountController::class, 'handleCallback'])->name('oauth.callback');
        Route::delete('/accounts/{metaAccount}', [MetaAccountController::class, 'disconnect'])->name('accounts.disconnect');
        Route::post('/accounts/{metaAccount}/status', [MetaAccountController::class, 'updateStatus'])->name('accounts.update-status');
        Route::post('/accounts/{metaAccount}/test', [MetaAccountController::class, 'testConnection'])->name('accounts.test');

        // Conversations & Messages
        Route::get('/accounts/{metaAccount}/conversations', [MetaMessageController::class, 'conversations'])->name('conversations.list');
        Route::get('/accounts/{metaAccount}/conversations/{metaConversation}', [MetaMessageController::class, 'conversation'])->name('conversations.show');

        // Message Operations
        Route::post('/messages/{metaMessage}/analyze-and-draft', [MetaMessageController::class, 'analyzeAndDraft'])->name('messages.analyze');
        Route::put('/drafts/{metaMessageDraft}', [MetaMessageController::class, 'updateDraft'])->name('drafts.update');
        Route::post('/drafts/{metaMessageDraft}/send', [MetaMessageController::class, 'sendDraft'])->name('drafts.send');
        Route::post('/drafts/{metaMessageDraft}/reject', [MetaMessageController::class, 'rejectDraft'])->name('drafts.reject');
        Route::post('/conversations/{metaConversation}/send', [MetaMessageController::class, 'send'])->name('messages.send');

        // Preferences
        Route::get('/accounts/{metaAccount}/preferences', [MetaPreferenceController::class, 'show'])->name('preferences.show');
        Route::post('/accounts/{metaAccount}/preferences', [MetaPreferenceController::class, 'update'])->name('preferences.update');
        Route::get('/preferences/global', [MetaPreferenceController::class, 'globalPreferences'])->name('preferences.global');
        Route::post('/preferences/global', [MetaPreferenceController::class, 'updateGlobalPreferences'])->name('preferences.global.update');
    });
});

// routes/web.php
Route::get('/media/{path}', [ImageController::class, 'show'])
    ->where('path', '.*');
Route::get('/user-g-content/{path}', [ImageController::class, 'show'])
    ->where('path', '.*');

// Meta Webhook Routes (NO AUTH - Meta needs to post without credentials)
Route::get('/meta/webhook/receive/{token}', [MetaWebhookController::class, 'verify'])
    ->name('meta.webhook.verify')
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->middleware(['throttle:1000,1']);

Route::post('/meta/webhook/receive/{token}', [MetaWebhookController::class, 'handle'])
    ->name('meta.webhook.receive')
    ->withoutMiddleware(VerifyCsrfToken::class)
    ->middleware(['throttle:1000,1']);

Route::get('test_ip_address', function () {
    $ip = request()->ip();

    try {
        // Check if GeoIP service is configured
        $geoip = app('geoip');
        $service = $geoip->getService();

        // Try to get location
        $location = GeoIP::getLocation($ip);

        return response()->json([
            'ip' => $ip,
            'location' => $location,
            'location_data' => $location->toArray(),
            'service' => get_class($service),
            'success' => true
        ]);

    } catch (Exception $e) {
        return response()->json([
            'ip' => $ip,
            'error' => $e->getMessage(),
            'success' => false
        ]);
    }
});


Route::get('ex/auth/meta/privacy-policy',function(){
    return Inertia::render('Meta/Privacy');
});
Route::get('ex/auth/meta/terms-of-services',function(){
    return Inertia::render('Meta/TermOfServices');
});

Route::post('a/feedback/sms', function (Request $request) {
    $message = trim($request->input('feedback', ''));
    $rating = $request->input('rating');
    $user = $request->user();

    // Validate required fields
    if (empty($message) || empty($rating)) {
        return response()->json([
            'status' => false,
            'message' => 'Both message and rating are required.'
        ], 400);
    }

    // Validate rating is numeric and within range (assuming 1-5)
    if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
        return response()->json([
            'status' => false,
            'message' => 'Rating must be a number between 1 and 5.'
        ], 400);
    }
    $id = Str::ulid()->toString();
    try {
        // Use parameterized query to prevent SQL injection
        DB::table('feedback')->insert([
            'id'=>$id,
            'userid' => $user->id,
            'message' => $message,
            'rating' => $rating,
            'status' => 1, // Assuming default status
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Feedback received. Thank you!'
        ]);

    } catch (\Exception $e) {
        Log::error('Feedback submission error: ' . $e->getMessage());

        return response()->json([
            'status' => false,
            'message' => 'Failed to save feedback. Please try again.'
        ], 500);
    }
})->withoutMiddleware(VerifyCsrfToken::class)->name('feedback.sms');
// Legal pages
Route::get('/privacy', [PageController::class, 'privacy'])->name('privacy');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::get('/terms-of-service', [PageController::class, 'terms'])->name('terms-of-service');

// Optional: Redirect from old URLs if needed
Route::get('/3rd/details/privacy', function () {
    return redirect()->route('privacy');
});

Route::get('/3rd/details/service', function () {
    return redirect()->route('terms');
});

require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/admin-subscriptions.php';
require __DIR__ . '/saas-owner.php';
require __DIR__ . '/staff.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/subscriptions.php';
require __DIR__ . '/stripe.php';
require __DIR__ . '/paystack.php';
require __DIR__ . '/voice-conversation.php';
require __DIR__ . '/user.php';
require __DIR__ . '/currency.php';
require __DIR__ . '/studio.php';
require __DIR__ . '/docs.php';
