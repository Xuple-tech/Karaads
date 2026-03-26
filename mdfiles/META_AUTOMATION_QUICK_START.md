# Meta Automation Quick Start Guide

Get up and running with Meta platform automation in 5 minutes.

## 🚀 Quick Setup

### 1. Copy Models & Services (Done ✅)
Files already created:
- Models: `app/Models/MetaAccount.php`, `MetaMessage.php`, `MetaConversation.php`, `MetaMessageDraft.php`, `MetaAutomationPreference.php`, `MetaAutomationLog.php`
- Services: `app/Services/MetaApiService.php`, `MetaMessageAnalyzerService.php`
- Controllers: `app/Http/Controllers/Meta/MetaAccountController.php`, `MetaMessageController.php`, `MetaPreferenceController.php`

### 2. Run Migrations
```bash
php artisan migrate
```

This creates all required tables.

### 3. Add Environment Variables
Update `.env`:
```env
# Get these from https://developers.facebook.com
META_CLIENT_ID=your_app_id_here
META_CLIENT_SECRET=your_app_secret_here
META_API_VERSION=v18.0
META_WEBHOOK_VERIFY_TOKEN=random_string_here
```

### 4. Verify Routes
Routes automatically registered in `routes/web.php`:
```
GET  /meta/accounts                    - View all accounts
POST /meta/accounts/initiate-oauth    - Start linking
GET  /meta/oauth/callback             - OAuth redirect
```

## 🔧 How to Use

### Link an Account
```javascript
// Frontend - POST to initiate OAuth
fetch('/meta/accounts/initiate-oauth', {
  method: 'POST',
  body: JSON.stringify({ platform: 'facebook' }) // or 'instagram', 'whatsapp'
})
// User is redirected to Facebook login
// After approval, account is stored automatically
```

### Get User's Accounts
```javascript
// Frontend - GET accounts
const response = await fetch('/meta/accounts');
const { accounts } = await response.json();
```

### View Conversations
```javascript
// Frontend - GET conversations
fetch(`/meta/accounts/1/conversations`)
```

### Analyze a Message
```javascript
// Frontend - POST to analyze
fetch(`/meta/messages/1/analyze-and-draft`, { method: 'POST' })
.then(r => r.json())
.then(data => {
  // data.draft contains:
  // - draft_reply: AI-generated response
  // - sentiment: positive/negative/neutral
  // - category: question/complaint/feedback/order/other
  // - confidence_score: 0-100
})
```

### Send a Draft
```javascript
// Frontend - POST to send
fetch(`/meta/drafts/1/send`, { method: 'POST' })
.then(r => r.json())
.then(data => console.log('Message sent!'))
```

## 📊 Database Tables

### meta_accounts
```
id | user_id | platform | account_id | account_name | is_active
```

### meta_messages
```
id | meta_account_id | conversation_id | direction | content | sender_name
```

### meta_conversations
```
id | meta_account_id | conversation_id | participant_name | last_message
```

### meta_message_drafts
```
id | meta_message_id | draft_reply | sentiment | status | auto_approved
```

### meta_automation_preferences
```
id | user_id | meta_account_id | enable_auto_reply | reply_tone | custom_instructions
```

## 🎯 Common Tasks

### Disable Auto-Reply for an Account
```php
$account = MetaAccount::find(1);
$account->preferences->update(['enable_auto_reply' => false]);
```

### Get All Pending Drafts
```php
$drafts = MetaMessageDraft::where('status', 'draft')->get();
```

### Check Sent Messages
```php
$messages = MetaMessage::where('direction', 'outgoing')
  ->where('status', 'sent')
  ->get();
```

### View Activity Logs
```php
$logs = MetaAutomationLog::where('user_id', auth()->id())
  ->orderBy('created_at', 'desc')
  ->get();
```

## 🔑 Key Components

### MetaApiService
Handles Meta Graph API calls:
```php
$service = new MetaApiService();
$service->exchangeCodeForToken($code, $redirectUri);
$service->getUserPages($accessToken);
$service->fetchConversationMessages($account, $conversationId);
$service->sendMessage($account, $conversationId, $message);
```

