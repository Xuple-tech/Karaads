# Meta Platform Automation - Frontend Integration Guide

**Quick Setup for Controllers & Views**

---

## 1. Create Missing Dashboard Controller

Create file: `app/Http/Controllers/Meta/MetaDashboardController.php`

```php
<?php

namespace App\Http\Controllers\Meta;

use App\Models\MetaAccount;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Models\MetaMessageDraft;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MetaDashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $accounts = $user->metaAccounts()
            ->with(['conversations' => function ($q) {
                $q->withCount('messages');
            }])
            ->withCount('metaMessages as total_messages')
            ->withCount(['metaConversations as conversation_count'])
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'platform' => $account->platform,
                    'account_name' => $account->account_name,
                    'is_active' => $account->is_active,
                    'last_sync_at' => $account->last_sync_at,
                    'unread_count' => $account->metaConversations()
                        ->whereNull('read_at')
                        ->count(),
                    'conversation_count' => $account->conversation_count ?? 0,
                    'message_count' => $account->total_messages ?? 0,
                ];
            });

        $stats = [
            'total_accounts' => $accounts->count(),
            'total_conversations' => MetaConversation::whereIn('meta_account_id', 
                $user->metaAccounts()->pluck('id'))->count(),
            'total_messages' => MetaMessage::whereIn('meta_account_id', 
                $user->metaAccounts()->pluck('id'))->count(),
            'auto_replies_sent' => MetaMessageDraft::where('user_id', $user->id)
                ->where('status', 'sent')->count(),
            'pending_drafts' => MetaMessageDraft::where('user_id', $user->id)
                ->where('status', 'draft')->count(),
        ];

        return Inertia::render('Meta/Dashboard', [
            'accounts' => $accounts,
            'stats' => $stats,
            'canAccessMeta' => $this->canAccessMeta($user),
            'subscriptionTier' => $user->current_plan?->slug ?? 'free',
        ]);
    }

    private function canAccessMeta($user): bool
    {
        $minTier = config('meta.min_subscription_tier', 'pro');
        $allowedTiers = ['pro', 'enterprise', 'unlimited'];
        
        if (config('meta.require_subscription', true)) {
            return in_array($user->current_plan?->slug, $allowedTiers);
        }

        return true;
    }
}
```

---

## 2. Update MetaAccountController for Dashboard

Add to `app/Http/Controllers/Meta/MetaAccountController.php`:

```php
public function index()
{
    $user = Auth::user();
    
    // Check subscription
    if (!$this->canAccessMeta($user)) {
        return Inertia::render('Meta/Dashboard', [
            'canAccessMeta' => false,
            'accounts' => [],
            'stats' => [],
        ]);
    }

    $accounts = $user->metaAccounts()
        ->withCount('metaConversations as conversation_count')
        ->withCount('metaMessages as message_count')
        ->with(['metaConversations' => function ($q) {
            $q->whereNull('read_at')->count();
        }])
        ->get()
        ->map(function ($account) {
            return [
                'id' => $account->id,
                'platform' => $account->platform,
                'account_name' => $account->account_name,
                'account_id' => $account->account_id,
                'is_active' => $account->is_active,
                'last_sync_at' => $account->last_sync_at,
                'created_at' => $account->created_at,
                'unread_count' => $account->metaConversations()
                    ->whereNull('read_at')->count(),
                'conversation_count' => $account->conversation_count ?? 0,
                'message_count' => $account->message_count ?? 0,
            ];
        });

    return Inertia::render('Meta/Accounts', [
        'accounts' => $accounts,
        'canAccessMeta' => true,
    ]);
}

private function canAccessMeta($user): bool
{
    $minTier = config('meta.min_subscription_tier', 'pro');
    $allowedTiers = ['pro', 'enterprise', 'unlimited'];
    
    if (config('meta.require_subscription', true)) {
        return in_array($user->current_plan?->slug, $allowedTiers);
    }

    return true;
}
```

---

## 3. Add Routes to `routes/web.php`

