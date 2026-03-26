# Header Upgrade Button Implementation

## Overview
Implemented a dynamic "Upgrade to Pro" button that appears in the app layout header and user menu **only for free plan users**. Premium users (on paid plans) won't see the button.

## Changes Made

### 1. **Backend - Middleware** (`app/Http/Middleware/HandleInertiaRequests.php`)
- Added current plan data to authenticated user props
- Plan info is loaded from `user.getCurrentPlan()` method
- Passed via Inertia to frontend as `auth.user.current_plan`

```php
// Add current plan if user is authenticated
if ($request->user()) {
    $auth['user']['current_plan'] = $request->user()->getCurrentPlan();
}
```

### 2. **Frontend - TypeScript Types** (`resources/js/types/index.ts`)
- Added `SubscriptionPlan` interface with plan details
- Extended `User` interface with optional `current_plan` property
- Includes plan name, slug, pricing, limits, and features

```typescript
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;  // 'free', 'pro', 'enterprise', etc.
  monthly_price: number;
  yearly_price: number;
  // ... limits and features
}

export interface User {
  // ... existing fields
  current_plan?: SubscriptionPlan;
}
```

### 3. **Frontend - User Menu** (`resources/js/components/user-menu-content.tsx`)
- Added gradient upgrade button to user dropdown menu
- Button shows only for free plan users
- Features amber/orange gradient styling with Zap icon
- Links to `/pricing` page
- Positioned right after user info and before Settings

**Button Features:**
- 🟡 Amber/Orange gradient background
- ⚡ Zap icon for visual emphasis
- **"Upgrade to Pro"** clear call-to-action
- Dark mode support with appropriate colors
- Separates from other menu items visually

### 4. **Frontend - App Header** (`resources/js/components/app-header.tsx`)
- Added prominent upgrade button to main header
- Shows only on desktop (hidden on mobile via `hidden lg:flex`)
- Positioned in top-right area before user avatar
- Eye-catching gradient styling
- Links to `/pricing` page

**Button Features:**
- 🌟 "✨ Upgrade" with star emoji
- Gradient background (amber → orange)
- Small size to fit naturally in header
- Desktop-only for clean mobile UX
- High visibility placement

## How It Works

### Detection Logic
```typescript
// Check if user is on free plan
const isFreePlan = user.current_plan?.slug === 'free';
```

The system checks if the user's subscription plan slug is `'free'`. If true, the upgrade button is displayed.

### Plan Information Flow
1. **Backend**: User's current plan is fetched via `user.getCurrentPlan()`
2. **Middleware**: Plan data is added to Inertia props
3. **Frontend**: Component receives plan info and renders conditionally
4. **Navigation**: Clicking upgrade button takes user to `/pricing` page

## Upgrade Path

When users click the upgrade button:
1. They're directed to `/pricing` page
2. They can select a plan and proceed to checkout
3. After successful subscription, the upgrade button disappears
4. User sees different UI based on their new plan features

## Testing Checklist

- [ ] Login as free plan user → Verify "Upgrade" button appears in header
- [ ] Login as premium user → Verify no "Upgrade" button appears
- [ ] Click header upgrade button → Redirects to `/pricing`
- [ ] Click menu upgrade button → Redirects to `/pricing`
- [ ] Check mobile view → Header button hidden, menu button available
- [ ] Test dark mode → Colors render correctly
- [ ] Subscribe to plan → Button disappears after subscription

## Future Enhancements

1. **Analytics**: Track upgrade button clicks
2. **A/B Testing**: Test different button text/styling
3. **Feature Gating**: Show different CTAs based on usage (e.g., "You've hit daily limit - Upgrade Now")
4. **Plan Comparison Modal**: Show plan features on button hover
5. **Mobile Header Button**: Conditional mobile upgrade button variant

## Files Modified

| File | Changes |
|------|---------|
| `app/Http/Middleware/HandleInertiaRequests.php` | Added plan data to auth props |
| `resources/js/types/index.ts` | Added SubscriptionPlan interface and current_plan to User |
| `resources/js/components/user-menu-content.tsx` | Added conditional upgrade button in menu |
| `resources/js/components/app-header.tsx` | Added conditional upgrade button in header |

## Integration with Existing Systems

- **SubscriptionService**: Uses existing `getCurrentPlan()` method from User model
- **SubscriptionPlan Model**: Uses existing `slug` field to identify free plan
- **User Model**: Leverages existing subscription relationships
- **No Breaking Changes**: All changes are additive and backward-compatible

## Notes

- The button is **only visible to free plan users**
- Premium users have unlimited access and don't see upgrade prompts
- The implementation is **performant** - plan is loaded once per request
- **Dark mode support** with appropriate color schemes
- **Responsive design** - adapts to mobile/desktop layouts
