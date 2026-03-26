# Google Login with Gmail Linking - Testing & Verification Guide

## Pre-Testing Checklist

- [ ] GoogleController.php updated with Gmail linking logic
- [ ] routes/auth.php updated with documentation comment
- [ ] User model has emailAccounts relationship
- [ ] EmailAccount model exists and supports credentials storage
- [ ] Session driver configured (database, redis, not array)
- [ ] Google OAuth credentials configured in .env
- [ ] Gmail scopes requested: `email`, `profile`, `gmail.readonly`

## Testing Environments

### Local Development Testing

#### Setup

1. **Verify Environment Configuration**
```bash
# Check session driver
php artisan tinker
>>> config('session.driver')
// Should output: 'database' or 'redis', NOT 'array'

# Check Google OAuth config
>>> config('services.google')
// Should show client_id, client_secret, redirect
```

2. **Database Setup**
```bash
# If using database session driver
php artisan migrate

# Verify email_accounts table
php artisan tinker
>>> Schema::hasTable('email_accounts')
// true
```

3. **Clear Caches**
```bash
php artisan cache:clear
php artisan config:clear
php artisan session:clear
php artisan view:clear
```

### Testing Scenarios

## Test Case 1: Standard Google Login (No Email Linking)

### Pre-conditions
- User not logged in
- No EmailAccount exists for test user

### Steps
1. Navigate to `/login`
2. Click "Login with Google" button
3. Authenticate with test Google account
4. Authorize OAuth permissions

### Expected Results
- ✅ User is authenticated
- ✅ Redirect to `/new` (intended page)
- ✅ No EmailAccount created in database
- ✅ Log shows: "New user created via Google OAuth" (if new user)

### Verification
```php
// In tinker
$user = App\Models\User::where('email', 'test@gmail.com')->first();
$user->emailAccounts()->count(); // Should be 0
```

---

## Test Case 2: Google Login with Email Linking

### Pre-conditions
- User not logged in
- No existing EmailAccount for test email

### Steps
1. Navigate to `/auth/google?link_email=1`
2. Authenticate with test Google account
3. Authorize OAuth permissions (including Gmail scopes)

### Expected Results
- ✅ User is authenticated
- ✅ Redirect to `/new`
- ✅ EmailAccount created with:
  - `provider` = 'gmail'
  - `email_address` = authenticated user's email
  - `credentials` = encrypted tokens
  - `is_active` = true
- ✅ Logs show both creation and linking success

### Verification
```php
// In tinker
$emailAccount = App\Models\EmailAccount::where('provider', 'gmail')
    ->where('email_address', 'test@gmail.com')
    ->first();

// Verify structure
$emailAccount->email_address;  // test@gmail.com
$emailAccount->is_active;      // true
$emailAccount->credentials;    // Array: [access_token, refresh_token, expires_at, ...]
$emailAccount->settings;       // Array: [linked_via => 'google_oauth_login', ...]

// Verify credentials are encrypted in database
DB::table('email_accounts')->find($emailAccount->id)->credentials;
// Should be long encrypted string in database, not readable
```

### Database Check
```sql
SELECT 
    id, 
    user_id, 
    provider, 
    email_address, 
    is_active, 
    LENGTH(credentials) as encrypted_length,
    settings,
    created_at
FROM email_accounts 
WHERE provider = 'gmail' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Test Case 3: Duplicate Prevention

### Pre-conditions
- User already has Gmail EmailAccount linked
- User logged out

### Steps
1. Navigate to `/auth/google?link_email=1`
2. Same Google account authenticates and authorizes
3. System attempts to create EmailAccount again

### Expected Results
- ✅ User is authenticated
- ✅ No new EmailAccount created
- ✅ Existing EmailAccount is preserved
- ✅ Log shows: "Gmail account already linked for user"

### Verification
```php
// Count EmailAccounts for this user
$user = App\Models\User::where('email', 'test@gmail.com')->first();
$count = $user->emailAccounts()
    ->where('provider', 'gmail')
    ->count();
    
// Should be exactly 1, not incremented
echo $count; // 1
```

---

## Test Case 4: Session Flag Handling

### Pre-conditions
- Session driver is working

### Steps
1. Examine session before OAuth redirect
2. Navigate to `/auth/google?link_email=1`
3. Examine session during OAuth process
4. Complete OAuth flow

### Expected Results
- ✅ `oauth_link_email` flag set to true in session
- ✅ Flag cleared after callback completes
- ✅ EmailAccount created (linkGmailAccount called)

### Verification
```php
// Test session persistence
Route::get('/test-session', function () {
    session(['oauth_link_email' => true]);
    return response()->json(session()->all());
});