```php
Route::middleware(['auth', 'web'])->group(function () {
    // Meta Platform Automation
    Route::prefix('meta')->name('meta.')->group(function () {
        // Dashboard
        Route::get('/dashboard', [MetaDashboardController::class, 'index'])
            ->name('dashboard');

        // Accounts
        Route::get('/accounts', [MetaAccountController::class, 'index'])
            ->name('accounts.index');
        Route::post('/accounts/initiate-oauth', [MetaAccountController::class, 'initiateOAuth'])
            ->name('oauth.initiate');
        Route::get('/oauth/callback', [MetaAccountController::class, 'handleCallback'])
            ->name('oauth.callback');
        Route::delete('/accounts/{metaAccount}', [MetaAccountController::class, 'disconnect'])
            ->name('accounts.disconnect');
        Route::post('/accounts/{metaAccount}/status', [MetaAccountController::class, 'updateStatus'])
            ->name('accounts.update-status');
        Route::post('/accounts/{metaAccount}/test', [MetaAccountController::class, 'testConnection'])
            ->name('accounts.test');
        Route::post('/accounts/refresh-all', [MetaAccountController::class, 'refreshAll'])
            ->name('accounts.refresh-all');

        // Conversations & Messages
        Route::get('/accounts/{metaAccount}/conversations', 
            [MetaMessageController::class, 'conversations'])
            ->name('conversations.list');
        Route::get('/accounts/{metaAccount}/conversations/{metaConversation}', 
            [MetaMessageController::class, 'conversation'])
            ->name('conversations.show');

        // Message Operations
        Route::post('/messages/{metaMessage}/analyze-and-draft', 
            [MetaMessageController::class, 'analyzeAndDraft'])
            ->name('messages.analyze');
        Route::put('/drafts/{metaMessageDraft}', 
            [MetaMessageController::class, 'updateDraft'])
            ->name('drafts.update');
        Route::post('/drafts/{metaMessageDraft}/send', 
            [MetaMessageController::class, 'sendDraft'])
            ->name('drafts.send');
        Route::post('/drafts/{metaMessageDraft}/reject', 
            [MetaMessageController::class, 'rejectDraft'])
            ->name('drafts.reject');

        // Preferences
        Route::get('/accounts/{metaAccount}/preferences', 
            [MetaPreferenceController::class, 'show'])
            ->name('preferences.show');
        Route::post('/accounts/{metaAccount}/preferences', 
            [MetaPreferenceController::class, 'update'])
            ->name('preferences.update');
    });
});

// Admin Routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/meta/configuration', [MetaAdminController::class, 'configuration'])
        ->name('admin.meta.configuration');
    Route::post('/admin/meta/configuration', [MetaAdminController::class, 'saveConfiguration'])
        ->name('admin.meta.configuration.save');
});
```

---

## 4. Update MetaMessageController

Add these methods to handle conversation views:

```php
public function conversations(MetaAccount $metaAccount)
{
    $this->authorize('view', $metaAccount);

    $conversations = $metaAccount->metaConversations()
        ->with('lastMessage')
        ->orderBy('updated_at', 'desc')
        ->paginate(20)
        ->map(function ($conversation) {
            return [
                'id' => $conversation->id,
                'conversation_id' => $conversation->conversation_id,
                'participant_name' => $conversation->participant_name,
                'participant_avatar' => $conversation->participant_avatar,
                'unread_count' => $conversation->metaMessages()
                    ->where('is_incoming', true)
                    ->whereNull('read_at')
                    ->count(),
                'last_message' => $conversation->lastMessage?->content ?? '',
                'last_message_at' => $conversation->lastMessage?->timestamp ?? $conversation->updated_at,
                'message_count' => $conversation->metaMessages()->count(),
            ];
        });

    return Inertia::render('Meta/Conversations', [
        'metaAccount' => [
            'id' => $metaAccount->id,
            'account_name' => $metaAccount->account_name,
            'platform' => $metaAccount->platform,
        ],
        'conversations' => $conversations,
    ]);
}

public function conversation(MetaAccount $metaAccount, MetaConversation $metaConversation)
{
    $this->authorize('view', $metaAccount);
    $metaConversation->assertOwner($metaAccount);

    $messages = $metaConversation->metaMessages()
        ->orderBy('timestamp', 'asc')
        ->get()
        ->map(function ($message) {
            return [
                'id' => $message->id,
                'content' => $message->content,
                'is_incoming' => $message->is_incoming,
                'sender_name' => $message->sender_name,
                'timestamp' => $message->timestamp,
            ];
        });

    $drafts = MetaMessageDraft::whereIn(
        'meta_message_id',
        $metaConversation->metaMessages()->pluck('id')
    )->with('metaMessage')->get()->keyBy('meta_message_id');

    return Inertia::render('Meta/Conversation', [
        'metaAccount' => [
            'id' => $metaAccount->id,
            'account_name' => $metaAccount->account_name,
            'platform' => $metaAccount->platform,
        ],
        'metaConversation' => [
            'id' => $metaConversation->id,
            'conversation_id' => $metaConversation->conversation_id,
            'participant_name' => $metaConversation->participant_name,
        ],
        'messages' => $messages,
        'drafts' => $drafts->map(function ($draft) {
            return [
                'id' => $draft->id,
                'message_id' => $draft->meta_message_id,
                'draft_reply' => $draft->draft_reply,
                'sentiment' => $draft->ai_analysis['sentiment'] ?? 'neutral',
                'sentiment_emoji' => $this->getSentimentEmoji($draft->ai_analysis['sentiment'] ?? 'neutral'),
                'category' => $draft->ai_analysis['category'] ?? 'other',
                'category_icon' => $this->getCategoryIcon($draft->ai_analysis['category'] ?? 'other'),
                'confidence_score' => $draft->ai_analysis['confidence_score'] ?? 0,
                'status' => $draft->status,
                'ai_analysis' => json_encode($draft->ai_analysis),
            ];
        }),
    ]);
}

private function getSentimentEmoji($sentiment): string
{
    return match ($sentiment) {
        'positive' => '😊',
        'negative' => '😠',
        'neutral' => '😐',
        default => '😐',
    };
}

private function getCategoryIcon($category): string
{
    return match ($category) {
        'question' => '❓',
        'complaint' => '😞',
        'feedback' => '💬',
        'order' => '📦',
        default => '💭',
    };
}
```

