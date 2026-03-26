# Chat Personalization - Testing & Verification Guide

## Pre-Flight Checklist

Before testing, ensure:
- [ ] All files are in place
- [ ] Migrations have been created
- [ ] ChatPersonalizationService is imported in ChatController
- [ ] ChatPreferences component is integrated in Settings page
- [ ] API routes are registered
- [ ] ChatModesSeeder exists

## Database Setup Verification

### 1. Check Migrations Exist
```bash
# List all migrations
php artisan migrate:status

# Should see:
# 2025_11_20_000000_add_chat_preferences_to_users_table .... present
# 2025_11_20_000001_create_user_chat_preferences_table .... present
```

### 2. Run Migrations
```bash
php artisan migrate

# Expected output:
# Migrating: 2025_11_20_000000_add_chat_preferences_to_users_table
# Migrated: 2025_11_20_000000_add_chat_preferences_to_users_table
# Migrating: 2025_11_20_000001_create_user_chat_preferences_table
# Migrated: 2025_11_20_000001_create_user_chat_preferences_table
```

### 3. Verify Database Tables
```bash
php artisan tinker

# Check users table has new columns
>>> Schema::hasColumns('users', ['tone_level', 'detail_level', 'response_length'])
=> true

# Check user_chat_preferences table exists
>>> Schema::hasTable('user_chat_preferences')
=> true

# Check columns in preferences table
>>> Schema::getColumns('user_chat_preferences')
=> [...]  // Should include: tone_level, detail_level, response_length, etc.
```

### 4. Seed AI Modes
```bash
php artisan db:seed --class=ChatModesSeeder

# Expected output:
# Seeding: Database\Seeders\ChatModesSeeder
# Seeded: Database\Seeders\ChatModesSeeder
```

### 5. Verify AI Modes Created
```bash
php artisan tinker

# Check modes exist
>>> App\Models\AIMode::count()
=> 8

# List all modes
>>> App\Models\AIMode::all()->pluck('name', 'emoji')
=> Illuminate\Support\Collection {
     "🎨" => "Creative",
     "🔍" => "Analytical",
     "⚖️" => "Balanced",
     "⚙️" => "Pragmatic",
     "🎓" => "Educator",
     "💬" => "Conversational",
     "💼" => "Professional",
     "🧠" => "Expert",
   }
```

## Service Layer Testing

### 1. Test UserChatPreference Model
```bash
php artisan tinker

# Create a test user
>>> $user = App\Models\User::factory()->create()
=> App\Models\User {...}

# Create preferences for user
>>> $prefs = App\Models\UserChatPreference::create([
    'user_id' => $user->id,
    'tone_level' => 7,
    'detail_level' => 8,
    'response_length' => 6,
    'is_active' => true,
  ])
=> App\Models\UserChatPreference {...}

# Verify relationship
>>> $user->chatPreferences
=> App\Models\UserChatPreference {...}

# Verify preference levels mapped to descriptions
>>> App\Models\UserChatPreference::getLevelDescription(7, 'tone_level')
=> "Casual"
>>> App\Models\UserChatPreference::getLevelDescription(8, 'detail_level')
=> "Comprehensive"
```

### 2. Test ChatPersonalizationService
```bash
php artisan tinker

# Create user with preferences
>>> $user = App\Models\User::factory()->create()
>>> $user->chatPreferences()->create([
    'tone_level' => 8,
    'detail_level' => 7,
    'response_length' => 6,
  ])

# Build system prompt
>>> $prompt = App\Services\ChatPersonalizationService::buildSystemPrompt($user)
=> "You are a helpful assistant... Be very casual and friendly... Give very detailed responses..."

# Verify prompt contains expected instructions
>>> str_contains($prompt, 'casual')
=> true
>>> str_contains($prompt, 'detailed')
=> true
>>> str_contains($prompt, 'comprehensive')
=> true
```

