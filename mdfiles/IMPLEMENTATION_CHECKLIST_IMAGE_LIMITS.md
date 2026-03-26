# Implementation Checklist: Image Generation Limits & Free Plans

## ✅ Phase 1: Database Setup

### Database Migration
- [ ] Verify migration file exists: `database/migrations/2025_01_25_add_image_limits_to_subscription_plans.php`
- [ ] Run migration: `php artisan migrate`
- [ ] Verify columns added to `subscription_plans` table:
  ```sql
  SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME='subscription_plans' 
  AND COLUMN_NAME IN ('images_per_day', 'images_per_month');
  ```
- [ ] Confirm both columns are nullable and type INT
- [ ] Verify no migration errors in logs

### Check Database State
```bash
php artisan tinker
> Schema::hasColumn('subscription_plans', 'images_per_day')
> Schema::hasColumn('subscription_plans', 'images_per_month')
# Should return true for both
```

## ✅ Phase 2: Backend Implementation

### Model Updates
- [ ] Verify `SubscriptionPlan.php` contains:
  - `images_per_day` in `$fillable` array
  - `images_per_month` in `$fillable` array
  - `hasImageLimit()` method exists
- [ ] Test in tinker:
  ```bash
  > $plan = SubscriptionPlan::find('plan-id');
  > $plan->images_per_day
  > $plan->hasImageLimit()
  ```

### Service Updates
- [ ] Verify `SubscriptionService.php` contains:
  - `canGenerateImages()` method (NEW)
  - Updated `createDefaultPlans()` with image limits
  - Updated `getUserUsageStats()` returns image limits
- [ ] Verify method signatures:
  ```php
  public function canGenerateImages(User $user, int $count = 1): array
  public function getUserUsageStats(User $user): array
  ```
- [ ] Test service methods:
  ```bash
  php artisan tinker
  > $user = User::first();
  > $service = app(SubscriptionService::class);
  > $service->canGenerateImages($user, 1);
  > $service->getUserUsageStats($user);
  ```

### Default Plans Setup
- [ ] Run: `php artisan subscription:create-defaults`
- [ ] Verify plans created:
  ```bash
  > SubscriptionPlan::all()->pluck(['name', 'slug', 'images_per_day', 'images_per_month']);
  
  Expected output:
  - Free: 5, 50
  - Paid: 50, 500
  - Premium: 200, 2000
  - Gold: null, null
  ```
- [ ] Verify free plan features array includes image generation

## ✅ Phase 3: API Endpoints

### Create Routes
- [ ] Add to `routes/api.php`:
  ```php
  Route::middleware('auth:sanctum')->group(function () {
      Route::post('/images/generate', 
          [ImageGenerationLimitExampleController::class, 'generate']);
      Route::get('/images/usage', 
          [ImageGenerationLimitExampleController::class, 'getUsage']);
      Route::get('/plans', 
          [ImageGenerationLimitExampleController::class, 'getAvailablePlans']);
  });
  ```
- [ ] Verify controller exists: `app/Http/Controllers/ImageGenerationLimitExampleController.php`
- [ ] Test routes exist:
  ```bash
  php artisan route:list | grep images
  php artisan route:list | grep plans
  ```

### Test API Endpoints
- [ ] Create auth token for test user:
  ```bash
  php artisan tinker
  > $user = User::first();
  > $token = $user->createToken('test')->plainTextToken;
  ```

- [ ] Test GET /images/usage:
  ```bash
  curl -H "Authorization: Bearer {token}" http://localhost:8000/api/images/usage
  # Should return usage stats with limits
  ```

- [ ] Test GET /plans:
  ```bash
  curl -H "Authorization: Bearer {token}" http://localhost:8000/api/plans
  # Should return all active plans with image limits
  ```

- [ ] Test POST /images/generate (should fail with limit):
  ```bash
  curl -X POST \
    -H "Authorization: Bearer {token}" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test","count":1}' \
    http://localhost:8000/api/images/generate
  ```

## ✅ Phase 4: Limit Checking Verification

### Test Limit Checking Logic
- [ ] Free user generates 5 images → Should succeed
- [ ] Free user generates 6th image → Should fail with 429
- [ ] Response should contain:
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

