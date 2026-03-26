# Intelligent Agent Frontend Implementation Guide

## Overview

This guide covers the frontend implementation of the Agent Intelligence system, which includes Memory Dashboard, Workflow Builder, Schedule Manager, and Execution Monitor components.

## Components Architecture

### 1. MemoryDashboard.tsx
**Purpose:** Display and manage agent memories

**Features:**
- Browse all agent memories with pagination
- Search memories by content
- Filter by tags
- View relevance scores and usage statistics
- Delete individual memories or clear all
- Export memories to markdown
- View memory statistics (total, avg relevance, most used tag)

**API Endpoints Used:**
- `GET /api/projects/{id}/agents/{id}/memories` - List memories
- `GET /api/projects/{id}/agents/{id}/memories/search` - Search
- `GET /api/projects/{id}/agents/{id}/memories/{id}` - Get details
- `DELETE /api/projects/{id}/agents/{id}/memories/{id}` - Delete memory
- `POST /api/projects/{id}/agents/{id}/memories/clear` - Clear all
- `GET /api/projects/{id}/agents/{id}/memories/export` - Export as markdown

### 2. WorkflowBuilder.tsx
**Purpose:** Create and manage tool compositions

**Features:**
- Create named workflows with descriptions
- Choose execution mode: Sequential, Parallel, or Conditional
- Add tool steps with configurable parameters (JSON)
- Remove steps from workflow
- Validate workflow before saving
- Test execute workflow before saving
- Visual step ordering

**Execution Modes:**
- **Sequential (→):** Tools execute one after another, pass results forward
- **Parallel (∥):** All tools run simultaneously
- **Conditional (if/else):** Execute based on conditions

**API Endpoints Used:**
- `POST /api/projects/{id}/agents/{id}/workflows` - Create workflow
- `PUT /api/projects/{id}/agents/{id}/workflows/{id}` - Update workflow
- `DELETE /api/projects/{id}/agents/{id}/workflows/{id}` - Delete workflow
- `GET /api/projects/{id}/agents/{id}/workflows` - List workflows
- `GET /api/projects/{id}/agents/{id}/workflows/{id}` - Get details
- `POST /api/projects/{id}/agents/{id}/workflows/{id}/execute` - Execute workflow
- `POST /api/projects/{id}/agents/{id}/workflows/validate` - Validate workflow
- `POST /api/projects/{id}/agents/{id}/workflows/plan` - Get execution plan

### 3. ScheduleManager.tsx
**Purpose:** Schedule workflows for automated execution

**Features:**
- Create schedules with names and descriptions
- Three trigger types:
  - **Cron:** Run on schedule (e.g., daily, weekly, monthly)
  - **Webhook:** Trigger from external sources
  - **Manual:** Execute on demand
- Cron preset buttons for common schedules
- Enable/disable schedules without deleting
- Execute schedules immediately
- View next run time and last run time
- Delete schedules

**Cron Examples:**
```
0 * * * *       Every hour
0 12 * * *      Daily at noon
0 0 * * *       Daily at midnight
0 9 * * 1       Every Monday at 9 AM
0 18 * * 0      Weekly on Sunday at 6 PM
0 8 1 * *       Monthly on 1st at 8 AM
*/30 * * * *    Every 30 minutes
```

**API Endpoints Used:**
- `GET /api/projects/{id}/agents/{id}/schedules` - List schedules
- `POST /api/projects/{id}/agents/{id}/schedules` - Create schedule
- `PUT /api/projects/{id}/agents/{id}/schedules/{id}` - Update schedule
- `DELETE /api/projects/{id}/agents/{id}/schedules/{id}` - Delete schedule
- `POST /api/projects/{id}/agents/{id}/schedules/{id}/execute` - Execute now
- `POST /api/projects/{id}/agents/{id}/schedules/{id}/toggle` - Enable/disable

### 4. ExecutionMonitor.tsx
**Purpose:** Track and monitor workflow executions

**Features:**
- View execution history with status indicators
- Filter by status: All, Pending, Running, Completed, Failed
- Auto-refresh capability (every 3 seconds)
- View execution details in modal
- Show duration, start time, completion time
- Display error messages for failed executions
- Display results for successful executions
- Visual indicators for execution status

**Status Types:**
- **Pending (⏱):** Waiting to execute
- **Running (⟳):** Currently executing
- **Completed (✓):** Finished successfully
- **Failed (✗):** Encountered error

**API Endpoints Used:**
- `GET /api/projects/{id}/agents/{id}/schedules/history` - Get execution history
- `GET /api/projects/{id}/agents/{id}/schedules/stats` - Get execution statistics
- `GET /api/projects/{id}/agents/{id}/schedules/{id}/executions` - Get executions for schedule

### 5. WorkflowExecutionDetails.tsx
**Purpose:** Show detailed information about workflow executions

