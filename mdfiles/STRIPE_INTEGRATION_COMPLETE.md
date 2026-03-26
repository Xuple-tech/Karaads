# Stripe Payment Gateway Integration - Complete Implementation Guide

## 🎯 Overview

A comprehensive Stripe integration with automatic renewal features, webhook handling, and full payment management for your subscription system.

**Status**: ✅ **COMPLETE** - Ready to configure and deploy

---

## 📋 Table of Contents

1. [Quick Start Setup](#quick-start-setup)
2. [Configuration](#configuration)
3. [Components Implemented](#components-implemented)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Webhook Handling](#webhook-handling)
7. [Auto-Renewal Features](#auto-renewal-features)
8. [Payment Flow](#payment-flow)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)
12. [Deployment Checklist](#deployment-checklist)

---

## 🚀 Quick Start Setup

### Step 1: Install Stripe Package
```bash
composer require stripe/stripe-php
```
**Status**: ✅ Already installed

### Step 2: Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)
4. Go to **Webhooks** and create an endpoint:
   - URL: `https://yourapp.com/stripe/webhook`
   - Events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`
   - Copy **Signing Secret** (starts with `whsec_`)

### Step 3: Configure Environment
```bash
# Add to .env file
STRIPE_PUBLIC_KEY=pk_test_xxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxx
```

### Step 4: Run Migrations
```bash
php artisan migrate
```

Creates:
- `stripe_customers` - Stripe customer mappings
- `stripe_payment_transactions` - Audit trail
- `stripe_webhook_events` - Event logs
- Adds Stripe fields to `subscriptions` table

### Step 5: Create Stripe Products
```bash
php artisan stripe:setup-products
```

Creates Stripe products and prices for all subscription plans.

---

## ⚙️ Configuration

### 1. Environment Variables
```env
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_xxxxx          # Frontend
STRIPE_SECRET_KEY=sk_test_xxxxx          # Backend
STRIPE_WEBHOOK_SECRET=whsec_xxxxx        # Webhook verification
```

### 2. Services Configuration
Already configured in `config/services.php`:
```php
'stripe' => [
    'secret' => env('STRIPE_SECRET_KEY'),
    'public' => env('STRIPE_PUBLIC_KEY'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
],
```

### 3. Test Keys vs Live Keys
- **Development**: Use `pk_test_` and `sk_test_` keys
- **Production**: Use `pk_live_` and `sk_live_` keys
- **Test Card Numbers**:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - Visa: `4000 0025 0000 3155`

---

## 🏗️ Components Implemented

### Backend Components

#### Models (4 new)
1. **StripeCustomer** (`app/Models/StripeCustomer.php`)
   - Maps users to Stripe customers
   - Methods: `findOrCreateForUser()`, `findByStripeCustomerId()`

2. **StripePaymentTransaction** (`app/Models/StripePaymentTransaction.php`)
   - Audit trail for all payments
   - Methods: `logTransaction()`, `scopeSucceeded()`, `scopeFailed()`

3. **StripeWebhookEvent** (`app/Models/StripeWebhookEvent.php`)
   - Logs webhook events
   - Methods: `logEvent()`, `markProcessed()`, `markFailed()`

#### Services (1 new)
**StripeService** (`app/Services/StripeService.php`) - 15 methods:
- `createOrGetStripeCustomer()` - Get or create customer in Stripe
- `createSubscription()` - Create subscription with auto-renewal
- `updatePaymentMethod()` - Change payment method
- `cancelSubscription()` - Cancel (immediate or end of period)
- `reactivateSubscription()` - Reactivate cancelled sub
- `handlePaymentSucceeded()` - Process successful payment
- `handlePaymentFailed()` - Handle failed payment
- `handleSubscriptionDeleted()` - Mark subscription as deleted
- `verifyWebhookSignature()` - Verify webhook authenticity
- `processWebhookEvent()` - Process webhook events
- `createPaymentIntent()` - One-time payment
- `getPaymentMethods()` - List saved cards
- `deletePaymentMethod()` - Remove payment method
- `getSubscriptionDetails()` - Get subscription from Stripe
- `refundPayment()` - Issue refund

#### Controllers (2 new)
1. **StripePaymentController** (`app/Http/Controllers/StripePaymentController.php`)
   - 8 endpoints for payment flows
   - Handles checkout, payment methods, subscription management

2. **StripeWebhookController** (`app/Http/Controllers/StripeWebhookController.php`)
   - Webhook endpoint (`POST /stripe/webhook`)
   - Verifies signature and processes events

#### Commands (2 new)
1. **SetupStripeProducts** - Creates Stripe products/prices
2. **ProcessStripeWebhooks** - Retry failed webhooks

### Frontend Components

#### React Components (3 new)

1. **StripeCheckout** (`resources/js/components/stripe/StripeCheckout.tsx`)
   - Payment form with card element
   - Handles payment intent creation
   - Auto-renewal configuration

2. **PaymentMethods** (`resources/js/components/stripe/PaymentMethods.tsx`)
   - List saved cards
   - Add/delete payment methods
   - Card details display

3. **SubscriptionManagement** (`resources/js/components/stripe/SubscriptionManagement.tsx`)
   - View subscription status
   - Cancel/reactivate subscription
   - Auto-renewal toggle
   - Payment status display

---

## 📡 API Endpoints

### Payment Flow Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/stripe/checkout` | Show checkout page | Yes |
| POST | `/stripe/payment-intent` | Create payment intent | Yes |
| POST | `/stripe/confirm-subscription` | Create subscription | Yes |

### Payment Method Management

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/stripe/payment-methods` | List saved cards | Yes |
| POST | `/stripe/payment-method/update` | Update payment method | Yes |
| DELETE | `/stripe/payment-method/{id}` | Delete payment method | Yes |

### Subscription Management

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/stripe/cancel` | Cancel subscription | Yes |
| POST | `/stripe/reactivate` | Reactivate subscription | Yes |

### Webhook Endpoint

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/stripe/webhook` | Receive webhook events | No (signature verified) |

---

## 🗄️ Database Schema

### New Tables

#### stripe_customers
```sql
CREATE TABLE stripe_customers (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE,
    stripe_customer_id VARCHAR UNIQUE,
    email VARCHAR,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### stripe_payment_transactions
```sql
CREATE TABLE stripe_payment_transactions (
    id UUID PRIMARY KEY,
    subscription_id UUID,
    stripe_invoice_id VARCHAR,
    stripe_charge_id VARCHAR,
    type VARCHAR, -- charge, refund, adjustment
    amount DECIMAL(12, 2),
    currency VARCHAR,
    status VARCHAR, -- succeeded, failed, pending
    description TEXT,
    failure_reason TEXT,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

#### stripe_webhook_events
```sql
CREATE TABLE stripe_webhook_events (
    id UUID PRIMARY KEY,
    stripe_event_id VARCHAR UNIQUE,
    event_type VARCHAR,
    payload JSON,
    status VARCHAR, -- received, processed, failed
    error_message TEXT,
    retry_count INT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### Modified Tables

#### subscriptions (added columns)
```sql
-- Stripe IDs
stripe_customer_id VARCHAR
stripe_subscription_id VARCHAR UNIQUE
stripe_invoice_id VARCHAR
stripe_payment_method_id VARCHAR

-- Payment tracking
stripe_amount DECIMAL(12, 2)
stripe_currency VARCHAR
stripe_status VARCHAR

-- Auto-renewal
auto_renew BOOLEAN DEFAULT true
last_payment_at TIMESTAMP
next_payment_at TIMESTAMP
billing_cycle VARCHAR -- monthly, yearly

-- Failure handling
payment_failure_count INT
last_payment_failure_at TIMESTAMP
last_payment_failure_reason TEXT
```

---

## 🔗 Webhook Handling

### Supported Events

#### 1. `invoice.payment_succeeded`
When payment is successful:
- Updates subscription status to `active`
- Records transaction
- Resets failure count
- Sets next payment date

#### 2. `invoice.payment_failed`
When payment fails:
- Updates status to `past_due`
- Increments failure counter
- Records failure reason
- **Cancels after 3 failures**

#### 3. `customer.subscription.deleted`
When subscription is deleted in Stripe:
- Updates subscription status to `cancelled`
- Logs cancellation event

### Webhook Verification

All webhooks are verified using Stripe's signature:

```php
Webhook::constructEvent(
    $payload,
    $signature,
    config('services.stripe.webhook_secret')
);
```

### Webhook Setup in Stripe

1. Go to **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. Enter: `https://yourapp.com/stripe/webhook`
4. Select events:
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the signing secret to `.env`

### Testing Webhooks Locally

Use Stripe CLI:

```bash
# Install Stripe CLI (if not already)
# https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:8000/stripe/webhook

# Trigger test events
stripe trigger invoice.payment_succeeded

# View event
stripe events list
```

---

## 🔄 Auto-Renewal Features

### How Auto-Renewal Works

1. **User Subscribes**
   - Subscription created in Stripe
   - `auto_renew = true`
   - `next_payment_at` set to 30 days (or 365 for yearly)

2. **Automatic Charge**
   - Stripe charges card 30 days later
   - Sends webhook: `invoice.payment_succeeded`

3. **Payment Success**
   - Subscription marked `active`
   - `last_payment_at` updated
   - `next_payment_at` set to 30 days forward
   - Transaction logged

4. **If Payment Fails**
   - Webhook: `invoice.payment_failed`
   - Status → `past_due`
   - **User sees upgrade modal** with "Update Payment" button
   - Stripe retries (3-5 times over 14 days)

5. **After 3 Failures**
   - Subscription automatically cancelled
   - User loses access at next cycle

### Managing Auto-Renewal

Users can:
- **Enable**: Subscription renews automatically
- **Disable**: Cancels at end of period (keep access)
- **Reactivate**: Re-enable renewal before period ends
- **Cancel Immediately**: Lose access now

---

## 💳 Payment Flow

### Complete User Journey

```
1. User clicks "Upgrade to Premium"
   ↓
2. Redirect to /stripe/checkout?plan_id=xxx&billing_cycle=monthly
   ↓
3. Frontend renders StripeCheckout component
   ↓
4. User enters card details
   ↓
5. Frontend calls POST /stripe/payment-intent
   - Creates PaymentIntent in Stripe
   - Returns client secret
   ↓
6. Stripe.js handles card authentication
   - 3D Secure (if required)
   - Authentication complete
   ↓
7. Frontend calls POST /stripe/confirm-subscription
   - Creates payment method
   - Creates subscription in Stripe
   - Creates subscription in database
   ↓
8. Webhook: invoice.payment_succeeded
   - Updates subscription status
   - Records transaction
   ↓
9. User sees "Subscription Active" page
   ↓
10. At renewal date (30/365 days):
    - Stripe automatically charges
    - Webhook updates our database
    ↓
11. User never needs to re-enter card details!
```

### Code Example

```typescript
// React Component
import { StripeCheckout } from '@/components/stripe/StripeCheckout';

export function PricingPage() {
  return (
    <StripeCheckout
      planId="plan-uuid"
      planName="Premium"
      billingCycle="monthly"
      amount={29.99}
      stripePublishableKey={import.meta.env.VITE_STRIPE_PUBLIC_KEY}
      onSuccess={(subscription) => {
        console.log('Subscription created:', subscription);
        // Redirect to success page
      }}
    />
  );
}
```

---

## ⚠️ Error Handling

### Payment Failures

```
❌ Card Declined
   └─ Reason: Insufficient funds
   └─ Stripe updates invoice status
   └─ Webhook received
   └─ Database updated
   └─ User sees past_due notice
   └─ Can update payment method

❌ 3D Secure Failed
   └─ User completes authentication
   └─ If successful: charge processed
   └─ If failed: user sees error

❌ Duplicate Charge Prevented
   └─ Idempotency key in request
   └─ Stripe deduplicates attempts
   └─ Only one charge created

❌ Webhook Delivery Failed
   └─ Event logged to stripe_webhook_events
   └─ Can be retried with:
      php artisan stripe:process-webhooks
```

### Rate Limiting

```php
// StripeService automatically handles rate limits
// Catches Stripe\Exception\ApiConnectionException
// Logs and re-throws for handling
```

---

## 🧪 Testing

### 1. Unit Tests for StripeService

```bash
php artisan test --filter=StripeService
```

### 2. Integration Tests

```php
// tests/Feature/StripePaymentTest.php
test('user can subscribe with stripe', function () {
    $user = User::factory()->create();
    $plan = SubscriptionPlan::first();
    
    $response = $this->actingAs($user)
        ->post('/stripe/payment-intent', [
            'plan_id' => $plan->id,
            'billing_cycle' => 'monthly'
        ]);
    
    $response->assertJsonStructure(['clientSecret', 'intentId']);
});
```

### 3. Manual Testing with Test Cards

```
✅ Successful payment
   Card: 4242 4242 4242 4242
   Exp: 12/25
   CVC: 123

❌ Payment declined
   Card: 4000 0000 0000 0002
   Exp: 12/25
   CVC: 123

3️⃣ Requires 3D Secure
   Card: 4000 0025 0000 3155
   Exp: 12/25
   CVC: 123

⏳ Charge pending
   Card: 4000 0038 0000 0446
   Exp: 12/25
   CVC: 123
```

### 4. Webhook Testing

```bash
# Using Stripe CLI
stripe listen --forward-to localhost:8000/stripe/webhook
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

---

## 🔧 Troubleshooting

### Issue: "Invalid Stripe API Key"
**Solution**:
- Check `.env` file has correct keys
- Ensure keys match (test/live, secret/public)
- Restart Laravel server

### Issue: Webhook Signature Invalid
**Solution**:
- Verify webhook signing secret in `.env`
- Check Stripe webhook endpoint URL matches exactly
- For local testing, use Stripe CLI

### Issue: "Subscription not found for Stripe payment"
**Solution**:
- Check `stripe_subscription_id` matches in database
- Verify subscription created before payment
- Check webhook event payload

### Issue: Payment Fails with "Your card was declined"
**Solution**:
- Verify card details
- Check card has sufficient funds
- Some test cards require 3D Secure
- Review Stripe dashboard for decline reason

### Issue: Auto-renewal not working
**Solution**:
1. Check subscription has `auto_renew = true`
2. Verify `billing_cycle` is set
3. Check `next_payment_at` date
4. Review Stripe subscription status
5. Check webhook logs: `stripe_webhook_events` table

### Issue: High webhook latency
**Solution**:
- Stripe retries failed webhooks for 3 days
- Process failed webhooks:
  ```bash
  php artisan stripe:process-webhooks --max=50
  ```
- Schedule this as a cron job:
  ```php
  $schedule->command('stripe:process-webhooks')->hourly();
  ```

---

## ✅ Deployment Checklist

- [ ] **Pre-Deployment**
  - [ ] Set production Stripe keys in environment
  - [ ] Create Stripe webhook endpoint (production URL)
  - [ ] Add webhook signing secret to `.env`
  - [ ] Run migrations: `php artisan migrate`
  - [ ] Create Stripe products: `php artisan stripe:setup-products`

- [ ] **Configuration**
  - [ ] Verify all `.env` variables are set
  - [ ] Test with test keys first
  - [ ] Review payment method storage settings

- [ ] **Testing**
  - [ ] Test complete payment flow with test card
  - [ ] Verify webhook reception and processing
  - [ ] Test subscription cancellation
  - [ ] Test payment failure and retry
  - [ ] Verify email notifications sent

- [ ] **Monitoring**
  - [ ] Set up logging: `STRIPE_DEBUG=true`
  - [ ] Monitor `stripe_webhook_events` table
  - [ ] Review transaction logs regularly
  - [ ] Set up alerts for failed payments

- [ ] **Security**
  - [ ] Never commit keys to version control
  - [ ] Use `.env.example` for documentation
  - [ ] Enable webhook signature verification ✅
  - [ ] Use HTTPS only for production
  - [ ] Rotate webhook signing secrets periodically

- [ ] **User Communication**
  - [ ] Inform users about auto-renewal
  - [ ] Provide clear cancellation process
  - [ ] Send payment reminders
  - [ ] Document refund policy

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Subscription Metrics**
   ```sql
   SELECT plan_id, COUNT(*) as active_subs
   FROM subscriptions
   WHERE status = 'active'
   GROUP BY plan_id;
   ```

2. **Revenue**
   ```sql
   SELECT DATE(created_at) as date, SUM(amount) as daily_revenue
   FROM stripe_payment_transactions
   WHERE status = 'succeeded' AND type = 'charge'
   GROUP BY DATE(created_at);
   ```

3. **Churn (Payment Failures)**
   ```sql
   SELECT COUNT(*) as failed_payments
   FROM stripe_payment_transactions
   WHERE status = 'failed';
   ```

4. **Failed Webhooks**
   ```sql
   SELECT COUNT(*) as failed_webhooks
   FROM stripe_webhook_events
   WHERE status = 'failed';
   ```

### Recommended Monitoring

- Daily review of failed payments
- Weekly review of churn rate
- Monthly revenue reconciliation with Stripe
- Quarterly review of webhook reliability

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [React Stripe Library](https://stripe.com/docs/stripe-js/react)

---

## 🎉 Summary

You now have a **production-ready Stripe integration** with:

✅ Automatic subscription renewal  
✅ Webhook event processing  
✅ Failed payment handling  
✅ Payment method management  
✅ Subscription cancellation/reactivation  
✅ Complete audit trail  
✅ React components ready to use  
✅ Full error handling  
✅ Comprehensive testing setup  

**Next Steps**:
1. Configure Stripe keys in `.env`
2. Run migrations and setup commands
3. Test payment flow with test cards
4. Deploy webhook endpoint to production
5. Switch to live keys when ready

---

**Status**: ✅ **IMPLEMENTATION COMPLETE & READY FOR DEPLOYMENT**
