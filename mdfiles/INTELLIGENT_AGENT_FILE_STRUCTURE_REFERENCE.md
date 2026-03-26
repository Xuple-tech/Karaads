# Intelligent Agent System - Complete File Structure & Dependencies

## 📁 Project File Structure

```
rheaapp/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AgentIntelligenceController.php ⭐ NEW
│   │       ├── AgentMemoryController.php
│   │       ├── AgentScheduleController.php
│   │       ├── AgentToolController.php
│   │       ├── ProjectAgentController.php
│   │       └── ToolChainController.php
│   ├── Models/
│   │   ├── Agent.php
│   │   ├── AgentMemory.php
│   │   ├── AgentSchedule.php
│   │   ├── AgentTrigger.php
│   │   ├── AgentExecutionLog.php
│   │   ├── AgentAction.php
│   │   ├── ScheduleExecution.php
│   │   ├── ToolChain.php
│   │   ├── ToolChainStep.php
│   │   └── Tool.php
│   └── Services/
│       ├── AgentMemoryService.php
│       ├── AgentSchedulerService.php
│       ├── AgentExecutionService.php
│       ├── ToolCompositionService.php
│       └── ToolExecutorService.php
├── database/
│   └── migrations/
│       ├── create_agents_table.php
│       ├── create_agent_memories_table.php
│       ├── create_agent_schedules_table.php
│       ├── create_agent_triggers_table.php
│       ├── create_schedule_executions_table.php
│       ├── create_tool_chains_table.php
│       └── create_tool_chain_steps_table.php
├── routes/
│   ├── web.php ⭐ UPDATED
│   ├── api.php
│   └── project-chats.php
├── resources/
│   └── js/
│       ├── pages/
│       │   └── Projects/
│       │       ├── AgentIntelligence.tsx ⭐ UPDATED
│       │       ├── AgentTools.tsx
│       │       ├── Create.tsx
│       │       ├── Edit.tsx
│       │       ├── Index.tsx
│       │       └── Show.tsx
│       ├── components/
│       │   └── AgentIntelligence/
│       │       ├── MemoryDashboard.tsx
│       │       ├── WorkflowBuilder.tsx
│       │       ├── ScheduleManager.tsx
│       │       ├── ExecutionMonitor.tsx
│       │       └── WorkflowExecutionDetails.tsx
│       └── utils/
│           └── agentIntelligence.ts
└── docs/ (Documentation)
    ├── INTELLIGENT_AGENT_QUICK_START_GUIDE.md ⭐ NEW
    ├── INTELLIGENT_AGENT_FINAL_INTEGRATION_STEPS.md ⭐ NEW
    ├── INTELLIGENT_AGENT_TESTING_VERIFICATION.md ⭐ NEW
    ├── SESSION_COMPLETION_SUMMARY.md ⭐ NEW
    ├── INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md
    ├── INTELLIGENT_AGENT_FRONTEND_GUIDE.md
    ├── INTELLIGENT_AGENT_IMPLEMENTATION_COMPLETE.md
    ├── INTELLIGENT_AGENT_INTEGRATION_CHECKLIST.md
    ├── INTELLIGENT_AGENT_QUICK_REFERENCE.md
    ├── INTELLIGENT_AGENT_SYSTEM_OVERVIEW.md
    └── INTELLIGENT_AGENT_DELIVERY_SUMMARY.md

⭐ = Created/Updated in this session
```

---

## 🔗 Component Dependencies

### Frontend Component Tree

