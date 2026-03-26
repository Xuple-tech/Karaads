<?php

use App\Http\Controllers\AgentIntelligenceController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\User;
use App\Http\Controllers\Meta\MetaAccountController;
use App\Http\Controllers\Meta\MetaMessageController;
use App\Http\Controllers\Meta\MetaPreferenceController;
use App\Http\Middleware\ImageGenerationRateLimit;
use App\Http\Middleware\CheckSubscriptionRateLimit;
use App\Http\Middleware\BotDetection;
use App\Http\Middleware\LogApiUsageMiddleware;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Secure Web Routes with Heavy Obfuscation
 * All endpoints use randomized paths and enhanced security
 */

// Security middleware stack
$webSecurityMiddleware = [
    'web',
    'throttle:120,1',
    BotDetection::class,
    LogApiUsageMiddleware::class
];

// Public chat routes with obfuscated endpoints
Route::middleware($webSecurityMiddleware)->group(function () {
    Route::get('/', [ChatController::class, 'index'])->name('home');
    Route::get('/app/secure/x7k9m2p4', [ChatController::class, 'index'])->name('secure.app');
    Route::get('/new/chat/q3w8r5t1', [ChatController::class, 'index'])->name('secure.new');
    Route::get('/privacy/policy/n8m4k7j2', [ChatController::class, 'privacyPolicy'])->name('secure.privacy');
});

// Secure conversation management routes
Route::middleware($webSecurityMiddleware)->withoutMiddleware(VerifyCsrfToken::class)->prefix('api/secure')->group(function () {
    // Conversation CRUD with obfuscated endpoints
    Route::get('/conversations/list/p9l6h3v5', [ChatController::class, 'list'])->name('secure.conversations.list');
    Route::post('/conversations/create/r2t8y4u1', [ChatController::class, 'create'])->name('secure.conversations.create');
    Route::put('/conversations/update/{uuid}/h5j8n3q1', [ChatController::class, 'update'])->name('secure.conversations.update');
    Route::delete('/conversations/delete/{uuid}/w6r9t2y5', [ChatController::class, 'destroy'])->name('secure.conversations.delete');
    Route::delete('/conversations/clear/all/m4k7l9p2', [ChatController::class, 'clearAll'])->name('secure.conversations.clear');

    // Conversation features with enhanced security
    Route::get('/conversations/export/{uuid}/q3w8e5r1', [ChatController::class, 'export'])->name('secure.conversations.export');
    Route::get('/conversations/statistics/z7x4c6v8', [ChatController::class, 'statistics'])->name('secure.conversations.statistics');
    Route::post('/chat/message/send/a2s5d8f1', [ChatController::class, 'chat'])->name('secure.chat.send')->middleware([
        CheckSubscriptionRateLimit::class
    ]);
    Route::post('/canvas/generate/content/j4h7g3f6', [ChatController::class, 'generateCanvasContent'])->name('secure.canvas.generate')->middleware([
        CheckSubscriptionRateLimit::class,
        'throttle:10,1'
    ]);

    // Search conversations with obfuscation
    Route::get('/conversations/search/l9p2o5i8', [ChatController::class, 'search'])->name('secure.conversations.search');
    Route::get('/conversations/list/all/u1y4t7r0', [ChatController::class, 'list'])->name('secure.conversations.list.all');

    // Email API routes with enhanced security
    Route::middleware('auth')->prefix('emails/secure')->group(function () {
        // Email accounts with obfuscated paths
        Route::post('/accounts/imap/connect/e3w6q9a2', [MailController::class, 'connectImap'])->name('secure.emails.accounts.imap');
        Route::delete('/accounts/disconnect/{uuid}/s5d8f1g4', [MailController::class, 'disconnectAccount'])->name('secure.emails.accounts.disconnect');
        Route::post('/accounts/sync/{uuid}/h7j0k3l6', [MailController::class, 'syncEmails'])->name('secure.emails.accounts.sync');

        // Emails management
        Route::get('/accounts/emails/{uuid}/v8c1x4z7', [MailController::class, 'getEmails'])->name('secure.emails.list');
        Route::post('/emails/process/{uuid}/q3w6e9r2', [MailController::class, 'processEmail'])->name('secure.emails.process');

        // Email rules with obfuscation
        Route::get('/rules/list/t5y8u1i4', [MailController::class, 'getRules'])->name('secure.emails.rules.list');
        Route::post('/rules/create/o7p0a3s6', [MailController::class, 'createRule'])->name('secure.emails.rules.create');
        Route::put('/rules/update/{uuid}/d9f2g5h8', [MailController::class, 'updateRule'])->name('secure.emails.rules.update');
        Route::delete('/rules/delete/{uuid}/j1k4l7z0', [MailController::class, 'deleteRule'])->name('secure.emails.rules.delete');

        // Email responses
        Route::post('/responses/send/{uuid}/x3c6v9b2', [MailController::class, 'sendResponse'])->name('secure.emails.responses.send');
    });
});

