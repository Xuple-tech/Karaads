# SaaS Owner Features - Quick Reference Guide

## 🎯 Quick Navigation

### Main Routes
- **Dashboard:** `/saas-owner`
- **Subscriptions:** `/saas-owner/subscriptions`
- **Users:** `/saas-owner/users`
- **Statistics:** `/saas-owner/stats`

---

## 📋 Subscription Management

### List Subscriptions
```
GET /saas-owner/subscriptions
```
**Query Parameters:**
- `status` - Filter by: active, cancelled, expired, paused
- `plan_id` - Filter by subscription plan
- `search` - Search by user email or name
- `sort_by` - Sort by: created_at, started_at, renews_at
- `sort_order` - asc or desc

**Example:**
```
GET /saas-owner/subscriptions?status=active&sort_by=renews_at&sort_order=asc
```

### Create Subscription
```
POST /saas-owner/subscriptions
```
**Body:**
```json
{
    "user_id": "user-uuid",
    "plan_id": "plan-uuid",
    "is_trial": false,
    "trial_duration_days": 14,
    "started_at": "2024-01-15",
    "amount_paid": 99.99
}
```

### View Subscription
```
GET /saas-owner/subscriptions/{subscription_id}
```

### Update Subscription
```
PUT /saas-owner/subscriptions/{subscription_id}
```
**Body:**
```json
{
    "plan_id": "plan-uuid",
    "status": "active",
    "amount_paid": 149.99
}
```

### Cancel Subscription
```
POST /saas-owner/subscriptions/{subscription_id}/cancel
```

### Pause/Resume Subscription
```
POST /saas-owner/subscriptions/{subscription_id}/pause
POST /saas-owner/subscriptions/{subscription_id}/resume
```

### Export Subscriptions
```
GET /saas-owner/subscriptions/export/csv
```

---

## 👥 User Management

### List Users
```
GET /saas-owner/users
```
**Query Parameters:**
- `role` - Filter by: user, staff, admin, saas_owner
- `subscription_status` - Filter by: active, cancelled, paused
- `search` - Search by email or name
- `verified` - true or false (email verified)
- `sort_by` - Sort by: created_at, name, email
- `sort_order` - asc or desc

**Example:**
```
GET /saas-owner/users?subscription_status=active&verified=true&sort_by=name
```

### View User Details
```
GET /saas-owner/users/{user_id}
```
**Response Includes:**
- User profile information
- Current subscription details
- Total conversations count
- Total chats count
- Activity statistics

### Edit User
```
PUT /saas-owner/users/{user_id}
```
**Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "language": "en"
}
```

### Reset User Password
```
POST /saas-owner/users/{user_id}/reset-password
```
**Body:**
```json
{
    "send_email": true
}
```

### Toggle User Active Status
```
POST /saas-owner/users/{user_id}/toggle-active
```

### Delete User
```
DELETE /saas-owner/users/{user_id}
```

### Export Users
```
GET /saas-owner/users/export/csv
```

---

## 📊 User Statistics

### Overview Statistics
```
GET /saas-owner/stats?period=30d
```
**Returns:**
- Total users, active users
- Subscription metrics
- Chat and conversation counts
- Plan distribution
- Daily activity
- Top users
- User growth trends

**Period Options:** `7d`, `30d`, `90d`, `1y`

### User-Specific Statistics
```
GET /saas-owner/stats/users/{user_id}?period=30d
```
**Returns:**
- User profile
- Detailed usage statistics
- Conversation and chat counts
- Daily activity
- Subscription info
- Usage timeline

### Subscription Statistics
```
GET /saas-owner/stats/subscriptions?period=30d
```
**Returns:**
- Subscription counts and status
- Revenue metrics
- Plan distribution
- Daily revenue
- Renewal information
- Churn metrics

### Engagement Statistics
```
GET /saas-owner/stats/engagement?period=30d
```
**Returns:**
- Active user segments
- Retention metrics
- Churn rate
- Hourly activity
- User engagement breakdown

---

## 🔐 Authentication & Authorization

### Required Role
```
role === 'saas_owner'
```

### Check SaaS Owner Status (PHP)
```php
$user = auth()->user();
if ($user->isSaasOwner()) {
    // Has access
}
```

### Set User as SaaS Owner
```php
$user->update(['role' => 'saas_owner']);
```

---

## 🛠️ Common Tasks

### Create Trial Subscription for User
```
POST /saas-owner/subscriptions
{
    "user_id": "user-uuid",
    "plan_id": "pro-plan-uuid",
    "is_trial": true,
    "trial_duration_days": 14,
    "amount_paid": 0
}
```

### Upgrade User Subscription
```
PUT /saas-owner/subscriptions/{subscription_id}
{
    "plan_id": "enterprise-plan-uuid",
    "amount_paid": 299.99
}
```

### Get Top 10 Most Active Users This Month
```
GET /saas-owner/stats?period=30d
// Response includes 'top_users' array
```

### Find User by Email
```
GET /saas-owner/users?search=user@example.com
```

### Export All Active Subscribers
```
GET /saas-owner/subscriptions/export/csv?status=active
```

---

## 🐛 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 403 | Unauthorized - Not a SaaS Owner | Verify user role is 'saas_owner' |
| 404 | Resource Not Found | Check resource ID is valid |
| 422 | Validation Error | Check request body format |
| 500 | Server Error | Check logs for details |

---

## 💡 Tips & Tricks

### 1. Automatic Previous Subscription Cancellation
When creating a new subscription, active subscriptions are automatically cancelled:
```
Creating subscription → Cancels previous active subscriptions → Creates new subscription
```

### 2. Trial Subscriptions
Set `is_trial: true` to create trial subscriptions with automatic expiration:
```json
{
    "is_trial": true,
    "trial_duration_days": 14
}
```

### 3. Bulk Operations
Use CSV export and bulk import features for large-scale operations:
```
GET /saas-owner/subscriptions/export/csv > subscriptions.csv
// Edit subscriptions.csv
// POST /saas-owner/subscriptions/import (to be implemented)
```

### 4. Audit Logging
All actions are automatically logged. Check audit logs:
```php
AuditLog::where('action_type', 'create')
    ->where('resource_type', 'Subscription')
    ->latest()
    ->get();
