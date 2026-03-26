# Google Login with Gmail Account Linking

## Overview

This feature allows users to seamlessly link their Gmail account for email automation during the Google OAuth login process. Instead of requiring a separate email automation OAuth flow, users can optionally link their Gmail account when logging in with Google.

## Architecture

### Key Features

1. **Dual-Purpose OAuth Flow**: The Google OAuth redirect can serve both authentication and Gmail linking
2. **Session-Based State Management**: Uses Laravel session to track whether email linking is requested
3. **Automatic EmailAccount Creation**: Upon login with `link_email=1`, an EmailAccount record is created with Gmail credentials
4. **Encrypted Token Storage**: OAuth tokens are encrypted using Laravel's Crypt facade
5. **Graceful Fallback**: If linking fails, user still gets logged in
6. **Duplicate Prevention**: Prevents linking the same Gmail account multiple times

## Implementation Details

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ User Clicks "Login with Google + Link Email"                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ /auth/google?link_email=1                                       │
│ - Store 'oauth_link_email' = true in session                    │
│ - Request Gmail scopes: email, profile, gmail.readonly          │
│ - Redirect to Google                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Google OAuth Flow (User Authorization)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ /google/callback                                                │
│ - Exchange code for tokens via Socialite                        │
│ - Create/Find user by email                                     │
│ - Login user                                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ linkGmailAccount() - If oauth_link_email session exists         │
│ - Verify Gmail not already linked                               │
│ - Extract tokens: access_token, refresh_token, expires_at       │
│ - Create EmailAccount record with:                              │
│   * user_id: authenticated user                                 │
│   * provider: 'gmail'                                           │
│   * email_address: $googleUser->email                           │
│   * credentials: encrypted tokens                               │
│   * settings: { linked_via: 'google_oauth_login', ... }         │
│ - Clear oauth_link_email from session                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Redirect to /new (authenticated + Gmail linked)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Usage

### For Users

#### Option 1: Login without Email Linking (Standard Flow)
```
1. Visit login page
2. Click "Login with Google"
3. Authorize on Google
4. Logged in - no email linking
```

#### Option 2: Login with Gmail Linking
```
1. Visit login page
2. Click "Login with Google + Link Email" (or similar UI button)
   OR navigate to: /auth/google?link_email=1
3. Authorize on Google (grants gmail.readonly scope)
4. Logged in + Gmail automatically linked to your account
5. Ready to use email automation features
```

### For Developers

#### Redirect to Google Login with Email Linking
```php
// In your frontend or Blade template
// Option 1: Direct link
<a href="{{ route('auth.google', ['link_email' => '1']) }}">
    Login with Google + Link Email
</a>

// Option 2: Via Inertia.js
import { router } from '@inertiajs/react';

const handleLoginWithEmailLink = () => {
    router.visit(route('auth.google', { link_email: '1' }), {
        method: 'get',
    });
};
```

#### Check if User Has Gmail Linked
```php
use Illuminate\Support\Facades\Auth;

$user = Auth::user();
$gmailLinked = $user->emailAccounts()
    ->where('provider', 'gmail')
    ->exists();

if ($gmailLinked) {
    // User has Gmail linked, can use email automation
}
```

#### Get User's Linked Gmail Account
```php
$gmailAccount = Auth::user()->emailAccounts()
    ->where('provider', 'gmail')
    ->first();

if ($gmailAccount) {
    $email = $gmailAccount->email_address;
    $credentials = $gmailAccount->credentials; // Array with access_token, refresh_token, etc.
}
```

## Database Schema

