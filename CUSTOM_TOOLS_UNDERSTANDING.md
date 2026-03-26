# Understanding Custom Tools (AgentTool)

## Overview

Custom tools allow users (admins) to create reusable functions that AI agents can call. These tools are stored in the `AgentTool` model and are managed through the admin interface.

## Data Structure

### AgentTool Model (`app/Models/AgentTool.php`)

```php
class AgentTool extends Model {
    protected $fillable = [
        'agent_id',           // Which agent this tool belongs to
        'tool_type',          // Type: 'calculator', 'booking', 'product_search', 'support_ticket', 'custom'
        'name',               // Function name (lowercase, alphanumeric + underscore)
        'description',        // What the tool does
        'configuration',      // JSON array with tool-specific config
        'is_active',          // Boolean: is this tool enabled?
        'order',              // Display/execution order
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'configuration' => 'array',  // Automatically cast to/from JSON
    ];
}
```

## Configuration Structure

The `configuration` field is a JSON array that varies by tool type:

### Example 1: API-based Tool

```json
{
    "api": {
        "url": "https://api.example.com/products",
        "method": "GET",
        "headers": {
            "Authorization": "Bearer YOUR_API_KEY",
            "Content-Type": "application/json"
        }
    },
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Search term"
            },
            "limit": {
                "type": "integer",
                "description": "Max results"
            }
        },
        "required": ["query"]
    }
}
```

### Example 2: Booking Tool

```json
{
    "service": "booking_system",
    "calendar_url": "https://api.booking.com/calendar",
    "parameters": {
        "type": "object",
        "properties": {
            "date": {
                "type": "string",
                "description": "YYYY-MM-DD format"
            },
            "time_slot": {
                "type": "string",
                "description": "09:00, 10:00, etc"
            }
        },
        "required": ["date", "time_slot"]
    }
}
```

## How Tools Flow Through Grok

### 1. **Tool Registration** (in `WidgetGrokService::getTools()`)

```php
// When an agent uses tools, we fetch all active tools:
$agentTools = $agent->tools()->where('is_active', true)->get();

// For each tool, we build a Grok-compatible schema:
$tools[] = [
    'type' => 'function',
    'function' => [
        'name' => $this->sanitizeToolName($tool->name),        // 'product_search'
        'description' => $tool->description,                   // "Search products"
        'parameters' => $this->validateToolParameters(
            $tool->configuration['parameters']
        )
    ]
];
```

### 2. **Tool Validation** (in `validateToolParameters()`)

The validator ensures parameters match Grok's JSON Schema requirements:

```php
// BEFORE: May have empty arrays or missing fields
$tool->configuration['parameters'] = [
    'type' => 'object',
    'properties' => []              // ❌ Empty array (causes error)
]

// AFTER: Properly formatted
$tool->configuration['parameters'] = [
    'type' => 'object',
    'properties' => [],             // ✅ Empty array (will be converted)
    'required' => [],               // ✅ Added if missing
    'additionalProperties' => false // ✅ Added for strict validation
]
```

### 3. **Serialization** (in `prepareToolsForSerialization()`)

This is the **critical fix** - empty property arrays must serialize as JSON objects `{}`:

```php
// Convert empty arrays to stdClass so they serialize as {}
if ($tool['function']['parameters']['properties'] === []) {
    $tool['function']['parameters']['properties'] = new \stdClass();
}

// JSON encoding result:
// {"properties": {}}  ✅ Correct
// NOT: {"properties": []}  ❌ Wrong
```

### 4. **Tool Execution** (in `executeTool()`)

When Grok calls a tool:

```php
// Grok sends tool name and arguments
$functionName = 'product_search';  // Matches sanitized name
$arguments = ['query' => 'laptop', 'limit' => 10];

// We execute the tool
return $this->executeAgentTool($tool, $arguments);
```

## Tool Execution Types

### Type A: API Call Tools

```php
// Configuration has api.url, api.method, api.headers
private function executeAgentApiTool(AgentTool $tool, array $arguments)
{
    // Replace path parameters
    $url = str_replace('{id}', $arguments['id'], $tool->configuration['api']['url']);

    // Build query/body from arguments
    // Make HTTP request
    // Return formatted result
}
```

