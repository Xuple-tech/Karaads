# Email Automation OAuth Configuration - Changes Summary

## What Was Done ✅

### 1. **Separated Gmail & Outlook OAuth Credentials**

**Before**: Both user login and email automation used the same OAuth apps.

**After**: 
- **User Login**: Google OAuth App #1 (routes/auth.php)
- **Email Automation**: Gmail OAuth App #2 (routes/web.php) - **DIFFERENT APP**
- **Email Automation**: Outlook OAuth App #3 (routes/web.php) - **DIFFERENT APP**

---

## Files Modified

### 1. **config/services.php**
Added new email automation OAuth configuration:

```php
'email_automation' => [
    'gmail' => [
        'client_id' => env('EMAIL_AUTOMATION_GMAIL_CLIENT_ID'),
        'client_secret' => env('EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET'),
        'redirect_uri' => env('EMAIL_AUTOMATION_GMAIL_REDIRECT_URI', env('APP_URL') . '/emails/callback/gmail'),
    ],
    'outlook' => [
        'client_id' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID'),
        'client_secret' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET'),
        'redirect_uri' => env('EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI', env('APP_URL') . '/emails/callback/outlook'),
        'tenant_id' => env('EMAIL_AUTOMATION_OUTLOOK_TENANT_ID', 'common'),
    ],
],
```

✅ **Benefit**: Separate configs for user login vs email automation

---

### 2. **.env.example**
Added new environment variables:

```bash
# Gmail Email Automation
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=http://localhost/emails/callback/gmail

# Outlook Email Automation
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=http://localhost/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=common
```

✅ **Benefit**: Clear documentation of what credentials are needed

---

### 3. **app/Http/Controllers/MailController.php**

#### **Method: connectGmail()** (Lines 80-102)
**Before**: Used Socialite::driver('google')
**After**: Manually builds Google OAuth authorization URL using email automation credentials

```php
public function connectGmail()
{
    $clientId = config('services.email_automation.gmail.client_id');
    $redirectUri = config('services.email_automation.gmail.redirect_uri');
    
    $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
        'client_id' => $clientId,
        'redirect_uri' => $redirectUri,
        'response_type' => 'code',
        'scope' => implode(' ', $scopes),
        'access_type' => 'offline',
        'prompt' => 'consent',
        'state' => session()->token(), // CSRF protection
    ]);
    
    return redirect($authUrl);
}
```

✅ **Benefits**:
- Uses separate Gmail OAuth app
- CSRF protection with state token
- Clear separation from user login

#### **Method: gmailCallback()** (Lines 108-206)
**Before**: Simple Socialite handling
**After**: Full OAuth code exchange with security validations

```php
public function gmailCallback(Request $request)
{
    // 1. Validate CSRF state token
    if (!$request->has('state') || $request->state !== session()->token()) {
        return redirect()->route('user.library')->with('error', 'Security validation failed');
    }

    // 2. Handle OAuth errors
    if ($request->has('error')) {
        return redirect()->route('user.library')->with('error', 'Gmail connection failed');
    }

    // 3. Exchange code for access token using email automation credentials
    $clientId = config('services.email_automation.gmail.client_id');
    $clientSecret = config('services.email_automation.gmail.client_secret');
    $redirectUri = config('services.email_automation.gmail.redirect_uri');

    $tokenResponse = $client->post('https://oauth2.googleapis.com/token', [
        'form_params' => [
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'code' => $request->code,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ],
    ]);

    // 4. Get user email
    $userResponse = $client->get('https://www.googleapis.com/oauth2/v2/userinfo', [
        'headers' => ['Authorization' => 'Bearer ' . $tokenData['access_token']],
    ]);

    // 5. Store encrypted credentials
    EmailAccount::create([
        'user_id' => Auth::id(),
        'provider' => 'gmail',
        'email_address' => $email,
        'credentials' => [
            'access_token' => $tokenData['access_token'],
            'refresh_token' => $tokenData['refresh_token'],
            'expires_at' => now()->addSeconds($tokenData['expires_in']),
        ],
    ]);
}
```

✅ **Security Improvements**:
- CSRF state validation
- Error handling for OAuth errors
- Comprehensive error logging
- Token expiration tracking
- Credentials encrypted before storage

#### **Method: connectOutlook()** (Lines 212-235)
**Before**: Used Socialite::driver('microsoft')
**After**: Manually builds Microsoft OAuth authorization URL

```php
public function connectOutlook()
{
    $clientId = config('services.email_automation.outlook.client_id');
    $redirectUri = config('services.email_automation.outlook.redirect_uri');
    $tenantId = config('services.email_automation.outlook.tenant_id', 'common');
    
    $authUrl = 'https://login.microsoftonline.com/' . $tenantId . '/oauth2/v2.0/authorize?' 
             . http_build_query([/* params */]);
    
    return redirect($authUrl);
}
```

