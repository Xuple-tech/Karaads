<?php

namespace App\Http\Controllers;

use App\Models\Projects;
use App\Models\ProjectFiles;
use App\Models\ProjectMember;
use App\Models\ProjectTemplate;
use App\Models\ProjectVersion;
use App\Models\ProjectActivity;
use App\Models\User;
use App\Services\ProjectService;
use App\Services\DeepSeekService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EnhancedProjectController extends Controller
{
    private ProjectService $projectService;
    private DeepSeekService $deepSeekService;

    public function __construct(ProjectService $projectService, DeepSeekService $deepSeekService)
    {
        $this->projectService = $projectService;
        $this->deepSeekService = $deepSeekService;
    }

    /**
     * Display enhanced projects dashboard
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'visibility', 'search', 'ai_model', 'framework', 'complexity']);

        $projects = $this->projectService->getUserProjectsWithAnalytics($filters);

        // Get dashboard statistics
        $stats = $this->getDashboardStats();

        return Inertia::render('Projects/EnhancedIndex', [
            'projects' => $projects,
            'filters' => $filters,
            'stats' => $stats,
            'availableModels' => $this->deepSeekService->getAvailableModels(),
            'frameworks' => $this->getAvailableFrameworks(),
        ]);
    }

    /**
     * Show enhanced project creation form
     */
    public function create()
    {
        return Inertia::render('Projects/EnhancedCreate', [
            'templates' => ProjectTemplate::active()->get(),
            'aiModels' => $this->deepSeekService->getAvailableModels(),
            'frameworks' => $this->getAvailableFrameworks(),
            'categories' => $this->getProjectCategories(),
        ]);
    }

    /**
     * Store a new project with AI features
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'project_type' => 'required|string|in:web,mobile,api,desktop,library,data_analysis',
            'ai_model' => 'nullable|string',
            'coding_framework' => 'nullable|string',
            'analytics_enabled' => 'boolean',
            'auto_deploy' => 'boolean',
            'repository_url' => 'nullable|url',
            'environment_variables' => 'nullable|array',
            'dependencies' => 'nullable|array',
            'visibility' => 'required|string|in:private,shared,public',
            'template_id' => 'nullable|exists:project_templates,id',
            'category_id' => 'nullable|exists:project_categories,id',
        ]);

        DB::beginTransaction();
        try {
            $project = Projects::create([
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'project_type' => $validated['project_type'],
                'ai_model' => $validated['ai_model'],
                'coding_framework' => $validated['coding_framework'],
                'analytics_enabled' => $validated['analytics_enabled'] ?? false,
                'auto_deploy' => $validated['auto_deploy'] ?? false,
                'repository_url' => $validated['repository_url'],
                'environment_variables' => $validated['environment_variables'] ?? [],
                'dependencies' => $validated['dependencies'] ?? [],
                'visibility' => $validated['visibility'],
                'template_id' => $validated['template_id'],
                'category_id' => $validated['category_id'],
                'status' => 'active',
                'build_status' => 'pending',
            ]);

            // Log project creation activity
            ProjectActivity::create([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'activity_type' => 'project_created',
                'description' => 'Project created with AI features',
                'metadata' => [
                    'ai_model' => $validated['ai_model'],
                    'framework' => $validated['coding_framework'],
                    'analytics' => $validated['analytics_enabled'] ?? false,
                ]
            ]);

            // Initialize project with AI if specified
            if (!empty($validated['ai_model']) && !empty($validated['coding_framework'])) {
                $this->initializeAIProject($project);
            }

            DB::commit();

            return redirect()->route('projects.dashboard', $project->id)
                ->with('success', 'Project created successfully with AI features!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Project creation failed: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create project. Please try again.']);
        }
    }

    /**
     * Show enhanced project dashboard
     */
    public function dashboard(Projects $project)
    {
        $this->authorize('view', $project);

        $analytics = $project->getAnalyticsData();
        $healthScore = $project->getHealthScore();
        $complexity = $project->getComplexityLevel();
        $recentActivity = $project->getRecentActivity(10);
        $deploymentStatus = $project->getDeploymentStatus();

        return Inertia::render('Projects/EnhancedDashboard', [
            'project' => $project->load(['user', 'category', 'template']),
            'analytics' => $analytics,
            'healthScore' => $healthScore,
            'complexity' => $complexity,
            'recentActivity' => $recentActivity,
            'deploymentStatus' => $deploymentStatus,
            'aiCapabilities' => [
                'hasCoding' => $project->hasAICoding(),
                'hasAnalytics' => $project->hasAnalytics(),
                'availableModels' => $this->deepSeekService->getAvailableModels(),
            ]
        ]);
    }

    /**
     * Generate code using AI
     */
    public function generateCode(Request $request, Projects $project): StreamedResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'prompt' => 'required|string|max:2000',
            'file_context' => 'nullable|array',
            'requirements' => 'nullable|array',
        ]);

        return response()->stream(function () use ($validated, $project) {
            $context = [
                'project_type' => $project->project_type,
                'framework' => $project->coding_framework,
                'existing_files' => $validated['file_context'] ?? [],
                'requirements' => $validated['requirements'] ?? [],
            ];

            $this->deepSeekService->generateCodingResponse(
                $validated['prompt'],
                function ($data) {
                    echo "data: " . json_encode($data) . "\n\n";
                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                },
                $project->ai_model ?? 'deepseek-coder',
                [],
                [],
                $context
            );
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Generate analytics code using AI
     */
    public function generateAnalytics(Request $request, Projects $project): StreamedResponse
    {
        $this->authorize('update', $project);

        if (!$project->hasAnalytics()) {
            abort(403, 'Analytics not enabled for this project');
        }

        $validated = $request->validate([
            'data_source' => 'required|string',
            'analysis_type' => 'required|string|in:descriptive,predictive,clustering,classification,visualization',
            'requirements' => 'required|string|max:1000',
        ]);

        return response()->stream(function () use ($validated, $project) {
            $context = [
                'project_id' => $project->id,
                'project_type' => $project->project_type,
                'existing_metrics' => $project->performance_metrics ?? [],
            ];

            $this->deepSeekService->generateAnalyticsResponse(
                "Generate Python code for {$validated['analysis_type']} analysis of {$validated['data_source']}. Requirements: {$validated['requirements']}",
                function ($data) {
                    echo "data: " . json_encode($data) . "\n\n";
                    if (ob_get_level()) {
                        ob_flush();
                    }
                    flush();
                },
                $project->ai_model ?? 'deepseek-chat',
                [],
                [],
                $context
            );
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Update project settings
     */
    public function updateSettings(Request $request, Projects $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'ai_model' => 'nullable|string',
            'coding_framework' => 'nullable|string',
            'analytics_enabled' => 'boolean',
            'auto_deploy' => 'boolean',
            'repository_url' => 'nullable|url',
            'deployment_url' => 'nullable|url',
            'environment_variables' => 'nullable|array',
            'dependencies' => 'nullable|array',
        ]);

        $project->update($validated);

        // Log settings update
        ProjectActivity::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'activity_type' => 'settings_updated',
            'description' => 'Project settings updated',
            'metadata' => $validated
        ]);

        return back()->with('success', 'Project settings updated successfully!');
    }

    /**
     * Analyze project code quality
     */
    public function analyzeCodeQuality(Projects $project): JsonResponse
    {
        $this->authorize('view', $project);

        try {
            // Get project files for analysis
            $files = $project->files()->get();
            $codeFiles = $files->filter(function ($file) {
                return in_array(pathinfo($file->filename, PATHINFO_EXTENSION),
                    ['php', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c']);
            });

            $totalScore = 0;
            $fileCount = 0;
            $issues = [];

            foreach ($codeFiles as $file) {
                // This would integrate with actual code analysis tools
                // For now, we'll simulate the analysis
                $fileScore = $this->simulateCodeAnalysis($file);
                $totalScore += $fileScore;
                $fileCount++;
            }

            $averageScore = $fileCount > 0 ? $totalScore / $fileCount : 0;

            // Update project code quality score
            $project->update(['code_quality_score' => $averageScore]);

            return response()->json([
                'score' => round($averageScore, 2),
                'files_analyzed' => $fileCount,
                'issues' => $issues,
                'recommendations' => $this->getCodeQualityRecommendations($averageScore),
            ]);

        } catch (\Exception $e) {
            Log::error('Code quality analysis failed: ' . $e->getMessage());
            return response()->json(['error' => 'Analysis failed'], 500);
        }
    }

    /**
     * Deploy project
     */
    public function deploy(Projects $project): JsonResponse
    {
        $this->authorize('update', $project);

        try {
            $project->update(['build_status' => 'building']);

            // Log deployment start
            ProjectActivity::create([
                'project_id' => $project->id,
                'user_id' => Auth::id(),
                'activity_type' => 'deployment_started',
                'description' => 'Project deployment initiated',
            ]);

            // Simulate deployment process
            // In a real implementation, this would integrate with deployment services
            $deploymentResult = $this->simulateDeployment($project);

            $project->update([
                'build_status' => $deploymentResult['status'],
                'last_build_at' => now(),
                'deployment_url' => $deploymentResult['url'] ?? null,
            ]);

            return response()->json([
                'success' => $deploymentResult['status'] === 'success',
                'status' => $deploymentResult['status'],
                'url' => $deploymentResult['url'] ?? null,
                'message' => $deploymentResult['message'],
            ]);

        } catch (\Exception $e) {
            $project->update(['build_status' => 'failed']);
            Log::error('Deployment failed: ' . $e->getMessage());
            return response()->json(['error' => 'Deployment failed'], 500);
        }
    }

    /**
     * Get project performance metrics
     */
    public function getMetrics(Projects $project): JsonResponse
    {
        $this->authorize('view', $project);

        $metrics = [
            'health_score' => $project->getHealthScore(),
            'complexity' => $project->getComplexityLevel(),
            'analytics' => $project->getAnalyticsData(),
            'deployment' => $project->getDeploymentStatus(),
            'activity_trend' => $this->getActivityTrend($project),
            'performance_metrics' => $project->performance_metrics ?? [],
        ];

        return response()->json($metrics);
    }

    /**
     * Private helper methods
     */
    private function getDashboardStats(): array
    {
        $userId = Auth::id();

        return [
            'total_projects' => Projects::where('user_id', $userId)->count(),
            'active_projects' => Projects::where('user_id', $userId)->where('status', 'active')->count(),
            'ai_enabled_projects' => Projects::where('user_id', $userId)->whereNotNull('ai_model')->count(),
            'analytics_projects' => Projects::where('user_id', $userId)->where('analytics_enabled', true)->count(),
            'deployed_projects' => Projects::where('user_id', $userId)->whereNotNull('deployment_url')->count(),
            'avg_health_score' => $this->getAverageHealthScore($userId),
        ];
    }

    private function getAvailableFrameworks(): array
    {
        return [
            'web' => [
                'react' => 'React',
                'vue' => 'Vue.js',
                'angular' => 'Angular',
                'laravel' => 'Laravel',
                'django' => 'Django',
                'express' => 'Express.js',
                'nextjs' => 'Next.js',
                'nuxtjs' => 'Nuxt.js',
            ],
            'mobile' => [
                'react-native' => 'React Native',
                'flutter' => 'Flutter',
                'ionic' => 'Ionic',
                'xamarin' => 'Xamarin',
            ],
            'api' => [
                'laravel' => 'Laravel API',
                'fastapi' => 'FastAPI',
                'express' => 'Express.js',
                'django-rest' => 'Django REST',
                'spring-boot' => 'Spring Boot',
            ],
            'data_analysis' => [
                'jupyter' => 'Jupyter Notebooks',
                'streamlit' => 'Streamlit',
                'dash' => 'Plotly Dash',
                'flask' => 'Flask',
            ]
        ];
    }

    private function getProjectCategories(): array
    {
        return [
            ['id' => 1, 'name' => 'Web Development', 'icon' => 'globe'],
            ['id' => 2, 'name' => 'Mobile Apps', 'icon' => 'smartphone'],
            ['id' => 3, 'name' => 'Data Science', 'icon' => 'bar-chart'],
            ['id' => 4, 'name' => 'Machine Learning', 'icon' => 'brain'],
            ['id' => 5, 'name' => 'API Development', 'icon' => 'server'],
            ['id' => 6, 'name' => 'Desktop Apps', 'icon' => 'monitor'],
        ];
    }

    private function initializeAIProject(Projects $project): void
    {
        // Initialize project structure based on AI model and framework
        $structure = $this->generateProjectStructure($project);

        // Create initial files
        foreach ($structure as $file) {
            ProjectFiles::create([
                'project_id' => $project->id,
                'filename' => $file['name'],
                'file_path' => $file['path'],
                'file_size' => strlen($file['content']),
                'mime_type' => $file['mime_type'],
                'uploaded_by' => Auth::id(),
            ]);
        }
    }

    private function generateProjectStructure(Projects $project): array
    {
        // This would generate initial project structure based on framework
        // For now, return a basic structure
        return [
            [
                'name' => 'README.md',
                'path' => 'README.md',
                'content' => "# {$project->title}\n\n{$project->description}",
                'mime_type' => 'text/markdown'
            ],
            [
                'name' => '.gitignore',
                'path' => '.gitignore',
                'content' => $this->getGitignoreContent($project->coding_framework),
                'mime_type' => 'text/plain'
            ]
        ];
    }

    private function getGitignoreContent(string $framework): string
    {
        $templates = [
            'react' => "node_modules/\n.env\nbuild/\ndist/",
            'laravel' => "vendor/\n.env\nstorage/logs/\npublic/storage",
            'python' => "__pycache__/\n*.pyc\n.env\nvenv/",
            'default' => ".env\n*.log\ntmp/"
        ];

        return $templates[$framework] ?? $templates['default'];
    }

    private function simulateCodeAnalysis($file): float
    {
        // Simulate code analysis - in real implementation, integrate with tools like:
        // - PHP: PHPStan, Psalm
        // - JavaScript: ESLint, SonarJS
        // - Python: Pylint, Flake8
        return rand(70, 95) + (rand(0, 100) / 100);
    }

    private function getCodeQualityRecommendations(float $score): array
    {
        if ($score >= 90) {
            return ['Excellent code quality! Keep up the good work.'];
        } elseif ($score >= 80) {
            return [
                'Good code quality with room for minor improvements',
                'Consider adding more unit tests',
                'Review code documentation'
            ];
        } elseif ($score >= 70) {
            return [
                'Moderate code quality - several areas need attention',
                'Refactor complex functions',
                'Improve error handling',
                'Add comprehensive tests'
            ];
        } else {
            return [
                'Code quality needs significant improvement',
                'Major refactoring required',
                'Implement proper error handling',
                'Add extensive testing coverage',
                'Review and improve code documentation'
            ];
        }
    }

    private function simulateDeployment(Projects $project): array
    {
        // Simulate deployment process
        $success = rand(1, 10) > 2; // 80% success rate

        if ($success) {
            return [
                'status' => 'success',
                'url' => "https://{$project->id}.rheaapp.com",
                'message' => 'Deployment completed successfully'
            ];
        } else {
            return [
                'status' => 'failed',
                'message' => 'Deployment failed due to configuration issues'
            ];
        }
    }

    private function getActivityTrend(Projects $project): array
    {
        // Get activity data for the last 30 days
        $activities = $project->activities()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $activities->map(function ($activity) {
            return [
                'date' => $activity->date,
                'count' => $activity->count
            ];
        })->toArray();
    }

    private function getAverageHealthScore(string $userId): float
    {
        $projects = Projects::where('user_id', $userId)->get();
        $totalScore = 0;
        $count = 0;

        foreach ($projects as $project) {
            $score = $project->getHealthScore();
            if ($score > 0) {
                $totalScore += $score;
                $count++;
            }
        }

        return $count > 0 ? round($totalScore / $count, 1) : 0;
    }
}
