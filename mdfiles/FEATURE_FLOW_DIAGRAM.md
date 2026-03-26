# Feature Flow Diagram: Free Plans & Image Generation Limits

## 🔄 User Journey: Image Generation with Limits

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER STARTS IMAGE GENERATION                 │
│                          (Button Click)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   Frontend: LimitExceededModal Open    │
        │   User enters prompt & clicks "Generate"
        └─────────────────┬──────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │   POST /api/images/generate            │
        │   {                                    │
        │     "prompt": "A sunset...",          │
        │     "count": 1                        │
        │   }                                    │
        └─────────────────┬──────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────┐
  │  ImageGenerationLimitExampleController::generate  │
  │  1. Validate request                             │
  │  2. Get authenticated user                       │
  └──────────────────┬───────────────────────────────┘
                     │
                     ▼
  ┌────────────────────────────────────────────────────┐
  │ SubscriptionService::canGenerateImages($user, 1) │
  │  (⭐ KEY STEP - Limit Checking)                   │
  └──────────────────┬───────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   [ALLOWED]                 [DENIED]
        │                         │
        │                         ▼
        │         ┌──────────────────────────────┐
        │         │  Check Daily Limit           │
        │         │  Exceeded? Return {          │
        │         │    allowed: false,           │
        │         │    reason: "Daily limit...", │
        │         │    limit: 5,                 │
        │         │    used: 5,                  │
        │         │    reset_at: "2025-01-26...",
        │         │    reset_type: "daily"      │
        │         │  }                           │
        │         └────────────┬─────────────────┘
        │                      │
        │                      ▼
        │         ┌────────────────────────────┐
        │         │ OR Check Monthly Limit     │
        │         │ If exceeded, similar...    │
        │         └────────────┬────────────────┘
        │                      │
        ▼                      ▼
  ┌────────────────┐   ┌──────────────────────┐
  │ Generate Image │   │ Return 429 Response  │
  │ from API       │   │ with limit_data      │
  │ (OpenAI, etc) │   └────────────┬──────────┘
  └────────────┬───┘               │
               │                   ▼
               │         ┌────────────────────────┐
               │         │ Frontend Catches 429   │
               │         │ Opens LimitExceededModal
               │         │ Shows:                 │
               │         │  • Limit: 5           │
               │         │  • Used: 5            │
               │         │  • Reset: Tomorrow 12AM
               │         │  • Time remaining: 5h │
               │         │  • 2 Buttons:         │
               │         │    - Upgrade Plan     │
               │         │    - I'll Wait        │
               │         └────────────┬─────────┘
               │                      │
               │                      ├─────────────────┐
               │                      │                 │
               │                      ▼                 ▼
               │              [UPGRADE]         [WAIT FOR RESET]
               │                      │                 │
               │                      ▼                 ▼
               │         window.location.href   Modal closes
               │         = '/subscription/plans' User waits
               │                      │
               ▼                      ▼
        ┌──────────────────────────────────────┐
        │  Store image in database             │
        │  INSERT into image_generations       │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Record usage                        │
        │  recordImageGeneration($user, 1)     │
        │  Updates usage_quotas table          │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Return 200 Success Response         │
        │  {                                   │
        │    "success": true,                 │
        │    "images": ["image_url"],         │
        │    "usage": {                       │
        │      "generated": 1,                │
        │      "plan": "Free"                 │
        │    }                                │
        │  }                                   │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Frontend displays image             │
        │  Shows: "1 of 5 images used today"  │
        └──────────────────────────────────────┘
```

## 📊 Database Schema Flow

```
┌──────────────────────────┐
│   subscription_plans     │
├──────────────────────────┤
│ id (uuid)               │
│ name: "Free"            │
│ slug: "free"            │
│ monthly_price: 0        │
│ requests_per_day: 50    │
│ requests_per_month: 500 │
│ tokens_per_day: 10000   │
│ tokens_per_month: 100K  │
│ images_per_day: 5  ⭐   │ NEW!
│ images_per_month: 50 ⭐ │ NEW!
│ created_at              │
└────────┬─────────────────┘
         │
         │ (1:N)
         │
         ▼
┌──────────────────────────┐
│     subscriptions        │
├──────────────────────────┤
│ id (uuid)               │
│ user_id (uuid)          │ ◄──┐
│ plan_id (uuid)          │ ──►┘
│ status: "active"        │
│ started_at              │
│ renews_at               │
│ created_at              │
└────────┬─────────────────┘
         │
         │ (1:N)
         │
         ▼
