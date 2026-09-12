# KaraAds Mobile API v1.1 Documentation

> Legacy Notice (February 13, 2026): `v1.1` is maintained for backward compatibility only.
> The canonical contract for new integrations is now:
> - `API_CONTRACT_v1.2.md` (primary narrative + integration guidance)
> - `openapi.yaml` (machine-readable schema)
> 
> Base URL for canonical contract: `https://karaads.com/api/open-labs/oyibo/v1.2`

## Overview

The KaraAds Mobile API (v1.1) provides token-based authentication for mobile applications. All endpoints are accessible at `/api/open-labs/oyibo/v1.1` on the production server.

**Base URL:** `https://karaads.com/api/open-labs/oyibo/v1.1`

**WebSocket URL:** `wss://karaads.com/reverb` (for real-time updates)

---

## Authentication

### Token-Based Authentication (Sanctum)

The mobile API uses Laravel Sanctum for token-based authentication. Tokens are long-lived and do not expire automatically.

#### Headers Required
```
Authorization: Bearer {TOKEN}
Content-Type: application/json
Accept: application/json
```

### Login
**Endpoint:** `POST /auth/login`

> Canonical behavior note: For imported accounts requiring setup, v1.2 returns `403 ACCOUNT_SETUP_REQUIRED`, sends an 8-character email code, and no token is issued. Refer to `API_CONTRACT_v1.2.md` and `openapi.yaml` for exact contract details.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "bio": null,
      "followers_count": 0,
      "following_count": 0,
      "is_verified": false,
      "created_at": "2024-01-01T12:00:00Z"
    },
    "token": "long-bearer-token-here"
  }
}
```

### Register
**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword@123",
  "password_confirmation": "SecurePassword@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "long-bearer-token-here"
  }
}
```

### Get Current User Profile
**Endpoint:** `GET /auth/me`  
**Auth:** Required (Bearer token)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "username": "johndoe",
    "followers_count": 10,
    "following_count": 5
  }
}
```

### Logout
**Endpoint:** `POST /auth/logout`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Two-Factor Authentication
**Endpoint:** `POST /auth/verify-2fa`

**Request:**
```json
{
  "email": "user@example.com",
  "two_factor_code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "bearer-token-here"
  }
}
```

---

## Posts

### Get Feed
**Endpoint:** `GET /posts/feed`  
**Auth:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "This is a great post!",
      "type": "post",
      "visibility": "everyone",
      "like_count": 42,
      "comment_count": 5,
      "repost_count": 2,
      "created_at": "2024-01-01T12:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "url"
      },
      "media": [
        {
          "id": "uuid",
          "path": "url",
          "type": "image",
          "mime_type": "image/jpeg",
          "processing_status": "ready"
        }
      ],
      "user_liked": false,
      "user_saved": false,
      "user_reshared": false
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

### Create Post
**Endpoint:** `POST /posts`  
**Auth:** Required

**Request (multipart/form-data):**
```
content: "This is my new post" (optional if media)
type: "post" (post, repost, quote)
visibility: "everyone" (everyone, followers, private)
comments_disabled: false (boolean, optional)
media: [file1, file2, ...] (optional)
```

**Response (201):**
```json
{
  "data": { /* post object */ }
}
```

### Like Post
**Endpoint:** `POST /posts/{postId}/like`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "like_count": 43,
    "user_liked": true
  }
}
```

### Unlike Post
**Endpoint:** `POST /posts/{postId}/unlike`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "like_count": 42,
    "user_liked": false
  }
}
```

### Save Post
**Endpoint:** `POST /posts/{postId}/save`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "save_count": 5,
    "user_saved": true
  }
}
```

### Comment on Post
**Endpoint:** `POST /posts/{postId}/comment`  
**Auth:** Required

**Request:**
```json
{
  "content": "Great post!",
  "parent_id": "uuid-optional-reply-target"
}
```

`parent_id` is optional. Omit it for a top-level comment. Provide it to create a reply to an existing comment on the same post.

**Response (200):**
```json
{
  "id": "uuid",
  "content": "Great post!",
  "user_id": "uuid",
  "post_id": "uuid",
  "parent_id": null,
  "reply_count": 0,
  "user": {
    "id": "uuid",
    "name": "Commenter Name",
    "username": "commenter"
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

### List Post Comments (Top-Level Timeline)
**Endpoint:** `GET /posts/{postId}/comments`
**Auth:** Required

Returns top-level comments only (timeline order: oldest to newest). Use the replies endpoint to load nested replies on demand.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Top-level comment",
      "parent_id": null,
      "reply_count": 2,
      "created_at": "2024-01-01T12:00:00Z",
      "user": {
        "id": "uuid",
        "name": "Commenter Name",
        "username": "commenter",
        "avatar": null,
        "is_verified": false
      }
    }
  ],
  "links": { "first": null, "last": null, "prev": null, "next": null },
  "meta": { "current_page": 1, "last_page": 1, "per_page": 15, "total": 1 }
}
```

