# Rhea App API Documentation

**Version:** 1.0  
**Last Updated:** November 30, 2025  
**Base URL:** `https://api.rheaapp.com/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Public Endpoints](#public-endpoints)
3. [Protected Endpoints](#protected-endpoints)
   - [Auth Routes](#auth-routes)
   - [Chat/Conversations](#chatconversations)
   - [Voice Conversations](#voice-conversations)
   - [Email Management](#email-management)
   - [Image Generation](#image-generation)
   - [Settings & Preferences](#settings--preferences)
   - [Subscription & Limits](#subscription--limits)
   - [Admin Routes](#admin-routes)
   - [Teams Management](#teams-management)
   - [Workflows](#workflows)
   - [MCP Server](#mcp-server)

---

## Authentication

### Authentication Type: Token-Based (Sanctum)

All protected endpoints require a valid authentication token. Tokens are obtained through login/register and should be included in the request header:

```
Authorization: Bearer {token}
```

---

## Public Endpoints

### 1. User Login
- **Endpoint:** `POST /auth/login`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "authorization_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```

### 2. User Registration
- **Endpoint:** `POST /auth/register`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "token": "authorization_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name"
    }
  }
  ```

---

## Protected Endpoints

> **All protected endpoints require** `Authorization: Bearer {token}` **header**

### Auth Routes

#### 1. Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Invalidates the current authentication token
- **Response:** `{ "message": "Successfully logged out" }`

#### 2. Get Current User
- **Endpoint:** `GET /auth/user`
- **Description:** Returns the authenticated user's information
- **Response:**
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2025-01-01T12:00:00Z"
  }
  ```

#### 3. Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Description:** Generates a new authentication token
- **Response:**
  ```json
  {
    "token": "new_authorization_token_here"
  }
  ```

---

### Chat/Conversations

#### 1. Create Conversation
- **Endpoint:** `POST /chat/conversations`
- **Description:** Starts a new chat conversation
- **Request Body:**
  ```json
  {
    "title": "Conversation Title",
    "mode": "normal"
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Conversation Title",
    "mode": "normal",
    "created_at": "2025-01-01T12:00:00Z"
  }
  ```

