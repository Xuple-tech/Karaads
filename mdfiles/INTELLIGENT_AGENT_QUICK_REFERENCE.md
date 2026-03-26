# Intelligent Agent System - Quick Reference Card

## 📦 What's Included

| Component | Status | Location |
|-----------|--------|----------|
| **Backend** | ✅ Complete | `/app/Services`, `/app/Http/Controllers`, `/app/Models` |
| **Migrations** | ✅ Complete | `/database/migrations` |
| **Frontend Components** | ✅ Complete | `/resources/js/components/AgentIntelligence` |
| **Utilities** | ✅ Complete | `/resources/js/utils/agentIntelligence.ts` |
| **Main Page** | ✅ Complete | `/resources/js/pages/Projects/AgentIntelligence.tsx` |
| **Routes** | ⏳ Integration | Need to add to `routes/web.php` |
| **Navigation** | ⏳ Integration | Need to add to agent detail page |

## 🎯 Three Systems at a Glance

### 1. 🧠 Memory System
```
What:    Store conversation context
Where:   MemoryDashboard component
API:     /api/projects/{id}/agents/{id}/memories/*
Table:   agent_memories
Trigger: Automatic on each chat turn
```

**Key Features:**
- Auto-store conversation context
- Relevance scoring (increases with reuse)
- Search & tag filtering
- Export to markdown
- Statistics tracking

**Usage:**
```typescript
// Component location
<MemoryDashboard projectId={id} agentId={id} />

// API call
GET /api/projects/{id}/agents/{id}/memories
```

### 2. ⚙️ Workflow System
```
What:    Chain tools together
Where:   WorkflowBuilder component
API:     /api/projects/{id}/agents/{id}/workflows/*
Table:   tool_chains, tool_chain_steps
Trigger: Manual or scheduled
```

**Key Features:**
- Sequential execution (→)
- Parallel execution (∥)
- Conditional execution (if/else)
- Parameter passing between tools
- Validation and execution planning

**Usage:**
```typescript
// Component location
<WorkflowBuilder projectId={id} agentId={id} />

// Create workflow
POST /api/projects/{id}/agents/{id}/workflows
{
  name: "My Workflow",
  execution_mode: "sequential",
  steps: [...]
}
```

### 3. 🕐 Scheduling System
```
What:    Automate workflow execution
Where:   ScheduleManager component
API:     /api/projects/{id}/agents/{id}/schedules/*
Table:   agent_schedules, schedule_executions
Trigger: Cron, Webhook, or Manual
```

**Key Features:**
- Cron-based scheduling
- Webhook triggering
- Manual execution
- Execution history tracking
- Next run time calculation

**Usage:**
```typescript
// Component location
<ScheduleManager projectId={id} agentId={id} />

// Create schedule
POST /api/projects/{id}/agents/{id}/schedules
{
  name: "Daily Task",
  trigger_type: "cron",
  cron_expression: "0 12 * * *"
}
```

## 🔧 Setup Quickstart

### 1. Database
```bash
# Run migrations
php artisan migrate
```

### 2. Queue (required for scheduling)
```bash
# Development
php artisan queue:listen

# Production - Add supervisor config
# /etc/supervisor/conf.d/laravel-queue.conf
```

### 3. Cron Job (for scheduler)
```bash
# Linux/Mac - Add to crontab
* * * * * cd /path/to/app && php artisan schedule:run

# Windows - Use Task Scheduler
```

### 4. Routes
```php
// Add to routes/web.php
Route::get('/projects/{project}/agents/{agent}/intelligence',
    [AgentIntelligenceController::class, 'show'])
    ->name('projects.agents.intelligence');
```

### 5. Controller
```php
// Create app/Http/Controllers/AgentIntelligenceController.php
// Use example from integration checklist
```

### 6. Navigation
```typescript
// Add link in agent detail page
<Link href={`/projects/${projectId}/agents/${agentId}/intelligence`}>
    Intelligence Hub
</Link>
```

## 📊 Data Flow

### Memory Flow
```
Chat Message → AgentMemoryService → Store → Relevance Score
                                      ↓
                          Next chat retrieves relevant
                          → Injected in system prompt
```

### Workflow Flow
```
Create → Steps → Validate → Test → Save → Execute
            ↓
    Sequential: Tool1 → Tool2 → Tool3
    Parallel: All at once
    Conditional: If/else logic
            ↓
    Record Results → ScheduleExecution
```

### Schedule Flow
```
Create → Cron Expression → Queue Job → Execute → Track
             ↓
    Runs via Laravel Scheduler
    Queue worker processes job
    Records execution history
```

## 🔌 API Endpoints Summary

### Memory (7 endpoints)
```
GET    /memories           - List all
POST   /memories           - Create
GET    /memories/search    - Search
GET    /memories/relevant  - Get relevant ones
DELETE /memories/{id}      - Delete
POST   /memories/clear     - Clear all
GET    /memories/export    - Export as MD
```

### Workflows (8 endpoints)
```
GET    /workflows          - List all
POST   /workflows          - Create
GET    /workflows/{id}     - Get details
PUT    /workflows/{id}     - Update
DELETE /workflows/{id}     - Delete
POST   /workflows/validate - Validate
POST   /workflows/plan     - Get plan
POST   /workflows/{id}/execute - Run
```

### Schedules (10 endpoints)
```
GET    /schedules          - List all
POST   /schedules          - Create
GET    /schedules/{id}     - Get details
PUT    /schedules/{id}     - Update
DELETE /schedules/{id}     - Delete
POST   /schedules/{id}/execute - Run now
POST   /schedules/{id}/toggle - Enable/disable
GET    /schedules/history  - Execution history
GET    /schedules/stats    - Statistics
```