// Verify in logs
// storage/logs/laravel.log should show:
// - 'Gmail account linked during Google login'
// - 'Gmail account successfully linked via Google OAuth login'
```

---

## Test Case 5: Error Handling - Missing Email

### Pre-conditions
- Google OAuth configured to return null email (if possible)
- Otherwise, use fixture/mock

### Steps
1. Trigger OAuth callback without email in response
2. System attempts to process callback

### Expected Results
- ✅ Error caught with message "Google account does not have an email address"
- ✅ Redirect to `/login` with error message
- ✅ No user created
- ✅ Comprehensive error logged

### Verification
```php
// Check logs for error
// storage/logs/laravel.log:
// "Google account does not have an email address"
```

---

## Test Case 6: Credentials Structure Verification

### Pre-conditions
- Gmail linked via login

### Steps
1. Query EmailAccount credentials
2. Verify all required fields present
3. Verify encryption

### Expected Results
- ✅ Credentials array contains:
  - `access_token` (string)
  - `refresh_token` (string)
  - `expires_at` (datetime string)
  - `token_type` (Bearer)
  - `scope` (gmail.readonly URL)
- ✅ Settings array contains:
  - `linked_via` (google_oauth_login)
  - `linked_at` (datetime string)
  - `auto_sync` (boolean)

### Verification
```php
// In tinker
$emailAccount = App\Models\EmailAccount::where('provider', 'gmail')->first();

// These should be decrypted automatically by Laravel
$credentials = $emailAccount->credentials;
$settings = $emailAccount->settings;

echo $credentials['access_token'];      // Should be readable
echo $credentials['refresh_token'];     // Should be readable
echo $credentials['expires_at'];        // 2025-12-31 23:59:59
echo $credentials['token_type'];        // Bearer
echo $credentials['scope'];             // gmail.readonly URL

echo $settings['linked_via'];           // google_oauth_login
echo $settings['linked_at'];            // Timestamp
echo $settings['auto_sync'];            // true/false

// In raw database, should be encrypted
DB::table('email_accounts')
    ->where('provider', 'gmail')
    ->first()->credentials;
// Should look like: "eyJpdiI6IjA3dzQ..." (encrypted blob)
```

---

## Test Case 7: User Model Relationships

### Pre-conditions
- Gmail linked for test user

### Steps
1. Load user model
2. Access emailAccounts relationship
3. Filter by Gmail provider

### Expected Results
- ✅ User loads without errors
- ✅ emailAccounts relationship returns collection
- ✅ Filter by provider works

### Verification
```php
// In tinker
$user = App\Models\User::where('email', 'test@gmail.com')->first();

// Relationship accessible
$emailAccounts = $user->emailAccounts;  // Collection
$emailAccounts->count();                // >= 1

// Filter by provider
$gmailAccount = $user->emailAccounts()
    ->where('provider', 'gmail')
    ->first();

echo $gmailAccount->email_address;      // test@gmail.com
```

---

## Test Case 8: Logging and Audit Trail

### Pre-conditions
- Logging configured to file or database

### Steps
1. Complete a login with email linking
2. Review logs for all events

### Expected Results
- ✅ Multiple log entries created
- ✅ Appropriate log levels used
- ✅ Context data included (user_id, email, etc.)

### Verification
```bash
# Check recent logs
tail -f storage/logs/laravel.log

# Should contain entries like:
# [2025-12-20 10:30:45] local.INFO: Gmail account linked during Google login {"user_id":"uuid-here","email_address":"test@gmail.com"}
# [2025-12-20 10:30:46] local.INFO: Gmail account successfully linked via Google OAuth login {"user_id":"uuid-here","email_account_id":123,"email_address":"test@gmail.com"}
```

---

## Test Case 9: CSRF Protection via Session

### Pre-conditions
- Session driver configured

### Steps
1. Verify oauth_link_email flag is session-based (not URL param)
2. Test that flag is cleared after use
3. Verify clean logout/login cycle

### Expected Results
- ✅ No sensitive data in URL query string
- ✅ Session flag properly set/cleared
- ✅ Reloading callback URL doesn't recreate duplicate

### Verification
```php
// Check URL during redirect
// Should look like: /auth/google?link_email=1
// NO: /auth/google?state=xyz&code=abc&session_token=xxx