### 3. Test with Different Preference Combinations
```bash
php artisan tinker

# Test 1: Very Formal, Brief, Short
>>> $user1 = App\Models\User::factory()->create();
>>> $user1->chatPreferences()->create(['tone_level' => 1, 'detail_level' => 1, 'response_length' => 1])
>>> $prompt1 = App\Services\ChatPersonalizationService::buildSystemPrompt($user1)
>>> str_contains($prompt1, 'formal') && str_contains($prompt1, 'one-liner')
=> true

# Test 2: Very Casual, Exhaustive, Maximum
>>> $user2 = App\Models\User::factory()->create();
>>> $user2->chatPreferences()->create(['tone_level' => 10, 'detail_level' => 9, 'response_length' => 10])
>>> $prompt2 = App\Services\ChatPersonalizationService::buildSystemPrompt($user2)
>>> str_contains($prompt2, 'playful') && str_contains($prompt2, 'exhaustive')
=> true
```

### 4. Test with AI Mode
```bash
php artisan tinker

# Get Creative mode
>>> $mode = App\Models\AIMode::where('name', 'Creative')->first()
=> App\Models\AIMode {...}

# Create user with Creative mode
>>> $user = App\Models\User::factory()->create();
>>> $user->chatPreferences()->create([
    'tone_level' => 5,
    'detail_level' => 5,
    'response_length' => 5,
    'preferred_ai_mode_id' => $mode->id,
  ])

# Build prompt
>>> $prompt = App\Services\ChatPersonalizationService::buildSystemPrompt($user)
>>> str_contains($prompt, 'creative')
=> true
```

## API Testing

### 1. Setup Test User
```bash
# Create test user with authentication
php artisan tinker
>>> $user = App\Models\User::factory()->create(['email' => 'test@example.com', 'password' => 'password'])
>>> $token = $user->createToken('test-token')->plainTextToken
# Note the token for API calls
```

### 2. Test Get Preferences Endpoint
```bash
# Without preferences (should create defaults)
curl -X GET http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Expected response:
{
  "success": true,
  "preferences": {
    "id": "uuid-string",
    "tone_level": 5,
    "tone_description": "Balanced",
    "detail_level": 5,
    "detail_description": "Moderate",
    "response_length": 5,
    "length_description": "Moderate",
    "preferred_ai_mode_id": null,
    "ai_mode": null,
    "custom_system_prompt": null,
    "is_active": true
  }
}
```

### 3. Test Update Preferences Endpoint
```bash
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tone_level": 8,
    "detail_level": 7,
    "response_length": 6,
    "preferred_ai_mode_id": 1,
    "custom_system_prompt": "Be concise and direct"
  }'

# Expected response:
{
  "success": true,
  "message": "Chat preferences updated successfully",
  "preferences": {
    "tone_level": 8,
    "tone_description": "Very Casual",
    "detail_level": 7,
    "detail_description": "Very Detailed",
    "response_length": 6,
    "length_description": "Long",
    ...
  }
}
```

### 4. Test Get Available Modes Endpoint
```bash
curl -X GET http://localhost:8000/api/settings/chat-modes \
  -H "Authorization: Bearer {token}" \
  -H "Accept: application/json"

# Expected response:
{
  "success": true,
  "modes": [
    {
      "id": 1,
      "name": "Creative",
      "description": "Encourage creative thinking...",
      "emoji": "🎨",
      "system_prompt": "You are a creative and imaginative assistant..."
    },
    ...
  ]
}
```

### 5. Test Reset Preferences Endpoint
```bash
curl -X POST http://localhost:8000/api/settings/chat-preferences/reset \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Expected response:
{
  "success": true,
  "message": "Chat preferences reset to defaults"
}
```

### 6. Test Validation
```bash
# Invalid tone level (too high)
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"tone_level": 15}'

# Expected error response (422 Unprocessable Entity):
{
  "message": "The given data was invalid.",
  "errors": {
    "tone_level": ["The tone_level must not be greater than 10."]
  }
}
```

