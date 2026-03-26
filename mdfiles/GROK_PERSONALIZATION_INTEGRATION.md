# Grok API Service - Chat Personalization Integration

## Overview

The GrokApiService has been fully integrated with the ChatPersonalizationService to support comprehensive user preference-based chat personalization. This document outlines the integration, usage, and architecture.

## Changes Made

### 1. GrokApiService Updates

#### New Properties
- Added `$currentUser` property to store the current authenticated user context

#### New Methods
- `setUser(?User $user): self` - Sets the current user for personalization context
- `getUser(): ?User` - Retrieves the current user

#### Updated Imports
- Added `use App\Services\ChatPersonalizationService;`

#### Enhanced Methods

##### `generateStreamingChat()`
Now automatically applies ChatPersonalizationService when:
- A user is available (`$this->currentUser` is set)
- No custom system prompt is explicitly provided

**Flow:**
1. If `$this->currentUser` exists and `$customSystemPrompt` is null:
   - Calls `ChatPersonalizationService::buildSystemPrompt($this->currentUser)`
   - Applies all user preference layers (tone, detail, length, AI mode, custom prompt)
2. If `callByName` is true and `$userName` is provided:
   - Adds personalized name usage instruction (avoids duplication)

##### `generateChat()`
Same personalization logic as `generateStreamingChat()` for non-streaming responses.

### 2. ChatController Updates

#### New Import
- Added `use App\Services\ChatPersonalizationService;`

#### Updated `chat()` Method
**Previous Approach:**
- Only passed partial user data (AI mode system prompt, call_by_name flag, user name)
- Did not use full ChatPersonalizationService

**New Approach:**
1. Authenticates the user
2. Sets user context in GrokApiService: `$this->ollamaCloud->setUser($user)`
3. Passes null as `$customSystemPrompt` to allow GrokApiService to build full personalized prompt
4. GrokApiService handles the full personalization through ChatPersonalizationService

**Result:**
All user preferences are now applied:
- ✅ Tone level (1-10)
- ✅ Detail level (1-10)
- ✅ Response length (1-10)
- ✅ Preferred AI mode
- ✅ Custom system prompt
- ✅ System personalization constraints
- ✅ Name usage preference

## Architecture

### Layered Personalization Flow

```
ChatController.chat()
    ↓
$this->ollamaCloud->setUser($user)
    ↓
generateStreamingChat() / generateChat()
    ↓
User available? → Yes
    ↓
ChatPersonalizationService::buildSystemPrompt($user)
    ↓
LAYER 1: System Personalization (base)
    ↓
LAYER 2: Apply System Constraints
    ↓
LAYER 3: User Preferences (tone, detail, length)
    ↓
LAYER 4: Custom System Prompt
    ↓
Final System Prompt + User Name (if enabled)
    ↓
GrokApiService formats messages and sends to API
```

## User Preference Levels

### Tone Level (1-10)
- **1** = Very Formal (corporate, structured)
- **5** = Balanced (neutral)
- **10** = Playful (humorous, lighthearted)

### Detail Level (1-10)
- **1** = Extremely Brief (one-liners)
- **5** = Moderate (balanced)
- **10** = Ultra-detailed (comprehensive)

### Response Length (1-10)
- **1** = Short (1-2 sentences)
- **5** = Moderate
- **10** = Maximum (extended responses)

### AI Modes
- Creative
- Analytical
- Balanced
- Pragmatic
- Educator
- Conversational
- Professional
- Expert

## Usage Examples

### Example 1: Streaming Chat with User Personalization

```php
$user = Auth::user();
$grokService = app(GrokApiService::class);
$grokService->setUser($user);

$grokService->generateStreamingChat(
    "Explain quantum computing",
    function($chunk) {
        // Handle streamed content
        if (isset($chunk['content'])) {
            echo $chunk['content'];
        }
    },
    'grok-4',
    $history,
    [], // tools
    null, // format
    true, // autoTools
    [], // files
    null, // customSystemPrompt - null lets ChatPersonalizationService build it
    false, // callByName
    null // userName
);
```

**Result:** AI responds according to user's saved preferences (tone, detail, length, mode)

### Example 2: Non-Streaming Chat with User Personalization

```php
$user = Auth::user();
$grokService = app(GrokApiService::class);
$grokService->setUser($user);

$response = $grokService->generateChat(
    "What is artificial intelligence?",
    'grok-4',
    $history,
    [], // tools
    null, // format
    [], // files
    null, // customSystemPrompt - null lets ChatPersonalizationService build it
    false, // callByName
    null // userName
);
```

### Example 3: Manual System Prompt Override

```php
$grokService = app(GrokApiService::class);
$grokService->setUser(null); // Disable personalization

$response = $grokService->generateChat(
    "Your question",
    'grok-4',
    $history,
    [],
    null,
    [],
    "Be extremely technical and use advanced terminology", // Custom prompt
    false,
    null
);
```

## Personalization in Action

### Scenario: User with Custom Preferences
**User Settings:**
- Tone: 7 (Casual)
- Detail: 8 (Very Detailed)
- Length: 6 (Long)
- AI Mode: Creative
- Custom Prompt: "Focus on innovative solutions"
- Call by Name: Enabled (Name: Alex)

