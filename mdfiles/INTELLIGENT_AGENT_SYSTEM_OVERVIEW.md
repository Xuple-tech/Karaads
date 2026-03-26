# Intelligent Agent System - Visual Overview

## 🎯 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENT AGENT HUB                              │
│                        (React Component)                               │
└─────────────────────────────────────────┬───────────────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
            ┌───────▼─────────┐  ┌───────▼────────┐  ┌─────────▼────────┐
            │  Memory Tab     │  │ Workflow Tab   │  │ Schedule Tab     │
            ├─────────────────┤  ├────────────────┤  ├─────────────────┤
            │ MemoryDashboard │  │ WorkflowBuilder│  │ ScheduleManager │
            │                 │  │                │  │                 │
            │ • Browse        │  │ • Create       │  │ • Create        │
            │ • Search        │  │ • Validate     │  │ • Cron/Webhook  │
            │ • Filter        │  │ • Test         │  │ • Enable/Disable│
            │ • Stats         │  │ • Save         │  │ • Execute       │
            │ • Export        │  │ • Manage       │  │ • View Next Run │
            └────────┬────────┘  └───────┬────────┘  └────────┬────────┘
                     │                   │                   │
        ┌────────────▼───────────────────▼───────────────────▼────────┐
        │              Frontend API Layer (Axios)                      │
        │                                                              │
        │  GET/POST/PUT/DELETE                                        │
        │  /api/projects/{id}/agents/{id}/memories/*                  │
        │  /api/projects/{id}/agents/{id}/workflows/*                 │
        │  /api/projects/{id}/agents/{id}/schedules/*                 │
        └────────────────────────┬─────────────────────────────────────┘
                                 │
        ┌────────────────────────▼─────────────────────────────────────┐
        │        Backend API Controllers (Laravel)                      │
        ├──────────────────────────────────────────────────────────────┤
        │ • AgentMemoryController       • ToolChainController          │
        │ • AgentScheduleController     • AgentIntelligenceController  │
        └────────────────────┬──────────────────┬──────────────────────┘
                             │                  │
        ┌────────────────────▼──┐  ┌───────────▼──────────────────┐
        │   Service Layer       │  │  Job Processing             │
        ├───────────────────────┤  ├─────────────────────────────┤
        │ AgentMemoryService    │  │ ExecuteScheduledAgentJob    │
        │ ToolCompositionServ  │  │ (Queueable Job)             │
        │ AgentSchedulerServ   │  │ • 5-min timeout             │
        │                      │  │ • Execution tracking        │
        └──────────┬───────────┘  └────────┬────────────────────┘
                   │                       │
        ┌──────────▼───────────────────────▼─────────┐
        │       Model Layer (Eloquent)               │
        ├──────────────────────────────────────────┤
        │ • AgentMemory                            │
        │ • ToolChain                              │
        │ • ToolChainStep                          │
        │ • AgentSchedule                          │
        │ • ScheduleExecution                      │
        └──────────┬───────────────────────────────┘
                   │
        ┌──────────▼───────────────────────────────┐
        │     Database Tables                      │
        ├──────────────────────────────────────────┤
        │ • agent_memories                         │
        │ • tool_chains                            │
        │ • tool_chain_steps                       │
        │ • agent_schedules                        │
        │ • schedule_executions                    │
        └──────────────────────────────────────────┘
```

## 📊 Data Flow Diagrams

### 1. Memory System Flow

```
┌──────────────┐
│  Agent Chat  │
└──────┬───────┘
       │ User sends message
       ▼
┌──────────────────────────┐
│ AgentMemoryService       │
├──────────────────────────┤
│ 1. Store new memory      │
│ 2. Extract keywords      │
│ 3. Calculate relevance   │
│ 4. Tag with context      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ agent_memories table     │
├──────────────────────────┤
│ id, context, score, tags │
└──────┬───────────────────┘
       │
       │ On next message
       ▼
┌──────────────────────────┐
│ Search Relevant Memories │
├──────────────────────────┤
│ 1. Query by relevance    │
│ 2. Rank by reuse count   │
│ 3. Sort by score         │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Inject into System Prompt│
├──────────────────────────┤
│ "Remember these contexts"│
│ [top 5 memories ranked]  │
└──────────────────────────┘
```

### 2. Workflow Execution Flow

```
┌──────────────────────┐
│  WorkflowBuilder UI  │
└──────────┬───────────┘
           │ Create workflow
           ▼
    ┌──────────────────────┐
    │ Define Steps         │
    ├──────────────────────┤
    │ Step 1: web_search   │
    │ Step 2: web_fetch    │
    │ Step 3: summarize    │
    └──────┬───────────────┘
           │ Validate
           ▼
    ┌──────────────────────┐
    │ Save to tool_chains  │
    │ Save to steps table   │
    └──────┬───────────────┘
           │ Execute
           ▼
    ┌──────────────────────────────────┐
    │ ToolCompositionService           │
    ├──────────────────────────────────┤
    │ Execution Mode: Sequential       │
    │ Step 1 → Step 2 → Step 3         │
    │ Pass results forward ({{ }})     │
    └──────┬───────────────────────────┘
           │
    ┌──────┴────────────┬─────────┬──────────┐
    ▼                   ▼         ▼          ▼
 Tool1              Tool2       Tool3      Record
Success            Success     Success      Result
   │                │           │            │
   └────────┬───────┴───────────┘            │
            │ Pass results                   │
            ▼                                │
    ┌──────────────────────┐                │
    │ Final Output         │◄───────────────┘
    ├──────────────────────┤
    │ {                    │
    │   tool1: {...},      │
    │   tool2: {...},      │
    │   tool3: {...}       │
    │ }                    │
    └──────────────────────┘
```

### 3. Schedule Execution Flow

```
┌──────────────────────┐
│ ScheduleManager UI   │
└──────────┬───────────┘
           │ Create schedule
           ▼
    ┌──────────────────────────┐
    │ Schedule Config          │
    ├──────────────────────────┤
    │ Name: "Daily Summary"    │
    │ Trigger: cron            │
    │ Expression: "0 8 * * *"  │
    │ Workflow: workflow_id    │
    └──────┬───────────────────┘
           │ Save to agent_schedules
           ▼
    ┌──────────────────────────┐
    │ Laravel Scheduler        │
    ├──────────────────────────┤
    │ Runs: * * * * *          │
    │ Every minute check       │
    └──────┬───────────────────┘
           │ Check if due
           ▼
    ┌──────────────────────────┐
    │ Due? Check cron expr     │
    │ vs current time          │
    └──────┬───────────────────┘
           │ YES - time to run
           ▼
    ┌──────────────────────────┐
    │ Queue Job                │
    ├──────────────────────────┤
    │ ExecuteScheduledAgent    │
    │ Job($schedule_id)        │
    └──────┬───────────────────┘
           │ Push to queue (Redis/DB)
           ▼
    ┌──────────────────────────┐
    │ Queue Worker             │
    ├──────────────────────────┤
    │ process jobs from queue  │
    │ (php artisan queue:work) │
    └──────┬───────────────────┘
           │ Pick up job
           ▼
    ┌──────────────────────────┐
    │ Execute Job              │
    ├──────────────────────────┤
    │ 1. Load schedule         │
    │ 2. Load tool chain       │
    │ 3. Execute composition   │
    │ 4. Catch timeout (5min)  │
    │ 5. Record execution      │
    └──────┬───────────────────┘
           │
    ┌──────┴────────┬──────────┐
    ▼               ▼          ▼
 Success       Timeout      Error
    │              │          │
    └──────────────┴──────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Store in schedule_executions
    ├──────────────────────────┤
    │ status, start_time,      │
    │ end_time, duration,      │
    │ result/error_message     │
    └──────────────────────────┘
```

## 🔄 Integration Points

```
┌────────────────────────────────────────────────────────┐
│                  Agent System                          │
│                                                        │
│  ┌──────────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ Agent Model  │  │ Chat Loop │  │ Tool System  │   │
│  └──────┬───────┘  └─────┬─────┘  └──────┬───────┘   │
│         │                │              │             │
│         ▼                ▼              ▼             │
│  ┌────────────────────────────────────────────────┐  │
│  │  Intelligent Agent Workflows                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ Memory   │  │ Workflows│  │Schedules │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘    │  │
│  └────────────────────────────────────────────────┘  │
│         ▲                ▲              ▲             │
└─────────┼────────────────┼──────────────┼─────────────┘
          │                │              │
    Existing          Existing          New
    System            System            System
```

## 🎭 Component Interaction Map

```
                    ┌─────────────────────────┐
                    │  AgentIntelligence.tsx  │
                    │  (Main Container)       │
                    └───┬────────┬────────┬───┘
                        │        │        │
        ┌───────────────┼────────┼────────┼─────────────┐
        ▼               ▼        ▼        ▼             ▼
┌──────────────┐ ┌─────────┐ ┌──────┐ ┌───────────┐ ┌─────┐
│Memory        │ │Workflow │ │Sched │ │Execution  │ │Utils│
│Dashboard    │ │Builder  │ │uleMgr│ │Monitor    │ │Tools│
├──────────────┤ ├─────────┤ ├──────┤ ├───────────┤ ├─────┤
│ • Search    │ │ • Create│ │• CRD │ │ • Status  │ │Parse│
│ • Filter    │ │ • Validate       │ │ • Details │ │Cron │
│ • Delete    │ │ • Execute       │ │ • Filters │ │Util │
│ • Export    │ │ • Manage        │ │ • Refresh │ │Fmt  │
│ • Stats     │ │ • Steps         │ │ • Modal   │ │Rank │
└──────┬───────┘ └────┬────────────┘ └────┬──────┘ └─────┘
       │             │                   │
       │    ┌────────┴───────┐          │
       │    ▼                ▼          │
       │  WorkflowExecution  │
       │  Details            │
       │  (Modal)            │
       │
       └────────┬────────────┬─────────────────┐
                │            │                 │
                ▼            ▼                 ▼
            Axios API Calls
            
            /memories/*
            /workflows/*
            /schedules/*
```

## 📱 UI Flow

```
User navigates to /projects/1/agents/1/intelligence
                    │
                    ▼
┌─────────────────────────────────────────────┐
│        AgentIntelligence Page               │
├─────────────────────────────────────────────┤
│  Header: "Agent Name - Intelligence Hub"    │
│                                             │
│  ┌─┬─┬─┬─┐     Tab Navigation              │
│  │M│W│S│M│     [Memory][Workflows]         │
│  │e│o│c│o│     [Schedules][Monitor]       │
│  │m│r│h│n│                                 │
│  │ │k│ │                                   │
│  │ │f│ │     ┌─────────────────────────┐  │
│  │ │l│ │     │  Active Tab Content     │  │
│  │ │ │ │     │  (Dynamically rendered) │  │
│  │ │ │ │     │                         │  │
│  │ │ │ │     │  [Component A]          │  │
│  │ │ │ │     │  [Component B]          │  │
│  │ │ │ │     │  [Component C]          │  │
│  └─┴─┴─┴─┘     └─────────────────────────┘  │
│                                             │
│  Footer: Info Box & Tips                    │
└─────────────────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (React)                    │
│         Secured by browser CORS             │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────────┐
│  Middleware Layer                           │
│  ├─ Auth (verify user logged in)           │
│  ├─ Verify (email verified)                │
│  └─ Authorize (owns agent)                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  API Controllers                            │
│  ├─ Validate input                         │
│  ├─ Check permissions                      │
│  └─ Sanitize output                        │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Services/Models                            │
│  ├─ Per-agent isolation                    │
│  ├─ Per-project isolation                  │
│  └─ Query scoping                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Database                                   │
│  ├─ agent_id constraint                    │
│  ├─ project_id constraint                  │
│  └─ Foreign key enforcement                │
└─────────────────────────────────────────────┘
```

## 🎯 State Management

```
┌──────────────────────────────────────────────┐
│  React Component State (useState)            │
│                                              │
│  MemoryDashboard                            │
│  ├─ memories: Memory[]                      │
│  ├─ searchQuery: string                     │
│  ├─ selectedTag: string | null              │
│  └─ loading: boolean                        │
│                                              │
│  WorkflowBuilder                            │
│  ├─ name: string                            │
│  ├─ mode: 'sequential'|'parallel'|...      │
│  ├─ steps: WorkflowStep[]                   │
│  └─ validationErrors: string[]              │
│                                              │
│  ScheduleManager                            │
│  ├─ schedules: Schedule[]                   │
│  ├─ showForm: boolean                       │
│  └─ editingId: string | null                │
│                                              │
│  ExecutionMonitor                           │
│  ├─ executions: Execution[]                 │
│  ├─ filter: status type                     │
│  └─ autoRefresh: boolean                    │
└──────────────────────────────────────────────┘
```

## ⚡ Performance Optimization

```
Frontend                          Backend
┌──────────────────┐         ┌──────────────────┐
│ Lazy Loading     │         │ Database Indexes │
├──────────────────┤         ├──────────────────┤
│ • Code splitting │         │ • agent_id       │
│ • Components     │         │ • project_id     │
│ • Routes         │         │ • created_at     │
└──────────────────┘         │ • status         │
                             └──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ Caching          │         │ Query Opts       │
├──────────────────┤         ├──────────────────┤
│ • API responses  │         │ • Eager loading  │
│ • Component data │         │ • Select fields  │
│ • Memoization    │         │ • Limit results  │
└──────────────────┘         └──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ Auto-refresh     │         │ Async Jobs       │
├──────────────────┤         ├──────────────────┤
│ • Toggleable     │         │ • Queue based    │
│ • Configurable   │         │ • Background     │
│ • Smart polling  │         │ • Non-blocking   │
└──────────────────┘         └──────────────────┘
```

## 📊 Data Model Relationships

```
Agent
├─ hasMany Memories (AgentMemory)
│  ├─ belongs to Project
│  ├─ many tags
│  └─ relevance score
│
├─ hasMany ToolChains (ToolChain)
│  ├─ hasMany Steps (ToolChainStep)
│  │  ├─ tool_name
│  │  ├─ parameters
│  │  └─ execution routing
│  └─ execution_mode
│
└─ hasMany Schedules (AgentSchedule)
   ├─ belongs to ToolChain
   ├─ has many Executions (ScheduleExecution)
   │  ├─ status
   │  ├─ duration
   │  ├─ result
   │  └─ error_message
   ├─ cron_expression
   ├─ webhook_token
   └─ trigger_type
```

## 🚀 Deployment Architecture

```
Development
├─ npm run dev
├─ php artisan serve
├─ php artisan queue:listen
└─ php artisan schedule:run

Production
├─ npm run build (static assets)
├─ php artisan config:cache
├─ supervisor (queue:work)
└─ cron job (schedule:run)

Monitoring
├─ Laravel logs
├─ Queue monitor
├─ Execution history
└─ Performance metrics
```

---

**This visual overview helps understand:**
- ✅ How components communicate
- ✅ Data flow through the system
- ✅ Integration with existing systems
- ✅ Security boundaries
- ✅ Performance considerations
- ✅ Deployment architecture
