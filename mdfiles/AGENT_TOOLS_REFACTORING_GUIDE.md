# Agent Tools System - Refactoring Update Guide

## What Changed?

The Agent Tools system has been simplified to follow a global tools registry pattern:

### Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Tool Storage** | Global + Per-Agent | Global only |
| **Agent-Tool Relationship** | Many-to-Many (agent_tools table) | None (dynamic lookup) |
| **Tool Configuration** | Per-agent in pivot table | Global in tools table |
| **Tool Execution** | Lookup agent→tool→execute | Lookup tool by name→execute |
| **Admin Interface** | Manage tools per agent | Manage global tools |
| **Database Tables** | `tools` + `agent_tools` | `tools` only |

### Deleted Items

❌ **Migration File:** `2025_11_22_000013_create_agent_tools_table.php`
❌ **Model:** `AgentTool.php`
❌ **Component:** `ToolConfigDialog.tsx`
❌ **Agent Relationship:** `tools()` BelongsToMany relationship

### Modified Items

✏️ **Model:** `Agent.php` - Removed `tools()` relationship and `BelongsToMany` import
✏️ **Controller:** `AgentToolController.php` - Completely refactored for global tools management
✏️ **Routes:** `project-chats.php` - Simplified tool routes, removed agent-specific endpoints
✏️ **Component:** `ToolSelector.tsx` - Simplified to just browse tools (no attach API call)
✏️ **Component:** `AgentToolList.tsx` - Converted to grid-based tools browser
✏️ **Component:** `ToolExecutor.tsx` - Removed agentId parameter (tools are agent-agnostic)
✏️ **Page:** `AgentTools.tsx` - Simplified to global tools browser

## How to Use the New System

### For Developers Using Tools in Agents

**Before (Old Way):**
```php
// Step 1: Attach tool to agent
$agent->tools()->attach($toolId, [
    'configuration' => [...],
    'permissions' => [...],
    'sequence' => 0,
]);

// Step 2: Get configured tools
$agentTools = $agent->tools()->where('is_enabled', true)->get();

// Step 3: Execute
foreach ($agentTools as $tool) {
    $result = $toolExecutor->execute($tool->name, $params, $agent);
}
```

**After (New Way):**
```php
// Simply execute by tool name - no pre-configuration needed
$result = $toolExecutor->execute('web_search', ['query' => 'Laravel'], $agent);

// Or loop through tool names directly
$toolNames = ['web_search', 'file_create'];
foreach ($toolNames as $toolName) {
    $result = $toolExecutor->execute($toolName, $params, $agent);
}
```

### For Frontend Developers

**Before (Old Way):**
```tsx
// In agent configuration page
<ToolSelector 
  projectId={project.id}
  agentId={agent.id}  // ← Required, makes API call to attach
  selectedTools={toolIds}
  onToolSelected={handleToolAdded}
/>

<AgentToolList 
  projectId={project.id}
  agentId={agent.id}  // ← Required
  tools={agentTools}
  onToolsUpdated={fetchAgentTools}
/>
```

**After (New Way):**
```tsx
// Tools are browsed globally, not attached to agents
<AgentToolList 
  projectId={project.id}  // ← Only projectId needed
  onToolSelected={(tool) => setSelectedTool(tool)}  // ← Just a callback
/>

<ToolExecutor 
  projectId={project.id}
  tool={selectedTool}
  // ← agentId parameter removed
/>
```

### For Admin/System Configuration

**Managing Tools:**

1. **View all tools:**
   ```
   GET /api/projects/{project}/tools
   ```

2. **Create a new tool (admin):**
   ```
   POST /api/projects/{project}/tools
   {
     "name": "new_tool",
     "display_name": "New Tool",
     "description": "...",
     "category": "utility",
     "parameters": {...},
     "return_schema": {...},
     "rate_limit": 100,
     "is_active": true
   }
   ```

3. **Update existing tool (admin):**
   ```
   PUT /api/projects/{project}/tools/web_search
   ```