┌──────────────────────────────┐
│      usage_quotas            │
├──────────────────────────────┤
│ id (uuid)                   │
│ user_id (uuid)              │
│ plan_id (uuid)              │
│ date                        │
│ requests_used: 0            │
│ tokens_used: 0              │
│ images_generated: 5  ⭐     │ TRACKED!
│ voice_messages: 0           │
│ emails_processed: 0         │
│ created_at                  │
└──────────────────────────────┘

         ▲
         │ (1:N)
         │
         └─────────────────┐
                           │
                    ┌──────────────────────────┐
                    │  image_generations       │
                    ├──────────────────────────┤
                    │ id                      │
                    │ user_id (uuid)          │
                    │ prompt: "A sunset..."   │
                    │ image_url               │
                    │ created_at              │
                    └──────────────────────────┘

         ▲
         │ (on limit exceeded)
         │
         └─────────────────┐
                           │
              ┌────────────────────────────────────┐
              │  rate_limit_violations             │
              ├────────────────────────────────────┤
              │ id (uuid)                         │
              │ user_id (uuid)                    │
              │ plan_id (uuid)                    │
              │ type: "images_per_day"            │
              │ limit_value: 5                    │
              │ attempted_value: 6  ⭐            │ LOGGED!
              │ description: "Limit exceeded"    │
              │ created_at                       │
              └────────────────────────────────────┘
```

## 🔄 State Machine: Subscription & Limits

```
                    ┌─────────────────────┐
                    │  New User Created   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Subscription:    │      │ Subscription:    │
        │ FREE PLAN        │      │ PAID/PREMIUM/GOLD
        │ status: active   │      │ status: active   │
        │ is_trial: false  │      │ is_trial: false  │
        │ images_per_day:5 │      │ images/day: 50+  │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
       ┌─────────┴─────────┐      ┌────────┴────────┐
       │                   │      │                 │
       ▼                   ▼      ▼                 ▼
  [DAILY LIMIT]   [MONTHLY LIMIT] [DAILY LIMIT]  [MORE FEATURES]
  5 images/day    50/month        50+/day         Unlimited after Gold
  
       │                   │      │                 │
       └─────────┬─────────┘      └────────┬────────┘
                 │ (Upgrade)              │
                 │                        │
                 └────────────┬───────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Upgraded Plan    │
                    │ Old sub: cancelled
                    │ New sub: active   │
                    │ New limits       │
                    └──────────────────┘
```

## 🎯 Service Method Flow: canGenerateImages()

```
canGenerateImages(user, count=1)
    │
    ├─1: Get user's plan
    │   └─► SubscriptionService::getUserPlan($user)
    │       └─► Subscription::getCurrentSubscriptionForUser()
    │           └─► Free plan if none exists
    │
    ├─2: Check if plan has limits
    │   └─► if (!$plan->images_per_day && !$plan->images_per_month)
    │       └─► return { allowed: true } // Unlimited plan
    │
    ├─3: Get today's usage quota
    │   └─► UsageQuota::getOrCreateTodayQuota()
    │
    ├─4: Check daily limit
    │   └─► if ($quota->images_generated + $count > $plan->images_per_day)
    │       └─► Log violation
    │       └─► return { allowed: false, reason, limit, used, reset_at, reset_type }
    │
    ├─5: Check monthly limit
    │   └─► UsageQuota::getAggregatedMonthlyUsage()
    │       └─► if ($monthly + $count > $plan->images_per_month)
    │           └─► Log violation
    │           └─► return { allowed: false, ... }
    │
    └─6: All checks passed
        └─► return { allowed: true, plan_id, plan_name, quota }
```

## 🧠 Decision Logic: Should User Generate?

```
                    START
                      │
                      ▼
            ┌─────────────────────┐
            │ User authenticated? │
            └──────┬──────────────┘
                   │ Yes
                   ▼
        ┌──────────────────────┐
        │ Has active           │
        │ subscription?        │
        └──────┬───────────────┘
               │ No ──────────────┐
               │                  ▼
               │         ┌─────────────────────┐
               │         │ Assign FREE plan    │
               │         └────────┬────────────┘
               │                  │
               ▼ Yes              │
        ┌──────────────────────────────┐
        │ Get user's plan              │◄─┘
        │ (Free/Paid/Premium/Gold)     │
        └──────┬───────────────────────┘
               │
               ▼
        ┌──────────────────────┐
        │ Plan has limits?     │
        └──────┬───────────────┘
               │ Yes
               ▼
        ┌──────────────────────┐
        │ Check daily quota    │
        │ used + count > limit?│
        └──────┬───────────────┘
               │ No
               ▼
        ┌──────────────────────┐
        │ Check monthly quota  │
        │ used + count > limit?│
        └──────┬───────────────┘
               │ No
               ▼
        ┌──────────────────────┐
        │ ✅ ALLOW GENERATION  │
        │ Record usage         │
        │ Return 200 + image   │
        └──────────────────────┘
        
        
        (Any "Yes" above) ──────┐
                                ▼
                        ┌──────────────────────┐
                        │ ❌ DENY GENERATION   │
                        │ Return 429           │
                        │ + Limit data for UI  │
                        │                      │
                        │ Show Modal:          │
                        │ - Reset time         │
                        │ - Upgrade button     │
                        │ - Wait button        │
                        └──────────────────────┘
