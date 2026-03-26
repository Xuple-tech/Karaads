# Email Automation OAuth Setup Guide

## Overview

The email automation feature uses **separate OAuth credentials** from user authentication. This allows:
- ✅ Different redirect URIs for email account linking vs. user login
- ✅ Separate OAuth application configurations on Google and Microsoft
- ✅ Better security and scope isolation
- ✅ Independent rate limiting for each OAuth flow

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│            USER AUTHENTICATION (routes/auth.php)     │
├─────────────────────────────────────────────────────┤
│  Google OAuth App #1 (User Login)                   │
│  - Redirect URI: https://yourapp.com/google/callback│
│  - Scopes: openid profile email                     │
│  - Handler: GoogleController                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│       EMAIL AUTOMATION (routes/web.php - Auth)      │
├─────────────────────────────────────────────────────┤
│  Gmail OAuth App #2 (Email Automation)              │
│  - Redirect URI: https://yourapp.com/emails/callback/gmail │
│  - Scopes: gmail.readonly, gmail.send               │
│  - Handler: MailController::gmailCallback()         │
│                                                      │
│  Outlook OAuth App #3 (Email Automation)            │
│  - Redirect URI: https://yourapp.com/emails/callback/outlook │
│  - Scopes: Mail.ReadWrite, Mail.Send                │
│  - Handler: MailController::outlookCallback()       │
└─────────────────────────────────────────────────────┘
```

---

## Configuration Files

### 1. **config/services.php**
Contains all OAuth configurations:

```php
'email_automation' => [
    'gmail' => [
        'client_id' => env('EMAIL_AUTOMATION_GMAIL_CLIENT_ID'),
        'client_secret' => env('EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET'),
        'redirect_uri' => env('EMAIL_AUTOMATION_GMAIL_REDIRECT_URI', 
                              env('APP_URL') . '/emails/callback/gmail'),
    ],
    'outlook' => [
        'client_id' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID'),
        'client_secret' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET'),
        'redirect_uri' => env('EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI', 
                              env('APP_URL') . '/emails/callback/outlook'),
        'tenant_id' => env('EMAIL_AUTOMATION_OUTLOOK_TENANT_ID', 'common'),
    ],
],
```

### 2. **.env.example**
All required environment variables:

```bash
# Gmail Email Automation (separate from user login)
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=your_gmail_oauth_app_id.apps.googleusercontent.com
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=your_gmail_oauth_app_secret
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=https://yourapp.com/emails/callback/gmail

# Outlook Email Automation (separate from user login)
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=your_outlook_oauth_app_id
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=your_outlook_oauth_app_secret
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=https://yourapp.com/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=common
```

### 3. **routes/web.php**
Email automation routes (authenticated users only):

```php
Route::middleware('auth')->group(function () {
    // Email OAuth routes
    Route::get('/emails/connect/gmail', [MailController::class, 'connectGmail'])
        ->name('emails.connect.gmail');
    Route::get('/emails/callback/gmail', [MailController::class, 'gmailCallback'])
        ->name('emails.callback.gmail');
    
    Route::get('/emails/connect/outlook', [MailController::class, 'connectOutlook'])
        ->name('emails.connect.outlook');
    Route::get('/emails/callback/outlook', [MailController::class, 'outlookCallback'])
        ->name('emails.callback.outlook');
});
```

---

## Setup Instructions

### Step 1: Create Gmail OAuth App for Email Automation

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `YourApp - Email Automation`
3. Enable APIs:
   - Gmail API
   - Google+ API
4. Create OAuth 2.0 credentials (Desktop application or Web application)
5. Configure OAuth consent screen:
   - User type: External
   - Required scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
6. In Authorized redirect URIs, add:
   ```
   https://yourapp.com/emails/callback/gmail
   ```
7. Copy Client ID and Client Secret

**In your .env file:**
```bash
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=xxx
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=https://yourapp.com/emails/callback/gmail
```

### Step 2: Create Outlook OAuth App for Email Automation

1. Go to [Azure Portal](https://portal.azure.com/) → App registrations
2. Create new application: `YourApp - Email Automation`
3. Configure authentication:
   - Redirect URI (Web): `https://yourapp.com/emails/callback/outlook`
