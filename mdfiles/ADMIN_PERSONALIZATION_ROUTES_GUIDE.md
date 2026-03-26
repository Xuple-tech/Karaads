# Admin Personalization Routes Guide

## Overview
The Admin Personalization System is accessible through **both web routes and API routes**, supporting traditional admin panel interfaces and modern SPA/API-driven applications.

---

## 🌐 Web Routes (Admin Panel)

All web routes are protected by the `AdminMiddleware` and require admin authentication.

### System Personalizations
Base path: `/admin/personalizations`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/admin/personalizations` | List all system personalizations |
| GET | `/admin/personalizations/create` | Show create form |
| POST | `/admin/personalizations` | Store new personalization |
| GET | `/admin/personalizations/{id}` | Show edit form |
| PUT | `/admin/personalizations/{id}` | Update personalization |
| DELETE | `/admin/personalizations/{id}` | Delete personalization |

**Route Names:**
- `admin.personalizations.index` - List
- `admin.personalizations.create` - Create form
- `admin.personalizations.store` - Store
- `admin.personalizations.edit` - Edit form
- `admin.personalizations.update` - Update
- `admin.personalizations.destroy` - Delete

**Example Usage in Blade/Inertia:**
```blade
{{-- List --}}
<a href="{{ route('admin.personalizations.index') }}">All Personalizations</a>

{{-- Create form --}}
<form action="{{ route('admin.personalizations.store') }}" method="POST">
    @csrf
    <input name="name" required>
    <input name="system_prompt" required>
    {{-- constraint inputs --}}
    <button type="submit">Create</button>
</form>

{{-- Edit form --}}
<form action="{{ route('admin.personalizations.update', $personalization) }}" method="POST">
    @csrf
    @method('PUT')
    {{-- inputs with current values --}}
    <button type="submit">Update</button>
</form>

{{-- Delete --}}
<form action="{{ route('admin.personalizations.destroy', $personalization) }}" method="POST">
    @csrf
    @method('DELETE')
    <button type="submit">Delete</button>
</form>
```

### Personalization Templates
Base path: `/admin/personalization-templates`

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/admin/personalization-templates` | List all templates |
| GET | `/admin/personalization-templates/create` | Show create form |
| POST | `/admin/personalization-templates` | Store new template |
| GET | `/admin/personalization-templates/{id}` | Show edit form |
| PUT | `/admin/personalization-templates/{id}` | Update template |
| DELETE | `/admin/personalization-templates/{id}` | Delete template (soft delete) |
| GET | `/admin/personalization-templates/statistics` | View usage statistics |

**Route Names:**
- `admin.personalization-templates.index` - List
- `admin.personalization-templates.create` - Create form
- `admin.personalization-templates.store` - Store
- `admin.personalization-templates.edit` - Edit form
- `admin.personalization-templates.update` - Update
- `admin.personalization-templates.destroy` - Delete
- `admin.personalization-templates.statistics` - Statistics

**Example Usage in Blade/Inertia:**
```blade
{{-- List --}}
<a href="{{ route('admin.personalization-templates.index') }}">Templates</a>

{{-- Statistics --}}
<a href="{{ route('admin.personalization-templates.statistics') }}">Statistics</a>

{{-- Create --}}
<form action="{{ route('admin.personalization-templates.store') }}" method="POST">
    @csrf
    <select name="system_personalization_id" required></select>
    <input name="name" required>
    <input name="emoji" placeholder="📝">
    {{-- preference inputs --}}
    <button type="submit">Create Template</button>
</form>
```

---

## 🔌 API Routes (REST API)

All API routes require `auth:sanctum` middleware and `admin` role.

### System Personalizations
Base path: `/api/admin/system-personalizations`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/system-personalizations` | List all personalizations |
| POST | `/api/admin/system-personalizations` | Create personalization |
| PUT | `/api/admin/system-personalizations/{id}` | Update personalization |
| DELETE | `/api/admin/system-personalizations/{id}` | Delete personalization |
| GET | `/api/admin/system-personalizations/default/current` | Get default personalization |

**Create Request:**
```json
POST /api/admin/system-personalizations

