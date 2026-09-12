# KaraAds Mobile Backend Handoff (Frontend Requirements)

## Base URL
- `https://karaads.com/api/open-labs/oyibo/v1.2`

## Response Envelope (required)
### Success
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Error
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

## Required URL Paths + Response Shapes

### 1) Auth/Profile
#### `POST /auth/login`
- Returns user + token.

#### `GET /auth/me`
- Used as profile fallback.

#### `GET /users/profile`
- Primary current-user profile endpoint.

#### `GET /users/by-username/{username}`
- Public profile route.

#### Required `User` fields
```json
{
  "id": "uuid",
  "name": "string",
  "username": "string",
  "avatar": "string|null",
  "bio": "string|null",
  "followers_count": 0,
  "following_count": 0,
  "is_verified": false,
  "is_following": false
}
```

### 2) Feed/Moments/Repost display
#### `GET /posts/feed?page=1`
#### `GET /posts/moments?page=1`
- Frontend expects **media-first rendering**.
- If post has `media: []` and has `original_post`, UI walks down `original_post` chain for display media.

#### Required `Post` shape (important)
```json
{
  "id": "uuid",
  "content": "string|null",
  "type": "post|repost|quote",
  "like_count": 0,
  "comment_count": 0,
  "repost_count": 0,
  "save_count": 0,
  "user_liked": false,
  "user_saved": false,
  "user_reshared": false,
  "created_at": "ISO8601",
  "user": { "...User" },
  "media": [
    {
      "id": "uuid",
      "url": "https://...",
      "path": "https://...",
      "thumbnail": "https://...|null",
      "type": "video|image",
      "mime_type": "video/mp4",
      "processing_status": "ready|processing|failed",
      "variants": {
        "original": "https://...|null",
        "processed": "https://...|null",
        "thumb": "https://...|null"
      }
    }
  ],
  "original_post": { "...Post|null" }
}
```

### 3) Post interactions
#### `POST /posts/{postId}/like`
#### `POST /posts/{postId}/unlike`
#### `POST /posts/{postId}/save`
- Should return updated engagement counts.

### 4) Comments (needed for TikTok-like comment sheet)
#### `GET /posts/{postId}/comments`
- Current frontend tries this endpoint for comment list.

#### `POST /posts/{postId}/comment`
- Already used for add-comment.

#### Required `Comment` shape
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "user_id": "uuid",
  "content": "string",
  "created_at": "ISO8601",
  "user": {
    "id": "uuid",
    "name": "string",
    "username": "string",
    "avatar": "string|null"
  }
}
```

### 5) Messages
#### `GET /conversations`
#### `GET /conversations/{conversationId}/messages`
#### `POST /conversations/{conversationId}/messages`
#### `POST /conversations`

### 6) Optional but recommended (to remove cache-only post detail)
#### `GET /posts/{postId}`
- Single post fetch for deep links and hard refresh on post detail.

## Notes for Backend Agent
- Keep `original_post` recursive for repost chains.
- Include `media.thumbnail` and `variants.thumb` for fast preview.
- `processing_status` should be consistent (`ready`, `processing`, `failed`).
- For failed media processing, still return valid `url/path` when playable.
- Preserve pagination metadata under `meta`.