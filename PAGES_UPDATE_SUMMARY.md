# Pages Update & Authorization Fix - Summary

## ✅ Completed Tasks

### 1. **Profile Page Updated** (`resources/js/pages/app/profile.tsx`)

- ✅ Fetches real user profile data from `/api/users/profile` or `/api/users/{userId}`
- ✅ Displays real posts from `/api/users/{userId}/posts`
- ✅ Shows real follower/following counts
- ✅ Loading states with spinner
- ✅ Empty state when no posts
- ✅ Formatted engagement counts (K, M suffix)
- ✅ Accepts `userId` prop for different users

### 2. **Messages Page Updated** (`resources/js/pages/app/messages.tsx`)

- ✅ Fetches real conversations from `/api/conversations`
- ✅ Displays real messages from `/api/conversations/{id}/messages`
- ✅ Search conversations by participant name
- ✅ Real-time message listening via WebSocket (useConversationMessages hook)
- ✅ Send message functionality with POST request
- ✅ Loading states and empty states
- ✅ Proper message ordering and timestamps

### 3. **API Authorization Fixed**

- ✅ Changed from `auth:sanctum` only to allow session-based auth
- ✅ Added `credentials: 'include'` to useFetch hook for cookies
- ✅ Added CSRF token headers to all requests
- ✅ Added `'web'` middleware to API routes
- ✅ Split routes into:
    - **Public (guest + auth)**: GET posts, users, profiles
    - **Protected (auth only)**: POST, PATCH, DELETE, feed, profile, messages, conversations

### 4. **@{username} Route Implemented**

- ✅ Added route `/@{username}` to web.php
- ✅ Automatically resolves username to user ID
- ✅ Passes userId to profile component as prop
- ✅ Public access (no auth required)
- ✅ 404 handling for non-existent users
- ✅ Extracts username from email before @ symbol

## 📁 Files Modified

```
app/Http/Controllers/Api/
├── UserController.php                    # Added posts() method

routes/
├── api.php                               # Reorganized auth structure
└── web.php                               # Added @{username} route

resources/js/
├── hooks/use-fetch.ts                    # Added credentials & CSRF token
└── pages/app/
    ├── profile.tsx                       # Real data fetching
    └── messages.tsx                      # Real data fetching & WebSocket
```

## 🔧 API Endpoints

### Public Endpoints (No Auth Required)

```
GET  /api/posts                     # All posts
GET  /api/posts/trending           # Trending posts
GET  /api/posts/{id}               # Single post
GET  /api/users                    # Search users
GET  /api/users/{id}               # User profile
GET  /api/users/{id}/posts         # User's posts
```

### Protected Endpoints (Auth Required)

```
GET  /api/posts/feed               # User's feed
POST /api/posts                    # Create post
PATCH /api/posts/{id}              # Update post
DELETE /api/posts/{id}             # Delete post
POST /api/posts/{id}/like          # Like post
POST /api/posts/{id}/unlike        # Unlike post

GET  /api/users/profile            # Current user profile
POST /api/users/{id}/follow        # Follow user
POST /api/users/{id}/unfollow      # Unfollow user

GET  /api/conversations            # User's conversations
POST /api/conversations            # Create conversation
GET  /api/conversations/{id}       # Get conversation
GET  /api/conversations/{id}/messages      # Get messages
POST /api/conversations/{id}/messages      # Send message
POST /api/messages/{id}/read               # Mark as read
```

## 🔐 Authentication Setup

The application now uses **Laravel Sanctum** with session-based authentication:

### How It Works

1. User logs in via Fortify/Google OAuth
2. Laravel creates a session cookie
3. Frontend automatically includes cookies in requests
4. API routes validate session + CSRF token
5. Requests are authenticated without tokens

### Headers Automatically Added

```typescript
headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRF-Token': getCsrfToken(),  // From meta tag
}
credentials: 'include'  // Include cookies
```

### What Was Fixed

- ❌ Was: `auth:sanctum` only = required API tokens
- ✅ Now: `auth:sanctum` + `web` = works with sessions

## 🌐 Routes

### Web Routes (Frontend)