## 📁 File Locations

```
Backend:
├── app/
│   ├── Models/
│   │   ├── AgentMemory.php
│   │   ├── ToolChain.php
│   │   ├── ToolChainStep.php
│   │   ├── AgentSchedule.php
│   │   └── ScheduleExecution.php
│   ├── Services/
│   │   ├── AgentMemoryService.php
│   │   ├── ToolCompositionService.php
│   │   └── AgentSchedulerService.php
│   ├── Http/Controllers/
│   │   ├── AgentMemoryController.php
│   │   ├── ToolChainController.php
│   │   ├── AgentScheduleController.php
│   │   └── AgentIntelligenceController.php (create)
│   └── Jobs/
│       └── ExecuteScheduledAgentJob.php
├── database/migrations/
│   ├── *_create_agent_memories_table.php
│   ├── *_create_tool_chains_table.php
│   ├── *_create_tool_chain_steps_table.php
│   ├── *_create_agent_schedules_table.php
│   └── *_create_schedule_executions_table.php
└── routes/
    └── project-chats.php (include routes)

Frontend:
├── resources/js/
│   ├── components/AgentIntelligence/
│   │   ├── MemoryDashboard.tsx
│   │   ├── WorkflowBuilder.tsx
│   │   ├── ScheduleManager.tsx
│   │   ├── ExecutionMonitor.tsx
│   │   └── WorkflowExecutionDetails.tsx
│   ├── pages/Projects/
│   │   └── AgentIntelligence.tsx
│   └── utils/
│       └── agentIntelligence.ts

Documentation:
├── INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md
├── INTELLIGENT_AGENT_FRONTEND_GUIDE.md
├── INTELLIGENT_AGENT_IMPLEMENTATION_COMPLETE.md
├── INTELLIGENT_AGENT_INTEGRATION_CHECKLIST.md
└── INTELLIGENT_AGENT_QUICK_REFERENCE.md (this file)
```

## 🎯 Common Tasks

### Create Memory Programmatically
```php
// In service or controller
use App\Services\AgentMemoryService;

$memoryService = app(AgentMemoryService::class);
$memory = $memoryService->store(
    agent: $agent,
    context: "User preferences: dark mode, 12-hour time",
    tags: ['preferences', 'user']
);
```

### Execute Workflow
```php
use App\Services\ToolCompositionService;

$compositionService = app(ToolCompositionService::class);
$result = $compositionService->executeChain(
    toolChain: $workflow,
    inputData: ['query' => 'example']
);
```

### Create Schedule
```php
use App\Services\AgentSchedulerService;

$schedulerService = app(AgentSchedulerService::class);
$schedule = $schedulerService->createSchedule(
    agent: $agent,
    toolChain: $workflow,
    cronExpression: '0 12 * * *'
);
```

## 🔐 Security Notes

| Aspect | Protection |
|--------|-----------|
| Memory | Isolated per agent/project |
| Workflows | Tool validation, timeout protection |
| Webhooks | Token-based authentication |
| Scheduling | Queue job with timeout |
| Access | Auth/authorization middleware |

## 📈 Performance Tips

1. **Memory:** Add pagination for 1000+ records
2. **Workflows:** Cache tool definitions
3. **Schedules:** Use queue for large batches
4. **Monitoring:** Disable auto-refresh for large history
5. **Database:** Add indexes on foreign keys and status fields

## 🐛 Debugging Checklist

| Issue | Checklist |
|-------|-----------|
| Schedules not running | Queue listener running? Cron job exists? |
| Memories not saving | Agent permissions? DB connection? |
| Workflows failing | Valid tool names? Correct parameters? |
| Frontend errors | Check network tab, console errors? |
| Authorization issues | User owns agent? Middleware correct? |

## 📞 Support Resources

1. **Tech Docs:** `INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md`
2. **Frontend Guide:** `INTELLIGENT_AGENT_FRONTEND_GUIDE.md`
3. **Integration Help:** `INTELLIGENT_AGENT_INTEGRATION_CHECKLIST.md`
4. **Implementation:** `INTELLIGENT_AGENT_IMPLEMENTATION_COMPLETE.md`

## 🎓 Learning Path

1. Read: `INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md` (understand architecture)
2. Review: Backend models and services
3. Setup: Run migrations, configure queue
4. Explore: Frontend components
5. Integrate: Add routes and navigation
6. Test: Follow integration checklist
7. Deploy: Production setup

## 🚀 Next Steps

- [ ] Review documentation
- [ ] Run migrations
- [ ] Configure queue worker
- [ ] Add routes
- [ ] Add navigation link
- [ ] Test all features
- [ ] Deploy to production

## 📋 Quick Configuration

**.env Configuration:**
```
QUEUE_CONNECTION=redis  # or database
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

**Cron Example:**
```bash
0 * * * *       # Every hour
0 12 * * *      # Daily at noon
0 9 * * 1       # Every Monday at 9 AM
0 0 1 * *       # First day of month
0 18 * * 0      # Every Sunday at 6 PM
```

## 💡 Pro Tips

1. **Test Workflows:** Use "Test Execute" before saving
2. **Export Memories:** Great for backup and analysis
3. **Cron Presets:** Use UI presets instead of manual entry
4. **Auto-refresh:** Toggle in monitor during heavy testing
5. **Webhooks:** Generate new tokens for security

---

**Version:** 1.0  
**Last Updated:** 2025  
**Status:** Production Ready ✅
