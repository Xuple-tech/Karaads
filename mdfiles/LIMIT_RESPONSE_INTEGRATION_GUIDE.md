# Limit Response Integration Guide

## Overview

The application now returns **structured limit responses** when users hit rate limits, usage restrictions, or require authentication. These responses include:
- **Message**: User-friendly error message
- **Action**: What the user should do (upgrade, login, etc.)
- **Metadata**: Additional context (limits, usage, reset times, etc.)

This enables the frontend to display appropriate UI for upgrades, login prompts, and helpful notifications.

## Response Structure

### Standard Limit Response Format

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
  "upgrade_required": true,
  "action_label": "Upgrade to Pro",
  "action_url": "/pricing"
}
```

### Unauthenticated Response

```json
{
  "success": false,
  "error": "unauthenticated",
  "message": "Please sign in to continue.",
  "action": "login",
  "code": "UNAUTHENTICATED",
  "login_required": true,
  "action_label": "Sign In",
  "action_url": "/login"
}
```

## Limit Types

The system handles the following limit types:

| Type | Action | When It Occurs |
|------|--------|-----------------|
| `rate_limit_exceeded` | upgrade | Daily/monthly request limit exceeded |
| `daily_limit_exceeded` | upgrade | Daily limit reached |
| `monthly_limit_exceeded` | upgrade | Monthly limit reached |
| `image_limit_exceeded` | upgrade | Image generation limit reached |
| `token_limit_exceeded` | upgrade | Token usage limit exceeded |
| `voice_limit_exceeded` | upgrade | Voice message limit reached |
| `email_limit_exceeded` | upgrade | Email processing limit reached |
| `unauthenticated` | login | User not signed in |
| `subscription_required` | login | Feature requires subscription |
| `no_plan` | login | No subscription plan found |
| `feature_unavailable` | upgrade | Feature not available on current plan |

## Error Codes

Each limit response includes an error code for handling specific scenarios:

- `RATE_LIMIT_EXCEEDED` - Request rate limit
- `DAILY_LIMIT_EXCEEDED` - Daily usage limit
- `MONTHLY_LIMIT_EXCEEDED` - Monthly usage limit
- `IMAGE_LIMIT_EXCEEDED` - Image generation limit
- `TOKEN_LIMIT_EXCEEDED` - Token usage limit
- `VOICE_LIMIT_EXCEEDED` - Voice message limit
- `EMAIL_LIMIT_EXCEEDED` - Email processing limit
- `UNAUTHENTICATED` - Not authenticated
- `SUBSCRIPTION_REQUIRED` - Subscription needed
- `NO_PLAN` - No plan assigned
- `FEATURE_UNAVAILABLE` - Feature unavailable

## Backend Usage

### In Controllers

```php
use App\Services\LimitResponseService;

// Check for limits before processing
$limitCheck = $this->grokApiService->checkChatLimits(Auth::user());
if ($limitCheck !== null) {
    return response()->json($limitCheck, 429);
}

// Check image generation limits
$imageLimit = $this->grokApiService->checkImageLimits(4, Auth::user());
if ($imageLimit !== null) {
    return response()->json($imageLimit, 429);
}
```

### In Services

```php
// Check if user can make a request
$limitResponse = LimitResponseService::limitExceeded(
    'image_limit_exceeded',
    [
        'limit' => 5,
        'used' => 5,
        'reset_at' => now()->addDay()->toDateTimeString(),
        'reset_type' => 'daily',
        'plan_name' => 'Free'
    ]
);

// Check from subscription service result
$canMakeRequest = $subscriptionService->canMakeRequest($user);
if (!$canMakeRequest['allowed']) {
    $limitResponse = LimitResponseService::fromSubscriptionCheck(
        $canMakeRequest,
        'rate_limit_exceeded'
    );
    return response()->json($limitResponse, 429);
}
```

### In Middleware

```php
use App\Services\LimitResponseService;

// When limit is exceeded
$limitResponse = LimitResponseService::limitExceeded(
    'daily_limit_exceeded',
    [
        'limit' => $limit,
        'used' => $used,
        'reset_at' => $resetTime,
        'reset_type' => 'daily'
    ]
);