// Verify session cleared
Route::get('/test-session-clear', function () {
    $flag = session('oauth_link_email', false);
    return response()->json(['oauth_link_email' => $flag]); // Should be false
});
```

---

## Automated Testing (PHPUnit/Pest)

### Test File: `tests/Feature/GoogleLoginGmailLinkingTest.php`

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\EmailAccount;
use Tests\TestCase;
use Illuminate\Support\Facades\Session;
use Laravel\Socialite\Facades\Socialite;
use Mockery;

class GoogleLoginGmailLinkingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Ensure persistent session for tests
        config(['session.driver' => 'array']);
    }

    /**
     * Test: Standard Google login without email linking
     */
    public function test_google_login_without_email_linking()
    {
        $this->mockGoogleUser([
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'access_token_123',
            'refreshToken' => 'refresh_token_123',
            'expiresIn' => 3600,
        ]);

        $response = $this->get('google/callback');

        $this->assertAuthenticated();
        $user = User::where('email', 'test@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(0, $user->emailAccounts()->count());
    }

    /**
     * Test: Google login with email linking
     */
    public function test_google_login_with_email_linking()
    {
        session(['oauth_link_email' => true]);

        $this->mockGoogleUser([
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'access_token_123',
            'refreshToken' => 'refresh_token_123',
            'expiresIn' => 3600,
        ]);

        $response = $this->get('google/callback');

        $this->assertAuthenticated();
        $user = User::where('email', 'test@gmail.com')->first();
        $emailAccount = $user->emailAccounts()
            ->where('provider', 'gmail')
            ->first();

        $this->assertNotNull($emailAccount);
        $this->assertEquals('gmail', $emailAccount->provider);
        $this->assertEquals('test@gmail.com', $emailAccount->email_address);
        $this->assertTrue($emailAccount->is_active);
        $this->assertEquals('google_oauth_login', $emailAccount->settings['linked_via']);
    }

    /**
     * Test: Duplicate prevention
     */
    public function test_prevents_duplicate_gmail_linking()
    {
        $user = User::factory()->create(['email' => 'test@gmail.com']);
        EmailAccount::create([
            'user_id' => $user->id,
            'provider' => 'gmail',
            'email_address' => 'test@gmail.com',
            'credentials' => ['access_token' => 'token123'],
            'is_active' => true,
        ]);

        session(['oauth_link_email' => true]);

        $this->mockGoogleUser([
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'new_access_token',
            'refreshToken' => 'new_refresh_token',
            'expiresIn' => 3600,
        ]);

        $response = $this->get('google/callback');

        // Should still be exactly 1
        $this->assertEquals(1, $user->emailAccounts()->count());

        // Original token should be preserved
        $emailAccount = $user->emailAccounts()->first();
        $this->assertEquals('token123', $emailAccount->credentials['access_token']);
    }

    /**
     * Test: Session flag removed after use
     */
    public function test_session_flag_cleared_after_linking()
    {
        session(['oauth_link_email' => true]);

        $this->mockGoogleUser([
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'access_token_123',
            'refreshToken' => 'refresh_token_123',
            'expiresIn' => 3600,
        ]);

        $response = $this->get('google/callback');

        // Flag should be cleared
        $this->assertFalse(session('oauth_link_email', false));
    }

    /**
     * Test: Credentials properly encrypted
     */
    public function test_credentials_are_encrypted()
    {
        session(['oauth_link_email' => true]);

        $this->mockGoogleUser([
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'access_token_123',
            'refreshToken' => 'refresh_token_123',
            'expiresIn' => 3600,
        ]);

        $response = $this->get('google/callback');

        $emailAccount = EmailAccount::where('provider', 'gmail')->first();

        // In database, should be encrypted
        $rawCredentials = \DB::table('email_accounts')
            ->find($emailAccount->id)
            ->credentials;
        $this->assertStringStartsWith('eyJpdiI6IiI', $rawCredentials); // Encrypted blob

        // But when accessed via model, should be decrypted
        $this->assertIsArray($emailAccount->credentials);
        $this->assertArrayHasKey('access_token', $emailAccount->credentials);
        $this->assertEquals('access_token_123', $emailAccount->credentials['access_token']);
    }

    /**
     * Helper: Mock Google user
     */
    private function mockGoogleUser($userData = [])
    {
        $defaults = [
            'id' => '12345',
            'email' => 'test@gmail.com',
            'name' => 'Test User',
            'token' => 'access_token_123',
            'refreshToken' => 'refresh_token_123',
            'expiresIn' => 3600,
        ];

        $userData = array_merge($defaults, $userData);

        $socialiteUser = Mockery::mock()
            ->shouldReceive('getId')->andReturn($userData['id'])
            ->shouldReceive('getEmail')->andReturn($userData['email'])
            ->shouldReceive('getName')->andReturn($userData['name'])
            ->shouldReceive('getAccessToken')->andReturn($userData['token'])
            ->shouldReceive('getRefreshToken')->andReturn($userData['refreshToken'])
            ->shouldReceive('getExpiresIn')->andReturn($userData['expiresIn'])
            ->getMock();

        $socialiteUser->id = $userData['id'];
        $socialiteUser->email = $userData['email'];
        $socialiteUser->name = $userData['name'];
        $socialiteUser->token = $userData['token'];
        $socialiteUser->refreshToken = $userData['refreshToken'];
        $socialiteUser->expiresIn = $userData['expiresIn'];

        Socialite::shouldReceive('driver->user')->andReturn($socialiteUser);
    }
}
```

