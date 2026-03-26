# Conversation URL Sharing Implementation

## Overview
This implementation adds URL-based conversation sharing to the application, allowing users to share conversations with unique alphanumeric tokens. Shared conversations are read-only and can be configured as public or private with optional expiration dates.

## Features

### 1. **Unique Share Tokens**
- 16-character alphanumeric tokens generated using `bin2hex(random_bytes(8))`
- Format: `/share/abc123xyz` (e.g., `/share/a1b2c3d4e5f6g7h8`)
- Tokens are unique and indexed for fast lookups
- Guaranteed uniqueness with collision detection

### 2. **Sharing Options**
- **Public vs Private**: Users can choose whether the link is public (anyone) or private (authenticated users)
- **Expiration**: Optional expiration dates (never, 7 days, 30 days)
- **Revocation**: Users can disable sharing at any time
- **Read-Only Access**: Shared conversations cannot be edited or replied to

### 3. **Database Schema**
New table: `conversation_shares`
```sql
- id: Primary key
- conversation_id: Foreign key to conversations
- share_token: Unique, indexed token
- is_public: Boolean flag
- is_active: Boolean flag (for soft-disabling)
- expires_at: Optional timestamp
- created_at, updated_at: Timestamps
```

## File Structure

### Backend Files

#### 1. **Database Migration**
- **Location**: `database/migrations/2025_01_conversation_shares_table.php`
- Creates the `conversation_shares` table
- Indexes on `share_token`, `conversation_id`, and `created_at`

#### 2. **Model: ConversationShare**
- **Location**: `app/Models/ConversationShare.php`
- Relationships: `belongsTo(Conversation)`
- Methods:
  - `isValid()`: Check if share is still valid
  - `generateToken()`: Static method to generate unique tokens
  - `scopeActive()`: Query scope for active shares
  - `scopePublic()`: Query scope for public shares

#### 3. **Updated Model: Conversation**
- **Location**: `app/Models/Conversation.php`
- New relationships:
  - `shares()`: Has many conversation shares
  - `getActiveShare()`: Get the active share for convenience

#### 4. **Controller: ConversationShareController**
- **Location**: `app/Http/Controllers/ConversationShareController.php`
- Methods:
  - `createShare()`: Create new share link
  - `getShare()`: Get share details
  - `updateShare()`: Update share settings
  - `revokeShare()`: Disable a share link
  - `viewShare()`: View shared conversation (public page)
  - `getSharedConversationData()`: API endpoint for share data
  - `listUserShares()`: List all user's shares

### Frontend Files

#### 1. **Page: SharedConversation**
- **Location**: `resources/js/pages/SharedConversation.tsx`
- Displays shared conversation in read-only view
- Shows owner information and share banner
- Messages are displayed but non-interactive

#### 2. **Component: ConversationShareDialog**
- **Location**: `resources/js/components/chat/ConversationShareDialog.tsx`
- Dialog for creating/managing share links
- Features:
  - Create new share
  - Copy share URL
  - Configure public/private
  - Set expiration
  - Revoke sharing
  - Displays share URL in copyable input

#### 3. **Hook: useConversationShare**
- **Location**: `resources/js/hooks/use-conversation-share.ts`
- Manages share state and API interactions
- Methods:
  - `fetchShare()`: Fetch existing share
  - `createShare()`: Create new share
  - `updateShare()`: Update share settings
  - `revokeShare()`: Revoke share
  - `getShareUrl()`: Get full share URL

### Routes

#### Authenticated Routes
```
POST   /api/conversations/{conversationId}/share/create     - Create share
GET    /api/conversations/{conversationId}/share/details    - Get share info
PUT    /api/conversations/{conversationId}/share/update     - Update share
POST   /api/conversations/{conversationId}/share/revoke     - Revoke share
GET    /api/shares/list                                      - List user shares
```

#### Public Routes
```
GET    /share/{token}           - View shared conversation page
GET    /api/share/{token}/data  - Get shared conversation data (API)
```