4. Configure API permissions (Add):
   - Mail.ReadWrite
   - Mail.Send
   - offline_access (for refresh tokens)
5. Create client secret (copy Value, not ID)
6. Note the Tenant ID (Directory ID)

**In your .env file:**
```bash
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=xxx
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=xxx
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=https://yourapp.com/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=xxx (or 'common' for multi-tenant)
```

---

## How It Works

### Gmail Connection Flow

1. **User clicks "Connect Gmail"**
   ```
   Button → Route: /emails/connect/gmail
   ```

2. **MailController::connectGmail() is called**
   ```php
   - Gets email automation Gmail credentials from config
   - Builds OAuth authorization URL
   - Redirects user to Google OAuth consent screen
   ```

3. **Google OAuth Consent Screen**
   ```
   - User sees permissions (read emails, send emails)
   - User clicks "Allow"
   - Google redirects to: /emails/callback/gmail?code=xxx&state=yyy
   ```

4. **MailController::gmailCallback() is called**
   ```php
   - Validates CSRF state token
   - Exchanges authorization code for access token
   - Makes API call to get user email
   - Stores encrypted credentials in database
   - Starts email sync in background
   - Redirects user back to /mails with success message
   ```

5. **Stored in EmailAccount Model**
   ```json
   {
     "user_id": 1,
     "provider": "gmail",
     "email_address": "user@gmail.com",
     "credentials": {
       "access_token": "encrypted_token_xxx",
       "refresh_token": "encrypted_refresh_xxx",
       "expires_in": 3600,
       "expires_at": "2024-01-20 10:30:00"
     },
     "is_active": true
   }
   ```

### Outlook Connection Flow

Same process as Gmail, but:
- Uses Microsoft OAuth endpoints
- Scopes: Mail.ReadWrite, Mail.Send, offline_access
- User info endpoint: `https://graph.microsoft.com/v1.0/me`
- Tenant ID configurable for different Azure organizations

---

## Key Features of Implementation

### 1. **CSRF Protection**
```php
// Generate state token
'state' => session()->token()

// Validate on callback
if ($request->state !== session()->token()) {
    return redirect()->route('user.library')->with('error', 'Security validation failed');
}
```

### 2. **Error Handling**
```php
// Google OAuth errors
if ($request->has('error')) {
    // user_cancelled_login, access_denied, etc.
}

// Network/API errors caught with try-catch
// User-friendly error messages displayed
```

### 3. **Credential Storage**
```php
// Credentials automatically encrypted with Laravel's Crypt facade
'credentials' => [
    'access_token' => $tokenData['access_token'],
    'refresh_token' => $tokenData['refresh_token'],
    'expires_at' => now()->addSeconds($tokenData['expires_in']),
]
// Stored encrypted, decrypted when needed
```

### 4. **Token Refresh (Ready to Implement)**
```php
// When access token expires:
if ($account->credentials['expires_at'] < now()) {
    // Use refresh token to get new access token
    // Update credentials in database
}
```

### 5. **Audit Logging**
```php
Log::info('Gmail account connected successfully', [
    'user_id' => Auth::id(),
    'email' => $email,
    'account_id' => $emailAccount->id,
]);
```

---

## Routes Summary

| Route | Method | Handler | Purpose |
|-------|--------|---------|---------|
| `/emails/connect/gmail` | GET | `MailController@connectGmail` | Start Gmail OAuth flow |
| `/emails/callback/gmail` | GET | `MailController@gmailCallback` | Handle Gmail OAuth callback |
| `/emails/connect/outlook` | GET | `MailController@connectOutlook` | Start Outlook OAuth flow |
| `/emails/callback/outlook` | GET | `MailController@outlookCallback` | Handle Outlook OAuth callback |
| `/mails` | GET | `MailController@mails` | Email dashboard |
| `/emails/accounts/{id}/emails` | GET | `MailController@showEmails` | View emails for account |

---

## Database Schema