### MetaMessageAnalyzerService
Analyzes messages and generates drafts:
```php
$analyzer = new MetaMessageAnalyzerService(new GrokApiService());
$analysis = $analyzer->analyzeMessage($message, $account);
// Returns: sentiment, category, confidence_score

$draft = $analyzer->draftReply($message, $account);
// Returns: MetaMessageDraft with AI-generated response
```

## 📱 Frontend Components to Create

Create React pages in `resources/js/Pages/Meta/`:

### Accounts.tsx
```tsx
export default function Accounts({ accounts }) {
  return (
    <div>
      <h1>Meta Accounts</h1>
      <LinkAccountButton />
      {accounts.map(acc => <AccountCard account={acc} />)}
    </div>
  );
}
```

### Conversations.tsx
```tsx
export default function Conversations({ account, conversations }) {
  return (
    <div>
      <h1>{account.account_name}</h1>
      {conversations.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
```

### Conversation.tsx
```tsx
export default function Conversation({ account, conversation, messages }) {
  return (
    <div>
      <MessageList messages={messages} />
      <DraftPanel message={selectedMessage} />
    </div>
  );
}
```

## 🚦 Workflow

```
1. User links Meta account via OAuth
   ↓
2. App fetches conversations from Meta
   ↓
3. For each incoming message:
   - Analyze sentiment/category (GROK API)
   - Generate reply draft (GROK API)
   - Store draft in database
   ↓
4. User reviews draft
   - Can edit if needed
   ↓
5. User approves/sends
   - Message sent via Meta API
   - Status updated in database
   ↓
6. Activity logged for audit trail
```

## 🔐 Security Notes

- All access tokens are encrypted before storage
- User can only access their own accounts
- OAuth state parameter prevents CSRF
- All actions logged for audit

## ✅ What's Included

| Feature | Status | Notes |
|---------|--------|-------|
| Account Linking | ✅ | OAuth 2.0 flow |
| Message Fetching | ✅ | Via Meta API |
| Message Analysis | ✅ | Using GROK API |
| Reply Drafting | ✅ | Context-aware |
| Manual Sending | ✅ | Direct to Meta |
| Preferences | ✅ | Per-account & global |
| Auto-Reply | ✅ | Configurable |
| Multi-Platform | ✅ | FB, IG, WA |
| Webhooks | ⏳ | Coming soon |
| Analytics | ⏳ | Coming soon |

## 🐛 Troubleshooting

**"No accounts found"**
- Run migrations: `php artisan migrate`
- Check routes registered

**"OAuth fails"**
- Verify META_CLIENT_ID and META_CLIENT_SECRET in .env
- Check redirect URI matches in Meta App settings
- Ensure app is in development or live mode

**"Drafting fails"**
- Check GROK_API_KEY is set
- Verify GrokApiService is working
- Check error logs: `storage/logs/laravel.log`

## 📚 Learn More

- [Full Implementation Guide](./META_AUTOMATION_IMPLEMENTATION.md)
- [Meta Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [GROK API Docs](https://docs.x.ai)

## 🎓 Example: Complete Flow

```php
// 1. Get user's accounts
$accounts = auth()->user()->metaAccounts;

// 2. Get first account's conversations
$conversations = $accounts[0]->conversations()->paginate(20);

// 3. Get messages in conversation
$messages = $conversations[0]->messages()->orderBy('created_at')->get();

// 4. For incoming message, generate draft
$message = $messages[0];
if ($message->isIncoming()) {
    $analyzer = app(MetaMessageAnalyzerService::class);
    $draft = $analyzer->draftReply($message, $message->metaAccount);
    
    // Draft now contains:
    // - draft_reply: "Thank you for your interest..."
    // - sentiment: "neutral"
    // - category: "question"
}

// 5. User approves
$draft->update(['status' => 'approved']);

// 6. Send via API
$metaService = app(MetaApiService::class);
$result = $metaService->sendMessage(
    $message->metaAccount,
    $message->conversation_id,
    $draft->draft_reply
);

// 7. Update status
$draft->update(['status' => 'sent']);
```

---

**Ready to go!** 🚀 Check the [full guide](./META_AUTOMATION_IMPLEMENTATION.md) for advanced features.
