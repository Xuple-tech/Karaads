# Admin Personalization System - Complete Flow Diagram

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                                 │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ System Personali-│         │ Create/Edit      │              │
│  │ zation Management│         │ Templates        │              │
│  └──────────────────┘         └──────────────────┘              │
└────────────┬─────────────────────────┬──────────────────────────┘
             │                         │
             ↓                         ↓
┌─────────────────────────────────────────────────────────────────┐
│         API ADMIN ENDPOINTS (Authorization Required)             │
│                                                                  │
│  /admin/system-personalizations [GET, POST, PUT, DELETE]       │
│  /admin/personalization-templates [GET, POST, PUT, DELETE]     │
│                                                                  │
│  AdminPersonalizationController                                 │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE MODELS                               │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                 │
│  │ SystemPersonali- │     │ Personalization  │                 │
│  │ zation           │────→│ Template         │                 │
│  │                  │     │                  │                 │
│  │ - system_prompt  │     │ - defaults       │                 │
│  │ - constraints    │     │ - usage_count    │                 │
│  │ - is_default     │     │ - is_active      │                 │
│  └──────────────────┘     └──────────────────┘                 │
│              │                       │                          │
│              └───────────┬───────────┘                          │
│                          ↓                                      │
│                ┌──────────────────────┐                        │
│                │ UserChatPreference   │                        │
│                │                      │                        │
│                │ - tone_level         │                        │
│                │ - detail_level       │                        │
│                │ - response_length    │                        │
│                │ - applied_min/max_*  │ ← Clamped values!      │
│                │ - custom_prompt      │                        │
│                └──────────────────────┘                        │
│                          ↑                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ (User)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    USER SETTINGS                                 │
│                                                                  │
│  ┌─────────────────────────────────────────┐                   │
│  │ ChatPreferences Component               │                   │
│  │                                         │                   │
│  │  • Template Selector (Buttons)          │                   │
│  │  • Tone Slider (min-max bounded)        │                   │
│  │  • Detail Slider (min-max bounded)      │                   │
│  │  • Length Slider (min-max bounded)      │                   │
│  │  • Custom Prompt Textarea               │                   │
│  │  • Save / Reset Buttons                 │                   │
│  └─────────────────────────────────────────┘                   │
│                    ↑         ↓                                  │
└────────────────────┼─────────┼──────────────────────────────────┘
                     │         │
                     │         │
        (GET /api/settings/chat-preferences)
        (PUT /api/settings/chat-preferences)
                     │         │
                     ↓         ↑
┌─────────────────────────────────────────────────────────────────┐
│              ChatPreferenceController                            │
│                                                                  │
│  getPreferences()     → Load user prefs + system constraints    │
│  updatePreferences()  → Validate + Clamp + Save                 │
│  getAvailableModes()  → List templates for user selection       │
│  resetPreferences()   → Set to defaults                          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│           ChatPersonalizationService                             │
│                                                                  │
│  applySystemConstraints()     → Clamp values to bounds          │
│  applyTemplateDefaults()      → Apply template defaults         │
│  buildSystemPrompt()          → Layer all components            │
│  getAvailableTemplates()      → Show active templates           │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
     (When user sends chat message)
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                 ChatController                                   │
│                                                                  │
│  sendMessage()                                                  │
│  ├─ Load authenticated user                                     │
│  ├─ Get user preferences with constraints                       │
│  ├─ Call ChatPersonalizationService::buildSystemPrompt()       │
│  └─ Send to AI API                                             │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│              FINAL SYSTEM PROMPT (Layered)                       │
│                                                                  │
│  Layer 1: System Personalization (Base - Mandatory)             │
│  ────────────────────────────────────────────────              │
│  "You are a professional business assistant..."                 │
│  [Cannot be overridden by user]                                 │
│                                                                  │
│  Layer 2: User Preferences (Clamped to Constraints)            │
│  ────────────────────────────────────────────────              │
│  "Maintain professional tone (tone: 4, clamped to 2-6)"        │
│  "Provide moderate detail (detail: 5, clamped to 3-8)"         │
│  "Respond with moderate length (length: 5, clamped to 2-7)"    │
│                                                                  │
│  Layer 3: User Custom Prompt (Secondary)                        │
│  ────────────────────────────────────────────────              │
│  "Focus on practical solutions when applicable"                 │
│                                                                  │
│  [System Constraint: Organizational requirements enforced]      │
│                                                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
         AI API
           (GROK)
             │
             ↓
      Response to User