## Frontend Testing

### 1. Load Settings Page
```
1. Login to application
2. Navigate to User Settings page (/user/settings)
3. Scroll down to "Chat Personalization" section
4. Should see card with title "Chat Personalization"
```

### 2. Test Load Preferences
```
1. On Chat Personalization card
2. Should see loading state briefly
3. Should display current preference values
4. Should show preference descriptions
5. Should show currently selected AI mode (if any)
```

### 3. Test Tone Slider
```
1. Adjust Tone slider from 1 to 10
2. Verify description changes:
   - Level 1: "Very Formal"
   - Level 5: "Balanced"
   - Level 10: "Playful"
3. Try clicking directly on slider track
4. Try dragging slider smoothly
```

### 4. Test Detail Slider
```
1. Adjust Detail slider from 1 to 10
2. Verify description changes:
   - Level 1: "Extremely Brief"
   - Level 5: "Moderate"
   - Level 10: "Ultra-detailed"
```

### 5. Test Response Length Slider
```
1. Adjust Response Length slider from 1 to 10
2. Verify description changes:
   - Level 1: "One-liner"
   - Level 5: "Moderate"
   - Level 10: "Maximum"
```

### 6. Test Conversation Mode Selection
```
1. Check "Default" button is selected initially
2. Click each conversation mode button:
   - Creative (🎨)
   - Analytical (🔍)
   - Balanced (⚖️)
   - Pragmatic (⚙️)
   - Educator (🎓)
   - Conversational (💬)
   - Professional (💼)
   - Expert (🧠)
3. Verify button highlights when selected
4. Each mode should have description visible
```

### 7. Test Custom Instructions
```
1. Scroll to custom instructions text area
2. Enter: "Always respond with emojis"
3. Should allow text entry
4. Should accept long strings
5. Should have character limit (validate max 2000)
```

### 8. Test Save Preferences
```
1. Change tone slider to 7
2. Change detail slider to 8
3. Select "Professional" mode
4. Enter custom instruction
5. Click "Save Preferences" button
6. Should show success toast: "Chat preferences saved successfully"
7. Verify all fields still have new values
8. Refresh page - values should persist
```

### 9. Test Reset Preferences
```
1. Have changed preferences from defaults
2. Click "Reset Preferences" button
3. Should show confirmation dialog
4. Click "OK" to confirm
5. Should reset all values to defaults:
   - Tone: 5
   - Detail: 5
   - Length: 5
   - Mode: Default
   - Custom: empty
6. Should show success toast
```

### 10. Test Error Handling
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make all preference changes
4. Disable internet connection
5. Try to save
6. Should show error toast: "Failed to save chat preferences"
7. Re-enable connection
8. Try again - should succeed
```

## Chat Integration Testing

### 1. Send Message with Default Preferences
```
1. Load chat page
2. Settings: all at default (5, 5, 5, no mode)
3. Send message: "Hello, how are you?"
4. AI should respond naturally without special preferences
```

### 2. Send Message with Casual Tone
```
1. Go to Settings
2. Set Tone to 8 (Very Casual)
3. Save preferences
4. Return to Chat
5. Send message: "What's the capital of France?"
6. Verify AI uses casual language: "It's Paris, dude!" instead of "The capital of France is Paris."
```

### 3. Send Message with Brief Response
```
1. Go to Settings
2. Set Detail to 2 (Very Brief)
3. Set Length to 1 (One-liner)
4. Save preferences
5. Return to Chat
6. Send message: "Explain quantum computing"
7. Verify AI gives very brief response (1-2 sentences)
```

### 4. Send Message with Detailed Response
```
1. Go to Settings
2. Set Detail to 9 (Exhaustive)
3. Set Length to 10 (Maximum)
4. Save preferences
5. Return to Chat
6. Send message: "Explain quantum computing"
7. Verify AI gives comprehensive response (multiple paragraphs with details)
```

### 5. Send Message with Creative Mode
```
1. Go to Settings
2. Select "Creative" mode
3. Save preferences
4. Return to Chat
5. Send message: "How would you describe a sunset?"
6. Verify AI gives imaginative, creative response
```

### 6. Send Message with Professional Mode
```
1. Go to Settings
2. Select "Professional" mode
3. Save preferences
4. Return to Chat
5. Send message: "What's the ROI of our marketing campaign?"
6. Verify AI uses formal, business-appropriate language
```

### 7. Test Custom System Prompt
```
1. Go to Settings
2. Enter custom: "Always respond in exactly 3 sentences"
3. Combine with another mode
4. Return to Chat
5. Send message: "What is machine learning?"
6. Verify AI responds with exactly 3 sentences
```

## Performance Testing

### 1. Preference Fetch Time
```bash
time curl -X GET http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}"