### Type B: Custom Logic Tools

For future implementation - tools with custom PHP logic.

## Admin Interface Flow

1. **Create Tool** (`Admin/AgentTools/Create`)

    - Select agent
    - Choose tool type
    - Enter name, description
    - Set configuration (JSON or form)
    - Save to database

2. **Edit Tool** (`Admin/AgentTools/Edit`)

    - Modify any field
    - Test tool configuration
    - Activate/deactivate

3. **Test Tool** (`AgentToolController::test()`)
    - Send test data
    - Execute tool
    - Return results

## Important Constraints

### Tool Names

- Must be lowercase
- Alphanumeric + underscore only
- No hyphens or special chars
- Cannot start with number

**Example:**

```
❌ Latest-Product  →  Latest_product
❌ Product.Search  →  Product_search
✅ product_search
✅ latest_product_v2
```

### Parameters Schema (JSON Schema)

Required structure:

```json
{
    "type": "object",
    "properties": {
        "param_name": {
            "type": "string|integer|boolean|number|array|object",
            "description": "What this param does"
        }
    },
    "required": ["param_name"],
    "additionalProperties": false
}
```

## Common Issues & Fixes

### Issue: "Invalid function schema"

**Cause:** Empty properties is an empty array `[]` instead of object `{}`

**Solution:** `prepareToolsForSerialization()` converts `[]` to `new stdClass()`

### Issue: Tool not executing

**Cause:** Tool name doesn't match sanitized name, or tool is inactive

**Solution:** Check `$tool->is_active` and `sanitizeToolName()` output

### Issue: Wrong parameters passed

**Cause:** Configuration parameters don't match what Grok sends

**Solution:** Check `tool->configuration['parameters']['properties']` matches tool definition

## Code References

- **Model:** `/app/Models/AgentTool.php`
- **Controller:** `/app/Http/Controllers/Admin/AgentToolController.php`
- **Service:** `/app/Services/WidgetGrokService.php`
    - `getTools()` - Register tools
    - `validateToolParameters()` - Validate schema
    - `prepareToolsForSerialization()` - Fix JSON encoding
    - `executeAgentTool()` - Run tool
    - `executeAgentApiTool()` - Run API tool
- **Frontend:** `/resources/js/pages/Admin/AgentTools/`

## Example: Complete Tool Creation

### 1. Database Entry

```php
AgentTool::create([
    'agent_id' => $agentId,
    'tool_type' => 'api_call',
    'name' => 'product_search',
    'description' => 'Search products in catalog',
    'configuration' => [
        'api' => [
            'url' => 'https://api.example.com/products/search',
            'method' => 'GET',
            'headers' => [
                'Authorization' => 'Bearer token'
            ]
        ],
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'query' => [
                    'type' => 'string',
                    'description' => 'Search query'
                ],
                'limit' => [
                    'type' => 'integer',
                    'description' => 'Max results'
                ]
            ],
            'required' => ['query']
        ]
    ],
    'is_active' => true,
    'order' => 1
]);
```

### 2. Tool Registration (Automatic)

When agent streams chat with this tool:

- `WidgetGrokService::getTools()` fetches all active tools
- Tool is registered in Grok API call

### 3. Tool Execution (When Grok Calls It)

```
User: "Find me a laptop"
  ↓
Grok: "I'll search products for you"
  ↓
Grok calls: product_search({query: 'laptop', limit: 10})
  ↓
WidgetGrokService::executeTool('product_search', {...})
  ↓
executeAgentApiTool() calls: GET https://api.example.com/products/search?query=laptop&limit=10
  ↓
Result returned to Grok
  ↓
Grok: "I found these laptops: [results]"
```

## Best Practices

1. **Always set `is_active = false`** during development/testing
2. **Use descriptive names** - `product_search` not `ps`
3. **Clear descriptions** - "Search products by keyword" not "search"
4. **Test thoroughly** - Use test endpoint before deploying
5. **Handle errors** - Tools should gracefully handle API failures
6. **Version APIs** - Use versioned API endpoints if available
7. **Rate limiting** - Consider caching for frequently called APIs