return response()->json($limitResponse, 429);
```

## Frontend Usage

### React/TypeScript Integration

#### 1. Handle in Chat Component

```typescript
import { useState } from 'react';
import LimitNotification from '@/components/LimitNotification';

export default function ChatInterface() {
    const [limitError, setLimitError] = useState<any>(null);

    const handleSubmit = async (message: string) => {
        try {
            const response = await fetch('/api/create/challenge/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (response.status === 429) {
                // Limit exceeded
                const data = await response.json();
                setLimitError(data);
                return;
            }

            // Process normal response
            // ...
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {limitError && (
                <LimitNotification 
                    error={limitError} 
                    onClose={() => setLimitError(null)}
                />
            )}
            {/* Chat UI */}
        </div>
    );
}
```

#### 2. Create a Reusable Limit Notification Component

```typescript
// components/LimitNotification.tsx
import { AlertCircle, ArrowRight, LogIn, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LimitNotificationProps {
    error: {
        message: string;
        action: 'upgrade' | 'login';
        action_label?: string;
        action_url?: string;
        limit?: number;
        used?: number;
        remaining?: number;
        reset_at?: string;
        reset_type?: string;
        plan_name?: string;
    };
    onClose?: () => void;
}

export default function LimitNotification({ error, onClose }: LimitNotificationProps) {
    const isUpgradeAction = error.action === 'upgrade';
    const isLoginAction = error.action === 'login';

    const getIcon = () => {
        if (isUpgradeAction) return <Zap className="h-5 w-5 text-amber-600" />;
        if (isLoginAction) return <LogIn className="h-5 w-5 text-blue-600" />;
        return <AlertCircle className="h-5 w-5 text-destructive" />;
    };

    const getStyles = () => {
        if (isUpgradeAction) return 'bg-amber-50 border-amber-200';
        if (isLoginAction) return 'bg-blue-50 border-blue-200';
        return 'bg-red-50 border-red-200';
    };

    const formatResetTime = () => {
        if (!error.reset_at) return null;
        const date = new Date(error.reset_at);
        if (error.reset_type === 'daily') {
            return `Resets tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return `Resets on ${date.toLocaleDateString()}`;
    };

    return (
        <Card className={`${getStyles()} border-2 shadow-md`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {getIcon()}
                    <span>
                        {isUpgradeAction && 'Upgrade Required'}
                        {isLoginAction && 'Sign In Required'}
                        {!isUpgradeAction && !isLoginAction && 'Limit Reached'}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Message */}
                <Alert className={isUpgradeAction ? 'bg-amber-100' : 'bg-blue-100'}>
                    <AlertDescription className="text-foreground font-medium">
                        {error.message}
                    </AlertDescription>
                </Alert>

                {/* Usage Details */}
                {error.limit !== undefined && (
                    <div className="bg-background/50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Usage</span>
                            <span className="font-semibold">
                                {error.used} / {error.limit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-red-500 h-2 rounded-full"
                                style={{
                                    width: `${Math.min(100, ((error.used || 0) / (error.limit || 1)) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Reset Time */}
                {formatResetTime() && (
                    <p className="text-xs text-muted-foreground">
                        {formatResetTime()}
                    </p>
                )}

                {/* Plan Info */}
                {error.plan_name && (
                    <p className="text-xs text-muted-foreground">
                        Plan: <span className="font-semibold">{error.plan_name}</span>
                    </p>
                )}

                {/* Action Button */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.href = error.action_url || '/'}
                        className={isUpgradeAction ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-blue-600'}
                        size="sm"
                    >
                        {error.action_label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    {onClose && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Dismiss
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
```

#### 3. Handle in Streaming Response

```typescript
// In ChatInterface component
const handleSubmit = async (prompt: string) => {
    try {
        const response = await fetch('/api/create/challenge/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt })
        });

        if (response.status === 429) {
            const limitData = await response.json();
            toast.error(limitData.message);
            setLimitError(limitData);
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        // ... process stream
    } catch (error) {
        if (error instanceof Error && error.message.includes('limit')) {
            // Handle limit-related errors
        }
    }
};
```

#### 4. Global Error Handler

```typescript
// hooks/useApiErrorHandler.ts
import { useState, useCallback } from 'react';

export const useApiErrorHandler = () => {
    const [limitError, setLimitError] = useState<any>(null);

    const handleResponse = useCallback(async (response: Response) => {
        if (response.status === 429) {
            const data = await response.json();
            setLimitError(data);
            return { error: data };
        }
        return null;
    }, []);

    return {
        limitError,
        setLimitError,
        handleResponse
    };
};

// Usage in component
const MyComponent = () => {
    const { limitError, setLimitError, handleResponse } = useApiErrorHandler();

    const fetchData = async () => {
        const response = await fetch('/api/data');
        const errorResult = await handleResponse(response);
        if (errorResult?.error) return;
        // Process successful response
    };

    return (
        <div>
            {limitError && <LimitNotification error={limitError} onClose={() => setLimitError(null)} />}
        </div>
    );
};
```

## Implementation Checklist

### Backend
- [x] Create `LimitResponseService` class
- [x] Update `CheckSubscriptionRateLimit` middleware
- [x] Update `ImageGenerationRateLimit` middleware
- [x] Add limit checking methods to `GrokApiService`
- [x] Integrate limit checks in `ChatController`
- [ ] Add checks to image generation endpoint
- [ ] Add checks to voice conversation endpoint
- [ ] Add checks to email processing endpoint

### Frontend
- [ ] Create `LimitNotification` component
- [ ] Update `ChatInterface` to handle limit responses
- [ ] Add global error handling for 429 status
- [ ] Create upgrade prompt modal
- [ ] Create login prompt modal
- [ ] Add toast notifications for limit info
- [ ] Test all limit scenarios

## Testing Scenarios

### 1. Daily Request Limit Exceeded
- Make requests until daily limit is hit
- Verify structured response with action: "upgrade"
- Verify frontend shows upgrade prompt

### 2. Image Generation Limit Exceeded
- Generate images until limit is hit
- Verify response includes image-specific metadata
- Verify reset time is shown correctly

### 3. Unauthenticated User
- Make request without auth token
- Verify response with action: "login"
- Verify frontend shows sign-in prompt

### 4. Token Limit Exceeded
- Use tokens until limit is hit
- Verify response includes token information
- Verify helpful message about upgrading

## Response Status Codes

All limit responses return HTTP status **429 (Too Many Requests)** with JSON body containing structured error information.

## Example Responses

### Image Generation Limit
```json
{
  "success": false,
  "error": "limit_exceeded",
  "type": "image_limit_exceeded",
  "message": "Image generation limit reached.",
  "action": "upgrade",
  "code": "IMAGE_LIMIT_EXCEEDED",
  "limit": 5,
  "used": 5,
  "remaining": 0,
  "needed": 2,
  "reset_at": "2024-01-15T00:00:00Z",
  "reset_type": "daily",
  "plan_name": "Free",
  "upgrade_required": true,
  "action_label": "Upgrade to Pro",
  "action_url": "/pricing"
}
```

### Unauthenticated User
```json
{
  "success": false,
  "error": "unauthenticated",
  "message": "Please sign in to continue.",
  "action": "login",
  "code": "UNAUTHENTICATED",
  "login_required": true,
  "action_label": "Sign In",
  "action_url": "/login"
}
```

### Monthly Limit Exceeded
```json
{
  "success": false,
  "error": "limit_exceeded",
  "type": "monthly_limit_exceeded",
  "message": "Monthly limit reached.",
  "action": "upgrade",
  "code": "MONTHLY_LIMIT_EXCEEDED",
  "limit": 500,
  "used": 500,
  "remaining": 0,
  "reset_at": "2024-02-01T00:00:00Z",
  "reset_type": "monthly",
  "plan_name": "Free",
  "upgrade_required": true,
  "action_label": "Upgrade to Pro",
  "action_url": "/pricing"
}
```

## API Integration Summary

The system provides limit handling at three levels:

1. **Middleware Level** - Intercepts requests before they reach the controller
2. **Service Level** - Pre-checks in GrokApiService before API calls
3. **Controller Level** - Final validation before processing user requests

All levels return the same structured response format for consistency.
