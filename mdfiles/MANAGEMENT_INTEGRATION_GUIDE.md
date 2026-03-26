# Management Features Integration Guide

## Overview

This guide covers the complete implementation of role-based management features for Admin, SaaS Owner, and Tech Staff roles in your Kwati AI chatbot system.

## Database Setup

### Run Migrations

```bash
php artisan migrate
```

This creates the following tables:
- `system_configs` - System-wide configuration settings
- `grok_api_configs` - Grok API key management
- `audit_logs` - Track all admin actions
- `api_usage_logs` - API call analytics
- `system_alerts` - System alerts and errors
- `login_logs` - Security audit logs
- `ai_prompt_templates` - Reusable AI prompts
- `saas_instance_settings` - SaaS instance configurations
- `saas_team_members` - SaaS team member management

## Configuration

### 1. Register Event Listener

Update `app/Providers/EventServiceProvider.php`:

```php
use App\Listeners\LogAuthenticationEvents;

protected $listen = [
    'Illuminate\Auth\Events\Login' => [
        LogAuthenticationEvents::class,
    ],
    'Illuminate\Auth\Events\Failed' => [
        LogAuthenticationEvents::class,
    ],
];
```

### 2. Register Middleware

Update `app/Http/Kernel.php` in the `protected $routeMiddleware` array:

```php
'log-api-usage' => \App\Http\Middleware\LogApiUsageMiddleware::class,
'admin-or-staff' => \App\Http\Middleware\AdminOrStaffMiddleware::class,
'saas-owner' => \App\Http\Middleware\SaasOwnerMiddleware::class,
```

### 3. Apply Middleware to API Routes

Update `routes/api.php`:

```php
Route::middleware(['auth:sanctum', 'log-api-usage'])->group(function () {
    // Your existing API routes
});
```

## Features by Role

### Admin (CTO)

**Dashboard**: `/admin/management/dashboard`
- System-wide statistics
- API usage by provider
- Error tracking
- Top users by usage
- Critical alerts

**Routes**:
- `/admin/management/dashboard` - Main dashboard
- `/admin/management/alerts` - View/resolve alerts
- `/admin/management/audit-logs` - Audit trails
- `/admin/management/configuration` - System config
- `/admin/grok-api/*` - Grok API management
- `/admin/prompts/*` - System-wide prompts
- `/admin/staff` - Staff management
- `/admin/saas-owners` - SaaS owner management

**Key Models & Services**:
- `PermissionService::canAccessAdmin()`
- `AnalyticsService::getSystemStats()`
- `GrokApiConfig` - API key management
- `AuditLog` - Track all changes

### SaaS Owner

**Dashboard**: `/saas-owner/`
- Instance usage statistics
- Message quota monitoring
- Team member management
- Custom AI prompts
- Subscription status

**Routes**:
- `/saas-owner/` - Main dashboard
- `/saas-owner/analytics` - Detailed analytics
- `/saas-owner/subscription` - Billing/subscription
- `/saas-owner/team-members/*` - Team management
- `/saas-owner/prompts/*` - Custom prompts

**Key Models & Services**:
- `SaasInstanceSettings` - Instance configuration
- `SaasTeamMember` - Team member access control
- `AiPromptTemplate` - Custom prompts per instance
- `AnalyticsService::getSaasOwnerStats()`

### Tech Staff

**Dashboard**: `/staff/`
- System health monitoring
- API performance metrics
- Error tracking & troubleshooting
- Response time analysis
- Security logs

**Routes**:
- `/staff/` - Monitoring dashboard
- `/staff/api-performance` - Detailed API stats
- `/staff/system-health` - System metrics
- `/staff/security-logs` - Login/access logs
- `/staff/resolve-issue/{alertId}` - Issue resolution

**Key Models & Services**:
- `PermissionService::isTechStaff()`
- `SystemAlert` - Alert management
- `LoginLog` - Security audit
- `ApiUsageLog` - Performance analysis

## Usage Examples

### Example 1: Check User Permissions

```php
use App\Services\PermissionService;

$user = auth()->user();

// Check specific permissions
if (PermissionService::canAccessAdmin($user)) {
    // Show admin features
}

if (PermissionService::canViewSaasAnalytics($user, $saasOwnerId)) {
    // Show analytics
}

// Get all permissions for user
$permissions = PermissionService::getUserPermissions($user);
```

### Example 2: Log API Usage

```php
use App\Models\ApiUsageLog;

ApiUsageLog::logUsage([
    'provider' => 'grok',
    'model' => 'grok-3',
    'endpoint' => '/chat/completions',
    'tokens' => 150,
    'input_tokens' => 50,
    'output_tokens' => 100,
    'response_time' => 245, // milliseconds
    'status' => 'success',
]);
```

### Example 3: Get Analytics

```php
use App\Services\AnalyticsService;

// System-wide stats
$stats = AnalyticsService::getSystemStats('7d'); // 24h, 7d, 30d, 90d, 1y

// SaaS owner stats
$saasStats = AnalyticsService::getSaasOwnerStats($saasOwnerId, '30d');

// Error analysis
$errors = AnalyticsService::getErrorStats('7d');

// Top users
$topUsers = AnalyticsService::getTopUsersByUsage(10, '7d');

// Cost estimation
$cost = AnalyticsService::getCostEstimate($tokenCount, 'grok');
```

### Example 4: Manage Grok API Keys

```php
use App\Models\GrokApiConfig;

// Get active key
$activeKey = GrokApiConfig::getActive();

// Create new key
$config = GrokApiConfig::create([
    'api_key' => 'sk-xxx',
    'model' => 'grok-3',
    'rate_limit' => 1000,
    'created_by' => auth()->id(),
]);

// Verify key
$isValid = $config->verifyKey();

// Check if feature is allowed
if ($config->isFeatureAllowed('vision')) {
    // Use vision feature
}
```

