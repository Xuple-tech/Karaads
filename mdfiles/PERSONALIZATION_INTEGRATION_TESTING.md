# Personalization Integration - Testing Guide

## Quick Verification Checklist

### ✅ Phase 1: Code Integration Verification

- [x] ChatController.php has ChatPersonalizationService import
- [x] ChatController.php builds system prompt in chat() method
- [x] Api/ChatController.php has ChatPersonalizationService import
- [x] Api/ChatController.php builds system prompt in sendMessage() method
- [x] GrokApiService comments updated
- [x] All parameters pass through handler methods to AI service

**Status**: All code changes in place ✅

---

## Phase 2: Database Setup

Before testing, ensure these migrations have run:

```bash
php artisan migrate
```

This should create/update:
- `system_personalizations` table
- `personalization_templates` table
- `user_chat_preferences` table
- `ai_modes` table

**Verification**:
```sql
-- Check if tables exist
SHOW TABLES LIKE 'system_personalizations';
SHOW TABLES LIKE 'user_chat_preferences';
SHOW TABLES LIKE 'personalization_templates';
SHOW TABLES LIKE 'ai_modes';

-- Check if columns exist
SHOW COLUMNS FROM user_chat_preferences;
-- Should include: tone_level, detail_level, response_length, 
-- custom_system_prompt, applied_min_tone, applied_max_tone, etc.
```

---

## Phase 3: Test Scenario 1 - Default Behavior

### Setup
1. Clear browser cookies/cache
2. Login as regular user
3. Do NOT set any custom preferences

### Expected Behavior
- User's chatPreferences should auto-create with defaults (tone_level=5, detail_level=5, response_length=5)
- Chat should work normally with default system prompt
- No errors in logs

### Test Steps
```bash
# 1. Start the server
php artisan serve

# 2. In another terminal, check logs
tail -f storage/logs/laravel.log

# 3. Login and send a chat message
# 4. Check browser console for any errors
# 5. Check server logs for the buildSystemPrompt call
```

### What to Look For
```
[Chat message]: "Hello"
✓ Response should be normal
✓ No errors in browser console
✓ No SQL errors in server log
```

---

## Phase 4: Test Scenario 2 - Custom Preferences

### Setup
1. Login as regular user
2. Navigate to `/settings/personalization`
3. Adjust preferences:
   - Tone Level: Drag to 8 (Very Friendly)
   - Detail Level: Drag to 3 (Brief)
   - Response Length: Drag to 2 (Short)
4. Save

### Expected Behavior
- Settings save successfully
- Toast notification shows "Settings saved"
- API returns 200 with updated preferences

### Test Steps
1. Open Developer Tools (F12)
2. Go to Network tab
3. Make the changes
4. Capture the PUT request to `/api/settings/personalization`
5. Verify response includes:
   ```json
   {
     "success": true,
     "preferences": {
       "tone_level": 8,
       "detail_level": 3,
       "response_length": 2,
       "system_constraints": {
         "applied_min_tone": 1,
         "applied_max_tone": 10,
         // ... other constraints
       }
     }
   }
   ```

### Test Chat with Custom Preferences
1. Send message: "Tell me about history"
2. Observe:
   - Response should be BRIEF (short sentences)
   - Tone should be FRIENDLY (use of "Hey!" or similar)
   - Detail should be MINIMAL (no long paragraphs)

**Example Response**:
- ❌ Wrong: Long detailed history lesson
- ✅ Right: "History is basically the story of what happened! 😊 Want to know about a specific period?"

---

## Phase 5: Test Scenario 3 - System Constraints

### Setup
1. Login as admin
2. Create a System Personalization:
   - Name: "Formal Professional"
   - Min Tone: 1 (Very Formal)
   - Max Tone: 4 (Still Formal)
   - System Prompt: "You are a professional business consultant..."

3. Assign this to a test user

### Test
1. Login as that test user
2. Try to set Tone Level to 9 (Very Friendly)
3. Save preferences

### Expected Behavior
- Tone Level automatically clamps to 4 (system max)
- Response shows: `"applied_max_tone": 4`
- Chat responses are formal regardless of slider position

**Verification Query**:
```sql
SELECT tone_level, applied_min_tone, applied_max_tone 
FROM user_chat_preferences 
WHERE user_id = 'test-user-id';

-- Should show:
-- tone_level: 4 (clamped)
-- applied_min_tone: 1
-- applied_max_tone: 4
```

---

## Phase 6: Test Scenario 4 - API Integration

### Test via cURL
```bash
# 1. Login and get session cookie
curl -c cookies.txt \
  -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# 2. Get current preferences
curl -b cookies.txt \
  http://localhost:8000/api/settings/personalization

# 3. Update preferences
curl -b cookies.txt \
  -X PUT http://localhost:8000/api/settings/personalization \
  -H "Content-Type: application/json" \
  -d '{
    "tone_level": 7,
    "detail_level": 6,
    "response_length": 4
  }'

# 4. Send chat
curl -b cookies.txt \
  -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "stream": false
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "AI response with custom preferences applied...",
  "message_id": "chat-123",
  "conversation_id": "conv-123"
}
```

---

## Phase 7: Code-Level Testing

### Check User Preferences Load
```php
// In tinker
php artisan tinker

// Load user with preferences
$user = User::with('chatPreferences.systemPersonalization')->find(1);
dump($user->chatPreferences);

// Should show:
// - tone_level, detail_level, response_length
// - applied_min_tone, applied_max_tone, etc.
// - system_personalization relationship loaded
```