```

---

## Data Flow: Admin Creating System Personalization

```
┌─────────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                                  │
│ "Create New System Personalization"                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
          Form Submission: POST Request
┌─────────────────────────────────────────────────────────────────┐
│ Request Body:                                                    │
│ {                                                                │
│   "name": "Corporate",                                          │
│   "system_prompt": "You are a professional...",                │
│   "min_tone_level": 2,                                          │
│   "max_tone_level": 6,                                          │
│   "min_detail_level": 3,                                        │
│   "max_detail_level": 8,                                        │
│   "min_response_length": 2,                                     │
│   "max_response_length": 7,                                     │
│   "is_default": false                                           │
│ }                                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
   POST /api/admin/system-personalizations
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ AdminPersonalizationController                                   │
│ storeSystemPersonalization()                                     │
│                                                                  │
│ 1. Validate input (all fields required, constraints valid)      │
│ 2. If is_default=true:                                          │
│    - Remove is_default from all other personalizations         │
│ 3. Create new SystemPersonalization record                      │
│ 4. Return success response with UUID                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Database: system_personalizations table                         │
│                                                                  │
│ id: "550e8400-e29b-41d4-a716-446655440000"                     │
│ name: "Corporate"                                               │
│ system_prompt: "You are a professional..."                     │
│ min_tone_level: 2                                               │
│ max_tone_level: 6                                               │
│ min_detail_level: 3                                             │
│ max_detail_level: 8                                             │
│ min_response_length: 2                                          │
│ max_response_length: 7                                          │
│ is_default: false                                               │
│ is_active: true                                                 │
│ created_at: 2025-01-20 10:00:00                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
         Response to Admin Dashboard
