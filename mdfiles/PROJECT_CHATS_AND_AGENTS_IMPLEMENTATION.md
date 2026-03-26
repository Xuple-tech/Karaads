# Project Chats & Agent Automation Implementation Guide

## Overview

This implementation provides a complete system for:
1. **Project Conversations** - Team-based organized chats within projects
2. **Agent Automation** - Intelligent agents that respond to triggers and execute actions
3. **Rich Messaging** - Advanced chat features (mentions, threading, pinning, tags)
4. **File Sharing & Management** - Secure file sharing with permissions and previews

## Architecture

### Database Structure

```
Projects
├── Conversations (project_id)
│   └── Chats (conversation_id)
│       ├── user_id
│       ├── agent_id (nullable)
│       ├── reply_to_id (threading)
│       ├── mentions (JSON array of user_ids)
│       ├── is_pinned (boolean)
│       └── tags (JSON array)
├── ProjectMembers (project_id)
│   ├── user_id
│   └── role (owner, admin, member, viewer)
├── ProjectFileShares (project_id)
├── ProjectCategories (user_id)
├── ProjectFiles (project_id)
├── Agents (project_id)
│   ├── AgentTriggers
│   │   ├── trigger_type (keyword, pattern, schedule, event, condition)
│   │   └── trigger_data (JSON)
│   ├── AgentActions
│   │   ├── action_type (respond, summarize, execute_tool, generate_content, notify, escalate)
│   │   ├── action_config (JSON)
│   │   └── sequence (order of execution)
│   └── AgentExecutionLogs
│       ├── status (running, completed, failed)
│       ├── input_data (JSON)
│       ├── output_data (JSON)
│       └── execution_time
```

### Key Models

#### Projects
- Represents a project with conversations, files, members, and agents
- Methods:
  - `conversations()` - Get all project conversations
  - `files()` - Get all project files
  - `members()` - Get team members
  - `agents()` - Get automation agents
  - `hasMember(userId)` - Check membership
  - `isOwner(userId)` - Check ownership
  - `getMemberRole(userId)` - Get member role
  - `addMember(userId, role)` - Add team member
  - `removeMember(userId)` - Remove member

#### Conversation
- Extended with `projects_id` for project association
- Filled with project conversation support
- Related to Chat messages

#### Chat
- Rich messaging support:
  - `content_type` - text, markdown, code, rich_html
  - `mentions` - Array of mentioned user IDs
  - `is_pinned` - Message pinning
  - `reply_to_id` - Threaded replies
  - `agent_id` - Track agent-generated messages
  - `tags` - Custom message tags

#### Agent
- Automation agent with three types:
  - `automation` - Runs on triggers
  - `tool` - Integrates with tools
  - `responder` - Custom responders
- Related to triggers, actions, and execution logs

#### AgentTrigger
- Five trigger types:
  - `keyword` - Matches keywords in messages
  - `pattern` - Regex pattern matching
  - `schedule` - Time-based triggers
  - `event` - Event-based (message_created, file_shared, user_mentioned)
  - `condition` - Complex conditions
- Ordered by priority (0-100)

#### AgentAction
- Six action types:
  - `respond` - Auto-respond with template
  - `summarize` - Generate summary
  - `execute_tool` - Execute tool
  - `generate_content` - Generate content
  - `notify` - Send notification
  - `escalate` - Mark for review
- Executed in sequence order

#### AgentExecutionLog
- Complete audit trail of agent execution
- Tracks status, input, output, execution time

## API Endpoints

### Project Conversations

