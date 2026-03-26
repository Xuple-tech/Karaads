# Meta Platform Automation - Complete Implementation Guide

## Overview
This is a complete AI-powered automation system for managing Facebook, Instagram, and WhatsApp business accounts through a unified interface with intelligent message analysis and AI-generated reply suggestions.

## Features

### 1. **Account Management**
- OAuth authentication for Facebook, Instagram, and WhatsApp
- Multi-account support (manage multiple accounts simultaneously)
- Secure token encryption and storage
- Connection status monitoring
- Quick test connection feature

### 2. **Message Management**
- Real-time message synchronization
- Organized conversation threading
- Read/unread status tracking
- Message history search
- Media attachment support

### 3. **AI-Powered Automation**
- **Message Analysis**: Automatically analyze incoming messages for sentiment and intent
  - Sentiment: positive, negative, neutral
  - Category: question, complaint, feedback, order, other
  - Confidence scoring
  
- **Draft Generation**: AI generates contextual reply suggestions based on:
  - Message sentiment and intent
  - Custom user instructions
  - Configurable reply tone
  - Historical conversation context
  
- **Auto-Reply**: Optional automatic sending of AI-generated replies
  - Approval workflow (optional)
  - Configurable delay before sending
  - Tone selection (professional, friendly, casual, formal)

### 4. **Automation Preferences**
- Per-account configuration
- Global preferences (apply to all accounts)
- Tone selection (professional, friendly, casual, formal)
- Custom instructions for AI
- Auto-reply delay configuration
- Message analysis enablement
- Approval requirement configuration

### 5. **Activity Logging**
- Comprehensive audit trail
- Action tracking (analyze, draft, approve, send, reject, sync)
- Error logging and troubleshooting
- User activity monitoring

## Architecture

### Database Structure

```
meta_accounts
├── Stores linked Meta platform accounts
├── Fields: platform, account_id, access_token, page_id, etc.
└── Relations: User, Messages, Conversations, Preferences

meta_conversations  
├── Groups messages by conversation thread
├── Fields: participant_id, last_message, unread_count, etc.
└── Relations: MetaAccount, Messages, Drafts

meta_messages
├── Individual messages (incoming/outgoing)
├── Fields: direction, sender_id, content, status, etc.
└── Relations: MetaAccount, Conversation, Draft

meta_message_drafts
├── AI-generated or user-created reply drafts
├── Fields: original_message, draft_reply, sentiment, category, etc.
└── Relations: Message, Conversation

meta_automation_preferences
├── User preferences for automation behavior
├── Fields: enable_auto_reply, reply_tone, custom_instructions, etc.
└── Relations: User, MetaAccount

meta_automation_logs
├── Complete audit trail of all actions
├── Fields: action, description, data, error_message, etc.
└── Relations: User, MetaAccount, MessageDraft
```

### Models

#### MetaAccount
- Represents a linked Meta platform account
- Methods:
  - `isTokenExpired()`: Check if access token needs refresh
  - `isWhatsAppBusinessAccount()`: Check if WhatsApp business account
  - Relations: User, Messages, Conversations, Preferences

#### MetaConversation
- Groups messages into conversation threads
- Methods:
  - `hasUnreadMessages()`: Check for unread messages
  - Relations: MetaAccount, Messages, Drafts

#### MetaMessage
- Individual message record
- Methods:
  - `isIncoming()`: Check if incoming message
  - `isOutgoing()`: Check if outgoing message
  - Relations: MetaAccount, Conversation, Draft

#### MetaMessageDraft
- AI-generated or user-modified draft replies
- Methods:
  - `isDraft()`: Check if still in draft status
  - `isApproved()`: Check if approved
  - `isSent()`: Check if sent
  - `isRejected()`: Check if rejected
  - Relations: Message, MetaConversation

#### MetaAutomationPreference
- User preferences for automation
- Relations: User, MetaAccount

#### MetaAutomationLog
- Audit trail of all actions
- Relations: User, MetaAccount, MessageDraft

### Controllers

#### MetaAccountController
**Endpoints:**
- `GET /meta/dashboard` - Show dashboard with statistics
- `GET /meta/accounts` - List connected accounts
- `POST /meta/accounts/initiate-oauth` - Start OAuth flow
- `GET /meta/oauth/callback` - Handle OAuth callback
- `DELETE /meta/accounts/{id}` - Disconnect account
- `POST /meta/accounts/{id}/status` - Update account status
- `POST /meta/accounts/{id}/test` - Test connection

