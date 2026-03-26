# Email Automation OAuth - Quick Setup (5 Min)

## What Changed ✅

Your email automation OAuth now uses **SEPARATE credentials** from user login:
- ✅ Gmail OAuth App #2 for email automation (different from user login)
- ✅ Outlook OAuth App #2 for email automation (different from user login)
- ✅ Different redirect URIs to prevent conflicts
- ✅ Enhanced security with CSRF protection

---

## Quick Setup (In 5 Steps)

### Step 1: Create Gmail OAuth App for Email Automation

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **Create Project** → Name: `RheaApp - Email Automation`
3. Search for **Gmail API** → Click Enable
4. Go to **Credentials** → **Create Credentials** → OAuth 2.0 Client ID
5. Choose **Web application**
6. Add authorized redirect URI:
   ```
   https://yourapp.com/emails/callback/gmail
   ```
   (For local: `http://localhost/emails/callback/gmail`)
7. Copy **Client ID** and **Client Secret**

### Step 2: Create Outlook OAuth App for Email Automation

1. Go to **[Azure Portal](https://portal.azure.com/)** → App registrations
2. Click **New registration** → Name: `RheaApp - Email Automation`
3. Add **Redirect URI** (Web):
   ```
   https://yourapp.com/emails/callback/outlook
   ```
   (For local: `http://localhost/emails/callback/outlook`)
4. Go to **API permissions** → Add permissions:
   - Microsoft Graph → Mail.ReadWrite
   - Microsoft Graph → Mail.Send
   - Microsoft Graph → offline_access
5. Go to **Certificates & secrets** → Create new client secret
6. Copy **Application (client) ID** and **Secret value**
7. Copy **Directory (tenant) ID** (or use `common`)

### Step 3: Update Your .env File

```bash
# Gmail Email Automation (from Step 1)
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=yyy
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=https://yourapp.com/emails/callback/gmail

# Outlook Email Automation (from Step 2)
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=xxx
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=yyy
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=https://yourapp.com/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=common
```

### Step 4: Clear Config Cache

```bash
php artisan config:clear
```

### Step 5: Test It!

1. Go to **http://localhost/mails** (or your app URL)
2. Click **"Connect Gmail Account"**
3. Sign in and allow permissions
4. You should see **"Gmail account connected successfully"** ✅
5. Repeat for Outlook

---

## That's It! 🎉

Your email automation OAuth is now configured with separate credentials.

---

## What Was Updated?

| File | Change |
|------|--------|
| `config/services.php` | Added `email_automation` config for Gmail and Outlook |
| `.env.example` | Added 8 new OAuth variables |
| `MailController.php` | Updated to use separate OAuth credentials with CSRF protection |

---

## Key Features

✅ **Separate OAuth Apps** - No conflict with user login  
✅ **CSRF Protection** - Secure state token validation  
✅ **Error Handling** - User-friendly error messages  
✅ **Token Encryption** - Credentials encrypted in database  
✅ **Audit Logging** - All actions logged  
✅ **Token Expiration** - Ready for refresh implementation  

---

## Troubleshooting

### "Redirect URI mismatch"
- Check exact match in OAuth app settings (including http vs https)
- Development: `http://localhost/emails/callback/gmail`
- Production: `https://yourdomain.com/emails/callback/gmail`

### "Missing CLIENT_ID"
- Verify .env variables are set
- Run `php artisan config:clear`
- Check `.env` file syntax (no quotes around values needed)

### "Security validation failed"
- Check `SESSION_DRIVER=database` in .env
- Run `php artisan migrate` (creates sessions table)
- Clear browser cookies

### "Email account already connected"
- User already connected this email
- Disconnect first, then reconnect

---

## Documentation Files Created

📄 **EMAIL_AUTOMATION_OAUTH_SETUP.md**
- Comprehensive setup guide (25+ sections)
- Architecture diagrams
- Security considerations
- Troubleshooting guide

📄 **EMAIL_AUTOMATION_OAUTH_CHANGES.md**
- Detailed changes summary
- Before/after comparison
- Security improvements

📄 **EMAIL_OAUTH_QUICK_SETUP.md** (this file)
- Quick 5-step setup guide

---

## Routes Available

| Route | Purpose |
|-------|---------|
| `/mails` | Email dashboard |
| `/emails/connect/gmail` | Start Gmail OAuth flow |
| `/emails/callback/gmail` | Gmail OAuth callback |
| `/emails/connect/outlook` | Start Outlook OAuth flow |
| `/emails/callback/outlook` | Outlook OAuth callback |

---

## Environment Variables Template

Copy to your `.env`:

```bash
# Email Automation - Gmail
EMAIL_AUTOMATION_GMAIL_CLIENT_ID=
EMAIL_AUTOMATION_GMAIL_CLIENT_SECRET=
EMAIL_AUTOMATION_GMAIL_REDIRECT_URI=http://localhost/emails/callback/gmail

# Email Automation - Outlook
EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID=
EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET=
EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI=http://localhost/emails/callback/outlook
EMAIL_AUTOMATION_OUTLOOK_TENANT_ID=common
```

---

## Production Checklist

- [ ] Gmail OAuth app created on Google Cloud
- [ ] Outlook OAuth app created on Azure
- [ ] .env variables configured
- [ ] Redirect URIs use HTTPS
- [ ] `php artisan config:clear` run
- [ ] Gmail connection tested
- [ ] Outlook connection tested
- [ ] Accounts appear in dashboard
- [ ] Emails are syncing

---

**Status**: Ready to use! 🚀

For detailed information, see:
- `EMAIL_AUTOMATION_OAUTH_SETUP.md` - Full guide
- `EMAIL_AUTOMATION_OAUTH_CHANGES.md` - Technical details
