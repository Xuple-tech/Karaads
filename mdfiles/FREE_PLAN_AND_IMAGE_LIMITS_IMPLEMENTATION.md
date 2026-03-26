# Free Plan & Image Generation Limits Implementation

## Overview
This implementation adds default subscription plans for all free users with image generation limits for each tier, and a UI for users who hit their limits.

## Changes Made

### 1. **Database Migration** ✅
**File**: `database/migrations/2025_01_25_add_image_limits_to_subscription_plans.php`

Added two new columns to `subscription_plans` table:
- `images_per_day` - Maximum images per day (null = unlimited)
- `images_per_month` - Maximum images per month (null = unlimited)

**Run migration with**:
```bash
php artisan migrate
```

### 2. **Model Updates** ✅
**File**: `app/Models/SubscriptionPlan.php`

- Added `images_per_day` and `images_per_month` to fillable array
- Added `hasImageLimit()` method to check if plan has image limits

### 3. **Service Layer** ✅
**File**: `app/Services/SubscriptionService.php`

#### New Method: `canGenerateImages(User $user, int $count = 1): array`
Checks if user can generate images based on their plan limits.

**Returns**:
```php
// When allowed
[
    'allowed' => true,
    'plan_id' => $planId,
    'plan_name' => $planName,
    'quota' => $quotaObject,
]

// When limit exceeded
[
    'allowed' => false,
    'reason' => 'Daily image limit exceeded', // or 'Monthly image limit exceeded'
    'limit' => 5,
    'used' => 5,
    'needed' => 1,
    'plan_id' => $planId,
    'plan_name' => 'Free',
    'reset_at' => '2025-01-26 00:00:00', // ISO datetime
    'reset_type' => 'daily', // or 'monthly'
]
```

#### Updated Plans with Image Limits:

| Plan | Images/Day | Images/Month | Monthly Price |
|------|-----------|-------------|---------------|
| **Free** | 5 | 50 | $0 |
| **Paid** | 50 | 500 | $9.99 |
| **Premium** | 200 | 2000 | $19.99 |
| **Gold** | Unlimited | Unlimited | $49.99 |

#### Updated `getUserUsageStats()`:
Now includes image limits in the returned data:
```php
'limits' => [
    'requests_per_day' => $plan->requests_per_day,
    'requests_per_month' => $plan->requests_per_month,
    'tokens_per_day' => $plan->tokens_per_day,
    'tokens_per_month' => $plan->tokens_per_month,
    'images_per_day' => $plan->images_per_day,
    'images_per_month' => $plan->images_per_month,
]
```

## Integration Guide

### 1. **Check Limits Before Image Generation**
In your image generation controller/service:

```php
<?php
use App\Services\SubscriptionService;

class ImageGenerationController {
    public function generate(Request $request)
    {
        $user = auth()->user();
        $subscriptionService = app(SubscriptionService::class);
        
        // Check if user can generate images
        $canGenerate = $subscriptionService->canGenerateImages($user, count: 1);
        
        if (!$canGenerate['allowed']) {
            return response()->json([
                'success' => false,
                'error' => $canGenerate['reason'],
                'limit_data' => $canGenerate, // Pass to frontend for UI
            ], 429); // Too Many Requests
        }
        
        // Generate image...
        
        // Record the generation
        $subscriptionService->recordImageGeneration($user, count: 1);
    }
}
```

### 2. **Frontend: Limit Exceeded Modal**

**Component**: `resources/js/components/LimitExceededModal.tsx`

