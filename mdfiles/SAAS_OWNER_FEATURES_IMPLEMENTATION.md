# SaaS Owner Features Implementation Guide

## Overview

This document describes the complete implementation of SaaS Owner features for the Rhea AI application. SaaS Owners have exclusive access to manage subscriptions, view users, and access detailed user statistics.

**Implementation Date:** 2024
**Status:** ✅ Complete
**Access Control:** SaasOwnerMiddleware (role === 'saas_owner')

---

## Architecture

### Role-Based Access Control

```
User Roles:
├── user (Regular user)
├── staff (Support/operations staff)
├── admin (CTO/System Administrator)
└── saas_owner (SaaS Owner - EXCLUSIVE FEATURES)
```

### SaasOwnerMiddleware

Enhanced middleware that:
- ✅ Authenticates user
- ✅ Verifies `role === 'saas_owner'`
- ✅ Logs access attempts (success and failures)
- ✅ Returns structured JSON responses
- ✅ Prevents unauthorized access with 403 responses

**Location:** `app/Http/Middleware/SaasOwnerMiddleware.php`

---

## Features Implemented

### 1. SUBSCRIPTION MANAGEMENT ⚙️

**Route Prefix:** `/saas-owner/subscriptions`
**Controller:** `SubscriptionManagementController`

#### Features:
- ✅ **List Subscriptions** - View all subscriptions with filtering
- ✅ **Create Subscription** - Assign plans to users manually
- ✅ **View Details** - Detailed subscription information
- ✅ **Edit** - Update subscription details
- ✅ **Cancel** - Cancel active subscriptions
- ✅ **Pause** - Temporarily pause subscriptions
- ✅ **Resume** - Resume paused subscriptions
- ✅ **Export CSV** - Export subscriptions for reporting

#### Routes:

```
GET    /saas-owner/subscriptions              → index (list all)
GET    /saas-owner/subscriptions/create       → create (show form)
POST   /saas-owner/subscriptions              → store (create new)
GET    /saas-owner/subscriptions/{id}         → show (view details)
GET    /saas-owner/subscriptions/{id}/edit    → edit (edit form)
PUT    /saas-owner/subscriptions/{id}         → update (save changes)
POST   /saas-owner/subscriptions/{id}/cancel  → cancel
POST   /saas-owner/subscriptions/{id}/pause   → pause
POST   /saas-owner/subscriptions/{id}/resume  → resume
GET    /saas-owner/subscriptions/export/csv   → export
```

#### Example: Create Subscription

```php
// Controller action
public function store(Request $request)
{
    $validated = $request->validate([
        'user_id' => 'required|exists:users,id',
        'plan_id' => 'required|exists:subscription_plans,id',
        'is_trial' => 'boolean',
        'trial_duration_days' => 'nullable|integer|min:1|max:90',
        'started_at' => 'nullable|date|after_or_equal:today',
        'amount_paid' => 'nullable|numeric|min:0',
    ]);
    
    // Creates subscription with automatic previous cancellation
}
```

---

### 2. USER MANAGEMENT 👥

**Route Prefix:** `/saas-owner/users`
**Controller:** `UserManagementController`

#### Features:
- ✅ **List Users** - View all users with filters
- ✅ **View Details** - User profile and stats
- ✅ **Edit** - Update user information
- ✅ **Reset Password** - Generate temporary password
- ✅ **Toggle Active** - Disable/enable users
- ✅ **Delete** - Remove user account
- ✅ **Export CSV** - Export user list

#### Routes:

```
GET    /saas-owner/users              → index (list all)
GET    /saas-owner/users/{id}         → show (view details)
GET    /saas-owner/users/{id}/edit    → edit (edit form)
PUT    /saas-owner/users/{id}         → update (save changes)
POST   /saas-owner/users/{id}/reset-password   → resetPassword
POST   /saas-owner/users/{id}/toggle-active    → toggleActive
DELETE /saas-owner/users/{id}         → destroy (delete user)
GET    /saas-owner/users/export/csv   → export
```

#### Available Filters:

```javascript
// List endpoint filters
{
    role: 'user|staff|admin|saas_owner',
    subscription_status: 'active|cancelled|paused',
    search: 'email or name',
    verified: 'true|false',
    sort_by: 'created_at|name|email',
    sort_order: 'asc|desc'
}
```

#### Example: Get User with Stats

```php
$user->load(['activeSubscription', 'activeSubscription.plan']);

// User includes:
- Profile info (name, email, avatar)
- Subscription details
- Total conversations count
- Total chats count
- Conversations this month count
```

---

### 3. USER STATISTICS & ANALYTICS 📊

**Route Prefix:** `/saas-owner/stats`
**Controller:** `UserStatsController`

#### 3.1 Overview Statistics

**Route:** `GET /saas-owner/stats`

Returns comprehensive platform statistics:

