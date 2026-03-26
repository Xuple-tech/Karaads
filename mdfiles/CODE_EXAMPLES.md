# Code Examples & Integration Patterns

## Permission Checking Examples

### Example 1: Check Admin Access in Controller

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Services\PermissionService;
use Illuminate\Http\Request;

class AdminDashboardController
{
    public function index(Request $request)
    {
        // Middleware already checks, but we can verify again
        if (!PermissionService::canAccessAdmin(auth()->user())) {
            abort(403, 'Unauthorized');
        }

        $stats = AnalyticsService::getSystemStats('7d');
        return Inertia::render('Admin/Dashboard', compact('stats'));
    }
}
```

### Example 2: Check SaaS Owner Resource Access

```php
<?php
// In SaasOwnerController
public function editPrompt($promptId)
{
    $user = auth()->user();
    $saasOwnerId = $user->id;

    if (!PermissionService::canEditPrompts($user, $saasOwnerId)) {
        abort(403);
    }

    $prompt = AiPromptTemplate::findOrFail($promptId);
    return Inertia::render('SaasOwner/Prompts/Edit', compact('prompt'));
}
```

### Example 3: Staff Can View Any SaaS Instance Analytics

```php
<?php
// In StaffMonitoringController
public function instanceAnalytics($saasOwnerId)
{
    $user = auth()->user();

    // Staff can view any instance
    if ($user->isStaff() || $user->isAdmin()) {
        $stats = AnalyticsService::getSaasOwnerStats($saasOwnerId, '30d');
        return response()->json($stats);
    }

    abort(403);
}
```

---

## API Usage Logging

### Automatic Logging in ChatController

```php
<?php
namespace App\Http\Controllers;

use App\Models\ApiUsageLog;