```

## 📱 Frontend Component: LimitExceededModal Props

```
LimitExceededModal
│
├─ Props:
│  ├─ isOpen: boolean
│  ├─ limitData: {
│  │  ├─ reason: string
│  │  ├─ limit: number
│  │  ├─ used: number
│  │  ├─ reset_at: ISO DateTime
│  │  ├─ reset_type: 'daily' | 'monthly'
│  │  └─ plan_name: string
│  ├─ onClose: () => void
│  └─ onUpgrade: () => void
│
├─ Displays:
│  ├─ Header: "Daily/Monthly Limit Reached"
│  ├─ Progress: "5 of 5 images generated"
│  ├─ Progress Bar: 100% filled
│  ├─ Reset Time: "Tomorrow at 12:00 AM"
│  ├─ Time Remaining: "5h 24m remaining"
│  ├─ Current Plan: "Free"
│  ├─ Plan Suggestions:
│  │  ├─ Paid: 50 images/day
│  │  ├─ Premium: 200 images/day
│  │  └─ Gold: Unlimited
│  │
│  └─ Actions:
│     ├─ [Upgrade My Plan] → /subscription/plans
│     └─ [I'll Wait for Reset] → onClose()
│
└─ Styling:
   ├─ Backdrop: Black 50% opacity
   ├─ Modal: White bg, rounded corners
   ├─ Status colors: Amber/Blue
   ├─ Animations: Fade-in, scale
   └─ Responsive: Mobile-optimized
```

## 🔗 Complete Integration Map

```
FRONTEND                    BACKEND                    DATABASE
─────────────────────────   ─────────────────────────   ─────────

User Clicks                 ImageGenerationController  subscriptions
  "Generate"    ────────►    ::generate()              subscription_plans
    │                            │
    │                            ▼
    │                      SubscriptionService
    │                        ::canGenerateImages()
    │                            │
    │                            ├─► Get plan
    │                            │    └─► subscriptions.plan_id
    │                            │         └─► subscription_plans.images_per_day
    │                            │
    │                            └─► Check usage_quotas
    │                                 └─► images_generated
    │
    ├────Check result◄──────────────┘
    │
    ├─Status 200?
    │   │ Yes
    │   └─► Display image
    │
    └─Status 429?
        │ Yes
        └─► LimitExceededModal
            ├─ Parse limitData
            ├─ Show reset time
            ├─ Show plan options
            │
            └─ User clicks
                ├─ "Upgrade" ──► /subscription/plans
                └─ "Wait" ──────► Close modal
```

## ⏱️ Timeline: User Flow

```
1. 00:00 - User generates first image
   └─► usage_quotas.images_generated = 1

2. 12:30 - User generates 2nd image
   └─► usage_quotas.images_generated = 2

3. 15:45 - User generates 3rd image
   └─► usage_quotas.images_generated = 3

4. 18:20 - User generates 4th image
   └─► usage_quotas.images_generated = 4

5. 22:10 - User generates 5th image
   └─► usage_quotas.images_generated = 5

6. 23:55 - User tries to generate 6th image
   ├─► canGenerateImages() checks:
   │    ├─ Daily limit: 5
   │    ├─ Used: 5
   │    ├─ Attempted: 6
   │    └─► EXCEEDED!
   │
   ├─► Log violation to rate_limit_violations
   │
   └─► Return 429 with:
       ├─ reason: "Daily image limit exceeded"
       ├─ limit: 5
       ├─ used: 5
       ├─ reset_at: "Next day 00:00"
       └─ reset_type: "daily"

7. 23:56 - Frontend shows LimitExceededModal
   └─► User sees:
       ├─ "Your daily limit is 5 images"
       ├─ "You've used all 5 images today"
       ├─ "Resets tomorrow at 12:00 AM"
       ├─ "5m remaining"
       ├─ Button: "Upgrade My Plan"
       └─ Button: "I'll Wait for Reset"

8. 00:00 (Next day) - Daily reset
   └─► usage_quotas counter resets for new day
       └─► User can generate 5 more images
```

This comprehensive flow shows exactly how the system works from user action to database storage!
