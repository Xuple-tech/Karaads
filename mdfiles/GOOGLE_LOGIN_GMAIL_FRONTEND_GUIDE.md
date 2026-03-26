# Google Login with Gmail Linking - Frontend Integration Guide

## Quick Start

The Gmail linking feature integrates seamlessly with your existing Google login UI. Simply add a second button for "Login with Google + Link Email".

## React Component Examples

### Option 1: Two Separate Buttons

```tsx
// resources/js/Pages/Auth/Login.tsx
import { Button } from '@/components/ui/button';
import { route } from 'ziggy-js';

export default function LoginPage() {
    return (
        <div className="flex flex-col gap-4 w-full max-w-md">
            <h2 className="text-2xl font-bold">Login to Your Account</h2>

            {/* Standard Google Login */}
            <Button
                onClick={() => window.location.href = route('auth.google')}
                variant="outline"
                className="w-full"
            >
                <img src="/google-logo.svg" alt="Google" className="w-4 h-4 mr-2" />
                Login with Google
            </Button>

            {/* Google Login + Email Linking */}
            <Button
                onClick={() => window.location.href = route('auth.google', { link_email: 1 })}
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
            >
                <img src="/google-logo.svg" alt="Google" className="w-4 h-4 mr-2" />
                <span>
                    Login with Google
                    <br/>
                    <span className="text-xs font-normal">+ Link Gmail for Email Automation</span>
                </span>
            </Button>

            <div className="text-sm text-gray-500 text-center">
                By clicking "Login with Google + Link Gmail", your Gmail account will be 
                automatically linked to enable email automation features.
            </div>
        </div>
    );
}
```

### Option 2: Single Button with Modal

```tsx
// resources/js/Pages/Auth/LoginModal.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { route } from 'ziggy-js';

export default function LoginWithOptions() {
    const [showOptions, setShowOptions] = useState(false);

    const handleGoogleLogin = (linkEmail = false) => {
        const params = linkEmail ? { link_email: 1 } : {};
        window.location.href = route('auth.google', params);
    };

    return (
        <>
            <Button
                onClick={() => setShowOptions(true)}
                className="w-full"
            >
                <img src="/google-logo.svg" alt="Google" className="w-4 h-4 mr-2" />
                Continue with Google
            </Button>

            <Dialog open={showOptions} onOpenChange={setShowOptions}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Options</DialogTitle>
                        <DialogDescription>
                            Choose how you'd like to proceed with your Google account
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-3">
                        {/* Standard Login */}
                        <Button
                            onClick={() => handleGoogleLogin(false)}
                            variant="outline"
                            className="justify-start h-auto py-3"
                        >
                            <div className="text-left">
                                <div className="font-medium">Standard Login</div>
                                <div className="text-sm text-gray-500">
                                    Just login to your account
                                </div>
                            </div>
                        </Button>

                        {/* Login + Link Email */}
                        <Button
                            onClick={() => handleGoogleLogin(true)}
                            className="justify-start h-auto py-3 bg-blue-600 hover:bg-blue-700"
                        >
                            <div className="text-left">
                                <div className="font-medium">Login + Link Gmail</div>
                                <div className="text-sm">
                                    Automatically link your Gmail for email automation
                                </div>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
```

### Option 3: Inline Link in Settings

```tsx
// resources/js/Pages/Settings/EmailSettings.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { route } from 'ziggy-js';
import { Mail, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function EmailSettings() {
    const { user } = useAuth();
    
    // Check if Gmail is already linked
    const gmailLinked = user?.emailAccounts?.some(
        account => account.provider === 'gmail'
    );

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Accounts
            </h3>

            {gmailLinked ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800">
                        ✓ Gmail is linked
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                        Your Gmail account is ready for email automation
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Link your Gmail account to enable email automation features.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                            Quick Link via Google Login
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                            Logout and use the "Login with Google + Link Gmail" button 
                            on the login page for fastest setup.
                        </p>
                        
                        <Button
                            onClick={() => window.location.href = route('auth.google', { link_email: 1 })}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Quick Link Now
                        </Button>
                    </div>

                    {/* Alternative: Direct connection */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                            Manual Connection
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                            Or link via our dedicated email connection page.
                        </p>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = route('emails.connect.gmail')}
                        >
                            Connect Gmail
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
```

