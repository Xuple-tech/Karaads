# Stripe Integration, Pricing Page & Subscription Management Guide

## Overview

This guide covers the complete implementation of:
1. ✅ **Pricing Page** - Beautiful, responsive subscription plan display
2. ✅ **Stripe Integration** - Full payment processing with webhooks
3. ✅ **Subscription Management** - User-friendly subscription controls
4. ✅ **Usage Tracking** - Real-time usage statistics and limits

---

## 🚀 Quick Start Setup

### 1. Environment Configuration

Add these to your `.env` file:

```bash
STRIPE_PUBLIC_KEY=pk_live_your_public_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Where to get these:**
- Go to https://dashboard.stripe.com/apikeys
- Copy `Publishable key` → `STRIPE_PUBLIC_KEY`
- Copy `Secret key` → `STRIPE_SECRET_KEY`

### 2. Webhook Configuration

Set up Stripe webhooks to receive payment events:

```
Stripe Dashboard > Webhooks > Add endpoint
```

**Webhook URL:**
```
https://yourdomain.com/stripe/webhook
```

**Events to subscribe to:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Copy the signing secret** → `STRIPE_WEBHOOK_SECRET` in `.env`

### 3. Database Migrations

Run migrations to add Stripe fields:

```bash
php artisan migrate
```

This adds:
- `stripe_id` to `users` table
- `stripe_product_id`, `stripe_monthly_price_id`, `stripe_yearly_price_id` to `subscription_plans`

### 4. Seed Subscription Plans

Create subscription plans in database:

```bash
php artisan tinker
```

```php
// Create Free Plan
$free = App\Models\SubscriptionPlan::create([
    'name' => 'Free',
    'slug' => 'free',
    'description' => 'Perfect for getting started',
    'monthly_price' => 0,
    'yearly_price' => 0,
    'requests_per_day' => 10,
    'requests_per_month' => 100,
    'tokens_per_day' => 5000,
    'tokens_per_month' => 50000,
    'images_per_day' => 5,
    'images_per_month' => 50,
    'features' => ['Basic chat', 'Limited API access'],
    'supports_api' => false,
    'supports_voice' => false,
    'supports_email_automation' => false,
    'supports_projects' => false,
    'priority_support' => false,
    'is_active' => true,
    'display_order' => 1,
]);

// Create Pro Plan
$pro = App\Models\SubscriptionPlan::create([
    'name' => 'Pro',
    'slug' => 'pro',
    'description' => 'For professionals and teams',
    'monthly_price' => 29,
    'yearly_price' => 290,
    'requests_per_day' => 1000,
    'requests_per_month' => 30000,
    'tokens_per_day' => 500000,
    'tokens_per_month' => 15000000,
    'images_per_day' => 100,
    'images_per_month' => 3000,
    'features' => [
        'Advanced chat with history',
        'Full API access',
        'Priority support',
        'Project management',
        'Email automation',
        'Voice capabilities'
    ],
    'supports_api' => true,
    'supports_voice' => true,
    'supports_email_automation' => true,
    'supports_projects' => true,
    'priority_support' => true,
    'is_active' => true,
    'display_order' => 2,
]);

// Create Enterprise Plan
$enterprise = App\Models\SubscriptionPlan::create([
    'name' => 'Enterprise',
    'slug' => 'enterprise',
    'description' => 'For large-scale operations',
    'monthly_price' => 99,
    'yearly_price' => 990,
    'requests_per_day' => null,
    'requests_per_month' => null,
    'tokens_per_day' => null,
    'tokens_per_month' => null,
    'images_per_day' => null,
    'images_per_month' => null,
    'features' => [
        'Unlimited everything',
        'Dedicated support',
        'Custom integration',
        'SLA guarantee',
        'Advanced analytics',
        'Multi-team support'
    ],
    'supports_api' => true,
    'supports_voice' => true,
    'supports_email_automation' => true,
    'supports_projects' => true,
    'priority_support' => true,
    'is_active' => true,
    'display_order' => 3,
]);
```

---

## 📄 Component Locations

### Frontend Components

**1. Pricing Page**
```
resources/js/pages/Subscription/Pricing.tsx
```

Features:
- Monthly/Yearly billing toggle
- Plan comparison cards
- FAQ section
- Free trial option
- Upgrade buttons with Stripe checkout

Route: `/pricing` or `/subscription/pricing`

**2. Subscription Management**
```
resources/js/pages/Profile/SubscriptionManagement.tsx
```

Features:
- Current subscription display
- Trial info
- Payment status
- Renewal date
- Cancel/change plan options

**3. Usage Tracking Dashboard**
```
resources/js/pages/Profile/UsageTracking.tsx
```

Features:
- Daily/Monthly toggle
- Real-time usage stats
- Progress bars for limits
- Warnings when approaching limits
- Usage tips

---

## 🔌 Backend Architecture

### Services

**StripeService** (`app/Services/StripeService.php`)
- Customer management
- Product/Price creation
- Checkout session creation
- Subscription operations
- Webhook synchronization

**SubscriptionService** (`app/Services/SubscriptionService.php`)
- Rate limiting checks
- Usage tracking
- Plan management
- Trial management

### Controllers

**SubscriptionController** (`app/Http/Controllers/SubscriptionController.php`)
- Pricing page rendering
- Subscription CRUD
- Trial start
- Usage stats

**StripeWebhookController** (`app/Http/Controllers/StripeWebhookController.php`)
- Webhook event handling
- Subscription sync
- Payment status updates

---

## 🔄 Payment Flow

```
User Clicks Upgrade
    ↓
Frontend calls /api/subscription/upgrade
    ↓