```
GET    /api/projects/{project}/conversations
POST   /api/projects/{project}/conversations
GET    /api/projects/{project}/conversations/{conversation}
POST   /api/projects/{project}/conversations/{conversation}/messages
PUT    /api/projects/{project}/conversations/{conversation}/messages/{chat}
DELETE /api/projects/{project}/conversations/{conversation}/messages/{chat}
POST   /api/projects/{project}/conversations/{conversation}/messages/{chat}/pin
POST   /api/projects/{project}/conversations/{conversation}/messages/{chat}/tag
POST   /api/projects/{project}/conversations/{conversation}/messages/{chat}/mention
GET    /api/projects/{project}/conversations/{conversation}/messages/{chat}/thread
GET    /api/projects/{project}/conversations/{conversation}/pinned
GET    /api/projects/{project}/conversations/{conversation}/export
GET    /api/projects/{project}/conversations/{conversation}/statistics
POST   /api/projects/{project}/conversations/{conversation}/search
```

### Project Agents

```
GET    /api/projects/{project}/agents
POST   /api/projects/{project}/agents
GET    /api/projects/{project}/agents/{agent}
PUT    /api/projects/{project}/agents/{agent}
DELETE /api/projects/{project}/agents/{agent}
POST   /api/projects/{project}/agents/{agent}/toggle-status
GET    /api/projects/{project}/agents/{agent}/statistics

# Triggers
GET    /api/projects/{project}/agents/{agent}/triggers
POST   /api/projects/{project}/agents/{agent}/triggers
PUT    /api/projects/{project}/agents/{agent}/triggers/{trigger}
DELETE /api/projects/{project}/agents/{agent}/triggers/{trigger}
POST   /api/projects/{project}/agents/{agent}/triggers/{trigger}/test

# Actions
GET    /api/projects/{project}/agents/{agent}/actions
POST   /api/projects/{project}/agents/{agent}/actions
PUT    /api/projects/{project}/agents/{agent}/actions/{action}
DELETE /api/projects/{project}/agents/{agent}/actions/{action}

# Execution Logs
GET    /api/projects/{project}/agents/{agent}/executions
GET    /api/projects/{project}/agents/{agent}/executions/{log}
```

## Usage Examples

### Create a Project Conversation

```bash
curl -X POST http://localhost/api/projects/{project-id}/conversations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q4 Planning",
    "description": "Quarterly planning conversation"
  }'
```

### Send a Message to Conversation

```bash
curl -X POST http://localhost/api/projects/{project-id}/conversations/{conversation-id}/messages \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Let me analyze this data @user123",
    "mentions": ["user123"],
    "tags": ["analysis", "urgent"]
  }'
```

### Create an Automation Agent

```bash
curl -X POST http://localhost/api/projects/{project-id}/agents \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Analyzer",
    "type": "automation",
    "description": "Auto-analyzes data requests",
    "status": "inactive"
  }'
```

### Create a Keyword Trigger

```bash
curl -X POST http://localhost/api/projects/{project-id}/agents/{agent-id}/triggers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "keyword",
    "priority": 75,
    "status": "active",
    "trigger_data": {
      "keywords": ["analyze", "analyze this"],
      "match_type": "any"
    }
  }'
```

### Create an Auto-Response Action

```bash
curl -X POST http://localhost/api/projects/{project-id}/agents/{agent-id}/actions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "respond",
    "sequence": 0,
    "enabled": true,
    "action_config": {
      "template": "Thanks {{user}} for the request. I\'ll analyze this right away."
    }
  }'
```

### Test a Trigger

```bash
curl -X POST http://localhost/api/projects/{project-id}/agents/{agent-id}/triggers/{trigger-id}/test \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "test_message": "Please analyze this data for me"
  }'
```

## Services

### AgentExecutionService

Handles agent execution logic:

```php
use App\Services\AgentExecutionService;

$service = app(AgentExecutionService::class);

// Evaluate triggers and execute agents
$service->evaluateTriggers($conversation, $message);

// Manually record execution
$service->recordExecution($agent, $trigger, $inputData, $outputData);
```

## Authorization & Policies

Project access is controlled through the `ProjectPolicy`:

- **Owner** - Full access, can delete
- **Admin** - Can manage members, agents, and chat
- **Member** - Can chat and create agents
- **Viewer** - Read-only access

## Workflow: Agent Automation