```php
[
    'stats' => [
        'total_users' => 1250,
        'new_users_period' => 45,
        'active_users_period' => 320,
        'total_active_subscriptions' => 890,
        'total_cancelled_subscriptions' => 150,
        'total_conversations' => 5420,
        'total_chats' => 45320,
        'chats_period' => 8900,
    ],
    'period' => '30d',
    'plan_distribution' => [...],
    'daily_activity' => [...],
    'top_users' => [...],
    'user_growth' => [...],
]
```

#### 3.2 User Details Statistics

**Route:** `GET /saas-owner/stats/users/{user_id}`

Detailed analytics for specific user:

```php
[
    'user' => [
        'id', 'name', 'email', 'avatar', 'created_at'
    ],
    'stats' => [
        'total_conversations' => 25,
        'conversations_period' => 8,
        'total_chats' => 250,
        'chats_period' => 100,
        'total_messages' => 250,
        'messages_period' => 100,
    ],
    'subscription' => [
        'plan_name' => 'Pro',
        'status' => 'active',
        'renews_at' => '2024-02-15',
    ],
    'daily_activity' => [...],
    'usage_by_day' => [...],
]
```

#### 3.3 Subscription Statistics

**Route:** `GET /saas-owner/stats/subscriptions`

Subscription and revenue analytics:

```php
[
    'stats' => [
        'total_subscriptions' => 1000,
        'active_subscriptions' => 890,
        'trial_subscriptions' => 45,
        'cancelled_subscriptions' => 150,
        'total_revenue' => 45000,
        'revenue_period' => 8900,
        'cancelled_period' => 12,
        'upcoming_renewals' => 145,
    ],
    'plan_stats' => [
        'Basic' => ['count' => 300, 'revenue' => 8700],
        'Pro' => ['count' => 450, 'revenue' => 44550],
        'Enterprise' => ['count' => 140, 'revenue' => 15000],
    ],
    'daily_revenue' => [...],
]
```

#### 3.4 Engagement Statistics

**Route:** `GET /saas-owner/stats/engagement`

User engagement and retention metrics:

```php
[
    'stats' => [
        'active_users' => 320,
        'very_active_users' => 45,
        'active_users_count' => 120,
        'moderate_users' => 155,
        'inactive_users' => 890,
        'returning_users' => 280,
        'churn_rate' => '12.50',
    ],
    'hourly_activity' => [...],
]
```

#### Statistics Query Parameters

All stats endpoints support:

```
?period=7d|30d|90d|1y
```

---

## Database Models

### Key Models Used

1. **User** - User profile and credentials
2. **Subscription** - User subscriptions to plans
3. **SubscriptionPlan** - Available subscription tiers
4. **Conversation** - Chat conversations
5. **Chat** - Individual messages
6. **AuditLog** - Track all SaaS owner actions

### Relationships

```php
User
  ├── hasMany(Subscription)
  ├── hasMany(Conversation)
  └── hasManyThrough(Chat)

Subscription
  ├── belongsTo(User)
  └── belongsTo(SubscriptionPlan)

SubscriptionPlan
  └── hasMany(Subscription)
```

---

## Services

### SaasOwnerService

**Location:** `app/Services/SaasOwnerService.php`

Utility methods for common operations:

```php
SaasOwnerService::getOverallStats(period: '30d')
SaasOwnerService::getUserSubscriptionInfo(User $user)
SaasOwnerService::createSubscription(User $user, Plan $plan, options)
SaasOwnerService::getRevenueStats(period: '30d')
SaasOwnerService::getUserEngagement(period: '30d')
SaasOwnerService::getChurnMetrics(period: '30d')
SaasOwnerService::getTopUsers(limit: 10, period: '30d')
SaasOwnerService::exportUsersCSV(filters)
SaasOwnerService::exportSubscriptionsCSV(filters)
```

---

## Audit Logging

All SaaS owner actions are logged:

```php
AuditLog::logAction(
    'create|update|delete|cancel|pause|resume',
    'User|Subscription|etc',
    $resourceId,
    $oldValues,
    $newValues,
    $description
);
```

**Example:**
```php
AuditLog::logAction(
    'create',
    'Subscription',
    $subscription->id,
    null,
    $subscription->toArray(),
    "SaaS Owner created subscription for user@example.com on Pro plan"
);
```

---

## Security Considerations

### 1. Role Verification

Every SaaS owner route is protected by `SaasOwnerMiddleware`:

```php
Route::middleware([SaasOwnerMiddleware::class])->group(function () {
    // Only SaaS owners can access
});
```

### 2. Audit Logging

All actions are logged with:
- Action type
- Resource type and ID
- User performing action
- Before/after values
- Timestamp
- IP address

### 3. Data Protection

- Passwords are hashed with bcrypt
- Soft deletes preserve data
- Transaction support for consistency
- Error handling and logging

### 4. Authorization Checks

Each method verifies:
```php
if ($user->isSaasOwner()) {
    // Proceed
} else {
    abort(403, 'Unauthorized');
}
```

---

## API Endpoints Summary

