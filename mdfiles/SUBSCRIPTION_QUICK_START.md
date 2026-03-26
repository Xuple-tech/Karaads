# Subscription System - Quick Start Guide 🚀

**Status**: Ready to Deploy  
**Estimated Setup Time**: 30 minutes  
**Requirements**: Laravel 12 app with database configured

---

## ⚡ 5-Minute Setup

### Step 1: Run Migrations (2 minutes)
```bash
php artisan migrate
```

✅ **Expected Output**: 5 tables created:
- subscription_plans
- subscriptions
- usage_quotas
- usage_summaries
- rate_limit_violations

### Step 2: Create Default Plans (1 minute)
```bash
php artisan subscription:create-defaults
```

✅ **Expected Output**:
```
✅ Default subscription plans created successfully!

┌─────────────────┬────────────┬───────────────┬──────────────┬────────────────┐
│ Plan Name       │ Slug       │ Requests/Day  │ Tokens/Day   │ Price/Month    │
├─────────────────┼────────────┼───────────────┼──────────────┼────────────────┤
│ Free            │ free       │ 50            │ 10,000       │ $0.00          │
│ Paid            │ paid       │ 500           │ 100,000      │ $9.99          │
│ Premium         │ premium    │ 2,000         │ 500,000      │ $29.99         │
│ Gold            │ gold       │ Unlimited     │ Unlimited    │ $99.99         │
└─────────────────┴────────────┴───────────────┴──────────────┴────────────────┘
```

### Step 3: Verify Installation (2 minutes)
```bash
php artisan tinker

> DB::table('subscription_plans')->count()
// Should return: 4

> DB::table('subscription_plans')->pluck('name')
// Should return: ["Free", "Paid", "Premium", "Gold"]

> exit
```

---

## 🎯 Integration Checklist

### Backend ✅ Already Done
- [x] Database schema
- [x] Models & relationships
- [x] SubscriptionService with all methods
- [x] CheckSubscriptionRateLimit middleware
- [x] Middleware applied to chat routes
- [x] ChatController updated with usage recording
- [x] API endpoints ready

### Frontend ✅ Already Done
- [x] RateLimitModal component
- [x] UsageStats component
- [x] UpgradePrompt component
- [x] useSubscriptionRateLimit hook
- [x] Pricing page
- [x] Subscription management page

### What You Need To Do (Optional)

#### 1. Add Navigation Links (5 minutes)
Update your main navigation component:

```typescript
// In your Header/Navigation component
import { Link } from '@inertiajs/react';
import { User } from '@/types';

export function Navigation({ user }: { user?: User }) {
    return (
        <nav>
            {/* Existing nav items */}
            
            {user && (
                <>
                    <Link href="/subscription" className="px-4 py-2">
                        📊 Subscription
                    </Link>
                    <Link href="/subscription/pricing" className="px-4 py-2">
                        💰 Upgrade
                    </Link>
                </>
            )}
            
            {user?.is_admin && (
                <Link href="/admin/subscriptions/plans" className="px-4 py-2">
                    ⚙️ Manage Plans
                </Link>
            )}
        </nav>
    );
}
```

#### 2. Test Rate Limiting (5 minutes)

**Test User Scenario**:
1. Create new user account
2. Automatically assigned to Free plan (50 requests/day)
3. Send 51 chat messages
4. 51st message should return 429 error
5. RateLimitModal appears showing:
   - Current plan: "Free"
   - Limit: 50 requests
   - Used: 50 requests
   - Reset time: Tomorrow
   - "Upgrade to Paid" button

**Test Code** (in Tinker):
```bash
php artisan tinker

// Create test user
$user = User::factory()->create(['email' => 'test@example.com']);

// Get their plan (should be Free)
$plan = app(\App\Services\SubscriptionService::class)->getUserPlan($user);
echo $plan->name; // Should output: "Free"

// Get their current usage
$quota = \App\Models\UsageQuota::getTodayQuota($user->id);
echo $quota->requests_used; // Should be 0

// Manually record 50 requests
for ($i = 0; $i < 50; $i++) {
    app(\App\Services\SubscriptionService::class)->recordRequest($user, 100);
}

// Check if 51st request is allowed
$result = app(\App\Services\SubscriptionService::class)->canMakeRequest($user);
echo $result['allowed'] ? "ALLOWED" : "BLOCKED"; // Should output: "BLOCKED"

exit
```

#### 3. Test Admin Features (5 minutes)

**As Admin User**:
1. Visit `/admin/subscriptions/plans`
2. See all 4 plans listed
3. Click "Create Plan" button
4. Create new plan: "Starter: 100 requests/day, $4.99/month"
5. Click Edit on "Paid" plan
6. Change price from $9.99 to $12.99
7. Save changes
8. Verify plan list updated

---

## 📊 Testing Endpoints