**Key Methods:**
- `dashboard()` - Display overview with stats and connected accounts
- `index()` - Manage connected accounts
- `initiateOAuth()` - Start authentication flow
- `handleCallback()` - Process OAuth response
- `disconnect()` - Remove connected account
- `updateStatus()` - Enable/disable account
- `testConnection()` - Verify API connection

#### MetaMessageController
**Endpoints:**
- `GET /meta/accounts/{id}/conversations` - List conversations
- `GET /meta/accounts/{id}/conversations/{id}` - View conversation
- `POST /meta/messages/{id}/analyze-and-draft` - Analyze and generate draft
- `PUT /meta/drafts/{id}` - Edit draft
- `POST /meta/drafts/{id}/send` - Send draft
- `POST /meta/drafts/{id}/reject` - Reject draft
- `POST /meta/conversations/{id}/send` - Send manual message

**Key Methods:**
- `conversations()` - List conversations for account
- `conversation()` - View specific conversation with messages
- `analyzeAndDraft()` - AI analysis and draft generation
- `updateDraft()` - User modification of draft
- `sendDraft()` - Send approved/user-modified draft
- `rejectDraft()` - Reject draft
- `send()` - Send manual message

#### MetaPreferenceController
**Endpoints:**
- `GET /meta/accounts/{id}/preferences` - Show account preferences
- `POST /meta/accounts/{id}/preferences` - Update account preferences
- `GET /meta/preferences/global` - Show global preferences
- `POST /meta/preferences/global` - Update global preferences

**Key Methods:**
- `show()` - Display preferences form
- `update()` - Save preferences
- `globalPreferences()` - Show global preferences
- `updateGlobalPreferences()` - Save global preferences

### Services

#### MetaApiService
Handles all communication with Meta APIs:
- `getOAuthUrl()` - Generate OAuth authorization URL
- `exchangeCodeForToken()` - Exchange auth code for access token
- `getUserPages()` - Fetch Facebook pages
- `getInstagramAccounts()` - Fetch Instagram accounts
- `getWhatsAppBusinessAccount()` - Fetch WhatsApp accounts
- `fetchConversationMessages()` - Get messages from conversation
- `sendMessage()` - Send message via Meta API
- `setupWebhook()` - Configure webhook for incoming messages
- `logActivity()` - Log automation activity

#### MetaMessageAnalyzerService
Handles AI analysis and reply generation:
- `analyzeMessage()` - Sentiment/category analysis
- `generateReply()` - Generate contextual reply

### Routes

```php
// Meta Platform Routes
Route::prefix('meta')->name('meta.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [MetaAccountController::class, 'dashboard'])->name('accounts.dashboard');
    
    // Accounts Management
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
```

## Frontend Pages

### 1. **Dashboard** (`/meta/dashboard`)
Overview of all Meta accounts and activities:
- Connected accounts grid with stats
- Total messages, conversations, unread count
- Auto-replies sent statistics
- Pending drafts for review
- Quick access to account settings
- Refresh all conversations button

### 2. **Accounts** (`/meta/accounts`)
Manage connected accounts:
- List of connected accounts by platform
- Available platforms for linking
- OAuth connection flow
- Disconnect accounts
- Account statistics (conversations, unread)
- Security information

### 3. **Conversations** (`/meta/accounts/{id}/conversations`)
View conversations for an account:
- Paginated conversation list
- Search by participant name or message content
- Unread indicator
- Last message preview
- Pending draft indicator
- Quick access to individual conversations

### 4. **Conversation** (`/meta/accounts/{id}/conversations/{id}`)
View specific conversation:
- Full message thread (newest first)
- Message direction indicator (incoming/outgoing)
- Sender information
- Media attachments
- Pending drafts display
- AI analysis results
- Draft generation/modification interface
- Manual message sending

### 5. **Preferences** (`/meta/accounts/{id}/preferences`)
Configure automation for specific account:
- Enable/disable message analysis
- Enable/disable auto-reply
- Approval requirement toggle
- Reply tone selection
- Auto-reply delay configuration
- Custom instructions textarea
- Save and test buttons

### 6. **Global Preferences** (`/meta/preferences/global`)
Configure global preferences:
- Same settings as account preferences
- Apply to all accounts by default
- Platform-specific enabling

## Subscription Tier Requirements

- **Free**: No access to Meta Platform Automation
- **Pro**: Full access to Meta Platform Automation
- **Enterprise**: Full access with priority support

## Security Considerations

