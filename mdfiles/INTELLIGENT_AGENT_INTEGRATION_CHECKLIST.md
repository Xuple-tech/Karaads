# Intelligent Agent Integration Checklist

Quick checklist to complete the integration of the Agent Intelligence system into your application.

## ✅ Pre-Integration Requirements

- [ ] Backend implementation complete (migrations, models, services, controllers)
- [ ] Frontend components created (all 5 components + utilities)
- [ ] Documentation reviewed
- [ ] Database ready and migrated
- [ ] Queue driver configured (Redis/Database)

## 🔧 Integration Steps

### Step 1: Add Routes to Web Routes File

**File:** `routes/web.php`

Add this route group (adjust namespace as needed):

```php
// Agent Intelligence Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/projects/{project}/agents/{agent}/intelligence', 
        [App\Http\Controllers\AgentIntelligenceController::class, 'show'])
        ->name('projects.agents.intelligence');
});
```

Or if using a dedicated route file for projects:

**File:** `routes/project-chats.php`

```php
// Already included in the route definitions provided
// Just verify this section exists:

Route::prefix('projects/{project}/agents/{agent}')
    ->middleware(['auth', 'verified'])
    ->group(function () {
        // ... existing routes ...
        
        // Intelligence Hub
        Route::get('/intelligence', [AgentIntelligenceController::class, 'show'])
            ->name('intelligence');
        
        // Memory Routes
        Route::prefix('memories')->group(function () {
            Route::get('/', [AgentMemoryController::class, 'index']);
            Route::get('/search', [AgentMemoryController::class, 'search']);
            Route::get('/relevant', [AgentMemoryController::class, 'relevant']);
            Route::post('/', [AgentMemoryController::class, 'store']);
            Route::delete('/{memory}', [AgentMemoryController::class, 'destroy']);
            Route::post('/clear', [AgentMemoryController::class, 'clear']);
            Route::get('/export', [AgentMemoryController::class, 'export']);
        });
        
        // ... more routes ...
    });
```

- [ ] Routes added to web routes file
- [ ] Route names verified
- [ ] Middleware applied correctly

### Step 2: Create AgentIntelligenceController

**File:** `app/Http/Controllers/AgentIntelligenceController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Project;
use Inertia\Inertia;

class AgentIntelligenceController extends Controller
{
    public function show(Project $project, Agent $agent)
    {
        // Authorize user
        $this->authorize('view', $agent);

        return Inertia::render('Projects/AgentIntelligence', [
            'projectId' => $project->id,
            'agentId' => $agent->id,
            'agentName' => $agent->name,
        ]);
    }
}
```

- [ ] Controller created
- [ ] Authorization logic added
- [ ] Inertia page properly rendered

### Step 3: Add Navigation Link

**File:** Your agent detail page component (e.g., `resources/js/pages/Projects/AgentDetail.tsx`)

Add link in the navigation or action buttons:

```typescript
<Link href={`/projects/${projectId}/agents/${agentId}/intelligence`}>
    <Button className="flex items-center gap-2">
        <Brain size={18} />
        Intelligence Hub
    </Button>
</Link>
```

Or in a tab/menu:

```typescript
<a href={`/projects/${projectId}/agents/${agentId}/intelligence`}
   className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200">
    <Brain size={18} />
    Intelligence
</a>
```

- [ ] Navigation link added to agent detail page
- [ ] Link tested and verified
- [ ] Proper routing/URL structure

### Step 4: Verify API Endpoints

Ensure all API controllers are accessible:

```bash
# Test memory endpoint
curl -X GET http://localhost:8000/api/projects/1/agents/1/memories \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test workflow endpoint
curl -X GET http://localhost:8000/api/projects/1/agents/1/workflows \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test schedule endpoint
curl -X GET http://localhost:8000/api/projects/1/agents/1/schedules \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] All endpoints return 200 OK
- [ ] Authentication working
- [ ] Proper authorization checks in place

### Step 5: Configure Queue Processing

**For Development:**

```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start queue listener
php artisan queue:listen

