# 📖 Agent Tools - Examples & Templates

## Complete Working Examples

---

## 1️⃣ Image Generation Examples

### Example 1: Product Visualization
```json
{
  "tool": "image_generate",
  "parameters": {
    "prompt": "Modern smartphone mockup, sleek design, professional product photography, white background, studio lighting",
    "style": "realistic",
    "size": "1024x1024",
    "count": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompt": "Modern smartphone mockup...",
    "filename": "generated_abc123.png",
    "url": "/storage/images/generated/generated_abc123.png",
    "style": "realistic",
    "size": "1024x1024",
    "created_at": "2024-01-16T10:30:00Z"
  }
}
```

### Example 2: Marketing Banner
```json
{
  "tool": "image_generate",
  "parameters": {
    "prompt": "Summer sale banner, vibrant colors, 50% OFF text, tropical theme, beach vibes",
    "style": "artistic",
    "size": "512x512",
    "count": 1
  }
}
```

### Example 3: Data Visualization
```json
{
  "tool": "image_generate",
  "parameters": {
    "prompt": "3D bar chart showing revenue growth, blue and green colors, clean style, transparent background",
    "style": "cartoon",
    "size": "1024x1024"
  }
}
```

### Example 4: UI Component Illustration
```json
{
  "tool": "image_generate",
  "parameters": {
    "prompt": "Dashboard interface mockup, dark theme, charts and metrics, modern flat design",
    "style": "realistic",
    "size": "1024x1024",
    "count": 3
  }
}
```

---

## 2️⃣ Data Analysis Examples

### Example 1: Sales Data Summary
```json
{
  "tool": "data_analysis",
  "parameters": {
    "data": [
      {
        "date": "2024-01-01",
        "revenue": 15000,
        "orders": 45,
        "customers": 38
      },
      {
        "date": "2024-01-02",
        "revenue": 18500,
        "orders": 52,
        "customers": 45
      },
      {
        "date": "2024-01-03",
        "revenue": 16200,
        "orders": 48,
        "customers": 41
      }
    ],
    "analysis_type": "summary"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis_type": "summary",
    "rows_analyzed": 3,
    "analysis": {
      "total_records": 3,
      "fields": ["date", "revenue", "orders", "customers"],
      "field_stats": {
        "revenue": {
          "min": 15000,
          "max": 18500,
          "avg": 16566.67,
          "count": 3
        },
        "orders": {
          "min": 45,
          "max": 52,
          "avg": 48.33,
          "count": 3
        }
      }
    }
  }
}
```

### Example 2: Statistical Analysis
```json
{
  "tool": "data_analysis",
  "parameters": {
    "data": [
      {"test_score": 85, "study_hours": 5, "performance": "A"},
      {"test_score": 92, "study_hours": 7, "performance": "A"},
      {"test_score": 78, "study_hours": 3, "performance": "B"},
      {"test_score": 88, "study_hours": 6, "performance": "A"},
      {"test_score": 72, "study_hours": 2, "performance": "C"}
    ],
    "analysis_type": "statistical"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis_type": "statistical",
    "rows_analyzed": 5,
    "analysis": {
      "test_score": {
        "mean": 83.0,
        "median": 85.0,
        "std_dev": 8.62,
        "count": 5
      },
      "study_hours": {
        "mean": 4.6,
        "median": 5.0,
        "std_dev": 2.19,
        "count": 5
      }
    }
  }
}
```

### Example 3: Correlation Analysis
```json
{
  "tool": "data_analysis",
  "parameters": {
    "data": [
      {"temperature": 20, "ice_cream_sales": 150},
      {"temperature": 25, "ice_cream_sales": 250},
      {"temperature": 30, "ice_cream_sales": 400},
      {"temperature": 15, "ice_cream_sales": 100},
      {"temperature": 28, "ice_cream_sales": 350}
    ],
    "analysis_type": "correlation"
  }
}
```

---

## 3️⃣ Text Processing Examples

### Example 1: Document Summarization
```json
{
  "tool": "text_process",
  "parameters": {
    "text": "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. These models enable computers to learn from data without being explicitly programmed. Deep learning, a subfield of machine learning, uses neural networks with multiple layers. Natural language processing applies these techniques to human language. Computer vision applies machine learning to image processing.",
    "operation": "summarize",
    "options": {
      "sentences": 2
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "summarize",
    "text_length": 335,
    "original_length": 335,
    "summary_length": 145,
    "sentences_in_original": 5,
    "sentences_in_summary": 2,
    "summary": "Machine learning is a subset of artificial intelligence that focuses on algorithms and statistical models. Deep learning, a subfield of machine learning, uses neural networks with multiple layers."
  }
}
```

