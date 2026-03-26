# Chat Personalization Implementation - Complete Guide

## Overview
A comprehensive chat personalization system has been implemented for the Rhea AI Application. Users can now customize how the AI assistant responds through tone, detail level, response length, and predefined conversation modes.

## Architecture

### 1. Database Layer

#### Migrations
Two migrations have been created:

**1. Add preferences columns to users table** (`2025_11_20_000000_add_chat_preferences_to_users_table.php`)
- Adds `tone_level`, `detail_level`, `response_length` columns to users table
- Columns are integer (1-10 scale), default value 5 (balanced)
- Enables quick access to user preferences

**2. Create dedicated preferences table** (`2025_11_20_000001_create_user_chat_preferences_table.php`)
- Creates `user_chat_preferences` table with UUID primary key
- Fields:
  - `tone_level` (1-10 scale, default 5)
  - `detail_level` (1-10 scale, default 5)
  - `response_length` (1-10 scale, default 5)
  - `preferred_ai_mode_id` (foreign key to ai_modes)
  - `custom_system_prompt` (nullable text for advanced users)
  - `is_active` (boolean flag)
  - Timestamps

**To execute migrations:**
```bash
php artisan migrate
```

### 2. Models

#### UserChatPreference Model
Located at: `app/Models/UserChatPreference.php`
- Uses UUID as primary key
- Relationships:
  - `user()` - BelongsTo User
  - `aiMode()` - BelongsTo AIMode
- Helper method: `getLevelDescription($level, $type)` - Maps preference levels to human-readable descriptions
- Scope: `active()` - Returns active preferences

#### User Model Updates
Located at: `app/Models/User.php`
- Added relationship: `chatPreferences()` - hasOne UserChatPreference
- Added fillable fields: `tone_level`, `detail_level`, `response_length`
- Existing relationship: `aiMode()` - BelongsTo AIMode

#### AIMode Model
Located at: `app/Models/AIMode.php`
- Has `scopeActive()` to retrieve only active modes
- Used by ChatPersonalizationService to build base prompts

### 3. Service Layer

#### ChatPersonalizationService
Located at: `app/Services/ChatPersonalizationService.php`

**Key Method: `buildSystemPrompt(User $user): string`**
- Builds personalized system prompt combining:
  1. Base prompt from selected AI mode
  2. Tone instructions (1-10 scale)
  3. Detail level instructions (1-10 scale)
  4. Response length instructions (1-10 scale)
  5. Custom system prompt (if provided)
  6. User name instruction (if call_by_name enabled)

**Tone Levels (getToneInstruction):**
- 1: Very Formal/Corporate
- 5: Balanced (neutral instruction)
- 10: Playful/Humorous

**Detail Levels (getDetailInstruction):**
- 1: Extremely Brief (one-liners)
- 5: Moderate (neutral)
- 10: Ultra-detailed (comprehensive coverage)

**Response Length (getLengthInstruction):**
- 1: One-liners (1-2 sentences)
- 5: Moderate (neutral)
- 10: Maximum length (expanded to full detail)

### 4. API Controllers

#### ChatPreferenceController
Located at: `app/Http/Controllers/Api/ChatPreferenceController.php`

**Endpoints:**
- `GET /api/settings/chat-preferences` - Get user preferences
- `PUT /api/settings/chat-preferences` - Update preferences
- `POST /api/settings/chat-preferences/reset` - Reset to defaults
- `GET /api/settings/chat-modes` - Get available AI modes

**Features:**
- Auto-creates default preferences if none exist
- Returns formatted preferences with descriptions
- Validates all preference levels (1-10)
- Supports custom system prompt storage

### 5. Chat Integration

#### ChatController Updates
Located at: `app/Http/Controllers/Api/ChatController.php`

**Integration Point: `sendMessage()` method**
```php
// Get user and build personalized system prompt
$user = Auth::user();
$customSystemPrompt = ChatPersonalizationService::buildSystemPrompt($user);
```

