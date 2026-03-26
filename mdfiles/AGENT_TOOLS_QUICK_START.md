# ⚡ Agent Tools - Quick Start (5 Minutes)

## 🎯 TL;DR

**5 new tools added to agents** • **15 total tools now** • **Ready to use immediately**

---

## 1️⃣ Install (1 minute)

```bash
# Run migration to register tools
php artisan migrate

# Verify installation
php artisan tinker
Tool::where('category', 'media')->orWhere('category', 'analytics')->count()
# Should return: 5
```

---

## 2️⃣ Use in React (1 minute)

```tsx
import AgentToolExecutor from '@/components/Tools/AgentToolExecutor';

export function MyAgent() {
  return (
    <AgentToolExecutor 
      projectId="proj-123"
      agentId="agent-456"
      onSuccess={(result) => console.log(result)}
    />
  );
}
```

---

## 3️⃣ Call via API (1 minute)

```bash
# Get all tools
curl http://localhost:8000/api/projects/123/tools

# Generate an image
curl -X POST http://localhost:8000/api/projects/123/tools/image_generate/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "style": "realistic",
    "size": "512x512"
  }'

# Analyze data
curl -X POST http://localhost:8000/api/projects/123/tools/data_analysis/execute \
  -H "Content-Type: application/json" \
  -d '{
    "data": "[{\"score\":85},{\"score\":92}]",
    "analysis_type": "summary"
  }'

# Process text
curl -X POST http://localhost:8000/api/projects/123/tools/text_process/execute \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here",
    "operation": "summarize"
  }'
```

---

## 📚 The 5 New Tools

### 1. 🖼️ Image Generation
```json
{
  "tool": "image_generate",
  "prompt": "A cat wearing sunglasses",
  "style": "cartoon",
  "size": "512x512"
}
```

### 2. 📊 Data Analysis
```json
{
  "tool": "data_analysis",
  "data": "[{\"age\":25,\"score\":85}]",
  "analysis_type": "statistical"
}
```

### 3. 📝 Text Processing
```json
{
  "tool": "text_process",
  "text": "Long text...",
  "operation": "keywords"
}
```

### 4. ⏰ Schedule Task
```json
{
  "tool": "schedule_task",
  "task_name": "report",
  "execute_at": "2024-12-25 10:00:00"
}
```

### 5. 🔍 Knowledge Search
```json
{
  "tool": "knowledge_search",
  "query": "machine learning",
  "limit": 5
}
```

---

## 🚀 Common Scenarios

### Scenario 1: Generate & Store Image
```tsx
const handleGenerate = async () => {
  const result = await fetch('/api/projects/123/tools/image_generate/execute', {
    method: 'POST',
    body: JSON.stringify({
      prompt: 'Modern dashboard mockup',
      style: 'realistic',
      size: '1024x1024'
    })
  }).then(r => r.json());
  
  // Use result.data.url for the image
};
```

### Scenario 2: Analyze CSV Data
```tsx
const handleAnalyze = async () => {
  const csvData = [
    { month: 'Jan', revenue: 15000, profit: 5000 },
    { month: 'Feb', revenue: 18000, profit: 6500 },
  ];
  
  const result = await fetch('/api/projects/123/tools/data_analysis/execute', {
    method: 'POST',
    body: JSON.stringify({
      data: JSON.stringify(csvData),
      analysis_type: 'statistical'
    })
  }).then(r => r.json());
};
```

### Scenario 3: Summarize Article
```tsx
const handleSummarize = async (articleText) => {
  const result = await fetch('/api/projects/123/tools/text_process/execute', {
    method: 'POST',
    body: JSON.stringify({
      text: articleText,
      operation: 'summarize',
      options: { sentences: 3 }
    })
  }).then(r => r.json());
  
  return result.data.summary;
};
```

### Scenario 4: Extract Keywords
```tsx
const handleExtractKeywords = async (text) => {
  const result = await fetch('/api/projects/123/tools/text_process/execute', {
    method: 'POST',
    body: JSON.stringify({
      text: text,
      operation: 'keywords',
      options: { limit: 5 }
    })
  }).then(r => r.json());
  
  return result.data.keywords;
};
```

### Scenario 5: Send Email Tomorrow
```tsx
const handleScheduleEmail = async () => {
  await fetch('/api/projects/123/tools/schedule_task/execute', {
    method: 'POST',
    body: JSON.stringify({
      task_name: 'send_daily_report',
      execute_at: '2024-12-25 09:00:00',
      task_data: {
        recipient: 'user@example.com',
        subject: 'Daily Report'
      },
      tool_name: 'send_email'
    })
  }).then(r => r.json());
};
```

---

## 🎯 Rate Limits

| Tool | Limit | Advice |
|------|-------|--------|
| image_generate | 20/min | Space out requests |
| data_analysis | 50/min | Good for batch |
| text_process | 100/min | No worries |
| schedule_task | 50/min | Good for automation |
| knowledge_search | 100/min | No worries |

---

## ⚙️ Config (Optional)

```env
# Set in .env if using external APIs
IMAGE_GENERATION_API_KEY=your_key
IMAGE_GENERATION_MODEL=stable-diffusion-2
SCHEDULING_BACKEND=redis
KNOWLEDGE_SIMILARITY_THRESHOLD=0.6
```

---

## 📖 Learn More

- **Full Guide**: `AGENT_TOOLS_REACH_IMPLEMENTATION.md`
- **Quick Ref**: `AGENT_TOOLS_QUICK_REFERENCE.md`
- **Examples**: `AGENT_TOOLS_EXAMPLES_TEMPLATES.md`

---

## ✅ Verify It Works

```bash
# 1. Check tools registered
php artisan tinker
>>> Tool::count()  # Should be 15

# 2. Test API
curl http://localhost:8000/api/projects/123/tools

# 3. Test execution
curl -X POST http://localhost:8000/api/projects/123/tools/text_process/test \
  -H "Content-Type: application/json" \
  -d '{"parameters":{"text":"test","operation":"wordcount"}}'

# 4. Should return 200 with result
```

---

## 🆘 Troubleshoot

| Problem | Fix |
|---------|-----|
| Tools not showing | Run migration: `php artisan migrate` |
| API returns 404 | Check project ID and tool name |
| Rate limit hit | Wait a minute before next request |
| Component errors | Clear cache: `php artisan cache:clear` |

---

## 🎓 Next Steps

1. ✅ Run migration
2. ✅ Test each tool via API
3. ✅ Add component to your page
4. ✅ Create first workflow
5. ✅ Monitor usage
6. ✅ Optimize parameters

---

## 💡 Pro Tips

1. **Batch similar operations** to optimize rate limits
2. **Cache results** for 15+ minutes
3. **Use scheduling** for heavy operations
4. **Combine tools** for powerful workflows
5. **Monitor execution** for optimization

---

## 📞 Support

Stuck? Check:
1. Documentation in linked files
2. Examples section
3. API response errors
4. Rate limit status

---

**That's it! You're ready to use the new agent tools.** 🚀

*Time to read: 5 minutes*  
*Time to implement: 10 minutes*  
*Time to see results: Instantly*