## URL Routing Examples

### Using Ziggy (Recommended)

```tsx
// Standard Google login
const standardLoginUrl = route('auth.google');
// Result: https://yourapp.com/auth/google

// Google login + email linking
const linkedLoginUrl = route('auth.google', { link_email: 1 });
// Result: https://yourapp.com/auth/google?link_email=1
```

### Direct URLs

```
// Standard login
https://yourapp.com/auth/google

// Login + Link Email
https://yourapp.com/auth/google?link_email=1
```

## Blade Template Examples

### Simple Buttons

```blade
<!-- resources/views/auth/login.blade.php -->

<div class="flex flex-col gap-4">
    <!-- Standard Google Login -->
    <a href="{{ route('auth.google') }}" class="btn btn-outline">
        <img src="/google-logo.svg" alt="Google" class="h-4 w-4 mr-2" />
        Login with Google
    </a>

    <!-- Google Login + Email Linking -->
    <a href="{{ route('auth.google', ['link_email' => 1]) }}" class="btn btn-primary">
        <img src="/google-logo.svg" alt="Google" class="h-4 w-4 mr-2" />
        Login with Google + Link Email
    </a>
</div>
```

### With Info Message

```blade
<!-- resources/views/auth/login.blade.php -->

<div class="space-y-4">
    <!-- Standard -->
    <a href="{{ route('auth.google') }}" class="btn btn-outline w-full">
        Login with Google
    </a>

    <!-- With linking -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <a href="{{ route('auth.google', ['link_email' => 1]) }}" class="btn btn-primary w-full">
            Login with Google + Link Gmail
        </a>
        <p class="text-sm text-gray-600 mt-2">
            Your Gmail account will be automatically linked for email automation
        </p>
    </div>
</div>
```

## Error Handling

### Handling Gmail Linking Failures

While the implementation includes graceful fallback (user still logs in even if linking fails), you might want to show a message:

```tsx
// resources/js/Pages/Auth/LoginCallback.tsx
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

export default function LoginCallback() {
    const { props } = usePage();
    const { flash } = props;

    useEffect(() => {
        if (flash?.error) {
            // Show error toast if something went wrong
            toast.error(flash.error);
        }
        
        if (flash?.warning) {
            // Show warning if login succeeded but Gmail linking failed
            toast.warning(
                'Logged in successfully, but Gmail linking failed. You can try again in settings.'
            );
        }
    }, [flash]);

    return null; // Redirect already happened
}
```

## Security Considerations

### Preventing Token Leak

1. **Don't pass tokens in URLs**: The `link_email` parameter contains no sensitive data
2. **Session-based state**: OAuth tokens are handled server-side only
3. **HTTPS only**: Always use HTTPS in production
4. **No local storage**: Don't store OAuth tokens in browser storage

```tsx
// ❌ WRONG: Never do this
localStorage.setItem('accessToken', token);

// ✅ RIGHT: Let server handle OAuth tokens
// User just clicks link, server manages credentials
```

### CORS and Redirects

Since this uses OAuth redirects, CORS is not a concern. The flow is:
1. Client → Your app (standard navigation)
2. Your app → Google (redirect)
3. Google → Your app `/google/callback` (redirect)

No direct API calls between client and Google's OAuth endpoint.

## Testing

### Manual Testing Checklist

- [ ] Visit `/auth/google` - standard login works
- [ ] Visit `/auth/google?link_email=1` - Gmail linking works
- [ ] After login, verify Gmail appears in email settings
- [ ] Try linking twice - no duplicate created
- [ ] Check database for encrypted credentials

### Browser Console Testing

```javascript
// Check redirect URL being built
const url = new URL('/auth/google?link_email=1', window.location.origin);
console.log('Redirect URL:', url.toString());

// Manually navigate
window.location.href = url.toString();
```

## Deployment Considerations

### 1. Environment Configuration

