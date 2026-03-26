# Admin Personalization System - Complete Guide

## Overview

The Admin Personalization System is a **layered approach** that ensures **user personalization cannot override system-level requirements**. This provides organizations with strict control over AI chat behavior while still allowing user customization within defined boundaries.

## Architecture

### Hierarchy (Layers)
```
┌─────────────────────────────────────────────────┐
│ 1. SYSTEM PERSONALIZATION (Mandatory Base)      │  ← Cannot be overridden
│    - System prompt (enforced)                    │
│    - Preference constraints (min/max bounds)     │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│ 2. PERSONALIZATION TEMPLATES (Admin-Created)    │  ← Defaults + Constraints
│    - Default preference levels                   │
│    - System personalization binding              │
│    - Usage tracking                              │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│ 3. USER PREFERENCES (User Customization)        │  ← Clamped to constraints
│    - Tone, Detail, Response Length              │
│    - Clamped within system bounds               │
│    - Custom system prompt (secondary)            │
└─────────────────────────────────────────────────┘
```

## Key Concept: "User Personalization Must Not Outpass System Personalization"

This means:
- **System prompt is base layer**: Always included, cannot be removed by users
- **User preferences are clamped**: If user sets tone=9 but system allows 1-5, user gets tone=5
- **Constraints are enforced**: System defines min/max for each preference type
- **Custom prompts are secondary**: User custom instructions are added after system prompt

### Example Scenario

**System Personalization (Professional Organization)**
```
System Prompt: "You are a professional corporate assistant focused on business efficiency..."
Tone Constraints: 2-6 (Professional to Friendly, no casual/playful)
Detail Constraints: 3-8 (Brief to Very Detailed)
Length Constraints: 2-7 (Short to Very Long)
```

**User Attempts**
- User sets Tone = 10 (Playful) → **Clamped to 6** (system max)
- User sets Detail = 9 → **Kept at 9** (within 3-8? No, clamped to 8)
- User sets Length = 1 → **Clamped to 2** (system min)

**Result**: System maintains control, user cannot override organizational requirements

## Database Schema

### 1. system_personalizations Table

```php
Schema::create('system_personalizations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('name')->unique(); // e.g., "Professional", "Educational"
    $table->text('description')->nullable();
    $table->text('system_prompt'); // Base prompt (mandatory)
    
    // Constraint bounds (min/max for each preference type)
    $table->integer('min_tone_level')->default(1);      // 1-10
    $table->integer('max_tone_level')->default(10);     // 1-10
    $table->integer('min_detail_level')->default(1);    // 1-10
    $table->integer('max_detail_level')->default(10);   // 1-10
    $table->integer('min_response_length')->default(1); // 1-10
    $table->integer('max_response_length')->default(10);// 1-10
    
    $table->boolean('is_default')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### 2. personalization_templates Table

```php
Schema::create('personalization_templates', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('system_personalization_id')->nullable();
    
    $table->string('name')->unique(); // e.g., "Quick Responder"
    $table->text('description')->nullable();
    $table->string('emoji')->default('📝');
    
    // Default values for users selecting this template
    $table->integer('default_tone_level')->default(5);
    $table->integer('default_detail_level')->default(5);
    $table->integer('default_response_length')->default(5);
    
    $table->boolean('is_system_template')->default(false);
    $table->boolean('is_active')->default(true);
    $table->integer('usage_count')->default(0);
    
    $table->timestamps();
    $table->softDeletes();
});
```

### 3. user_chat_preferences Updates

```php
// Added columns to user_chat_preferences
$table->uuid('system_personalization_id')->nullable();
$table->uuid('personalization_template_id')->nullable();