// Public chat routes with enhanced security
Route::middleware($webSecurityMiddleware)->group(function () {
    Route::get('/chat/new/secure/n5m8k1j4', [ChatController::class, 'create'])->name('secure.chat.new');
    Route::get('/chat/show/{uuid}/w7e0r3t6', [ChatController::class, 'show'])->name('secure.chat.show');
    Route::post('/chat/send/message/f4g7h0j3', [ChatController::class, 'chat'])->name('secure.chat.send.message')->withoutMiddleware(VerifyCsrfToken::class)->middleware([
        CheckSubscriptionRateLimit::class,
        'throttle:30,1'
    ]);
    Route::post('/chat/regenerate/{uuid}/k6l9z2x5', [ChatController::class, 'regenerateMessage'])->name('secure.chat.regenerate')->withoutMiddleware(VerifyCsrfToken::class)->middleware([
        CheckSubscriptionRateLimit::class,
        'throttle:20,1'
    ]);
    Route::post('/user/settings/language/c8v1b4n7', [User::class, 'saveLanguage'])->name('secure.user.language')->withoutMiddleware(VerifyCsrfToken::class);
});

// Authenticated routes with enhanced security
Route::middleware(array_merge($webSecurityMiddleware, ['auth']))->group(function () {
    // Voice conversation routes with obfuscation
    Route::get('/voice/chat/secure/m0p3q6w9', [ChatController::class, 'voiceChat'])->name('secure.voice.chat');
    Route::get('/mails/library/a2s5d8f1', [MailController::class, 'mails'])->name('secure.user.library');
    Route::get('/emails/accounts/show/{uuid}/r4t7y0u3', [MailController::class, 'showEmails'])->name('secure.emails.accounts.show');
    Route::get('/emails/rules/index/i6o9p2l5', [MailController::class, 'rules'])->name('secure.emails.rules.index');

    // Email OAuth routes with enhanced security
    Route::get('/emails/connect/gmail/h8j1k4z7', [MailController::class, 'connectGmail'])->name('secure.emails.connect.gmail');
    Route::get('/emails/callback/gmail/g0f3d6s9', [MailController::class, 'gmailCallback'])->name('secure.emails.callback.gmail');
    Route::get('/emails/connect/outlook/q2w5e8r1', [MailController::class, 'connectOutlook'])->name('secure.emails.connect.outlook');
    Route::get('/emails/callback/outlook/t4y7u0i3', [MailController::class, 'outlookCallback'])->name('secure.emails.callback.outlook');

    // Meta Platform Routes with heavy obfuscation
    Route::prefix('meta/platform/p6a9s2d5')->name('secure.meta.')->group(function () {
        // Accounts with obfuscated paths
        Route::get('/accounts/list/l8z1x4c7', [MetaAccountController::class, 'index'])->name('accounts.index');
        Route::post('/accounts/oauth/initiate/v0b3n6m9', [MetaAccountController::class, 'initiateOAuth'])->name('oauth.initiate');
        Route::get('/oauth/callback/secure/k2j5h8g1', [MetaAccountController::class, 'handleCallback'])->name('oauth.callback');
        Route::delete('/accounts/disconnect/{uuid}/f4d7s0a3', [MetaAccountController::class, 'disconnect'])->name('accounts.disconnect');
        Route::post('/accounts/status/{uuid}/w6e9r2t5', [MetaAccountController::class, 'updateStatus'])->name('accounts.update-status');
        Route::post('/accounts/test/{uuid}/y8u1i4o7', [MetaAccountController::class, 'testConnection'])->name('accounts.test');

        // Conversations & Messages with enhanced security
        Route::get('/accounts/conversations/{uuid}/q0w3e6r9', [MetaMessageController::class, 'conversations'])->name('conversations.list');
        Route::get('/accounts/conversations/show/{uuid}/{convUuid}/z2x5c8v1', [MetaMessageController::class, 'conversation'])->name('conversations.show');

        // Message Operations with obfuscation
        Route::post('/messages/analyze/{uuid}/b4n7m0k3', [MetaMessageController::class, 'analyzeAndDraft'])->name('messages.analyze');
        Route::put('/drafts/update/{uuid}/h6g9f2d5', [MetaMessageController::class, 'updateDraft'])->name('drafts.update');
        Route::post('/drafts/send/{uuid}/j8k1l4z7', [MetaMessageController::class, 'sendDraft'])->name('drafts.send');
        Route::post('/drafts/reject/{uuid}/s0a3d6f9', [MetaMessageController::class, 'rejectDraft'])->name('drafts.reject');
        Route::post('/conversations/send/{uuid}/p2o5i8u1', [MetaMessageController::class, 'send'])->name('messages.send');

        // Preferences with enhanced security
        Route::get('/accounts/preferences/{uuid}/c4v7b0n3', [MetaPreferenceController::class, 'show'])->name('preferences.show');
        Route::post('/accounts/preferences/update/{uuid}/x6z9a2s5', [MetaPreferenceController::class, 'update'])->name('preferences.update');
        Route::get('/preferences/global/secure/m8k1j4h7', [MetaPreferenceController::class, 'globalPreferences'])->name('preferences.global');
        Route::post('/preferences/global/update/g0f3d6s9', [MetaPreferenceController::class, 'updateGlobalPreferences'])->name('preferences.global.update');
    });
});

