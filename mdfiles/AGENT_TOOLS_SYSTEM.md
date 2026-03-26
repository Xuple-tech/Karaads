# Agent Tools System Documentation

## Overview

The Agent Tools System enables AI agents to extend their capabilities by executing external operations. Agents can be configured with one or more tools to search the web, read/create files, make API calls, execute code, and more.

## ✨ Available Tools

### 1. **Web Search** (`web_search`)
Search the internet for information using DuckDuckGo API.

```json
{
  "query": "Laravel database optimization",
  "limit": 5
}
```

**Returns:**
```json
{
  "results_count": 5,
  "results": [
    {
      "title": "...",
      "url": "https://...",
      "snippet": "..."
    }
  ]
}
```

**Rate Limit:** 100/minute
**Use Cases:** Research, information gathering, market analysis

---

### 2. **Web Fetch** (`web_fetch`)
Fetch and extract content from webpages.

```json
{
  "url": "https://example.com/article",
  "extract": "text"
}
```

**Extract Options:**
- `text` - Extract plain text
- `html` - Extract raw HTML
- `metadata` - Title, description, keywords
- `all` - Everything

**Returns:**
```json
{
  "url": "https://...",
  "title": "Page Title",
  "text": "...",
  "metadata": {...}
}
```

**Rate Limit:** 50/minute
**Use Cases:** Content extraction, web scraping, article reading

---

### 3. **File Read** (`file_read`)
Read file content from project storage.

```json
{
  "path": "documents/report.txt"
}
```

**Returns:**
```json
{
  "path": "documents/report.txt",
  "size": 1024,
  "content": "...",
  "mime_type": "text/plain"
}
```

**Limits:**
- Max file size: 100KB
- Rate Limit: 200/minute

**Use Cases:** Document analysis, log reading, data processing

---

### 4. **File Create** (`file_create`)
Create new files in project storage.

```json
{
  "path": "reports/analysis_2024.json",
  "content": "{...}",
  "overwrite": false
}
```

**Returns:**
```json
{
  "path": "reports/analysis_2024.json",
  "size": 2048,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Rate Limit:** 100/minute
**Use Cases:** Report generation, log creation, data export

---

### 5. **File Delete** (`file_delete`)
Delete files from project storage.

```json
{
  "path": "temp/old_file.tmp"
}
```

**Returns:**
```json
{
  "path": "temp/old_file.tmp",
  "deleted_at": "2024-01-15T10:30:00Z"
}
```

**Rate Limit:** 100/minute
**Use Cases:** Cleanup, temporary file removal

---

### 6. **API Call** (`api_call`)
Make HTTP requests to external APIs.

```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "headers": {"Authorization": "Bearer token"},
  "body": {"name": "John"},
  "timeout": 10
}
```

**Supported Methods:** GET, POST, PUT, PATCH, DELETE, HEAD

**Returns:**
```json
{
  "status_code": 200,
  "body": {...},
  "headers": {...}
}
```

**Rate Limit:** 150/minute
**Use Cases:** Third-party integrations, data synchronization

---

### 7. **Code Execute** (`code_execute`)
Execute code in sandboxed environment.

**Supported Languages:** PHP, Python, JavaScript, JSON

```json
{
  "code": "return 2 + 2;",
  "language": "php"
}
```

**PHP Example:**
```json
{
  "code": "return array_sum([1, 2, 3, 4, 5]);",
  "language": "php"
}
```

**Python Example:**
```json
{
  "code": "import math\nresult = math.sqrt(16)\nprint(result)",
  "language": "python"
}
```

**Returns:**
```json
{
  "output": "4",
  "result": 4,
  "stderr": ""
}
```

**Rate Limit:** 50/minute
**Timeout:** 10 seconds
**Use Cases:** Data transformation, calculations, validation

---

### 8. **Send Email** (`send_email`)
Send emails from the agent.

```json
{
  "to": "user@example.com",
  "subject": "Report Ready",
  "body": "Your report is ready for review."
}
```

**Returns:**
```json
{
  "to": "user@example.com",
  "subject": "Report Ready",
  "sent_at": "2024-01-15T10:30:00Z"
}
```

**Rate Limit:** 30/minute
**Use Cases:** Notifications, alerts, confirmations

---

### 9. **Get Weather** (`get_weather`)
Get weather information for a location.

```json
{
  "location": "San Francisco"
}
```

**Returns:**
```json
{
  "location": "San Francisco, United States",
  "weather": {
    "temperature_2m": 15.2,
    "weather_code": 2,
    "wind_speed_10m": 12.5
  }
}
```

**Rate Limit:** 60/minute
**Use Cases:** Weather-based automation, forecasting

---

### 10. **Database Query** (`database_query`)
Execute SELECT queries (read-only).

```json
{
  "query": "SELECT * FROM users WHERE created_at > '2024-01-01' LIMIT 100"
}
```

**Returns:**
```json
{
  "rows_count": 50,
  "results": [...]
}
```

**Restrictions:**
- SELECT queries only (read-only)
- No DDL/DML operations
- Rate Limit: 20/minute
- **Disabled by default** for security

**Use Cases:** Data analysis, reporting, statistics

---

## 🔧 Tool Configuration

### Tool Model
```php
Tool::create([
    'name' => 'web_search',
    'display_name' => 'Web Search',
    'description' => 'Search the internet',
    'category' => 'search',
    'parameters' => [...],  // JSON schema
    'return_schema' => [...],
    'icon_url' => 'search',
    'is_active' => true,
    'requires_api_key' => false,
    'rate_limit' => 100,
]);
```

### Agent Tool Attachment
```php
$agent->tools()->attach($tool->id, [
    'configuration' => [
        'api_key' => 'xxx',
        'region' => 'us-west',
    ],
    'permissions' => [
        'allowed_resources' => ['docs/*', 'public/*'],
    ],
    'sequence' => 0,
    'is_enabled' => true,
]);
```

---

## 🚀 API Endpoints

### Get Available Tools
```
GET /api/projects/{project}/tools
```

**Response:**
```json
{
  "data": [
    {
      "id": "ulid",
      "name": "web_search",
      "display_name": "Web Search",
      "category": "search",
      "icon_url": "search",
      "parameters": {...}
    }
  ],
  "categories": ["search", "file", "api", "code", "utility"]
}
```

---

### Get Tool Details
```
GET /api/projects/{project}/tools/{toolName}
```

---

### Execute Tool
```
POST /api/projects/{project}/tools/{toolName}/execute

