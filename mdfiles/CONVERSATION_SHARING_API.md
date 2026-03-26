# Conversation Sharing - API Documentation

## Base URLs

- **Authenticated API**: `/api/conversations/{conversationId}/share`
- **Public Access**: `/share/{token}`
- **Data API**: `/api/share/{token}/data`

## Authentication

All API endpoints require authentication except:
- `GET /share/{token}` - View shared conversation page
- `GET /api/share/{token}/data` - Get share data (token-based access)

## Response Format

All responses follow this format:

```json
{
    "success": true|false,
    "data": {},
    "message": "Optional message",
    "error": "Optional error description"
}
```

---

## Endpoints

### 1. Create Share Link

**Endpoint**: `POST /api/conversations/{conversationId}/share/create`

**Authentication**: Required (Bearer token)

**Description**: Create a new share link for a conversation. If one already exists, returns the existing share.

**Request Body**:
```json
{
    "is_public": true,
    "expires_at": "2025-02-20T00:00:00Z"
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `is_public` | boolean | Yes | Whether the share is publicly accessible |
| `expires_at` | string (ISO 8601) | No | When the share expires (null = never) |

**Success Response** (201):
```json
{
    "success": true,
    "share": {
        "id": 1,
        "conversation_id": "abc123def456",
        "share_token": "a1b2c3d4e5f6g7h8",
        "is_public": true,
        "is_active": true,
        "expires_at": "2025-02-20T00:00:00Z",
        "created_at": "2025-01-20T10:00:00Z",
        "updated_at": "2025-01-20T10:00:00Z"
    },
    "share_url": "https://yourapp.com/share/a1b2c3d4e5f6g7h8",
    "message": "Share link created successfully"
}
```

**Error Response** (400/500):
```json
{
    "success": false,
    "error": "Failed to create share link"
}
```

**Examples**:

```bash
# Create public share that never expires
curl -X POST https://yourapp.com/api/conversations/abc123/share/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_public": true}'

# Create private share that expires in 7 days
curl -X POST https://yourapp.com/api/conversations/abc123/share/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_public": false,
    "expires_at": "2025-01-27T00:00:00Z"
  }'
```

---

### 2. Get Share Details

**Endpoint**: `GET /api/conversations/{conversationId}/share/details`

**Authentication**: Required (Bearer token)

**Description**: Fetch details about the active share for a conversation.

**Query Parameters**: None

**Success Response** (200):
```json
{
    "success": true,
    "share": {
        "id": 1,
        "conversation_id": "abc123def456",
        "share_token": "a1b2c3d4e5f6g7h8",
        "is_public": true,
        "is_active": true,
        "expires_at": null,
        "created_at": "2025-01-20T10:00:00Z",
        "updated_at": "2025-01-20T10:00:00Z"
    },
    "share_url": "https://yourapp.com/share/a1b2c3d4e5f6g7h8"
}
```

**No Share Response** (200):
```json
{
    "success": true,
    "share": null
}
```

**Error Response** (403/404):
```json
{
    "success": false,
    "error": "Conversation not found"
}
```

**Examples**:

```bash
curl -X GET https://yourapp.com/api/conversations/abc123/share/details \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Update Share Settings

**Endpoint**: `PUT /api/conversations/{conversationId}/share/update`

**Authentication**: Required (Bearer token)

**Description**: Update the settings of an active share link.

**Request Body**:
```json
{
    "is_public": false,
    "expires_at": "2025-02-20T00:00:00Z"
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `is_public` | boolean | No | Update public/private setting |
| `expires_at` | string (ISO 8601) | No | Update expiration date |

**Success Response** (200):
```json
{
    "success": true,
    "share": {
        "id": 1,
        "conversation_id": "abc123def456",
        "share_token": "a1b2c3d4e5f6g7h8",
        "is_public": false,
        "is_active": true,
        "expires_at": "2025-02-20T00:00:00Z",
        "created_at": "2025-01-20T10:00:00Z",
        "updated_at": "2025-01-20T11:00:00Z"
    },
    "message": "Share settings updated successfully"
}
```

**Error Response** (400/404):
```json
{
    "success": false,
    "error": "No active share found"
}
```

**Examples**:

```bash
# Make share private and add expiration
curl -X PUT https://yourapp.com/api/conversations/abc123/share/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_public": false,
    "expires_at": "2025-02-20T00:00:00Z"
  }'
```

---

### 4. Revoke Share

**Endpoint**: `POST /api/conversations/{conversationId}/share/revoke`

**Authentication**: Required (Bearer token)

**Description**: Disable a share link. The link becomes invalid immediately.

**Request Body**: Empty

**Success Response** (200):
```json
{
    "success": true,
    "message": "Share link revoked successfully"
}
```

**Error Response** (404):
```json
{
    "success": false,
    "error": "No active share found"
}
```

**Examples**:

```bash
curl -X POST https://yourapp.com/api/conversations/abc123/share/revoke \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. View Shared Conversation (Page)

**Endpoint**: `GET /share/{token}`

**Authentication**: Not required

**Description**: View a shared conversation in a read-only interface. Returns HTML page.

**Response**: Renders the `SharedConversation` React component with:
- Conversation messages
- Owner information
- Read-only notice
- Share link copy button

**Error Response** (404):
```html
<!-- 404 Page Not Found -->
<!-- Share link not found or expired -->
```

**Examples**:

```bash
curl -X GET https://yourapp.com/share/a1b2c3d4e5f6g7h8
# Returns HTML page
```

Browser access:
```
https://yourapp.com/share/a1b2c3d4e5f6g7h8
```

---

### 6. Get Shared Conversation Data (API)

**Endpoint**: `GET /api/share/{token}/data`

**Authentication**: Not required (token-based access)

**Description**: Fetch JSON data for a shared conversation.

**Query Parameters**: None

**Success Response** (200):
```json
{
    "success": true,
    "conversation": {
        "id": "abc123def456",
        "user_id": "user123",
        "title": "Python Tips Discussion",
        "description": "Great tips for Python development",
        "canvas_mode": false,
        "created_at": "2025-01-15T09:30:00Z",
        "updated_at": "2025-01-20T10:00:00Z",
        "chats": [
            {
                "id": "chat1",
                "conversation_id": "abc123def456",
                "message": "What are the best Python practices?",
                "role": "user",
                "type": "text",
                "created_at": "2025-01-15T09:30:00Z",
                "files": []
            },
            {
                "id": "chat2",
                "conversation_id": "abc123def456",
                "message": "Here are some best practices...",
                "role": "assistant",
                "type": "text",
                "created_at": "2025-01-15T09:35:00Z",
                "files": []
            }
        ]
    },
    "owner": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

**Error Response** (404):
```json
{
    "success": false,
    "error": "Share link not found or expired"
}
```

**Examples**:

```bash
curl -X GET https://yourapp.com/api/share/a1b2c3d4e5f6g7h8/data

# Response example
{
  "success": true,
  "conversation": { ... },
  "owner": { ... }
}
```

JavaScript fetch:
```javascript
const response = await fetch('/api/share/a1b2c3d4e5f6g7h8/data');
const data = await response.json();
console.log(data.conversation);
```

---

### 7. List User Shares

**Endpoint**: `GET /api/shares/list`

**Authentication**: Required (Bearer token)

**Description**: Get all active shares created by the authenticated user.

**Query Parameters**: None

**Success Response** (200):
```json
{
    "success": true,
    "shares": [
        {
            "id": 1,
            "conversation": {
                "id": "abc123",
                "title": "Python Tips",
                "user_id": "user123"
            },
            "share_token": "a1b2c3d4e5f6g7h8",
            "share_url": "https://yourapp.com/share/a1b2c3d4e5f6g7h8",
            "is_public": true,
            "expires_at": null,
            "created_at": "2025-01-20T10:00:00Z"
        },
        {
            "id": 2,
            "conversation": {
                "id": "def456",
                "title": "AI Discussion",
                "user_id": "user123"
            },
            "share_token": "9z8y7x6w5v4u3t2s",
            "share_url": "https://yourapp.com/share/9z8y7x6w5v4u3t2s",
            "is_public": false,
            "expires_at": "2025-02-20T00:00:00Z",
            "created_at": "2025-01-19T14:30:00Z"
        }
    ]
}
```

**Empty Response** (200):
```json
{
    "success": true,
    "shares": []
}
```

**Examples**:

```bash
curl -X GET https://yourapp.com/api/shares/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Codes

| Code | Error | Cause |
|------|-------|-------|
| 400 | Invalid request | Validation failed |
| 403 | Unauthorized | User doesn't own conversation |
| 404 | Not found | Conversation/share not found or expired |
| 500 | Server error | Internal error, check logs |
| 429 | Too many requests | Rate limited |

---

## Rate Limiting

- Share creation: 100 per hour per user
- Share access (public): 10,000 per hour per IP
- API calls: Standard rate limits apply

---

## Validation Rules

### is_public
- Type: `boolean`
- Required: Yes (on create)
- Values: `true` or `false`

### expires_at
- Type: `string` (ISO 8601 format)
- Required: No
- Format: `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss±HH:mm`
- Must be: Future date/time
- Examples:
  - `2025-02-20T00:00:00Z`
  - `2025-01-27T12:30:00+00:00`

### share_token
- Type: `string`
- Format: 16 hexadecimal characters
- Pattern: `[a-f0-9]{16}`

---

## Webhooks (Future)

Future versions may support webhooks for:
- Share created
- Share expired
- Share accessed
- Share revoked

---

## SDKs & Examples

### JavaScript/TypeScript

```typescript
// Create share
const response = await fetch(
    '/api/conversations/abc123/share/create',
    {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            is_public: true,
            expires_at: null
        })
    }
);
const { share, share_url } = await response.json();
```

### PHP

```php
// Get share details
$client = new \GuzzleHttp\Client();
$response = $client->request('GET', '/api/conversations/{id}/share/details', [
    'headers' => ['Authorization' => 'Bearer ' . $token]
]);
$data = json_decode($response->getBody(), true);
$share = $data['share'];
```

### Python

```python
import requests

# Create share
response = requests.post(
    'https://yourapp.com/api/conversations/abc123/share/create',
    headers={'Authorization': f'Bearer {token}'},
    json={'is_public': True, 'expires_at': None}
)
data = response.json()
share_url = data['share_url']
```

---

## Changelog

### Version 1.0.0 (2025-01-20)
- Initial release
- Core sharing functionality
- Read-only shared views
- Expiration support
- Public/private sharing

---

## Support

For issues or questions, refer to:
- Quick Start: `CONVERSATION_SHARING_QUICK_START.md`
- Full Documentation: `CONVERSATION_SHARING_IMPLEMENTATION.md`
