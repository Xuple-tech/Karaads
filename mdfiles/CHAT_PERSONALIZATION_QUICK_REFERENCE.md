# Chat Personalization - Quick Reference Guide

## Quick Start Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Seed AI modes: `php artisan db:seed --class=ChatModesSeeder`
- [ ] Build frontend: `npm run build`
- [ ] Test API endpoints
- [ ] Test frontend UI
- [ ] Test chat functionality

## Architecture At A Glance

```
User Preferences (UI)
        ↓
   ChatPreferences Component
        ↓
API Endpoints (ChatPreferenceController)
        ↓
UserChatPreference Model
        ↓
Database (user_chat_preferences table + users columns)
        ↓
ChatPersonalizationService (buildSystemPrompt)
        ↓
ChatController (sendMessage)
        ↓
Grok API (with personalized system prompt)
```

## Key Components

### 1. Frontend
- **Component**: `resources/js/components/ChatPreferences.tsx`
- **Integration**: `resources/js/pages/User/Settings.tsx` (line 258)
- **API Calls**: `/api/settings/chat-preferences`, `/api/settings/chat-modes`

### 2. Backend
- **Service**: `app/Services/ChatPersonalizationService.php`
- **Controller**: `app/Http/Controllers/Api/ChatPreferenceController.php`
- **Models**: `UserChatPreference.php`, `User.php`, `AIMode.php`

### 3. Database
- **New Columns (users table)**: `tone_level`, `detail_level`, `response_length`
- **New Table**: `user_chat_preferences` (with UUID key)

## API Endpoints Reference

### Get User Preferences
```
GET /api/settings/chat-preferences
Response: UserChatPreference with descriptions
```

### Update User Preferences
```
PUT /api/settings/chat-preferences
Body: {
  "tone_level": 1-10,
  "detail_level": 1-10,
  "response_length": 1-10,
  "preferred_ai_mode_id": number|null,
  "custom_system_prompt": string|null
}
```

### Get Available AI Modes
```
GET /api/settings/chat-modes
Response: Array of AIMode objects with emoji and description
```

### Reset to Defaults
```
POST /api/settings/chat-preferences/reset
Response: Success message
```

## Preference Levels Quick Reference

| Level | Tone | Detail | Length |
|-------|------|--------|--------|
| 1 | Very Formal | Extremely Brief | One-liner |
| 2 | Formal | Very Brief | Very Short |
| 3 | Professional | Brief | Short |
| 4 | Semi-professional | Concise | Brief |
| 5 | **Balanced** | **Moderate** | **Moderate** |
| 6 | Friendly | Detailed | Long |
| 7 | Casual | Very Detailed | Very Long |
| 8 | Very Casual | Comprehensive | Extended |
| 9 | Humorous | Exhaustive | Very Extended |
| 10 | Playful | Ultra-detailed | Maximum |

## Predefined AI Modes

1. 🎨 **Creative** - Innovative, imaginative responses
2. 🔍 **Analytical** - Logical, data-driven analysis
3. ⚖️ **Balanced** - Creative + analytical mix
4. ⚙️ **Pragmatic** - Practical, actionable solutions
5. 🎓 **Educator** - Clear explanations with examples
6. 💬 **Conversational** - Friendly, natural dialogue
7. 💼 **Professional** - Business-appropriate tone
8. 🧠 **Expert** - In-depth technical knowledge

## How Preferences Flow Through the System

### 1. User Sets Preferences (Frontend)
```tsx
// ChatPreferences component
tone_level: 7     // Very Casual
detail_level: 8   // Comprehensive
response_length: 6 // Long
preferred_ai_mode_id: 1 // Creative mode
```

### 2. Preferences Saved to Database
```sql
-- In user_chat_preferences table
UPDATE user_chat_preferences 
SET tone_level = 7, detail_level = 8, response_length = 6, preferred_ai_mode_id = 1
WHERE user_id = 'user-id';
```

### 3. Chat Message Sent
```php
// ChatController::sendMessage()
$customSystemPrompt = ChatPersonalizationService::buildSystemPrompt($user);
```

### 4. Service Builds Personalized Prompt
```php
// Combines:
// - Creative mode base prompt
// - "Be very casual and friendly" (tone level 7)
// - "Provide comprehensive responses" (detail level 8)
// - "Provide longer responses (2-4 paragraphs)" (length level 6)
```

