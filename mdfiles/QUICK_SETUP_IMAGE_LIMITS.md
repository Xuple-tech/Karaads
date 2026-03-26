# Quick Setup: Image Generation Limits & Free Plans

## 🚀 Quick Start (5 minutes)

### Step 1: Run Migration
```bash
php artisan migrate
```

This adds `images_per_day` and `images_per_month` columns to subscription_plans table.

### Step 2: Create Default Plans (if not exists)
```bash
php artisan subscription:create-defaults
```

Creates Free, Paid, Premium, and Gold plans with image limits.

### Step 3: Add API Route for Image Generation

**File**: `routes/api.php`

```php
use App\Http\Controllers\ImageGenerationLimitExampleController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/images/generate', [ImageGenerationLimitExampleController::class, 'generate']);
    Route::get('/images/usage', [ImageGenerationLimitExampleController::class, 'getUsage']);
    Route::get('/plans', [ImageGenerationLimitExampleController::class, 'getAvailablePlans']);
});
```

### Step 4: Add Modal Component to Your Image Generator

```tsx
import { LimitExceededModal } from '@/components/LimitExceededModal';
import axios from 'axios';

export function ImageGenerator() {
  const [limitExceeded, setLimitExceeded] = useState({ open: false, data: null });

  const handleGenerate = async (prompt: string) => {
    try {
      const res = await axios.post('/api/images/generate', { prompt, count: 1 });
      setImages(res.data.images);
    } catch (error) {
      if (error.response?.status === 429) {
        setLimitExceeded({ 
          open: true, 
          data: error.response.data.limit_data 
        });
      }
    }
  };

  return (
    <>
      {/* Your image generator UI */}
      
      <LimitExceededModal
        isOpen={limitExceeded.open}
        limitData={limitExceeded.data}
        onClose={() => setLimitExceeded({ open: false, data: null })}
        onUpgrade={() => window.location.href = '/subscription/plans'}
      />
    </>
  );
}
```

## 📋 Plan Limits

| Plan | Daily | Monthly | Price |
|------|-------|---------|-------|
| 🆓 Free | 5 | 50 | $0 |
| 💰 Paid | 50 | 500 | $9.99 |
| ⭐ Premium | 200 | 2000 | $19.99 |
| 🏆 Gold | ∞ | ∞ | $49.99 |

## 🔧 API Usage

### Check if User Can Generate
```php
$service = app(SubscriptionService::class);
$check = $service->canGenerateImages($user, count: 1);

if ($check['allowed']) {
    // Proceed with generation
} else {
    // Return 429 with $check data
}
```

### Record Usage
```php
$service->recordImageGeneration($user, count: 1);
```

### Get User Stats
```php
$stats = $service->getUserUsageStats($user);
echo $stats['today']['images'];     // 3
echo $stats['limits']['images_per_day']; // 5
```

## 🎨 Response Format

### Success (200)
```json
{
  "success": true,
  "images": ["url1", "url2"],
  "usage": {
    "generated": 2,
    "plan": "Free"
  }
}
```

### Limit Exceeded (429)
```json
{
  "success": false,
  "error": "Daily image limit exceeded",
  "limit_data": {
    "reason": "Daily image limit exceeded",
    "limit": 5,
    "used": 5,
    "reset_at": "2025-01-26T00:00:00Z",
    "reset_type": "daily",
    "plan_name": "Free"
  }
}
```

## 🧪 Testing

### Check Plan Limits
```bash
php artisan tinker
> $user = User::first();
> app(SubscriptionService::class)->canGenerateImages($user, 1);
```

### Check User Stats
```bash
> app(SubscriptionService::class)->getUserUsageStats($user);
```

### View Available Plans
```bash
> SubscriptionPlan::getActivePlans()->pluck(['name', 'images_per_day', 'images_per_month']);
```

## 📁 Files Modified

- ✅ `app/Models/SubscriptionPlan.php` - Added fillable fields & methods
- ✅ `app/Services/SubscriptionService.php` - Added `canGenerateImages()` method & updated plans
- ✅ `database/migrations/2025_01_25_add_image_limits_to_subscription_plans.php` - New migration
- ✅ `resources/js/components/LimitExceededModal.tsx` - New frontend component
- ✅ `app/Http/Controllers/ImageGenerationLimitExampleController.php` - Example controller

## 🔄 Default Free Plan for Existing Users

When a user without an active subscription tries to use the system, they're automatically assigned the Free plan:

```php
// app/Models/Subscription.php
Subscription::getCurrentSubscriptionForUser($userId);
// Returns free subscription if none exists
```

**This happens automatically** - no manual action needed!

## 🎯 Common Use Cases

### Scenario 1: User hits daily limit
1. System returns 429 with limit data
2. Frontend shows modal with "Reset tomorrow at 12:00 AM"
3. User can upgrade or wait

### Scenario 2: User hits monthly limit
1. System returns 429 with limit data
2. Frontend shows modal with "Reset on Feb 1st"
3. User can upgrade or wait

### Scenario 3: Gold plan user (unlimited)
1. Check passes immediately
2. No limit checking needed
3. User can generate unlimited images

## 🚨 Troubleshooting

### Images still generating after hitting limit
- Make sure to call `canGenerateImages()` BEFORE generation
- Check that API returns 429 status code
- Verify frontend is catching and handling 429 status

### Users don't have free plan
- Run `php artisan subscription:create-defaults`
- Check that free plan exists: `SubscriptionPlan::where('slug', 'free')->exists()`

### Modal not showing
- Check that limit_data is being passed from API
- Verify LimitExceededModal component is imported
- Check browser console for JavaScript errors

## 💡 Pro Tips

1. **Cache stats** - User stats are read-only, consider caching
2. **Batch operations** - Support `count` parameter for batch generations
3. **Pre-flight check** - Show remaining images in UI before user starts
4. **Rate limiting** - Combine with request rate limiting for extra protection
5. **Monitoring** - Check `rate_limit_violations` table for abuse patterns

## 📊 Monitoring

```bash
# See limit violations
SELECT * FROM rate_limit_violations WHERE user_id = ?;

# See usage today
SELECT * FROM usage_quotas WHERE date = TODAY();

# See top users by usage
SELECT user_id, SUM(images_generated) as total 
FROM usage_quotas 
GROUP BY user_id 
ORDER BY total DESC;
```

## ✅ Done!

You now have a complete free plan system with image generation limits!

Users automatically get:
- Free tier with 5 images/day
- Clear UI when they hit limits
- Option to upgrade or wait for reset
- Full usage tracking and analytics