1. User sends message to project conversation
2. `AgentExecutionService::evaluateTriggers()` is called
3. For each active agent in project:
   - Evaluate triggers in priority order
   - If trigger matches:
     - Execute agent actions in sequence
     - Log execution with input/output
     - Create auto-responses as messages
4. Return execution log

### Trigger Evaluation Flow

```
Message Received
    ↓
Load Project Agents
    ↓
For Each Agent (by status)
    ↓
Load Triggers (sorted by priority)
    ↓
For Each Trigger
    ↓
    Match Type?
    ├─ keyword → Check keywords in message
    ├─ pattern → Regex match
    ├─ event → Check event type
    ├─ condition → Evaluate conditions
    └─ schedule → Time-based check
    ↓
    Match Found?
    ├─ Yes → Execute Actions
    │   ├─ Action 1 (sequence 0)
    │   ├─ Action 2 (sequence 1)
    │   └─ ...
    │   ↓
    │   Log Execution
    │   ↓
    │   Break (only first trigger)
    └─ No → Continue
```

### Action Execution

Each action receives context with:
- `message` - Original message text
- `user` - User name
- `timestamp` - Execution timestamp

Template interpolation uses `{{variable}}` syntax:
```
"Thanks {{user}}! I received your message on {{timestamp}}"
```

## Database Migrations

Run migrations to set up the database:

```bash
php artisan migrate
```

New migrations:
- `2025_11_22_000001_create_project_categories_table`
- `2025_11_22_000002_add_category_to_projects_table`
- `2025_11_22_000003_create_project_file_shares_table`
- `2025_11_22_000004_create_project_members_table`
- `2025_11_22_000005_create_agents_table`
- `2025_11_22_000006_create_agent_triggers_table`
- `2025_11_22_000007_create_agent_actions_table`
- `2025_11_22_000008_create_agent_execution_logs_table`
- `2025_11_22_000009_enhance_chats_table_for_rich_content`
- `2025_11_22_000010_add_user_id_to_agents_table`
- `2025_11_22_000011_add_description_to_conversations_table`

## File Structure

```
app/
├── Controllers/
│   ├── ProjectChatController.php
│   └── ProjectAgentController.php
├── Models/
│   ├── Projects.php
│   ├── Conversation.php
│   ├── Chat.php
│   ├── Agent.php
│   ├── AgentTrigger.php
│   ├── AgentAction.php
│   ├── AgentExecutionLog.php
│   ├── ProjectMember.php
│   ├── ProjectCategory.php
│   ├── ProjectFileShare.php
│   └── ProjectFiles.php
├── Services/
│   └── AgentExecutionService.php
├── Policies/
│   └── ProjectPolicy.php
└── Providers/
    └── AuthServiceProvider.php

database/migrations/
├── 2025_11_22_000001_create_project_categories_table.php
├── 2025_11_22_000002_add_category_to_projects_table.php
├── 2025_11_22_000003_create_project_file_shares_table.php
├── 2025_11_22_000004_create_project_members_table.php
├── 2025_11_22_000005_create_agents_table.php
├── 2025_11_22_000006_create_agent_triggers_table.php
├── 2025_11_22_000007_create_agent_actions_table.php
├── 2025_11_22_000008_create_agent_execution_logs_table.php
├── 2025_11_22_000009_enhance_chats_table_for_rich_content.php
├── 2025_11_22_000010_add_user_id_to_agents_table.php
└── 2025_11_22_000011_add_description_to_conversations_table.php

routes/
└── project-chats.php

config/
└── app.php (includes AuthServiceProvider)
```

## Quick Start

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Create a Project
```php
$project = Projects::create([
    'user_id' => auth()->id(),
    'title' => 'My Project',
    'project_type' => 'team',
]);
```

### 3. Create a Conversation
```php
$conversation = $project->conversations()->create([
    'title' => 'Team Discussion',
    'user_id' => auth()->id(),
]);
```

### 4. Add Team Members
```php
$project->addMember('user_id_123', 'member');
$project->addMember('user_id_456', 'admin');
```