┌─────────────────────────────────────────────────────────────────┐
│ {                                                                │
│   "success": true,                                              │
│   "message": "System personalization created successfully",     │
│   "personalization": {                                          │
│     "id": "550e8400-e29b-41d4-a716-446655440000",             │
│     "name": "Corporate",                                        │
│     "constraints": {                                            │
│       "tone": { "min": 2, "max": 6 },                          │
│       "detail": { "min": 3, "max": 8 },                        │
│       "length": { "min": 2, "max": 7 }                         │
│     }                                                           │
│   }                                                             │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Admin Creating Template

```
Admin: Create Template linked to "Corporate" Personalization
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/admin/personalization-templates                      │
│ {                                                                │
│   "system_personalization_id": "550e8400-...",                 │
│   "name": "Quick Responder",                                   │
│   "emoji": "⚡",                                                │
│   "default_tone_level": 3,                                     │
│   "default_detail_level": 2,                                   │
│   "default_response_length": 2                                 │
│ }                                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ AdminPersonalizationController                                   │
│ storeTemplate()                                                  │
│                                                                  │
│ 1. Validate input                                               │
│ 2. Load system_personalization if provided                      │
│ 3. Validate defaults against system constraints:               │
│    - tone: 3 in [2-6]? ✓ YES                                  │
│    - detail: 2 in [3-8]? ✗ NO - ERROR!                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
         Return 422 Error to Admin
┌─────────────────────────────────────────────────────────────────┐
│ {                                                                │
│   "success": false,                                             │
│   "message": "Template defaults violate constraints",          │
│   "constraints": {                                              │
│     "detail": { "min": 3, "max": 8, "label": "..." }         │
│   }                                                             │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                       │
         Admin fixes: detail_level to 4
                       │
                       ↓
         Retry POST with corrected values
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Validation passes! Create record:                               │
│                                                                  │
│ personalization_templates:                                      │
│ - id: "660f9500-f30c-52e5-b827-557766551111"                  │
│ - system_personalization_id: "550e8400-..."                   │
│ - name: "Quick Responder"                                      │
│ - emoji: "⚡"                                                   │
│ - default_tone_level: 3                                        │
│ - default_detail_level: 4  ← Fixed by admin                   │
│ - default_response_length: 2                                   │
│ - usage_count: 0                                               │
│ - is_active: true                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Selecting Template & Updating Preferences

```
┌─────────────────────────────────────────────────────────────────┐
│ User Settings Page                                              │
│                                                                  │
│ GET /api/settings/chat-preferences                             │
│                                                                  │
│ Response includes:                                              │
│ - Available templates with constraints                          │
│ - Current user preferences                                      │
│ - Applied constraints                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: ChatPreferences Component                             │
│                                                                  │
│ Displays:                                                       │
│ ┌─────────────────────────────────────────┐                   │
│ │ Select Template:                        │                   │
│ │ [⚡ Quick][⚖️ Balanced][📚 Detailed]   │                   │
│ └─────────────────────────────────────────┘                   │
│                                                                  │
│ (User clicks "⚡ Quick")                                        │
│                                                                  │
│ Tone Slider: ◀───●───▶  (3, shown as "Professional")           │
│ (min: 2, max: 6 - constrained by Corporate personalization)   │
│                                                                  │
│ Detail Slider: ◀──●────▶  (4, shown as "Concise")             │
│ (min: 3, max: 8)                                               │
│                                                                  │
│ Length Slider: ◀──●────▶  (2, shown as "Very Short")          │
│ (min: 2, max: 7)                                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │ (User adjusts tone slider to 6, clicks Save)
                       ↓
         PUT /api/settings/chat-preferences
┌─────────────────────────────────────────────────────────────────┐
│ Request Body:                                                    │
│ {                                                                │
│   "personalization_template_id": "660f9500-...",               │
│   "tone_level": 6,                                              │
│   "detail_level": 4,                                            │
│   "response_length": 2                                          │
│ }                                                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatPreferenceController::updatePreferences()                  │
│                                                                  │
│ 1. Load template (660f9500-...) with system_personalization   │
│ 2. Load user preferences                                        │
│ 3. Call $prefs->applySystemConstraints()                       │
│    ├─ Load system personalization (Corporate)                  │
│    ├─ Clamp tone: 6 in [2-6]? → 6 ✓                          │
│    ├─ Clamp detail: 4 in [3-8]? → 4 ✓                        │
│    └─ Clamp length: 2 in [2-7]? → 2 ✓                        │
│ 4. Store clamped values + applied constraints                  │
│ 5. Save to database                                            │
│ 6. Return success with effective values                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Database Update: user_chat_preferences                          │
│                                                                  │
│ user_id: 42                                                     │
│ system_personalization_id: "550e8400-..." (Corporate)         │
│ personalization_template_id: "660f9500-..." (Quick)            │
│ tone_level: 6                                                   │
│ detail_level: 4                                                 │
│ response_length: 2                                              │
│ applied_min_tone: 2                                             │
│ applied_max_tone: 6                                             │
│ applied_min_detail: 3                                           │
│ applied_max_detail: 8                                           │
│ applied_min_length: 2                                           │
│ applied_max_length: 7                                           │
│ updated_at: 2025-01-20 10:15:00                               │
└─────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
    Response to Frontend with success
                       │
                       ↓
    Toast: "Preferences saved!"
```

---

## Data Flow: User Sending Chat Message

```
┌─────────────────────────────────────────────────────────────────┐
│ Chat Interface                                                   │
│ User types: "Write me a playful jingle about coffee"           │
│ Clicks Send                                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
         POST /api/chat/message
┌─────────────────────────────────────────────────────────────────┐
│ ChatController::sendMessage()                                   │
│                                                                  │
│ 1. Load authenticated user (ID: 42)                            │
│ 2. Load user message: "Write me a playful jingle..."          │
│ 3. Call ChatPersonalizationService::buildSystemPrompt($user)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ ChatPersonalizationService::buildSystemPrompt()                │
│                                                                  │
│ $preferences = User42.chatPreferences (load with relations)    │
│ ├─ systemPersonalization: "Corporate"                          │
│ ├─ tone_level: 6                                               │
│ ├─ detail_level: 4                                             │
│ └─ response_length: 2                                          │
│                                                                  │
│ Layer 1: System Personalization (Mandatory)                    │
│ ────────────────────────────────────────────                  │
│ basePrompt = "You are a professional business assistant..."   │
│                                                                  │
│ Layer 2: Apply Constraints (Done by applySystemConstraints)   │
│ ────────────────────────────────────────────                  │
│ tone: 6 in [2-6]? → 6 ✓                                      │
│ detail: 4 in [3-8]? → 4 ✓                                    │
│ length: 2 in [2-7]? → 2 ✓                                    │
│                                                                  │
│ Layer 3: Build Personalizations Array                          │
│ ────────────────────────────────────────────                  │
│ tone_instruction = getToneInstruction(6)                       │
│  = "Use a friendly and approachable tone..."                  │
│                                                                  │
│ detail_instruction = getDetailInstruction(4)                   │
│  = "Keep responses concise and to-the-point..."               │
│                                                                  │
│ length_instruction = getLengthInstruction(2)                   │
│  = "Keep responses very short (2-3 sentences)."               │
│                                                                  │
│ Layer 4: Combine Everything                                    │
│ ────────────────────────────────────────────                  │
│ fullPrompt = basePrompt + "\n\n" + toneInst + "\n\n"          │
│              + detailInst + "\n\n" + lengthInst               │
│                                                                  │
│ Final Prompt:                                                  │
│ "You are a professional business assistant...                 │
│                                                                  │
│ Use a friendly and approachable tone...                       │
│                                                                  │
│ Keep responses concise and to-the-point...                    │
│                                                                  │
│ Keep responses very short (2-3 sentences).                     │
│                                                                  │
│ [System constraint: User preferences respect organizational   │
│ requirements]"                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Pass to AI API (GROK)                                          │
│                                                                  │
│ grokService->generateStreamingChat(                            │
│   message: "Write me a playful jingle about coffee",          │
│   systemPrompt: "You are a professional business..."          │
│ )                                                               │
│                                                                  │
│ NOTE: User cannot make it "playful" because system constrains │
│ it to professional tone (2-6 range, max casual at 6)         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
       AI responds respecting system constraints
┌─────────────────────────────────────────────────────────────────┐
│ Response (respecting constraints):                              │
│                                                                  │
│ "Here's a friendly coffee jingle for your morning routine:     │
│                                                                  │
│ ☕ Wake up to the aroma, start your day,                      │
│ Professional brew to brighten your way!"                       │
│                                                                  │
│ (Friendly but professional, 2-3 sentences, concise)            │
│                                                                  │
│ NOTE: Even though user asked for "playful", AI stayed          │
│ professional due to system constraints (tone max 6)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Concept: Why User Cannot Override System

```
System Personalization (Admin)
    ↓
    System Prompt: Hardcoded in Layer 1
    Tone Constraints: min=2, max=6
    │
    └─→ User Preference: tone_level = 10 (WANTS playful)
        │
        └─→ Server-Side Validation
            if (10 > 6) → clamp to 6
            │
            └─→ Database Stores: tone_level = 6
                applied_max_tone = 6
                │
                └─→ Chat Message Uses: tone_level = 6
                    │
                    └─→ Prompt Instruction: Friendly (not playful)
                        │
                        └─→ AI Response: Professional Friendly
                            (NOT playful as user wanted)
```

**Why This Works:**
1. System prompt is Layer 1 (always there)
2. Constraints are enforced server-side (not trusting client)
3. Applied values stored in database (audit trail)
4. Service uses stored clamped values (not user input)

---

## Template Selection Effect

```
Before Template Selection:
User Preferences:
  tone_level: 5
  detail_level: 5
  response_length: 5
(No constraints if no system personalization)

User Selects "Quick Responder" Template:
  system_personalization_id: "Corporate"
  
After Selection:
User Preferences Updated To:
  system_personalization_id: "Corporate"       ← Now constrained!
  personalization_template_id: "Quick"
  tone_level: 3      ← From template default
  detail_level: 4    ← From template default (clamped from 2 to 4)
  response_length: 2 ← From template default
  
Constraints Applied:
  applied_min_tone: 2
  applied_max_tone: 6    ← Corporate system constraint
  applied_min_detail: 3
  applied_max_detail: 8
  applied_min_length: 2
  applied_max_length: 7

User Cannot Increase Tone Above 6 (Max)
User Cannot Decrease Detail Below 3 (Min)
System Prompt Always Enforced
```

---

## Middleware Flow (Admin Authorization)

```
Request to /api/admin/system-personalizations
    ↓
'auth:sanctum' Middleware
├─ Token valid? → Continue
├─ Token invalid? → 401 Unauthorized
└─ No token? → 401 Unauthorized
    ↓
'admin' Middleware
├─ User has admin role? → Continue
├─ User not admin? → 403 Forbidden
└─ User guest? → 403 Forbidden
    ↓
Controller Method Executes
    ↓
Response to Admin
```

---

## Error Handling Flow

```
Admin tries to Create Template with Invalid Defaults

Request:
POST /api/admin/personalization-templates
{
  "system_personalization_id": "Corporate",  # tone: 2-6
  "default_tone_level": 10  # Outside constraint!
}
    ↓
Validation in storeTemplate()
    ├─ Load system personalization
    ├─ Check: isPreferenceAllowed('tone', 10)
    │   └─ 10 in [2-6]? → FALSE ✗
    ├─ Build error response
    └─ Return 422 with constraints
    ↓
Response:
{
  "success": false,
  "message": "Template defaults violate system constraints",
  "constraints": {
    "tone": { "min": 2, "max": 6, "label": "..." }
  }
}
    ↓
Admin adjusts value and retries
```

---

## Summary Table: Constraint Enforcement Points

| Point | Component | Enforcement |
|-------|-----------|------------|
| Template Creation | AdminPersonalizationController | Validate defaults against system bounds |
| User Preference Update | ChatPreferenceController | Validate input against bounds |
| Preference Application | UserChatPreference Model | applySystemConstraints() clamps values |
| Prompt Building | ChatPersonalizationService | Uses already-clamped values |
| Database | user_chat_preferences | Stores applied_min/max for audit |
| Chat Message | ChatController | Uses clamped preferences from DB |
| AI API Call | GrokApiService | Receives full layered system prompt |

---

## Access Control Summary

```
Public Routes:
├─ POST /auth/login
└─ POST /auth/register

Authenticated User Routes:
├─ GET /api/settings/chat-preferences
├─ PUT /api/settings/chat-preferences
└─ POST /api/settings/chat-preferences/reset

Admin-Only Routes:
├─ GET /api/admin/system-personalizations
├─ POST /api/admin/system-personalizations
├─ PUT /api/admin/system-personalizations/{id}
├─ DELETE /api/admin/system-personalizations/{id}
├─ GET /api/admin/personalization-templates
├─ POST /api/admin/personalization-templates
├─ PUT /api/admin/personalization-templates/{id}
├─ DELETE /api/admin/personalization-templates/{id}
└─ GET /api/admin/personalization-templates/statistics
```

---

**Key Takeaway**: The system ensures admin control through:
1. **Mandatory system prompts** (Layer 1, cannot remove)
2. **Server-side constraint clamping** (not client-side)
3. **Applied constraint storage** (audit trail + enforcement)
4. **Layered prompt building** (system → constraints → user → custom)
5. **Authorization middleware** (admin-only endpoints)