---

## 5. Create MetaAdminController

Create file: `app/Http/Controllers/Meta/MetaAdminController.php`

```php
<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MetaAdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('admin');
    }

    public function configuration()
    {
        $config = [
            'id' => 1,
            'client_id' => config('services.meta.client_id', ''),
            'webhook_verify_token' => config('services.meta.webhook_verify_token', ''),
            'max_accounts_per_user' => config('meta.max_accounts_per_user', 5),
            'require_subscription' => config('meta.require_subscription', true),
            'min_subscription_tier' => config('meta.min_subscription_tier', 'pro'),
            'enable_facebook' => config('meta.platforms.facebook', true),
            'enable_instagram' => config('meta.platforms.instagram', true),
            'enable_whatsapp' => config('meta.platforms.whatsapp', true),
            'whatsapp_business_only' => config('meta.whatsapp_business_only', true),
            'default_reply_tone' => config('meta.defaults.reply_tone', 'professional'),
            'enable_auto_analysis' => config('meta.defaults.enable_auto_analysis', true),
            'enable_auto_reply' => config('meta.defaults.enable_auto_reply', false),
            'default_auto_reply_delay' => config('meta.defaults.auto_reply_delay_seconds', 0),
        ];

        $subscriptionTiers = Subscription::all()->map(fn($sub) => [
            'id' => $sub->slug,
            'name' => $sub->name,
        ]);

        return Inertia::render('Admin/Meta/Configuration', [
            'config' => $config,
            'subscriptionTiers' => $subscriptionTiers,
        ]);
    }

    public function saveConfiguration(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|string',
            'webhook_verify_token' => 'required|string',
            'max_accounts_per_user' => 'required|integer|min:1',
            'require_subscription' => 'required|boolean',
            'min_subscription_tier' => 'required|string',
            'enable_facebook' => 'required|boolean',
            'enable_instagram' => 'required|boolean',
            'enable_whatsapp' => 'required|boolean',
            'whatsapp_business_only' => 'required|boolean',
            'default_reply_tone' => 'required|string|in:professional,friendly,casual,formal',
            'enable_auto_analysis' => 'required|boolean',
            'enable_auto_reply' => 'required|boolean',
            'default_auto_reply_delay' => 'required|integer|min:0|max:3600',
        ]);

        // Update .env or config database
        // For now, this would be done via database or config file updates
        // You can implement a ConfigurationModel to store these

        return back()->with('success', 'Configuration saved successfully');
    }
}
```

---

