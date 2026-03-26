# Intelligent Agent System - Testing & Verification Checklist

## Phase 1: Pre-Integration Verification

### Database & Migrations
- [ ] All migrations completed: `php artisan migrate:status`
- [ ] No pending migrations exist
- [ ] Required tables exist:
  - [ ] `agents`
  - [ ] `agent_memories`
  - [ ] `agent_schedules`
  - [ ] `agent_triggers`
  - [ ] `schedule_executions`
  - [ ] `tool_chains`
  - [ ] `tool_chain_steps`

### Services & Models
- [ ] Models load in tinker: `php artisan tinker`
  - [ ] `\App\Models\Agent::count()`
  - [ ] `\App\Models\AgentMemory::count()`
  - [ ] `\App\Models\AgentSchedule::count()`
  - [ ] `\App\Models\ToolChain::count()`
- [ ] Services available:
  - [ ] `app(\App\Services\AgentMemoryService::class)`
  - [ ] `app(\App\Services\AgentSchedulerService::class)`
  - [ ] `app(\App\Services\AgentExecutionService::class)`

### Controllers
- [ ] Controller class exists: `app/Http/Controllers/AgentIntelligenceController.php`
- [ ] All methods present:
  - [ ] `show()`
  - [ ] `exportMemories()`
  - [ ] `summary()`

### Routes
- [ ] Routes registered:
  - [ ] `php artisan route:list | grep intelligence`
  - [ ] Expected routes appear in output

---

## Phase 2: Backend API Testing

### Memory System Tests

#### Test 1: Create Memory
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/memory" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Memory",
    "content": "Test content",
    "tags": ["test", "demo"],
    "relevance_score": 0.95
  }'
```
- [ ] Returns 201 status
- [ ] Response includes memory ID
- [ ] Database record created

#### Test 2: List Memories
```bash
curl "http://localhost:8000/api/projects/1/agents/1/memory" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status
- [ ] Returns paginated results
- [ ] Includes metadata (total, per_page, current_page)

#### Test 3: Search Memories
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/memory/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "test"}'
```
- [ ] Returns matching memories
- [ ] Search works by title and content

#### Test 4: Get Relevant Memories
```bash
curl "http://localhost:8000/api/projects/1/agents/1/memory/relevant?topic=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns memories sorted by relevance
- [ ] Respects relevance_score ordering

#### Test 5: Clear Memories
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/memory/clear" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status
- [ ] All memories deleted for agent

#### Test 6: Export Memories
```bash
curl "http://localhost:8000/api/projects/1/agents/1/memory/export" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns markdown formatted file
- [ ] Content properly formatted

### Workflow System Tests

#### Test 7: List Workflows
```bash
curl "http://localhost:8000/api/projects/1/agents/1/workflows" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status
- [ ] Shows all workflows for agent
- [ ] Includes execution mode information

#### Test 8: Create Workflow
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/workflows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Workflow",
    "description": "Test workflow",
    "execution_mode": "sequential",
    "steps": [
      {
        "tool_id": 1,
        "order": 1,
        "parameters": {"key": "value"}
      }
    ]
  }'
```
- [ ] Returns 201 status
- [ ] Workflow created in database
- [ ] Steps created correctly

#### Test 9: Validate Workflow
```bash
curl "http://localhost:8000/api/projects/1/agents/1/workflows/1/validate" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns validation status
- [ ] Identifies missing parameters
- [ ] Checks tool availability

#### Test 10: Get Workflow Plan
```bash
curl "http://localhost:8000/api/projects/1/agents/1/workflows/1/plan" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns execution plan
- [ ] Shows step order
- [ ] Includes parameter mapping

#### Test 11: Execute Workflow
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/workflows/1/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input_data": {}}'
```
- [ ] Returns 202 status (job queued)
- [ ] Job created in jobs table
- [ ] Returns job ID

### Schedule System Tests

#### Test 12: List Schedules
```bash
curl "http://localhost:8000/api/projects/1/agents/1/schedules" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 200 status
- [ ] Shows all schedules
- [ ] Includes trigger information

#### Test 13: Create Cron Schedule
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/schedules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Daily Workflow",
    "workflow_id": 1,
    "trigger_type": "cron",
    "cron_expression": "0 9 * * *",
    "enabled": true
  }'
```
- [ ] Returns 201 status
- [ ] Schedule created
- [ ] Next run time calculated

#### Test 14: Create Webhook Schedule
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/schedules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Webhook Trigger",
    "workflow_id": 1,
    "trigger_type": "webhook",
    "enabled": true
  }'
```
- [ ] Returns webhook URL in response
- [ ] Token generated for webhook
- [ ] Can be tested with external service

#### Test 15: Create Manual Schedule
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/schedules" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Manual Execution",
    "workflow_id": 1,
    "trigger_type": "manual",
    "enabled": true
  }'
```
- [ ] Returns 201 status
- [ ] Schedule created

