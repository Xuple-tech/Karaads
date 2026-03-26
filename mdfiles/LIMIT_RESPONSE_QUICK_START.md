# Limit Response System - Quick Start Guide

## What You Get

✅ **Structured error responses** when users hit limits  
✅ **Action-based responses** (upgrade to pro or sign in)  
✅ **Ready-to-use React components** for displaying limits  
✅ **Hooks for centralized error handling**  
✅ **Full backend integration** with existing subscription system  

## Files Created/Modified

### Backend (Already Done ✅)
- ✅ `app/Services/LimitResponseService.php` - Core service for structured responses
- ✅ `app/Services/GrokApiService.php` - Added limit check methods
- ✅ `app/Http/Controllers/ChatController.php` - Integrated limit checks
- ✅ `app/Http/Middleware/CheckSubscriptionRateLimit.php` - Uses new service
- ✅ `app/Http/Middleware/ImageGenerationRateLimit.php` - Uses new service

### Frontend (Ready to Integrate 📦)
- ✅ `resources/js/components/LimitNotification.tsx` - UI component for limit display
- ✅ `resources/js/hooks/useApiLimitHandler.ts` - Hook for API error handling
- 📄 `resources/js/components/chat/ChatInterface.tsx` - See guide for updates

### Documentation (Complete 📚)
- ✅ `LIMIT_RESPONSE_INTEGRATION_GUIDE.md` - Comprehensive guide
- ✅ `LIMIT_RESPONSE_IMPLEMENTATION_SUMMARY.md` - What was implemented
- ✅ `CHAT_INTERFACE_LIMIT_UPDATE.md` - How to update ChatInterface
- ✅ `LIMIT_RESPONSE_QUICK_START.md` - This file

## Response Format

All limit responses follow this structure:

```json
{
  "success": false,
  "error": "limit_exceeded",
  "type": "rate_limit_exceeded",
  "message": "You've exceeded your daily request limit.",
  "action": "upgrade",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 50,
  "used": 50,
  "remaining": 0,
  "reset_at": "2024-01-15T00:00:00Z",
  "reset_type": "daily",
  "plan_name": "Free",
  "action_label": "Upgrade to Pro",
  "action_url": "/pricing"
}
```

**Key Fields:**
- `action`: What user should do - `"upgrade"` or `"login"`
- `message`: User-friendly explanation
- `limit` / `used` / `remaining`: Usage information
- `reset_at`: When limit resets
- `action_label`: Button text
- `action_url`: Where button links

## Quick Implementation (Frontend)

### 1. Import and Add State
```typescript
import LimitNotification from '@/components/LimitNotification';
import { useApiLimitHandler } from '@/hooks/useApiLimitHandler';

const [limitError, setLimitError] = useState(null);
```

### 2. Check for 429 Responses
```typescript
const response = await fetch('/api/create/challenge/message', {
    method: 'POST',
    body: JSON.stringify({ message })
});

// Check for limit error FIRST
if (response.status === 429) {
    const limitData = await response.json();
    setLimitError(limitData);
    return;
}

// Then handle normal response
```

### 3. Display Notification
```typescript
{limitError && (
    <LimitNotification
        error={limitError}
        onClose={() => setLimitError(null)}
        onUpgrade={() => window.location.href = '/pricing'}
    />
)}
```

That's it! 🎉

## Limit Types

| Type | Shows When |
|------|-----------|
| `rate_limit_exceeded` | Daily/monthly request limit exceeded |
| `image_limit_exceeded` | Image generation quota exceeded |
| `token_limit_exceeded` | Token usage quota exceeded |
| `unauthenticated` | User not logged in |
| `subscription_required` | Feature requires active subscription |

See full list in `LIMIT_RESPONSE_INTEGRATION_GUIDE.md`

## Backend Usage

### Check limits in controller
```php
$limitCheck = $this->grokApiService->checkChatLimits(Auth::user());
if ($limitCheck !== null) {
    return response()->json($limitCheck, 429);
}
```

### Check limits in service
```php
$canMakeRequest = $this->subscriptionService->canMakeRequest($user);
if (!$canMakeRequest['allowed']) {
    $response = LimitResponseService::fromSubscriptionCheck($canMakeRequest, 'rate_limit_exceeded');
    return response()->json($response, 429);
}
```

### Check limits in middleware
```php
if ($limitExceeded) {
    $response = LimitResponseService::limitExceeded('image_limit_exceeded', [
        'limit' => 5,
        'used' => 5,
        'reset_at' => now()->addDay()->toDateTimeString()
    ]);
    return response()->json($response, 429);
}
```

## Component Example

```typescript
<LimitNotification
    error={{
        message: "You've exceeded your daily request limit.",
        action: "upgrade",
        limit: 50,
        used: 50,
        plan_name: "Free"
    }}
    onClose={() => setError(null)}
    onUpgrade={() => navigate('/pricing')}
/>
```

The component automatically:
- ✅ Shows appropriate icon (Zap for upgrade, LogIn for login)
- ✅ Displays usage progress bar
- ✅ Shows reset time in human-readable format
- ✅ Highlights current plan
- ✅ Styles button based on action type

## Error Codes

For more specific error handling:

```typescript
if (response.status === 429) {
    const limitData = await response.json();
    
    switch(limitData.code) {
        case 'RATE_LIMIT_EXCEEDED':
            // Handle general rate limit
            break;
        case 'IMAGE_LIMIT_EXCEEDED':
            // Handle image limit specifically
            break;
        case 'UNAUTHENTICATED':
            // Redirect to login
            window.location.href = '/login';
            break;
    }
}
```

## Testing

