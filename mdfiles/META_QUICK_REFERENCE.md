# Meta Webhook Automation - Quick Reference Card

## 📋 5-Step Setup

```
1. php artisan make:migration add_token_expires_to_meta_accounts
   → Add: $table->timestamp('token_expires_at');
   → php artisan migrate

2. Get System User token from Meta Developer Dashboard
   → Add to .env: META_SYSTEM_USER_TOKEN=xxx

3. Register webhook in Meta app dashboard
   → URL: https://yourapp.com/meta/webhook/receive/x9k2m5p1
   → Token: 391d99a0e791ef3625335e3631929672

4. php artisan queue:work
   → Start queue worker in background

5. Test: Send sample message via Postman
   → Check database for MetaMessage record
```

---

## 🔧 Environment Variables

```env
# Must configure (from Meta dashboard)
META_SYSTEM_USER_TOKEN=                 # Long-lived server token
META_SYSTEM_USER_ID=                    # System user ID
META_BUSINESS_ACCOUNT_ID=               # Business account ID
META_BUSINESS_MANAGER_ID=               # Business manager ID

# Already configured
META_CLIENT_ID=1503849600896881
META_CLIENT_SECRET=391d99a0e791ef3625335e3631929672
META_WEBHOOK_VERIFY_TOKEN=391d99a0e791ef3625335e3631929672
META_WEBHOOK_URL=http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1
```

---

## 🧪 Quick Tests

### Test 1: Webhook Verification
```bash
curl -X GET "http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1?hub_challenge=test123&hub_verify_token=391d99a0e791ef3625335e3631929672"

# Expected: test123
```

### Test 2: Send Message (Postman)
```
POST http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1
Content-Type: application/json

{
  "object": "page",
  "entry": [{
    "id": "123456789",
    "messaging": [{
      "sender": {"id": "987654321"},
      "recipient": {"id": "123456789"},
      "message": {"mid": "msg_123", "text": "Hello!"},
      "timestamp": 1621022094
    }]
  }]
}
```

### Test 3: Check Database
```sql
SELECT * FROM meta_messages ORDER BY created_at DESC LIMIT 1;
SELECT * FROM meta_message_drafts WHERE status = 'pending_review';
SELECT * FROM meta_automation_logs ORDER BY created_at DESC LIMIT 5;
```

---

## 📦 Files

| File | Purpose |
|------|---------|
| `MetaWebhookController.php` | Receives webhooks |
| `ProcessMetaWebhookMessage.php` | Processes messages in queue |
| `MetaApiService.php` | API methods (new: refresh, webhook, retry) |
| `routes/secure-web.php` | Routes: `GET/POST /meta/webhook/receive/{token}` |
| `.env` | Configuration variables |
| `config/services.php` | Meta service config |

---

## ⚡ Commands

```bash
# Start development
php artisan serve

# Process queue jobs
php artisan queue:work --tries=3 --verbose

# Check failed jobs
php artisan queue:failed

# View logs
tail -f storage/logs/laravel.log | grep -i meta

# Database migration
php artisan make:migration add_token_expires_to_meta_accounts
php artisan migrate

# Test
php artisan test tests/Feature/MetaWebhookTest.php
```

---

## 🔄 Auto-Reply Flow

```
Webhook arrives
  ↓
MetaWebhookController verifies token
  ↓
Creates MetaMessage record
  ↓
Dispatches ProcessMetaWebhookMessage job
  ↓
Job analyzes message (sentiment, category)
  ↓
Checks: auto_reply_enabled? YES → continue
  ↓
Generates AI response
  ↓
Check: require_approval? 
  ├─ YES → Create draft (user approves)
  └─ NO → Send directly via Meta API
  ↓
Log activity
```

---

## 🛑 Stop If...

```
❌ Webhook returns 404
   → Restart server: php artisan serve

❌ Token verification fails (403)
   → Check META_WEBHOOK_VERIFY_TOKEN in .env and Meta dashboard

❌ Messages not saved
   → Check logs: tail -f storage/logs/laravel.log | grep webhook

❌ Jobs not processing
   → Start queue: php artisan queue:work --tries=3

❌ Auto-replies not sending
   → Check auto_reply_enabled in meta_automation_preferences table

❌ Token expired error
   → Check token_expires_at, should auto-refresh if < 30 days
```

---

## 🎯 Endpoints

### Webhook (No Auth)
```
GET  /meta/webhook/receive/x9k2m5p1  [Verification]
POST /meta/webhook/receive/x9k2m5p1  [Incoming messages]
```