#### Test 16: Execute Schedule Immediately
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/schedules/1/execute" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns 202 status
- [ ] Job queued immediately
- [ ] Returns execution log ID

#### Test 17: Get Schedule History
```bash
curl "http://localhost:8000/api/projects/1/agents/1/schedules/1/history" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns execution history
- [ ] Shows status, duration, results
- [ ] Paginated if many executions

#### Test 18: Get Schedule Stats
```bash
curl "http://localhost:8000/api/projects/1/agents/1/schedules/1/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns statistics object
- [ ] Shows success rate
- [ ] Includes execution count

#### Test 19: Toggle Schedule
```bash
curl -X POST "http://localhost:8000/api/projects/1/agents/1/schedules/1/toggle" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Returns updated schedule
- [ ] `enabled` flag toggled

---

## Phase 3: Frontend Testing

### Navigation & Loading
- [ ] Dashboard page loads: `http://localhost:8000/projects/1/agents/1/intelligence`
- [ ] No console errors
- [ ] All tabs visible: Memory, Workflows, Schedules, Monitor
- [ ] Agent status badge displays correctly

### Memory Dashboard Tab
- [ ] Tab switches to Memory dashboard
- [ ] Statistics display:
  - [ ] Total memories count
  - [ ] Average relevance score
  - [ ] Most used tags
  - [ ] Total reuses
- [ ] Memory list loads and displays
- [ ] Search functionality works
- [ ] Filter by tags works
- [ ] Delete individual memory works
- [ ] Clear all button works
- [ ] Export to markdown works

### Workflow Builder Tab
- [ ] Tab switches to Workflow builder
- [ ] Statistics display:
  - [ ] Total workflows
  - [ ] Breakdown by execution mode
  - [ ] Average steps per workflow
- [ ] Workflow list displays
- [ ] Can create new workflow:
  - [ ] Input name and description
  - [ ] Select execution mode
  - [ ] Add tools with parameters
  - [ ] Validate workflow
  - [ ] Save workflow
- [ ] Can edit existing workflow
- [ ] Can test workflow execution
- [ ] Parameter templates load
- [ ] JSON validation works

### Schedule Manager Tab
- [ ] Tab switches to Schedule manager
- [ ] Statistics display:
  - [ ] Total schedules
  - [ ] Active count
  - [ ] Execution stats (total, success, failed, success rate)
  - [ ] Next execution time
- [ ] Schedule list displays
- [ ] Can create schedule:
  - [ ] Cron type with presets
  - [ ] Webhook type with token display
  - [ ] Manual type
- [ ] Can enable/disable without deletion
- [ ] Can test cron expression parsing
- [ ] Can execute manually
- [ ] Shows next run time for cron

### Execution Monitor Tab
- [ ] Tab switches to Execution monitor
- [ ] Execution list displays
- [ ] Status filter works:
  - [ ] All
  - [ ] Pending
  - [ ] Running
  - [ ] Completed
  - [ ] Failed
- [ ] Auto-refresh toggle works (every 3 seconds)
- [ ] Can click execution to see details:
  - [ ] Workflow name
  - [ ] Duration
  - [ ] Start/end times
  - [ ] Results
  - [ ] Errors (if any)
- [ ] Color-coded status indicators
- [ ] Pagination works

---

## Phase 4: Queue System Testing

### Queue Setup Verification
- [ ] Queue listener running: `php artisan queue:listen`
- [ ] No errors in output
- [ ] Processes incoming jobs

### Job Processing
- [ ] Execute workflow creates job
- [ ] Job appears in `jobs` table
- [ ] Queue listener processes job
- [ ] Job completes successfully
- [ ] Execution log created with results
- [ ] Failed jobs in `failed_jobs` table (if errors)

### Monitoring
- [ ] Check failed jobs: `php artisan queue:failed`
- [ ] Monitor logs: `tail -f storage/logs/laravel.log`
- [ ] Monitor job processing in real-time

---

## Phase 5: Scheduler Testing

### Cron Setup
- [ ] Scheduler configured: `/etc/supervisor/conf.d/rheaapp.conf`
- [ ] Running: `php artisan schedule:list`
- [ ] Shows registered tasks

### Execution
- [ ] Manual trigger: `php artisan schedule:run`
- [ ] Completes without errors
- [ ] Log shows "Running scheduled command"
- [ ] Next run times update

### Cron Job Execution
- [ ] Cron job triggers at scheduled time
- [ ] `schedule_executions` table updates
- [ ] Execution logs created
- [ ] Results stored correctly

---

## Phase 6: Data Validation