### Test Limit Exceptions
- [ ] Test monthly limit separately
- [ ] Test with different plan (Paid with 50/day)
- [ ] Test with Gold plan (unlimited - should always pass)
- [ ] Test error logging:
  ```bash
  > RateLimitViolation::latest()->first();
  # Should show last violation
  ```

## ✅ Phase 5: Frontend Component

### Component Files
- [ ] Verify component exists: `resources/js/components/LimitExceededModal.tsx`
- [ ] Verify component imports:
  ```tsx
  import { AlertCircle, Clock, Zap } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  ```
- [ ] Verify component exports properly
- [ ] Check for TypeScript errors:
  ```bash
  npm run types # or tsc --noEmit
  ```

### Component Props
- [ ] Verify all required props:
  - `isOpen: boolean`
  - `limitData: object`
  - `onClose: function`
  - `onUpgrade: function`
- [ ] Test component rendering with sample data:
  ```tsx
  <LimitExceededModal
    isOpen={true}
    limitData={{
      reason: 'Daily image limit exceeded',
      limit: 5,
      used: 5,
      reset_at: new Date().toISOString(),
      reset_type: 'daily',
      plan_name: 'Free'
    }}
    onClose={() => {}}
    onUpgrade={() => {}}
  />
  ```

## ✅ Phase 6: Frontend Integration

### Add to Image Generator Component
- [ ] Import modal component:
  ```tsx
  import { LimitExceededModal } from '@/components/LimitExceededModal';
  ```
- [ ] Add state for limit modal:
  ```tsx
  const [limitExceeded, setLimitExceeded] = useState({ 
    open: false, 
    data: null 
  });
  ```
- [ ] Render modal in JSX:
  ```tsx
  <LimitExceededModal
    isOpen={limitExceeded.open}
    limitData={limitExceeded.data}
    onClose={() => setLimitExceeded({ open: false, data: null })}
    onUpgrade={() => window.location.href = '/subscription/plans'}
  />
  ```
- [ ] Handle 429 responses:
  ```tsx
  .catch(error => {
    if (error.response?.status === 429) {
      setLimitExceeded({
        open: true,
        data: error.response.data.limit_data
      });
    }
  });
  ```

### Test Frontend Integration
- [ ] Build frontend: `npm run build` (no errors)
- [ ] Dev server: `npm run dev` (no errors)
- [ ] Component loads without console errors
- [ ] Modal displays when 429 response received
- [ ] Buttons trigger correct callbacks
- [ ] Modal closes on backdrop click

## ✅ Phase 7: End-to-End Testing

### Test Complete User Flow
- [ ] User without subscription → Gets free plan automatically
- [ ] Free user checks usage: `/images/usage` returns limits
- [ ] Free user generates 1 image → Success
- [ ] Free user generates images until limit → Then blocked
- [ ] Blocked user sees modal with correct info
- [ ] Modal shows correct reset time
- [ ] Upgrade button navigates to plans page
- [ ] Wait button closes modal

### Test Across Different Plans
- [ ] Paid user (50/day) can generate more than free
- [ ] Premium user (200/day) can generate even more
- [ ] Gold user (unlimited) never sees limit modal
- [ ] Downgrading plan reduces limits immediately

### Test Edge Cases
- [ ] Multiple rapid requests don't bypass limit
- [ ] Batch requests (count > 1) respect limit
- [ ] Monthly limit works independently from daily
- [ ] Reset happens correctly at day boundary
- [ ] User can upgrade mid-limit and resume

## ✅ Phase 8: Monitoring & Logging

### Check Logs
- [ ] Verify rate limit violations logged:
  ```bash
  > RateLimitViolation::where('type', 'images_per_day')->count();
  > RateLimitViolation::latest()->first();
  ```
- [ ] Check application logs for generation attempts:
  ```bash
  tail -f storage/logs/laravel.log | grep "image"
  ```

### Verify Tracking
- [ ] Usage quotas created:
  ```bash
  > UsageQuota::where('date', today())->count();
  ```
- [ ] Images tracked in usage_quotas:
  ```bash
  > UsageQuota::latest()->first()->images_generated;
  ```
- [ ] Usage summaries aggregate monthly:
  ```bash
  > UsageSummary::latest()->first();
  ```

## ✅ Phase 9: Performance Testing