```
AgentIntelligence.tsx (Main Page)
│
├── MemoryDashboard.tsx
│   ├── Uses: agentIntelligence.ts (rankMemoriesByRelevance, exportToMarkdown)
│   └── API: GET /api/projects/{id}/agents/{id}/memory
│
├── WorkflowBuilder.tsx
│   ├── Uses: agentIntelligence.ts (validateJsonParameters, generateExecutionPlan)
│   ├── API: GET /api/projects/{id}/agents/{id}/workflows
│   └── API: POST /api/projects/{id}/agents/{id}/workflows
│
├── ScheduleManager.tsx
│   ├── Uses: agentIntelligence.ts (parseCronExpression, isValidCronExpression)
│   ├── API: GET /api/projects/{id}/agents/{id}/schedules
│   └── API: POST /api/projects/{id}/agents/{id}/schedules
│
└── ExecutionMonitor.tsx
    ├── Uses: agentIntelligence.ts (formatDuration, getStatusColor)
    ├── API: GET /api/projects/{id}/agents/{id}/executions
    └── Sub-Component: WorkflowExecutionDetails.tsx
        └── Shows detailed execution information
```

### Backend Controller Chain

```
HTTP Request
│
├── Web Routes (routes/web.php)
│   └── GET /projects/{project}/agents/{agent}/intelligence
│       └── AgentIntelligenceController::show()
│
└── API Routes (routes/project-chats.php)
    ├── GET /api/projects/{project}/agents/{agent}/memory
    │   └── AgentMemoryController::index()
    │       └── AgentMemoryService
    │
    ├── GET /api/projects/{project}/agents/{agent}/workflows
    │   └── ToolChainController::index()
    │       └── ToolCompositionService
    │
    └── GET /api/projects/{project}/agents/{agent}/schedules
        └── AgentScheduleController::index()
            └── AgentSchedulerService
```

### Data Flow

```
User Action (Frontend)
        │
        ↓
React Component State Update
        │
        ↓
Axios HTTP Request
        │
        ├─────────────────────────────────┐
        │                                 │
        ↓                                 ↓
    Web Route                         API Route
    (Inertia)                         (JSON)
        │                                 │
        ↓                                 ↓
    Controller                         Controller
        │                                 │
        ├─────────────────────────────────┤
        │
        ↓
    Service Layer
        │
        ├─ Authorization Check
        ├─ Business Logic
        └─ Data Transformation
        │
        ↓
    Database Query / Job Queue
        │
        ├─ Query Execution
        ├─ Model Relationships
        └─ Data Persistence
        │
        ↓
    Response Generation
        │
        ├─ Inertia Response
        └─ JSON Response
        │
        ↓
    Frontend Update
        │
        └─ State → UI Render
```

---

## 🔄 System Integration Points

### Memory System Integration

```
Agent Model
    ↓
    └── hasMany(AgentMemory)
        ↓
        ├── Frontend: MemoryDashboard.tsx
        ├── Backend: AgentMemoryController
        ├── Service: AgentMemoryService
        ├── API: /agents/{id}/memory
        ├── Storage: agent_memories table
        └── Features:
            ├── Create/Read/Update/Delete
            ├── Search by content
            ├── Filter by tags
            ├── Export to markdown
            └── Relevance scoring
```

### Workflow System Integration

```
Agent Model
    ↓
    └── hasMany(ToolChain)
        ↓
        ├── ToolChain
        │   └── hasMany(ToolChainStep)
        │       └── Tool
        │
        ├── Frontend: WorkflowBuilder.tsx
        ├── Backend: ToolChainController
        ├── Service: ToolCompositionService
        ├── API: /agents/{id}/workflows
        ├── Storage: tool_chains, tool_chain_steps tables
        └── Features:
            ├── Compose tools
            ├── 3 execution modes (Sequential/Parallel/Conditional)
            ├── Validate workflows
            ├── Generate execution plans
            ├── Execute via queue
            └── Track results
```

### Schedule System Integration