SubscriptionController creates Stripe checkout session
    ↓
User redirected to Stripe hosted checkout
    ↓
User completes payment
    ↓
Stripe sends webhook to /stripe/webhook
    ↓
StripeWebhookController processes event
    ↓
Subscription updated in database
    ↓
User now has access to paid plan features
```

---

## 📊 API Endpoints

### Public Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/pricing` | GET | Display pricing page |
| `/api/subscription/plans` | GET | Get all active plans |
| `/stripe/webhook` | POST | Stripe webhook receiver |

### Authenticated Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscription/upgrade` | POST | Create checkout session |
| `/api/subscription/downgrade` | POST | Downgrade to lower plan |
| `/api/subscription/cancel` | POST | Cancel subscription |
| `/api/subscription/start-trial` | POST | Start 7-day trial |
| `/api/subscription/my-subscription` | GET | Get current subscription |
| `/api/subscription/usage-stats` | GET | Get usage statistics |
| `/subscription/success` | GET | Checkout success handler |

---

## 🔐 Security Considerations

### Webhook Verification
All Stripe webhooks are verified using the webhook signing secret:

```php
$event = Webhook::constructEvent(
    $payload,
    $sig_header,
    config('services.stripe.webhook_secret')
);
```

### Payment Validation
Checkout sessions are validated before activating subscriptions.

### Rate Limiting
Usage-based rate limiting prevents abuse of API requests.

---

## 🧪 Testing

### Test Mode

Use Stripe's test credentials in `.env`:

```bash
STRIPE_PUBLIC_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key
```

### Test Cards

```
Success: 4242 4242 4242 4242
Failure: 4000 0000 0000 0002
Expired: 4000 0000 0000 0069
```

### Local Webhook Testing

Forward Stripe webhooks locally using:

```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```

This gives you a webhook signing secret for local testing.

---

## 💾 Database Schema

### Subscription Plans
```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    monthly_price DECIMAL(8,2),
    yearly_price DECIMAL(8,2),
    requests_per_day INT,
    requests_per_month INT,
    tokens_per_day INT,
    tokens_per_month INT,
    images_per_day INT,
    images_per_month INT,
    features JSON,
    stripe_product_id VARCHAR(255),
    stripe_monthly_price_id VARCHAR(255),
    stripe_yearly_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
);
```

### Subscriptions
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID,
    plan_id UUID,
    status VARCHAR(50),
    started_at TIMESTAMP,
    renews_at TIMESTAMP,
    expires_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    payment_method VARCHAR(50),
    external_subscription_id VARCHAR(255),
    amount_paid DECIMAL(8,2),
    is_trial BOOLEAN,
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP
);
```

---

## 🚨 Common Issues & Solutions

### Issue: "Stripe keys not configured"
**Solution:** Check `.env` file for correct keys from Stripe dashboard

### Issue: Webhook not firing
**Solution:** 
1. Check webhook URL is publicly accessible
2. Verify signing secret matches Stripe dashboard
3. Check webhook event subscriptions

### Issue: Subscription not syncing
**Solution:**
1. Check Stripe webhook logs in dashboard
2. Verify database migration ran successfully
3. Check error logs: `storage/logs/laravel.log`

### Issue: Checkout session fails
**Solution:**
1. Verify customer can be created (check Stripe dashboard)
2. Ensure plan has valid price
3. Check user authentication

---

## 📈 Monitoring & Analytics

### Track Conversions
Monitor checkout session creation vs completion rates in Stripe Dashboard.

### Revenue Reports
Stripe Dashboard provides detailed revenue analytics by plan and period.

### Failed Payments
Check invoice.payment_failed webhook events to identify customers with payment issues.

---

## 🔮 Future Enhancements

1. **Custom Billing Cycles** - Support quarterly, semi-annual billing
2. **Usage-Based Pricing** - Pay per API call beyond included limits
3. **Promotional Codes** - Coupon system integration
4. **Payment Method Management** - Allow users to update payment methods
5. **Invoicing** - Send and store digital invoices
6. **Refund Management** - Partial and full refund handling
7. **Multi-Currency** - Support international payments
8. **Family Plans** - Tiered team pricing

---

## 📚 Resources

- **Stripe Docs:** https://stripe.com/docs
- **Laravel Cashier:** https://laravel.com/docs/billing (alternative approach)
- **Webhook Testing:** https://stripe.com/docs/webhooks/test

---

## 🎯 Key Files Summary

| File | Purpose |
|------|---------|
| `app/Services/StripeService.php` | Stripe API operations |
| `app/Http/Controllers/SubscriptionController.php` | Subscription endpoints |
| `app/Http/Controllers/StripeWebhookController.php` | Webhook handling |
| `resources/js/pages/Subscription/Pricing.tsx` | Pricing display |
| `resources/js/pages/Profile/SubscriptionManagement.tsx` | Plan management |
| `resources/js/pages/Profile/UsageTracking.tsx` | Usage stats |
| `routes/subscriptions.php` | Subscription routes |
| `routes/stripe.php` | Stripe routes |

---

## ✅ Implementation Checklist

- [ ] Add `.env` variables for Stripe keys
- [ ] Run database migrations
- [ ] Seed subscription plans
- [ ] Configure Stripe webhooks
- [ ] Test checkout flow in test mode
- [ ] Test webhook handling with `stripe listen`
- [ ] Update user profile to include subscription & usage pages
- [ ] Test all payment scenarios
- [ ] Deploy to staging
- [ ] Final testing in production sandbox
- [ ] Switch to production keys

---

**Last Updated:** January 2024
**Version:** 1.0