### Example 2: Sentiment Analysis
```json
{
  "tool": "text_process",
  "parameters": {
    "text": "I absolutely love this product! It's amazing and works perfectly. Great quality and excellent customer service. Highly recommend!",
    "operation": "sentiment"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "sentiment",
    "text_length": 117,
    "sentiment": "positive",
    "confidence": 0.67,
    "positive_keywords": 4,
    "negative_keywords": 0
  }
}
```

### Example 3: Entity Extraction
```json
{
  "tool": "text_process",
  "parameters": {
    "text": "Contact John Smith at john.smith@company.com or visit https://example.com. Call (555) 123-4567 for more information. We're located in New York City.",
    "operation": "entities"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "entities",
    "text_length": 154,
    "emails": ["john.smith@company.com"],
    "urls": ["https://example.com"],
    "numbers": ["555", "123", "4567"],
    "capitalized_words": ["John", "Smith", "New York City"]
  }
}
```

### Example 4: Keyword Extraction
```json
{
  "tool": "text_process",
  "parameters": {
    "text": "Artificial intelligence and machine learning are transforming industries. AI algorithms process data efficiently. Machine learning models improve with more data. AI systems solve complex problems.",
    "operation": "keywords",
    "options": {
      "limit": 8
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "keywords",
    "text_length": 216,
    "keywords": ["artificial", "intelligence", "machine", "learning", "algorithms", "data", "models", "systems"],
    "word_frequency": {
      "artificial": 1,
      "intelligence": 1,
      "machine": 2,
      "learning": 2,
      "algorithms": 1
    }
  }
}
```

### Example 5: Word Count
```json
{
  "tool": "text_process",
  "parameters": {
    "text": "Hello world. This is a test. Word counting is important.",
    "operation": "wordcount"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "wordcount",
    "text_length": 53,
    "total_words": 9,
    "total_characters": 53,
    "total_characters_no_spaces": 45,
    "average_word_length": 5.0,
    "sentences": 3,
    "paragraphs": 1
  }
}
```

---

## 4️⃣ Schedule Task Examples

### Example 1: Send Daily Report Tomorrow
```json
{
  "tool": "schedule_task",
  "parameters": {
    "task_name": "daily_sales_report",
    "execute_at": "2024-01-17 09:00:00",
    "task_data": {
      "recipient": "manager@company.com",
      "report_type": "sales_summary",
      "include_charts": true
    },
    "tool_name": "send_email"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task_name": "daily_sales_report",
    "scheduled_for": "2024-01-17T09:00:00Z",
    "status": "scheduled",
    "task_data": {
      "recipient": "manager@company.com",
      "report_type": "sales_summary",
      "include_charts": true
    }
  }
}
```

### Example 2: Batch Processing in 2 Hours
```json
{
  "tool": "schedule_task",
  "parameters": {
    "task_name": "batch_data_processing",
    "execute_at": "in 2 hours",
    "task_data": {
      "dataset": "Q1_data.csv",
      "operations": ["clean", "validate", "analyze"],
      "output_format": "json"
    },
    "tool_name": "data_analysis"
  }
}
```

### Example 3: Weekly Maintenance Window
```json
{
  "tool": "schedule_task",
  "parameters": {
    "task_name": "weekly_cleanup",
    "execute_at": "every Sunday at 02:00 AM",
    "task_data": {
      "cleanup_type": "old_logs",
      "days_to_keep": 30,
      "backup_first": true
    },
    "tool_name": "file_delete"
  }
}
```

---

## 5️⃣ Knowledge Search Examples

### Example 1: Find Database Optimization Tips
```json
{
  "tool": "knowledge_search",
  "parameters": {
    "query": "database query optimization indexing",
    "limit": 5,
    "threshold": 0.6
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "database query optimization indexing",
    "results_found": 3,
    "results": [
      {
        "id": "mem_001",
        "content": "Database indexing improves query performance. Use B-tree indexes for range queries. Composite indexes for multiple columns.",
        "similarity": 0.94,
        "created_at": "2024-01-10T10:00:00Z",
        "context": "performance_optimization"
      },
      {
        "id": "mem_002",
        "content": "Query optimization involves rewriting queries to be more efficient.",
        "similarity": 0.85,
        "created_at": "2024-01-12T14:30:00Z",
        "context": "database_tips"
      }
    ],
    "threshold_used": 0.6
  }
}
```

### Example 2: Customer Service Knowledge Lookup
```json
{
  "tool": "knowledge_search",
  "parameters": {
    "query": "how to handle angry customer complaints",
    "limit": 3,
    "threshold": 0.65
  }
}
```

### Example 3: Technical Problem Resolution
```json
{
  "tool": "knowledge_search",
  "parameters": {
    "query": "SSL certificate error HTTPS connection failed",
    "limit": 10,
    "threshold": 0.7
  }
}
```

