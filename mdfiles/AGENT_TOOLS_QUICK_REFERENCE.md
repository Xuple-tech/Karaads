# 🚀 Agent Tools Quick Reference

## New Tools at a Glance

| Tool | Purpose | Rate Limit | Key Features |
|------|---------|-----------|--------------|
| 🖼️ **image_generate** | Create AI images | 20/min | Multiple styles, resizable, batch capable |
| 📊 **data_analysis** | Analyze datasets | 50/min | Summary, correlation, trend, statistical |
| 📝 **text_process** | NLP operations | 100/min | Summarize, sentiment, entities, keywords |
| ⏰ **schedule_task** | Schedule tasks | 50/min | Future execution, customizable data |
| 🔍 **knowledge_search** | Semantic search | 100/min | Similarity matching, context aware |

---

## API Endpoints

### List All Tools
```bash
GET /api/projects/{projectId}/tools
```

### Get Tool Details
```bash
GET /api/projects/{projectId}/tools/{toolName}
```

### Execute Tool
```bash
POST /api/projects/{projectId}/tools/{toolName}/execute
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

### Test Tool
```bash
POST /api/projects/{projectId}/tools/{toolName}/test
Content-Type: application/json

{
  "parameters": {
    "param1": "test_value"
  }
}
```

### Get Guidelines
```bash
GET /api/projects/{projectId}/tools/{toolName}/guidelines
```

---

## Common Patterns

### 1. Image Generation
```bash
curl -X POST /api/projects/123/tools/image_generate/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A sunset over mountains",
    "style": "realistic",
    "size": "1024x1024"
  }'
```

### 2. Data Analysis
```bash
curl -X POST /api/projects/123/tools/data_analysis/execute \
  -H "Content-Type: application/json" \
  -d '{
    "data": "[{\"name\":\"Alice\",\"score\":85},{\"name\":\"Bob\",\"score\":92}]",
    "analysis_type": "statistical"
  }'
```

### 3. Text Processing
```bash
curl -X POST /api/projects/123/tools/text_process/execute \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here",
    "operation": "summarize"
  }'
```

### 4. Schedule Task
```bash
curl -X POST /api/projects/123/tools/schedule_task/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task_name": "daily_report",
    "execute_at": "2024-12-25 10:00:00",
    "task_data": {"report_type": "summary"}
  }'
```

### 5. Knowledge Search
```bash
curl -X POST /api/projects/123/tools/knowledge_search/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database optimization",
    "limit": 5,
    "threshold": 0.6
  }'
```

---

## React Component Usage

### Basic Integration
```tsx
import AgentToolExecutor from '@/components/Tools/AgentToolExecutor';

function MyComponent() {
  return (
    <AgentToolExecutor 
      projectId="proj-123"
      agentId="agent-456"
      onSuccess={(result) => {
        console.log('Tool executed:', result);
      }}
    />
  );
}
```

### With Tool Selection Handler
```tsx
<AgentToolExecutor 
  projectId="proj-123"
  onSuccess={(result) => {
    if (result.data.image_url) {
      // Handle image
    } else if (result.data.analysis) {
      // Handle analysis
    }
  }}
/>
```

---

## Error Handling

### Common Status Codes
- **200**: Success
- **400**: Invalid parameters
- **401**: Authentication required
- **403**: Permission denied
- **404**: Tool not found
- **429**: Rate limit exceeded
- **500**: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Rate limit exceeded for tool: image_generate",
  "data": null,
  "timestamp": "2024-01-16T10:30:00Z"
}
```

---

## Tool Combinations

### Content Summary + Email
```
1. web_fetch → Get content
2. text_process (summarize) → Create summary
3. send_email → Deliver
```

### Analysis + Visualization
```
1. database_query → Get data
2. data_analysis → Analyze
3. image_generate → Create chart
4. file_create → Save results
```

### Knowledge Management
```
1. knowledge_search → Find related
2. text_process → Extract info
3. file_create → Store
```

---

## Performance Tips

1. **Batch Operations**: Group related tasks
2. **Cache Results**: Reuse analysis within time window
3. **Async Execution**: Use scheduling for heavy operations
4. **Parameter Validation**: Check before execution
5. **Monitor Rate Limits**: Spread requests over time

---

## Debugging

### Enable Debug Mode
```php
// In ToolExecutorService
Log::debug('Tool execution', [
    'tool' => $toolName,
    'params' => $parameters,
    'result' => $result,
]);
```

### Check Execution History
```bash
GET /api/projects/{projectId}/agents/{agentId}/tool-history
```

### Test Tool Directly
```bash
POST /api/projects/{projectId}/tools/{toolName}/test
{
  "parameters": { /* test params */ }
}
```

---

## Limits & Quotas

### Rate Limits (per minute)
- image_generate: 20
- data_analysis: 50
- text_process: 100
- schedule_task: 50
- knowledge_search: 100

### Resource Limits
- File size: 100KB
- Image size: 1024x1024 max
- Dataset rows: Unlimited (performance dependent)
- Text length: Unlimited (performance dependent)
- Scheduled tasks: 1000 max per agent

---

## Configuration

### Environment Variables
```env
IMAGE_GENERATION_API_KEY=your_key
IMAGE_GENERATION_MODEL=stable-diffusion-2
SCHEDULING_BACKEND=redis
KNOWLEDGE_BASE_SIMILARITY_THRESHOLD=0.6
```

### Tool Configuration
```php
// In Tool model
Tool::where('name', 'image_generate')->update([
    'configuration' => [
        'api_key' => env('IMAGE_GENERATION_API_KEY'),
        'model' => env('IMAGE_GENERATION_MODEL'),
    ]
]);
```

---

## Monitoring

### Key Metrics
- Execution count per tool
- Average execution time
- Error rate
- Cache hit rate
- Rate limit hits

### Logging
```php
Log::channel('tools')->info('Tool executed', [
    'tool' => $tool->name,
    'agent_id' => $agent->id,
    'duration_ms' => $duration,
    'success' => $result['success'],
]);
```

---

## Best Practices

✅ **DO:**
- Validate parameters before execution
- Handle errors gracefully
- Monitor rate limits
- Cache results when possible
- Use appropriate analysis type
- Schedule heavy operations
- Log execution details

❌ **DON'T:**
- Bypass authentication
- Ignore rate limits
- Send invalid data formats
- Schedule past timestamps
- Process sensitive data unsafely
- Nest too many tool calls
- Leave error messages generic

---

## Troubleshooting Matrix

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Error | Rate limit exceeded | Wait or reduce frequency |
| 400 Error | Invalid parameters | Check parameter format |
| Tool returns empty | No matching data | Lower threshold/adjust query |
| Slow execution | Large dataset | Optimize query/filter |
| Image fails | API issue | Check API key and quota |

---

## Migration Checklist

- [ ] Run migration to register tools
- [ ] Update routes if needed
- [ ] Add frontend components
- [ ] Configure API keys
- [ ] Test each tool
- [ ] Update documentation
- [ ] Train team
- [ ] Monitor performance
- [ ] Create playbooks

---

## Resources

- **Full Documentation**: `AGENT_TOOLS_REACH_IMPLEMENTATION.md`
- **API Docs**: `/api/docs/tools`
- **Component Props**: `AgentToolExecutor.tsx`
- **Examples**: Examples in each tool section above

---

**Last Updated**: 2024-01-16  
**Version**: 1.0