### Load Testing
- [ ] Test with 100 concurrent requests ✓
- [ ] Response time < 500ms for limit check ✓
- [ ] No database connection issues
- [ ] Memory usage stays stable

### Database Queries
- [ ] Verify indexes exist:
  ```sql
  SHOW INDEX FROM usage_quotas;
  SHOW INDEX FROM subscriptions;
  ```
- [ ] Check query performance:
  ```bash
  php artisan tinker
  > DB::enableQueryLog();
  > app(SubscriptionService::class)->canGenerateImages($user);
  > DB::getQueryLog();
  # Should be 2-3 queries max
  ```

## ✅ Phase 10: Security Testing

### Security Checks
- [ ] Only authenticated users can access endpoints
- [ ] User can only see their own usage
- [ ] Client-side changes can't override limits
- [ ] Rate violations logged for abuse detection
- [ ] Input validation on all endpoints
- [ ] SQL injection protection ✓ (Eloquent)
- [ ] CSRF protection enabled ✓

### Test as Attacker
- [ ] Try to access API without token → 401
- [ ] Try to access other user's data → Blocked
- [ ] Try to bypass limit with repeated requests → Still blocked
- [ ] Try to manipulate request body → Validated

## ✅ Phase 11: Documentation Review

### Verify All Documentation
- [ ] `FREE_PLAN_AND_IMAGE_LIMITS_IMPLEMENTATION.md` exists
- [ ] `QUICK_SETUP_IMAGE_LIMITS.md` exists
- [ ] `FEATURE_FLOW_DIAGRAM.md` exists
- [ ] Example controller has detailed comments
- [ ] Modal component has JSDoc comments
- [ ] All methods have proper docstrings

## ✅ Phase 12: Deployment Preparation

### Pre-Deployment
- [ ] All tests passing: `php artisan test`
- [ ] No linting errors: `npm run lint`
- [ ] No TypeScript errors: `npm run types`
- [ ] All migrations tested locally
- [ ] Rollback tested: `php artisan migrate:rollback`
- [ ] Backup database before migration

### Deployment Steps
- [ ] Backup production database
- [ ] Deploy code changes
- [ ] Run migration: `php artisan migrate`
- [ ] Run default plans (if needed): `php artisan subscription:create-defaults`
- [ ] Restart queue workers
- [ ] Monitor logs for errors
- [ ] Test endpoints on production
- [ ] Verify users getting free plans

### Post-Deployment
- [ ] Monitor rate limit violations table
- [ ] Check usage quotas are being created
- [ ] Verify limit modals display correctly
- [ ] Test upgrade flow
- [ ] Monitor API performance
- [ ] Collect user feedback

## 📊 Status Summary

### Completed ✅
- [x] Migration file created
- [x] Model updated (SubscriptionPlan)
- [x] Service enhanced (canGenerateImages method)
- [x] Default plans updated with limits
- [x] Frontend component created (LimitExceededModal)
- [x] Example controller provided
- [x] Comprehensive documentation

### Ready to Deploy 🚀
- [ ] Database migration run
- [ ] Routes added to API
- [ ] Component integrated into UI
- [ ] End-to-end testing complete
- [ ] Performance verified
- [ ] Security tested
- [ ] Documentation reviewed

### Post-Deployment 📈
- [ ] Monitor analytics
- [ ] Collect user feedback
- [ ] Adjust limits if needed
- [ ] Plan future enhancements

## 🔍 Debugging Tips

If something isn't working:

### Check Migration
```bash
php artisan migrate:status
php artisan tinker
> Schema::hasColumn('subscription_plans', 'images_per_day')
```

### Check Service
```bash
php artisan tinker
> $user = User::first();
> app(SubscriptionService::class)->canGenerateImages($user, 1);
# Should return array with 'allowed' key
```

### Check Routes
```bash
php artisan route:list | grep images
# Should show 3 routes
```

### Check API Response
```bash
# Get auth token
php artisan tinker
> User::first()->createToken('test')->plainTextToken

# Call API
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/images/usage
```

### Check Database
```bash
php artisan tinker
> SubscriptionPlan::all();
> UsageQuota::latest()->first();
> RateLimitViolation::latest()->first();
```

## ✨ You're Done!

Once all checkboxes are complete, your image generation limits system is fully deployed and ready for users! 🎉