#### 2. List Conversations
- **Endpoint:** `GET /chat/conversations`
- **Description:** Retrieves all conversations for the authenticated user
- **Query Parameters:**
  - `page` (optional): Pagination page number (default: 1)
  - `per_page` (optional): Items per page (default: 15)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "Conversation Title",
        "mode": "normal",
        "message_count": 5,
        "created_at": "2025-01-01T12:00:00Z",
        "updated_at": "2025-01-02T12:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total": 10,
      "per_page": 15
    }
  }
  ```

#### 3. Get Conversation Details
- **Endpoint:** `GET /chat/conversations/{id}`
- **Description:** Retrieves a specific conversation and its messages
- **Response:**
  ```json
  {
    "id": 1,
    "title": "Conversation Title",
    "mode": "normal",
    "messages": [
      {
        "id": 1,
        "content": "Hello",
        "sender": "user",
        "created_at": "2025-01-01T12:00:00Z"
      },
      {
        "id": 2,
        "content": "Hi there!",
        "sender": "assistant",
        "created_at": "2025-01-01T12:01:00Z"
      }
    ]
  }
  ```

#### 4. Update Conversation
- **Endpoint:** `PUT /chat/conversations/{id}`
- **Description:** Updates conversation details (e.g., title)
- **Request Body:**
  ```json
  {
    "title": "Updated Title"
  }
  ```
- **Response:** Updated conversation object

#### 5. Delete Conversation
- **Endpoint:** `DELETE /chat/conversations/{id}`
- **Description:** Permanently deletes a conversation
- **Response:** `{ "message": "Conversation deleted successfully" }`

#### 6. Send Message
- **Endpoint:** `POST /chat/message`
- **Description:** Sends a message in a conversation
- **Request Body:**
  ```json
  {
    "conversation_id": 1,
    "content": "Hello, how are you?",
    "attachments": [] // optional
  }
  ```
- **Response:**
  ```json
  {
    "id": 5,
    "conversation_id": 1,
    "content": "Hello, how are you?",
    "sender": "user",
    "created_at": "2025-01-01T12:00:00Z"
  }
  ```

---

### Voice Conversations

#### 1. Create Voice Conversation
- **Endpoint:** `POST /voice/conversations`
- **Description:** Initiates a new voice conversation
- **Request Body:**
  ```json
  {
    "title": "Voice Chat",
    "language": "en"
  }
  ```
- **Response:** Voice conversation object

#### 2. List Voice Conversations
- **Endpoint:** `GET /voice/conversations`
- **Description:** Retrieves all voice conversations
- **Response:** Array of voice conversation objects

#### 3. Get Voice Conversation Details
- **Endpoint:** `GET /voice/conversations/{id}`
- **Description:** Retrieves specific voice conversation
- **Response:** Voice conversation object with messages

#### 4. Delete Voice Conversation
- **Endpoint:** `DELETE /voice/conversations/{id}`
- **Description:** Deletes a voice conversation
- **Response:** Success message

#### 5. Send Voice Message
- **Endpoint:** `POST /voice/message`
- **Description:** Sends audio message in voice conversation
- **Request Body:**
  ```json
  {
    "conversation_id": 1,
    "audio": "base64_encoded_audio_data",
    "duration": 5.5
  }
  ```
- **Response:** Message object with audio metadata

#### 6. Get Audio File
- **Endpoint:** `GET /voice/audio/{id}`
- **Description:** Retrieves audio file for a voice message
- **Response:** Audio file (binary)

---

### Email Management

#### 1. List Email Accounts
- **Endpoint:** `GET /email/accounts`
- **Description:** Retrieves all connected email accounts
- **Response:**
  ```json
  {
    "data": [
      {
        "id": 1,
        "email": "user@gmail.com",
        "provider": "gmail",
        "is_connected": true,
        "last_sync": "2025-01-02T12:00:00Z"
      }
    ]
  }
  ```

#### 2. Add Email Account
- **Endpoint:** `POST /email/accounts`
- **Description:** Connects a new email account (OAuth)
- **Request Body:**
  ```json
  {
    "email": "user@gmail.com",
    "provider": "gmail",
    "oauth_token": "oauth_token_here"
  }
  ```
- **Response:** Connected email account object

#### 3. Update Email Account
- **Endpoint:** `PUT /email/accounts/{id}`
- **Description:** Updates email account settings
- **Request Body:**
  ```json
  {
    "sync_enabled": true,
    "auto_reply": "I'm out of office"
  }
  ```
- **Response:** Updated account object

#### 4. Delete Email Account
- **Endpoint:** `DELETE /email/accounts/{id}`
- **Description:** Disconnects an email account
- **Response:** Success message

#### 5. List Emails
- **Endpoint:** `GET /email/emails`
- **Description:** Retrieves emails from connected accounts
- **Query Parameters:**
  - `account_id` (optional): Filter by specific account
  - `folder` (optional): INBOX, SENT, DRAFTS, etc.
  - `unread_only` (optional): true/false
  - `page` (optional): Pagination
- **Response:** Paginated list of emails

#### 6. Get Email Details
- **Endpoint:** `GET /email/emails/{id}`
- **Description:** Retrieves full email content
- **Response:**
  ```json
  {
    "id": 1,
    "account_id": 1,
    "from": "sender@example.com",
    "to": ["recipient@example.com"],
    "subject": "Email Subject",
    "body": "Email content",
    "attachments": [],
    "is_read": false,
    "received_at": "2025-01-01T12:00:00Z"
  }
  ```

#### 7. Send Email
- **Endpoint:** `POST /email/send`
- **Description:** Sends an email from a connected account
- **Request Body:**
  ```json
  {
    "account_id": 1,
    "to": ["recipient@example.com"],
    "cc": ["cc@example.com"],
    "bcc": ["bcc@example.com"],
    "subject": "Email Subject",
    "body": "Email content",
    "attachments": []
  }
  ```
- **Response:** Sent email object

#### 8. Mark Email as Read
- **Endpoint:** `PUT /email/emails/{id}/read`
- **Description:** Marks an email as read/unread
- **Request Body:**
  ```json
  {
    "is_read": true
  }
  ```
- **Response:** Updated email object

#### 9. Sync Emails
- **Endpoint:** `POST /email/accounts/{accountId}/sync`
- **Description:** Manually triggers email synchronization for an account
- **Response:**
  ```json
  {
    "message": "Sync started",
    "synced_count": 15
  }
  ```

---

### Image Generation

#### 1. Generate Image
- **Endpoint:** `POST /images/generate`
- **Description:** Generates an image based on a prompt
- **Request Body:**
  ```json
  {
    "prompt": "A beautiful landscape with mountains",
    "style": "realistic",
    "size": "1024x1024",
    "count": 1
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "prompt": "A beautiful landscape with mountains",
    "images": [
      {
        "id": 1,
        "url": "https://cdn.example.com/image1.png",
        "created_at": "2025-01-01T12:00:00Z"
      }
    ]
  }
  ```

#### 2. List Generated Images
- **Endpoint:** `GET /images/generations`
- **Description:** Retrieves all generated images
- **Query Parameters:**
  - `page` (optional): Pagination page
  - `per_page` (optional): Items per page
- **Response:** Paginated list of image generations

#### 3. Get Image Details
- **Endpoint:** `GET /images/generations/{id}`
- **Description:** Retrieves details of a specific generation
- **Response:** Image generation object with all images

#### 4. Delete Image Generation
- **Endpoint:** `DELETE /images/generations/{id}`
- **Description:** Deletes an image generation and all associated images
- **Response:** Success message

---

### Settings & Preferences

#### 1. Update Profile
- **Endpoint:** `PUT /settings/profile`
- **Description:** Updates user profile information
- **Request Body:**
  ```json
  {
    "name": "New Name",
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "User bio"
  }
  ```
- **Response:** Updated user object

#### 2. Change Password
- **Endpoint:** `PUT /settings/password`
- **Description:** Changes user password
- **Request Body:**
  ```json
  {
    "current_password": "old_password",
    "new_password": "new_password",
    "new_password_confirmation": "new_password"
  }
  ```
- **Response:** `{ "message": "Password changed successfully" }`

#### 3. Get API Keys
- **Endpoint:** `GET /settings/api-keys`
- **Description:** Retrieves all API keys configured by the user
- **Response:**
  ```json
  {
    "grok": [],
    "ollama": [],
    "openrouter": []
  }
  ```

#### 4. Add Ollama API Key
- **Endpoint:** `POST /settings/api-keys/ollama`
- **Description:** Adds an Ollama API key
- **Request Body:**
  ```json
  {
    "key": "ollama_api_key_here",
    "endpoint": "http://localhost:11434",
    "label": "Local Ollama"
  }
  ```
- **Response:** Created API key object

#### 5. Add OpenRouter API Key
- **Endpoint:** `POST /settings/api-keys/openrouter`
- **Description:** Adds an OpenRouter API key
- **Request Body:**
  ```json
  {
    "key": "openrouter_api_key_here",
    "label": "My OpenRouter Key"
  }
  ```
- **Response:** Created API key object

#### 6. Update API Key Status
- **Endpoint:** `PUT /settings/api-keys/{type}/{id}/status`
- **Description:** Enables or disables an API key
- **Parameters:**
  - `type`: grok, ollama, or openrouter
  - `id`: Key ID
- **Request Body:**
  ```json
  {
    "status": "active"
  }
  ```
- **Response:** Updated API key object

#### 7. Delete API Key
- **Endpoint:** `DELETE /settings/api-keys/{type}/{id}`
- **Description:** Deletes an API key
- **Parameters:**
  - `type`: grok, ollama, or openrouter
  - `id`: Key ID
- **Response:** Success message

---

### Chat Preferences & Personalization

#### 1. Get Chat Preferences
- **Endpoint:** `GET /settings/chat-preferences`
- **Description:** Retrieves user's chat preferences
- **Response:**
  ```json
  {
    "theme": "dark",
    "language": "en",
    "notifications_enabled": true,
    "message_sound": true,
    "auto_scroll": true
  }
  ```

#### 2. Update Chat Preferences
- **Endpoint:** `PUT /settings/chat-preferences`
- **Description:** Updates chat preferences
- **Request Body:**
  ```json
  {
    "theme": "dark",
    "language": "en",
    "notifications_enabled": true,
    "message_sound": false
  }
  ```
- **Response:** Updated preferences object

#### 3. Reset Chat Preferences
- **Endpoint:** `POST /settings/chat-preferences/reset`
- **Description:** Resets chat preferences to default values
- **Response:** `{ "message": "Preferences reset to default" }`

#### 4. Get Available Chat Modes
- **Endpoint:** `GET /settings/chat-modes`
- **Description:** Retrieves available chat modes
- **Response:**
  ```json
  {
    "modes": [
      {
        "id": "normal",
        "label": "Normal",
        "description": "Standard conversation mode"
      },
      {
        "id": "creative",
        "label": "Creative",
        "description": "Enhanced creativity mode"
      }
    ]
  }
  ```

#### 5. Get AI Preferences
- **Endpoint:** `GET /settings/ai-preferences`
- **Description:** Retrieves AI model preferences
- **Response:**
  ```json
  {
    "default_model": "grok",
    "temperature": 0.7,
    "max_tokens": 2000,
    "top_p": 0.9
  }
  ```

#### 6. Update AI Preferences
- **Endpoint:** `PUT /settings/ai-preferences`
- **Description:** Updates AI model preferences
- **Request Body:**
  ```json
  {
    "default_model": "gpt-4",
    "temperature": 0.8,
    "max_tokens": 3000,
    "top_p": 0.95
  }
  ```
- **Response:** Updated preferences object

#### 7. Get Personalization Preferences
- **Endpoint:** `GET /settings/personalization`
- **Description:** Retrieves user personalization settings
- **Response:**
  ```json
  {
    "system_prompt": "You are a helpful assistant",
    "personality": "professional",
    "color_scheme": "blue"
  }
  ```

#### 8. Update Personalization Preferences
- **Endpoint:** `PUT /settings/personalization`
- **Description:** Updates personalization settings
- **Request Body:**
  ```json
  {
    "system_prompt": "You are a creative assistant",
    "personality": "friendly",
    "color_scheme": "green"
  }
  ```
- **Response:** Updated personalization object

#### 9. Reset Personalization Preferences
- **Endpoint:** `POST /settings/personalization/reset`
- **Description:** Resets personalization to defaults
- **Response:** `{ "message": "Personalization reset" }`

#### 10. Get Personalization Templates
- **Endpoint:** `GET /settings/personalization/templates`
- **Description:** Retrieves available personalization templates
- **Response:**
  ```json
  {
    "templates": [
      {
        "id": 1,
        "name": "Professional",
        "description": "Formal and professional tone",
        "system_prompt": "..."
      }
    ]
  }
  ```

#### 11. Get AI Modes
- **Endpoint:** `GET /settings/personalization/ai-modes`
- **Description:** Retrieves available AI modes for personalization
- **Response:**
  ```json
  {
    "modes": [
      {
        "id": 1,
        "name": "Standard",
        "description": "Normal AI mode"
      }
    ]
  }
  ```

#### 12. Get Descriptions
- **Endpoint:** `GET /settings/personalization/descriptions`
- **Description:** Retrieves description templates
- **Response:**
  ```json
  {
    "descriptions": [
      {
        "id": 1,
        "title": "Helpful Assistant",
        "content": "..."
      }
    ]
  }
  ```

---

### Subscription & Limits

#### 1. Get Subscription Limits
- **Endpoint:** `GET /subscription/limits`
- **Description:** Retrieves current subscription limits and usage
- **Response:**
  ```json
  {
    "plan": "pro",
    "chat_messages_limit": 10000,
    "chat_messages_used": 2500,
    "image_generations_limit": 100,
    "image_generations_used": 25,
    "storage_limit": 50000000000,
    "storage_used": 1024000000,
    "voice_conversations_limit": 50,
    "voice_conversations_used": 10
  }
  ```

#### 2. Check Agent Creation
- **Endpoint:** `POST /subscription/check-agent-creation`
- **Description:** Verifies if user can create a new agent
- **Request Body:**
  ```json
  {
    "agent_count": 3
  }
  ```
- **Response:**
  ```json
  {
    "allowed": true,
    "message": "You can create 2 more agents"
  }
  ```

#### 3. Check Agent Activation
- **Endpoint:** `POST /subscription/check-agent-activation`
- **Description:** Verifies if user can activate an agent
- **Request Body:**
  ```json
  {
    "agent_id": 1
  }
  ```
- **Response:**
  ```json
  {
    "allowed": true,
    "message": "Agent can be activated"
  }
  ```

#### 4. Check Tools Usage
- **Endpoint:** `POST /subscription/check-tools`
- **Description:** Checks if user has reached tool usage limits
- **Request Body:**
  ```json
  {
    "tool": "web_search"
  }
  ```
- **Response:**
  ```json
  {
    "allowed": true,
    "usage": 150,
    "limit": 1000
  }
  ```

#### 5. Get Features
- **Endpoint:** `GET /subscription/features`
- **Description:** Retrieves all available features and their status
- **Response:**
  ```json
  {
    "features": [
      {
        "key": "chat",
        "name": "Chat",
        "enabled": true
      },
      {
        "key": "voice_chat",
        "name": "Voice Chat",
        "enabled": true
      }
    ]
  }
  ```

#### 6. Check Specific Feature
- **Endpoint:** `GET /subscription/features/{featureKey}`
- **Description:** Checks if specific feature is enabled
- **Response:**
  ```json
  {
    "feature": "chat",
    "enabled": true
  }
  ```

#### 7. Get Tools
- **Endpoint:** `GET /subscription/tools`
- **Description:** Retrieves all available tools and their status
- **Response:**
  ```json
  {
    "tools": [
      {
        "key": "web_search",
        "name": "Web Search",
        "enabled": true,
        "usage_limit": 1000
      }
    ]
  }
  ```

#### 8. Check Specific Tool
- **Endpoint:** `GET /subscription/tools/{toolKey}`
- **Description:** Checks if specific tool is available
- **Response:**
  ```json
  {
    "tool": "web_search",
    "enabled": true,
    "usage_limit": 1000,
    "current_usage": 150
  }
  ```

---

### Admin Routes

> **All admin routes require** `admin` middleware (admin user)

#### AI Mode Management

##### 1. List AI Modes
- **Endpoint:** `GET /admin/ai-modes`
- **Description:** Retrieves all AI modes (admin only)
- **Response:** Array of AI mode objects

##### 2. Create AI Mode
- **Endpoint:** `POST /admin/ai-modes`
- **Description:** Creates a new AI mode
- **Request Body:**
  ```json
  {
    "name": "Creative Mode",
    "description": "Enhanced creativity",
    "system_prompt": "...",
    "temperature": 0.9,
    "is_active": true
  }
  ```
- **Response:** Created AI mode object

##### 3. Get AI Mode Details
- **Endpoint:** `GET /admin/ai-modes/{id}`
- **Description:** Retrieves specific AI mode
- **Response:** AI mode object

##### 4. Update AI Mode
- **Endpoint:** `PUT /admin/ai-modes/{id}`
- **Description:** Updates an AI mode
- **Request Body:** Same as create
- **Response:** Updated AI mode object

##### 5. Delete AI Mode
- **Endpoint:** `DELETE /admin/ai-modes/{id}`
- **Description:** Deletes an AI mode
- **Response:** Success message

##### 6. Toggle AI Mode Status
- **Endpoint:** `PATCH /admin/ai-modes/{id}/toggle`
- **Description:** Toggles AI mode active/inactive status
- **Response:** Updated AI mode object

##### 7. Reorder AI Modes
- **Endpoint:** `POST /admin/ai-modes/reorder`
- **Description:** Reorders AI modes
- **Request Body:**
  ```json
  {
    "order": [3, 1, 2]
  }
  ```
- **Response:** `{ "message": "Modes reordered successfully" }`

#### System Personalization Management

##### 1. Get System Personalizations
- **Endpoint:** `GET /admin/system-personalizations`
- **Description:** Retrieves all system personalization presets
- **Response:** Array of personalization objects

##### 2. Create System Personalization
- **Endpoint:** `POST /admin/system-personalizations`
- **Description:** Creates a system personalization preset
- **Request Body:**
  ```json
  {
    "name": "Professional",
    "system_prompt": "...",
    "description": "For professional use"
  }
  ```
- **Response:** Created personalization object

##### 3. Update System Personalization
- **Endpoint:** `PUT /admin/system-personalizations/{id}`
- **Description:** Updates a personalization preset
- **Request Body:** Same as create
- **Response:** Updated personalization object

#### Personalization Templates Management

##### 1. Get Templates
- **Endpoint:** `GET /admin/personalization-templates`
- **Description:** Retrieves all personalization templates
- **Response:** Array of template objects

##### 2. Create Template
- **Endpoint:** `POST /admin/personalization-templates`
- **Description:** Creates a new template
- **Request Body:**
  ```json
  {
    "name": "Template Name",
    "description": "Description",
    "content": "Template content",
    "category": "business"
  }
  ```
- **Response:** Created template object

##### 3. Update Template
- **Endpoint:** `PUT /admin/personalization-templates/{id}`
- **Description:** Updates a template
- **Request Body:** Same as create
- **Response:** Updated template object

##### 4. Delete Template
- **Endpoint:** `DELETE /admin/personalization-templates/{id}`
- **Description:** Deletes a template
- **Response:** Success message

---

### Teams Management

#### 1. List Teams
- **Endpoint:** `GET /teams`
- **Description:** Retrieves all teams for the user
- **Response:**
  ```json
  {
    "teams": [
      {
        "id": 1,
        "name": "Team Name",
        "description": "Team description",
        "members_count": 5
      }
    ]
  }
  ```

#### 2. Create Team
- **Endpoint:** `POST /teams`
- **Description:** Creates a new team
- **Request Body:**
  ```json
  {
    "name": "New Team",
    "description": "Team for collaboration"
  }
  ```
- **Response:** Created team object

#### 3. Get Team Details
- **Endpoint:** `GET /teams/{team}`
- **Description:** Retrieves specific team information
- **Response:** Team object with details

#### 4. Update Team
- **Endpoint:** `PUT /teams/{team}`
- **Description:** Updates team information
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```
- **Response:** Updated team object