```
Agent Model
    ↓
    ├── hasMany(AgentSchedule)
    │   ├── trigger_type: cron|webhook|manual
    │   ├── enabled: boolean
    │   └── next_run_at: timestamp
    │
    ├── hasMany(ScheduleExecution)
    │   ├── status: pending|running|completed|failed
    │   ├── started_at: timestamp
    │   ├── ended_at: timestamp
    │   └── result: json
    │
    ├── Frontend: ScheduleManager.tsx
    ├── Backend: AgentScheduleController
    ├── Service: AgentSchedulerService
    ├── API: /agents/{id}/schedules
    ├── Storage: agent_schedules, schedule_executions tables
    └── Features:
        ├── Create cron schedules
        ├── Create webhook triggers
        ├── Manual execution
        ├── Enable/disable without deletion
        ├── Calculate next run time
        └── Track execution history
```

### Execution Monitoring Integration

```
Agent Model
    ↓
    ├── hasMany(AgentExecutionLog)
    │   ├── status: pending|running|completed|failed
    │   ├── started_at
    │   ├── ended_at
    │   ├── result: json
    │   └── error: nullable
    │
    ├── hasMany(ScheduleExecution)
    │   └── [Same structure as above]
    │
    ├── Frontend: ExecutionMonitor.tsx
    │   └── Sub-component: WorkflowExecutionDetails.tsx
    ├── Backend: Controllers expose executions
    ├── API: /agents/{id}/executions
    └── Features:
        ├── Real-time status tracking
        ├── Filter by status
        ├── View detailed logs
        ├── Performance metrics
        └── Error debugging
```

---

## 🗄️ Database Schema Relationships

```
agents (Core)
    ├── agent_memories (1:Many)
    │   ├── title
    │   ├── content
    │   ├── relevance_score
    │   ├── tags
    │   └── usage_count
    │
    ├── agent_schedules (1:Many)
    │   ├── name
    │   ├── workflow_id → tool_chains
    │   ├── trigger_type (cron|webhook|manual)
    │   ├── cron_expression
    │   ├── webhook_token
    │   ├── enabled
    │   └── next_run_at
    │
    ├── agent_triggers (1:Many)
    │   ├── name
    │   ├── action_type
    │   └── configuration
    │
    ├── agent_actions (1:Many)
    │   ├── name
    │   ├── tool_id
    │   └── configuration
    │
    ├── agent_execution_logs (1:Many)
    │   ├── status
    │   ├── started_at
    │   ├── ended_at
    │   ├── result
    │   └── error
    │
    └── tool_chains (1:Many)
        ├── name
        ├── description
        ├── execution_mode (sequential|parallel|conditional)
        └── tool_chain_steps (1:Many)
            ├── order
            ├── tool_id → tools
            └── parameters (json)

schedule_executions (Cross-cutting)
    ├── agent_schedule_id → agent_schedules
    ├── status
    ├── started_at
    ├── ended_at
    ├── result
    └── error

tools (Global)
    ├── name
    ├── category
    ├── description
    ├── parameters (json)
    └── output_schema (json)
```

---

## 📊 API Endpoint Map

### Web Routes (Inertia Pages)
```
GET /projects/{project}/agents/{agent}/intelligence
    └── AgentIntelligenceController::show()
        └── Returns: AgentIntelligence.tsx props

GET /projects/{project}/agents/{agent}/intelligence/summary
    └── AgentIntelligenceController::summary()
        └── Returns: JSON stats

GET /projects/{project}/agents/{agent}/intelligence/export-memories
    └── AgentIntelligenceController::exportMemories()
        └── Returns: Markdown file download
```