### Authentication Required
All endpoints require:
- ✅ User authenticated (`auth` middleware)
- ✅ SaaS Owner role (`SaasOwnerMiddleware`)

### Response Format

**Success Response:**
```json
{
    "success": true,
    "data": {...},
    "message": "Operation successful"
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "Error description",
    "code": "ERROR_CODE"
}
```

---

## Testing

### Example: Create Subscription

```php
$saasOwner = User::where('role', 'saas_owner')->first();
$user = User::where('role', 'user')->first();
$plan = SubscriptionPlan::where('is_active', true)->first();

$this->actingAs($saasOwner)
    ->post('/saas-owner/subscriptions', [
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'is_trial' => false,
        'amount_paid' => $plan->monthly_price,
    ])
    ->assertRedirect();
```

### Example: Get User Stats

```php
$saasOwner = User::where('role', 'saas_owner')->first();
$user = User::where('role', 'user')->first();

$response = $this->actingAs($saasOwner)
    ->get("/saas-owner/stats/users/{$user->id}?period=30d")
    ->assertOk();
```

---

## Usage Examples

### From Frontend (React)

```javascript
// List all subscriptions
const response = await axios.get('/saas-owner/subscriptions');

// Create new subscription
const response = await axios.post('/saas-owner/subscriptions', {
    user_id: 'user-uuid',
    plan_id: 'plan-uuid',
    is_trial: false,
    amount_paid: 99.99,
});

// Get user statistics
const response = await axios.get('/saas-owner/stats/users/user-uuid?period=30d');

// Export users
const response = await axios.get('/saas-owner/users/export/csv');
```

### From PHP Code

```php
use App\Services\SaasOwnerService;

// Get overall stats
$stats = SaasOwnerService::getOverallStats('30d');

// Create subscription
$subscription = SaasOwnerService::createSubscription($user, $plan, [
    'is_trial' => true,
    'trial_duration_days' => 14,
]);

// Get top users
$topUsers = SaasOwnerService::getTopUsers(limit: 20, period: '30d');
```

---

## File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   └── SaasOwner/
│   │       ├── SubscriptionManagementController.php ✨ NEW
│   │       ├── UserManagementController.php ✨ NEW
│   │       ├── UserStatsController.php ✨ NEW
│   │       ├── SaasOwnerDashboardController.php (existing)
│   │       ├── TeamMemberController.php (existing)
│   │       └── CustomPromptController.php (existing)
│   └── Middleware/
│       └── SaasOwnerMiddleware.php (ENHANCED)
├── Services/
│   └── SaasOwnerService.php ✨ NEW
└── Models/
    ├── User.php (with isSaasOwner() method)
    ├── Subscription.php
    ├── SubscriptionPlan.php
    ├── AuditLog.php
    └── ... other models

routes/
└── saas-owner.php (UPDATED)
```

---

## Deployment Checklist

- [x] Enhanced SaasOwnerMiddleware with logging
- [x] Created SubscriptionManagementController
- [x] Created UserManagementController
- [x] Created UserStatsController
- [x] Created SaasOwnerService utility class
- [x] Updated saas-owner.php routes
- [x] Tested all endpoints
- [x] Audit logging implemented
- [x] Error handling implemented
- [x] CSV export functionality
- [x] Comprehensive documentation

---

## Future Enhancements

Potential improvements:

1. **Advanced Analytics**
   - Cohort analysis
   - Retention funnels
   - Feature adoption tracking

2. **Automation**
   - Auto-renewal management
   - Churn prevention notifications
   - Subscription lifecycle automation

3. **Integrations**
   - Stripe integration for payment management
   - Slack notifications for SaaS owner alerts
   - Export to analytics tools

4. **Performance**
   - Caching for frequently accessed stats
   - Background jobs for large exports
   - Real-time dashboards with WebSockets

---

## Troubleshooting

### Issue: 403 Forbidden on SaaS Owner Routes

**Solution:** Verify user role:
```php
$user = auth()->user();
echo $user->role; // Should be 'saas_owner'
dd($user->isSaasOwner()); // Should be true
```

### Issue: Missing Subscriptions in List

**Solution:** Check subscription status and dates:
```php
$subscription = Subscription::find($id);
dd([
    'status' => $subscription->status,
    'expires_at' => $subscription->expires_at,
    'is_active' => $subscription->isActive(),
]);
```

### Issue: Stats Not Showing Data

**Solution:** Verify date range and data exists:
```php
$chats = Chat::where('created_at', '>=', now()->subDays(30))->count();
echo $chats; // Should have data
```

---

## Support

For issues or questions about SaaS Owner features:

1. Check audit logs: `AuditLog::latest()->get()`
2. Review middleware logs: `storage/logs/laravel.log`
3. Verify user role: `User::where('id', auth()->id())->select('role')->first()`
4. Test endpoints in Postman/Insomnia

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial implementation with subscription, user, and stats features |

---

**Last Updated:** 2024
**Maintained By:** Development Team
**Status:** Production Ready ✅
