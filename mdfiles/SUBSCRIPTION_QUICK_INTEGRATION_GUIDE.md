# Subscription Limits - Quick Integration Guide

## For Frontend Developers

### Show Current Limits to User
```tsx
import { SubscriptionLimitsDisplay } from '@/components/SubscriptionLimitsDisplay';

<SubscriptionLimitsDisplay compact={false} showFeatures={true} showTools={true} />
```

### Check Before Creating Agent
```tsx
import { useAgentLimits } from '@/hooks/useSubscriptionLimits';

const { canCreateAgent, remainingConcurrent } = useAgentLimits();

if (!canCreateAgent) {
    return <Alert>You've reached your agent limit</Alert>;
}
```

### Check Feature Availability
```tsx
import { useFeatureAvailable } from '@/hooks/useSubscriptionLimits';

const { available, limit } = useFeatureAvailable('web_search');

if (!available) {
    return <FeatureLockedModal />;
}
```

### Get All User Limits
```tsx
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

const { limits } = useSubscriptionLimits();
console.log(limits.agent_limits); // Full agent limits
console.log(limits.enabled_features); // Array of features
console.log(limits.available_tools); // Array of tools
```

---

## For Backend Developers

### Check Agent Creation Limit
```php
use App\Services\SubscriptionLimitService;

$limitService = app(SubscriptionLimitService::class);
$result = $limitService->canCreateAgent($user, $team);

if (!$result['allowed']) {
    return response()->json(['error' => $result['reason']], 403);
}

// Proceed with creation
```

### Check Feature Enabled
```php
if ($limitService->isFeatureEnabled($user, 'web_search')) {
    // Feature is available
}
```

### Check Tool Available
```php
if ($limitService->isToolAvailable($user, 'gpt4_vision')) {
    // Tool is available
}
```

### Get User Limits Object
```php
$limits = $limitService->getUserLimits($user);
// Returns full limits with agent, tool, feature info
```

### Add to Model for Auto-Validation
```php
use App\Traits\EnforcesSubscriptionLimits;

class Agent extends Model {
    use EnforcesSubscriptionLimits;
    
    public function checkSubscriptionLimits() {
        $this->validateAgentCreation();
    }
}
```

---

## For Admin Panel

### Access Plan Editor
```
Admin Dashboard → Subscriptions → Plans → [Select Plan] → Edit
```

Or programmatically:
```tsx
import { SubscriptionPlanEditor } from '@/components/Admin/SubscriptionPlans';

<SubscriptionPlanEditor planId={planId} onBack={() => goBack()} />
```

### Configure Agent Limits
In the "Agent Limits" tab:
1. Set max concurrent agents (or leave empty for unlimited)
2. Set max agents per team (or leave empty for unlimited)
3. Set max active agents (or leave empty for unlimited)
4. Click Save

### Add Features to Plan
In the "Features" tab:
1. Click "Quick Add" or "Custom Feature"
2. Select from common features or enter custom key
3. Set usage limit (optional)
4. Click "Add Feature"

### Whitelist Tools
In the "Tools" tab:
1. Click "Add Tool"
2. Enter tool key and name
3. Select category (MCP Server, Integration, Built-in)
4. Set usage limit (optional)
5. Click "Add Tool"

---

## API Integration Examples

### Get User's Limits (Frontend)
```javascript
fetch('/api/subscription/limits', {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log(data.limits))
```

### Check Agent Creation
```javascript
fetch('/api/subscription/check-agent-creation', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ team_id: teamId })
})
.then(r => r.json())
.then(data => {
    if (!data.allowed) {
        alert(data.reason); // "You've reached the limit..."
    }
})
```

### Check Feature
```javascript
fetch('/api/subscription/features/web_search', {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
    console.log(data.enabled); // true/false
    console.log(data.limit); // null or 100
})
```

---

## Common Scenarios

### Scenario 1: User Wants to Create 6th Agent (Max 5)
**Frontend**:
- Agent creation button disabled
- Message: "You have 0 agents remaining. Upgrade your plan."

**Backend**:
- `canCreateAgent()` returns `allowed: false`
- Returns 403 with reason

**Result**: User sees upgrade prompt

### Scenario 2: Feature Not Available (e.g., Voice for Free Tier)
**Frontend**:
- Voice button shows lock icon
- Hover shows "Upgrade to use voice"

**Backend**:
- `isFeatureEnabled()` returns false
- API rejects voice request with 403

**Result**: User sees upgrade CTA

### Scenario 3: User Adds 8 Tools to Workflow (Max 5)
**Frontend**:
- Tool selector disabled after 5 selected
- Counter shows "5/5"

**Backend**:
- `canAddToolsToWorkflow()` validates count
- Returns error if exceeds

**Result**: Seamless validation on both sides

---

## Database Queries

### Get Plan's Agent Limits
```php
$plan = SubscriptionPlan::find($planId);
$limits = $plan->getAgentLimits();
// Returns: [
//     'max_concurrent' => 10,
//     'max_per_team' => 5,
//     'max_active' => 3
// ]
```

