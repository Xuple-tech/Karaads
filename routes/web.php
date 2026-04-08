<?php

use App\Http\Controllers\Developer\DeveloperPortalAuthController;
use App\Http\Controllers\Developer\DeveloperPortalController;
use App\Http\Middleware\AuthenticateDeveloperPortal;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\Meta\MetaAccountController;
use App\Http\Controllers\User;
use App\Http\Controllers\SpaController;
use App\Http\Controllers\Meta\MetaWebhookController;
use App\Http\Controllers\ConversationShareController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Torann\GeoIP\Facades\GeoIP;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

Route::get('/', SpaController::class)->name('home');
Route::get('/app', SpaController::class)->name('app');
Route::get('/new', SpaController::class)->name('new');
Route::get('/privacy-policy', SpaController::class)->name('privacy-policy');
Route::get('/dashboard', SpaController::class)->name('dashboard');
Route::middleware(['web'])->withoutMiddleware(VerifyCsrfToken::class)->prefix('api')->group(function () {
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

Route::middleware(['web'])->group(function () {
    Route::get('/c/new', SpaController::class)->name('chat.new');
    Route::get('/c/{conversation}', SpaController::class)->name('chat.show');
    Route::post('/user/setting/language', [User::class, 'saveLanguage'])->name('user.setting.language')->withoutMiddleware(VerifyCsrfToken::class);

    // Shared Conversation Routes (Public Access)
    Route::get('/share/{token}', SpaController::class)->name('share.view');
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

    // Email OAuth routes
    Route::get('/emails/connect/gmail', [MailController::class, 'connectGmail'])->name('emails.connect.gmail');
    Route::get('/emails/callback/gmail', [MailController::class, 'gmailCallback'])->name('emails.callback.gmail');
    Route::get('/emails/connect/outlook', [MailController::class, 'connectOutlook'])->name('emails.connect.outlook');
    Route::get('/emails/callback/outlook', [MailController::class, 'outlookCallback'])->name('emails.callback.outlook');
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

Route::middleware('auth')->group(function () {
    Route::get('/meta/oauth/callback', [MetaAccountController::class, 'handleCallback'])->name('meta.oauth.callback');
});

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


Route::redirect('ex/auth/meta/privacy-policy', '/privacy');
Route::redirect('ex/auth/meta/terms-of-services', '/terms');

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
Route::get('/privacy', SpaController::class)->name('privacy');
Route::get('/terms', SpaController::class)->name('terms');
Route::get('/terms-of-service', SpaController::class)->name('terms-of-service');

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

// Developer API portal at /developer-api (separate from SPA, own login)
Route::middleware('web')->prefix('developer-api')->name('developer-api.')->group(function () {
    // Public auth routes — redirect to portal if already logged in
    Route::get('/login', [DeveloperPortalAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [DeveloperPortalAuthController::class, 'login'])->name('login.store');
    Route::get('/register', [DeveloperPortalAuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [DeveloperPortalAuthController::class, 'register'])->name('register.store');

    // Protected portal routes — redirect to /developer-api/login if unauthenticated
    Route::middleware(AuthenticateDeveloperPortal::class)->group(function () {
        Route::post('/logout', [DeveloperPortalAuthController::class, 'logout'])->name('logout');
        Route::get('/', [DeveloperPortalController::class, 'dashboard'])->name('index');
        Route::get('/keys', [DeveloperPortalController::class, 'keys'])->name('keys.index');
        Route::get('/usage', [DeveloperPortalController::class, 'usage'])->name('usage.index');
        Route::get('/billing', [DeveloperPortalController::class, 'billing'])->name('billing.index');
        Route::get('/quickstart', [DeveloperPortalController::class, 'quickstart'])->name('quickstart');
        Route::post('/keys', [DeveloperPortalController::class, 'storeKey'])->name('keys.store');
        Route::put('/keys/{developerApiKey}', [DeveloperPortalController::class, 'updateKey'])->name('keys.update');
        Route::post('/keys/{developerApiKey}/revoke', [DeveloperPortalController::class, 'revokeKey'])->name('keys.revoke');
        Route::post('/keys/{developerApiKey}/regenerate', [DeveloperPortalController::class, 'regenerateKey'])->name('keys.regenerate');
        Route::post('/top-up', [DeveloperPortalController::class, 'createTopupCheckout'])->name('topup');
    });
});

Route::get('/{path}', SpaController::class)
    ->where('path', '^(?!admin(?:/|$)|saas-owner(?:/|$)|staff(?:/|$)|api(?:/|$)|docs(?:/|$)|doc-builder(?:/|$)|developer-api(?:/|$)|meta/webhook(?:/|$)|media(?:/|$)|user-g-content(?:/|$)|up(?:/|$)|sanctum(?:/|$)).*');
