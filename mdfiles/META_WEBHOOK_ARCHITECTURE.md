# Meta Webhook + Auto-Reply Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Meta Platforms                           │
│          (Facebook, Instagram, WhatsApp Messaging)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Sends webhook POST
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              MetaWebhookController (Receive)                    │
│  ✅ Verifies token                                              │
│  ✅ Parses message payload                                      │
│  ✅ Creates MetaMessage record                                  │
│  ✅ Dispatches ProcessMetaWebhookMessage job                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                Enqueues to database queue
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Queue Worker (ProcessMetaWebhookMessage Job)            │
│  ✅ Analyzes message (sentiment, category)                      │
│  ✅ Checks automation preferences                               │
│  ✅ Generates AI response                                       │
│  ✅ Creates draft OR sends directly                             │
│  ✅ Logs automation activity                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Uses two flows
                      │         │
        ┌─────────────┘         └──────────────┐
        │                                       │
        ▼ (if require_approval = true)        ▼ (if require_approval = false)
┌──────────────────────┐               ┌──────────────────────┐
│  Creates Draft       │               │  Sends Direct Reply  │
│  ✅ Saved in DB     │               │  ✅ Calls MetaAPI    │
│  ✅ User reviews    │               │  ✅ Logs sent msg    │
│  ✅ Can edit        │               │  ✅ Updates status   │
│  ✅ Approve/Reject  │               │                      │
└──────────────────────┘               └──────────────────────┘
```

---

## 📦 Data Flow

### 1️⃣ Incoming Message

```
Meta Webhook POST
{
  "object": "page",
  "entry": [{
    "id": "page_id",
    "messaging": [{
      "sender": {"id": "customer_id"},
      "recipient": {"id": "page_id"},
      "message": {
        "mid": "msg_id",
        "text": "Hello!",
        "attachments": [...]
      },
      "timestamp": 1234567890
    }]
  }]
}
```

### 2️⃣ Database Records Created

```
MetaAccount (existing connection)
├── platform: "facebook"
├── platform_account_id: "page_id"
├── access_token_encrypted: "..."
└── token_expires_at: "2025-02-15"

MetaConversation (from webhook)
├── account_id: 1
├── conversation_id: "hash(customer_id|page_id)"
├── sender_id: "customer_id"
├── status: "active"

MetaMessage (from webhook)
├── conversation_id: 1
├── account_id: 1
├── message_id: "msg_id"
├── sender_id: "customer_id"
├── content: "Hello!"
├── message_type: "text"
├── received_at: "2025-01-16 10:30:00"
├── processed: false
```

### 3️⃣ Message Analysis

```
AI Analysis
{
  "sentiment": "positive",           // positive, negative, neutral
  "category": "greeting",            // greeting, support, complaint, etc.
  "confidence": 85,                  // 0-100%
  "intent": "customer greeting",
  "requires_human": false
}
```

### 4️⃣ Generated Response

```
Auto-Reply (using GROK/Ollama)

Prompt sent to AI:
"You are a helpful business assistant...
Customer sentiment: positive
Message category: greeting
Tone: professional
Response to: Hello!"

Generated:
"Hi there! Thanks for reaching out. 
How can I help you today?"
```

### 5️⃣ Two Possible Outcomes

**A) Draft Created (require_approval = true)**
```
MetaMessageDraft
├── conversation_id: 1
├── account_id: 1
├── content: "Hi there! Thanks for reaching out..."
├── sentiment: "positive"
├── status: "pending_review"
├── triggered_by_webhook: true
└── User sees in UI, can edit & approve
```

**B) Direct Send (require_approval = false)**
```
Step 1: Call Meta API
  POST /me/messages
  {
    "recipient": {"id": "customer_id"},
    "message": {"text": "Hi there! Thanks for reaching out..."}
  }

Step 2: Log response
  MetaMessage (outgoing)
  ├── sender_id: "page_id"
  ├── content: "Hi there! Thanks for reaching out..."
  ├── auto_reply: true
  └── received_at: now()

Step 3: Audit log
  MetaAutomationLog
  ├── action: "auto_reply_sent"
  ├── data: {sentiment, category, confidence}