### Example 5: Create AI Prompt Template

```php
use App\Models\AiPromptTemplate;

// System-wide prompt
$prompt = AiPromptTemplate::create([
    'name' => 'Customer Support',
    'prompt' => 'You are a helpful customer support agent. {{instructions}}',
    'description' => 'For customer support interactions',
    'category' => 'support',
    'variables' => ['instructions'],
]);

// Use template
$rendered = $prompt->renderPrompt([
    'instructions' => 'Be polite and helpful'
]);

// Increment usage
$prompt->use();
```

### Example 6: Audit Logging

```php
use App\Models\AuditLog;

AuditLog::logAction(
    action: 'update',
    model: 'User',
    modelId: $user->id,
    oldValues: ['name' => 'John'],
    newValues: ['name' => 'Jane'],
    description: 'Updated user name'
);
```

### Example 7: System Alerts

```php
use App\Models\SystemAlert;

// Create alert
SystemAlert::createAlert(
    severity: 'critical',
    category: 'api',
    title: 'High Error Rate',
    message: 'Error rate exceeded 10%',
    data: ['error_rate' => 15.5]
);

// Get critical alerts
$alerts = SystemAlert::getCriticalAlerts();

// Resolve alert
$alert->resolve();
```

## Frontend Integration

### Admin Dashboard Component

```tsx
import AdminDashboard from '@/pages/Admin/Dashboard';

export default function AdminPage() {
    return <AdminDashboard 
        systemStats={props.systemStats}
        apiStats={props.apiStats}
        errorStats={props.errorStats}
        topUsers={props.topUsers}
        criticalAlerts={props.criticalAlerts}
    />;
}
```

### SaaS Owner Dashboard Component

```tsx
import SaasOwnerDashboard from '@/pages/SaasOwner/Dashboard';

export default function SaasOwnerPage() {
    return <SaasOwnerDashboard
        instanceSettings={props.instanceSettings}
        stats={props.stats}
        teamMembers={props.teamMembers}
        responseTimeDistribution={props.responseTimeDistribution}
    />;
}
```

### Tech Staff Monitoring Component

```tsx
import StaffMonitoringDashboard from '@/pages/Staff/Monitoring';

export default function StaffPage() {
    return <StaffMonitoringDashboard
        systemHealth={props.systemHealth}
        apiPerformance={props.apiPerformance}
        recentErrors={props.recentErrors}
        performanceByHour={props.performanceByHour}
    />;
}
```

## API Endpoints

### Analytics API (Admin Only)

```bash
GET /api/admin/analytics/system         # System statistics
GET /api/admin/analytics/api-usage      # API usage data
GET /api/admin/analytics/errors         # Error statistics
GET /api/admin/analytics/top-users      # Top users
```

### Grok API Management (Admin Only)

```bash
GET    /api/admin/grok-api              # List API configs
POST   /api/admin/grok-api              # Create new config
GET    /api/admin/grok-api/{id}         # View config
PUT    /api/admin/grok-api/{id}         # Update config
DELETE /api/admin/grok-api/{id}         # Delete config
POST   /api/admin/grok-api/{id}/test    # Test API key
```

### SaaS Owner API

```bash
GET    /api/saas-owner/analytics        # Instance analytics
GET    /api/saas-owner/team-members     # Team members
POST   /api/saas-owner/team-members     # Add member
PUT    /api/saas-owner/team-members/{id} # Update member
DELETE /api/saas-owner/team-members/{id} # Remove member
```

### Tech Staff API

```bash
GET    /api/staff/monitoring            # System health
GET    /api/staff/api-performance       # API metrics
GET    /api/staff/security-logs         # Login logs
POST   /api/staff/alerts/{id}/resolve   # Resolve alert
```

## Scheduler Tasks

Add these to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Reset monthly message counts
    $schedule->call(function () {
        \App\Models\SaasInstanceSettings::resetMonthlyCounts();
    })->monthlyOn(1, '00:00');

    // Verify API keys
    $schedule->call(function () {
        \App\Models\GrokApiConfig::where('is_active', true)
            ->each(fn($config) => $config->verifyKey());
    })->dailyAt('00:00');

    // Clean up old logs (optional)
    $schedule->call(function () {
        \App\Models\LoginLog::where('created_at', '<', now()->subDays(90))
            ->delete();
        \App\Models\ApiUsageLog::where('created_at', '<', now()->subDays(90))
            ->delete();
    })->monthlyOn(1, '01:00');
}
```

## Security Best Practices

1. **API Key Encryption**: All Grok API keys are encrypted in the database using Laravel's encryption
2. **Access Control**: Use middleware to protect admin and staff routes
3. **Audit Logging**: All admin actions are logged for compliance
4. **Rate Limiting**: Configure Grok API rate limits per key
5. **Login Monitoring**: Detect suspicious login attempts
6. **Permission Caching**: Permissions are cached to reduce database queries

## Troubleshooting

### API Key Not Verifying

Check that your API key format is correct and has valid permissions in your Grok account.

### High Error Rates

Monitor the `system_alerts` table and check logs in `storage/logs/`.

### Performance Issues

Review `api_usage_logs` to identify slow endpoints and optimize accordingly.

### Team Member Access Issues

Verify role and permissions in `saas_team_members` table.

## Next Steps

1. Run migrations
2. Register event listener and middleware
3. Configure scheduler tasks
4. Deploy frontend components
5. Test role-based access
6. Monitor alerts and logs
7. Customize analytics dashboards as needed

## Support

For questions or issues, check the route definitions in:
- `routes/admin.php`
- `routes/saas-owner.php`
- `routes/staff.php`
