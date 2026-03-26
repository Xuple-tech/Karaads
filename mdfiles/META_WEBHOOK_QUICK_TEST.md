# Meta Webhook: Quick Test & Troubleshooting

## 🚀 Fast Setup Checklist (5 mins)

```bash
# 1. Update database
php artisan make:migration add_token_expires_to_meta_accounts --table=meta_accounts
# (Add column as shown in META_WEBHOOK_AUTOMATION_SETUP.md Step 1)
php artisan migrate

# 2. Add to .env
META_SYSTEM_USER_TOKEN=your_token_here
META_WEBHOOK_VERIFY_TOKEN=391d99a0e791ef3625335e3631929672

# 3. Test webhook endpoint
curl -X GET "http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1?hub_challenge=test123&hub_verify_token=391d99a0e791ef3625335e3631929672"

# 4. Start queue worker
php artisan queue:work --tries=3

# 5. Tail logs
tail -f storage/logs/laravel.log
```

---

## ✅ TESTS TO RUN

### TEST 1: Webhook Verification (GET Request)

**Endpoint:**
```
GET http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1
  ?hub_challenge=CHALLENGE_STRING
  &hub_verify_token=391d99a0e791ef3625335e3631929672
```

**Using cURL:**
```bash
curl -X GET "http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1?hub_challenge=my_challenge_string&hub_verify_token=391d99a0e791ef3625335e3631929672"
```

**Expected Response:**
```
my_challenge_string
```

**If you get 403:**
```
❌ hub_verify_token doesn't match META_WEBHOOK_VERIFY_TOKEN
   → Fix: Update .env and restart server
```

---

### TEST 2: Incoming Message (POST Request)

**Endpoint:**
```
POST http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1
Content-Type: application/json
```

**Using Postman:**

1. Create new POST request
2. URL: `http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1`
3. Headers: `Content-Type: application/json`
4. Body (raw):

```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789",
      "time": 1621022094000,
      "messaging": [
        {
          "sender": {
            "id": "987654321"
          },
          "recipient": {
            "id": "123456789"
          },
          "timestamp": 1621022094,
          "message": {
            "mid": "m_1234567890",
            "text": "Hello! I need help with my order",
            "quick_reply": null
          }
        }
      ]
    }
  ]
}
```

**Expected Response (HTTP 200):**
```json
{
  "status": "ok"
}
```

**Check database:**
```bash
# In another terminal, open MySQL
mysql -u root rhea_app

# Check if message was stored
SELECT * FROM meta_messages ORDER BY created_at DESC LIMIT 1;
```

**Check if job was queued:**
```bash
SELECT * FROM jobs ORDER BY created_at DESC LIMIT 1;
```

---

### TEST 3: Queue Job Processing

**Terminal 1: Start queue worker**
```bash
php artisan queue:work --tries=3 --verbose
```

**Terminal 2: Send webhook message (use POST from TEST 2)**

**Terminal 1: Watch output**
```
[2025-01-16 10:30:45] Processing: App\Jobs\ProcessMetaWebhookMessage
[2025-01-16 10:30:48] Processed: App\Jobs\ProcessMetaWebhookMessage
```

**Check database:**
```sql
-- Check if draft was created
SELECT * FROM meta_message_drafts ORDER BY created_at DESC LIMIT 1;

-- OR if sent directly
SELECT * FROM meta_messages WHERE auto_reply = 1 ORDER BY created_at DESC LIMIT 1;

-- Check audit log
SELECT * FROM meta_automation_logs ORDER BY created_at DESC LIMIT 1;
```

---

## 🔍 DEBUGGING GUIDE

### ❌ "Webhook returns 404"
```bash
# Check routes are registered
php artisan route:list | grep webhook

# Should show:
# GET|POST /meta/webhook/receive/{token}
```

If missing, restart server:
```bash
php artisan serve
```

---

### ❌ "Token verification fails (403)"
```bash
# Check what token is set
php artisan tinker
>>> config('services.meta.webhook_verify_token')
```

**Match this in Meta app dashboard:**
1. Facebook Developers → Your App
2. Messengers → Configuration
3. Webhooks → Callback URL settings
4. Verify Token field

---

### ❌ "Message not appearing in database"
```bash
# Check logs
tail -f storage/logs/laravel.log | grep -i "webhook"

# Should see:
# "Meta webhook received" with entry_count
# "Meta message stored" with message_id
```

**If message not received:**
- [ ] Is webhook URL publicly accessible? (not localhost)
- [ ] Did you register it in Meta dashboard?
- [ ] Did you subscribe to webhook fields?
- [ ] Is verify token correct?

---

### ❌ "Job not processing"
```bash
# Check queue connection
cat .env | grep QUEUE_CONNECTION
# Should be: QUEUE_CONNECTION=database

# Check failed jobs
php artisan queue:failed

# Retry all failed jobs
php artisan queue:retry all
```

**If jobs keep failing:**
```bash
# See detailed error
php artisan queue:work --verbose

# Check specific failed job
DB query:
SELECT * FROM failed_jobs ORDER BY created_at DESC LIMIT 1;
```

---

### ❌ "Auto-reply not sending"
```bash
# Check automation preferences
mysql> SELECT * FROM meta_automation_preferences WHERE account_id = 1;

# Ensure these are set:
# - auto_reply_enabled = 1
# - require_approval = 0  (if you want direct send)
```

**If requiring approval:**
```bash
# Drafts should appear here
mysql> SELECT * FROM meta_message_drafts WHERE status = 'pending_review';
```

