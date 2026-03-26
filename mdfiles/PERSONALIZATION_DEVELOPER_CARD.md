# Chat Personalization - Developer Quick Card

## 🎯 What's New

GrokApiService now **automatically applies user chat preferences** when you set the user context. No manual prompt building needed!

## 🚀 Quick Start

### Before (Old Way)
```php
$customSystemPrompt = $user?->load('aiMode')->aiMode?->system_prompt ?? null;
$grokService->generateStreamingChat(
    $message, $callback, $model, $history, [], null, true, [],
    $customSystemPrompt,  // Had to build manually
    $callByName, $userName
);
```

### After (New Way) ✨
```php
$grokService->setUser($user);  // That's it!
$grokService->generateStreamingChat(
    $message, $callback, $model, $history, [], null, true, [],
    null,  // null = automatic personalization
    false, null
);
```

## 🔧 Implementation in ChatController

```php
// In ChatController::chat()

$user = Auth::user();

// Enable personalization
$grokService->setUser($user);

// Pass null for customSystemPrompt
if ($stream) {
    return $this->handleStreamingChat(
        $message, $history, $conversation, $enableTools, $model,
        $canvasMode, $files, null,  // ← null here
        false, null
    );
}
```

## 📊 What Gets Personalized

When you set a user, these are automatically applied:

| Preference | Range | Example |
|-----------|-------|---------|
| Tone | 1-10 | Very Formal → Playful |
| Detail | 1-10 | One-liner → Exhaustive |
| Length | 1-10 | Short → Extended |
| AI Mode | Various | Creative, Analytical, etc. |
| Custom Prompt | Text | "Focus on examples" |
| Name Usage | Boolean | Use user's name? |

## 🎨 Personalization Layers

```
1. System Personalization (Base - Cannot Override)
   ↓
2. System Constraints (Applied)
   ↓
3. User Preferences (Tone, Detail, Length)
   ↓
4. Custom System Prompt
   ↓
5. User Name (Optional)
   ↓
Final Prompt
```

## 💡 Common Use Cases

### Case 1: Apply Full Personalization
```php
$grokService->setUser(Auth::user());
$grokService->generateStreamingChat($message, $callback, 'grok-4', [], [], null, true, [], null, false, null);
// Result: Uses all user preferences
```

### Case 2: Disable Personalization for Specific Request
```php
$grokService->setUser(null);  // Or don't set
$grokService->generateStreamingChat($message, $callback, 'grok-4', [], [], null, true, [], "Custom prompt", false, null);
// Result: Uses custom prompt, ignores user preferences
```

### Case 3: Override Personalization with Custom Prompt
```php
$grokService->setUser($user);
$grokService->generateStreamingChat($message, $callback, 'grok-4', [], [], null, true, [], "Explicit prompt", false, null);
// Result: Uses explicit prompt (overrides automatic personalization)
```

### Case 4: Use with Names
```php
$user = Auth::user();
$grokService->setUser($user);
$grokService->generateStreamingChat($message, $callback, 'grok-4', [], [], null, true, [], null, true, $user->first_name);
// Result: Uses personalization + name
```

## 🔍 How It Works (Behind the Scenes)

```
setUser($user)
    ↓ Stores user in $currentUser
generateStreamingChat(..., null, ...)
    ↓ Checks: if ($this->currentUser && !$customSystemPrompt)
    ↓ Yes? Call ChatPersonalizationService::buildSystemPrompt($user)
    ↓ Returns: Complete personalized system prompt
    ↓ Uses in formatMessages()
    ↓ Sends to API
    ↓ AI responds with personalization
```

## ✅ Testing

### Verify Personalization Works

```bash
# 1. Set preferences
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tone_level": 8, "detail_level": 7, "response_length": 6}'

# 2. Send message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "stream": true}'

# 3. Check response
# - Should be casual (tone 8)
# - Should be detailed (detail 7)
# - Should be longer (length 6)
```

### Check Logs
```bash
# Look for this line indicating personalization was applied:
grep "Applied ChatPersonalizationService" storage/logs/laravel.log
```

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Personalization not working | Call `setUser($user)` before generateChat |
| Custom prompt ignored | Pass null to customSystemPrompt parameter |
| Name not used | Set `call_by_name = true` on user |
| Can't override | Pass explicit customSystemPrompt (non-null) |

## 🔑 Key Methods

### GrokApiService
```php
// Set user context
$grokService->setUser($user);

// Get current user
$currentUser = $grokService->getUser();

// Generate streaming chat (uses personalization if user set)
$grokService->generateStreamingChat(..., null, ...);

// Generate non-streaming chat (uses personalization if user set)
$grokService->generateChat(..., null, ...);
```

### ChatController
```php
// In chat() method
$grokService->setUser(Auth::user());

// Then pass null for customSystemPrompt
```

## 📁 Files Modified

1. **app/Services/GrokApiService.php**
   - Added user context property
   - Added setUser() and getUser() methods
   - Updated streaming/non-streaming methods

2. **app/Http/Controllers/ChatController.php**
   - Added ChatPersonalizationService import
   - Set user context in chat() method
   - Pass null for customSystemPrompt

## 📚 Reference Docs

- **GROK_PERSONALIZATION_INTEGRATION.md** - Detailed guide
- **PERSONALIZATION_QUICK_SUMMARY.md** - Complete overview
- **PERSONALIZATION_IMPLEMENTATION_CHECKLIST.md** - Implementation status

## 🎓 Database

### user_chat_preferences Table
```sql
- user_id
- tone_level (1-10, default 5)
- detail_level (1-10, default 5)
- response_length (1-10, default 5)
- preferred_ai_mode_id
- custom_system_prompt
- system_personalization_id
```

## ⚡ Performance

- Single user context per request ✅
- No N+1 queries ✅
- Efficient preference caching ✅
- No added latency ✅

## 🔒 Security

- Requires Authentication ✅
- User-scoped preferences ✅
- No privilege escalation ✅
- System constraints enforced ✅

## ❓ FAQ

**Q: Do I need to change existing code?**
A: No, it's backward compatible. Optional to use.

**Q: What if user is not set?**
A: Falls back to default behavior.

**Q: Can I still use custom prompts?**
A: Yes, pass non-null customSystemPrompt to override.

**Q: Is this secure?**
A: Yes, requires Auth and respects all constraints.

**Q: What about language support?**
A: Already works with language detection.

## 🚦 Status: READY FOR PRODUCTION ✅

All tests passed, documentation complete, backward compatible.

---

**Summary:** Enable personalization with one line: `$grokService->setUser($user)`
