# Subscription System Implementation - Complete Guide

## ✅ System Status: FULLY IMPLEMENTED

This document covers the complete subscription system implementation for Kwati AI with rate limiting, admin management, and user-facing features.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Backend Components](#backend-components)
4. [Frontend Components](#frontend-components)
5. [Configuration & Setup](#configuration--setup)
6. [Rate Limiting Integration](#rate-limiting-integration)
7. [Admin Panel Features](#admin-panel-features)
8. [Testing Checklist](#testing-checklist)

---

## 🏗️ Architecture Overview

### System Flow

```
User Request
    ↓
CheckSubscriptionRateLimit Middleware
    ├─ Check user's plan
    ├─ Check daily/monthly limits
    ├─ Allow or deny request (429)
    └─ Log violations
    ↓
ChatController.chat()
    ├─ Process request
    └─ Record usage via SubscriptionService
    ↓
Response to Client
    ├─ Success
    └─ If error: Show RateLimitModal to user
```

### Subscription Tiers

| Tier | Monthly | Daily Requests | Daily Tokens | Features |
|------|---------|----------------|--------------|----------|
| **Free** | $0 | 50 | 10K | Chat, Web Search, Basic AI Modes |
| **Paid** | $9.99 | 500 | 100K | + API, Voice, Advanced Modes |
| **Premium** | $29.99 | 2,000 | 500K | + Email Automation, Priority Support |
| **Gold** | $99.99 | Unlimited | Unlimited | Everything + Projects, White Label |

---

## 🗄️ Database Schema

### Tables Created

```
subscription_plans
├─ id (UUID)
├─ name
├─ slug (unique)
├─ description
├─ monthly_price
├─ yearly_price
├─ requests_per_day
├─ requests_per_month
├─ tokens_per_day
├─ tokens_per_month
├─ features (JSON)
├─ supports_api
├─ supports_voice
├─ supports_email_automation
├─ supports_projects
├─ priority_support
├─ is_active
├─ display_order
└─ timestamps

subscriptions
├─ id (UUID)
├─ user_id (FK)
├─ plan_id (FK)
├─ status (active|cancelled|expired|pending_payment)
├─ started_at
├─ renews_at
├─ expires_at
├─ cancelled_at
├─ payment_method
├─ external_subscription_id
├─ amount_paid
├─ is_trial
├─ trial_ends_at
├─ timestamps
├─ soft_deletes

usage_quotas
├─ id (UUID)
├─ user_id (FK)
├─ plan_id (FK)
├─ date
├─ requests_used
├─ tokens_used
├─ images_generated
├─ voice_messages
├─ emails_processed
├─ metadata (JSON)
└─ timestamps

usage_summaries
├─ id (UUID)
├─ user_id (FK)
├─ plan_id (FK)
├─ year
├─ month
├─ total_requests
├─ total_tokens
├─ total_images
├─ total_voice_messages
├─ total_emails
├─ metadata (JSON)
└─ timestamps

rate_limit_violations
├─ id (UUID)
├─ user_id (FK)
├─ plan_id (FK)
├─ type (requests_per_day|requests_per_month|tokens_per_day|tokens_per_month)
├─ limit_value
├─ attempted_value
├─ description
└─ timestamps
```

---

## 🔧 Backend Components

### 1. Models

#### SubscriptionPlan
```php
// app/Models/SubscriptionPlan.php
- Relationships: subscriptions(), activeSubscriptions(), usageQuotas()
- Methods:
  - getActivePlans() - Get all active plans
  - getFreePlan() - Get free tier
  - hasRequestLimit()
  - isFreePlan()
```

#### Subscription
```php
// app/Models/Subscription.php
- Relationships: user(), plan(), usageQuotas()
- Methods:
  - isActive() - Check if subscription is active
  - isExpired() - Check if expired
  - isInTrial() - Check if trial active
  - cancel() - Cancel subscription
  - renew() - Renew subscription
  - markExpired() - Mark as expired
  - getCurrentSubscriptionForUser($userId) - Get active sub
```

#### UsageQuota
```php
// app/Models/UsageQuota.php
- Tracks daily usage per user
- Methods:
  - getOrCreateTodayQuota($userId, $planId)
  - getTodayQuota($userId)
  - getAggregatedMonthlyUsage($userId)
  - incrementRequests(), incrementTokens(), etc.
  - getProgressPercentage($limit)
```

#### UsageSummary
```php
// app/Models/UsageSummary.php
- Monthly aggregated usage for reporting
- Methods:
  - syncFromDailyQuotas() - Aggregate daily to monthly
```

#### RateLimitViolation
```php
// app/Models/RateLimitViolation.php
- Audit log for limit violations
- Methods:
  - logViolation($userId, $planId, $type, $limit, $attempted, $description)
```

### 2. Services

#### SubscriptionService
```php
// app/Services/SubscriptionService.php
Key Methods:
- getUserSubscription(User $user)
- getUserPlan(User $user)
- canMakeRequest(User $user): array
- canUseTokens(User $user, int $tokensNeeded): array
- recordRequest(User $user, int $tokens, array $metadata)
- recordImageGeneration(User $user, int $count)
- recordVoiceMessage(User $user)
- recordEmailProcessing(User $user, int $count)
- getUserUsageStats(User $user): array
- upgradePlan(User $user, SubscriptionPlan $plan)
- downgradePlan(User $user, SubscriptionPlan $plan)
- startTrial(User $user, SubscriptionPlan $plan, int $days)
- createDefaultPlans()
```

### 3. Controllers

#### SubscriptionController
```php
// app/Http/Controllers/SubscriptionController.php
Routes:
- GET  /subscription/pricing - Show pricing page
- GET  /api/subscription/plans - Get available plans
- GET  /api/subscription/my-subscription - Current subscription
- POST /api/subscription/upgrade - Upgrade plan
- POST /api/subscription/downgrade - Downgrade plan
- POST /api/subscription/cancel - Cancel subscription
- POST /api/subscription/start-trial - Start 7-day trial
- GET  /api/subscription/usage-stats - Get usage statistics
```

#### Admin/SubscriptionPlanController
```php
// app/Http/Controllers/Admin/SubscriptionPlanController.php
Routes:
- GET    /admin/subscriptions/plans - List all plans
- GET    /admin/subscriptions/plans/create - Create form
- POST   /admin/subscriptions/plans - Store new plan
- GET    /admin/subscriptions/plans/{id}/edit - Edit form
- PUT    /admin/subscriptions/plans/{id} - Update plan
- DELETE /admin/subscriptions/plans/{id} - Delete plan
- PATCH  /admin/subscriptions/plans/{id}/deactivate - Toggle status
- GET    /admin/subscriptions/plans/{id}/stats - Get plan stats
```

### 4. Middleware

#### CheckSubscriptionRateLimit
```php
// app/Http/Middleware/CheckSubscriptionRateLimit.php
- Intercepts requests from authenticated users
- Checks canMakeRequest() via SubscriptionService
- Returns 429 if limit exceeded
- Response includes: error, reason, limit, used, reset_at, plan_info
```

### 5. Routes

#### Subscription Routes
```php
// routes/subscriptions.php
- Public pricing page
- Authenticated subscription management
- API endpoints for plans and subscription data
```

#### Admin Subscription Routes
```php
// routes/admin-subscriptions.php
- Admin-only plan CRUD operations
- Statistics and management
```

---

## 🎨 Frontend Components

### 1. Pages

#### Pricing.tsx
```typescript
// resources/js/pages/Subscription/Pricing.tsx
- Display all subscription plans
- Show current plan with ring highlight
- Upgrade/downgrade/trial buttons
- FAQ section
- Plan comparison
```

#### Index.tsx
```typescript
// resources/js/pages/Subscription/Index.tsx
- Subscription management dashboard
- Current plan details
- Usage statistics display
- Upgrade options
- Cancel subscription button
```

#### Admin Pages
```typescript
// resources/js/pages/Admin/Subscriptions/Index.tsx
- List all plans with stats
- Active user count per plan
- Create/edit/delete buttons

// resources/js/pages/Admin/Subscriptions/Form.tsx
- Create/edit plan form
- Pricing configuration
- Feature toggles
- Capability checkboxes
- Rate limit configuration
```

### 2. Components

#### RateLimitModal.tsx
```typescript
// resources/js/components/subscription/RateLimitModal.tsx
- Triggered when rate limit is hit
- Shows current limit and usage
- Countdown timer until reset
- Upgrade button to pricing page
- Plan comparison teaser
```

#### UsageStats.tsx
```typescript
// resources/js/components/subscription/UsageStats.tsx
- Daily/monthly usage tabs
- Progress bars for each metric
- Color-coded (green/amber/red)
- Shows requests, tokens, images, voice, emails
- Unlimited badge for unrestricted plans
```

#### UpgradePrompt.tsx
```typescript
// resources/js/components/subscription/UpgradePrompt.tsx
- Inline alert for usage notifications
- Severity levels (info/warning/critical)
- Current usage display
- Dismissible option
- Quick link to plans
```

### 3. Hooks

#### useSubscriptionRateLimit
```typescript
// resources/js/hooks/useSubscriptionRateLimit.ts
- isRateLimitError(error) - Check if error is rate limit
- handleRateLimitError(error) - Set rate limit state
- clearRateLimit() - Clear error state
- canMakeRequest() - Check if user can make request
- getFormattedResetTime() - Format countdown timer
```

---

## ⚙️ Configuration & Setup

### 1. Database Migration

```bash
# Run migration to create all tables
php artisan migrate

# If needed, rollback
php artisan migrate:rollback
```

### 2. Create Default Plans

```php
// In a migration or command
$subscriptionService = app(SubscriptionService::class);
$subscriptionService->createDefaultPlans();
```

Or via Artisan command (if you create one):
```bash
php artisan subscription:create-defaults
```

### 3. Environment Setup

No special environment variables needed. All configuration is in the database.

### 4. User Subscription Assignment

New users are automatically assigned the **Free** plan on first request through:
```php
// In SubscriptionService::getUserPlan()
// If no subscription exists, returns free plan
```

---

## 🔐 Rate Limiting Integration

### How It Works

1. **Request comes in** → `CheckSubscriptionRateLimit` middleware
2. **Checks subscription** → `SubscriptionService::canMakeRequest()`
3. **Evaluates limits** → Compares usage vs plan limits
4. **Decision**:
   - ✅ **Allowed**: Request proceeds, middleware passes
   - ❌ **Denied**: Returns 429 status with details

### Integration Points

#### Chat Endpoint
```php
// routes/web.php
Route::post('/create-two-step-challagene', [ChatController::class, 'chat'])
    ->middleware(CheckSubscriptionRateLimit::class)
    ->withoutMiddleware(VerifyCsrfToken::class);
```

#### Recording Usage
```php
// In ChatController after successful response
$this->subscriptionService->recordRequest($user, $tokensUsed, $metadata);
```

### Frontend Error Handling

```typescript
// In chat component
try {
    const response = await fetch('/api/create/challenge/message', {
        method: 'POST',
        body: JSON.stringify({ message })
    });
    
    if (response.status === 429) {
        const error = await response.json();
        handleRateLimitError(error);
        // Show RateLimitModal
    }
} catch (error) {
    // Handle error
}
```

---

## 👨‍💼 Admin Panel Features

### Access

Only users with `admin` role can access:
- `/admin/subscriptions/plans`

### Management Tasks

#### 1. Create Plan
- Define name, slug, description
- Set pricing (monthly/yearly)
- Configure rate limits
- Add features
- Toggle capabilities
- Set display order

#### 2. Edit Plan
- Modify any plan details
- Update limits and pricing
- Change features
- Toggle active status

#### 3. Monitor Plans
- View active subscription count per plan
- See total users on each tier
- Access statistics

#### 4. Deactivate Plans
- Prevent new signups
- Keep existing subscriptions active
- Can reactivate anytime

#### 5. Delete Plans
- Only if no active subscriptions
- Soft delete for audit trail

---

## 📊 User-Facing Features

### Features Available

- **View Plans**: Pricing page with all tiers
- **Subscribe/Upgrade**: One-click upgrade process
- **Manage Subscription**: Cancel or view current plan
- **Check Usage**: Real-time usage statistics
- **Try Plans**: Free 7-day trial (once per account)
- **Receive Alerts**: When approaching limits

### User Notifications

1. **In-app Modal** (RateLimitModal)
   - Triggered when limit hit
   - Shows reset time
   - Quick upgrade option

2. **Inline Alerts** (UpgradePrompt)
   - Severity-based styling
   - Dismissible notifications
   - Usage information

3. **Dashboard** (UsageStats)
   - Daily/monthly breakdown
   - Progress bars
   - Visual limit indicators

---

## 🧪 Testing Checklist

### Database Tests
- [ ] Migration creates all 5 tables
- [ ] Foreign key relationships work
- [ ] Unique constraints enforced

### Model Tests
- [ ] SubscriptionPlan relationships
- [ ] Subscription status methods
- [ ] UsageQuota aggregation
- [ ] RateLimitViolation logging

### Service Tests
- [ ] Rate limit checking (daily/monthly)
- [ ] Usage recording
- [ ] Plan upgrade/downgrade
- [ ] Trial creation

### API Endpoint Tests
- [ ] GET /api/subscription/plans
- [ ] GET /api/subscription/my-subscription
- [ ] POST /api/subscription/upgrade
- [ ] POST /api/subscription/downgrade
- [ ] POST /api/subscription/cancel
- [ ] POST /api/subscription/start-trial
- [ ] GET /api/subscription/usage-stats

### Middleware Tests
- [ ] Rate limit blocking (429 response)
- [ ] Allows requests within limit
- [ ] Logs violations
- [ ] Passes through for unauthenticated users

### Admin Tests
- [ ] List plans
- [ ] Create plan
- [ ] Edit plan
- [ ] Delete plan (only if no subscriptions)
- [ ] Deactivate/activate plan
- [ ] View stats

### Frontend Tests
- [ ] Pricing page loads
- [ ] Upgrade button works
- [ ] RateLimitModal displays on 429
- [ ] UsageStats fetches data
- [ ] Countdown timer works

### User Flow Tests
1. [ ] New user → Free plan assigned
2. [ ] User upgrades → Usage resets
3. [ ] User hits limit → 429 + Modal
4. [ ] User starts trial → 7-day access
5. [ ] User cancels → Reverts to Free
6. [ ] Admin creates plan → Available to users
7. [ ] Admin deactivates plan → No new signups

---

## 🔌 Integration with Chat System

### Usage Recording

After successful chat response:
```php
$this->subscriptionService->recordRequest(
    $user,
    $estimatedTokens,
    [
        'model' => $model,
        'enable_tools' => $enableTools,
        'tool_calls' => count($toolCalls ?? [])
    ]
);
```

### Token Estimation

```php
// In GrokApiService or ChatController
private function estimateTokens(string $content): int {
    return ceil(strlen($content) / 4); // 1 token ≈ 4 characters
}
```

### Image Generation

```php
$this->subscriptionService->recordImageGeneration($user, $count);
```

### Voice Messages

```php
$this->subscriptionService->recordVoiceMessage($user);
```

### Email Processing

```php
$this->subscriptionService->recordEmailProcessing($user);
```

---

## 🚀 Deployment Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Create default plans
- [ ] Verify admin middleware exists
- [ ] Test rate limiting in staging
- [ ] Verify frontend components compile
- [ ] Test upgrade flow end-to-end
- [ ] Monitor for violations in logs
- [ ] Set up admin access

---

## 📝 Future Enhancements

1. **Payment Integration**
   - Stripe/PayPal integration
   - Webhook handlers
   - Invoice generation

2. **Advanced Analytics**
   - Usage trends
   - Cohort analysis
   - Revenue dashboards

3. **Auto-scaling**
   - Dynamic plan recommendations
   - Usage-based pricing
   - Graduated overage fees

4. **Internationalization**
   - Multi-currency pricing
   - Localized plans
   - Regional compliance

5. **Team Subscriptions**
   - Shared quotas
   - Team member management
   - Usage pooling

---

## 🆘 Troubleshooting

### Issue: Users not getting Free plan
**Solution**: Ensure `SubscriptionService::getUserPlan()` returns free plan when no subscription exists

### Issue: Middleware not blocking requests
**Solution**: Verify middleware is registered in routes and `CheckSubscriptionRateLimit::class` is imported

### Issue: Usage not recording
**Solution**: Ensure `SubscriptionService::recordRequest()` is called after successful chat completion

### Issue: Admin cannot access plans page
**Solution**: Verify user has `admin` role and `AdminMiddleware` is properly configured

### Issue: Rate limit modal not showing
**Solution**: Verify frontend catches 429 status and checks `RATE_LIMIT_EXCEEDED` error code

---

## 📚 Related Files

- Database Migration: `database/migrations/2025_01_21_000001_create_subscription_tables.php`
- Models: `app/Models/{SubscriptionPlan,Subscription,UsageQuota,UsageSummary,RateLimitViolation}.php`
- Service: `app/Services/SubscriptionService.php`
- Controllers: `app/Http/Controllers/{SubscriptionController}.php`, `app/Http/Controllers/Admin/SubscriptionPlanController.php`
- Middleware: `app/Http/Middleware/CheckSubscriptionRateLimit.php`
- Routes: `routes/{subscriptions,admin-subscriptions}.php`
- Frontend: `resources/js/pages/Subscription/*`, `resources/js/components/subscription/*`

---

**Last Updated**: January 2025  
**Status**: ✅ Complete and Ready for Testing