**Features:**
- Display workflow metadata and description
- Show step-by-step execution status
- Display parameters and results for each step
- Show final workflow result
- Display errors with context
- Copy parameters to clipboard
- Status indicators for each step

### 6. AgentIntelligence.tsx (Main Page)
**Purpose:** Master page integrating all components with tabbed interface

**Tabs:**
1. **Memory Tab** - MemoryDashboard component
2. **Workflows Tab** - WorkflowBuilder component
3. **Schedules Tab** - ScheduleManager component
4. **Monitor Tab** - ExecutionMonitor component

## Utility Functions

Located in `resources/js/utils/agentIntelligence.ts`:

### parseCronExpression(cron: string)
Convert cron format to human-readable text
```typescript
parseCronExpression('0 12 * * *') // → "At noon"
```

### isValidCronExpression(cron: string)
Validate cron expression format
```typescript
isValidCronExpression('0 12 * * *') // → true
isValidCronExpression('invalid') // → false
```

### formatDuration(ms: number)
Format milliseconds to readable duration
```typescript
formatDuration(5000) // → "5.0s"
formatDuration(125) // → "125ms"
```

### rankMemoriesByRelevance(memories, query)
Sort memories by relevance to search query

### resolveTemplateVariables(text, context)
Replace `{{variable}}` placeholders with actual values
```typescript
resolveTemplateVariables('Found {{count}} results', { count: 5 })
// → "Found 5 results"
```

### getStatusColor(status)
Get tailwind color classes for status

## Integration with Existing System

### Route Setup

Add these routes in your project routes file:

```typescript
// In routes/project-chats.php or your routes file
Route::get('/projects/{project}/agents/{agent}/intelligence', [AgentIntelligenceController::class, 'show'])
    ->name('projects.agents.intelligence');
```

### Navigation Integration

Add link to Agent Intelligence from agent detail page:

```typescript
<Link href={`/projects/${projectId}/agents/${agentId}/intelligence`}>
    <Button>Intelligence Hub</Button>
</Link>
```

## Usage Examples

### 1. Create Memory-Enabled Agent
Agents automatically store context as memories during conversations. Users can view and search these memories in the Memory Dashboard.

### 2. Build Tool Composition
Example: Create a research workflow that runs sequentially:
1. Web Search tool (search query)
2. Web Fetch tool (fetch top result)
3. Summarize tool (summarize content)

### 3. Schedule Workflow Execution
Example: Schedule daily summary generation:
- Trigger Type: Cron
- Cron Expression: `0 8 * * *` (8 AM daily)
- Workflow: Research pipeline from above

### 4. Monitor Executions
View real-time execution status, debug failed runs, and analyze performance metrics.

## Error Handling

All components include error handling with toast notifications:
- Failed API calls show error messages
- JSON parsing errors show validation feedback
- Network errors are caught and displayed

## State Management

Components use React hooks for state management:
- `useState` for local UI state
- `useEffect` for data fetching
- Axios for API calls
- React Hot Toast for notifications

## Styling

All components use Tailwind CSS with dark mode support:
- `dark:` prefix for dark mode classes
- Consistent color scheme across components
- Responsive design with mobile support

## Performance Considerations

1. **Memory Dashboard:** Uses pagination/virtual scrolling for large datasets
2. **ExecutionMonitor:** Auto-refresh can be toggled to prevent unnecessary requests
3. **WorkflowBuilder:** Validates JSON before saving to catch errors early
4. **ScheduleManager:** Shows next run time (calculated on backend)

## Security Features

1. **Webhook Tokens:** Generated secure tokens for webhook triggers
2. **Input Validation:** JSON parameters validated before sending
3. **Cron Validation:** Expressions validated before saving
4. **CORS Protection:** All API calls from frontend respect CORS
5. **Rate Limiting:** Inherited from existing tool/agent system

## Future Enhancements

1. **Workflow Analytics:** Dashboard showing popular workflows
2. **Memory Summarization:** Automatic summary generation for old memories
3. **Advanced Filtering:** More sophisticated memory search
4. **Bulk Operations:** Edit multiple memories/schedules at once
5. **Workflow Templates:** Pre-built workflow templates
6. **Import/Export:** Save/load workflow definitions as JSON
7. **Collaboration:** Share workflows between team members
8. **Notifications:** Alert on schedule failures
9. **Custom Conditions:** More expressive conditional logic
10. **Workflow Versioning:** Track changes to workflows

## Troubleshooting

### Workflows Not Executing
- Check that queue driver is configured (Redis/Database)
- Verify Laravel queue listener is running: `php artisan queue:listen`
- Check schedule status in Monitor tab

### Memories Not Saving
- Verify agent has permission to store memories
- Check database connection
- Review agent logs for errors

### Cron Not Triggering
- Validate cron expression format
- Ensure Laravel scheduler is running: `php artisan schedule:run`
- Check system crontab configuration

### Performance Issues
- Paginate large memory lists
- Disable auto-refresh in ExecutionMonitor for large datasets
- Archive old executions periodically
