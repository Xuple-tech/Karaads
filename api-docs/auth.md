# KaraAds v1.2 Auth API

Base URL: `https://karaads.com/api/open-labs/oyibo/v1.2`

All responses use the v1.2 envelope:

```json
{
  "success": true,
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "details": {}
  }
}
```

## Headers

For authenticated endpoints, include:

```
Authorization: Bearer {TOKEN}
Content-Type: application/json
Accept: application/json
```ok

## Public Auth Endpoints

### Login
`POST /auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "two_factor_code": "123456"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "bearer-token"
  }
}
```

Account setup required (403):
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SETUP_REQUIRED",
    "message": "Account setup required. Use the 8-character code sent to your email, then set your password.",
    "details": {
      "requires_email_verification": true,
      "requires_password_setup": true,
      "next_actions": ["verify_email_code", "set_password"]
    }
  }
}
```

### Register
`POST /auth/register`

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "username": "jane",
  "password": "SecurePass@123",
  "password_confirmation": "SecurePass@123"
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "bearer-token"
  }
}
```

### Verify 2FA (Login Challenge)
`POST /auth/verify-2fa`

Request:
```json
{
  "email": "user@example.com",
  "two_factor_code": "123456"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "bearer-token"
  }
}
```

## Imported Account Setup

### Send Activation Code
`POST /auth/account-activation/send-code`

Request:
```json
{ "email": "user@example.com" }
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "activation-code-sent" }
}
```

### Verify Activation Code
`POST /auth/account-activation/verify-code`

Request:
```json
{ "email": "user@example.com", "code": "ABCDEFGH" }
```

Response (200):
```json
{
  "success": true,
  "data": {
    "activation_token": "...",
    "expires_in": 900
  }
}
```

### Set Password
`POST /auth/account-activation/set-password`

Request:
```json
{
  "activation_token": "...",
  "password": "NewPassword@123",
  "password_confirmation": "NewPassword@123"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "status": "password-set",
    "next_action": "login"
  }
}
```

## Password Reset

### Request Reset Link
`POST /auth/password/forgot`

Request:
```json
{ "email": "user@example.com" }
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "reset-link-sent" }
}
```

### Reset Password
`POST /auth/password/reset`

Request:
```json
{
  "email": "user@example.com",
  "token": "reset-token",
  "password": "NewPassword@123",
  "password_confirmation": "NewPassword@123"
}
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "password-reset" }
}
```

## Authenticated Endpoints (No Email Verification Required)

### Email Verification OTP
`POST /auth/verify-email/otp/send-code`

Request:
```json
{ "email": "user@example.com" }
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "verification-code-sent" }
}
```

`POST /auth/verify-email/otp/verify-code`

Request:
```json
{ "email": "user@example.com", "code": "ABCDEFGH" }
```

Response (200):
```json
{
  "success": true,
  "data": {
    "status": "email-verified",
    "redirect": "/profile"
  }
}
```

### Change Password
`POST /auth/password/change`

Request:
```json
{
  "current_password": "OldPassword@123",
  "password": "NewPassword@123",
  "password_confirmation": "NewPassword@123"
}
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "password-updated" }
}
```

### Two-Factor Authentication

Enable 2FA:
`POST /auth/2fa/enable`

Request:
```json
{ "current_password": "Password@123" }
```

Response (200):
```json
{
  "success": true,
  "data": {
    "qr_svg": "<svg>...</svg>",
    "otp_url": "otpauth://...",
    "recovery_codes": ["..."],
    "requires_confirmation": true
  }
}
```

Confirm 2FA:
`POST /auth/2fa/confirm`

Request:
```json
{ "code": "123456" }
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "2fa-confirmed" }
}
```

Disable 2FA:
`POST /auth/2fa/disable`

Request:
```json
{ "current_password": "Password@123" }
```

Response (200):
```json
{
  "success": true,
  "data": { "status": "2fa-disabled" }
}
```

Recovery codes:
`POST /auth/2fa/recovery-codes`

Request:
```json
{ "current_password": "Password@123", "regenerate": false }
```

Response (200):
```json
{
  "success": true,
  "data": { "recovery_codes": ["..."] }
}
```

## Authenticated Endpoints (Verified Email Required)

### Current User
`GET /auth/me`

Response (200):
```json
{
  "success": true,
  "data": { /* user object */ }
}
```

### Logout
`POST /auth/logout`

Response (200):
```json
{ 
  "success": true,
  "message": "Successfully logged out"
}
```