### 5. Send Messages
```php
$message = $conversation->chats()->create([
    'user_id' => auth()->id(),
    'message' => 'Let\'s discuss the Q4 roadmap',
    'role' => 'user',
]);
```

### 6. Create an Agent
```php
$agent = $project->agents()->create([
    'user_id' => auth()->id(),
    'name' => 'Q&A Bot',
    'type' => 'responder',
    'status' => 'active',
]);
```

### 7. Add Trigger
```php
$trigger = $agent->triggers()->create([
    'trigger_type' => 'keyword',
    'trigger_data' => [
        'keywords' => ['question', 'how do'],
        'match_type' => 'any',
    ],
    'priority' => 80,
    'status' => 'active',
]);
```

### 8. Add Action
```php
$action = $agent->actions()->create([
    'action_type' => 'respond',
    'sequence' => 0,
    'action_config' => [
        'template' => 'Hi {{user}}! I\'m here to help. What would you like to know?'
    ],
    'enabled' => true,
]);
```

### 9. Trigger Evaluation
When users send messages to the conversation, agents automatically evaluate triggers and execute actions.

## Testing

### Test Agent with Sample Message
```php
// Create test conversation and message
$conversation = $project->conversations()->first();
$message = $conversation->chats()->create([
    'user_id' => auth()->id(),
    'message' => 'This is a question about the project',
    'role' => 'user',
]);

// Agents should automatically respond
$responses = $conversation->chats()
    ->where('agent_id', '!=', null)
    ->latest()
    ->get();
```

### Check Execution Logs
```php
$agent = $project->agents()->first();
$logs = $agent->executionLogs()
    ->latest()
    ->paginate(10);

foreach ($logs as $log) {
    echo "{$log->status}: {$log->execution_time}ms\n";
}
```

## Advanced Features

### Rich Message Querying

```php
// Get pinned messages
$pinned = $conversation->chats()
    ->where('is_pinned', true)
    ->get();

// Get messages mentioning user
$mentioned = $conversation->chats()
    ->where('mentions', 'like', "%$userId%")
    ->get();

// Get threaded replies
$thread = $message->replies()->get();

// Get tagged messages
$tagged = $conversation->chats()
    ->where('tags', 'like', '%urgent%')
    ->get();

// Search with filters
$results = $conversation->chats()
    ->where('message', 'like', "%search%")
    ->where('tags', 'like', '%important%')
    ->get();
```

### Agent Management

```php
// Get agent statistics
$stats = $agent->executionLogs()->count();
$success = $agent->executionLogs()
    ->where('status', 'completed')
    ->count();

// Toggle agent status
$agent->update(['status' => 'inactive']);

// Clear execution logs
$agent->executionLogs()->delete();

// Get capability
$hasCapability = $agent->hasCapability('summarize');
```

## Troubleshooting

### Agents Not Triggering
1. Check agent status is 'active'
2. Check trigger status is 'active'
3. Verify trigger data matches message
4. Check execution logs for errors

### Message Not Appearing
1. Check user has project access
2. Verify conversation belongs to project
3. Check database permissions

### Authorization Errors
1. Verify user is project member or owner
2. Check role permissions
3. Review ProjectPolicy

## Performance Considerations

- Indexes on `project_id`, `user_id`, `status`, `created_at`
- Agent trigger evaluation is O(n) where n = number of active triggers
- Consider pagination for large conversations
- Archive old conversations to maintain performance

## Future Enhancements

1. **WebSocket Support** - Real-time agent notifications
2. **Agent Templates** - Pre-built agent configurations
3. **Advanced AI Integration** - LLM-powered triggers and responses
4. **Workflow Builder** - Visual trigger/action builder UI
5. **Integration Hooks** - External system webhooks
6. **Agent Collaboration** - Multi-agent workflows
7. **Message Reactions** - Emoji reactions and voting
8. **Conversation Analytics** - Advanced insights and metrics