```tsx
import React from 'react';
import { AlertCircle, Clock, Zap } from 'lucide-react';

interface LimitExceededModalProps {
  isOpen: boolean;
  limitData: {
    reason: string;
    limit: number;
    used: number;
    reset_at: string;
    reset_type: 'daily' | 'monthly';
    plan_name: string;
  };
  onClose: () => void;
  onUpgrade: () => void;
}

export function LimitExceededModal({
  isOpen,
  limitData,
  onClose,
  onUpgrade,
}: LimitExceededModalProps) {
  if (!isOpen) return null;

  const resetDate = new Date(limitData.reset_at);
  const resetLabel = 
    limitData.reset_type === 'daily' 
      ? `tomorrow at ${resetDate.toLocaleTimeString()}`
      : `on ${resetDate.toLocaleDateString()}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">Image Generation Limit Reached</h2>
        </div>

        <p className="text-gray-600 mb-4">
          You've used all {limitData.limit} images allowed for this {limitData.reset_type}.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Your limit will reset {resetLabel}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Current plan: <strong>{limitData.plan_name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-4 h-4" />
            Upgrade Plan
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition"
          >
            OK, I'll Wait
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          💡 Pro tip: Upgrade to <strong>Premium</strong> for 200 images/day or <strong>Gold</strong> for unlimited!
        </p>
      </div>
    </div>
  );
}
```

### 3. **Usage in Image Generation Component**

```tsx
import { LimitExceededModal } from '@/components/LimitExceededModal';
import axios from 'axios';

export function ImageGenerator() {
  const [limitExceededModal, setLimitExceededModal] = React.useState({
    open: false,
    data: null,
  });

  const handleGenerateImage = async (prompt: string) => {
    try {
      const response = await axios.post('/api/images/generate', { prompt });
      
      if (response.data.success) {
        // Image generated successfully
        setImage(response.data.image_url);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        // Limit exceeded
        setLimitExceededModal({
          open: true,
          data: error.response.data.limit_data,
        });
      }
    }
  };

  return (
    <>
      {/* Your image generator UI */}
      
      <LimitExceededModal
        isOpen={limitExceededModal.open}
        limitData={limitExceededModal.data}
        onClose={() => setLimitExceededModal({ open: false, data: null })}
        onUpgrade={() => {
          window.location.href = '/subscription/plans';
        }}
      />
    </>
  );
}
```

## Default Plans for Existing Users

When users have no active subscription, they automatically get the **Free plan** through:

**File**: `app/Models/Subscription.php`

Method: `getCurrentSubscriptionForUser($userId)`

```php
// Returns a free subscription if no active subscription exists
$freePlan = SubscriptionPlan::getFreePlan();
if ($freePlan) {
    return self::firstOrCreate(
        [
            'user_id' => $userId,
            'plan_id' => $freePlan->id,
            'status' => 'active',
        ],
        [
            'started_at' => now(),
        ]
    );
}
```

## Next Steps

1. **Run migration**:
   ```bash
   php artisan migrate
   ```

2. **Reset default plans** (if needed):
   ```bash
   php artisan subscription:create-defaults --force
   ```

3. **Create image generation endpoint** that uses `canGenerateImages()` check

4. **Add the LimitExceededModal component** to your image generation UI

5. **Update your image generation logic** to:
   - Check limits before generation
   - Return proper error response (429 status)
   - Pass limit data to frontend

## Usage Statistics

Users can check their image generation usage via:

```php
$stats = $subscriptionService->getUserUsageStats($user);

// Returns:
[
    'today' => [
        'images' => 3, // Images generated today
    ],
    'monthly' => [
        'images' => 45, // Images generated this month
    ],
    'limits' => [
        'images_per_day' => 5,
        'images_per_month' => 50,
    ],
]
```

## Rate Limit Violations Logging

All limit violations are automatically logged in the `rate_limit_violations` table for monitoring:

```php
// Automatically recorded when limit exceeded:
RateLimitViolation::logViolation(
    $user->id,
    $plan->id,
    'images_per_day',
    $plan->images_per_day,
    $attempted_value,
    'Description'
);
```

## Testing

```bash
# Test free user generating images
php artisan tinker
> $user = User::first();
> app(SubscriptionService::class)->canGenerateImages($user, 6);

# Should return limit exceeded error since free plan allows only 5/day
```

## Summary

✅ **Implemented**:
- Image generation limits per plan tier
- Default free plan for all users
- Limit checking service method
- Usage statistics with image limits
- Rate limit violation logging

✅ **Ready to integrate**:
- Frontend limit exceeded modal component
- Image generation endpoint that checks limits
- Plan upgrade redirect

✅ **Flexible**:
- Easy to adjust image limits per plan
- Easy to add new plan tiers
- Automatic fallback to free plan for users without active subscription
