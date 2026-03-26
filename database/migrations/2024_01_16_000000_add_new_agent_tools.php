<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Uid\Ulid;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 5 new powerful tools to the tools table
        $tools = [
            [
                'name' => 'image_generate',
                'display_name' => 'Image Generation',
                'description' => 'Generate, create, and edit images using AI models. Supports multiple styles and sizes.',
                'category' => 'media',
                'icon_url' => 'image',
                'parameters' => json_encode([
                    'prompt' => ['type' => 'string', 'description' => 'Detailed image description', 'required' => true],
                    'style' => ['type' => 'string', 'enum' => ['realistic', 'artistic', 'cartoon', 'abstract'], 'default' => 'realistic'],
                    'size' => ['type' => 'string', 'enum' => ['256x256', '512x512', '1024x1024'], 'default' => '512x512'],
                    'count' => ['type' => 'integer', 'min' => 1, 'max' => 4, 'default' => 1],
                ]),
                'return_schema' => json_encode([
                    'prompt' => 'string',
                    'filename' => 'string',
                    'url' => 'string',
                    'style' => 'string',
                    'size' => 'string',
                    'created_at' => 'timestamp',
                ]),
                'rate_limit' => 20,
                'requires_api_key' => false,
                'is_active' => true,
            ],
            [
                'name' => 'data_analysis',
                'display_name' => 'Data Analysis',
                'description' => 'Analyze datasets and generate insights. Supports summary, correlation, trend, and statistical analysis.',
                'category' => 'analytics',
                'icon_url' => 'bar-chart',
                'parameters' => json_encode([
                    'data' => ['type' => 'array|string', 'description' => 'JSON array or CSV data', 'required' => true],
                    'analysis_type' => ['type' => 'string', 'enum' => ['summary', 'correlation', 'trend', 'statistical'], 'default' => 'summary'],
                    'columns' => ['type' => 'array', 'description' => 'Specific columns to analyze (optional)'],
                ]),
                'return_schema' => json_encode([
                    'analysis_type' => 'string',
                    'rows_analyzed' => 'integer',
                    'analysis' => 'object',
                    'timestamp' => 'timestamp',
                ]),
                'rate_limit' => 50,
                'requires_api_key' => false,
                'is_active' => true,
            ],
            [
                'name' => 'text_process',
                'display_name' => 'Text Processing',
                'description' => 'Natural Language Processing: summarization, sentiment analysis, entity extraction, keywords, translation.',
                'category' => 'text',
                'icon_url' => 'type',
                'parameters' => json_encode([
                    'text' => ['type' => 'string', 'description' => 'Text to process', 'required' => true],
                    'operation' => ['type' => 'string', 'enum' => ['summarize', 'sentiment', 'entities', 'translate', 'keywords', 'wordcount'], 'default' => 'summarize'],
                    'options' => ['type' => 'object', 'description' => 'Operation-specific options'],
                ]),
                'return_schema' => json_encode([
                    'operation' => 'string',
                    'text_length' => 'integer',
                    'result' => 'object',
                ]),
                'rate_limit' => 100,
                'requires_api_key' => false,
                'is_active' => true,
            ],
            [
                'name' => 'schedule_task',
                'display_name' => 'Schedule Task',
                'description' => 'Schedule delayed task execution. Supports any tool execution with future timestamps.',
                'category' => 'automation',
                'icon_url' => 'clock',
                'parameters' => json_encode([
                    'task_name' => ['type' => 'string', 'description' => 'Unique task identifier', 'required' => true],
                    'execute_at' => ['type' => 'string', 'description' => 'ISO 8601 timestamp or human-readable time', 'required' => true],
                    'task_data' => ['type' => 'object', 'description' => 'Data for task execution'],
                    'tool_name' => ['type' => 'string', 'description' => 'Tool to execute'],
                ]),
                'return_schema' => json_encode([
                    'task_name' => 'string',
                    'scheduled_for' => 'timestamp',
                    'task_data' => 'object',
                    'status' => 'string',
                ]),
                'rate_limit' => 50,
                'requires_api_key' => false,
                'is_active' => true,
            ],
            [
                'name' => 'knowledge_search',
                'display_name' => 'Knowledge Search',
                'description' => 'Semantic search in agent memory and knowledge base. Returns relevant context with similarity scores.',
                'category' => 'search',
                'icon_url' => 'search',
                'parameters' => json_encode([
                    'query' => ['type' => 'string', 'description' => 'Search query', 'required' => true],
                    'limit' => ['type' => 'integer', 'min' => 1, 'max' => 20, 'default' => 5],
                    'threshold' => ['type' => 'number', 'min' => 0, 'max' => 1, 'default' => 0.6],
                ]),
                'return_schema' => json_encode([
                    'query' => 'string',
                    'results_found' => 'integer',
                    'results' => 'array',
                    'threshold_used' => 'number',
                ]),
                'rate_limit' => 100,
                'requires_api_key' => false,
                'is_active' => true,
            ],
        ];

        // Insert tools (using raw insert to avoid model loading during migration)
        foreach ($tools as $tool) {
                $id = Ulid::generate();

            DB::table('tools')->updateOrInsert(
                ['name' => $tool['name'],'id'=>$id],
                array_merge($tool, [
                    'created_at' => now(),
                    'id'=>$id,
                    'updated_at' => now(),
                ])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tools')->whereIn('name', [
            'image_generate',
            'data_analysis',
            'text_process',
            'schedule_task',
            'knowledge_search',
        ])->delete();
    }
};