### List Comment Replies (Thread Timeline)
**Endpoint:** `GET /posts/{postId}/comments/{commentId}/replies`
**Auth:** Required

Returns direct replies for the specified comment (oldest to newest). Each reply can have its own `reply_count` for nested threads.

### Report Post
**Endpoint:** `POST /posts/{postId}/report`  
**Auth:** Required

**Request:**
```json
{
  "reason": "spam",
  "description": "This is spam content"
}
```

**Reasons:** `spam`, `abusive`, `misinformation`, `harassment`, `other`

**Response (201):**
```json
{
  "success": true,
  "message": "Report submitted successfully. Thank you for helping us keep the community safe."
}
```

### Search Posts
**Endpoint:** `GET /search?q=query`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    { /* post objects matching search */ }
  ]
}
```

---

## Users

### Get User Profile
**Endpoint:** `GET /users/{userId}`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "user@example.com",
    "bio": "Developer",
    "avatar": "url",
    "is_verified": false,
    "followers_count": 100,
    "following_count": 50,
    "is_following": false
  }
}
```

### Get User by Username
**Endpoint:** `GET /users/by-username/{username}`  
**Auth:** Required

**Response (200):** Same as above

### Get Current User Profile
**Endpoint:** `GET /users/profile`  
**Auth:** Required

**Response (200):** Same as user profile above

### Update Profile
**Endpoint:** `PATCH /users/profile`  
**Auth:** Required  
**Content-Type:** `application/json`

**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "bio": "Developer and creator",
  "phone": "+1234567890"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { /* full user object */ }
}
```

### Upload Cover Picture
**Endpoint:** `POST /users/profile/cover`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form fields:**
- `cover`: image file (`jpeg`, `png`, `jpg`, `gif`, `webp`), max 10MB

**Response (200):**
```json
{
  "message": "Cover picture updated successfully",
  "user": {
    "id": "uuid",
    "cover": "https://karaads.com/storage/covers/...",
    "cover_variants": {
      "sm": "https://karaads.com/storage/covers/sm/...",
      "md": "https://karaads.com/storage/covers/md/...",
      "lg": "https://karaads.com/storage/covers/lg/...",
      "original": "https://karaads.com/storage/covers/original/..."
    },
    "cover_processing_status": "queued"
  }
}
```

> **Note:** Processing is asynchronous. `cover_processing_status` will be `queued` or `processing` immediately after upload and transitions to `ready` once variants are generated. Poll `GET /users/profile` or listen to real-time events for the final URL.

### Upload Avatar
**Endpoint:** `POST /users/profile/avatar`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form fields:**
- `avatar`: image file (`jpeg`, `png`, `jpg`, `gif`, `webp`), max 5MB

**Response (200):**
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": "uuid",
    "avatar": "https://karaads.com/storage/avatars/...",
    "avatar_variants": {
      "sm": null,
      "md": null,
      "lg": null,
      "original": null
    },
    "avatar_processing_status": "queued"
  }
}
```

### Follow User
**Endpoint:** `POST /users/{userId}/follow`  
**Auth:** Required

**Response (200):**
```json
{
  "following": true
}
```

### Unfollow User
**Endpoint:** `POST /users/{userId}/unfollow`  
**Auth:** Required

**Response (200):**
```json
{
  "following": false
}
```

### Block User
**Endpoint:** `POST /users/{userId}/block`  
**Auth:** Required

**Response (200):**
```json
{
  "blocked": true
}
```

### Unblock User
**Endpoint:** `POST /users/{userId}/unblock`  
**Auth:** Required

**Response (200):**
```json
{
  "blocked": false
}
```

### Get User Followers
**Endpoint:** `GET /users/{userId}/followers`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    { /* user objects */ }
  ]
}
```

### Get User's Following
**Endpoint:** `GET /users/{userId}/following`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    { /* user objects */ }
  ]
}
```