# Should complete in < 100ms
```

### 2. Chat Message with Personalization
```bash
# Send chat message
# Measure response time
# Should not significantly increase due to personalization service

# Expected: < 2 seconds for first chunk with streaming
```

### 3. Frontend Component Load
```
1. Open browser DevTools
2. Go to Network tab
3. Load Settings page
4. Measure ChatPreferences component load
5. Should load in < 500ms
```

## Security Testing

### 1. Test Authentication Required
```bash
# Try without token
curl -X GET http://localhost:8000/api/settings/chat-preferences

# Should return 401 Unauthorized
```

### 2. Test Authorization
```bash
# Create two users
>>> $user1 = App\Models\User::factory()->create()
>>> $user2 = App\Models\User::factory()->create()
>>> $token1 = $user1->createToken('token1')->plainTextToken

# User1 creates preferences
>>> $prefs = $user1->chatPreferences()->create(['tone_level' => 8])

# Try to access user1's preferences with user2's token
curl -X GET http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token2}"

# Should return user2's preferences (or defaults), not user1's
```

### 3. Test Input Validation
```bash
# Test invalid tone level
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -d '{"tone_level": 999}'
# Should reject

# Test invalid AI mode
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Authorization: Bearer {token}" \
  -d '{"preferred_ai_mode_id": 999}'
# Should reject
```

## Troubleshooting Verification

### If Database Setup Fails
```bash
# Check migrations exist
php artisan migrate:status

# Manually check database
mysql -u root -p your_database
SHOW TABLES LIKE 'user_chat_preferences';
DESCRIBE users;
```

### If API Endpoints Return 404
```bash
# Verify routes are registered
php artisan route:list | grep chat-preferences

# Should see:
# GET api/settings/chat-preferences
# PUT api/settings/chat-preferences
# POST api/settings/chat-preferences/reset
# GET api/settings/chat-modes
```

### If ChatPersonalizationService Doesn't Work
```bash
# Verify class exists
php artisan tinker
>>> class_exists('App\Services\ChatPersonalizationService')
=> true

# Verify method exists
>>> method_exists(App\Services\ChatPersonalizationService::class, 'buildSystemPrompt')
=> true
```

### If ChatPreferences Component Not Showing
```bash
# Check import in Settings.tsx
# Should have: import ChatPreferences from '@/components/ChatPreferences';

# Check rendering in JSX
# Should have: <ChatPreferences />

# Check browser console for errors
# Open DevTools -> Console tab
# Should not see React errors
```

## Sign-Off Checklist

- [ ] All database tables created and populated
- [ ] All API endpoints responding correctly
- [ ] ChatPreferences component loads and displays
- [ ] Can save and retrieve preferences
- [ ] Preferences persist after page reload
- [ ] Chat messages respect preferences
- [ ] Tone, detail, and length preferences work independently
- [ ] All 8 conversation modes available
- [ ] Custom instructions can be entered and saved
- [ ] Reset functionality works
- [ ] Error handling shows appropriate messages
- [ ] No console errors in browser
- [ ] Performance acceptable
- [ ] Security validation working

---

**Last Updated**: Current Session
