# Agent Tools System - Refactored Architecture

## Overview

The Agent Tools system has been refactored to follow a cleaner, more scalable architecture:

- **Tools** are global resources created and managed by administrators
- **Agents** can dynamically call any available tool by name at runtime
- No pre-configuration or attachment of tools to agents is required
- Tools are shared across all agents in the system

## Architecture Changes

### Before Refactoring
```
Database: tools table + agent_tools pivot table
Relationship: Agent hasMany Tool (many-to-many)
Configuration: Per-agent tool config stored in agent_tools.configuration
Execution: Agent → Agent_Tool → Tool → Execute
API: Tool management scoped per agent
```

### After Refactoring
```
Database: tools table only
Relationship: None (decoupled)
Configuration: Global tool config in tools table
Execution: Agent → Tool (by name) → Execute
API: Tool management global (admin only)
```

## Key Components

### 1. Tools Table (Global Registry)
```php
Schema::create('tools', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name')->unique(); // web_search, file_read, api_call, etc.
    $table->string('display_name');
    $table->text('description');
    $table->string('category'); // search, file, api, code, utility
    $table->string('icon_url')->nullable();
    $table->json('parameters'); // Parameter schemas
    $table->json('return_schema'); // Expected return format
    $table->integer('rate_limit'); // Requests per minute
    $table->boolean('requires_api_key')->default(false);
    $table->json('configuration')->nullable(); // Global config
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

**Removed:**
- `agent_tools` table (no longer needed)
- `agent_tools` pivot relationship from Agent model

### 2. Tool Executor Service
```php
ToolExecutorService::execute(string $toolName, array $parameters = [], ?Agent $agent = null)
```

The service:
- Looks up tool by name from global registry
- Validates tool is active
- Checks rate limits (Redis cache)
- Executes the tool with provided parameters
- Returns standardized result

**Agents can be passed optionally** for context (e.g., file operations scoped to project storage).

### 3. Available Tools (10 Global Tools)

All tools are now globally accessible:

| Tool | Category | Rate Limit | Purpose |
|------|----------|-----------|---------|
| web_search | search | 100/min | Search the internet |
| web_fetch | search | 50/min | Extract content from URLs |
| file_read | file | 200/min | Read files from storage |
| file_create | file | 100/min | Create files in storage |
| file_delete | file | 100/min | Delete files from storage |
| api_call | api | 150/min | Make HTTP requests |
| code_execute | code | 50/min | Run code (PHP/Python/JS) |
| send_email | utility | 30/min | Send emails |
| get_weather | utility | 60/min | Get weather data |
| database_query | utility | 20/min | Execute SELECT queries |

### 4. API Endpoints

#### Public (All Authenticated Users)
```
GET  /api/projects/{project}/tools              # List available tools
GET  /api/projects/{project}/tools/{toolName}   # Get tool details
POST /api/projects/{project}/tools/{toolName}/execute  # Execute tool
POST /api/projects/{project}/tools/{toolName}/test     # Test tool
GET  /api/projects/{project}/tools/{toolName}/guidelines # Get guidelines
```

#### Admin Only
```
POST   /api/projects/{project}/tools             # Create tool
PUT    /api/projects/{project}/tools/{toolName}  # Update tool
DELETE /api/projects/{project}/tools/{toolName}  # Delete tool
```

### 5. Frontend Components

#### ToolSelector (Browse & Select)
- Simple popover dropdown
- Filter by category
- Search across tools
- Callback on selection (no API call needed)

#### AgentToolList (Display Available Tools)
- Grid view of all available tools
- Filter by category
- Copy tool name to clipboard
- View details button

#### ToolExecutor (Test Tools)
- Parameter builder interface
- JSON editor mode
- Test execution with sample data
- View execution results
- Expected response schema reference

## Usage Pattern

### Agents Using Tools

**Old Way:**
```php
// 1. Attach tool to agent
$agent->tools()->attach($tool->id, ['configuration' => [...], 'permissions' => [...]]);