#### **Method: outlookCallback()** (Lines 241-341)
Similar implementation to Gmail, but:
- Uses Microsoft OAuth endpoints
- Supports tenant ID
- Gets user info from `https://graph.microsoft.com/v1.0/me`

---

## Key Differences: Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **Gmail OAuth App** | Shared with user login | Separate app for email automation |
| **Outlook OAuth App** | Shared with user login | Separate app for email automation |
| **Redirect URIs** | May conflict | Distinct for each purpose |
| **CSRF Protection** | Via Socialite | Manual state token validation |
| **Error Handling** | Basic | Comprehensive |
| **Token Exchange** | Handled by Socialite | Explicit Guzzle calls |
| **Logging** | Minimal | Detailed audit trail |
| **Configuration** | In Socialite config | In services.php email_automation |

---

## OAuth Flow Comparison

### User Login (routes/auth.php)
```
User → /auth/google 
  ↓
Google OAuth App #1
  ↓
google/callback
  ↓
GoogleController::handleGoogleCallback()
  ↓
Create/update User
  ↓
Redirect to /dashboard
```

### Email Automation (routes/web.php) - NEW
```
User → /emails/connect/gmail
  ↓
Gmail OAuth App #2 (DIFFERENT)
  ↓
/emails/callback/gmail (DIFFERENT URI)
  ↓
MailController::gmailCallback()
  ↓
Create EmailAccount
  ↓
Redirect to /mails with success
```

---

## Environment Setup Required

### 1. Create NEW Gmail OAuth App
- Go to Google Cloud Console
- Create new project: "YourApp - Email Automation"
- Enable Gmail API
- Create OAuth 2.0 credentials
- Add redirect URI: `https://yourapp.com/emails/callback/gmail`
- Copy Client ID and Secret

### 2. Create NEW Outlook OAuth App
- Go to Azure Portal
- Register new application: "YourApp - Email Automation"
- Add redirect URI: `https://yourapp.com/emails/callback/outlook`
- Add API permissions: Mail.ReadWrite, Mail.Send, offline_access
- Create client secret

### 3. Update .env
```bash
# Gmail Email Automation (NOT the same as user login!)
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=xxx
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=https://yourapp.com/emails/callback/gmail

# Outlook Email Automation (NOT the same as user login!)
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=xxx
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=xxx
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=https://yourapp.com/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=common
```

---

## Security Improvements

✅ **CSRF Protection**: State token validation prevents OAuth code interception
✅ **Error Handling**: User-friendly messages + detailed logging
✅ **Token Encryption**: Credentials encrypted at rest in database
✅ **Token Expiration**: Tracks when tokens expire (ready for refresh)
✅ **Audit Logging**: All OAuth events logged to Laravel logs
✅ **Scope Minimization**: Only request needed permissions
✅ **HTTPS**: Required in production (enforced by OAuth providers)

---

## Testing Checklist

- [ ] Create separate Gmail OAuth app (different from user login)
- [ ] Create separate Outlook OAuth app (different from user login)
- [ ] Add OAuth credentials to .env
- [ ] Test Gmail connection: /emails/connect/gmail
- [ ] Test Gmail callback receives code
- [ ] Verify Gmail account appears in dashboard
- [ ] Test Outlook connection: /emails/connect/outlook
- [ ] Test Outlook callback receives code
- [ ] Verify Outlook account appears in dashboard
- [ ] Test connecting same account twice (should show error)
- [ ] Test CSRF error handling (invalid state token)
- [ ] Verify tokens encrypted in database
- [ ] Test error scenarios (connection cancelled, etc.)
- [ ] Review Laravel logs for audit trail

---

## Rollback Plan

If needed to revert:

1. Remove email automation config from config/services.php
2. Remove .env variables
3. Revert MailController to simpler Socialite implementation
4. Clear cached configs: `php artisan config:clear`

However, **no database changes** were made, so data is safe.

---

## Next Steps

1. **Immediate**: Set up separate OAuth apps as documented
2. **Before Production**: Test all connection flows thoroughly
3. **Optional**: Implement token refresh mechanism
4. **Optional**: Set up webhooks for real-time emails
5. **Optional**: Add auto-reply functionality

---

## Documentation Created

📄 **EMAIL_AUTOMATION_OAUTH_SETUP.md** - Full setup guide with:
- Architecture diagram
- Step-by-step setup instructions
- Gmail OAuth app creation
- Outlook OAuth app creation
- Troubleshooting guide
- Security considerations
- Quick reference

---

## Support

If you encounter issues:

1. Check .env variables are set correctly
2. Verify OAuth apps are created with correct redirect URIs
3. Review Laravel logs: `storage/logs/laravel.log`
4. Check database: `SELECT * FROM email_accounts;`
5. Consult EMAIL_AUTOMATION_OAUTH_SETUP.md troubleshooting section

---

**Summary**: Email automation now uses **separate OAuth credentials** from user authentication, providing better security, scope isolation, and independent rate limiting. ✅
