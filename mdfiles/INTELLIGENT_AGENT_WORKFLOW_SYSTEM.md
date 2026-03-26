# Intelligent Agent Workflow System - Complete Implementation

## Overview

A comprehensive system that adds three major capabilities to the Rhea AI application:

1. **Agent Memory** - Agents remember conversations and context across multiple interactions
2. **Tool Composition** - Chain tools together with sequential, parallel, and conditional execution
3. **Agent Scheduling** - Run agents on schedules or trigger via webhooks

This system works together to enable true autonomous agent workflows.

---

## Part 1: Agent Memory System

### Purpose
Store and retrieve context so agents learn from previous conversations and provide smarter, context-aware responses.

### Key Concepts

- **Memories**: Stored as text with metadata, tags, and relevance scores
- **Memory Context**: Automatically injected into agent prompts before execution
- **Relevance Scoring**: High-relevance memories rise to top; scoring increases when reused
- **Cross-Project**: Agents can share memory across multiple projects

### Database Schema

```sql
-- Agent Memories
CREATE TABLE agent_memories (
    id ULID PRIMARY KEY,
    agent_id ULID,
    project_id ULID,
    chat_id ULID NULLABLE,
    content TEXT,
    metadata JSON,          -- {tags: [...], type: 'conversation|tool_execution|note'}
    relevance_score INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_agent_memories_agent_project ON agent_memories(agent_id, project_id);
CREATE INDEX idx_agent_memories_relevance ON agent_memories(relevance_score DESC);
```

### API Endpoints

```
GET    /api/projects/{project}/agents/{agent}/memory
POST   /api/projects/{project}/agents/{agent}/memory
POST   /api/projects/{project}/agents/{agent}/memory/search
GET    /api/projects/{project}/agents/{agent}/memory/relevant
DELETE /api/projects/{project}/agents/{agent}/memory/{memory}
POST   /api/projects/{project}/agents/{agent}/memory/clear
GET    /api/projects/{project}/agents/{agent}/memory/export
```

### Usage Example

```typescript
// Store a conversation turn
const memory = await api.post(`/agents/${agentId}/memory`, {
    content: "User asked about weather. Agent provided forecast.",
    metadata: {
        type: 'conversation',
        tags: ['weather', 'forecast']
    }
});

// Get relevant memories for context
const memories = await api.post(`/agents/${agentId}/memory/search`, {
    q: "weather"
});

// Inject into prompt
const prompt = `
    ${memories.map(m => m.content).join('\n\n')}
    
    User: ${userMessage}
`;
```

### Service: AgentMemoryService

**Methods:**
- `storeMemory()` - Add memory for agent
- `getRelevantMemories()` - Get top memories
- `searchMemories()` - Search by query
- `buildMemoryContext()` - Generate prompt context
- `storeConversationTurn()` - Log conversation
- `storeToolExecution()` - Log tool result
- `tagMemory()` - Add tags
- `incrementMemoryRelevance()` - Update score
- `cleanupOldMemories()` - Delete old data
- `exportAsMarkdown()` - Export memories

---

## Part 2: Tool Composition System

### Purpose
Create complex workflows by chaining tools together with different execution patterns.

### Three Execution Modes

#### 1. Sequential (→)
Tools run one after another. If one fails, stop.

```
Tool 1 → Tool 2 → Tool 3
(if Tool 1 succeeds, run Tool 2)
(if Tool 2 succeeds, run Tool 3)
(if any fails, stop and report error)
```

#### 2. Parallel (||)
Tools run simultaneously. Collect all results.

```
Tool 1 ┐
Tool 2 ├→ Results
Tool 3 ┘
```

#### 3. Conditional (if/else)
Use conditional logic to choose which tool to run.

```
if (condition)
  Tool A
else
  Tool B
```

### Database Schema