## Usage Examples

### 1. Create a Share Link
```typescript
const { createShare } = useConversationShare({ conversationId });

// Create public share, expires in 7 days
await createShare(true, new Date(Date.now() + 7*24*60*60*1000).toISOString());
```

### 2. Use the Share Dialog
```typescript
import ConversationShareDialog from '@/components/chat/ConversationShareDialog';

<ConversationShareDialog
    open={isOpen}
    conversationId={conversationId}
    conversationTitle={title}
    onOpenChange={setIsOpen}
/>
```

### 3. Share URL Format
```
https://yourapp.com/share/a1b2c3d4e5f6g7h8
https://yourapp.com/share/9z8y7x6w5v4u3t2s
```

### 4. Access Shared Conversation
```typescript
const { data } = await fetch('/api/share/{token}/data');
// Returns: { conversation, owner, chats }
```

## Security Features

1. **Token Uniqueness**: Collision detection ensures unique tokens
2. **Validity Checks**: 
   - Validates `is_active` flag
   - Checks expiration timestamp
   - Verifies conversation exists
3. **Read-Only Access**: No modification endpoints for shared views
4. **User Ownership**: Only conversation owner can manage shares
5. **Expiration Support**: Automatic invalidation after expiry
6. **Soft-Delete**: Uses `is_active` flag instead of hard deletion

## Data Validation

### Create Share
```php
'is_public' => 'required|boolean',
'expires_at' => 'nullable|date|after:now'
```

### Update Share
```php
'is_public' => 'sometimes|boolean',
'expires_at' => 'sometimes|nullable|date|after:now'
```

## Error Handling

- **404**: Share not found or expired
- **403**: Unauthorized access (for update/revoke)
- **500**: Server errors with detailed logging
- **429**: Rate limiting for API endpoints

## Migration & Setup

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Database Indexes
The migration automatically creates indexes on:
- `share_token` (for fast token lookups)
- `conversation_id` (for relationship queries)
- `created_at` (for sorting and cleanup)

## Performance Considerations

1. **Token Lookup**: Indexed on `share_token` for O(1) lookups
2. **User Shares**: Can filter by user through relationship
3. **Expiry Cleanup**: Can use a scheduled job to hard-delete expired shares
4. **Caching**: Consider caching active shares in Redis for high traffic

## Future Enhancements

1. **Password Protection**: Add optional password for shares
2. **View Analytics**: Track who viewed shared conversations
3. **Scheduled Cleanup**: Job to remove expired shares
4. **Custom Domain**: Use custom share URLs (e.g., /s/shortcode)
5. **Edit Permissions**: Allow limited editing in future
6. **Download**: Export shared conversation as PDF/JSON
7. **Social Sharing**: Direct share buttons for social media
8. **Comments**: Allow read-only comments on shared conversations

## Testing

### Unit Tests
```php
// Test token generation
ConversationShare::generateToken(); // Returns 16-char string

// Test share validity
$share->isValid(); // Boolean

// Test scopes
ConversationShare::active()->count();
ConversationShare::public()->count();
```

### API Tests
```bash
# Create share
POST /api/conversations/{id}/share/create
{ "is_public": true, "expires_at": null }

# Get share
GET /api/conversations/{id}/share/details

# View shared conversation
GET /share/abc123xyz

# Get share data
GET /api/share/abc123xyz/data
```

## Troubleshooting

### Share Link Not Working
1. Check if share exists: `ConversationShare::where('share_token', $token)->exists()`
2. Verify share is active: `$share->is_active === true`
3. Check expiration: `$share->expires_at > now()`

### Token Collision
Rare event, but implementation retries token generation if collision occurs

### Performance Issues
1. Ensure indexes are created: `php artisan migrate`
2. Consider archiving old shares periodically
3. Add Redis caching for frequently accessed shares

## API Documentation

See `/CONVERSATION_SHARING_API.md` for detailed API documentation.