---

## 🎯 Workflow Templates

### Template 1: Automated Report Generation Workflow
```bash
Step 1: data_analysis
- Input: CSV data
- Output: Statistical analysis

Step 2: image_generate
- Input: Analysis results
- Output: Chart visualization

Step 3: text_process
- Input: Analysis results
- Output: Summary text

Step 4: file_create
- Input: Combined results
- Output: Report document

Step 5: send_email
- Input: Report file
- Output: Delivered email

Step 6: schedule_task
- Input: Recurring schedule
- Output: Automated daily reports
```

### Template 2: Content Processing Pipeline
```bash
Step 1: web_fetch
- Input: Article URL
- Output: Article content

Step 2: text_process (summarize)
- Input: Article content
- Output: Summary

Step 3: text_process (keywords)
- Input: Article content
- Output: Keywords

Step 4: text_process (entities)
- Input: Article content
- Output: Extracted entities

Step 5: knowledge_search
- Input: Keywords + Entities
- Output: Related articles

Step 6: file_create
- Input: All results
- Output: Knowledge document
```

### Template 3: Market Intelligence Workflow
```bash
Step 1: web_search
- Input: Market keywords
- Output: Search results

Step 2: web_fetch
- Input: Result URLs
- Output: Article content

Step 3: data_analysis
- Input: Extracted data
- Output: Market trends

Step 4: text_process (sentiment)
- Input: Market comments
- Output: Sentiment scores

Step 5: image_generate
- Input: Trend data
- Output: Visualization

Step 6: schedule_task
- Input: Repeat daily
- Output: Automated monitoring
```

### Template 4: AI Content Creation Workflow
```bash
Step 1: knowledge_search
- Input: Topic
- Output: Related knowledge

Step 2: text_process (summarize)
- Input: Knowledge
- Output: Key points

Step 3: image_generate
- Input: Topic description
- Output: Illustration

Step 4: code_execute
- Input: Template + data
- Output: Generated HTML

Step 5: file_create
- Input: HTML
- Output: Blog post

Step 6: api_call
- Input: Post details
- Output: Published online
```

---

## 🔌 Integration Examples

### React Component Example
```tsx
import AgentToolExecutor from '@/components/Tools/AgentToolExecutor';
import { useState } from 'react';

export function ReportGenerator() {
  const [report, setReport] = useState(null);

  const handleToolSuccess = (result) => {
    if (result.data.analysis) {
      setReport({
        analysis: result.data.analysis,
        timestamp: new Date(),
        status: 'ready'
      });
    }
  };

  return (
    <div>
      <AgentToolExecutor
        projectId="current-project"
        onSuccess={handleToolSuccess}
      />
      {report && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <pre>{JSON.stringify(report.analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Laravel Service Example
```php
use App\Services\ToolExecutorService;

class ReportService {
    protected $toolExecutor;

    public function generateReport(Agent $agent) {
        // Step 1: Analyze data
        $analysis = $this->toolExecutor->execute('data_analysis', [
            'data' => $this->fetchData(),
            'analysis_type' => 'statistical'
        ], $agent);

        // Step 2: Generate summary
        $summary = $this->toolExecutor->execute('text_process', [
            'text' => json_encode($analysis['data']),
            'operation' => 'summarize'
        ]);

        // Step 3: Create image
        $image = $this->toolExecutor->execute('image_generate', [
            'prompt' => 'Chart showing ' . json_encode($analysis['data']),
            'style' => 'realistic',
            'size' => '1024x1024'
        ], $agent);

        return [
            'analysis' => $analysis,
            'summary' => $summary,
            'image' => $image
        ];
    }
}
```

---

## ✅ Validation Checklist

Before running workflows:
- [ ] All required parameters included
- [ ] Parameters match expected types
- [ ] No rate limits exceeded
- [ ] Agent context provided (if required)
- [ ] External APIs configured
- [ ] File paths valid
- [ ] Timestamps in future (for scheduling)
- [ ] Data format correct

---

## 📊 Performance Optimization Tips

1. **Batch Operations**: Process multiple items at once
2. **Cache Results**: Store recent results (15+ minutes)
3. **Async Tasks**: Use scheduling for long operations
4. **Parameter Optimization**: Reduce data size when possible
5. **Monitor Usage**: Track rate limits and performance

---

## 🆘 Debugging Checklist

If tool fails:
1. ✓ Check response status code
2. ✓ Review error message
3. ✓ Validate parameters
4. ✓ Check rate limits
5. ✓ Verify authentication
6. ✓ Check API keys
7. ✓ Review logs
8. ✓ Test with simpler input

---

**Version**: 1.0  
**Last Updated**: 2024-01-16