**How it works:**
1. User sends message
2. ChatController calls `ChatPersonalizationService::buildSystemPrompt($user)`
3. Service builds personalized prompt using user preferences
4. Personalized prompt is passed to `grokService->generateStreamingChat()` or `generateChat()`
5. AI receives instructions to respond according to user preferences

### 6. Frontend Components

#### ChatPreferences React Component
Located at: `resources/js/components/ChatPreferences.tsx`

**Features:**
- **Conversation Mode Buttons**: 8 preset modes (Creative, Analytical, Balanced, Pragmatic, Educator, Conversational, Professional, Expert)
- **Interactive Sliders**:
  - Tone slider (Formal to Casual)
  - Detail slider (Brief to Detailed)
  - Response Length slider (Short to Long)
- **Custom Instructions**: Text area for advanced system prompt customization
- **Real-time Descriptions**: Shows preference level descriptions
- **Save/Reset Functions**: Persist or reset preferences to defaults

**Integration:**
- Integrated into `resources/js/pages/User/Settings.tsx` at line 258
- Fetches and persists preferences via API
- Shows real-time feedback with toast notifications

### 7. Database Seeder

#### ChatModesSeeder
Located at: `database/seeders/ChatModesSeeder.php`

**Predefined Conversation Modes:**

1. **Creative** (🎨)
   - Encourages innovative, imaginative responses
   - For brainstorming and creative problem-solving

2. **Analytical** (🔍)
   - Focuses on detailed analysis and logical reasoning
   - For research and technical questions

3. **Balanced** (⚖️)
   - Combines creativity with analytical thinking
   - Adaptive and well-rounded

4. **Pragmatic** (⚙️)
   - Emphasizes practical, actionable solutions
   - For real-world application

5. **Educator** (🎓)
   - Explains concepts clearly with examples
   - For learning and understanding

6. **Conversational** (💬)
   - Friendly, engaging natural dialogue
   - Feels like talking with a knowledgeable friend

7. **Professional** (💼)
   - Formal, business-appropriate tone
   - Suitable for professional contexts

8. **Expert** (🧠)
   - In-depth technical knowledge
   - For advanced, specialized topics

**To seed the database:**
```bash
php artisan db:seed --class=ChatModesSeeder
```

Or add to main seeder and run:
```bash
php artisan db:seed
```

## Preference Level Scale

All preference levels use a consistent 1-10 scale:

```
1 -------- 5 (Balanced/Neutral) -------- 10
Minimum                                   Maximum
```

**Examples:**
- **Tone**: 1 = Very Formal ... 5 = Balanced ... 10 = Playful
- **Detail**: 1 = Brief ... 5 = Moderate ... 10 = Comprehensive
- **Length**: 1 = Short ... 5 = Moderate ... 10 = Extended

## Setup Instructions

### Step 1: Run Migrations
```bash
php artisan migrate
```

### Step 2: Seed AI Modes
```bash
php artisan db:seed --class=ChatModesSeeder
```

### Step 3: Build Frontend
```bash
npm run build
# or for development with hot reload
npm run dev
```

### Step 4: Test the System

1. **Backend API Test:**
```bash
# Get preferences (create defaults if needed)
curl http://localhost:8000/api/settings/chat-preferences

# Get available modes
curl http://localhost:8000/api/settings/chat-modes

# Update preferences
curl -X PUT http://localhost:8000/api/settings/chat-preferences \
  -H "Content-Type: application/json" \
  -d '{
    "tone_level": 7,
    "detail_level": 8,
    "response_length": 6,
    "preferred_ai_mode_id": 1
  }'
```

2. **Frontend Test:**
   - Navigate to User Settings page
   - Scroll to "Chat Personalization" section
   - Adjust sliders and select conversation mode
   - Click "Save Preferences"
   - Verify toast notification shows success