### EmailAccount Table
```sql
CREATE TABLE email_accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id CHAR(36) NOT NULL,  -- UUID
    provider VARCHAR(255),       -- 'gmail', 'outlook', 'imap'
    email_address VARCHAR(255),
    credentials JSON,            -- Encrypted: {access_token, refresh_token, expires_at, token_type, scope}
    settings JSON,               -- {linked_via, linked_at, auto_sync, ...}
    is_active BOOLEAN,
    last_synced_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Credentials Storage Format
```json
{
    "access_token": "ya29.a0AfH6SMB...",
    "refresh_token": "1//0gYZ...",
    "expires_at": "2025-12-31 23:59:59",
    "token_type": "Bearer",
    "scope": "https://www.googleapis.com/auth/gmail.readonly"
}
```

### Settings Storage Format
```json
{
    "linked_via": "google_oauth_login",
    "linked_at": "2025-12-20 10:30:45",
    "auto_sync": true
}
```

## Code Changes

### Modified Files

#### 1. `app/Http/Controllers/Auth/GoogleController.php`

**Changes**:
- Added `Request $request` parameter to `redirectToGoogle()` method
- Check for `link_email=1` query parameter
- Store `oauth_link_email` flag in session
- Request Gmail scopes: `email`, `profile`, `gmail.readonly`
- Added new `handleGoogleCallback()` logic to check session flag
- New private method `linkGmailAccount()` to create EmailAccount record
- Comprehensive logging at each step
- Error handling that doesn't prevent login

**Key Methods**:
```php
public function redirectToGoogle(Request $request)
    // Check for link_email=1 query param
    // Store flag in session
    // Request appropriate scopes

public function handleGoogleCallback(Request $request)
    // Standard login flow
    // Check if email linking was requested
    // Call linkGmailAccount() if needed
    // Return to /new

private function linkGmailAccount(User $user, $googleUser)
    // Check for duplicate Gmail account linking
    // Extract access_token, refresh_token, expires_at
    // Create EmailAccount with encrypted credentials
    // Log success/failure
```

#### 2. `routes/auth.php`

**Changes**:
- Added comment documenting `?link_email=1` parameter usage
- No route changes, existing routes support the new parameter

## Security Considerations

### Token Security

1. **Encryption at Rest**: Credentials are encrypted using Laravel's `Crypt` facade
   ```php
   // Laravel handles encryption automatically for 'credentials' column
   $emailAccount->credentials = $credentialsArray; // Auto-encrypted on save
   $decryptedCredentials = $emailAccount->credentials; // Auto-decrypted on retrieval
   ```

2. **Session Security**: `oauth_link_email` flag stored only in session (not URL/cookies)
   - No sensitive data in query parameters
   - State management via CSRF-protected session

3. **Token Expiration**: Credentials include `expires_at` timestamp
   - Foundation for implementing token refresh mechanism
   - Validation of token freshness before API calls

4. **Scope Minimization**:
   - `gmail.readonly`: Only read-only access to emails
   - No compose/send permissions during linking
   - Additional scopes can be requested later if needed

### Validation & Error Handling

1. **Email Validation**: Checks that Google user has email address
2. **Duplicate Prevention**: Prevents linking same Gmail multiple times
3. **Graceful Fallback**: Login succeeds even if linking fails
4. **Comprehensive Logging**: All operations logged for audit trail

## Audit Logging

All significant operations are logged:

```php
// New user creation
Log::info('New user created via Google OAuth', [
    'user_id' => $user->id,
    'email' => $user->email,
]);

// Email linking initiated
Log::info('Gmail account linked during Google login', [
    'user_id' => $user->id,
    'email_address' => $googleUser->email,
]);

// Successful link
Log::info('Gmail account successfully linked via Google OAuth login', [
    'user_id' => $user->id,
    'email_account_id' => $emailAccount->id,
    'email_address' => $googleUser->email,
]);

// Failures
Log::error('Failed to link Gmail account', [
    'user_id' => $user->id,
    'email_address' => $googleUser->email ?? 'unknown',
    'error' => $e->getMessage(),
]);
```

## Testing

### Manual Testing

#### Test 1: Standard Google Login (without Email Linking)
1. Visit `/auth/google`
2. Complete Google authorization
3. Verify: User created/authenticated, no EmailAccount created

#### Test 2: Google Login with Email Linking
1. Visit `/auth/google?link_email=1`
2. Complete Google authorization
3. Verify: User authenticated, EmailAccount record created
4. Check database: `SELECT * FROM email_accounts WHERE user_id = ?`

#### Test 3: Duplicate Prevention
1. Link Gmail once via `/auth/google?link_email=1`
2. Login again via `/auth/google?link_email=1`
3. Verify: Only one EmailAccount for Gmail (no duplicate created)

#### Test 4: Error Handling
1. Simulate missing email in Google response
2. Verify: Graceful error message, no crash

### Automated Testing (PHPUnit/Pest)

```php
// Test successful linking
test('user can link gmail during google login', function () {
    // Mock Socialite response
    // Call handleGoogleCallback with oauth_link_email in session
    // Assert EmailAccount created
});