```

---

## 🔑 Key Components

### MetaWebhookController
**File:** `app/Http/Controllers/Meta/MetaWebhookController.php`

Methods:
- `verify()` - Handles GET for webhook subscription
- `handle()` - Handles POST for incoming messages
- `processEntry()` - Processes batch of events
- `processMessage()` - Creates message records & dispatches job
- `extractMessageContent()` - Parses different message types
- `generateConversationId()` - Creates consistent conversation hash

### ProcessMetaWebhookMessage (Job)
**File:** `app/Jobs/ProcessMetaWebhookMessage.php`

Methods:
- `handle()` - Main job execution
- `analyzeMessage()` - Calls AI analyzer
- `isRateLimited()` - Checks reply frequency
- `generateResponse()` - Calls AI to create response
- `createDraftForApproval()` - Saves as draft
- `sendReplyDirect()` - Sends directly via Meta API
- `logAutomationActivity()` - Creates audit trail

### MetaApiService
**File:** `app/Services/MetaApiService.php`

New Methods (for this feature):
- `refreshAccessToken()` - Token refresh when expiring
- `ensureValidToken()` - Pre-flight token validation
- `getSystemUserToken()` - Retrieves System User token
- `getSystemUserAccessToken()` - Exchanges for access token
- `registerWebhook()` - Registers with Meta
- `subscribePageToWebhook()` - Subscribes page to events
- `retryableRequest()` - Exponential backoff retry logic

---

## 🗄️ Database Schema

### meta_accounts
```sql
CREATE TABLE meta_accounts (
    id INT PRIMARY KEY,
    user_id INT,
    platform VARCHAR(50),              -- facebook, instagram, whatsapp
    platform_account_id VARCHAR(255),  -- page_id, account_id, etc.
    page_id VARCHAR(255),              -- Facebook page ID
    account_id VARCHAR(255),           -- Instagram account ID
    access_token_encrypted TEXT,       -- Encrypted token
    refresh_token VARCHAR(500),        -- For token refresh
    token_expires_at TIMESTAMP,        -- ⭐ NEW
    expires_in INT,                    -- Seconds until expiry
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### meta_conversations
```sql
CREATE TABLE meta_conversations (
    id INT PRIMARY KEY,
    account_id INT FOREIGN KEY,
    conversation_id VARCHAR(255),      -- Hash of sender+recipient
    sender_id VARCHAR(255),            -- Customer ID
    recipient_id VARCHAR(255),         -- Business ID
    status VARCHAR(50),                -- active, archived
    last_message_at TIMESTAMP
);
```

### meta_messages
```sql
CREATE TABLE meta_messages (
    id INT PRIMARY KEY,
    conversation_id INT FOREIGN KEY,
    account_id INT FOREIGN KEY,
    message_id VARCHAR(255),
    sender_id VARCHAR(255),            -- Who sent it
    content TEXT,
    message_type VARCHAR(50),          -- text, image, video, etc.
    attachments JSON,
    received_at TIMESTAMP,
    processed BOOLEAN,
    auto_reply BOOLEAN,                -- Whether this was auto-reply
    created_at TIMESTAMP
);
```

### meta_message_drafts
```sql
CREATE TABLE meta_message_drafts (
    id INT PRIMARY KEY,
    conversation_id INT FOREIGN KEY,
    account_id INT FOREIGN KEY,
    content TEXT,
    sentiment VARCHAR(50),             -- From analysis
    category VARCHAR(100),             -- From analysis
    confidence INT,                    -- 0-100
    status VARCHAR(50),                -- pending_review, approved, rejected
    triggered_by_webhook BOOLEAN,      -- Was this from webhook?
    analysis_data JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### meta_automation_preferences
```sql
CREATE TABLE meta_automation_preferences (
    id INT PRIMARY KEY,
    account_id INT FOREIGN KEY,
    user_id INT FOREIGN KEY,
    auto_reply_enabled BOOLEAN,        -- Master toggle
    require_approval BOOLEAN,          -- Need user approval?
    tone VARCHAR(50),                  -- professional, friendly, casual
    custom_prompt TEXT,                -- Custom AI instructions
    auto_reply_delay INT,              -- Seconds before sending
    rate_limit_per_hour INT,           -- Max replies/hour
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### meta_automation_logs
```sql
CREATE TABLE meta_automation_logs (
    id INT PRIMARY KEY,
    account_id INT FOREIGN KEY,
    conversation_id INT FOREIGN KEY,
    message_id INT FOREIGN KEY,
    action VARCHAR(100),               -- auto_reply_sent, draft_created, etc.
    data JSON,
    created_at TIMESTAMP
);
```

---

## 🔐 Security Flow

```
Webhook Arrives
    ↓
Check token matches META_WEBHOOK_VERIFY_TOKEN
    ↓ ✅
Find matching MetaAccount by platform_account_id
    ↓ ✅
Get encrypted access_token, decrypt it
    ↓ ✅
Ensure token not expired (refresh if needed)
    ↓ ✅
Dispatch job to queue (off main request)
    ↓ ✅
Job runs in background with retries
    ↓ ✅
Rate limit check (1 reply per hour)
    ↓ ✅
Use AI with personalization settings
    ↓ ✅
Send via Meta API or save as draft
    ↓ ✅
Audit log created
```

---

## ⚙️ Configuration Variables

```env
# OAuth Credentials (already set)
META_CLIENT_ID=1503849600896881
META_CLIENT_SECRET=391d99a0e791ef3625335e3631929672
META_API_VERSION=v24.0
META_WEBHOOK_VERIFY_TOKEN=391d99a0e791ef3625335e3631929672

# Webhook URL
META_WEBHOOK_URL=http://127.0.0.1:8000/meta/webhook/receive/x9k2m5p1

# ⭐ System User Configuration
META_SYSTEM_USER_TOKEN=your_long_lived_token
META_SYSTEM_USER_ID=your_system_user_id
META_BUSINESS_ACCOUNT_ID=your_business_account_id
META_BUSINESS_MANAGER_ID=your_business_manager_id

# Token Management
META_TOKEN_REFRESH_BUFFER=2592000        # 30 days
META_MAX_RETRIES=3
META_RETRY_DELAY=1000                    # ms
META_RATE_LIMIT_PER_MINUTE=600

# Scopes
META_REQUIRED_SCOPES=pages_manage_messaging,pages_read_user_profile,instagram_manage_messages

# Webhook Events
META_WEBHOOK_EVENTS=messages,message_template_status_update
```

---

## 🧪 Testing Checklist

- [ ] Webhook endpoint accessible at public URL
- [ ] Token verification working (GET with hub_challenge)
- [ ] Test message arrives (POST with messaging payload)
- [ ] MetaMessage record created in database
- [ ] Job queued successfully
- [ ] Queue worker processes job
- [ ] Draft created (if approval required)
- [ ] Reply sent (if no approval required)
- [ ] MetaAutomationLog created
- [ ] Token refresh fires when needed
- [ ] Rate limiting prevents spam replies
- [ ] Failed jobs retried with backoff

---

## 📊 Monitoring Queries

```sql
-- Recent incoming messages
SELECT * FROM meta_messages 
WHERE received_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY received_at DESC;

-- Pending approval drafts
SELECT * FROM meta_message_drafts 
WHERE status = 'pending_review'
ORDER BY created_at DESC;

-- Automation activity
SELECT action, COUNT(*) as count
FROM meta_automation_logs
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY action;

-- Accounts with expiring tokens
SELECT id, platform_account_id, token_expires_at
FROM meta_accounts
WHERE token_expires_at < DATE_ADD(NOW(), INTERVAL 30 DAY)
AND token_expires_at > NOW();
```

---

## 🚀 What's Fully Automated

✅ Receiving messages from Meta platforms  
✅ Parsing different message types (text, images, etc.)  
✅ Creating conversation history  
✅ AI sentiment & category analysis  
✅ Smart response generation  
✅ Draft creation for review  
✅ Direct reply sending  
✅ Token auto-refresh  
✅ Audit logging  
✅ Error handling & retries  

---

## 🔮 Future Enhancements

- [ ] ML-based response quality scoring
- [ ] Multi-language support (Hausa, Yoruba, Igbo)
- [ ] WebSocket notifications for new drafts
- [ ] Bulk message templates
- [ ] Analytics dashboard (messages/hour, sentiment trends)
- [ ] Custom routing (route to departments based on intent)
- [ ] Voice message transcription + response
- [ ] Image-based responses (product recommendations)
- [ ] Integration with CRM (HubSpot, Salesforce)
- [ ] Webhook signature verification