class ChatController
{
    public function sendMessage(Request $request)
    {
        $startTime = microtime(true);

        try {
            // Make Grok API call
            $response = $this->grokService->chat(
                message: $request->input('message'),
                model: $request->input('model', 'grok-3')
            );

            $duration = (microtime(true) - $startTime) * 1000;

            // Automatically log usage
            ApiUsageLog::logUsage([
                'provider' => 'grok',
                'model' => 'grok-3',
                'endpoint' => '/chat/completions',
                'tokens' => $response['usage']['total_tokens'] ?? 0,
                'input_tokens' => $response['usage']['prompt_tokens'] ?? 0,
                'output_tokens' => $response['usage']['completion_tokens'] ?? 0,
                'response_time' => $duration,
                'status' => 'success',
                'metadata' => [
                    'conversation_id' => $request->input('conversation_id'),
                    'model' => $request->input('model'),
                ],
            ]);

            return response()->json($response);
        } catch (\Exception $e) {
            $duration = (microtime(true) - $startTime) * 1000;

            // Log error
            ApiUsageLog::create([
                'user_id' => auth()->id(),
                'api_provider' => 'grok',
                'endpoint' => '/chat/completions',
                'response_time_ms' => $duration,
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
```

---

## Audit Logging

### Example: Track User Creation/Update

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Models\AuditLog;

class UserController
{
    public function update(Request $request, User $user)
    {
        $oldValues = $user->toArray();

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'role' => 'required|in:user,staff,saas_owner,admin',
        ]);

        $user->update($validated);

        // Log the change
        AuditLog::logAction(
            action: 'update',
            model: 'User',
            modelId: $user->id,
            oldValues: $oldValues,
            newValues: $validated,
            description: "Updated user {$user->name}"
        );

        return redirect()->back()->with('success', 'User updated');
    }

    public function destroy(User $user)
    {
        $oldValues = $user->toArray();
        $user->delete();

        // Log deletion
        AuditLog::logAction(
            action: 'delete',
            model: 'User',
            modelId: $user->id,
            oldValues: $oldValues,
            description: "Deleted user {$user->name}"
        );

        return redirect()->back()->with('success', 'User deleted');
    }
}
```

---

## Analytics Queries

### Get System Stats for Dashboard

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Services\AnalyticsService;

class AdminDashboardController
{
    public function index()
    {
        // Get different time periods
        $stats7d = AnalyticsService::getSystemStats('7d');
        $stats30d = AnalyticsService::getSystemStats('30d');

        // Get breakdown by provider
        $apiStats = AnalyticsService::getUsageByProvider('7d');

        // Get error analysis
        $errors = AnalyticsService::getErrorStats('7d');

        // Get top users
        $topUsers = AnalyticsService::getTopUsersByUsage(10, '7d');

        // Get response time distribution
        $responseDistribution = AnalyticsService::getResponseTimeDistribution('7d');

        // Estimate costs
        $totalTokens = $stats7d['api_stats']['total_tokens_used'];
        $estimatedCost = AnalyticsService::getCostEstimate($totalTokens, 'grok');

        return Inertia::render('Admin/Dashboard', [
            'stats7d' => $stats7d,
            'stats30d' => $stats30d,
            'apiStats' => $apiStats,
            'errors' => $errors,
            'topUsers' => $topUsers,
            'responseDistribution' => $responseDistribution,
            'estimatedCost' => $estimatedCost,
        ]);
    }
}
```

---

## Grok API Management

### Add New API Key

```php
<?php
namespace App\Http\Controllers\Admin;

use App\Models\GrokApiConfig;
use App\Models\AuditLog;

class GrokApiController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'api_key' => 'required|string|min:20',
            'model' => 'required|in:grok-3,grok-4',
            'rate_limit' => 'required|integer|min:100',
            'notes' => 'nullable|string',
        ]);

        // Create configuration
        $config = GrokApiConfig::create([
            'api_key' => $validated['api_key'],
            'model' => $validated['model'],
            'rate_limit' => $validated['rate_limit'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => auth()->id(),
        ]);

        // Verify the key works
        try {
            $isValid = $config->verifyKey();
            if (!$isValid) {
                $config->delete();
                return back()->withErrors(['api_key' => 'API key verification failed']);
            }
        } catch (\Exception $e) {
            $config->delete();
            return back()->withErrors(['api_key' => 'Failed to verify API key: ' . $e->getMessage()]);
        }

        // Audit log
        AuditLog::logAction(
            'create',
            'GrokApiConfig',
            $config->id,
            null,
            $validated,
            "Created new Grok API key (model: {$validated['model']})"
        );

        return redirect()->route('admin.grok-api.show', $config)
            ->with('success', 'API key added and verified');
    }
}
```

### Use Active API Key

```php
<?php
// In GrokApiService or ChatController
use App\Models\GrokApiConfig;

class GrokApiService
{
    private function getApiKey()
    {
        $config = GrokApiConfig::getActive();

        if (!$config) {
            throw new \Exception('No active Grok API key configured');
        }

        return $config->api_key;
    }

    public function chat($message, $model = null)
    {
        $config = GrokApiConfig::getActive();
        $apiKey = $config->api_key;
        $model = $model ?? $config->model;

        // Make API call...
    }
}
```

---

## React Component Usage

### Admin Dashboard

```tsx
// routes/admin.php
Route::get('/management/dashboard', [AdminDashboardController::class, 'index'])
    ->name('management-dashboard');

// In controller
public function index()
{
    return Inertia::render('Admin/Dashboard', [
        'systemStats' => AnalyticsService::getSystemStats('7d'),
        'apiStats' => AnalyticsService::getUsageByProvider('7d'),
        'errorStats' => AnalyticsService::getErrorStats('7d'),
        'topUsers' => AnalyticsService::getTopUsersByUsage(5, '7d'),
        'criticalAlerts' => SystemAlert::getCriticalAlerts()->take(5),
    ]);
}

// In React component
import AdminDashboard from '@/pages/Admin/Dashboard';

export default function DashboardPage({ systemStats, apiStats, errorStats, topUsers, criticalAlerts }) {
    return (
        <AdminDashboard
            systemStats={systemStats}
            apiStats={apiStats}
            errorStats={errorStats}
            topUsers={topUsers}
            criticalAlerts={criticalAlerts}
        />
    );
}
```

### SaaS Owner Dashboard

```tsx
// routes/saas-owner.php
Route::get('/', [SaasOwnerDashboardController::class, 'index'])->name('dashboard');

// In controller
public function index()
{
    $user = auth()->user();
    $settings = SaasInstanceSettings::where('saas_owner_id', $user->id)->first();
    
    return Inertia::render('SaasOwner/Dashboard', [
        'instanceSettings' => $settings,
        'stats' => AnalyticsService::getSaasOwnerStats($user->id, '30d'),
        'teamMembers' => SaasTeamMember::where('saas_owner_id', $user->id)
            ->with('user')->get(),
        'responseTimeDistribution' => AnalyticsService::getResponseTimeDistribution('30d'),
    ]);
}

// In React
import SaasOwnerDashboard from '@/pages/SaasOwner/Dashboard';

export default function SaasPage({ instanceSettings, stats, teamMembers, responseTimeDistribution }) {
    return (
        <SaasOwnerDashboard
            instanceSettings={instanceSettings}
            stats={stats}
            teamMembers={teamMembers}
            responseTimeDistribution={responseTimeDistribution}
        />
    );
}
```

---

## Middleware Application

### Apply to Routes

```php
<?php
// routes/api.php

use App\Http\Middleware\LogApiUsageMiddleware;

Route::middleware(['auth:sanctum', 'log-api-usage'])->group(function () {
    Route::post('/chat/send', [ChatController::class, 'sendMessage']);
    Route::get('/conversations', [ChatController::class, 'listConversations']);
    // All requests here will be logged
});

// routes/admin.php
use App\Http\Middleware\AdminMiddleware;

Route::middleware([AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/management/dashboard', [...]);
    // All admin routes protected
});

// routes/saas-owner.php
use App\Http\Middleware\SaasOwnerMiddleware;

Route::middleware([SaasOwnerMiddleware::class])->prefix('saas-owner')->name('saas-owner.')->group(function () {
    Route::get('/', [...]);
    // All SaaS routes protected
});
```

---

## System Alerts

### Create Alert Automatically

```php
<?php
use App\Models\SystemAlert;
use App\Models\ApiUsageLog;

// In ChatController, after API call fails
if ($apiErrorCount > 10) {
    SystemAlert::createAlert(
        severity: 'critical',
        category: 'api',
        title: 'High API Error Rate',
        message: "Error rate exceeded threshold: {$errorRate}%",
        data: [
            'error_rate' => $errorRate,
            'error_count' => $apiErrorCount,
            'time_period' => '1 hour',
        ]
    );
}

// In scheduler, check system health
$schedule->call(function () {
    $errors = ApiUsageLog::where('created_at', '>=', now()->subHour())
        ->where('status', 'error')
        ->count();

    $total = ApiUsageLog::where('created_at', '>=', now()->subHour())
        ->count();

    if ($total > 0 && ($errors / $total) > 0.1) { // > 10% error rate
        SystemAlert::createAlert(
            'critical',
            'api',
            'High API Error Rate Detected',
            "Error rate: {($errors/$total)*100}%"
        );
    }
})->everyMinute();
```

### Resolve Alert

```php
<?php
// In StaffMonitoringController
public function resolveIssue($alertId)
{
    $alert = SystemAlert::findOrFail($alertId);

    // Verify staff can resolve
    if (!auth()->user()->isStaff() && !auth()->user()->isAdmin()) {
        abort(403);
    }

    $alert->resolve();

    return response()->json([
        'success' => true,
        'message' => 'Alert resolved',
    ]);
}
```

---

## Team Member Management

### Add Team Member to SaaS Instance

```php
<?php
namespace App\Http\Controllers\SaasOwner;

use App\Models\SaasTeamMember;
use App\Models\User;

class TeamMemberController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:member,manager,admin',
            'permissions' => 'nullable|array',
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        $saasOwnerId = auth()->id();

        // Add to team
        $member = SaasTeamMember::create([
            'saas_owner_id' => $saasOwnerId,
            'user_id' => $user->id,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
        ]);

        // Send invitation email
        // Mail::send(new TeamMemberInvitation($member));

        return redirect()->back()->with('success', 'Team member added');
    }