### Memory Data
- [ ] Relevance score between 0-1
- [ ] Tags array proper format
- [ ] Content not empty
- [ ] Title not empty
- [ ] Usage count increments on access

### Workflow Data
- [ ] Execution mode valid (sequential, parallel, conditional)
- [ ] Steps ordered correctly
- [ ] Parameters match tool schema
- [ ] Tool IDs valid

### Schedule Data
- [ ] Cron expression valid if present
- [ ] Webhook token secure
- [ ] Enabled flag boolean
- [ ] Trigger type valid
- [ ] Next run time calculated correctly

### Execution Data
- [ ] Status valid (pending, running, completed, failed)
- [ ] Duration calculated correctly
- [ ] Results stored as JSON
- [ ] Error messages present if failed
- [ ] Start/end times recorded

---

## Phase 7: Performance Testing

### Response Times
- [ ] Dashboard loads < 1s
- [ ] List endpoints return < 2s
- [ ] Search < 2s
- [ ] Execute workflow < 1s (returns job ID)

### Database Queries
- [ ] N+1 queries eliminated with eager loading
- [ ] Pagination working (20 items per page)
- [ ] Indexes on frequently queried fields

### Memory Usage
- [ ] No memory leaks in queue listener
- [ ] Dashboard doesn't consume excessive memory
- [ ] Large workflows handled efficiently

---

## Phase 8: Error Handling

### Invalid Requests
- [ ] Invalid JSON in request body → 400 error
- [ ] Missing required fields → 422 error
- [ ] Invalid agent ID → 404 error
- [ ] Unauthorized access → 403 error

### Edge Cases
- [ ] Empty memory list handled
- [ ] Empty workflow list handled
- [ ] No next execution → null returned
- [ ] Failed jobs don't crash queue listener

### User Feedback
- [ ] Toast notifications show success/error
- [ ] Error messages are helpful
- [ ] Loading states show while processing

---

## Phase 9: Integration Testing

### End-to-End Workflow
1. [ ] Create agent
2. [ ] Create memory
3. [ ] Create workflow with tools
4. [ ] Create cron schedule
5. [ ] Execute manually
6. [ ] Monitor execution
7. [ ] View results
8. [ ] Export memories

### Multi-Agent Scenarios
- [ ] Memories isolated per agent
- [ ] Workflows isolated per agent
- [ ] Schedules isolated per agent
- [ ] Executions isolated per agent

### Permission Checks
- [ ] User can only see own projects
- [ ] User can only manage own agents
- [ ] Admin can view all
- [ ] API endpoints require authentication

---

## Phase 10: Documentation Verification

- [ ] INTELLIGENT_AGENT_WORKFLOW_SYSTEM.md is complete
- [ ] INTELLIGENT_AGENT_FRONTEND_GUIDE.md has examples
- [ ] INTELLIGENT_AGENT_INTEGRATION_CHECKLIST.md is accurate
- [ ] INTELLIGENT_AGENT_QUICK_REFERENCE.md is helpful
- [ ] README files are updated
- [ ] Code is well-commented

---

## Test Results Log

### Session Started: _________________
### Tester Name: _________________
### Test Date: _________________

| Phase | Checkpoint | Status | Notes | Time |
|-------|-----------|--------|-------|------|
| 1 | Database Migrations | ☐ PASS ☐ FAIL | | |
| 2 | Memory API Tests | ☐ PASS ☐ FAIL | | |
| 3 | Workflow API Tests | ☐ PASS ☐ FAIL | | |
| 4 | Schedule API Tests | ☐ PASS ☐ FAIL | | |
| 5 | Frontend Components | ☐ PASS ☐ FAIL | | |
| 6 | Queue System | ☐ PASS ☐ FAIL | | |
| 7 | Scheduler | ☐ PASS ☐ FAIL | | |
| 8 | Data Validation | ☐ PASS ☐ FAIL | | |
| 9 | Performance | ☐ PASS ☐ FAIL | | |
| 10 | Error Handling | ☐ PASS ☐ FAIL | | |

### Overall Status
- [ ] All tests passed ✅ READY FOR PRODUCTION
- [ ] Some failures ⚠️ NEEDS FIXES
- [ ] Major issues ❌ NOT READY

### Issues Found & Resolution

```
Issue #1:
Description: ___________________
Severity: Critical / High / Medium / Low
Resolution: ___________________
Status: Resolved / Pending / In Progress

Issue #2:
Description: ___________________
Severity: Critical / High / Medium / Low
Resolution: ___________________
Status: Resolved / Pending / In Progress
```

### Sign-Off

- **Tested By:** _________________
- **Approved By:** _________________
- **Date:** _________________
- **Notes:** _________________

---

**Keep this checklist for documentation and compliance purposes.**
