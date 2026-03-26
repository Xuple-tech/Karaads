# Meta Webhook + Automation Setup Guide

This guide walks you through setting up **real-time message automation** with **System User tokens** for your Meta-connected app.

## 🎯 What You've Got

✅ **Webhook Controller** - Receives incoming messages from Meta  
✅ **Auto-Reply Job** - Processes messages & triggers AI responses  
✅ **Token Management** - Automatic token refresh when expiring  
✅ **System User Support** - Server-side automation without user OAuth  
✅ **Secure Routes** - All endpoints obfuscated with random paths  

---

## 📋 Prerequisites

Before you start, you need:
- A **Meta Developer Account** (https://developers.facebook.com)
- A **Meta App** created
- Business Manager access (for System User setup)
- Your app URL (e.g., `https://kwatiai.com` or `http://127.0.0.1:8000`)

---

## 🔧 STEP 1: Update Your Database

Add `token_expires_at` column to `meta_accounts` table to track token expiration:

```bash
php artisan make:migration add_token_expires_to_meta_accounts --table=meta_accounts
```

Then edit the migration file:

```php
public function up()
{
    Schema::table('meta_accounts', function (Blueprint $table) {
        $table->timestamp('token_expires_at')->nullable()->after('access_token_encrypted');
    });
}

public function down()
{
    Schema::table('meta_accounts', function (Blueprint $table) {
        $table->dropColumn('token_expires_at');
    });
}
```

Run it:
```bash
php artisan migrate
```

---

## 🚀 STEP 2: Get System User Token

System User tokens are **long-lived server tokens** that don't require user interaction. Here's how to set one up:

### Step 2a: Create System User in Business Manager

1. Go to **Business Manager** → **Settings** → **Users** → **System Users**
2. Click **Add System User**
3. Choose name: `RheaAutoBot` or similar
4. Role: Select **Admin**
5. Save and note the **System User ID**

### Step 2b: Create App Role

1. Go to your **Meta App Settings** → **Roles** → **App Roles**
2. Create new role: `RheaAutomation`
3. Assign permissions:
   - `pages_manage_messaging`
   - `pages_read_user_profile`
   - `instagram_manage_messages`
   - `whatsapp_business_messaging`
   - `whatsapp_business_account_management`

### Step 2c: Assign System User to App

1. Go to **App Roles**
2. Click your new role
3. Add the System User you created
4. Click **Generate Access Token** for that System User
5. **COPY THE TOKEN** (you can only see it once!)

### Step 2d: Add to .env

```env
META_SYSTEM_USER_TOKEN=your_system_user_token_here
META_SYSTEM_USER_ID=your_system_user_id_here
META_BUSINESS_MANAGER_ID=your_business_manager_id_here
```

---

## 🔌 STEP 3: Register Webhook URL with Meta

Meta needs to know where to send incoming messages.

### Step 3a: Verify Your Webhook URL

Your webhook URL is:
```
https://kwatiai.com/meta/webhook/receive/x9k2m5p1
```
(The token `x9k2m5p1` is auto-verified against `META_WEBHOOK_VERIFY_TOKEN`)

### Step 3b: Register in Meta App Dashboard

1. Go to your **Meta App** → **Messengers** → **Configuration**
2. Under **Webhooks**, click **Edit**
3. Set **Callback URL**: `https://kwatiai.com/meta/webhook/receive/x9k2m5p1`
4. Set **Verify Token**: (Match `META_WEBHOOK_VERIFY_TOKEN` in `.env`)
5. Click **Verify and Save**

Meta will send a GET request to verify. Your controller will handle it automatically.

### Step 3c: Subscribe to Webhook Fields

1. In same **Webhooks** section, under **Subscribe to this object**, select:
   - ✅ `messages`
   - ✅ `message_template_status_update`
   - ✅ `messaging_referrals` (optional)

2. Click **Subscribe**

---

## 4️⃣ STEP 4: Connect Meta Accounts (User OAuth)

Users still connect their own accounts via OAuth for per-account automation settings.

### Flow:
1. User visits `/meta/platform/p6a9s2d5/accounts/list/l8z1x4c7`
2. Clicks "Connect Facebook/Instagram/WhatsApp"
3. OAuth redirect to Meta
4. Grants permissions
5. Token stored (encrypted) in database

Once connected, when messages arrive via webhook:
1. **Webhook** receives it
2. **Auto-reply job** processes it
3. **AI analyzes** sentiment + category
4. **Checks** user's automation preferences
5. **Sends reply** directly OR creates draft for approval

---

## ✅ STEP 5: Configure Automation Preferences

Users can customize how their accounts auto-reply:

### API Endpoint (POST):
```
/meta/platform/p6a9s2d5/accounts/preferences/update/{uuid}/x6z9a2s5
```

### Payload:
```json
{
  "auto_reply_enabled": true,
  "require_approval": false,
  "tone": "professional",
  "custom_prompt": "You are a helpful support agent...",
  "auto_reply_delay": 5,
  "rate_limit_per_hour": 20
}
```

---

## 🧪 STEP 6: Test the Setup

### Test 1: Webhook Verification
```bash
curl -X GET "http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1?hub_challenge=test_challenge&hub_verify_token=391d99a0e791ef3625335e3631929672"
```
Should return: `test_challenge`

### Test 2: Send Test Message via Postman

**POST** to: `http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "object": "page",
  "entry": [
    {
      "id": "your_page_id",
      "messaging": [
        {
          "sender": {"id": "12345"},
          "recipient": {"id": "your_page_id"},
          "message": {
            "mid": "msg123",
            "text": "Hello, can you help me?"
          },
          "timestamp": 1234567890000
        }
      ]
    }
  ]
}
```

Check logs:
```bash
tail -f storage/logs/laravel.log | grep "Meta webhook"
```

### Test 3: Verify Queue Job
```bash
php artisan queue:work
```
Watch logs for `ProcessMetaWebhookMessage` job execution.

---

## 🔄 STEP 7: Token Refresh Configuration

The system **automatically refreshes tokens** before expiration:

```env
# 30 days before expiration, refresh the token
META_TOKEN_REFRESH_BUFFER=2592000

# Retry policy
META_MAX_RETRIES=3
META_RETRY_DELAY=1000  # milliseconds

# Rate limiting
META_RATE_LIMIT_PER_MINUTE=600
```

To manually refresh a token:
```php
$metaService = app(MetaApiService::class);
$metaService->refreshAccessToken($metaAccount);
```

---

## 📊 STEP 8: Monitor Automation Activity

View all automation logs:

**Database:**
```sql
SELECT * FROM meta_automation_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

**Logs:**
```bash
tail -f storage/logs/laravel.log | grep -i "meta"
```

---

## 🚨 Troubleshooting

### "Webhook verification failed"
- ✅ Verify `META_WEBHOOK_VERIFY_TOKEN` matches Meta app settings
- ✅ Check webhook URL is publicly accessible (not localhost)

### "Auto-reply not sending"
- ✅ Check `auto_reply_enabled` in MetaAutomationPreference
- ✅ Verify access token is still valid (check logs for token refresh errors)
- ✅ Check queue worker is running: `php artisan queue:work`

### "Token expired error"
- ✅ Check `token_expires_at` is being set on meta_accounts
- ✅ Verify System User token is valid (generate new one if needed)
- ✅ Check logs for token refresh attempts

### "Rate limit exceeded"
- ✅ Reduce `META_RATE_LIMIT_PER_MINUTE` or add delay between messages
- ✅ Implement exponential backoff (already done in `retryableRequest()`)

### "Message not being processed"
- ✅ Verify `QUEUE_CONNECTION=database` in .env
- ✅ Run: `php artisan queue:work --tries=3`
- ✅ Check `failed_jobs` table: `php artisan queue:failed`
- ✅ Retry failed jobs: `php artisan queue:retry all`

---

## 📱 What Happens When a Message Arrives

```
1. Customer sends message → Meta Platform
2. Meta sends webhook POST → Your /meta/webhook/receive endpoint
3. Controller verifies token ✅
4. Controller parses message data
5. Finds associated MetaAccount
6. Creates MetaMessage record
7. Dispatches ProcessMetaWebhookMessage job to queue
8. Queue worker processes:
   - Analyzes sentiment + category
   - Checks if auto-reply enabled
   - Generates AI response
   - If approval required: creates draft
   - If auto-reply: sends directly
   - Logs activity
9. User sees draft (if approval) or reply already sent
```

---

## 🔐 Security Features

✅ **Webhook token verification** - Ensures requests from Meta  
✅ **CSRF protection** - Removed only for webhook endpoint  
✅ **Encrypted tokens** - All access tokens encrypted at rest  
✅ **Rate limiting** - 1000 req/min on webhook endpoint  
✅ **Obfuscated routes** - All endpoints use random paths  
✅ **Audit logging** - All actions logged in `meta_automation_logs`  

---

## 📚 Useful Files

- **Webhook Controller**: `app/Http/Controllers/Meta/MetaWebhookController.php`
- **Auto-Reply Job**: `app/Jobs/ProcessMetaWebhookMessage.php`
- **Meta API Service**: `app/Services/MetaApiService.php`
- **Webhook Routes**: `routes/secure-web.php` (lines 235-245)
- **Config**: `config/services.php` (meta section)

---

## 🎓 Next Steps

1. ✅ Set up System User token
2. ✅ Register webhook URL
3. ✅ Test with sample message
4. ✅ Monitor first real messages
5. ✅ Customize AI prompts per account
6. ✅ Add email notifications for approval-required drafts
7. ✅ Implement ML-based sentiment analysis

---

**Questions?** Check logs first: `storage/logs/laravel.log`
