# Personalization System - Quick Reference

## Quick Start for Developers

### For Users - React Component
```tsx
import PersonalizationSettings from '@/pages/settings/Personalization';

// Component automatically fetches and manages all preferences
// Located at: /settings/personalization
```

### For Admins - React Component
```tsx
import AdminPersonalizationPage from '@/pages/Admin/Personalization';

// Admin can create/edit system personalizations and templates
// Located at: /admin/personalization
```

### For Backend - Service Usage
```php
use App\Services\ChatPersonalizationService;
use App\Models\User;

$user = User::find($userId);

// Build personalized system prompt
$prompt = ChatPersonalizationService::buildSystemPrompt($user);

// Get available templates for user
$templates = ChatPersonalizationService::getAvailableTemplates($user);

// Apply template to user
$template = PersonalizationTemplate::find($templateId);
ChatPersonalizationService::applyTemplateDefaults($user, $template);

// Get preference summary
$summary = ChatPersonalizationService::getPreferenceSummary($user);
```

### For API Integration
```php
use App\Models\UserChatPreference;

// Get user preferences
$preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
    ['user_id' => $user->id],
    [
        'tone_level' => 5,
        'detail_level' => 5,
        'response_length' => 5,
    ]
);

// Check if preference is valid
$isValid = $preferences->isPreferenceValid('tone', 8);

// Apply system constraints
$preferences->applySystemConstraints();
$preferences->save();

// Get effective preferences (respecting constraints)
$effective = $preferences->getEffectivePreferences();
```

## API Endpoints

### User Endpoints (Protected)
```
GET    /api/settings/personalization
PUT    /api/settings/personalization
POST   /api/settings/personalization/reset
GET    /api/settings/personalization/templates
GET    /api/settings/personalization/ai-modes
GET    /api/settings/personalization/descriptions
```

### Admin Endpoints (Admin Only)
```
GET    /api/admin/system-personalizations
POST   /api/admin/system-personalizations
PUT    /api/admin/system-personalizations/{id}

GET    /api/admin/personalization-templates
POST   /api/admin/personalization-templates
PUT    /api/admin/personalization-templates/{id}
DELETE /api/admin/personalization-templates/{id}
```

## Common Tasks

### Create System Personalization
```php
use App\Models\SystemPersonalization;
use Illuminate\Support\Str;

$personalization = SystemPersonalization::create([
    'id' => Str::uuid(),
    'name' => 'Professional',
    'description' => 'Corporate environment settings',
    'system_prompt' => 'You are a professional business assistant...',
    'min_tone_level' => 2,      // Can't be very formal
    'max_tone_level' => 7,      // Can't be playful
    'min_detail_level' => 3,    // Must be at least detailed
    'max_detail_level' => 10,
    'min_response_length' => 2,
    'max_response_length' => 8,
    'is_default' => true,
    'is_active' => true,
]);
```

### Create Template
```php
use App\Models\PersonalizationTemplate;
use Illuminate\Support\Str;

$template = PersonalizationTemplate::create([
    'id' => Str::uuid(),
    'system_personalization_id' => $personalization->id,
    'name' => 'Quick Responder',
    'emoji' => '⚡',
    'description' => 'Fast, concise responses',
    'default_tone_level' => 5,
    'default_detail_level' => 3,      // Brief
    'default_response_length' => 2,   // Short
    'is_system_template' => true,
    'is_active' => true,
    'usage_count' => 0,
]);
```

### Update User Preferences
```php
$user = Auth::user();
$preferences = $user->chatPreferences;

// Update
$preferences->update([
    'tone_level' => 6,
    'detail_level' => 7,
    'response_length' => 5,
    'custom_system_prompt' => 'Always use markdown formatting',
]);

// Apply constraints (CRITICAL)
$preferences->applySystemConstraints();
$preferences->save();
```

### Check Constraint Violation
```php
$preferences = $user->chatPreferences;
$violations = $preferences->getConstraintViolations();

if (!empty($violations)) {
    foreach ($violations as $field => $message) {
        Log::warning("Constraint violation: $message");
    }
}
```

## Configuration

### Environment Variables
```env
# Enable/disable personalization system
PERSONALIZATION_ENABLED=true

# Show constraints in UI
PERSONALIZATION_SHOW_CONSTRAINTS=true

# Require system personalization
PERSONALIZATION_REQUIRED=false

# Default system personalization name
PERSONALIZATION_DEFAULT=Default

# Enable templates
PERSONALIZATION_TEMPLATES_ENABLED=true

# Allow custom prompts
PERSONALIZATION_ALLOW_CUSTOM_PROMPTS=true

# Logging
PERSONALIZATION_LOG=true
PERSONALIZATION_LOG_VIOLATIONS=true
PERSONALIZATION_LOG_ADMIN_CHANGES=true
```

### Access Config
```php
use Illuminate\Support\Facades\Config;

$enabled = Config::get('personalization.features.enabled');
$maxLength = Config::get('personalization.system.max_custom_prompt_length');
$descriptions = Config::get('personalization.descriptions');
```