### API Routes (REST)
```
Memory Endpoints:
GET    /api/projects/{project}/agents/{agent}/memory
POST   /api/projects/{project}/agents/{agent}/memory
POST   /api/projects/{project}/agents/{agent}/memory/search
GET    /api/projects/{project}/agents/{agent}/memory/relevant
DELETE /api/projects/{project}/agents/{agent}/memory/{id}
POST   /api/projects/{project}/agents/{agent}/memory/clear
GET    /api/projects/{project}/agents/{agent}/memory/export

Workflow Endpoints:
GET    /api/projects/{project}/agents/{agent}/workflows
POST   /api/projects/{project}/agents/{agent}/workflows
GET    /api/projects/{project}/agents/{agent}/workflows/{id}
PUT    /api/projects/{project}/agents/{agent}/workflows/{id}
DELETE /api/projects/{project}/agents/{agent}/workflows/{id}
GET    /api/projects/{project}/agents/{agent}/workflows/{id}/validate
GET    /api/projects/{project}/agents/{agent}/workflows/{id}/plan
POST   /api/projects/{project}/agents/{agent}/workflows/{id}/execute

Schedule Endpoints:
GET    /api/projects/{project}/agents/{agent}/schedules
POST   /api/projects/{project}/agents/{agent}/schedules
GET    /api/projects/{project}/agents/{agent}/schedules/{id}
PUT    /api/projects/{project}/agents/{agent}/schedules/{id}
DELETE /api/projects/{project}/agents/{agent}/schedules/{id}
POST   /api/projects/{project}/agents/{agent}/schedules/{id}/execute
GET    /api/projects/{project}/agents/{agent}/schedules/{id}/history
GET    /api/projects/{project}/agents/{agent}/schedules/{id}/stats
POST   /api/projects/{project}/agents/{agent}/schedules/{id}/toggle

Tool Endpoints:
GET    /api/projects/{project}/tools
GET    /api/projects/{project}/tools/{name}
POST   /api/projects/{project}/tools/{name}/execute
POST   /api/projects/{project}/tools/{name}/test
GET    /api/projects/{project}/tools/{name}/guidelines
```

---

## 🎯 Key Files & Their Purpose

### Controllers (Business Logic)
| File | Purpose | Methods |
|------|---------|---------|
| AgentIntelligenceController | Dashboard & stats | show, summary, exportMemories |
| AgentMemoryController | Memory CRUD | index, store, search, destroy |
| AgentScheduleController | Schedule CRUD | index, store, execute, history |
| ToolChainController | Workflow CRUD | index, store, execute, validate |
| AgentToolController | Tool management | index, show, execute, test |

### Services (Business Logic)
| File | Purpose | Methods |
|------|---------|---------|
| AgentMemoryService | Memory operations | saveMemory, getRelevant, rankByRelevance |
| AgentSchedulerService | Scheduling logic | createSchedule, calculateNextRun, execute |
| AgentExecutionService | Execution handling | executeWorkflow, trackExecution, handleFailure |
| ToolCompositionService | Workflow composition | composeTools, validateWorkflow, generatePlan |

### Components (UI/UX)
| File | Purpose | Features |
|------|---------|----------|
| MemoryDashboard | Memory browsing | List, search, filter, export |
| WorkflowBuilder | Workflow creation | Compose, validate, test, execute |
| ScheduleManager | Schedule management | Create, enable/disable, preview |
| ExecutionMonitor | Execution tracking | Filter, view details, track history |

### Utilities (Helper Functions)
| Function | Purpose |
|----------|---------|
| parseCronExpression | Convert cron to human readable |
| isValidCronExpression | Validate cron syntax |
| formatDuration | Format milliseconds to time string |
| calculateRelevanceDecay | Age-based relevance decay |
| generateExecutionPlan | Create workflow plan |
| validateJsonParameters | Validate JSON against schema |
| rankMemoriesByRelevance | Sort by relevance |
| exportToMarkdown | Convert data to markdown |

---

## 🔄 Call Flow Examples

### Example 1: Create Memory
```
Frontend (MemoryDashboard.tsx)
    ↓ axios.post('/api/.../memory', data)
    ↓
Route (/api/projects/{id}/agents/{id}/memory) [project-chats.php]
    ↓
Controller (AgentMemoryController::store)
    ↓ Authorization check
    ↓
Service (AgentMemoryService::saveMemory)
    ↓ Business logic
    ↓
Model (AgentMemory::create)
    ↓
Database (agent_memories table)
    ↓
Response (201 Created, Memory object)
    ↓
Frontend (State update, Toast notification)
```