4. **Delete tool (admin):**
   ```
   DELETE /api/projects/{project}/tools/web_search
   ```

## Migration Steps

If you have existing code using the old agent_tools system:

### Step 1: Stop using agent tool relationships
```diff
- $agent->tools()->attach($toolId, $config);
+ // Just call the tool directly when needed
```

### Step 2: Update tool execution
```diff
- $enabledTools = $agent->tools()->where('is_enabled', true);
- foreach ($enabledTools as $tool) {
-     $result = $toolExecutor->execute($tool->name, $params, $agent);
- }
+ // Call tools directly by name
+ $result = $toolExecutor->execute('web_search', $params, $agent);
```

### Step 3: Update any custom controller/service code
```diff
- if ($agent->tools()->where('tool_id', $toolId)->exists()) {
-     // Tool is attached
- }
+ // No need to check attachment - just execute the tool
+ $result = $toolExecutor->execute($toolName, $params, $agent);
```

## API Endpoint Changes

### Removed Endpoints
```
GET  /api/projects/{project}/agents/{agent}/tools
POST /api/projects/{project}/agents/{agent}/tools
PUT  /api/projects/{project}/agents/{agent}/tools/{tool}
DELETE /api/projects/{project}/agents/{agent}/tools/{tool}
```

### New/Updated Endpoints
```
GET  /api/projects/{project}/tools              # List all tools
GET  /api/projects/{project}/tools/{toolName}   # Get tool details
POST /api/projects/{project}/tools              # Create tool (admin)
PUT  /api/projects/{project}/tools/{toolName}   # Update tool (admin)
DELETE /api/projects/{project}/tools/{toolName} # Delete tool (admin)
POST /api/projects/{project}/tools/{toolName}/execute  # Execute tool
POST /api/projects/{project}/tools/{toolName}/test     # Test tool
GET  /api/projects/{project}/tools/{toolName}/guidelines # Get guidelines
```

## Database Migration

The `agent_tools` table is not created. If you previously ran migrations:

```php
// In a new migration to clean up (optional)
Schema::dropIfExists('agent_tools');
```

## Testing the New System

### Test in Browser
1. Navigate to `/projects/{project}/tools`
2. Browse all available tools
3. Click "View Details" to see tool parameters
4. Click "Test" to execute with sample data
5. View execution results

### Test Programmatically
```php
$result = app(ToolExecutorService::class)->execute(
    'web_search',
    ['query' => 'Laravel 12'],
    null // Agent is optional
);

assert($result['success'] === true);
```

## Common Issues & Solutions

### Issue: "Tool not found" error
**Solution:** Make sure tool name matches exactly (case-sensitive). Check available tools:
```php
$tools = Tool::active()->get()->pluck('name');
```

### Issue: Tool rate limit exceeded
**Solution:** Rate limits are per-minute globally. Check current usage:
```php
$key = 'tool_rate_limit_web_search';
$usage = Cache::get($key, 0);
```

### Issue: File operation fails
**Solution:** File tools are scoped to project storage. Use relative paths:
```php
// Good
$toolExecutor->execute('file_read', ['path' => 'documents/report.pdf'], $agent);

// Bad - won't work
$toolExecutor->execute('file_read', ['path' => '/etc/passwd'], $agent);
```

## Performance Improvements

✅ No complex JOINs needed to find agent tools
✅ Redis caching for rate limiting is more efficient
✅ Simpler database queries
✅ Reduced memory footprint

## Backward Compatibility

⚠️ **Breaking Change:** Code using `$agent->tools()` will fail. This is intentional to encourage the new pattern.

If you have legacy code, update to use `ToolExecutorService` directly instead.

## Need Help?

- See `AGENT_TOOLS_ARCHITECTURE_REFACTORED.md` for detailed architecture
- See `AGENT_TOOLS_SYSTEM.md` for tool documentation
- Check `ToolExecutorService.php` for implementation details

---

**Refactoring Date:** November 2024
**Status:** Production Ready
**Breaking Changes:** Yes (agent_tools table removed)