// Stored constraint values (for audit/display)
$table->integer('applied_min_tone')->default(1);
$table->integer('applied_max_tone')->default(10);
$table->integer('applied_min_detail')->default(1);
$table->integer('applied_max_detail')->default(10);
$table->integer('applied_min_length')->default(1);
$table->integer('applied_max_length')->default(10);
```

## Models

### SystemPersonalization Model

```php
class SystemPersonalization extends Model
{
    // Relationships
    public function templates(): HasMany { }
    
    // Scopes
    public function scopeActive($query) { }
    public function scopeDefault($query) { }
    
    // Methods
    public function isPreferenceAllowed(string $type, int $value): bool { }
    public function clampPreference(string $type, int $value): int { }
    public function getConstraints(): array { }
}
```

### PersonalizationTemplate Model

```php
class PersonalizationTemplate extends Model
{
    // Relationships
    public function systemPersonalization(): BelongsTo { }
    
    // Scopes
    public function scopeActive($query) { }
    public function scopeSystem($query) { }
    public function scopePopular($query, int $limit = 5) { }
    
    // Methods
    public function incrementUsage(): void { }
    public function validateDefaults(): bool { }
    public function getDefaultPreferences(): array { }
}
```

### UserChatPreference Model Updates

```php
class UserChatPreference extends Model
{
    // New Relationships
    public function systemPersonalization(): BelongsTo { }
    public function personalizationTemplate(): BelongsTo { }
    
    // New Methods
    public function applySystemConstraints(): void { }
    public function getEffectivePreferences(): array { }
    public function isPreferenceValid(string $type, int $value): bool { }
    public function getConstraintViolations(): array { }
}
```

## Admin API Endpoints

### System Personalization Management

#### Get All System Personalizations
```
GET /api/admin/system-personalizations
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "personalizations": [
        {
            "id": "uuid",
            "name": "Professional",
            "description": "For corporate environments",
            "system_prompt": "You are a professional assistant...",
            "constraints": {
                "tone": { "min": 2, "max": 6, "label": "Tone: 2-6" },
                "detail": { "min": 3, "max": 8, "label": "Detail: 3-8" },
                "length": { "min": 2, "max": 7, "label": "Length: 2-7" }
            },
            "is_default": true,
            "is_active": true,
            "template_count": 3,
            "created_at": "2025-01-20T10:00:00Z"
        }
    ]
}
```

#### Create System Personalization
```
POST /api/admin/system-personalizations
Authorization: Bearer {token} (admin required)
Content-Type: application/json

Request Body:
{
    "name": "Creative",
    "description": "For brainstorming and creative work",
    "system_prompt": "You are a creative and innovative assistant...",
    "min_tone_level": 6,
    "max_tone_level": 10,
    "min_detail_level": 6,
    "max_detail_level": 10,
    "min_response_length": 5,
    "max_response_length": 10,
    "is_default": false
}

Response:
{
    "success": true,
    "message": "System personalization created successfully",
    "personalization": {
        "id": "uuid",
        "name": "Creative",
        "constraints": { ... }
    }
}
```

#### Update System Personalization
```
PUT /api/admin/system-personalizations/{id}
Authorization: Bearer {token} (admin required)
Content-Type: application/json

Request Body: (all fields optional)
{
    "name": "Creative Updated",
    "max_tone_level": 9,
    "is_active": false
}

Response:
{
    "success": true,
    "message": "System personalization updated successfully",
    "personalization": { ... }
}
```

#### Delete System Personalization
```
DELETE /api/admin/system-personalizations/{id}
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "message": "System personalization deleted successfully"
}