No additional environment variables needed. Uses existing:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_DRIVER` (must be persistent, e.g., 'database', 'redis', not 'array')

### 2. Session Persistence

The `oauth_link_email` session flag requires persistent session storage:

```env
# .env
SESSION_DRIVER=database  # Good: persists across requests
# SESSION_DRIVER=redis   # Good: persists across requests
# SESSION_DRIVER=array   # Bad: loses data between requests
```

### 3. HTTPS Requirement

OAuth providers require HTTPS in production:

```env
# .env.production
APP_URL=https://yourapp.com
```

### 4. Gmail Scopes Configuration

Ensure Google OAuth app is configured to accept these scopes:
- `email`
- `profile`
- `https://www.googleapis.com/auth/gmail.readonly`

These should already be configured if you followed the OAuth setup guide.

## Monitoring & Analytics

### Tracking Email Linking via Login

```php
// In your analytics/logging service
\Log::info('gmail_linked_via_login', [
    'user_id' => $user->id,
    'timestamp' => now(),
    'email_account_id' => $emailAccount->id,
]);

// Or with analytics service
Analytics::track('gmail_linked_via_login', [
    'user_id' => $user->id,
    'email_address' => $user->email,
]);
```

### User Funnel Analytics

```
Login Page Visits
  ↓
Click "Standard Login" → /auth/google (convert to users)
  ↓
Click "Login + Link Gmail" → /auth/google?link_email=1
  ↓
Successful Google OAuth
  ↓
Email Account Created (track success rate)
```

## Common UI Patterns

### Pattern 1: Prominent Email Linking

For applications focused on email automation:

```tsx
<div className="grid grid-cols-1 gap-4">
    {/* Smaller standard login */}
    <Button variant="outline" className="text-sm">
        Standard Login
    </Button>

    {/* Larger featured option */}
    <Button className="bg-blue-600 py-6 text-base">
        ⭐ Login + Link Email (Recommended)
    </Button>
</div>
```

### Pattern 2: Progressive Disclosure

For general-purpose apps:

```tsx
<Button onClick={() => window.location.href = route('auth.google')}>
    Login with Google
</Button>

<details className="text-sm text-gray-600 mt-2">
    <summary>Advanced: Link Gmail now?</summary>
    <a href={route('auth.google', { link_email: 1 })} className="btn btn-sm">
        Yes, link Gmail
    </a>
</details>
```

### Pattern 3: Step-by-Step Flow

```tsx
<div className="space-y-2">
    <div className="flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            1
        </span>
        <span>Login with Google</span>
    </div>
    <div className="flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            2
        </span>
        <span>Gmail automatically linked</span>
    </div>
    <div className="flex items-center gap-2">
        <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
            3
        </span>
        <span>Start using email automation</span>
    </div>

    <Button 
        className="w-full mt-4"
        onClick={() => window.location.href = route('auth.google', { link_email: 1 })}
    >
        Get Started
    </Button>
</div>
```

## Troubleshooting Frontend Issues

### Issue: Button Link Not Working

**Check**:
1. Is `ziggy-js` installed? `npm list ziggy-js`
2. Is route helper available? Check browser console: `console.log(route)`
3. Is button actually navigating? Check Network tab in DevTools

**Solution**:
```tsx
// If route() not available, use direct URL
onClick={() => window.location.href = '/auth/google?link_email=1'}
```

### Issue: Stuck in Redirect Loop

**Cause**: Session not persisting, loses `oauth_link_email` flag between requests

**Check**:
```bash
# Verify session driver configuration
php artisan config:show session.driver

# Check session table exists (if using database driver)
php artisan migrate
```

### Issue: Gmail Not Showing in Email Settings

**Check**:
1. User actually completed OAuth? (logs show success)
2. Check database: `SELECT * FROM email_accounts WHERE user_id = ?`
3. Are page components reloading? (might show cached data)

## Version Compatibility

- **Laravel**: 12.0+
- **React**: 18.0+ (examples use React 19 syntax)
- **Inertia.js**: 2.0+
- **Socialite**: 5.0+

## Next Steps

1. Update your login page UI with the new button
2. Test the flow in development
3. Deploy to staging
4. Monitor analytics for adoption
5. Gather user feedback