{
    "name": "Professional",
    "description": "For professional communications",
    "system_prompt": "You are a professional business assistant...",
    "min_tone_level": 2,
    "max_tone_level": 6,
    "min_detail_level": 3,
    "max_detail_level": 8,
    "min_response_length": 2,
    "max_response_length": 7,
    "is_default": false,
    "is_active": true
}
```

**Response:**
```json
{
    "success": true,
    "message": "System personalization created successfully",
    "personalization": {
        "id": "uuid-here",
        "name": "Professional",
        "constraints": {
            "tone_level": [2, 6],
            "detail_level": [3, 8],
            "response_length": [2, 7]
        }
    }
}
```

### Personalization Templates
Base path: `/api/admin/personalization-templates`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/personalization-templates` | List all templates |
| POST | `/api/admin/personalization-templates` | Create template |
| PUT | `/api/admin/personalization-templates/{id}` | Update template |
| DELETE | `/api/admin/personalization-templates/{id}` | Delete template |
| GET | `/api/admin/personalization-templates/statistics` | Get usage statistics |

**Create Template Request:**
```json
POST /api/admin/personalization-templates

{
    "system_personalization_id": "uuid-here",
    "name": "Quick Responder",
    "description": "Fast, concise responses",
    "emoji": "⚡",
    "default_tone_level": 4,
    "default_detail_level": 3,
    "default_response_length": 2,
    "is_system_template": true,
    "is_active": true
}
```

---

## 🔄 Route Comparison

### Web Routes (Traditional)
- **Returns:** HTML/Inertia components
- **Use Case:** Admin dashboard UI
- **Middleware:** `AdminMiddleware` (custom)
- **Response Type:** View/Redirect
- **Session:** Uses CSRF token (web session)

**Example:**
```blade
<!-- Create new personalization -->
<form action="{{ route('admin.personalizations.store') }}" method="POST">
    @csrf
    <input name="name" placeholder="Personalization name">
    <!-- ... other inputs ... -->
    <button type="submit">Create</button>
</form>

<!-- View personalization list -->
@foreach($personalizations as $personalization)
    <div>
        <h3>{{ $personalization->name }}</h3>
        <a href="{{ route('admin.personalizations.edit', $personalization) }}">Edit</a>
        <form action="{{ route('admin.personalizations.destroy', $personalization) }}" method="POST">
            @csrf @method('DELETE')
            <button>Delete</button>
        </form>
    </div>
@endforeach
```

### API Routes (REST)
- **Returns:** JSON responses
- **Use Case:** Mobile apps, external integrations, SPA
- **Middleware:** `auth:sanctum` + `admin` role
- **Response Type:** JSON
- **Authentication:** Bearer token (API token)