{
  "agent_id": "ulid",
  "query": "Laravel best practices",
  "limit": 5
}
```

---

### Test Tool
```
POST /api/projects/{project}/tools/{toolName}/test

{
  "parameters": {
    "query": "test search"
  }
}
```

---

### Get Tool Guidelines
```
GET /api/projects/{project}/tools/{toolName}/guidelines
```

**Returns:**
- Description and usage guidelines
- Parameter specifications
- Expected return schema
- Best practices
- Usage examples

---

### Attach Tool to Agent
```
POST /api/projects/{project}/agents/{agent}/tools

{
  "tool_id": "ulid",
  "configuration": {
    "api_key": "xxx"
  },
  "permissions": {
    "allowed_resources": ["docs/*"]
  },
  "sequence": 0
}
```

---

### Get Agent Tools
```
GET /api/projects/{project}/agents/{agent}/tools
```

**Response:**
```json
{
  "data": [
    {
      "id": "ulid",
      "name": "web_search",
      "display_name": "Web Search",
      "is_enabled": true,
      "configuration": {...},
      "permissions": {...},
      "sequence": 0
    }
  ]
}
```

---

### Update Agent Tool
```
PUT /api/projects/{project}/agents/{agent}/tools/{tool}

{
  "configuration": {"api_key": "new_key"},
  "is_enabled": true,
  "sequence": 1
}
```

---

### Remove Tool from Agent
```
DELETE /api/projects/{project}/agents/{agent}/tools/{tool}
```

---

## 🔐 Security Considerations

### Rate Limiting
Each tool has a configurable rate limit (per minute):
- Web Search: 100/min
- Web Fetch: 50/min
- File Operations: 100-200/min
- API Call: 150/min
- Code Execute: 50/min (timeout: 10s)
- Email: 30/min
- Database: 20/min (SELECT only)

### Access Control
- File operations: Scoped to agent's project
- API calls: Whitelist HTTP methods only
- Code execution: Sandboxed environment
- Database queries: SELECT only, no schema changes

### Timeout Protection
- Web operations: 10-15 seconds
- Code execution: 10 seconds
- API calls: Configurable (default 10s)

---

## 💻 Usage Examples

### Example 1: Search and Email Results
```php
$agent->tools()->attach(Tool::byName('web_search')->id);
$agent->tools()->attach(Tool::byName('send_email')->id);