```sql
-- Tool Chains (Workflows)
CREATE TABLE tool_chains (
    id ULID PRIMARY KEY,
    agent_id ULID,
    project_id ULID,
    name VARCHAR,
    description TEXT,
    execution_mode ENUM('sequential', 'parallel', 'conditional'),
    is_active BOOLEAN,
    execution_count INTEGER,
    last_executed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Steps in a chain
CREATE TABLE tool_chain_steps (
    id ULID PRIMARY KEY,
    tool_chain_id ULID,
    sequence INTEGER,           -- Order of execution
    tool_name VARCHAR,          -- Name of tool to execute
    parameters JSON,            -- Input params, may ref {{prev_result}}
    next_step_on_success VARCHAR,-- Which step to go next
    next_step_on_failure VARCHAR,-- Fallback step
    is_conditional BOOLEAN,
    condition_logic JSON,       -- {operator: 'and|or', conditions: [...]}
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chains_agent ON tool_chains(agent_id, project_id);
CREATE INDEX idx_steps_chain ON tool_chain_steps(tool_chain_id, sequence);
```

### API Endpoints

```
GET    /api/projects/{project}/agents/{agent}/workflows
POST   /api/projects/{project}/agents/{agent}/workflows
GET    /api/projects/{project}/agents/{agent}/workflows/{chain}
PUT    /api/projects/{project}/agents/{agent}/workflows/{chain}
DELETE /api/projects/{project}/agents/{agent}/workflows/{chain}
GET    /api/projects/{project}/agents/{agent}/workflows/{chain}/validate
GET    /api/projects/{project}/agents/{agent}/workflows/{chain}/plan
POST   /api/projects/{project}/agents/{agent}/workflows/{chain}/execute
```

### Usage Example

```typescript
// Create a tool chain
const chain = await api.post(`/agents/${agentId}/workflows`, {
    name: "Web Research",
    description: "Search web, fetch results, summarize",
    execution_mode: "sequential",
    steps: [
        {
            sequence: 1,
            tool_name: "web_search",
            parameters: { query: "{{ input }}" }
        },
        {
            sequence: 2,
            tool_name: "web_fetch",
            parameters: { url: "{{ web_search_result }}" }
        },
        {
            sequence: 3,
            tool_name: "api_call",
            parameters: {
                method: "POST",
                url: "https://summarizer-api.example.com/summarize",
                body: { content: "{{ web_fetch_result }}" }
            }
        }
    ]
});

// Execute the chain
const result = await api.post(`/agents/${agentId}/workflows/${chain.id}/execute`, {
    input_data: { input: "best programming languages 2024" }
});

// Result: { success: true, results: { web_search: {...}, web_fetch: {...}, api_call: {...} } }
```

### Service: ToolCompositionService

**Methods:**
- `execute()` - Run a chain with selected mode
- `executeSequential()` - Run tools in order
- `executeParallel()` - Run all tools at once
- `executeConditional()` - Run with if/else logic
- `validateChain()` - Check for errors
- `getExecutionPlan()` - Show execution graph

---

## Part 3: Agent Scheduling System

### Purpose
Run agents on cron schedules or trigger via webhooks without manual intervention.

### Trigger Types

#### 1. Cron (Scheduled)
Run on schedule: hourly, daily, weekly, etc.

```
"0 9 * * *"  → Every day at 9:00 AM
"0 */6 * * *" → Every 6 hours
"0 0 * * 0"  → Every Sunday at midnight
```

#### 2. Webhook
Call an endpoint to trigger execution

```
POST https://yourdomain.com/webhook/s3d7f2j9
{
    "message": "Custom input data"
}
```

#### 3. Manual
Run immediately via button click

### Database Schema

```sql
-- Agent Schedules
CREATE TABLE agent_schedules (
    id ULID PRIMARY KEY,
    agent_id ULID,
    project_id ULID,
    tool_chain_id ULID NULLABLE,
    name VARCHAR,
    description TEXT,
    cron_expression VARCHAR,    -- "0 9 * * *"
    trigger_type ENUM('cron', 'webhook', 'manual'),
    webhook_token VARCHAR UNIQUE,
    is_active BOOLEAN,
    input_data JSON,            -- Static input for executions
    last_executed_at TIMESTAMP,
    execution_count INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Execution history
CREATE TABLE schedule_executions (
    id ULID PRIMARY KEY,
    agent_schedule_id ULID,
    status ENUM('pending', 'running', 'success', 'failed', 'timeout'),
    input_data JSON,
    output_data JSON,
    error_message TEXT,
    duration_ms INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_schedules_active ON agent_schedules(is_active, trigger_type);
CREATE INDEX idx_executions_schedule ON schedule_executions(agent_schedule_id, status);
```