```php
GET  /                              # Welcome page
GET  /auth/google                  # Google login redirect
GET  /auth/google/callback         # Google callback

# Public profile by username
GET  /@{username}                  # Profile page (no auth)

# Protected routes (auth required)
GET  /app                          # Dashboard
GET  /browse                       # Browse posts
GET  /messages                     # Messages
GET  /notifications                # Notifications
GET  /profile                      # My profile
```

### Example: View User Profile

```
https://karads.local/@john
```

- Route resolves `john` from email (john@something.com)
- Loads profile.tsx component with userId prop
- Component fetches user data from API

## 🎯 Usage Examples

### Profile Page - Current User

```typescript
import ProfilePage from '@/pages/app/profile';

// Automatically uses /api/users/profile
<ProfilePage />
```

### Profile Page - Specific User

```typescript
// Via route prop
<ProfilePage userId="user-uuid" />

// Via URL
/@{username}
```

### Messages Page

```typescript
// Fetches from /api/conversations
// Listens to real-time messages via WebSocket
// Sends messages to /api/conversations/{id}/messages
<MessagesPage />
```

## ⚙️ Testing

### Test Public API Access

```bash
# This should work without auth
curl http://localhost/api/posts
curl http://localhost/api/posts/trending
curl http://localhost/api/users
```

### Test Protected API Access

```bash
# These require session/auth
curl -b "LARAVEL_SESSION=..." -H "X-CSRF-Token: ..." \
  http://localhost/api/users/profile

curl -b "LARAVEL_SESSION=..." -H "X-CSRF-Token: ..." \
  -X POST http://localhost/api/posts \
  -d '{"content":"Hello"}'
```

### Test @username Route

```
# Visit in browser (will show profile)
http://localhost/@john
http://localhost/@sarah
```

## 🐛 If Still Getting 401/403

1. **Check Session**
    - Make sure you're logged in
    - Verify Laravel session cookie is set (check DevTools → Storage)

2. **Check CSRF Token**
    - Verify `<meta name="csrf-token">` exists in HTML
    - Check that X-CSRF-Token is being sent (DevTools → Network)

3. **Check Credentials**
    - Verify `credentials: 'include'` is set in fetch
    - Check that cookies are being sent in request

4. **Check Routes**
    - Verify API routes are using `['auth:sanctum', 'web']` middleware
    - Not just `auth:sanctum` alone

5. **Debug**

    ```bash
    # Check logs
    tail -f storage/logs/laravel.log

    # Test from command line
    php artisan tinker
    > auth()->user()  # Should return current user
    ```

## 📝 Next Steps

1. **Test Data Fetching**
    - Verify profile page loads real data
    - Verify messages fetch and display correctly
    - Test @username routes

2. **Frontend NPM Packages** (when ready)
    - Install: `npm install laravel-echo pusher-js`
    - Set up Echo initialization in app.tsx
    - WebSocket will work automatically

3. **Real-Time Features**
    - Messages will update in real-time once Reverb is running
    - Post likes will update across all viewers
    - Follow notifications will broadcast

4. **Error Handling**
    - Add better error messages to components
    - Handle network failures gracefully
    - Add retry logic

## 📚 Architecture Overview

```
Browser (React/Inertia)
    ↓
Profile/Messages Components
    ↓
useFetch Hook (with session auth)
    ↓
API Routes (/api/...)
    ↓
Controllers (Api/UserController, etc)
    ↓
Database (MySQL)

REAL-TIME UPDATES:
    ↓
Laravel Echo WebSocket
    ↓
Broadcast Events (PostCreated, MessageSent, etc)
    ↓
useEchoChannel Hooks
    ↓
React Components Update
```

## 🚀 Deployment Checklist

- [ ] Test API authorization works in staging
- [ ] Verify @username routes work
- [ ] Test profile and messages pages with real data
- [ ] Set up Reverb or Pusher for production
- [ ] Configure CORS if using different domains
- [ ] Set proper SANCTUM_STATEFUL_DOMAINS in .env
- [ ] Test SSL/TLS certificates for wss:// WebSocket