3. **Chat Test:**
   - Open chat interface
   - Send a message
   - Verify that AI response reflects the personalization preferences
   - Test multiple preference combinations

## How Personalization Works

### User Flow
1. User visits Settings page
2. User adjusts personalization sliders or selects conversation mode
3. User clicks "Save Preferences"
4. Preferences saved to `user_chat_preferences` table and `users` table
5. User opens chat and sends message
6. ChatController retrieves user and builds personalized system prompt
7. Personalized prompt sent to AI service
8. AI responds according to user preferences

### System Prompt Construction Example

**User Settings:**
- Tone Level: 8 (Very Casual)
- Detail Level: 7 (Very Detailed)
- Response Length: 6 (Long)
- Preferred Mode: Creative

**Generated System Prompt:**
```
[Base Creative Mode Prompt]
"You are a creative and imaginative assistant..."

Be very casual and friendly in your communication style.

Give very detailed responses with comprehensive explanations and multiple examples.

Provide longer, more comprehensive responses (2-4 paragraphs).

[Additional user name instruction if enabled]
```

## Configuration Options

### Preference Defaults
All preferences default to level 5 (balanced):
- Tone Level: 5
- Detail Level: 5
- Response Length: 5
- AI Mode: None (uses default)
- Custom Prompt: None

### Preference Ranges
- Minimum: 1
- Maximum: 10
- Default: 5

## API Response Format

### Get Preferences Response
```json
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

## Troubleshooting

### Preferences Not Saving
1. Check that migrations have been run: `php artisan migrate:status`
2. Verify user_chat_preferences table exists
3. Check browser console for API errors
4. Ensure authentication is working

### AI Not Following Preferences
1. Verify ChatController is calling `ChatPersonalizationService::buildSystemPrompt()`
2. Check that customSystemPrompt is passed to grokService
3. Review GrokApiService to ensure system prompt is included in API call
4. Check Grok API logs to verify prompt was received

### Seeder Issues
1. Ensure AIMode model exists and is properly configured
2. Run: `php artisan db:seed --class=ChatModesSeeder`
3. Verify modes were created: `php artisan tinker` then `AIMode::all()`

### Frontend Component Issues
1. Verify ChatPreferences component is imported correctly
2. Check that API endpoints are properly configured
3. Ensure authentication middleware is applied
4. Review network tab in browser DevTools

## Files Summary

### Backend Files
- `app/Models/UserChatPreference.php` - Preference model
- `app/Models/User.php` - Updated with relationships
- `app/Models/AIMode.php` - Already has active() scope
- `app/Services/ChatPersonalizationService.php` - Preference service
- `app/Http/Controllers/Api/ChatController.php` - Updated
- `app/Http/Controllers/Api/ChatPreferenceController.php` - Preference endpoint
- `database/migrations/2025_11_20_000000_*.php` - Add columns to users
- `database/migrations/2025_11_20_000001_*.php` - Create preferences table
- `database/seeders/ChatModesSeeder.php` - AI modes seeder
- `routes/api.php` - Updated with preference routes

### Frontend Files
- `resources/js/components/ChatPreferences.tsx` - Preference UI component
- `resources/js/pages/User/Settings.tsx` - Settings page integration

## Next Steps

1. ✅ Run migrations to create database tables
2. ✅ Run seeder to populate AI modes
3. ✅ Test API endpoints
4. ✅ Test frontend UI
5. ✅ Test chat with different preference combinations
6. 📝 Document any custom modifications
7. 🚀 Deploy to production

## Support

For issues or questions about the chat personalization system:
1. Check the troubleshooting section above
2. Review the service implementation for custom logic
3. Check browser DevTools for frontend errors
4. Check Laravel logs: `storage/logs/laravel.log`

---

**Implementation Date**: November 20, 2025
**Status**: Complete and Ready for Testing
**Last Updated**: Current Session