1. **Token Encryption**: All Meta access tokens are encrypted using Laravel's Crypt facade
2. **Authorization**: All endpoints use Laravel's authorization policies
3. **CSRF Protection**: All forms include CSRF token validation
4. **Rate Limiting**: API calls are rate-limited to prevent abuse
5. **Audit Trail**: All actions are logged for compliance
6. **Data Privacy**: Message content is not logged unnecessarily

## Configuration

### Environment Variables
```
META_CLIENT_ID=your_meta_app_id
META_CLIENT_SECRET=your_meta_app_secret
META_REDIRECT_URI=https://yourapp.com/meta/oauth/callback
```

### config/services.php
```php
'meta' => [
    'client_id' => env('META_CLIENT_ID'),
    'client_secret' => env('META_CLIENT_SECRET'),
    'api_version' => 'v18.0',
    'base_url' => 'https://graph.facebook.com',
],
```

## API Workflow

### Account Linking Flow
1. User clicks "Link Account" for platform
2. `initiateOAuth()` generates OAuth URL
3. User redirected to Meta login/permission screen
4. Meta redirects back to callback with authorization code
5. `handleCallback()` exchanges code for access token
6. Account details fetched and stored
7. Default preferences created
8. User redirected to dashboard

### Message Analysis Flow
1. User views conversation with incoming message
2. User clicks "Analyze" button
3. `analyzeAndDraft()` triggered
4. AI analyzes message (sentiment, category, intent)
5. AI generates contextual reply draft
6. Draft stored with analysis metadata
7. Draft displayed to user for review
8. User can:
   - Edit and send draft
   - Regenerate draft
   - Reject draft
   - Send manual message

### Auto-Reply Flow
1. Webhook receives incoming message notification
2. Message stored in database
3. If auto-analysis enabled:
   - Message is analyzed
   - Draft is generated
4. If auto-reply enabled:
   - Draft is automatically approved
   - Draft is automatically sent (with optional delay)
5. Activity logged

## Troubleshooting

### Token Expiration
- Access tokens are checked before each API call
- If expired, user is prompted to reconnect account
- Refresh tokens are supported for eligible platforms

### API Errors
- All API errors are logged with context
- User receives friendly error messages
- Specific API error codes are tracked for debugging

### Permission Issues
- Ensure Meta app has required permissions for each platform
- Check OAuth scopes in `MetaApiService::getScopeForPlatform()`
- Verify app is approved for platform-specific features

## Future Enhancements

1. **Webhook Integration**: Real-time message reception
2. **Bulk Actions**: Perform actions on multiple conversations
3. **Templates**: Pre-defined response templates
4. **Analytics**: Detailed analytics on response times and approval rates
5. **Team Collaboration**: Assign conversations to team members
6. **Advanced Scheduling**: Schedule messages for specific times
7. **AI Learning**: Learn from approved/rejected responses
8. **Multilingual Support**: Generate replies in different languages

## Support

For issues or questions regarding Meta Platform Automation:
1. Check the logs: `storage/logs/laravel.log`
2. Review meta_automation_logs table
3. Contact support with account ID and error message

## Development Notes

### Adding New Platforms
1. Add platform to enum in migrations
2. Update `MetaApiService::getScopeForPlatform()`
3. Update `MetaApiService::fetchAccountDetails()`
4. Update OAuth flow in MetaAccountController
5. Update frontend platform selectors

### Custom AI Integration
The system uses `MetaMessageAnalyzerService` for AI operations. To integrate:
1. Create implementation of analyzer service
2. Call AI API from `analyzeMessage()` and `generateReply()`
3. Parse and return results in expected format

### Extending Automation Rules
1. Add preferences to `MetaAutomationPreference` model
2. Update preference migration
3. Add preference fields to frontend forms
4. Implement logic in `MetaMessageController`

## Testing

### Manual Testing Checklist
- [ ] OAuth flow for each platform
- [ ] Account connection and disconnection
- [ ] Message fetching and display
- [ ] AI analysis accuracy
- [ ] Draft generation and editing
- [ ] Manual message sending
- [ ] Auto-reply with approval
- [ ] Auto-reply without approval
- [ ] Preference saving and applying
- [ ] Error handling and recovery

### Sample Test Data
```php
// Create test account
$account = MetaAccount::factory()->create([
    'user_id' => $user->id,
    'platform' => 'facebook',
]);

// Create test conversation
$conversation = MetaConversation::factory()->create([
    'meta_account_id' => $account->id,
]);

// Create test messages
MetaMessage::factory()->create([
    'meta_account_id' => $account->id,
    'conversation_id' => $conversation->conversation_id,
    'direction' => 'incoming',
]);
```

## License
This feature is part of the Rhea AI Application and is subject to the same license terms.