**Query:** "How can I improve my productivity?"

**Generated System Prompt Structure:**
```
[Creative Mode Base Prompt]
"You are a creative and imaginative assistant..."

Be casual and conversational, as if talking to a friend, while remaining helpful.

Give very detailed responses with comprehensive explanations and multiple examples.

Provide longer, more comprehensive responses (2-4 paragraphs).

Additional instructions: Focus on innovative solutions

The user's name is Alex. Use their name occasionally in your responses when appropriate.

[System constraint: User preferences respect organizational requirements]
```

**Result:** AI responds in casual tone, with detailed explanations, longer format, creative perspective, innovative focus, using the user's name

## Database Integration

### Tables Used
1. **users** (columns: tone_level, detail_level, response_length, call_by_name)
2. **user_chat_preferences** (full preferences table)
3. **ai_modes** (conversation modes)
4. **system_personalizations** (organization-level constraints)
5. **personalization_templates** (preset templates)

### Data Flow
```
User Updates Settings (Frontend)
    ↓
PUT /api/settings/chat-preferences
    ↓
ChatPreferenceController saves to database
    ↓
User sends chat message
    ↓
ChatController retrieves user + preferences
    ↓
GrokApiService applies personalization
    ↓
ChatPersonalizationService builds final prompt
    ↓
AI responds with personalized behavior
```

## Key Features

### ✅ Automatic Personalization
- No need to manually pass personalization data to GrokApiService
- Simply set the user context: `$grokService->setUser($user)`
- All preferences are automatically applied

### ✅ Layered Approach
- System constraints cannot be overridden by user
- User preferences respect organizational requirements
- Custom prompts enhance but don't override system settings

### ✅ Backward Compatible
- Existing code that passes explicit `$customSystemPrompt` still works
- Can override automatic personalization when needed
- No breaking changes

### ✅ Language Support
- Detects user language (Hausa, Yoruba, Igbo, English)
- Applies appropriate system instructions
- Works with personalization layers

### ✅ Name Usage
- Optional per-user setting
- Integrated with personalization system
- Avoids duplication

## Testing

### Unit Test Example
```php
public function test_personalization_applied_to_streaming_chat()
{
    $user = User::factory()->create([
        'tone_level' => 8,
        'detail_level' => 7,
        'response_length' => 6,
        'call_by_name' => true
    ]);

    $grokService = app(GrokApiService::class);
    $grokService->setUser($user);

    $called = false;
    $grokService->generateStreamingChat(
        "Hello",
        function($chunk) use (&$called) {
            $called = true;
        },
        'grok-4'
    );

    $this->assertTrue($called);
}
```

### Manual API Test
```bash
# Set user preferences first
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tone_level": 8,
    "detail_level": 7,
    "response_length": 6
  }'

# Send chat message (will use personalization)
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain machine learning",
    "conversation_id": 1,
    "stream": true
  }'
```

## Performance Considerations

### Optimization Tips
1. **User Loading:** Set user context once per request
   ```php
   $grokService->setUser(Auth::user());
   ```

2. **Preference Caching:** User preferences are cached in the model
   ```php
   $user->chatPreferences // Uses Eloquent caching
   ```

3. **Lazy Loading:** Relationships are loaded only when needed
   ```php
   $preferences->load(['systemPersonalization', 'aiMode']);
   ```

## Troubleshooting

### Issue: Personalization Not Applied
**Solution:** Ensure user is set before calling API method
```php
$grokService->setUser($user); // Must be set
$grokService->generateStreamingChat(...);
```

### Issue: Custom Prompt Being Ignored
**Solution:** Custom prompts are enhanced, not replaced. They work alongside personalization.

### Issue: Name Not Used in Response
**Solution:** Check if `call_by_name` is enabled for user
```php
$user->call_by_name = true;
$user->save();
```

## Future Enhancements

1. **Team-Level Personalization:** Extend system personalization to teams
2. **Dynamic Adjustments:** Real-time preference adjustments based on feedback
3. **Preference Presets:** Save and load preset combinations
4. **A/B Testing:** Compare preference variations
5. **Analytics:** Track which preferences users prefer

## Migration Guide

### For Existing Code

**Before:**
```php
$grokService = app(GrokApiService::class);
$grokService->generateStreamingChat(
    $message,
    $callback,
    $model,
    $history,
    [],
    null,
    true,
    [],
    $customSystemPrompt, // Had to build manually
    $callByName,
    $userName
);
```

**After:**
```php
$grokService = app(GrokApiService::class);
$grokService->setUser(Auth::user()); // Simple one-time setup
$grokService->generateStreamingChat(
    $message,
    $callback,
    $model,
    $history,
    [],
    null,
    true,
    [],
    null, // Automatically built from user preferences
    false,
    null
);
```

## Support

For issues or questions about the personalization system:
1. Check ChatPersonalizationService documentation
2. Review user preferences in database
3. Check system constraints in place
4. Enable debug logging for detailed information

```php
Log::info('Applied ChatPersonalizationService for user: ' . $user->id);
```