### Running Tests

```bash
# Run all Google login tests
php artisan test tests/Feature/GoogleLoginGmailLinkingTest.php

# Run specific test
php artisan test tests/Feature/GoogleLoginGmailLinkingTest.php --filter test_google_login_with_email_linking

# With verbose output
php artisan test tests/Feature/GoogleLoginGmailLinkingTest.php -v
```

---

## Manual End-to-End Testing Checklist

### Day 1: Fresh User (New Account Creation)

- [ ] Visit `/auth/google?link_email=1`
- [ ] Click "Authorize" on Google
- [ ] Verify redirected to `/new`
- [ ] Check user created in database
- [ ] Check EmailAccount created
- [ ] Credentials encrypted in database
- [ ] User can access email settings
- [ ] Gmail shows as "linked"

### Day 2: Existing User (Linking to Account)

- [ ] Create user without email (standard `/auth/google` login)
- [ ] Logout
- [ ] Visit `/auth/google?link_email=1` with same account
- [ ] Verify same user logged in (no duplicate account)
- [ ] Verify EmailAccount created
- [ ] Gmail now shows as linked

### Day 3: Edge Cases

- [ ] Login twice with link_email=1 - no duplicate created
- [ ] Logout and login with standard flow - still have Gmail linked
- [ ] Check logs for all operations
- [ ] Verify session properly cleared

---

## Performance Testing

### Email Linking Impact

```bash
# Measure response time with/without linking
# Standard login (no linking)
curl -w "Time: %{time_total}s\n" https://yourapp.com/google/callback

# With linking
curl -w "Time: %{time_total}s\n" https://yourapp.com/google/callback
# (after setting session flag)

# Expected: < 200ms difference
```

---

## Security Testing

### Test 1: Token Exposure

```bash
# Verify tokens not in URL
# Should see: /google/callback?code=...&state=...
# Should NOT see: access_token, refresh_token, session_token

# Verify tokens encrypted in database
mysql> SELECT credentials FROM email_accounts LIMIT 1;
# Should show encrypted blob, not readable JSON
```

### Test 2: Session Hijacking

```php
// Verify oauth_link_email can't be exploited
$malicious_flag = 'select * from users; --';
session(['oauth_link_email' => $malicious_flag]);

// System should only check for boolean true, not execute
$linkEmail = session('oauth_link_email', false);
if ($linkEmail === true) {
    // Only executes if exactly boolean true
}
```

---

## Rollback Testing

### If Issues Found

```bash
# No database schema changes needed (uses existing email_accounts table)
# If need to remove test data:

php artisan tinker
>>> App\Models\EmailAccount::where('provider', 'gmail')->delete()
>>> App\Models\User::where('email', 'test@gmail.com')->delete()
```

---

## Sign-Off Checklist

- [ ] All 9 test cases pass
- [ ] Automated tests pass
- [ ] No errors in logs
- [ ] No duplicate EmailAccounts created
- [ ] Credentials properly encrypted
- [ ] Session handling correct
- [ ] Email linking works end-to-end
- [ ] Fallback to standard login works
- [ ] Documentation updated

## Deployment Readiness

After all tests pass:

1. [ ] Code reviewed by team
2. [ ] Tested in staging environment
3. [ ] Analytics dashboard configured
4. [ ] User documentation prepared
5. [ ] Support team trained
6. [ ] Monitoring alerts configured
7. [ ] Rollback plan documented
8. [ ] Deploy to production