# Terminal 3: Start Laravel scheduler (in another process)
# On Windows, run in loop or use task scheduler
php artisan schedule:run
```

- [ ] Queue listener running
- [ ] Scheduler configured
- [ ] Test schedule execution

**For Production:**

Set up supervisor configuration:

```ini
# /etc/supervisor/conf.d/laravel-queue.conf
[program:laravel-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/app/artisan queue:work
autostart=true
autorestart=true
numprocs=4
redirect_stderr=true
stdout_logfile=/path/to/logs/queue.log
```

Restart supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-queue:*
```

- [ ] Supervisor configured
- [ ] Queue workers running
- [ ] Logs monitored

### Step 6: Setup Cron Job (for Schedules)

Add to system crontab:

```bash
# For Linux/Mac
* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1
```

On Windows, use Task Scheduler:
```
Action: Start a program
Program: C:\php\php.exe
Arguments: "C:\path\to\app\artisan" schedule:run
Schedule: Every minute
```

- [ ] Cron job added
- [ ] Verification: Check if jobs are running at expected times

### Step 7: Test Frontend Components

1. **Navigate to Agent Intelligence Page:**
   - [ ] Page loads without errors
   - [ ] All tabs visible (Memory, Workflows, Schedules, Monitor)

2. **Test Memory Dashboard:**
   - [ ] Can see existing memories
   - [ ] Search functionality works
   - [ ] Can filter by tags
   - [ ] Can delete memories
   - [ ] Can export to markdown

3. **Test Workflow Builder:**
   - [ ] Can create new workflow
   - [ ] Can add workflow steps
   - [ ] Can select different tools
   - [ ] Can save workflow
   - [ ] Can test execute workflow

4. **Test Schedule Manager:**
   - [ ] Can create new schedule
   - [ ] Can set cron expression
   - [ ] Can execute schedule immediately
   - [ ] Can enable/disable schedules
   - [ ] Can delete schedules

5. **Test Execution Monitor:**
   - [ ] Can see execution history
   - [ ] Auto-refresh works
   - [ ] Can filter by status
   - [ ] Can view execution details
   - [ ] Error messages displayed correctly

- [ ] Memory Dashboard tested
- [ ] Workflow Builder tested
- [ ] Schedule Manager tested
- [ ] Execution Monitor tested

### Step 8: Database Verification

Check that all tables exist:

```bash
php artisan tinker
>>> \DB::table('agent_memories')->count()
>>> \DB::table('tool_chains')->count()
>>> \DB::table('agent_schedules')->count()
>>> \DB::table('schedule_executions')->count()
```

- [ ] All tables exist
- [ ] No migration errors

### Step 9: API Testing

Test critical endpoints:

```bash
# Create memory
POST /api/projects/1/agents/1/memories
{
  "context": "Test memory",
  "tags": ["test"]
}

# Create workflow
POST /api/projects/1/agents/1/workflows
{
  "name": "Test Workflow",
  "execution_mode": "sequential",
  "steps": [...]
}

# Create schedule
POST /api/projects/1/agents/1/schedules
{
  "name": "Test Schedule",
  "trigger_type": "cron",
  "cron_expression": "0 12 * * *"
}
```

- [ ] Memory endpoint working
- [ ] Workflow endpoint working
- [ ] Schedule endpoint working

### Step 10: Permissions & Authorization

Verify authorization is working:

1. **Test with different users:**
   - [ ] User can access their own agent's intelligence
   - [ ] User cannot access other user's agent's intelligence
   - [ ] Admin can access all agents

2. **Check middleware:**
   - [ ] Auth middleware applied
   - [ ] Verified middleware applied (if needed)
   - [ ] Authorization checks in place

- [ ] Authorization working correctly
- [ ] No unauthorized access possible

### Step 11: Error Handling

Test error scenarios:

1. **Database errors:**
   - [ ] Handles connection loss gracefully
   - [ ] Shows user-friendly errors

2. **Validation errors:**
   - [ ] Invalid JSON caught
   - [ ] Invalid cron expression caught
   - [ ] Missing required fields caught

3. **Network errors:**
   - [ ] API request failures handled
   - [ ] Timeouts handled gracefully

- [ ] Error handling tested
- [ ] User sees helpful error messages

### Step 12: Performance Testing

Monitor performance:

1. **Memory Dashboard:**
   - [ ] Lists 100+ memories without lag
   - [ ] Search completes in <1 second
   - [ ] Export works for large datasets

2. **Execution Monitor:**
   - [ ] Auto-refresh doesn't cause slowdown
   - [ ] Can handle 1000+ execution records
   - [ ] Sorting/filtering responsive

3. **Load Testing:**
   - [ ] Backend handles concurrent requests
   - [ ] No memory leaks in queue processing

- [ ] Performance acceptable
- [ ] No N+1 queries

### Step 13: Documentation

Ensure documentation is available:

- [ ] Frontend guide reviewed and referenced
- [ ] API documentation generated/shared
- [ ] Troubleshooting guide available
- [ ] Examples provided to team

### Step 14: Deployment

Ready for production:

1. **Pre-deployment:**
   - [ ] All tests passing
   - [ ] Code reviewed
   - [ ] Database backed up

2. **Deployment:**
   - [ ] Run migrations on production
   - [ ] Clear production caches
   - [ ] Deploy frontend changes
   - [ ] Restart queue workers
   - [ ] Verify cron job

3. **Post-deployment:**
   - [ ] Test all features
   - [ ] Monitor logs
   - [ ] Verify performance

- [ ] Deployed to production
- [ ] All systems operational

## 🚀 Quick Start Commands

### Complete Setup (Development)

```bash
# 1. Run migrations
php artisan migrate

# 2. Clear caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# 3. In terminal 1: Start Laravel
php artisan serve

# 4. In terminal 2: Start queue
php artisan queue:listen

# 5. In terminal 3: Verify scheduler
php artisan schedule:run

# 6. Test frontend
npm run dev
```

### Complete Setup (Production)

```bash
# 1. Run migrations
php artisan migrate --force

# 2. Build frontend
npm run build

# 3. Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Setup supervisor for queue
sudo supervisorctl restart laravel-queue:*

# 5. Verify cron job
crontab -l | grep schedule:run
```

## 📋 Rollback Checklist (if needed)

- [ ] Remove navigation links
- [ ] Drop routes
- [ ] Rollback migrations: `php artisan migrate:rollback`
- [ ] Clear frontend cache
- [ ] Restart services

## ✅ Final Verification

Before marking as complete:

- [ ] All 4 tabs loading correctly
- [ ] Memory operations working
- [ ] Workflow creation/execution working
- [ ] Schedule creation working
- [ ] Real-time monitor auto-refresh working
- [ ] No console errors
- [ ] No API errors (check network tab)
- [ ] Responsive design verified
- [ ] Dark mode working (if applicable)
- [ ] All features documented

## 🎉 Completion

Once all checkboxes are completed:

1. **Update Status**
   - Frontend: 100% ✅
   - Backend: 100% ✅
   - Integration: 100% ✅
   - Testing: 100% ✅
   - Documentation: 100% ✅

2. **Notify Team**
   - Share documentation
   - Provide feature training
   - Set up support process

3. **Monitor**
   - Watch error logs
   - Track performance metrics
   - Gather user feedback

---

**Status: Ready for Integration**

All components are production-ready. Follow this checklist to integrate into your application.

Estimated time to complete: 2-4 hours