// 2. In action execution, find enabled tools for agent
$tools = $agent->tools()->where('is_enabled', true)->get();

// 3. Execute specific tool
$result = $toolExecutor->execute($tool->name, $params, $agent);
```

**New Way:**
```php
// 1. Simply call tool by name (no pre-configuration needed)
$result = $toolExecutor->execute('web_search', ['query' => 'Laravel'], $agent);

// OR in a loop for multiple tools
$toolNames = ['web_search', 'file_create', 'api_call'];
foreach ($toolNames as $toolName) {
    $result = $toolExecutor->execute($toolName, $params, $agent);
}
```

### From Agent Actions

In `AgentActionService` or action execution:

```php
// When an action needs to execute tools
$tools = ['web_search', 'file_create']; // Just tool names

foreach ($tools as $toolName) {
    $result = $this->toolExecutor->execute($toolName, $toolParams, $agent);
    // Use result in next action or store in context
}
```

## Benefits of This Architecture

✅ **Simpler Database Schema** - Fewer tables, less complexity
✅ **Scalability** - Add new tools without modifying agent relationships
✅ **Flexibility** - Tools can be called dynamically by name
✅ **Centralized Management** - Admins manage tools once for all agents
✅ **Decoupling** - Agents don't depend on tool presence
✅ **Easier Testing** - Tools can be tested independently
✅ **Better Performance** - No JOIN queries needed for tools
✅ **Cleaner Code** - No BelongsToMany relationship complexity

## Security Considerations

### Rate Limiting
- Global rate limits per tool (20-200 requests/minute)
- Redis cache tracks per-minute usage
- Prevents abuse across all agents

### Tool Validation
- Tool must be active before execution
- Validates all required parameters
- Type checking on parameters

### Resource Access
- File tools scoped to project storage
- Database tool SELECT-only
- Code execution timeout (10 seconds)
- HTTP method whitelist for API calls
- No directory traversal allowed

## Migration from Old System

If agents had pre-configured tools:

```php
// Migration script
Agent::all()->each(function ($agent) {
    // Extract tool names
    $toolNames = $agent->tools()->pluck('name')->all();
    
    // Store in agent configuration or document for reference
    $agent->update([
        'configuration' => array_merge(
            $agent->configuration ?? [],
            ['available_tools' => $toolNames]
        )
    ]);
    
    // Detach all tools (or keep for reference)
    $agent->tools()->detach();
});
```

## Frontend Integration

### Tools Page
- Browse all available tools
- Test tools with sample data
- View tool documentation
- Copy tool names for integration

### Agent Configuration
- No longer needed to attach tools
- Agents can reference tools by name
- Tool capabilities documented in help

## Future Enhancements

1. **Tool Composition** - Use output of one tool as input to another
2. **Async Execution** - Queue long-running tools
3. **Tool Webhooks** - Call external services as tools
4. **Conditional Execution** - If-then logic for tool sequences
5. **Tool Versioning** - Manage multiple versions of tools
6. **Usage Analytics** - Track tool execution metrics
7. **Custom Tools** - Allow users to create custom tools

## Configuration

To add a new global tool, add to `ToolSeeder`:

```php
Tool::create([
    'name' => 'custom_tool',
    'display_name' => 'Custom Tool',
    'description' => 'Description',
    'category' => 'utility',
    'parameters' => [
        'param1' => ['type' => 'string', 'required' => true],
    ],
    'return_schema' => ['result' => ['type' => 'string']],
    'rate_limit' => 100,
    'is_active' => true,
]);
```

Then add execution logic to `ToolExecutorService::execute()`:

```php
'custom_tool' => $this->executeCustomTool($parameters),
```

---

**Last Updated:** November 2024
**Version:** 2.0 (Refactored)
**Status:** Production Ready
