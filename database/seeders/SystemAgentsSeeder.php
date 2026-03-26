<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Agent;

class SystemAgentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $systemAgents = [
            [
                'name' => 'Code Assistant',
                'description' => 'AI-powered coding assistant that helps with code generation, debugging, and optimization.',
                'avatar_url' => '/images/agents/code-assistant.png',
                'type' => 'tool',
                'status' => 'active',
                'is_system_agent' => true,
                'visibility' => 'system',
                'capabilities' => [
                    'code_generation',
                    'code_review',
                    'debugging',
                    'optimization',
                    'documentation'
                ],
                'available_tools' => [
                    'code_analyzer',
                    'syntax_checker',
                    'formatter',
                    'linter',
                    'test_generator'
                ],
                'custom_instructions' => 'You are a professional coding assistant. Help users write clean, efficient, and well-documented code. Always follow best practices and provide explanations for your suggestions.',
                'configuration' => [
                    'max_response_length' => 2000,
                    'include_examples' => true,
                    'suggest_improvements' => true
                ]
            ],
            [
                'name' => 'Data Analyst',
                'description' => 'Specialized agent for data analysis, visualization, and insights generation.',
                'avatar_url' => '/images/agents/data-analyst.png',
                'type' => 'tool',
                'status' => 'active',
                'is_system_agent' => true,
                'visibility' => 'system',
                'capabilities' => [
                    'data_analysis',
                    'visualization',
                    'statistical_analysis',
                    'reporting',
                    'insights_generation'
                ],
                'available_tools' => [
                    'pandas',
                    'matplotlib',
                    'seaborn',
                    'plotly',
                    'numpy',
                    'scipy'
                ],
                'custom_instructions' => 'You are a data analysis expert. Help users analyze their data, create meaningful visualizations, and extract actionable insights. Always explain your methodology and findings clearly.',
                'configuration' => [
                    'default_chart_type' => 'auto',
                    'include_statistics' => true,
                    'suggest_next_steps' => true
                ]
            ],
            [
                'name' => 'Project Manager',
                'description' => 'Helps with project planning, task management, and team coordination.',
                'avatar_url' => '/images/agents/project-manager.png',
                'type' => 'automation',
                'status' => 'active',
                'is_system_agent' => true,
                'visibility' => 'system',
                'capabilities' => [
                    'project_planning',
                    'task_management',
                    'timeline_creation',
                    'resource_allocation',
                    'progress_tracking'
                ],
                'available_tools' => [
                    'gantt_chart',
                    'kanban_board',
                    'calendar',
                    'notification_system',
                    'reporting_tools'
                ],
                'custom_instructions' => 'You are a project management expert. Help users plan their projects, break down tasks, set realistic timelines, and track progress. Focus on practical and actionable advice.',
                'configuration' => [
                    'default_methodology' => 'agile',
                    'send_reminders' => true,
                    'track_milestones' => true
                ]
            ],
            [
                'name' => 'Documentation Writer',
                'description' => 'Creates comprehensive documentation, user guides, and technical specifications.',
                'avatar_url' => '/images/agents/doc-writer.png',
                'type' => 'tool',
                'status' => 'active',
                'is_system_agent' => true,
                'visibility' => 'system',
                'capabilities' => [
                    'documentation_writing',
                    'technical_writing',
                    'user_guides',
                    'api_documentation',
                    'content_structuring'
                ],
                'available_tools' => [
                    'markdown_editor',
                    'diagram_generator',
                    'template_library',
                    'style_checker',
                    'version_control'
                ],
                'custom_instructions' => 'You are a technical writing specialist. Create clear, comprehensive, and well-structured documentation. Use appropriate formatting, include examples, and ensure content is accessible to the target audience.',
                'configuration' => [
                    'format' => 'markdown',
                    'include_toc' => true,
                    'add_examples' => true
                ]
            ],
            [
                'name' => 'Quality Assurance',
                'description' => 'Automated testing, code quality checks, and bug detection specialist.',
                'avatar_url' => '/images/agents/qa-agent.png',
                'type' => 'automation',
                'status' => 'active',
                'is_system_agent' => true,
                'visibility' => 'system',
                'capabilities' => [
                    'automated_testing',
                    'code_quality_analysis',
                    'bug_detection',
                    'performance_testing',
                    'security_scanning'
                ],
                'available_tools' => [
                    'unit_test_runner',
                    'integration_tester',
                    'code_coverage',
                    'static_analyzer',
                    'security_scanner'
                ],
                'custom_instructions' => 'You are a quality assurance expert. Help ensure code quality, identify potential issues, and suggest improvements. Focus on maintainability, performance, and security.',
                'configuration' => [
                    'test_coverage_threshold' => 80,
                    'run_security_checks' => true,
                    'performance_monitoring' => true
                ]
            ]
        ];

        foreach ($systemAgents as $agentData) {
            Agent::create($agentData);
        }
    }
}