    public function update(Request $request, SaasTeamMember $member)
    {
        // Verify ownership
        if ($member->saas_owner_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => 'required|in:member,manager,admin',
            'permissions' => 'nullable|array',
        ]);

        $member->update($validated);

        return redirect()->back()->with('success', 'Team member updated');
    }
}
```

---

## Scheduler Tasks

### Add to app/Console/Kernel.php

```php
<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Reset monthly message counts on 1st of each month
        $schedule->call(function () {
            \App\Models\SaasInstanceSettings::resetMonthlyCounts();
        })->monthlyOn(1, '00:00');

        // Verify API keys daily
        $schedule->call(function () {
            \App\Models\GrokApiConfig::where('is_active', true)
                ->each(fn($config) => $config->verifyKey());
        })->dailyAt('03:00');

        // Clean up old logs quarterly
        $schedule->call(function () {
            \App\Models\LoginLog::where('created_at', '<', now()->subMonths(3))
                ->delete();
            \App\Models\ApiUsageLog::where('created_at', '<', now()->subMonths(6))
                ->delete();
        })->quarterly();

        // Check system health every 5 minutes
        $schedule->call(function () {
            // CPU/memory checks, API health checks
            // Create alerts if thresholds exceeded
        })->everyFiveMinutes();
    }
}
```

---

## Event Listening

### Login Monitoring

```php
<?php
// app/Listeners/LogAuthenticationEvents.php
namespace App\Listeners;

use App\Models\LoginLog;

class LogAuthenticationEvents
{
    public function handleLogin($event)
    {
        LoginLog::logAttempt($event->user->email, 'success');
    }

    public function handleFailed($event)
    {
        $email = $event->credentials['email'] ?? 'unknown';
        
        LoginLog::logAttempt($email, 'failed', 'Invalid credentials');

        // Check for brute force
        if (LoginLog::checkSuspiciousActivity($email, threshold: 5)) {
            \App\Models\SystemAlert::createAlert(
                'warning',
                'auth',
                'Suspicious Login Activity',
                "Multiple failed attempts: $email",
                ['email' => $email]
            );
        }
    }

    public function subscribe($events)
    {
        return [
            'Illuminate\Auth\Events\Login' => 'handleLogin',
            'Illuminate\Auth\Events\Failed' => 'handleFailed',
        ];
    }
}

// app/Providers/EventServiceProvider.php
use App\Listeners\LogAuthenticationEvents;

protected $subscribe = [
    LogAuthenticationEvents::class,
];
```

---

These examples show the main integration patterns. Refer to the implementation guide for more details.