**Example:**
```javascript
// List personalizations
fetch('/api/admin/system-personalizations', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
.then(r => r.json())
.then(data => console.log(data.personalizations))

// Create personalization
fetch('/api/admin/system-personalizations', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'Professional',
        system_prompt: '...',
        min_tone_level: 2,
        max_tone_level: 6,
        // ... other fields
    })
})
.then(r => r.json())
.then(data => console.log(data.message))

// Update personalization
fetch(`/api/admin/system-personalizations/${id}`, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        system_prompt: '...',
        is_active: true
    })
})

// Delete personalization
fetch(`/api/admin/system-personalizations/${id}`, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

---

## 🔐 Authentication & Authorization

### Web Routes
- Requires admin middleware
- Checks user has `admin` role
- Uses web session CSRF protection
- Respects `AdminMiddleware` implementation

### API Routes
- Requires `auth:sanctum` middleware
- Requires `admin` middleware
- Uses bearer token authentication
- Returns 401 if not authenticated
- Returns 403 if not admin

---

## 📋 Controller Methods

Both routes use the same `PersonalizationController` class methods:

| Method | Web Route | API Route |
|--------|-----------|-----------|
| `indexPersonalizations()` | GET `/admin/personalizations` | GET `/api/admin/system-personalizations` |
| `createPersonalization()` | GET `/admin/personalizations/create` | N/A |
| `storePersonalization()` | POST `/admin/personalizations` | POST `/api/admin/system-personalizations` |
| `editPersonalization()` | GET `/admin/personalizations/{id}` | N/A |
| `updatePersonalization()` | PUT `/admin/personalizations/{id}` | PUT `/api/admin/system-personalizations/{id}` |
| `destroyPersonalization()` | DELETE `/admin/personalizations/{id}` | DELETE `/api/admin/system-personalizations/{id}` |
| `indexTemplates()` | GET `/admin/personalization-templates` | GET `/api/admin/personalization-templates` |
| `createTemplate()` | GET `/admin/personalization-templates/create` | N/A |
| `storeTemplate()` | POST `/admin/personalization-templates` | POST `/api/admin/personalization-templates` |
| `editTemplate()` | GET `/admin/personalization-templates/{id}` | N/A |
| `updateTemplate()` | PUT `/admin/personalization-templates/{id}` | PUT `/api/admin/personalization-templates/{id}` |
| `destroyTemplate()` | DELETE `/admin/personalization-templates/{id}` | DELETE `/api/admin/personalization-templates/{id}` |
| `statistics()` | GET `/admin/personalization-templates/statistics` | GET `/api/admin/personalization-templates/statistics` |

---

## 🎯 Which Route to Use?

### Use Web Routes If:
- ✅ Building a traditional admin dashboard with Blade/Inertia
- ✅ Want form-based submissions with CSRF protection
- ✅ Admin panel is part of the main Laravel application
- ✅ Need session-based authentication
- ✅ Prefer server-side rendered forms

### Use API Routes If:
- ✅ Building a mobile application
- ✅ Building a separate SPA (Vue, React, etc.)
- ✅ Need to integrate with external systems
- ✅ Want stateless authentication (tokens)
- ✅ Integrating with JavaScript frameworks

### Use Both If:
- ✅ Need both admin dashboard UI and API access
- ✅ Supporting multiple client types (web + mobile)
- ✅ Want maximum flexibility

---

## 📝 Common Tasks

### Admin Creates System Personalization via Web
```blade
<!-- resources/views/admin/personalizations/create.blade.php -->
<form action="{{ route('admin.personalizations.store') }}" method="POST">
    @csrf
    <div class="form-group">
        <label>Name</label>
        <input type="text" name="name" required>
    </div>
    <div class="form-group">
        <label>System Prompt</label>
        <textarea name="system_prompt" required></textarea>
    </div>
    <!-- Constraints -->
    <div class="constraints">
        <label>Tone Level Range</label>
        <input type="number" name="min_tone_level" min="1" max="10" required>
        <input type="number" name="max_tone_level" min="1" max="10" required>
    </div>
    <button type="submit">Create</button>
</form>
```

### Admin Creates Template via API
```bash
curl -X POST http://localhost/api/admin/personalization-templates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "system_personalization_id": "uuid",
    "name": "Quick Responder",
    "emoji": "⚡",
    "default_tone_level": 4,
    "default_detail_level": 3,
    "default_response_length": 2,
    "is_active": true
  }'
```

### View Statistics
**Web:** `<a href="{{ route('admin.personalization-templates.statistics') }}">View Stats</a>`

**API:** `GET /api/admin/personalization-templates/statistics`

---

## ✨ Features Available in Both Routes

✅ Create/Read/Update/Delete system personalizations  
✅ Create/Read/Update/Delete templates  
✅ Constraint enforcement validation  
✅ Default personalization management  
✅ Soft delete support for templates  
✅ Usage statistics  
✅ Search and filtering  
✅ Pagination  

---

## 🚀 Setup Checklist

- [x] Web routes added to `routes/admin.php`
- [x] API routes already in `routes/api.php`
- [x] Web controller created: `App\Http\Controllers\Admin\PersonalizationController`
- [x] API controller exists: `App\Http\Controllers\Api\AdminPersonalizationController`
- [x] Database migrations ready
- [x] Models configured
- [x] Authorization middleware in place

**Next Steps:**
1. Run migrations: `php artisan migrate`
2. Create Inertia components for web routes (optional)
3. Test web routes via admin panel
4. Test API routes via Postman/curl
5. Create default system personalization