### Get Wallet
**Endpoint:** `GET /wallet`  
**Auth:** Required

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "balance": 125.50,
  "total_earned": 500.00,
  "total_withdrawn": 374.50,
  "pending_withdrawal": 0.00,
  "currency": "USD",
  "is_active": true
}
```

---

## Stories

### Get Story Groups
**Endpoint:** `GET /stories`
**Auth:** Required

**Query Parameters:**
- `feed` (optional): `for-you` or `following`

**Response (200):**
```json
{
  "data": [
    {
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "https://karaads.com/storage/avatars/..."
      },
      "has_unseen": true,
      "latest_story_at": "2024-01-01T12:00:00Z",
      "stories": [
        {
          "id": "uuid",
          "caption": "My story caption",
          "visibility": "followers",
          "expires_at": "2024-01-02T12:00:00Z",
          "created_at": "2024-01-01T12:00:00Z",
          "user": { /* user object */ },
          "media": [
            {
              "id": "uuid",
              "path": "https://karaads.com/storage/stories/processed.mp4",
              "thumbnail": "https://karaads.com/storage/stories/thumb.webp",
              "type": "video",
              "mime_type": "video/mp4",
              "duration_seconds": 12.4,
              "display_order": 0,
              "processing_status": "ready",
              "variants": {
                "thumb": "https://karaads.com/storage/stories/thumb.webp",
                "medium": "https://karaads.com/storage/stories/medium.webp"
              }
            }
          ],
          "is_viewed": false,
          "reaction_summary": {
            "❤️": 2
          },
          "view_count": 5,
          "can_delete": false
        }
      ]
    }
  ]
}
```

### Get Story Details
**Endpoint:** `GET /stories/{storyId}`
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "story": {
      "id": "uuid",
      "caption": "My story caption",
      "visibility": "followers",
      "expires_at": "2024-01-02T12:00:00Z",
      "created_at": "2024-01-01T12:00:00Z",
      "user": { /* user object */ },
      "media": [ { /* media object */ } ],
      "is_viewed": true,
      "viewer_reaction": "❤️",
      "reaction_summary": {
        "❤️": 2
      },
      "view_count": 5,
      "can_delete": false
    },
    "prev_story_id": null,
    "next_story_id": "uuid"
  }
}
```

### Create Story
**Endpoint:** `POST /stories`  
**Auth:** Required

**Request (multipart/form-data):**
```
caption: "My story caption" (optional)
media[0]: file (required)
media[1]: file (optional)
duration_seconds[0]: 12.4 (optional, for video uploads)
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "caption": "My story caption",
    "visibility": "followers",
    "user": { /* user object */ },
    "media": [ { /* media object */ } ],
    "expires_at": "2024-01-02T12:00:00Z"
  }
}
```

### View Story
**Endpoint:** `POST /stories/{storyId}/view`  
**Auth:** Required

**Response (200):**
```json
{
  "data": {
    "story_id": "uuid",
    "viewed": true
  }
}
```

### React to Story
**Endpoint:** `POST /stories/{storyId}/reaction`  
**Auth:** Required

Use `emoji` in the request body. The backend response is wrapped in `data`:
```json
{
  "emoji": "❤️"
}
```

```json
{
  "data": {
    "story_id": "uuid",
    "emoji": "❤️"
  }
}
```

**Request:**
```json
{
  "reaction": "❤️"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reaction added"
}
```

---

## Conversations & Messages