Error (if default):
{
    "success": false,
    "message": "Cannot delete default system personalization"
}
```

#### Get Default System Personalization
```
GET /api/admin/system-personalizations/default/current
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "personalization": {
        "id": "uuid",
        "name": "Professional",
        "system_prompt": "...",
        "constraints": { ... }
    }
}
```

### Personalization Templates Management

#### Get All Templates
```
GET /api/admin/personalization-templates
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "templates": [
        {
            "id": "uuid",
            "name": "Quick Responder",
            "description": "Short, direct responses",
            "emoji": "⚡",
            "defaults": {
                "tone_level": 6,
                "detail_level": 2,
                "response_length": 2
            },
            "system_personalization": {
                "id": "uuid",
                "name": "Professional",
                "constraints": { ... }
            },
            "is_system_template": true,
            "is_active": true,
            "usage_count": 42,
            "created_at": "2025-01-20T10:00:00Z"
        }
    ]
}
```

#### Create Template
```
POST /api/admin/personalization-templates
Authorization: Bearer {token} (admin required)
Content-Type: application/json

Request Body:
{
    "system_personalization_id": "uuid-or-null",
    "name": "Detailed Expert",
    "description": "In-depth technical responses",
    "emoji": "🧠",
    "default_tone_level": 7,
    "default_detail_level": 9,
    "default_response_length": 8
}

Response:
{
    "success": true,
    "message": "Template created successfully",
    "template": {
        "id": "uuid",
        "name": "Detailed Expert",
        "emoji": "🧠"
    }
}
```

#### Update Template
```
PUT /api/admin/personalization-templates/{id}
Authorization: Bearer {token} (admin required)
Content-Type: application/json

Request Body: (all fields optional)
{
    "name": "Detailed Expert Updated",
    "default_tone_level": 8,
    "is_active": false
}

Response:
{
    "success": true,
    "message": "Template updated successfully",
    "template": { ... }
}
```

#### Delete Template
```
DELETE /api/admin/personalization-templates/{id}
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "message": "Template deleted successfully"
}
```

#### Get Template Statistics
```
GET /api/admin/personalization-templates/statistics
Authorization: Bearer {token} (admin required)

Response:
{
    "success": true,
    "statistics": {
        "total_templates": 12,
        "active_templates": 10,
        "most_used": [
            { "id": "uuid", "name": "Quick Responder", "emoji": "⚡", "usage_count": 156 },
            { "id": "uuid", "name": "Detailed Expert", "emoji": "🧠", "usage_count": 98 }
        ],
        "total_system_personalizations": 4,
        "active_system_personalizations": 3
    }
}
```

## Admin Controller

Location: `app/Http/Controllers/Api/AdminPersonalizationController.php`

### Key Methods

- `getSystemPersonalizations()` - List all system personalizations
- `storeSystemPersonalization(Request $request)` - Create new system personalization
- `updateSystemPersonalization(Request $request, string $id)` - Update system personalization
- `deleteSystemPersonalization(string $id)` - Delete system personalization
- `getTemplates()` - List all templates
- `storeTemplate(Request $request)` - Create new template
- `updateTemplate(Request $request, string $id)` - Update template
- `deleteTemplate(string $id)` - Delete template
- `getTemplateStatistics()` - Get usage statistics
- `getDefaultPersonalization()` - Get current default system personalization

## Service Layer Integration

### ChatPersonalizationService Updates

#### New Method: Apply System Constraints
```php
// Ensures user settings cannot override system requirements
$preferences->applySystemConstraints();

// Result: User preferences are clamped to system bounds
```

#### New Method: Apply Template Defaults
```php
ChatPersonalizationService::applyTemplateDefaults($user, $template);

// Result: User preferences updated with template defaults + constraints applied
```

#### Updated: buildSystemPrompt()
```php
// Layered approach:
// 1. System personalization prompt (base, mandatory)
// 2. User preferences (clamped to constraints)
// 3. Custom user prompt (secondary)

$prompt = ChatPersonalizationService::buildSystemPrompt($user);
```

## Setup Instructions

### Step 1: Run Migrations
```bash
php artisan migrate
```

This creates:
- `system_personalizations` table
- `personalization_templates` table
- Updates `user_chat_preferences` with new columns

### Step 2: Create Default System Personalization

**Via Tinker:**
```php
php artisan tinker