// Project Routes with enhanced security and obfuscation
Route::middleware(array_merge($webSecurityMiddleware, ['auth']))->group(function () {
    // Project CRUD with obfuscated endpoints
    Route::get('/projects/secure/list/q2w5e8r1', [ProjectController::class, 'index'])->name('secure.projects.index');
    Route::get('/projects/show/{uuid}/t4y7u0i3', [ProjectController::class, 'show'])->name('secure.projects.show');
    Route::get('/projects/edit/{uuid}/p6a9s2d5', [ProjectController::class, 'edit'])->name('secure.projects.edit');
    Route::post('/projects/create/secure/l8z1x4c7', [ProjectController::class, 'store'])->name('secure.projects.store');
    Route::put('/projects/update/{uuid}/v0b3n6m9', [ProjectController::class, 'update'])->name('secure.projects.update');
    Route::delete('/projects/delete/{uuid}/k2j5h8g1', [ProjectController::class, 'destroy'])->name('secure.projects.destroy');

    // File Management Routes with enhanced security
    Route::post('/projects/files/upload/{uuid}/f4d7s0a3', [ProjectController::class, 'uploadFiles'])->name('secure.projects.files.upload');
    Route::delete('/projects/files/delete/{uuid}/{fileUuid}/w6e9r2t5', [ProjectController::class, 'deleteFile'])->name('secure.projects.files.delete');

    // Project Dashboard & Advanced Features
    Route::get('/projects/dashboard/{uuid}/y8u1i4o7', [ProjectController::class, 'dashboard'])->name('secure.projects.dashboard');
    Route::get('/projects/settings/{uuid}/q0w3e6r9', [ProjectController::class, 'settings'])->name('secure.projects.settings');
    Route::put('/projects/settings/update/{uuid}/z2x5c8v1', [ProjectController::class, 'updateSettings'])->name('secure.projects.settings.update');

    // Project Collaboration & Team Management
    Route::get('/projects/collaboration/{uuid}/b4n7m0k3', [ProjectController::class, 'collaboration'])->name('secure.projects.collaboration');
    Route::post('/projects/members/add/{uuid}/h6g9f2d5', [ProjectController::class, 'addMember'])->name('secure.projects.members.add');
    Route::put('/projects/members/update/{uuid}/{memberUuid}/j8k1l4z7', [ProjectController::class, 'updateMember'])->name('secure.projects.members.update');
    Route::delete('/projects/members/remove/{uuid}/{memberUuid}/s0a3d6f9', [ProjectController::class, 'removeMember'])->name('secure.projects.members.remove');

    // Project Analytics & Activity
    Route::get('/projects/analytics/{uuid}/p2o5i8u1', [ProjectController::class, 'analytics'])->name('secure.projects.analytics');
    Route::get('/projects/activity/{uuid}/c4v7b0n3', [ProjectController::class, 'activity'])->name('secure.projects.activity');

    // Project Versions with obfuscation
    Route::get('/projects/versions/{uuid}/x6z9a2s5', [ProjectController::class, 'versions'])->name('secure.projects.versions');
    Route::post('/projects/versions/create/{uuid}/m8k1j4h7', [ProjectController::class, 'createVersion'])->name('secure.projects.versions.create');

    // Project Templates with enhanced security
    Route::get('/projects/templates/secure/g0f3d6s9', [ProjectController::class, 'templates'])->name('secure.projects.templates');
    Route::post('/projects/from-template/create/q2w5e8r1', [ProjectController::class, 'createFromTemplate'])->name('secure.projects.createFromTemplate');
    Route::post('/projects/save-template/{uuid}/t4y7u0i3', [ProjectController::class, 'saveAsTemplate'])->name('secure.projects.saveAsTemplate');

    // Project Status Management
    Route::post('/projects/archive/{uuid}/p6a9s2d5', [ProjectController::class, 'archive'])->name('secure.projects.archive');
    Route::post('/projects/restore/{uuid}/l8z1x4c7', [ProjectController::class, 'restore'])->name('secure.projects.restore');

    // Agent Intelligence Dashboard Routes with heavy obfuscation
    Route::prefix('projects/agents/intelligence/{uuid}/{agentUuid}')->group(function () {
        Route::get('/dashboard/v0b3n6m9', [AgentIntelligenceController::class, 'show'])->name('secure.agent.intelligence.show');
        Route::get('/summary/secure/k2j5h8g1', [AgentIntelligenceController::class, 'summary'])->name('secure.agent.intelligence.summary');
        Route::get('/export-memories/f4d7s0a3', [AgentIntelligenceController::class, 'exportMemories'])->name('secure.agent.intelligence.export-memories');
    });
});

// Media routes with enhanced security
Route::get('/media/secure/{path}/w6e9r2t5', [ImageController::class, 'show'])
    ->where('path', '.*')
    ->name('secure.media.show');
Route::get('/user-content/secure/{path}/y8u1i4o7', [ImageController::class, 'show'])
    ->where('path', '.*')
    ->name('secure.user.content.show');

// IP address testing route with obfuscation
Route::get('/system/test/ip/q0w3e6r9', function () {
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
})->name('secure.system.test.ip');

// Include other secure route files
require __DIR__ . '/secure-auth.php';
require __DIR__ . '/secure-admin.php';
require __DIR__ . '/secure-project-chats.php';