**If not creating drafts:**
1. Check `OllamaCloudService` is configured
2. Check GROK/Ollama API is responding
3. Check logs for AI service errors

---

### ❌ "Rate limit reached"
```bash
# Check if rate limited
mysql> SELECT COUNT(*) FROM meta_messages 
       WHERE sender_id = 'page_id' 
       AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

# If > 1 in last hour, rate limiting kicks in
```

**Adjust rate limit:**
```env
# In .env (default is 1 reply per hour)
# Modify in ProcessMetaWebhookMessage::isRateLimited()
```

---

### ❌ "Token expired error"
```bash
# Check token expiration
mysql> SELECT id, platform_account_id, token_expires_at, 
       DATEDIFF(token_expires_at, NOW()) as days_left
       FROM meta_accounts;

# If days_left < 30, should auto-refresh
```

**Force refresh:**
```php
php artisan tinker
>>> $account = App\Models\MetaAccount::first();
>>> app(\App\Services\MetaApiService::class)->refreshAccessToken($account);
```

**If refresh fails:**
- [ ] Check `META_CLIENT_SECRET` is correct
- [ ] Check `refresh_token` is set on account
- [ ] Check Meta app settings (may need new long-lived token)

---

## 🧪 Full Integration Test

**Script:** `tests/Feature/MetaWebhookTest.php`

```bash
php artisan test tests/Feature/MetaWebhookTest.php
```

**Test file content:**
```php
<?php

namespace Tests\Feature;

use App\Models\MetaAccount;
use App\Models\MetaMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetaWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_verification()
    {
        $response = $this->get(
            '/meta/webhook/receive/x9k2m5p1?hub_challenge=test_challenge&hub_verify_token=' . 
            config('services.meta.webhook_verify_token')
        );

        $response->assertOk();
        $response->assertSee('test_challenge');
    }

    public function test_webhook_invalid_token()
    {
        $response = $this->get(
            '/meta/webhook/receive/x9k2m5p1?hub_challenge=test_challenge&hub_verify_token=wrong_token'
        );

        $response->assertStatus(403);
    }

    public function test_webhook_receives_message()
    {
        // Create test account
        $account = MetaAccount::factory()->create([
            'platform' => 'facebook',
            'platform_account_id' => '123456789',
        ]);

        $payload = [
            'object' => 'page',
            'entry' => [
                [
                    'id' => '123456789',
                    'messaging' => [
                        [
                            'sender' => ['id' => '987654321'],
                            'recipient' => ['id' => '123456789'],
                            'timestamp' => now()->timestamp,
                            'message' => [
                                'mid' => 'msg_123',
                                'text' => 'Hello!',
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $response = $this->post('/meta/webhook/receive/x9k2m5p1', $payload);

        $response->assertOk();
        $this->assertDatabaseHas('meta_messages', [
            'content' => 'Hello!',
        ]);
    }
}
```

---

## 📊 Monitoring Commands

```bash
# Watch webhook activity in real-time
tail -f storage/logs/laravel.log | grep -i "meta webhook"

# Count messages in last hour
mysql -u root rhea_app -e "SELECT COUNT(*) FROM meta_messages WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);"

# Check queue status
php artisan queue:failed
php artisan queue:work --daemon

# Monitor system user token
php artisan tinker
>>> config('services.meta.system_user_token')

# Check all connected accounts
mysql -u root rhea_app -e "SELECT id, platform, platform_account_id, token_expires_at FROM meta_accounts;"
```

---

## 🎯 Before Going to Production

✅ Test webhook verification (GET)  
✅ Test incoming message (POST)  
✅ Test auto-reply job processing  
✅ Test draft creation  
✅ Test direct message sending  
✅ Test token refresh  
✅ Test rate limiting  
✅ Test error handling & retries  
✅ Setup log rotation (logrocket, Sentry)  
✅ Setup monitoring (DataDog, New Relic)  
✅ Setup alerts for failed jobs  
✅ Test with real Meta webhook  
✅ Update webhook URL to production domain  
✅ Test with actual customer messages  

---

## 🆘 Still Stuck?

1. **Check logs first:**
   ```bash
   tail -f storage/logs/laravel.log | grep -E "error|exception|webhook|queue"
   ```

2. **Database is source of truth:**
   ```bash
   mysql rhea_app
   SELECT * FROM meta_messages WHERE created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
   SELECT * FROM meta_message_drafts WHERE created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
   SELECT * FROM failed_jobs;
   ```

3. **Test each component:**
   - Does webhook receive requests? (check controller logs)
   - Are messages saved? (check database)
   - Are jobs queued? (check jobs table)
   - Do jobs process? (run queue:work and watch output)
   - Do drafts/replies appear? (check message drafts & messages tables)

4. **Check configuration:**
   ```bash
   php artisan tinker
   >>> config('services.meta')
   >>> config('services.meta.webhook_verify_token')
   >>> env('QUEUE_CONNECTION')
   ```

5. **Enable verbose logging:**
   ```env
   LOG_LEVEL=debug
   ```

---

## 📞 Key Files for Reference

- **Webhook Controller:** `app/Http/Controllers/Meta/MetaWebhookController.php`
- **Processing Job:** `app/Jobs/ProcessMetaWebhookMessage.php`
- **API Service:** `app/Services/MetaApiService.php`
- **Routes:** `routes/secure-web.php` (lines 235-245)
- **Models:** `app/Models/MetaAccount.php`, `MetaMessage.php`, `MetaMessageDraft.php`