SystemPersonalization::create([
    'name' => 'Default',
    'description' => 'Default system personalization with full flexibility',
    'system_prompt' => 'You are a helpful, knowledgeable, and friendly AI assistant...',
    'min_tone_level' => 1,
    'max_tone_level' => 10,
    'min_detail_level' => 1,
    'max_detail_level' => 10,
    'min_response_length' => 1,
    'max_response_length' => 10,
    'is_default' => true,
    'is_active' => true,
]);
```

**Via API:**
```bash
curl -X POST http://localhost:8000/api/admin/system-personalizations \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Default",
    "description": "Default system personalization",
    "system_prompt": "You are a helpful...",
    "min_tone_level": 1,
    "max_tone_level": 10,
    "min_detail_level": 1,
    "max_detail_level": 10,
    "min_response_length": 1,
    "max_response_length": 10,
    "is_default": true
  }'
```

### Step 3: Create Personalization Templates

```bash
curl -X POST http://localhost:8000/api/admin/personalization-templates \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "system_personalization_id": "professional-uuid",
    "name": "Quick Responder",
    "description": "Short, direct responses",
    "emoji": "⚡",
    "default_tone_level": 5,
    "default_detail_level": 2,
    "default_response_length": 2
  }'
```

### Step 4: Test Admin Endpoints

```bash
# Get system personalizations
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:8000/api/admin/system-personalizations

# Get templates
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:8000/api/admin/personalization-templates

# Get statistics
curl -H "Authorization: Bearer {admin-token}" \
  http://localhost:8000/api/admin/personalization-templates/statistics
```

## Common Use Cases

### Use Case 1: Corporate Environment
**Goal**: Maintain professional tone, prevent casual responses

```php
SystemPersonalization::create([
    'name' => 'Corporate',
    'system_prompt' => 'You are a professional business assistant...',
    'min_tone_level' => 2,
    'max_tone_level' => 6,  // Prevent casual/playful
    'min_detail_level' => 3,
    'max_detail_level' => 8,
    'min_response_length' => 2,
    'max_response_length' => 7,
    'is_default' => true,
]);
```

### Use Case 2: Educational Platform
**Goal**: Encourage detailed explanations, prevent overly brief responses

```php
SystemPersonalization::create([
    'name' => 'Educational',
    'system_prompt' => 'You are an expert educator...',
    'min_tone_level' => 5,
    'max_tone_level' => 8,  // Friendly to casual
    'min_detail_level' => 7, // Always detailed
    'max_detail_level' => 10,
    'min_response_length' => 5,
    'max_response_length' => 10,
    'is_default' => false,
]);
```

### Use Case 3: Support/Help Desk
**Goal**: Flexible but professional, quick responses available

```php
SystemPersonalization::create([
    'name' => 'Support',
    'system_prompt' => 'You are a helpful support agent...',
    'min_tone_level' => 4,
    'max_tone_level' => 7,  // Professional to friendly
    'min_detail_level' => 2, // Can be brief
    'max_detail_level' => 8,
    'min_response_length' => 1,
    'max_response_length' => 8,
    'is_default' => false,
]);
```

## Validation & Error Handling

### Constraint Violations

Users will receive clamped values with violations logged:

```php
$userPrefs = $user->chatPreferences;
$violations = $userPrefs->getConstraintViolations();

// Result:
[
    'tone_level' => 'Tone must be between 2 and 6',
    'detail_level' => 'Detail must be between 3 and 8',
    'response_length' => 'Response length must be between 2 and 7',
]
```

### Template Default Validation

Templates cannot have defaults outside system constraints:

```bash
curl -X POST http://localhost:8000/api/admin/personalization-templates \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "system_personalization_id": "professional-uuid",  # Has tone 2-6
    "name": "Casual Template",
    "default_tone_level": 9  # ERROR: Outside constraint!
  }'