### Get Conversations
**Endpoint:** `GET /conversations`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "private",
      "name": "John Doe",
      "participants": [
        { /* user objects */ }
      ],
      "last_message": {
        "id": "uuid",
        "content": "Hey!",
        "created_at": "2024-01-01T12:00:00Z"
      },
      "unread_count": 2
    }
  ]
}
```

### Start Conversation
**Endpoint:** `POST /conversations`  
**Auth:** Required

**Request:**
```json
{
  "participant_ids": ["uuid1", "uuid2"],
  "type": "private"
}
```

**Response (201):**
```json
{
  "data": { /* conversation object */ }
}
```

### Get Messages
**Endpoint:** `GET /conversations/{conversationId}/messages`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Hello!",
      "user_id": "uuid",
      "user": { /* user object */ },
      "read_at": null,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Send Message
**Endpoint:** `POST /conversations/{conversationId}/messages`  
**Auth:** Required

**Request:**
```json
{
  "content": "Hello there!"
}
```

**Image Message Request:**
```json
{
  "content": "",
  "message_type": "image",
  "attachments": [
    {
      "id": "uuid",
      "url": "/storage/messages/...",
      "thumbnail_url": null,
      "name": "photo.jpg",
      "mime_type": "image/jpeg",
      "size": 123456,
      "width": 640,
      "height": 480
    }
  ]
}
```

**Response (201):**
```json
{
  "data": { /* message object */ }
}
```

Call records are also stored in conversation messages with:
- `message_type: "call"`
- `attachments[0].type: "call_record"`
- `attachments[0].status: "received" | "missed"`

### Upload Message Attachment (Image)
**Endpoint:** `POST /conversations/{conversationId}/attachments`  
**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Form fields:**
- `file`: image file (`jpeg`, `png`, `jpg`, `gif`, `webp`), max 10MB

**Response (201):**
```json
{
  "attachment": {
    "id": "uuid",
    "url": "/storage/messages/...",
    "thumbnail_url": null,
    "name": "photo.jpg",
    "mime_type": "image/jpeg",
    "size": 123456,
    "width": 640,
    "height": 480
  }
}
```

### Start Call (Audio/Video, Private/Group)
**Endpoint:** `POST /conversations/{conversationId}/calls`  
**Auth:** Required

**Request:**
```json
{
  "mode": "video"
}
```

**Response (201):**
```json
{
  "call_id": "uuid",
  "conversation_id": "uuid",
  "status": "ringing",
  "mode": "video",
  "participant_ids": ["uuid1", "uuid2"],
  "initiator_id": "uuid1",
  "callee": { "id": "uuid2", "name": "User", "username": "user", "avatar": null }
}
```

### Signaling Payload Changes (Group Mesh)
- `POST /calls/{callId}/offer` now requires: `to_user_id`, `sdp`
- `POST /calls/{callId}/answer` now requires: `to_user_id`, `sdp`
- `POST /calls/{callId}/ice` now requires: `to_user_id`, `candidate`
- `POST /calls/{callId}/heartbeat` keeps active call/session TTL alive during long calls.
- `POST /calls/{callId}/leave` removes the current participant from an active group call.

### Refresh Resume Behavior
- Clients should call `GET /calls/active` on app boot/refresh and resume active accepted calls.
- If `status=ringing` and current user is not the initiator, restore an incoming prompt only (never auto-answer).
- Join-link users pending host approval should wait for realtime join-request update events (approval/rejection/expiry) and `IncomingCall` on approval.
- Join request moderation now supports realtime websocket updates:
  - `CallJoinRequestCreated` and `CallJoinRequestUpdated` on `private-call.{callId}` for host-side pending queue updates.
  - `CallJoinRequestUpdated` also reaches the requester on `private-App.Models.User.{id}` (approved/rejected/expired).

### Web Audio Playback + Ringing Behavior
- Audio calls must bind each remote WebRTC stream to a real `<audio autoPlay playsInline>` element; without this, remote audio will not play.
- Ringing behavior:
  - incoming recipient: play ringtone while `status=incoming`
  - outgoing caller: play ringback while `status=calling` and role is caller
  - stop all tones on accept/decline/end/leave, reconnecting/connected transitions, and call teardown.
- Ring tones support static files first, with generated Web Audio fallback if files are missing or autoplay is blocked.
- Frontend env overrides:
  - `VITE_CALL_RINGTONE_URL` (default: `/sounds/ringtone.mp3`)
  - `VITE_CALL_RINGBACK_URL` (default: `/sounds/ringback.mp3`)
  - `VITE_CALL_RING_VOLUME` (default: `0.8`)
- Public asset convention:
  - `public/sounds/ringtone.mp3`
  - `public/sounds/ringback.mp3`

### Call Invites and Moderation
- `POST /calls/{callId}/invite` with `{ "user_id": "uuid" }` to invite a user you follow.
- If invited user is not already in the conversation, backend auto-adds them to conversation membership.
- `POST /calls/{callId}/kick` with `{ "user_id": "uuid" }` to remove a participant (initiator only).
- Join link format used by web client: `/messages?call_id={callId}`.

---

## Earnings & Ads

### Get Available Ads
**Endpoint:** `GET /earn/ads?limit=10`  
**Auth:** Required

**Response (200):**
```json
{
  "ads": [
    {
      "id": "uuid",
      "title": "Amazing Product",
      "media_url": "url",
      "media_type": "video",
      "description": "Check out this amazing product",
      "type": "video",
      "reward": 0.25
    }
  ],
  "count": 10
}
```

### Record Ad View
**Endpoint:** `POST /earn/ads/{adId}/view`  
**Auth:** Required

**Request:**
```json
{
  "view_duration": 30,
  "completed": true
}
```

**Response (200):**
```json
{
  "view_id": "uuid",
  "earnings": 0.25,
  "total_earned": 125.50,
  "available_balance": 125.50,
  "completed": true
}
```

### Get Earnings
**Endpoint:** `GET /earn/earnings`  
**Auth:** Required

**Response (200):**
```json
{
  "total_earned": 500.00,
  "available_balance": 125.50,
  "total_withdrawn": 374.50,
  "ads_watched": 2000,
  "ads_completed": 1950,
  "average_earning_per_ad": 0.25,
  "today_earnings": 5.50,
  "week_earnings": 45.00,
  "month_earnings": 120.00,
  "ads_available_today": true,
  "daily_watched_count": 15,
  "daily_limit": 20
}
```

### Request Withdrawal
**Endpoint:** `POST /withdrawals`  
**Auth:** Required

**Request:**
```json
{
  "amount": 50.00,
  "method": "bank_transfer",
  "account_details": {
    "bank_name": "Example Bank",
    "account_number": "123456789",
    "account_holder": "John Doe"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "withdrawal_id": "uuid",
    "amount": 50.00,
    "method": "bank_transfer",
    "status": "pending",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

### Get Withdrawals
**Endpoint:** `GET /withdrawals?status=pending&page=1`  
**Auth:** Required

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 50.00,
      "method": "bank_transfer",
      "status": "pending",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 20,
    "current_page": 1,
    "last_page": 1
  }
}
```

---

## WebSocket Real-Time Updates

### Authentication
For real-time updates via WebSocket, authenticate with the bearer token:

```javascript
// After getting token from login
const token = response.data.token;
const websocketUrl = `wss://karaads.com/reverb?token=${token}`;
```

### Private Channels (Subscribe with User ID)

```javascript
// Notifications channel
channel = echo.private(`notifications.${userId}`)
  .listen('NotificationCreated', (event) => {
    console.log('New notification', event);
  });