// Test duplicate prevention
test('prevents duplicate gmail account linking', function () {
    // Create existing EmailAccount for user+gmail
    // Try to link again
    // Assert no duplicate created
});

// Test graceful fallback
test('login succeeds even if gmail linking fails', function () {
    // Mock EmailAccount creation failure
    // Assert user still authenticated
});
```

## Future Enhancements

1. **Token Refresh Mechanism**:
   - Use stored `refresh_token` when `access_token` expires
   - Automatic background token refresh

2. **Multiple OAuth Providers**:
   - Extend to support Microsoft/Outlook linking during Microsoft OAuth login
   - Support iCloud, Yahoo, etc.

3. **Post-Login Linking**:
   - Add UI page for linking Gmail after login (separate from login flow)
   - Route: POST `/user/link-email-account`

4. **Advanced Scopes**:
   - Allow users to grant additional scopes on demand
   - Compose/send permissions with explicit user consent

5. **Webhook Integration**:
   - Push notifications for new emails using Google Pub/Sub
   - Real-time email sync instead of polling

6. **Account Management**:
   - UI to list linked email accounts
   - Option to unlink/disconnect accounts
   - Refresh/re-authorize tokens

## Troubleshooting

### Gmail Account Not Linked After Login

**Symptom**: User logs in successfully but no EmailAccount created

**Possible Causes**:
1. `link_email=1` parameter not in URL
2. Session not properly configured (check `SESSION_DRIVER` in .env)
3. Duplicate EmailAccount already exists
4. Google OAuth not configured with Gmail scopes

**Solution**:
- Check browser console for redirect URL
- Verify `SESSION_DRIVER=database` or similar persistent driver
- Check logs: `storage/logs/laravel.log`
- Query database: `SELECT * FROM email_accounts WHERE user_id = ?`

### Token Expiration Issues

**Symptom**: "Invalid access token" when using Gmail API

**Cause**: Token has expired (typically 1 hour after issuing)

**Solution** (Short-term): Re-link Gmail via login
**Solution** (Long-term): Implement token refresh mechanism

### Multiple EmailAccounts for Same User

**Symptom**: Duplicate Gmail accounts in database

**Cause**: Duplicate linking or race condition

**Solution**:
```php
// Clean up duplicates
$duplicates = EmailAccount::where('user_id', $userId)
    ->where('provider', 'gmail')
    ->get()
    ->skip(1); // Keep first one

$duplicates->each->delete();
```

## API Reference

### Models & Relationships

#### User Model
```php
// Get all email accounts
$user->emailAccounts() // HasMany relationship

// Get Gmail account
$gmailAccount = $user->emailAccounts()
    ->where('provider', 'gmail')
    ->first();
```

#### EmailAccount Model
```php
// Access credentials (auto-decrypted)
$credentials = $emailAccount->credentials;
$accessToken = $credentials['access_token'];
$refreshToken = $credentials['refresh_token'];
$expiresAt = $credentials['expires_at']; // DateTime string

// Access settings
$settings = $emailAccount->settings;
$linkedVia = $settings['linked_via']; // 'google_oauth_login'
$linkedAt = $settings['linked_at']; // DateTime string
```

### Environment Variables

No new environment variables required. This feature uses existing `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `config/services.php`.

## Migration Path

### For Existing Users

Existing users can still use the separate email automation OAuth flow:
- Route: `/emails/connect/gmail`
- No changes needed to current implementation

### Recommended Workflow

1. New users: Use Google login with email linking (seamless)
2. Existing users: Can continue with separate email automation flow
3. Gradual migration: Offer email linking on user settings page

## Version History

- **v1.0** (Initial): Basic Gmail linking during Google login
  - Single provider support (Gmail only)
  - Session-based state management
  - Encrypted credential storage

## Related Documentation

- [Email Automation OAuth Separation](./EMAIL_AUTOMATION_OAUTH_SETUP.md) - Original email automation OAuth setup
- [Email OAuth Quick Setup](./EMAIL_OAUTH_QUICK_SETUP.md) - Quick reference for email OAuth configuration
- [Google OAuth Security Best Practices](./GOOGLE_OAUTH_SECURITY.md) - Coming soon