### Check System Prompt Build
```php
use App\Services\ChatPersonalizationService;
use App\Models\User;

$user = User::find(1);
$prompt = ChatPersonalizationService::buildSystemPrompt($user);
echo $prompt;

// Should output multi-line prompt including:
// 1. System personalization prompt
// 2. Tone instructions
// 3. Detail instructions
// 4. Response length instructions
// 5. Custom prompt (if set)
```

### Check Constraint Application
```php
$user = User::find(1);
$prefs = $user->chatPreferences;

// Before constraints
echo "Tone: " . $prefs->tone_level;

// Apply constraints
$prefs->applySystemConstraints();

// After constraints (should be clamped)
echo "Tone: " . $prefs->tone_level;
```

---

## Phase 8: Integration Testing (Full Flow)

### Test 1: Web Interface Full Flow
```
1. Login → /settings/personalization
2. Set preferences → Save
3. Navigate to /app (chat interface)
4. Send message → Observe personalized response
5. Change preferences
6. Send another message → Observe updated response
```

### Test 2: API Full Flow
```
1. POST /api/login → Get session
2. PUT /api/settings/personalization → Set preferences
3. POST /api/chat → Send message with personalization
4. Verify response style matches preferences
```

### Test 3: Streaming Full Flow
```
1. Set preferences (tone=8, detail=3)
2. POST /api/chat with stream=true
3. Listen to SSE stream
4. Verify response arrives in chunks
5. Verify response is brief and friendly
```

---

## Error Scenarios to Test

### Scenario 1: User Not Authenticated
```bash
# Try to get preferences without login
curl http://localhost:8000/api/settings/personalization

# Expected: 401 Unauthorized
```

### Scenario 2: Invalid Preference Values
```bash
# Try to set tone_level to 15 (exceeds max)
curl -X PUT http://localhost:8000/api/settings/personalization \
  -H "Content-Type: application/json" \
  -d '{"tone_level": 15}'

# Expected: 422 or auto-clamped to 10
```

### Scenario 3: System Personalization Doesn't Exist
```php
// Delete all system personalizations
SystemPersonalization::truncate();

// User should still work with defaults
$user = User::find(1);
$prompt = ChatPersonalizationService::buildSystemPrompt($user);
// Should not crash, should use fallback
```

---

## Debugging Tools

### Enable Detailed Logging
```php
// In config/personalization.php
'logging' => [
    'enabled' => true,
    'log_violations' => true,
    'log_admin_changes' => true,
]

// Check logs
tail -f storage/logs/laravel.log | grep -i personalization
```

### Database Inspection
```sql
-- View user preferences
SELECT user_id, tone_level, detail_level, response_length, 
       applied_min_tone, applied_max_tone
FROM user_chat_preferences;

-- View system personalizations
SELECT id, name, min_tone_level, max_tone_level, is_active
FROM system_personalizations;

-- Check constraints
SELECT user_id, 
       tone_level,
       applied_min_tone,
       applied_max_tone,
       CASE 
         WHEN tone_level < applied_min_tone THEN 'VIOLATES MIN'
         WHEN tone_level > applied_max_tone THEN 'VIOLATES MAX'
         ELSE 'OK'
       END as constraint_status
FROM user_chat_preferences;
```

### API Response Inspection
```javascript
// In browser console, intercept fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const promise = originalFetch.apply(this, args);
  promise.then(response => {
    if (args[0].includes('personalization')) {
      console.log('Personalization API:', {
        url: args[0],
        method: args[1]?.method || 'GET',
        body: args[1]?.body
      });
      response.clone().json().then(data => {
        console.log('Response:', data);
      });
    }
  });
  return promise;
};
```

---

## Performance Testing

### Check Query Count
```php
// Enable query log
DB::enableQueryLog();

// Execute chat
ChatPersonalizationService::buildSystemPrompt($user);

// Check queries
dump(DB::getQueryLog());

// Should be minimal (1-2 queries for preferences, 1 for system personalization)
```

### Check Response Time
```bash
# Send 10 chat messages and measure
time for i in {1..10}; do
  curl -X POST http://localhost:8000/api/chat \
    -b cookies.txt \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello", "stream": false}'
done

# Should be consistent with/without personalization enabled
```

---

## Rollback Instructions

If something breaks, you can temporarily disable personalization:

```php
// In config/personalization.php
'features' => [
    'enabled' => false,  // Disable personalization
]

// Or in GrokApiService, temporarily comment out:
// $customSystemPrompt = ChatPersonalizationService::buildSystemPrompt($user);
// And pass null instead
```

---

## Success Criteria

All of the following should be true:

- [ ] Users can set preferences without errors
- [ ] Chat responses respect tone preferences
- [ ] Chat responses respect detail preferences
- [ ] Chat responses respect length preferences
- [ ] System constraints are enforced (values clamped)
- [ ] Both web and API interfaces work
- [ ] Streaming chat works
- [ ] Non-streaming chat works
- [ ] Defaults work for new users
- [ ] Performance is acceptable
- [ ] No SQL errors in logs
- [ ] No JavaScript errors in console

---

## Test Coverage Checklist

### Unit Tests Needed
- [ ] ChatPersonalizationService::buildSystemPrompt()
- [ ] UserChatPreference::applySystemConstraints()
- [ ] SystemPersonalization::isPreferenceAllowed()

### Integration Tests Needed
- [ ] Chat controller passes personalization to service
- [ ] API controller passes personalization to service
- [ ] Preferences save and load correctly
- [ ] Constraints are enforced on save

### E2E Tests Needed
- [ ] User can change preferences and see effects
- [ ] AI responses respect preferences
- [ ] Multiple users don't interfere with each other

---

**Last Updated**: 2024  
**Status**: Ready for testing