Response:
{
    "success": false,
    "message": "Template defaults violate system personalization constraints",
    "constraints": {
        "tone": { "min": 2, "max": 6, ... }
    }
}
```

## Flow Diagram: User Preference Update

```
User Updates Preferences
    ↓
ChatPreferenceController validates input
    ↓
Load user's system_personalization_id
    ↓
Clamp preference values to system constraints
    ↓
Store applied constraints in database
    ↓
Save preferences
    ↓
Return to user with effective values
    ↓
Next Chat Message
    ↓
ChatPersonalizationService::buildSystemPrompt()
    ↓
Load system personalization (mandatory)
    ↓
Load user's clamped preferences
    ↓
Build final prompt with all layers
    ↓
Send to AI API
```

## Security Considerations

1. **Admin Middleware**: All admin endpoints require `admin` role verification
2. **Constraint Enforcement**: System constraints are enforced server-side, not relying on client
3. **Immutable System Prompt**: System prompts cannot be overridden by user customizations
4. **Audit Trail**: Applied constraints stored for audit/compliance
5. **Validation**: All inputs validated against system constraints before saving

## Troubleshooting

### Admin Endpoints Return 403

**Issue**: Authentication fails
```
Solution: 
- Verify user has admin role
- Check token is valid
- Verify 'admin' middleware is applied
```

### Template Cannot Be Created

**Issue**: "Template defaults violate system personalization constraints"
```
Solution:
- Check system personalization ID
- Verify template defaults are within constraint bounds
- Use admin endpoint to get system personalization constraints
```

### User Preferences Showing Different Values

**Issue**: User set tone=9 but getting tone=5
```
Solution:
This is correct behavior! System personalization max is 5.
Values are intentionally clamped server-side.
Check user's applied_constraints in database.
```

### Cannot Delete Default System Personalization

**Issue**: Delete returns 422 error
```
Solution:
Default system personalization cannot be deleted.
Set a different personalization as default first:
PUT /api/admin/system-personalizations/{new-id}
  { "is_default": true }
Then delete the old one.
```

## Frontend Integration

### Display Constraint Ranges

```javascript
// Get system personalization constraints
const response = await fetch('/api/admin/system-personalizations/default/current', {
    headers: { 'Authorization': `Bearer ${token}` }
});

const constraints = response.data.personalization.constraints;

// Set slider ranges dynamically
<Slider
    min={constraints.tone.min}
    max={constraints.tone.max}
    label={constraints.tone.label}
/>
```

### Show Applied Constraints to User

```javascript
// Get user's effective preferences
const preferences = user.chatPreferences;

// Display applied constraints
{preferences.applied_constraints && (
    <div>
        Tone restricted to: {preferences.applied_min_tone}-{preferences.applied_max_tone}
        (System requirement: Professional environment)
    </div>
)}
```

## Files Summary

### Backend Files
- `app/Models/SystemPersonalization.php` - System personalization model
- `app/Models/PersonalizationTemplate.php` - Template model
- `app/Models/UserChatPreference.php` - Updated with constraint methods
- `app/Services/ChatPersonalizationService.php` - Updated with layered approach
- `app/Http/Controllers/Api/AdminPersonalizationController.php` - Admin API
- `database/migrations/2025_01_20_000002_*.php` - System personalization table
- `database/migrations/2025_01_20_000003_*.php` - Templates table
- `database/migrations/2025_01_20_000004_*.php` - User preferences updates
- `routes/api.php` - Admin API routes

## Next Steps

1. ✅ Run migrations
2. ✅ Create default system personalization
3. ✅ Create admin templates
4. ✅ Test admin API endpoints
5. 📝 Update frontend to display constraints
6. 🧪 Test constraint enforcement
7. 🚀 Deploy to production

---

**Implementation Date**: January 20, 2025
**Status**: Complete and Ready for Testing
**Architecture**: Layered with System → Template → User → Custom
**Key Feature**: User personalization cannot override system requirements