## Key Concepts

### System Personalization
- **Mandatory**: Always applied, cannot be bypassed
- **Base Layer**: Foundation for all personalization
- **Constraints**: Define min/max for each preference
- **System Prompt**: Core instructions that cannot be changed by users

### Personalization Template
- **Quick Preset**: Pre-configured preference defaults
- **Constraint-Aware**: Defaults must respect system constraints
- **Optional**: Users can apply or ignore
- **Popularity Tracking**: usage_count shows popularity

### User Preferences
- **Customizable**: Users adjust tone, detail, length
- **Clamped**: Cannot exceed system constraints
- **Applied Constraints**: Read-only record of system limits
- **Custom Instructions**: Optional additions to system prompt

## Data Flow

```
Admin creates System Personalization
    ↓
Admin creates Template linked to Personalization
    ↓
User navigates to settings
    ↓
GET /api/settings/personalization
    ├─ Loads user preferences
    ├─ Gets system constraints
    ├─ Fetches available templates
    └─ Fetches AI modes
    ↓
User adjusts sliders or applies template
    ↓
PUT /api/settings/personalization
    ├─ Validates input
    ├─ Applies system constraints
    ├─ Saves to database
    └─ Returns updated preferences
    ↓
User sends chat message
    ↓
ChatController.chat()
    ├─ Loads user with preferences
    ├─ Calls ChatPersonalizationService::buildSystemPrompt()
    │   ├─ Gets system prompt (layer 1)
    │   ├─ Applies constraints (layer 2-3)
    │   ├─ Adds tone/detail/length instructions (layer 4)
    │   ├─ Adds custom prompt (layer 5)
    │   └─ Returns final prompt
    └─ Sends to GrokApiService
    ↓
AI responds with personalized behavior
```

## Debugging

### Check if Preferences Are Applied
```php
$user = User::with('chatPreferences.systemPersonalization')->find($userId);
$prefs = $user->chatPreferences;

dump($prefs);
// Should show: tone_level, detail_level, response_length
// Should show: applied_min_tone, applied_max_tone, etc.

dump($prefs->systemPersonalization);
// Should show system prompt and constraint ranges
```

### Test Personalization Service
```php
use App\Services\ChatPersonalizationService;

$user = User::find($userId)->load('chatPreferences.systemPersonalization');
$prompt = ChatPersonalizationService::buildSystemPrompt($user);

echo $prompt;
// Should show complete multi-layer prompt
```

### Verify Clamping
```php
$user = User::find($userId)->load('chatPreferences');
$prefs = $user->chatPreferences;

// Before constraints
echo "Before: tone_level = " . $prefs->tone_level; // 9

// Apply constraints
$prefs->applySystemConstraints();

// After constraints
echo "After: tone_level = " . $prefs->tone_level; // 8 (if max is 8)
```

### Check Database State
```sql
-- View user preferences
SELECT * FROM user_chat_preferences 
WHERE user_id = 'user-id';

-- View system constraints
SELECT * FROM system_personalizations 
WHERE is_active = true;

-- View templates
SELECT * FROM personalization_templates 
WHERE is_active = true
ORDER BY usage_count DESC;

-- Check if migration ran
SHOW COLUMNS FROM user_chat_preferences LIKE 'applied%';
```

## Common Errors & Fixes

### Error: "Column 'applied_min_tone' doesn't exist"
**Cause**: Migration hasn't run
**Fix**: 
```bash
php artisan migrate
```

### Error: "Class PersonalizationController not found"
**Cause**: Missing use statement
**Fix**:
```php
use App\Http\Controllers\Api\PersonalizationController;
```

### Error: Preferences saved but not clamped
**Cause**: Not calling applySystemConstraints()
**Fix**:
```php
$preferences->applySystemConstraints();  // Must call before save()
$preferences->save();
```

### Error: Template defaults rejected
**Cause**: Defaults don't match system constraints
**Fix**:
```php
// Check constraints first
$sysPers = SystemPersonalization::find($sysPersonalizationId);
if (!$sysPers->isPreferenceAllowed('tone', $defaultTone)) {
    // Adjust default to fit constraints
}
```

## Performance Tips

1. **Eager Load**: Use `with('chatPreferences.systemPersonalization')` to avoid N+1
2. **Cache System Personalizations**: Rarely change, safe to cache
3. **Index Lookups**: Tables have indexes on (is_default, is_active)
4. **Batch Updates**: Group preference updates to reduce queries

## Security Reminders

1. ✅ Always call `applySystemConstraints()` before saving
2. ✅ Only return user's own preferences (check Auth::user())
3. ✅ Validate admin status for admin endpoints
4. ✅ Use fillable to prevent mass assignment vulnerability
5. ✅ Log sensitive operations for audit trails

---

**Quick Reference Version**: 1.0
**Last Updated**: 2024
**Status**: ✅ Production Ready
