# Stripe Integration - 5 Minute Setup

## ⚡ Quick Setup (5 steps)

### 1️⃣ Get Stripe Keys (2 min)
```
1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API keys"
3. Copy:
   - Publishable Key (pk_test_...)
   - Secret Key (sk_test_...)
4. Go to "Webhooks" → "Add endpoint"
   - URL: https://yourapp.com/stripe/webhook
   - Events: invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted
5. Copy Webhook Secret (whsec_...)
```

### 2️⃣ Configure Environment (1 min)
```bash
# Add to .env file:
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3️⃣ Run Migrations (1 min)
```bash
php artisan migrate
```

### 4️⃣ Setup Stripe Products (1 min)
```bash
php artisan stripe:setup-products
```

### 5️⃣ Test Payment (depends on testing)
```bash
# Use test card: 4242 4242 4242 4242
# Exp: 12/25, CVC: 123
```

**Done!** Your Stripe integration is ready.

---

## 🎯 What's Included

✅ **Automatic renewal** - No manual intervention needed  
✅ **Webhook handling** - Automatic payment processing  
✅ **Payment methods** - Save and manage cards  
✅ **Subscription management** - Cancel/reactivate anytime  
✅ **Error handling** - Automatic retries on failure  
✅ **Audit trail** - Complete transaction history  
✅ **React components** - Ready-to-use UI  

---

## 📍 Files Created

### Backend
- `app/Models/StripeCustomer.php` - Customer mappings
- `app/Models/StripePaymentTransaction.php` - Transaction logs
- `app/Models/StripeWebhookEvent.php` - Webhook events
- `app/Services/StripeService.php` - Payment logic (15 methods)
- `app/Http/Controllers/StripePaymentController.php` - Payment endpoints
- `app/Http/Controllers/StripeWebhookController.php` - Webhook handler
- `app/Console/Commands/SetupStripeProducts.php` - Product setup
- `app/Console/Commands/ProcessStripeWebhooks.php` - Webhook retry
- `routes/stripe.php` - All Stripe routes

### Frontend
- `resources/js/components/stripe/StripeCheckout.tsx` - Payment form
- `resources/js/components/stripe/PaymentMethods.tsx` - Card management
- `resources/js/components/stripe/SubscriptionManagement.tsx` - Subscription control

### Config & Migration
- `config/stripe.php` - Configuration
- `database/migrations/2025_01_22_000001_add_stripe_fields_to_subscriptions.php`

---

## 🔌 API Endpoints

### Payment
- `POST /stripe/payment-intent` - Create payment
- `POST /stripe/confirm-subscription` - Confirm subscription
- `GET /stripe/checkout` - Show checkout page

### Cards
- `GET /stripe/payment-methods` - List cards
- `POST /stripe/payment-method/update` - Update card
- `DELETE /stripe/payment-method/{id}` - Delete card

### Subscriptions
- `POST /stripe/cancel` - Cancel subscription
- `POST /stripe/reactivate` - Reactivate subscription

### Webhook
- `POST /stripe/webhook` - Stripe events (no auth)

---

## 💡 Usage Examples

### React Component
```typescript
import { StripeCheckout } from '@/components/stripe/StripeCheckout';

<StripeCheckout
  planId="plan-uuid"
  planName="Premium"
  billingCycle="monthly"
  amount={29.99}
  stripePublishableKey={process.env.VITE_STRIPE_PUBLIC_KEY}
  onSuccess={(subscription) => {
    window.location.href = '/dashboard';
  }}
/>
```

### Cancel Subscription
```typescript
import axios from 'axios';

await axios.post('/stripe/cancel', {
  immediate: false // Cancel at end of period
});
```

---

## 🧪 Test Cards

| Type | Card | Status |
|------|------|--------|
| Success | 4242 4242 4242 4242 | ✅ Charged |
| Decline | 4000 0000 0000 0002 | ❌ Declined |
| 3D Secure | 4000 0025 0000 3155 | 🔐 Auth required |

---

## ⚙️ Auto-Renewal How It Works

```
1. User subscribes
   ↓
2. Stripe charges card every 30 days (or yearly)
   ↓
3. Webhook notifies your app
   ↓
4. Database automatically updated
   ↓
5. User never sees payment form again!
```

If payment fails:
- Stripe retries (3-5 times over 14 days)
- You get notified immediately
- After 3 failures, subscription cancelled

---

## 🔧 Common Tasks

### View Failed Payments
```bash
SELECT * FROM stripe_payment_transactions WHERE status = 'failed';
```

### View Webhook Logs
```bash
SELECT * FROM stripe_webhook_events WHERE status = 'failed';
```

### Retry Failed Webhooks
```bash
php artisan stripe:process-webhooks --max=50
```

### Check Subscription Status
```bash
SELECT * FROM subscriptions WHERE stripe_subscription_id IS NOT NULL;
```

---

## 🚨 Troubleshooting

**Q: "Invalid Stripe API Key"**  
A: Check `.env` has correct keys, restart server

**Q: "Webhook Signature Invalid"**  
A: Verify webhook URL in Stripe matches exactly, use Stripe CLI for local testing

**Q: "Payment not showing in database"**  
A: Check webhook logs in `stripe_webhook_events` table

**Q: "Auto-renewal not working"**  
A: Check `auto_renew = true` in subscriptions table

---

## 📋 Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Test complete payment flow
- [ ] Configure webhook endpoint (production URL)
- [ ] Run migrations on production
- [ ] Create Stripe products
- [ ] Test webhook receipt
- [ ] Monitor failed payments
- [ ] Set up alerts for errors

---

## 📖 Full Documentation

See **STRIPE_INTEGRATION_COMPLETE.md** for:
- Detailed configuration
- Database schema
- All 15 StripeService methods
- Webhook events reference
- Error handling guide
- Advanced testing
- Deployment checklist

---

**Status**: ✅ Ready to use!

Next: Add Stripe keys to `.env` and run migrations.