1. **Test limit trigger**: Make requests until hitting limit
2. **Verify notification**: Check LimitNotification appears
3. **Verify message**: Confirm appropriate message shows
4. **Test action**: Click upgrade/login button
5. **Test dismiss**: Close notification without action

## Common Scenarios

### User Hits Daily Chat Limit
```
Response Code: 429
Type: rate_limit_exceeded
Action: upgrade
Message: "You've exceeded your daily request limit."
Remaining: 0
Reset: Tomorrow at midnight
```

### User Tries to Generate Too Many Images
```
Response Code: 429
Type: image_limit_exceeded
Action: upgrade
Message: "Image generation limit reached."
Limit: 5
Used: 5
Needed: 2 (they tried to generate 2 but only had 0 left)
```

### Unauthenticated User
```
Response Code: 429
Type: unauthenticated
Action: login
Message: "Please sign in to continue."
```

## Integration Checklist

### Backend ✅
- [x] LimitResponseService created
- [x] GrokApiService updated with limit checks
- [x] ChatController updated with limit checks
- [x] Middleware updated to use new service
- [ ] Other endpoints (images, voice, email) - Optional

### Frontend 
- [ ] LimitNotification component imported
- [ ] useApiLimitHandler hook imported
- [ ] ChatInterface updated to handle 429
- [ ] Test with real requests
- [ ] Verify upgrades/logins work

### Testing
- [ ] Daily chat limit test
- [ ] Image generation limit test
- [ ] Unauthenticated access test
- [ ] Reset time display test
- [ ] Upgrade button navigation test

## Response Headers

All limit responses return:
- **HTTP Status**: 429 (Too Many Requests)
- **Content-Type**: application/json
- **Body**: Structured error with action and message

## Multiple Endpoints

Apply the same pattern to other endpoints:

```typescript
// Image generation
const imageResponse = await fetch('/api/generate-image', {
    method: 'POST',
    body: JSON.stringify({ prompt })
});

if (imageResponse.status === 429) {
    const limitData = await imageResponse.json();
    setLimitError(limitData);
    return;
}

// Voice conversation
const voiceResponse = await fetch('/api/voice-chat', {
    method: 'POST',
    body: JSON.stringify({ audio })
});

if (voiceResponse.status === 429) {
    const limitData = await voiceResponse.json();
    setLimitError(limitData);
    return;
}
```

## Customization

### Custom Message
```typescript
const customResponse = LimitResponseService::limitExceeded(
    'custom_limit',
    [
        'message' => 'Custom message here',
        'limit' => 10,
        'used' => 10
    ]
);
```

### Custom Action URLs
The response automatically uses configured routes. To customize:

```php
// In LimitResponseService
$response['action_url'] = route('pricing'); // Or '/pricing'
$response['action_label'] = 'Upgrade Plan';
```

## Troubleshooting

**Limit notification doesn't show?**
- Check `response.status === 429` is before JSON parsing
- Verify state setter is called: `setLimitError(limitData)`
- Check browser console for errors

**Button redirect doesn't work?**
- Verify `action_url` is set in response
- Check `onUpgrade`/`onLogin` callbacks are provided
- Ensure route/URL exists

**Wrong message shown?**
- Verify `type` field matches limit type
- Check `message` is correctly set in response
- Look at `LimitResponseService` for message mappings

**Progress bar incorrect?**
- Verify `limit` and `used` fields are numbers
- Check calculation: `used / limit * 100`

## Performance Notes

- ✅ Limit checks are lightweight (cached queries)
- ✅ No additional external API calls
- ✅ Minimal database overhead
- ✅ Fast response times

## Security Notes

- ✅ Uses existing auth/subscription system
- ✅ Respects user permissions
- ✅ Logs limit violations
- ✅ Prevents unauthorized access

## Next Steps

1. **Review** `LIMIT_RESPONSE_INTEGRATION_GUIDE.md` for complete details
2. **Update** `ChatInterface.tsx` using guide in `CHAT_INTERFACE_LIMIT_UPDATE.md`
3. **Test** with real requests and verify behavior
4. **Extend** to other endpoints as needed (images, voice, email)
5. **Monitor** usage logs to see limit patterns

## Documentation Map

```
📚 Documentation
├── LIMIT_RESPONSE_QUICK_START.md ← You are here
├── LIMIT_RESPONSE_IMPLEMENTATION_SUMMARY.md (What was built)
├── LIMIT_RESPONSE_INTEGRATION_GUIDE.md (Complete guide)
└── CHAT_INTERFACE_LIMIT_UPDATE.md (How to update UI)

💾 Code
├── Backend (Done ✅)
│   ├── app/Services/LimitResponseService.php
│   ├── app/Services/GrokApiService.php (updated)
│   ├── app/Http/Controllers/ChatController.php (updated)
│   └── app/Http/Middleware/* (updated)
└── Frontend (Ready 📦)
    ├── resources/js/components/LimitNotification.tsx
    └── resources/js/hooks/useApiLimitHandler.ts
```

## Support

For detailed information:
- **API Integration**: See `LIMIT_RESPONSE_INTEGRATION_GUIDE.md`
- **Backend Implementation**: See `LIMIT_RESPONSE_IMPLEMENTATION_SUMMARY.md`
- **Frontend Updates**: See `CHAT_INTERFACE_LIMIT_UPDATE.md`
- **Component Docs**: Check component comments in the code

## Summary

You now have a complete limit response system that:
1. ✅ Detects when users hit usage limits
2. ✅ Returns structured responses with actions
3. ✅ Provides ready-made React components
4. ✅ Includes reusable hooks for error handling
5. ✅ Guides users to upgrade or login

**Start by updating ChatInterface.tsx** (see guide) and test with real requests!