### Example 2: Execute Workflow
```
Frontend (WorkflowBuilder.tsx)
    ↓ axios.post('/api/.../workflows/{id}/execute', data)
    ↓
Route (/api/projects/{id}/agents/{id}/workflows/{id}/execute)
    ↓
Controller (ToolChainController::execute)
    ↓ Authorization check
    ↓
Service (ToolCompositionService::validateWorkflow)
    ↓
Dispatch Job (ExecuteWorkflowJob::dispatch)
    ↓
Queue Database (jobs table)
    ↓
Response (202 Accepted, Job ID)
    ↓
[Background] Queue Listener Processes Job
    ↓
Service (ToolExecutorService::execute)
    ↓
Result Storage (agent_execution_logs)
    ↓
Frontend Polls (ExecutionMonitor shows update)
```

### Example 3: Process Cron Schedule
```
Cron Job (*/1 * * * *)
    ↓ `php artisan schedule:run`
    ↓
Laravel Scheduler
    ↓
CheckSchedulesCommand
    ↓
Service (AgentSchedulerService::processDueSchedules)
    ↓
Find all due schedules
    ↓
For each due schedule:
    ├─ Dispatch ExecuteWorkflowJob
    ├─ Update next_run_at
    ├─ Create ScheduleExecution record
    └─ Queue jobs table
    ↓
[Background] Queue Listener Processes Jobs
    ↓
Results stored in agent_execution_logs
    ↓
Dashboard updates via polling
```

---

## 📦 Dependencies & Versions

### Backend Dependencies
```
laravel/framework ^12.0
inertiajs/inertia-laravel ^2.0
guzzlehttp/guzzle ^7.0
firebase/php-jwt ^6.0
```

### Frontend Dependencies
```
react ^19.0.0
react-dom ^19.0.0
@inertiajs/react ^2.0.0
typescript ^5.7.2
tailwindcss ^4.0.0
@radix-ui/react-* (various)
@shadcn/ui ^0.0.4
lucide-react ^0.475.0
react-hot-toast ^2.5.2
axios ^1.13.2
zustand ^5.0.8
```

---

## ✅ Verification Checklist

### Files Created/Updated This Session
- [x] AgentIntelligenceController.php (NEW)
- [x] routes/web.php (UPDATED)
- [x] AgentIntelligence.tsx (UPDATED)
- [x] INTELLIGENT_AGENT_QUICK_START_GUIDE.md (NEW)
- [x] INTELLIGENT_AGENT_FINAL_INTEGRATION_STEPS.md (NEW)
- [x] INTELLIGENT_AGENT_TESTING_VERIFICATION.md (NEW)
- [x] SESSION_COMPLETION_SUMMARY.md (NEW)
- [x] This file (NEW)

### All System Components
- [x] Backend Controllers (6)
- [x] Backend Services (5+)
- [x] Backend Models (9)
- [x] Frontend Page (1)
- [x] Frontend Components (5)
- [x] Frontend Utilities (15+)
- [x] Database Migrations (7+)
- [x] API Routes (25+)
- [x] Web Routes (3)
- [x] Documentation (11 files)

---

## 🚀 Quick Reference

### To Start Development
```bash
# Terminal 1
php artisan serve

# Terminal 2
npm run dev

# Terminal 3
php artisan queue:listen
```

### To Access Dashboard
```
http://localhost:8000/projects/{project-id}/agents/{agent-id}/intelligence
```

### Key Documentation
```
Start Here:
  → INTELLIGENT_AGENT_QUICK_START_GUIDE.md

Then Follow:
  → INTELLIGENT_AGENT_FINAL_INTEGRATION_STEPS.md

Testing:
  → INTELLIGENT_AGENT_TESTING_VERIFICATION.md

Reference:
  → This file (File Structure)
  → INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md (Technical)
  → INTELLIGENT_AGENT_FRONTEND_GUIDE.md (Frontend)
```

---

**Everything is documented, organized, and ready to use. Happy coding! 🚀**