### Get Plan's Tool Limits
```php
$limits = $plan->getToolLimits();
// Returns: [
//     'max_mcp_servers' => 3,
//     'max_tools_per_workflow' => 10,
//     'supports_custom_tools' => true,
//     'supports_mcp_integration' => true
// ]
```

### Get Enabled Features
```php
$features = $plan->enabledFeatures()->get();
// Returns collection of SubscriptionPlanFeature
foreach ($features as $feature) {
    echo $feature->feature_name;
    echo $feature->getLimitText(); // "100 per month"
}
```

### Get Available Tools
```php
$tools = $plan->enabledTools()->get();
foreach ($tools as $tool) {
    echo $tool->tool_name;
    echo $tool->tool_category; // "mcp_server"
}
```

---

## Error Handling

### Catch Subscription Limit Exception
```php
use App\Exceptions\SubscriptionLimitExceededException;

try {
    $agent = Agent::create([...]);
} catch (SubscriptionLimitExceededException $e) {
    return response()->json([
        'error' => $e->getMessage(),
        'limit_type' => $e->getLimitType(),
        'details' => $e->getDetails(),
    ], 403);
}
```

### API Response Format
```json
{
    "success": false,
    "message": "You've reached the limit of 5 concurrent agents",
    "error_type": "subscription_limit_exceeded",
    "limit_type": "concurrent_agents",
    "details": {
        "current": 5,
        "limit": 5
    }
}
```

---

## Testing

### Test Plan Configuration
```php
$plan = SubscriptionPlan::find($planId);

// Add feature
$feature = $plan->planFeatures()->create([
    'feature_key' => 'web_search',
    'feature_name' => 'Web Search',
    'is_enabled' => true,
    'limit' => 100,
    'limit_type' => 'monthly',
]);

// Verify
$this->assertTrue($plan->enabledFeatures()->where('feature_key', 'web_search')->exists());
```

### Test Limit Enforcement
```php
$user->subscription->plan->update(['max_concurrent_agents' => 2]);

$agent1 = Agent::create(['user_id' => $user->id]);
$agent2 = Agent::create(['user_id' => $user->id]);
$agent3 = Agent::create(['user_id' => $user->id]); // Should fail

$this->assertFalse($agent3->exists());
```

---

## Debugging Tips

### Check User's Subscription
```php
$subscription = $user->activeSubscription();
echo $subscription->plan->name;
echo $subscription->plan->max_concurrent_agents;
```

### Check Feature Status
```php
$plan = $user->activeSubscription()->plan;
$feature = $plan->planFeatures()->where('feature_key', 'web_search')->first();
echo $feature->is_enabled ? 'Enabled' : 'Disabled';
```

### Check Tool Status
```php
$tool = $plan->planTools()->where('tool_key', 'gpt4_vision')->first();
echo $tool ? 'Available' : 'Not available';
```

### Check All Limits
```php
$limitService = app(SubscriptionLimitService::class);
$limits = $limitService->getUserLimits($user);
dd($limits);
```

---

## Performance Considerations

### Caching
- React Query caches limits for 5 minutes
- Invalidate cache on subscription change
- Use React Query DevTools to monitor

### Database
- Use `enabledFeatures()` and `enabledTools()` scopes
- These include `where('is_enabled', true)` automatically
- Leverage Eloquent eager loading: `with('planFeatures')`

### API
- Limit endpoints cached on client for 5 min
- Re-fetch on subscription changes
- Use `revalidate()` to force refresh

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Agent creation not enforced | Add `EnforcesSubscriptionLimits` trait to Agent model |
| Features not showing | Verify `is_enabled = true` in database |
| Tools not available | Check plan has tool whitelisted and enabled |
| Limit display NaN | Ensure limits are integers or null, not strings |
| React hook stale | Use `queryClient.invalidateQueries()` after changes |
| API returning 401 | Check auth token in request headers |
| Limits showing unlimited | Verify nullable columns in database, NULL = unlimited |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `SubscriptionLimitService.php` | All limit checking logic |
| `useSubscriptionLimits.ts` | React hook for client-side checks |
| `PlanAgentLimitsPanel.tsx` | Admin panel for agent limits |
| `PlanFeaturesPanel.tsx` | Admin panel for feature management |
| `SubscriptionLimitsDisplay.tsx` | User-facing limits display |
| `SubscriptionLimitsController.php` | API endpoints for limits |
| `SubscriptionPlanFeature.php` | Feature model |
| `SubscriptionPlanTool.php` | Tool model |

---

## Quick Checklist for New Features

When adding a new feature/tool:

- [ ] Add feature/tool to `subscription_plan_features` or `subscription_plan_tools`
- [ ] Create admin UI for management
- [ ] Add check in SubscriptionLimitService
- [ ] Add React hook for frontend
- [ ] Add API endpoint if needed
- [ ] Add unit test
- [ ] Add integration test
- [ ] Update documentation

---

## Support

For detailed information, see:
- `SUBSCRIPTION_TIERS_IMPLEMENTATION_COMPLETE.md` - Full implementation guide
- Controller docblocks - Method-level documentation
- Model relationships - Entity structure