### API Endpoints

```
GET    /api/projects/{project}/agents/{agent}/schedules
POST   /api/projects/{project}/agents/{agent}/schedules
GET    /api/projects/{project}/agents/{agent}/schedules/{schedule}
PUT    /api/projects/{project}/agents/{agent}/schedules/{schedule}
DELETE /api/projects/{project}/agents/{agent}/schedules/{schedule}
POST   /api/projects/{project}/agents/{agent}/schedules/{schedule}/execute
GET    /api/projects/{project}/agents/{agent}/schedules/{schedule}/history
GET    /api/projects/{project}/agents/{agent}/schedules/{schedule}/stats
POST   /api/projects/{project}/agents/{agent}/schedules/{schedule}/toggle
```

### Usage Example

```typescript
// Create cron schedule
const schedule = await api.post(`/agents/${agentId}/schedules`, {
    name: "Daily Report",
    description: "Generate daily summary",
    trigger_type: "cron",
    cron_expression: "0 9 * * *",      // 9 AM daily
    tool_chain_id: chainId,             // Use workflow
    input_data: { report_type: "daily" }
});

// Create webhook schedule
const webhook = await api.post(`/agents/${agentId}/schedules`, {
    name: "Incoming Message Handler",
    trigger_type: "webhook",
    tool_chain_id: chainId
});

// webhook.webhook_token → "a3f7c2j9k..." (unique per schedule)
// Now call: POST /webhook/a3f7c2j9k... to trigger

// Execute manually
const result = await api.post(
    `/agents/${agentId}/schedules/${schedule.id}/execute`,
    { input_data: { custom_param: "value" } }
);

// Get execution history
const history = await api.get(
    `/agents/${agentId}/schedules/${schedule.id}/history?limit=20`
);

// Get stats
const stats = await api.get(
    `/agents/${agentId}/schedules/${schedule.id}/stats`
);
// { total: 100, successful: 98, failed: 2, success_rate: 0.98, avg_duration_ms: 2340 }
```

### Service: AgentSchedulerService

**Methods:**
- `createSchedule()` - Create cron schedule
- `createWebhookTrigger()` - Create webhook
- `queueExecution()` - Queue job
- `execute()` - Run now
- `processSchedules()` - Check and queue due schedules
- `getNextRunTime()` - Calculate next execution
- `isValidCron()` - Validate cron expr
- `getExecutionHistory()` - Retrieve past runs
- `getExecutionStats()` - Calculate metrics
- `triggerByWebhook()` - Handle webhook call
- `deactivate()` / `activate()` - Toggle schedule
- `delete()` - Remove schedule

### Job: ExecuteScheduledAgentJob

Queued job that actually runs the agent/workflow:
- Marks execution as started
- Executes tool chain or agent
- Records result and duration
- Handles errors and timeouts
- Logs all activity

---

## Artisan Commands

### Process Schedules

Check which cron schedules are due and queue them:

```bash
php artisan schedules:process
```

Add to Laravel scheduler in `app/Console/Kernel.php`:

```php
$schedule->command('schedules:process')->everyMinute();
```

### Cleanup Old Memories

Remove memories older than 30 days:

```bash
php artisan memory:cleanup --days=30
```

---

## Frontend Components

### AgentMemoryDashboard
- Display all agent memories
- Search functionality
- Relevance scores visualization
- Export to markdown
- Clear all memories

### ToolChainBuilder
- Visual workflow builder
- Drag-and-drop tool arrangement
- Parameter mapping
- Conditional logic editor
- Execution plan preview

### ScheduleManager
- Create/edit cron expressions
- Webhook management
- Manual execution button
- Execution history timeline
- Success rate metrics

### ExecutionMonitor
- Real-time job status
- Duration tracking
- Error messages
- Performance graphs
- Retry options

---

## Integration Points

### With Chat
When user sends message in conversation:

```php
// Store as memory
$memoryService->storeConversationTurn(
    $agent,
    $projectId,
    $userMessage,
    $agentResponse,
    $chatId
);

// Next time, inject memory context
$memoryContext = $memoryService->buildMemoryContext($agent, $projectId, $userMessage);
$prompt = $memoryContext . "\n\nUser: " . $userMessage;
```

### With Tool Execution
When tool executes:

```php
// Store tool execution as memory
$memoryService->storeToolExecution(
    $agent,
    $projectId,
    $toolName,
    $result,
    $chatId
);
```

### With Workflow
In agent actions, instead of single tool:

```php
// Execute entire workflow
$result = $compositionService->execute($toolChain, $inputData, $agent);
```

---

## Security Considerations

### Memory Privacy
- Each agent's memory is isolated by agent_id + project_id
- Memories are only accessible to project members
- API controllers should verify authorization

### Workflow Safety
- Tool chains can only use tools that are active
- Rate limiting still applies per tool
- Circular dependencies checked during validation
- Execution timeout (5 minutes) prevents infinite loops

### Webhook Security
- Webhook tokens are unique, random 32-character strings
- Regenerate token if compromised
- Only one active webhook per schedule
- Consider adding IP whitelist or HMAC signing

### Schedule Safety
- Cron validation prevents invalid expressions
- Concurrent executions prevented with job locking
- Timeout prevents long-running agents from blocking
- Failed executions don't crash system

---

## Performance Tips

### Memory Optimization
- Relevance scoring prevents table bloat
- Clean up old memories regularly
- Index on (agent_id, project_id, relevance_score)
- Consider pagination for large datasets

### Workflow Optimization
- Validate chains before saving
- Cache execution plans
- Parallel execution reduces total time
- Pre-test each tool before chaining

### Scheduling Optimization
- Process schedules every minute (not every second)
- Queue jobs for async execution
- Batch small tasks together
- Monitor queue depth

---

## Troubleshooting

### Memory not being retrieved
- Check agent_id and project_id match
- Verify memories table has data
- Confirm relevance_score > 0
- Check memory creation timestamps

### Workflows failing
- Run `/workflows/{chain}/validate` endpoint
- Check tool names match exactly
- Verify all tools are active
- Test parameters manually

### Schedules not running
- Verify cron expression with `isValidCron()`
- Check schedule is_active = true
- Confirm queue is processing jobs
- Check Laravel scheduler is running

---

## Future Enhancements

1. **Tool Result Caching** - Store tool outputs to avoid re-execution
2. **Workflow Versioning** - Keep history of workflow changes
3. **Agent Learning** - Analyze memory patterns to improve responses
4. **Workflow Analytics** - Track which workflows are most effective
5. **Collaborative Agents** - Multiple agents working on same workflow
6. **Tool Composition UI** - Visual workflow builder in frontend
7. **Smart Memory Pruning** - AI-powered memory summarization
8. **Webhook Signing** - HMAC-based security for webhooks

---

## Database Migrations

All migrations have been created:

```
2025_11_22_000013_create_agent_memories_table.php
2025_11_22_000014_create_tool_chains_table.php
2025_11_22_000015_create_tool_chain_steps_table.php
2025_11_22_000016_create_agent_schedules_table.php
2025_11_22_000017_create_schedule_executions_table.php
```

Run migrations:

```bash
php artisan migrate
```

---

## Models

- `AgentMemory` - Store and query memories
- `ToolChain` - Workflows/chains
- `ToolChainStep` - Individual workflow steps
- `AgentSchedule` - Scheduled executions
- `ScheduleExecution` - Execution history

All models include proper relationships and helper methods.

---

## Services

- `AgentMemoryService` - Memory management
- `ToolCompositionService` - Workflow orchestration
- `AgentSchedulerService` - Schedule management

All services are dependency-injected and testable.

---

## Controllers

- `AgentMemoryController` - Memory API
- `ToolChainController` - Workflow API
- `AgentScheduleController` - Schedule API

All controllers follow REST conventions and include validation.

---

## Status

✅ **Complete Implementation**
- 5 database migrations created
- 5 models with relationships
- 3 service classes
- 3 API controllers
- 1 queued job
- Comprehensive route definitions
- Full documentation

**Ready for:** Frontend component development and testing