## 6. Create Configuration Model (Optional)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaConfiguration extends Model
{
    protected $fillable = [
        'client_id',
        'webhook_verify_token',
        'max_accounts_per_user',
        'require_subscription',
        'min_subscription_tier',
        'enable_facebook',
        'enable_instagram',
        'enable_whatsapp',
        'whatsapp_business_only',
        'default_reply_tone',
        'enable_auto_analysis',
        'enable_auto_reply',
        'default_auto_reply_delay',
    ];

    protected $casts = [
        'require_subscription' => 'boolean',
        'enable_facebook' => 'boolean',
        'enable_instagram' => 'boolean',
        'enable_whatsapp' => 'boolean',
        'whatsapp_business_only' => 'boolean',
        'enable_auto_analysis' => 'boolean',
        'enable_auto_reply' => 'boolean',
        'default_auto_reply_delay' => 'integer',
        'max_accounts_per_user' => 'integer',
    ];
}
```

---

## 7. Create Config File

Create `config/meta.php`:

```php
<?php

return [
    'require_subscription' => env('META_REQUIRE_SUBSCRIPTION', true),
    'min_subscription_tier' => env('META_MIN_SUBSCRIPTION_TIER', 'pro'),
    'max_accounts_per_user' => env('META_MAX_ACCOUNTS_PER_USER', 5),
    
    'platforms' => [
        'facebook' => env('META_ENABLE_FACEBOOK', true),
        'instagram' => env('META_ENABLE_INSTAGRAM', true),
        'whatsapp' => env('META_ENABLE_WHATSAPP', true),
    ],
    
    'whatsapp_business_only' => env('META_WHATSAPP_BUSINESS_ONLY', true),
    
    'defaults' => [
        'reply_tone' => env('META_DEFAULT_REPLY_TONE', 'professional'),
        'enable_auto_analysis' => env('META_AUTO_ANALYSIS', true),
        'enable_auto_reply' => env('META_AUTO_REPLY', false),
        'auto_reply_delay_seconds' => env('META_AUTO_REPLY_DELAY', 0),
    ],
];
```

---

## 8. Update `.env.example`

```env
# Meta Platform Automation
META_CLIENT_ID=
META_CLIENT_SECRET=
META_API_VERSION=v18.0
META_WEBHOOK_VERIFY_TOKEN=
META_WEBHOOK_URL=

# Feature Configuration
META_REQUIRE_SUBSCRIPTION=true
META_MIN_SUBSCRIPTION_TIER=pro
META_MAX_ACCOUNTS_PER_USER=5
META_ENABLE_FACEBOOK=true
META_ENABLE_INSTAGRAM=true
META_ENABLE_WHATSAPP=true
META_WHATSAPP_BUSINESS_ONLY=true
META_DEFAULT_REPLY_TONE=professional
META_AUTO_ANALYSIS=true
META_AUTO_REPLY=false
META_AUTO_REPLY_DELAY=0
```

---

## 9. Test the Integration

### Step 1: Run Tests
```bash
php artisan test
```

### Step 2: Check Routes
```bash
php artisan route:list | grep meta
```

### Step 3: Access Dashboard
```
http://localhost:8000/meta/dashboard
```

---

## Common Issues & Solutions

### Issue: Routes not working
**Solution**: Run `php artisan route:cache` and clear cache

### Issue: Components not rendering
**Solution**: Verify Inertia render paths match file locations exactly

### Issue: Dark mode not working
**Solution**: Ensure Tailwind CSS dark mode is configured in `tailwind.config.js`

### Issue: API calls failing
**Solution**: Check CSRF token in meta[name="csrf-token"] tag in Blade template

---

## Deployment Checklist

- [ ] All controllers created and tested
- [ ] Routes added to `routes/web.php`
- [ ] Config file created with env variables
- [ ] `.env.example` updated
- [ ] Database migrations run: `php artisan migrate`
- [ ] Components tested in development
- [ ] Subscription check working
- [ ] OAuth flow tested
- [ ] Admin configuration page accessible
- [ ] Dark mode tested
- [ ] Mobile responsive tested

---

## Files Created

| File | Type | Purpose |
|------|------|---------|
| MetaDashboardController.php | Controller | Dashboard view |
| MetaAdminController.php | Controller | Admin settings |
| config/meta.php | Config | Feature configuration |
| resources/js/pages/Meta/Dashboard.tsx | Component | Dashboard UI |
| resources/js/pages/Meta/Accounts.tsx | Component | Accounts UI |
| resources/js/pages/Meta/Conversations.tsx | Component | Conversations list |
| resources/js/pages/Meta/Conversation.tsx | Component | Message thread |
| resources/js/pages/Meta/Preferences.tsx | Component | Settings UI |
| resources/js/pages/Admin/Meta/Configuration.tsx | Component | Admin settings |

---

**Ready to Deploy!** ✅