// Feed updates
channel = echo.private(`feed.${userId}`)
  .listen('PostCreated', (event) => {
    console.log('New post in feed', event);
  });
```

### Conversation Channels

```javascript
// Real-time messaging
channel = echo.private(`conversation.${conversationId}`)
  .listen('MessageSent', (event) => {
    console.log('New message', event);
  });

// Mark as read notification
channel.listen('MessageRead', (event) => {
  console.log('Message marked as read', event);
});
```

### Presence Channels (Online Status)

```javascript
// User online/offline status
channel = echo.join(`presence.${userId}`)
  .here((users) => {
    console.log('Users online', users);
  })
  .joining((user) => {
    console.log('User came online', user);
  })
  .leaving((user) => {
    console.log('User went offline', user);
  });
```

### Call Channels (WebRTC Signaling)

```javascript
// Incoming call
channel = echo.private(`call.${callId}`)
  .listen('IncomingCall', (event) => {
    console.log('Incoming call', event);
  })
  .listen('CallAccepted', (event) => {
    console.log('Call accepted', event);
  })
  .listen('CallEnded', (event) => {
    console.log('Call ended', event);
  });
```

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message"]
  },
  "status": 422
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden (e.g., 2FA required)
- `404`: Not Found
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Server Error

---

## Rate Limiting

- **Calls**: 10 requests per minute for accept/decline/end, 60 requests per minute for WebRTC signaling
- **General API**: No global rate limit (per-endpoint limits apply)

---

## Pagination

Most list endpoints support pagination:

```json
{
  "data": [ /* items */ ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

Query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)

---

## Integration with Adrio DSP

### Setup Steps

1. **Obtain API Token**
   - Call `/auth/login` or `/auth/register`
   - Store the returned token securely

2. **Use Token in Requests**
   - Add `Authorization: Bearer {token}` header to all requests
   - Refresh token by logging back in if needed

3. **Real-Time Updates**
   - Use Laravel Echo with Reverb for WebSocket
   - Subscribe to private channels using token authentication
   - Handle connection/disconnection events

4. **Error Handling**
   - Check HTTP status codes
   - Display validation errors from response
   - Implement retry logic with exponential backoff

### Example Implementation (Flutter/React Native)

```javascript
// Login
const loginResponse = await fetch('https://karaads.com/api/open-labs/oyibo/v1.1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { data: { token } } = await loginResponse.json();

// Store token securely
await SecureStorage.setItem('api_token', token);

// Make authenticated requests
const fetchWithAuth = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Get feed
const feedResponse = await fetchWithAuth(
  'https://karaads.com/api/open-labs/oyibo/v1.1/posts/feed'
);
const feed = await feedResponse.json();
console.log(feed.data);
```

---

## Support

For issues or questions:
- Email: support@karaads.com
- Check API response messages for detailed error descriptions
- Review this documentation thoroughly before contacting support

---

**API Version:** 1.1  
**Last Updated:** 2024  
**Status:** Active