### Existing Account Management (Auth Required)
```
GET  /meta/platform/p6a9s2d5/accounts/list/l8z1x4c7
POST /meta/platform/p6a9s2d5/accounts/oauth/initiate/v0b3n6m9
GET  /meta/platform/p6a9s2d5/oauth/callback/secure/k2j5h8g1
```

### Existing Preferences (Auth Required)
```
GET  /meta/platform/p6a9s2d5/accounts/preferences/{uuid}/c4v7b0n3
POST /meta/platform/p6a9s2d5/accounts/preferences/update/{uuid}/x6z9a2s5
```

---

## 💾 Key Database Tables

```sql
-- Main account connection
meta_accounts (id, platform, platform_account_id, access_token_encrypted, token_expires_at)

-- Incoming/outgoing messages
meta_messages (id, account_id, conversation_id, sender_id, content, processed, auto_reply)

-- Draft waiting for approval
meta_message_drafts (id, account_id, conversation_id, content, status, sentiment, category)

-- Automation settings
meta_automation_preferences (id, account_id, auto_reply_enabled, require_approval, tone, custom_prompt)

-- Activity log
meta_automation_logs (id, account_id, conversation_id, action, data)
```

---

## 🔑 New MetaApiService Methods

```php
// Token management
$service->refreshAccessToken($account);      // Refresh expired token
$service->ensureValidToken($account);        // Pre-flight check

// System User
$service->getSystemUserToken();              // Retrieve System User token
$service->getSystemUserAccessToken($busId);  // Exchange for access token

// Webhook
$service->registerWebhook($webhookUrl);      // Register with Meta
$service->subscribePageToWebhook($account);  // Subscribe page to events

// Retry
$service->retryableRequest(callable, name);  // Exponential backoff
```

---

## 📊 Configuration Options

```env
# Token refresh (defaults shown)
META_TOKEN_REFRESH_BUFFER=2592000           # 30 days
META_MAX_RETRIES=3                          # Retry attempts
META_RETRY_DELAY=1000                       # Milliseconds

# Rate limiting
META_RATE_LIMIT_PER_MINUTE=600              # Meta's limit

# Scopes & Events
META_REQUIRED_SCOPES=pages_manage_messaging,pages_read_user_profile,instagram_manage_messages
META_WEBHOOK_EVENTS=messages,message_template_status_update
```

---

## 📞 Debugging Checklist

```
[ ] .env has META_SYSTEM_USER_TOKEN
[ ] Database migration completed (token_expires_at column)
[ ] Webhook URL registered in Meta dashboard
[ ] Webhook token matches in .env and Meta dashboard
[ ] Queue worker running (php artisan queue:work)
[ ] User account connected via OAuth
[ ] auto_reply_enabled = true in preferences
[ ] Test message POSTed to webhook endpoint
[ ] Check database for meta_messages record
[ ] Check logs for errors (grep -i error)
[ ] Check failed_jobs table
```

---

## 🚀 Go-Live Checklist

```
[ ] Database migrations completed
[ ] System User token configured
[ ] Webhook URL updated to production domain
[ ] Webhook registered in Meta dashboard
[ ] All tests passing
[ ] Queue worker running in production
[ ] Log rotation configured
[ ] Monitoring alerts setup
[ ] Error tracking setup (Sentry, etc.)
[ ] Customer test messages verified
[ ] Approval workflow tested
[ ] Direct auto-reply tested
[ ] Token refresh tested
```

---

## 📚 Documentation

```
Setup Guide:        META_WEBHOOK_AUTOMATION_SETUP.md
Architecture:       META_WEBHOOK_ARCHITECTURE.md
Testing & Debug:    META_WEBHOOK_QUICK_TEST.md
Implementation:     META_IMPLEMENTATION_SUMMARY.md
This Card:          META_QUICK_REFERENCE.md
```

---

## 🎯 Key Concepts

**System User Token** = Long-lived server token, doesn't expire often

**OAuth Token** = User's account token, needs refresh (expires in 60 days)

**Webhook** = Meta POSTs incoming messages to your endpoint

**Job Queue** = Processes messages async (doesn't block request)

**Auto-Reply** = Automatically responds or creates draft based on settings

**Draft** = Response waiting for user approval before sending

**Rate Limiting** = Max 1 reply per hour per conversation (configurable)

---

## 🆘 I'm Stuck!

1. Check logs: `tail -f storage/logs/laravel.log | grep -i error`
2. Query database: `SELECT * FROM meta_messages ORDER BY created_at DESC;`
3. Read docs: `META_WEBHOOK_QUICK_TEST.md`
4. Restart: `php artisan serve` and `php artisan queue:work`
5. Check config: `php artisan tinker` → `config('services.meta')`

---

**Last Updated:** January 16, 2025  
**Status:** ✅ Ready to use