### Test Rate Limiting
```bash
# As authenticated user with Free plan:
curl -X POST http://localhost:8000/create-two-step-challagene \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# If you've hit the 50-request limit, expect:
# HTTP 429 with body:
{
  "success": false,
  "error": "Rate limit exceeded",
  "reason": "Daily request limit exceeded",
  "limit": 50,
  "used": 50,
  "reset_at": "2025-01-23 00:00:00",
  "plan_name": "Free",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### Get Usage Stats
```bash
curl -X GET http://localhost:8000/api/subscription/usage-stats \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "plan": {
    "id": "plan-uuid",
    "name": "Free",
    "requests_per_day": 50,
    "tokens_per_day": 10000
  },
  "daily": {
    "requests_used": 45,
    "tokens_used": 12000,
    "requests_limit": 50,
    "tokens_limit": 10000,
    "images_generated": 2,
    "voice_messages": 0,
    "emails_processed": 0
  },
  "monthly": {
    "requests_used": 150,
    "tokens_used": 45000,
    "requests_limit": 1500,
    "tokens_limit": 300000,
    "images_generated": 5,
    "voice_messages": 2,
    "emails_processed": 0
  }
}
```

### Upgrade Subscription
```bash
curl -X POST http://localhost:8000/api/subscription/upgrade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "premium-uuid"
  }'

# Expected Response:
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "subscription": {
    "id": "sub-uuid",
    "user_id": "user-uuid",
    "plan_id": "premium-uuid",
    "status": "active",
    "started_at": "2025-01-21T10:00:00",
    "renews_at": "2025-02-21T10:00:00"
  }
}
```

---

## 🎨 Frontend Components Reference

### Using RateLimitModal
```typescript
import RateLimitModal from '@/components/subscription/RateLimitModal';

export function ChatComponent() {
    const [rateLimitError, setRateLimitError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleChatError = (error) => {
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
            setRateLimitError(error);
            setShowModal(true);
        }
    };

    return (
        <>
            <RateLimitModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setRateLimitError(null);
                }}
                error={rateLimitError}
            />
        </>
    );
}
```

### Using UsageStats
```typescript
import UsageStats from '@/components/subscription/UsageStats';

export function DashboardComponent() {
    return (
        <div>
            <h1>Your Usage</h1>
            <UsageStats userId={user.id} />
        </div>
    );
}
```

### Using useSubscriptionRateLimit Hook
```typescript
import { useSubscriptionRateLimit } from '@/hooks/useSubscriptionRateLimit';

export function SomeComponent() {
    const {
        isRateLimitError,
        handleRateLimitError,
        clearRateLimit,
        canMakeRequest,
        getFormattedResetTime
    } = useSubscriptionRateLimit();

    const tryToChat = async () => {
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                body: JSON.stringify({ message })
            });

            if (!canMakeRequest(response)) {
                handleRateLimitError(await response.json());
                return;
            }

            // Process response
        } catch (error) {
            // Handle error
        }
    };
}
```

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] Database migrations ran successfully
- [ ] 4 subscription plans created (Free, Paid, Premium, Gold)
- [ ] New users get Free plan automatically
- [ ] Chat usage is recorded after each message
- [ ] Rate limiting blocks requests when limit exceeded
- [ ] RateLimitModal displays on 429 error
- [ ] Upgrade button redirects to pricing page
- [ ] Admin can see and manage plans
- [ ] Usage stats API returns correct data

---

## 🚨 Troubleshooting

### Issue: "No plan found" error
**Solution**: Run `php artisan subscription:create-defaults` to create plans

### Issue: Users not on Free plan automatically
**Solution**: Verify `SubscriptionService::getUserPlan()` calls `SubscriptionPlan::getFreePlan()`

### Issue: Rate limit not blocking requests
**Solution**: 
1. Check middleware is applied: `php artisan route:list | grep CheckSubscriptionRateLimit`
2. Verify plan has limits: `php artisan tinker` then `SubscriptionPlan::first()->requests_per_day`

### Issue: Usage not recording
**Solution**: Verify ChatController has SubscriptionService injected and calls `recordRequest()`

### Issue: Admin can't access subscription plans
**Solution**: Verify user has `is_admin` flag or add admin middleware to routes

---

## 📱 Product Features Available

After setup, users have access to:

### Free Tier
- 50 requests per day
- 10,000 tokens per day
- Chat with basic AI modes
- Web search (limited)

### Paid Tier
- 500 requests per day
- 100,000 tokens per day
- API access
- Voice chat
- Advanced AI modes

### Premium Tier
- 2,000 requests per day
- 500,000 tokens per day
- Email automation
- Priority support
- Project management

### Gold Tier
- Unlimited requests
- Unlimited tokens
- White label options
- Dedicated support

---

## 🎓 Next Steps

1. **Test Rate Limiting**: Hit the limit with Free plan to verify blocking
2. **Test Upgrade Flow**: Upgrade from Free to Paid, verify new limits
3. **Test Admin Panel**: Create/edit/delete subscription plans
4. **Monitor Usage**: Check usage_quotas table after sending messages
5. **Deploy to Production**: After testing, deploy code to production

---

## 📞 Support

If you encounter issues:
1. Check logs: `tail -f storage/logs/laravel.log`
2. Verify DB: `php artisan tinker` → Query subscription tables
3. Run tests: `php artisan test tests/Feature/SubscriptionTest.php`

---

**Setup Complete! 🎉**

Your subscription system is now ready to use. Users will be automatically assigned to the Free tier on first request, and rate limiting will be enforced based on their plan.