#### 5. Delete Team
- **Endpoint:** `DELETE /teams/{team}`
- **Description:** Deletes a team
- **Response:** Success message

#### 6. List Team Members
- **Endpoint:** `GET /teams/{team}/members`
- **Description:** Retrieves all team members
- **Response:**
  ```json
  {
    "members": [
      {
        "id": 1,
        "name": "Member Name",
        "email": "member@example.com",
        "role": "admin"
      }
    ]
  }
  ```

#### 7. Invite Team Member
- **Endpoint:** `POST /teams/{team}/members/invite`
- **Description:** Invites a user to the team
- **Request Body:**
  ```json
  {
    "email": "newmember@example.com",
    "role": "member"
  }
  ```
- **Response:** Invitation object

#### 8. Remove Team Member
- **Endpoint:** `DELETE /teams/{team}/members/{member}`
- **Description:** Removes a member from team
- **Response:** Success message

#### 9. Update Member Role
- **Endpoint:** `PUT /teams/{team}/members/{member}/role`
- **Description:** Changes member's role
- **Request Body:**
  ```json
  {
    "role": "admin"
  }
  ```
- **Response:** Updated member object

#### 10. List Team Invitations
- **Endpoint:** `GET /teams/{team}/invitations`
- **Description:** Retrieves pending invitations
- **Response:** Array of invitation objects