```

### 5. Real-time Stats
Stats are calculated on-demand. Cache frequently accessed stats:
```php
cache()->remember('saas_stats_30d', 3600, function () {
    return SaasOwnerService::getOverallStats('30d');
});
```

---

## 📱 Frontend Usage (React/TypeScript)

### Fetch Subscriptions with Axios
```typescript
import axios from 'axios';

// List subscriptions
const response = await axios.get('/saas-owner/subscriptions', {
    params: {
        status: 'active',
        sort_by: 'renews_at',
        sort_order: 'asc'
    }
});

// Create subscription
const response = await axios.post('/saas-owner/subscriptions', {
    user_id: 'user-uuid',
    plan_id: 'plan-uuid',
    is_trial: false,
    amount_paid: 99.99
});

// Get user stats
const response = await axios.get(`/saas-owner/stats/users/${userId}`, {
    params: { period: '30d' }
});
```

### Using React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch subscriptions
const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => axios.get('/saas-owner/subscriptions')
});

// Create subscription
const { mutate } = useMutation({
    mutationFn: (data) => axios.post('/saas-owner/subscriptions', data),
    onSuccess: () => queryClient.invalidateQueries(['subscriptions'])
});
```

---

## 🔄 Workflow Examples

### Workflow 1: Onboard New Customer
```
1. Create user account
2. Create subscription to selected plan
3. Send welcome email
4. Monitor first-week activity via stats
5. Follow up if no engagement after 3 days
```

### Workflow 2: Handle Churn
```
1. Check engagement stats to find inactive users
2. Review user's subscription details
3. Offer discount or upgrade
4. If declining: pause/cancel subscription
5. Log action for future reference
```

### Workflow 3: Generate Monthly Report
```
1. Export all users: GET /saas-owner/users/export/csv
2. Export all subscriptions: GET /saas-owner/subscriptions/export/csv
3. Get revenue stats: GET /saas-owner/stats/subscriptions?period=30d
4. Get engagement stats: GET /saas-owner/stats/engagement?period=30d
5. Compile into report
```

---

## 🚀 Best Practices

1. **Always verify user role** before granting SaaS owner access
2. **Use CSV exports** for bulk operations and backups
3. **Monitor churn rate** weekly for early intervention
4. **Log all manual changes** for compliance and auditing
5. **Cache frequently used stats** to reduce database load
6. **Use period parameters** appropriately (don't always query all-time)
7. **Review audit logs** regularly for suspicious activity
8. **Backup data** before bulk operations
9. **Use trial subscriptions** for new user onboarding
10. **Monitor renewal dates** proactively

---

## 📞 Support

For detailed information, see: `SAAS_OWNER_FEATURES_IMPLEMENTATION.md`

For issues:
1. Check `/storage/logs/laravel.log`
2. Review audit logs: `AuditLog::latest()->limit(50)->get()`
3. Verify user role: `auth()->user()->role`
4. Test endpoints with Postman

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready ✅