### EmailAccount Table
```sql
CREATE TABLE email_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50),  -- 'gmail' or 'outlook'
    email_address VARCHAR(255),
    credentials JSON,  -- Encrypted: {access_token, refresh_token, expires_at}
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Testing the Setup

### 1. **Test Gmail Connection**
```
1. Go to /mails (email dashboard)
2. Click "Connect Gmail Account"
3. You'll be redirected to Google OAuth consent screen
4. Click "Allow"
5. You should be redirected back with "Gmail account connected successfully"
6. Your email should appear in the connected accounts list
```

### 2. **Test Outlook Connection**
```
1. Go to /mails (email dashboard)
2. Click "Connect Outlook Account"
3. You'll be redirected to Microsoft login
4. Enter your Microsoft credentials
5. Click "Accept"
6. You should be redirected back with "Outlook account connected successfully"
7. Your email should appear in the connected accounts list
```

### 3. **Verify Database**
```sql
SELECT * FROM email_accounts 
WHERE user_id = 1;

-- Should show:
-- id: 1
-- provider: gmail
-- email_address: your-email@gmail.com
-- credentials: (encrypted JSON)
-- is_active: 1
```

### 4. **Test Error Scenarios**
```
1. Try connecting same account twice → Error: "already connected"
2. Close browser during OAuth → Error: "security validation failed"
3. Disconnect and reconnect → Should work fine
```

---

## Troubleshooting

### Issue: "Missing authorization code from Gmail"
**Solution**: 
- Verify Gmail OAuth app is created
- Check redirect URI matches exactly in Google Console
- Make sure app is not in development mode restrictions

### Issue: "Failed to obtain access token"
**Solution**:
- Verify client ID and secret in .env
- Check environment is loaded: `php artisan config:cache`
- Review error logs: `storage/logs/laravel.log`

### Issue: "Security validation failed"
**Solution**:
- Server session might not be working
- Check `SESSION_DRIVER` in .env (should be 'database')
- Run `php artisan migrate` to create sessions table
- Clear browser cookies

### Issue: "Email account already connected"
**Solution**:
- User already connected this email
- To reconnect: Delete the old account first from dashboard
- Then connect again

### Issue: "Redirect URI mismatch"
**Solution**:
- Must match EXACTLY in OAuth app settings:
  - Including protocol (https vs http)
  - Including trailing slashes
  - No URL parameters
- Development: `http://localhost/emails/callback/gmail`
- Production: `https://yourdomain.com/emails/callback/gmail`

---

## Security Considerations

1. **OAuth Credentials**
   - Never share CLIENT_SECRET
   - Store only in .env (not in code)
   - Use strong secrets (40+ characters)

2. **Access Tokens**
   - Always encrypted in database
   - Never logged to files
   - Automatically decrypted only when needed

3. **CSRF Protection**
   - State token validates redirect origin
   - Prevents OAuth code interception

4. **HTTPS Requirement**
   - OAuth requires HTTPS in production
   - Development can use http://localhost
   - Always use HTTPS for deployed apps

5. **Scope Minimization**
   - Request only needed permissions
   - Gmail: readonly + send (not full access)
   - Outlook: Mail.ReadWrite + Mail.Send (not admin scopes)

---

## Next Steps

After setup completes:

1. **Test Connection** - Follow testing section above
2. **Implement Token Refresh** - Handle expired tokens automatically
3. **Set Up Webhooks** - Receive real-time message notifications
4. **Enable Auto-Reply** - Send automated responses
5. **Monitor Usage** - Track synced emails and API calls

---

## File Locations

```
Configuration:
- config/services.php                          (OAuth app configs)
- .env.example                                 (template for env vars)
- .env                                         (actual env vars - local only)

Routes:
- routes/web.php (lines 88-92)                (email auth routes)

Controller:
- app/Http/Controllers/MailController.php     (Gmail & Outlook OAuth handlers)

Database:
- app/Models/EmailAccount.php                 (Email account model)
- database/migrations/...email_accounts.php   (Schema)

Documentation:
- EMAIL_AUTOMATION_OAUTH_SETUP.md             (This file)
```

---

## Quick Reference

### Gmail Scopes
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.send` - Send emails

### Outlook Scopes
- `https://graph.microsoft.com/Mail.ReadWrite` - Read/write mail
- `https://graph.microsoft.com/Mail.Send` - Send mail
- `offline_access` - Get refresh token

### Environment Variables Needed
```bash
# Gmail
EMAIL_AUTOMATION_GMAIL_CLIENT_ID
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI

# Outlook
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID
```

---

**Last Updated**: 2025-01-20
**Status**: Production Ready ✅