### 5. Prompt Sent to AI
```php
$this->grokService->generateStreamingChat(
    $message,
    callback,
    $model,
    $history,
    [],
    $format,
    $enableTools,
    $files,
    $customSystemPrompt,  // <-- Personalized prompt
    $user->call_by_name ?? false,
    $user->name
);
```

### 6. AI Responds with Preferences Applied
The AI receives the personalized system prompt and responds accordingly.

## Development Tasks

### Adding a New Preference Type

1. **Add column to users table** (migration)
```php
$table->integer('your_preference')->default(5);
```

2. **Add to UserChatPreference model** (fillable)
```php
'your_preference' => 'integer',
```

3. **Add instruction method to ChatPersonalizationService**
```php
private static function getYourPreferenceInstruction(int $level): ?string
{
    $instructions = [
        1 => "Instruction for level 1",
        5 => null, // Balanced - no instruction
        10 => "Instruction for level 10",
    ];
    return $instructions[$level] ?? null;
}
```

4. **Call in buildSystemPrompt**
```php
$personalizations[] = self::getYourPreferenceInstruction($preferences->your_preference);
```

5. **Add to ChatPreferenceController** (update and get methods)

6. **Add to ChatPreferences component** (UI slider)

## Testing Guide

### Unit Test Example
```php
// Test building system prompt
$user = User::factory()->create();
$prompt = ChatPersonalizationService::buildSystemPrompt($user);
$this->assertStringContainsString('creative', strtolower($prompt));
```

### API Test Example
```bash
# Get preferences
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/settings/chat-preferences

# Update preferences
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"tone_level": 8, "detail_level": 7}' \
  http://localhost:8000/api/settings/chat-preferences
```

### Manual Testing Checklist
- [ ] Load Settings page
- [ ] See all 8 conversation modes in dropdown
- [ ] Adjust tone slider - see description update
- [ ] Adjust detail slider - see description update
- [ ] Adjust length slider - see description update
- [ ] Select conversation mode - see mode info
- [ ] Enter custom prompt text
- [ ] Click Save - see success toast
- [ ] Refresh page - preferences persist
- [ ] Click Reset - preferences return to defaults
- [ ] Send chat message - AI responds with preferences applied

## Common Mistakes to Avoid

❌ **Forgetting to migrate**
- Always run `php artisan migrate` before testing

❌ **Forgetting to seed AI modes**
- Run `php artisan db:seed --class=ChatModesSeeder` to populate modes

❌ **Not passing system prompt to Grok API**
- Verify ChatController calls `buildSystemPrompt()` before sending to grokService

❌ **Frontend not showing preferences**
- Verify ChatPreferences component is imported and rendered in Settings.tsx

❌ **Preferences not persisting**
- Check that API endpoint is properly authenticated
- Verify database connection is working

## Performance Considerations

1. **System Prompt Generation**: Happens on every message - currently minimal overhead
2. **Database Queries**: One query per message to fetch user preferences (can be cached)
3. **API Response Size**: Preference endpoint returns small payload (~1KB)

### Optimization Opportunities
- Cache user preferences in Redis for high-traffic scenarios
- Preload preferences with user authentication
- Batch preference updates if multiple users updating simultaneously

## Security Notes

✅ All preference endpoints require authentication
✅ Users can only access/modify their own preferences
✅ Custom system prompts are user-provided (validate length)
✅ All inputs are validated (1-10 range for levels)

## Debugging Tips

### Check Preferences are Loaded
```php
// In tinker
$user = User::find('user-id');
$prefs = $user->chatPreferences;
dd($prefs);
```

### Test System Prompt Generation
```php
use App\Services\ChatPersonalizationService;
use App\Models\User;

$user = User::find('user-id');
$prompt = ChatPersonalizationService::buildSystemPrompt($user);
dd($prompt);
```

### View Raw Database Preferences
```sql
SELECT * FROM user_chat_preferences WHERE user_id = 'user-id';
SELECT tone_level, detail_level, response_length FROM users WHERE id = 'user-id';
```

## References

- **Full Implementation Guide**: `CHAT_PERSONALIZATION_IMPLEMENTATION.md`
- **ChatPersonalizationService**: `app/Services/ChatPersonalizationService.php`
- **ChatPreferenceController**: `app/Http/Controllers/Api/ChatPreferenceController.php`
- **ChatPreferences Component**: `resources/js/components/ChatPreferences.tsx`

---

**Last Updated**: Current Session