// Trigger when someone mentions "research"
// Action 1: Execute web_search tool
// Action 2: Execute send_email tool with results
```

### Example 2: File Processing Pipeline
```php
$agent->tools()->attach(Tool::byName('file_read')->id);
$agent->tools()->attach(Tool::byName('code_execute')->id);
$agent->tools()->attach(Tool::byName('file_create')->id);

// Read CSV → Process with PHP → Create JSON report
```

### Example 3: API Integration
```php
$agent->tools()->attach(Tool::byName('api_call')->id, [
    'configuration' => [
        'base_url' => 'https://api.example.com',
        'api_key' => env('API_KEY'),
    ]
]);
```

### Example 4: Web Content Analysis
```php
$agent->tools()->attach(Tool::byName('web_fetch')->id);
$agent->tools()->attach(Tool::byName('code_execute')->id);

// Fetch webpage → Analyze with custom script
```

---

## 📊 Tool Execution Flow

```
User message in project conversation
    ↓
Agent trigger matches (keyword, regex, event, etc.)
    ↓
Agent actions execute in sequence
    ↓
If action uses tool:
    - Validate tool is attached and enabled
    - Check rate limit
    - Execute tool with parameters
    - Log execution with results
    - Continue to next action
    ↓
Return response (optional auto-message)
```

---

## 🛠️ Implementation Guide

### 1. Enable Tools for an Agent
```php
// Get agent
$agent = Agent::find($agentId);

// Attach web search tool
$agent->tools()->attach(
    Tool::byName('web_search')->id,
    ['configuration' => [], 'sequence' => 0]
);

// Attach email tool (sequence 1 - runs after search)
$agent->tools()->attach(
    Tool::byName('send_email')->id,
    ['configuration' => [], 'sequence' => 1]
);
```

### 2. Configure Tool Permissions
```php
$agent->tools()->updateExistingPivot(
    $toolId,
    [
        'permissions' => [
            'allowed_resources' => [
                'documents/*',
                'public/*'
            ]
        ]
    ]
);
```

### 3. Execute Tool Manually
```php
$toolExecutor = app(ToolExecutorService::class);

$result = $toolExecutor->execute('web_search', [
    'query' => 'Laravel tips',
    'limit' => 5
], $agent);
```

### 4. Test Tool Before Activation
```bash
curl -X POST /api/projects/{project}/tools/web_search/test \
  -H "Authorization: Bearer token" \
  -d '{
    "parameters": {
      "query": "test"
    }
  }'
```

---

## 📈 Performance Optimization

### Caching
- Tool definitions cached (1 hour)
- Rate limit counters use Redis cache
- Query results cached where applicable

### Async Execution
Consider moving tool execution to queued jobs for long-running operations:

```php
// Instead of:
$result = $toolExecutor->execute('web_fetch', $params);

// Use:
ExecuteToolJob::dispatch($agent, 'web_fetch', $params);
```

---

## ⚠️ Troubleshooting

### Tool Not Found
- Verify tool name is correct
- Check tool is active: `Tool::byName('web_search')->is_active`

### Rate Limit Exceeded
- Wait 1 minute before retrying
- Check configuration for rate limits
- Consider async execution for bulk operations

### Execution Failed
- Check agent has permission for tool
- Verify parameters match schema
- Review execution logs: `$agent->executionLogs`

### File Operations Not Working
- Ensure agent is linked to project
- Verify storage permissions
- Check file size limits (100KB max)

---

## 🔮 Future Enhancements

- [ ] Webhook tools for external triggers
- [ ] Database write tools (with approval workflow)
- [ ] Image processing tools (resize, convert, analyze)
- [ ] PDF generation and parsing
- [ ] Video processing tools
- [ ] LLM integration for content generation
- [ ] OAuth for protected APIs
- [ ] Custom tool marketplace
- [ ] Tool versioning and updates
- [ ] Parallel tool execution

---

## 📚 Database Schema

### Tools Table
```sql
CREATE TABLE tools (
  id ULID PRIMARY KEY,
  name VARCHAR UNIQUE,
  display_name VARCHAR,
  description TEXT,
  category VARCHAR,
  parameters JSON,
  return_schema JSON,
  icon_url VARCHAR,
  is_active BOOLEAN,
  requires_api_key BOOLEAN,
  rate_limit INTEGER,
  configuration JSON,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Agent Tools Table (Pivot)
```sql
CREATE TABLE agent_tools (
  id ULID PRIMARY KEY,
  agent_id ULID,
  tool_id ULID,
  configuration JSON,
  permissions JSON,
  is_enabled BOOLEAN,
  sequence INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
)
```

---

**Last Updated:** January 2024
**Status:** Production Ready ✅
