# Admin Personalization - Quick Start Guide

## What Is This?

A **layered personalization system** where:
1. **Admin** defines system-wide requirements (cannot be overridden)
2. **Admin** creates templates with defaults
3. **Users** customize within admin-defined constraints
4. **System prompt** always protected at base level

---

## Quick Setup (5 minutes)

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Create Default System Personalization
```bash
php artisan tinker

SystemPersonalization::create([
    'name' => 'Default',
    'system_prompt' => 'You are a helpful AI assistant...',
    'min_tone_level' => 1,
    'max_tone_level' => 10,
    'min_detail_level' => 1,
    'max_detail_level' => 10,
    'min_response_length' => 1,
    'max_response_length' => 10,
    'is_default' => true,
    'is_active' => true,
]);

exit
```

### 3. Create a Template
```bash
curl -X POST http://localhost:8000/api/admin/personalization-templates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quick Responder",
    "emoji": "⚡",
    "default_tone_level": 5,
    "default_detail_level": 2,
    "default_response_length": 2
  }'
```

Done! ✅

---

## Admin API Cheat Sheet

### System Personalizations

**List all:**
```bash
GET /api/admin/system-personalizations
```

**Create new:**
```bash
POST /api/admin/system-personalizations
{
    "name": "Professional",
    "system_prompt": "You are...",
    "min_tone_level": 2,
    "max_tone_level": 6,
    "min_detail_level": 3,
    "max_detail_level": 8,
    "min_response_length": 2,
    "max_response_length": 7,
    "is_default": false
}
```

**Update:**
```bash
PUT /api/admin/system-personalizations/{id}
{
    "name": "Professional Updated",
    "is_active": false
}
```

**Delete:**
```bash
DELETE /api/admin/system-personalizations/{id}
```

**Get default:**
```bash
GET /api/admin/system-personalizations/default/current
```

---

### Templates

**List all:**
```bash
GET /api/admin/personalization-templates
```

**Create new:**
```bash
POST /api/admin/personalization-templates
{
    "system_personalization_id": "uuid-optional",
    "name": "Detailed Expert",
    "emoji": "🧠",
    "default_tone_level": 7,
    "default_detail_level": 9,
    "default_response_length": 8
}
```

**Update:**
```bash
PUT /api/admin/personalization-templates/{id}
{
    "name": "Updated Name",
    "is_active": false
}
```

**Delete:**
```bash
DELETE /api/admin/personalization-templates/{id}
```

**Get statistics:**
```bash
GET /api/admin/personalization-templates/statistics
```

---

## Common Scenarios

### Scenario 1: Lock Corporate to Professional Tone

```bash
# Create Corporate system personalization
curl -X POST http://localhost:8000/api/admin/system-personalizations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corporate",
    "system_prompt": "You are a professional business assistant...",
    "min_tone_level": 2,
    "max_tone_level": 6,
    "min_detail_level": 3,
    "max_detail_level": 8,
    "min_response_length": 2,
    "max_response_length": 7,
    "is_default": false
  }'

# Copy the returned UUID
# Now users selecting Corporate cannot get playful tone (1-5 range removed)
```

**Result**: Even if user selects tone=10, they get tone=6 (system max)

---

### Scenario 2: Create Multiple Templates Under One System Personalization

```bash
# System Personalization: "Professional" with tone 2-6
# Now create 3 templates with different defaults:

# Template 1: Quick Responder
POST /api/admin/personalization-templates
{
    "system_personalization_id": "professional-uuid",
    "name": "Quick Responder",
    "emoji": "⚡",
    "default_tone_level": 3,
    "default_detail_level": 2,
    "default_response_length": 2
}

# Template 2: Balanced
POST /api/admin/personalization-templates
{
    "system_personalization_id": "professional-uuid",
    "name": "Balanced",
    "emoji": "⚖️",
    "default_tone_level": 5,
    "default_detail_level": 5,
    "default_response_length": 5
}

# Template 3: Detailed
POST /api/admin/personalization-templates
{
    "system_personalization_id": "professional-uuid",
    "name": "Detailed",
    "emoji": "📚",
    "default_tone_level": 6,
    "default_detail_level": 8,
    "default_response_length": 7
}
```

**Result**: All 3 templates respect professional tone bounds (2-6)

---

### Scenario 3: No Constraints (Full Flexibility)

```bash
# Create a "Flexible" system personalization
curl -X POST http://localhost:8000/api/admin/system-personalizations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flexible",
    "system_prompt": "You are a helpful assistant...",
    "min_tone_level": 1,
    "max_tone_level": 10,
    "min_detail_level": 1,
    "max_detail_level": 10,
    "min_response_length": 1,
    "max_response_length": 10,
    "is_default": false
  }'
```

**Result**: Users have full 1-10 range for all preferences (backward compatible)

---

## Understanding the Constraints

### Tone Level (1-10)
- **1-3**: Very Formal → Professional tone
- **4-6**: Professional → Balanced
- **7-10**: Casual → Playful tone

