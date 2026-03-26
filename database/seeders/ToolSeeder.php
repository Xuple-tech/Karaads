<?php

namespace Database\Seeders;

use App\Models\Tool;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tools = [
            [
                'name' => 'web_search',
                'display_name' => 'Web Search',
                'description' => 'Search the internet for information using DuckDuckGo',
                'category' => 'search',
                'parameters' => [
                    'query' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Search query',
                    ],
                    'limit' => [
                        'type' => 'integer',
                        'required' => false,
                        'default' => 5,
                        'description' => 'Number of results to return (1-10)',
                    ],
                ],
                'return_schema' => [
                    'results' => [
                        'type' => 'array',
                        'items' => [
                            'title' => 'string',
                            'url' => 'string',
                            'snippet' => 'string',
                        ],
                    ],
                ],
                'icon_url' => 'search',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 100,
            ],
            [
                'name' => 'web_fetch',
                'display_name' => 'Web Fetch',
                'description' => 'Fetch and extract content from a webpage',
                'category' => 'search',
                'parameters' => [
                    'url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'URL to fetch',
                    ],
                    'extract' => [
                        'type' => 'string',
                        'required' => false,
                        'enum' => ['text', 'html', 'metadata', 'all'],
                        'default' => 'text',
                        'description' => 'What to extract from page',
                    ],
                ],
                'return_schema' => [
                    'url' => 'string',
                    'title' => 'string',
                    'text' => 'string',
                    'metadata' => 'object',
                ],
                'icon_url' => 'download',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 50,
            ],
            [
                'name' => 'file_read',
                'display_name' => 'File Read',
                'description' => 'Read content from a file in project storage',
                'category' => 'file',
                'parameters' => [
                    'path' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'File path relative to project storage',
                    ],
                ],
                'return_schema' => [
                    'path' => 'string',
                    'size' => 'integer',
                    'content' => 'string',
                    'mime_type' => 'string',
                ],
                'icon_url' => 'file-text',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 200,
            ],
            [
                'name' => 'file_create',
                'display_name' => 'File Create',
                'description' => 'Create a new file in project storage',
                'category' => 'file',
                'parameters' => [
                    'path' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'File path to create',
                    ],
                    'content' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'File content',
                    ],
                    'overwrite' => [
                        'type' => 'boolean',
                        'required' => false,
                        'default' => false,
                        'description' => 'Overwrite if file exists',
                    ],
                ],
                'return_schema' => [
                    'path' => 'string',
                    'size' => 'integer',
                    'created_at' => 'timestamp',
                ],
                'icon_url' => 'file-plus',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 100,
            ],
            [
                'name' => 'file_delete',
                'display_name' => 'File Delete',
                'description' => 'Delete a file from project storage',
                'category' => 'file',
                'parameters' => [
                    'path' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'File path to delete',
                    ],
                ],
                'return_schema' => [
                    'path' => 'string',
                    'deleted_at' => 'timestamp',
                ],
                'icon_url' => 'trash-2',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 100,
            ],
            [
                'name' => 'api_call',
                'display_name' => 'API Call',
                'description' => 'Make HTTP requests to external APIs',
                'category' => 'api',
                'parameters' => [
                    'url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'API endpoint URL',
                    ],
                    'method' => [
                        'type' => 'string',
                        'required' => false,
                        'enum' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
                        'default' => 'GET',
                    ],
                    'headers' => [
                        'type' => 'object',
                        'required' => false,
                        'description' => 'HTTP headers',
                    ],
                    'body' => [
                        'type' => 'object',
                        'required' => false,
                        'description' => 'Request body (for POST, PUT, PATCH)',
                    ],
                    'timeout' => [
                        'type' => 'integer',
                        'required' => false,
                        'default' => 10,
                    ],
                ],
                'return_schema' => [
                    'status_code' => 'integer',
                    'body' => 'object|string',
                    'headers' => 'object',
                ],
                'icon_url' => 'send',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 150,
            ],
            [
                'name' => 'code_execute',
                'display_name' => 'Code Execute',
                'description' => 'Execute code in a sandboxed environment',
                'category' => 'code',
                'parameters' => [
                    'code' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Code to execute',
                    ],
                    'language' => [
                        'type' => 'string',
                        'required' => false,
                        'enum' => ['php', 'python', 'javascript', 'json'],
                        'default' => 'php',
                    ],
                ],
                'return_schema' => [
                    'output' => 'string',
                    'result' => 'mixed',
                    'stderr' => 'string',
                ],
                'icon_url' => 'code',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 50,
            ],
            [
                'name' => 'send_email',
                'display_name' => 'Send Email',
                'description' => 'Send emails from agent',
                'category' => 'utility',
                'parameters' => [
                    'to' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Recipient email address',
                    ],
                    'subject' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Email subject',
                    ],
                    'body' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Email body',
                    ],
                ],
                'return_schema' => [
                    'to' => 'string',
                    'subject' => 'string',
                    'sent_at' => 'timestamp',
                ],
                'icon_url' => 'mail',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 30,
            ],
            [
                'name' => 'get_weather',
                'display_name' => 'Get Weather',
                'description' => 'Get weather information for a location',
                'category' => 'utility',
                'parameters' => [
                    'location' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'City or location name',
                    ],
                ],
                'return_schema' => [
                    'location' => 'string',
                    'weather' => [
                        'temperature_2m' => 'float',
                        'weather_code' => 'integer',
                        'wind_speed_10m' => 'float',
                    ],
                ],
                'icon_url' => 'cloud',
                'is_active' => true,
                'requires_api_key' => false,
                'rate_limit' => 60,
            ],
            [
                'name' => 'database_query',
                'display_name' => 'Database Query',
                'description' => 'Execute SELECT queries on the database (read-only)',
                'category' => 'utility',
                'parameters' => [
                    'query' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'SQL SELECT query (SELECT only)',
                    ],
                ],
                'return_schema' => [
                    'rows_count' => 'integer',
                    'results' => 'array',
                ],
                'icon_url' => 'database',
                'is_active' => false, // Disabled by default for security
                'requires_api_key' => false,
                'rate_limit' => 20,
            ],
        ];

        foreach ($tools as $tool) {
            Tool::updateOrCreate(
                ['name' => $tool['name']],
                $tool
            );
        }
    }
}