#### 11. Accept Invitation
- **Endpoint:** `POST /teams/invitations/{invitation}/accept`
- **Description:** Accepts team invitation
- **Response:** `{ "message": "Invitation accepted" }`

#### 12. Decline Invitation
- **Endpoint:** `POST /teams/invitations/{invitation}/decline`
- **Description:** Declines team invitation
- **Response:** `{ "message": "Invitation declined" }`

#### 13. Get Activity Log
- **Endpoint:** `GET /teams/{team}/activity`
- **Description:** Retrieves team activity log
- **Response:** Array of activity entries

---

### Workflows

#### 1. Get Workflow Details
- **Endpoint:** `GET /workflows/{workflow}`
- **Description:** Retrieves specific workflow
- **Response:**
  ```json
  {
    "id": 1,
    "name": "Workflow Name",
    "description": "Workflow description",
    "nodes": [],
    "edges": []
  }
  ```

#### 2. Update Workflow
- **Endpoint:** `PUT /workflows/{workflow}`
- **Description:** Updates workflow configuration
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description",
    "nodes": [],
    "edges": []
  }
  ```
- **Response:** Updated workflow object

#### 3. Delete Workflow
- **Endpoint:** `DELETE /workflows/{workflow}`
- **Description:** Deletes a workflow
- **Response:** Success message

#### 4. Execute Workflow
- **Endpoint:** `POST /workflows/{workflow}/execute`
- **Description:** Executes a workflow
- **Request Body:**
  ```json
  {
    "input_variables": {
      "var1": "value1"
    }
  }
  ```
- **Response:**
  ```json
  {
    "execution_id": 1,
    "status": "running"
  }
  ```

#### 5. Get Execution History
- **Endpoint:** `GET /workflows/{workflow}/executions`
- **Description:** Retrieves workflow execution history
- **Response:** Paginated list of executions

#### 6. Get Specific Execution
- **Endpoint:** `GET /workflows/{workflow}/executions/{execution}`
- **Description:** Retrieves specific execution details
- **Response:** Execution object with results

#### 7. Cancel Execution
- **Endpoint:** `POST /workflows/{workflow}/executions/{execution}/cancel`
- **Description:** Cancels a running execution
- **Response:** `{ "message": "Execution cancelled" }`

#### 8. Delete Execution
- **Endpoint:** `DELETE /workflows/{workflow}/executions/{execution}`
- **Description:** Deletes execution record
- **Response:** Success message

#### 9. Get Workflow Stats
- **Endpoint:** `GET /workflows/{workflow}/stats`
- **Description:** Retrieves workflow statistics
- **Response:**
  ```json
  {
    "total_executions": 100,
    "successful_executions": 95,
    "failed_executions": 5,
    "average_duration": 2.5
  }
  ```

#### 10. Publish Workflow
- **Endpoint:** `POST /workflows/{workflow}/publish`
- **Description:** Publishes workflow to production
- **Response:** `{ "message": "Workflow published" }`

#### 11. Revert Workflow
- **Endpoint:** `POST /workflows/{workflow}/revert`
- **Description:** Reverts to previous version
- **Request Body:**
  ```json
  {
    "version": 2
  }
  ```
- **Response:** Reverted workflow object

#### 12. Get Workflow Versions
- **Endpoint:** `GET /workflows/{workflow}/versions`
- **Description:** Retrieves all workflow versions
- **Response:** Array of version objects

#### 13. Get Execution Details
- **Endpoint:** `GET /workflow-executions/{execution}`
- **Description:** Retrieves execution details (standalone)
- **Response:** Execution object

#### 14. List Available Tools
- **Endpoint:** `GET /tools/available`
- **Description:** Retrieves all available tools for workflow builder
- **Response:**
  ```json
  {
    "tools": [
      {
        "id": "web_search",
        "name": "Web Search",
        "description": "Search the web",
        "inputs": [],
        "outputs": []
      }
    ]
  }
  ```

#### 15. List Team Workflows
- **Endpoint:** `GET /teams/{team}/workflows`
- **Description:** Retrieves workflows for a team
- **Response:** Array of workflow objects

#### 16. Create Team Workflow
- **Endpoint:** `POST /teams/{team}/workflows`
- **Description:** Creates workflow within a team
- **Request Body:** Same as workflow object
- **Response:** Created workflow object

#### 17. Get Team Executions
- **Endpoint:** `GET /teams/{team}/executions`
- **Description:** Retrieves all executions within a team
- **Response:** Array of execution objects

---

### MCP Server (Model Context Protocol)

#### Session Management

##### 1. Create Session
- **Endpoint:** `POST /mcp/sessions`
- **Description:** Creates a new MCP session
- **Request Body:**
  ```json
  {
    "client_id": "client_identifier"
  }
  ```
- **Response:**
  ```json
  {
    "session_id": "session_identifier",
    "token": "session_token"
  }
  ```

##### 2. Validate Session
- **Endpoint:** `POST /mcp/sessions/{session}/validate`
- **Description:** Validates an MCP session
- **Response:**
  ```json
  {
    "valid": true,
    "expires_at": "2025-01-10T12:00:00Z"
  }
  ```

##### 3. Revoke Session
- **Endpoint:** `DELETE /mcp/sessions/{session}`
- **Description:** Revokes an MCP session
- **Response:** `{ "message": "Session revoked" }`

#### MCP Protocol Endpoints

##### 1. Initialize
- **Endpoint:** `POST /mcp/initialize`
- **Description:** Initializes MCP connection
- **Request Body:**
  ```json
  {
    "protocol_version": "2024-11-05",
    "capabilities": []
  }
  ```
- **Response:** Server capabilities and info

##### 2. List Tools
- **Endpoint:** `POST /mcp/tools/list`
- **Description:** Lists available tools
- **Response:**
  ```json
  {
    "tools": [
      {
        "name": "tool_name",
        "description": "Tool description",
        "inputSchema": {}
      }
    ]
  }
  ```

##### 3. Call Tool
- **Endpoint:** `POST /mcp/tools/call`
- **Description:** Executes a tool
- **Request Body:**
  ```json
  {
    "name": "tool_name",
    "arguments": {}
  }
  ```
- **Response:** Tool execution result

##### 4. List Resources
- **Endpoint:** `POST /mcp/resources/list`
- **Description:** Lists available resources
- **Response:**
  ```json
  {
    "resources": [
      {
        "uri": "resource://path",
        "name": "Resource Name",
        "mimeType": "text/plain"
      }
    ]
  }
  ```

##### 5. Read Resource
- **Endpoint:** `POST /mcp/resources/read`
- **Description:** Reads a resource
- **Request Body:**
  ```json
  {
    "uri": "resource://path"
  }
  ```
- **Response:** Resource content

#### Server Configuration

##### 1. List Servers
- **Endpoint:** `GET /mcp/servers`
- **Description:** Lists registered MCP servers
- **Response:** Array of server objects

##### 2. Register Server
- **Endpoint:** `POST /mcp/servers`
- **Description:** Registers a new MCP server
- **Request Body:**
  ```json
  {
    "name": "Server Name",
    "url": "https://server.example.com",
    "api_key": "server_api_key"
  }
  ```
- **Response:** Registered server object

##### 3. Update Server
- **Endpoint:** `PUT /mcp/servers/{server}`
- **Description:** Updates server configuration
- **Request Body:** Same as register
- **Response:** Updated server object

##### 4. Test Connection
- **Endpoint:** `POST /mcp/servers/{server}/test`
- **Description:** Tests MCP server connection
- **Response:**
  ```json
  {
    "status": "connected",
    "message": "Connection successful"
  }
  ```

##### 5. Get Logs
- **Endpoint:** `GET /mcp/logs`
- **Description:** Retrieves MCP server logs
- **Query Parameters:**
  - `server_id` (optional): Filter by server
  - `limit` (optional): Log entries limit
- **Response:** Array of log entries

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  },
  "status_code": 400
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Rate Limiting

Rate limiting applies to all endpoints:
- **Standard Limit:** 100 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Pagination

Endpoints that return lists support pagination:

```
GET /endpoint?page=1&per_page=15
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

---

## WebSocket Support

Real-time updates are available via WebSocket connections:

```
wss://api.rheaapp.com/ws?token={token}
```

Supported events:
- `message.received` - New message in conversation
- `conversation.updated` - Conversation metadata changed
- `email.received` - New email received
- `workflow.executed` - Workflow execution completed

---

## Best Practices

1. **Always include authentication token** for protected endpoints
2. **Handle rate limits gracefully** - implement exponential backoff
3. **Validate request data** before sending
4. **Use pagination** for large datasets
5. **Implement error handling** for all responses
6. **Cache responses** where appropriate
7. **Log API interactions** for debugging
8. **Use HTTPS only** in production
9. **Refresh tokens regularly** to maintain sessions
10. **Monitor WebSocket connections** for reconnection handling

---

## Changelog

### Version 1.0 (Current)
- Initial API documentation
- All core features documented
- Admin and team management endpoints
- MCP server support
- Subscription and limits system

---

## Support

For API support, contact: **api-support@rheaapp.com**

Documentation Last Updated: November 30, 2025