Example constraint: `min_tone_level: 2, max_tone_level: 6`
- User cannot be more formal than level 2
- User cannot be more casual than level 6
- Available range: 2-6 (removes extreme formal and playful)

### Detail Level (1-10)
- **1-3**: One-liners → Brief answers
- **4-6**: Moderate detail
- **7-10**: Very detailed → Ultra-detailed

Example constraint: `min_detail_level: 3, max_detail_level: 8`
- User cannot request one-liners (removed 1-2)
- User cannot request ultra-detailed (removed 9-10)
- Available range: 3-8

### Response Length (1-10)
- **1-3**: Short → Brief responses
- **4-6**: Moderate length
- **7-10**: Long → Maximum length

---

## Checking What Happened

### View User's Actual Settings

```php
php artisan tinker

$user = User::find(1);
$prefs = $user->chatPreferences;

// What user set
echo "User tone: " . $prefs->tone_level;

// What constraints were applied
echo "Min: " . $prefs->applied_min_tone;
echo "Max: " . $prefs->applied_max_tone;

// Get violations if any
echo json_encode($prefs->getConstraintViolations());
```

### Get Statistics

```bash
curl http://localhost:8000/api/admin/personalization-templates/statistics \
  -H "Authorization: Bearer TOKEN"

# See:
# - Total templates
# - Most popular templates
# - Total system personalizations
```

---

## Common Mistakes

❌ **WRONG**: Creating template with defaults outside constraints
```json
{
    "system_personalization_id": "professional-uuid",  // tone 2-6
    "default_tone_level": 9  // ERROR! Outside 2-6
}
```

✅ **CORRECT**:
```json
{
    "system_personalization_id": "professional-uuid",
    "default_tone_level": 5  // Within 2-6 ✓
}
```

---

❌ **WRONG**: Trying to delete default system personalization
```bash
DELETE /api/admin/system-personalizations/default-id
# Returns 422 error
```

✅ **CORRECT**: Set another as default first
```bash
# Step 1: Set new default
PUT /api/admin/system-personalizations/new-id
{ "is_default": true }

# Step 2: Now delete old one
DELETE /api/admin/system-personalizations/old-id
```

---

## Important: Security

**All constraints are enforced on server-side!**

❌ Don't rely on frontend sliders alone
✅ System clamps values server-side automatically

**Example**: Even if frontend allows tone 1-10, if system has tone 2-6:
- User submits tone=1 → Server clamps to 2
- User submits tone=9 → Server clamps to 6
- User submits tone=5 → Server accepts 5 (within range)

---

## Troubleshooting

### "Cannot delete default system personalization"
**Solution**: Set another system personalization as default first

### "Template defaults violate system personalization constraints"
**Solution**: Check the constraint ranges, adjust template defaults to fit

### User says preferences aren't working
**Check**:
```php
$user->chatPreferences->applied_min_tone
$user->chatPreferences->applied_max_tone
$user->chatPreferences->tone_level
```

The user's actual value is **clamped** to `[applied_min, applied_max]`

### Need to see current defaults
```bash
curl /api/admin/system-personalizations/default/current \
  -H "Authorization: Bearer TOKEN"
```

---

## PowerShell Examples (Windows)

### Get all system personalizations
```powershell
$headers = @{
    'Authorization' = 'Bearer YOUR_TOKEN'
    'Content-Type' = 'application/json'
}

Invoke-RestMethod `
    -Uri 'http://localhost:8000/api/admin/system-personalizations' `
    -Headers $headers `
    -Method Get | ConvertTo-Json
```

### Create system personalization
```powershell
$body = @{
    name = "Professional"
    system_prompt = "You are a professional assistant..."
    min_tone_level = 2
    max_tone_level = 6
    min_detail_level = 3
    max_detail_level = 8
    min_response_length = 2
    max_response_length = 7
    is_default = $false
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri 'http://localhost:8000/api/admin/system-personalizations' `
    -Headers $headers `
    -Method Post `
    -Body $body
```

---

## Quick Reference Card

| Action | Endpoint | Method |
|--------|----------|--------|
| List system personalizations | `/admin/system-personalizations` | GET |
| Create system personalization | `/admin/system-personalizations` | POST |
| Update system personalization | `/admin/system-personalizations/{id}` | PUT |
| Delete system personalization | `/admin/system-personalizations/{id}` | DELETE |
| Get default system personalization | `/admin/system-personalizations/default/current` | GET |
| List templates | `/admin/personalization-templates` | GET |
| Create template | `/admin/personalization-templates` | POST |
| Update template | `/admin/personalization-templates/{id}` | PUT |
| Delete template | `/admin/personalization-templates/{id}` | DELETE |
| Get statistics | `/admin/personalization-templates/statistics` | GET |

---

**Remember**: System Personalization = Base Layer (Admin Control) → User Preferences (User Customization Within Bounds)
