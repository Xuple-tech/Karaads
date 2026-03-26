<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentUsageStat;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentUsageStatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AgentUsageStat::with('agent');

        // Apply filters
        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        if ($request->has('min_conversations')) {
            $query->where('conversations_count', '>=', $request->min_conversations);
        }

        if ($request->has('min_satisfaction')) {
            $query->where('satisfaction_score', '>=', $request->min_satisfaction);
        }

        $stats = $query->orderBy('date', 'desc')
            ->paginate(20);

        // Get summary statistics
        $summary = [
            'total_conversations' => $query->sum('conversations_count'),
            'total_messages' => $query->sum('messages_count'),
            'total_users' => $query->sum('users_count'),
            'avg_response_time' => $query->avg('avg_response_time'),
            'avg_satisfaction' => $query->avg('satisfaction_score'),
        ];

        return Inertia::render('Admin/AgentUsageStats/Index', [
            'stats' => $stats,
            'summary' => $summary,
            'filters' => $request->only([
                'agent_id', 'date_from', 'date_to',
                'min_conversations', 'min_satisfaction'
            ]),
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentUsageStats/Create', [
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'date' => 'required|date',
            'conversations_count' => 'required|integer|min:0',
            'messages_count' => 'required|integer|min:0',
            'users_count' => 'required|integer|min:0',
            'avg_response_time' => 'nullable|numeric|min:0',
            'satisfaction_score' => 'nullable|numeric|min:0|max:5',
            'common_questions' => 'nullable|array',
            'peak_hours' => 'nullable|array',
            'knowledge_base_hits' => 'nullable|integer|min:0',
            'tool_usage' => 'nullable|array',
        ]);

        // Check if stat already exists for this agent and date
        $existing = AgentUsageStat::where('agent_id', $validated['agent_id'])
            ->where('date', $validated['date'])
            ->first();

        if ($existing) {
            return redirect()->back()
                ->with('error', 'Usage statistics already exist for this agent and date.')
                ->withInput();
        }

        AgentUsageStat::create($validated);

        return redirect()->route('admin.agent-usage-stats.index')
            ->with('success', 'Usage statistics created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentUsageStat $agentUsageStat)
    {
        $agentUsageStat->load('agent');

        return Inertia::render('Admin/AgentUsageStats/Show', [
            'stat' => $agentUsageStat,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentUsageStat $agentUsageStat)
    {
        $agentUsageStat->load('agent');

        return Inertia::render('Admin/AgentUsageStats/Edit', [
            'stat' => $agentUsageStat,
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentUsageStat $agentUsageStat)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id',
            'date' => 'required|date',
            'conversations_count' => 'required|integer|min:0',
            'messages_count' => 'required|integer|min:0',
            'users_count' => 'required|integer|min:0',
            'avg_response_time' => 'nullable|numeric|min:0',
            'satisfaction_score' => 'nullable|numeric|min:0|max:5',
            'common_questions' => 'nullable|array',
            'peak_hours' => 'nullable|array',
            'knowledge_base_hits' => 'nullable|integer|min:0',
            'tool_usage' => 'nullable|array',
        ]);

        // Check if stat already exists for this agent and date (excluding current)
        $existing = AgentUsageStat::where('agent_id', $validated['agent_id'])
            ->where('date', $validated['date'])
            ->where('id', '!=', $agentUsageStat->id)
            ->first();

        if ($existing) {
            return redirect()->back()
                ->with('error', 'Usage statistics already exist for this agent and date.')
                ->withInput();
        }

        $agentUsageStat->update($validated);

        return redirect()->route('admin.agent-usage-stats.index')
            ->with('success', 'Usage statistics updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentUsageStat $agentUsageStat)
    {
        $agentUsageStat->delete();

        return redirect()->route('admin.agent-usage-stats.index')
            ->with('success', 'Usage statistics deleted successfully.');
    }

    /**
     * Generate report
     */
    public function report(Request $request)
    {
        $request->validate([
            'agent_id' => 'nullable|exists:ai_agents,id',
            'date_from' => 'required|date',
            'date_to' => 'required|date',
            'format' => 'nullable|in:json,csv,pdf',
        ]);

        $query = AgentUsageStat::with('agent');

        if ($request->agent_id) {
            $query->where('agent_id', $request->agent_id);
        }

        $query->whereBetween('date', [$request->date_from, $request->date_to]);

        $stats = $query->orderBy('date')->get();

        // Calculate metrics
        $metrics = [
            'period' => [
                'from' => $request->date_from,
                'to' => $request->date_to,
            ],
            'total_conversations' => $stats->sum('conversations_count'),
            'total_messages' => $stats->sum('messages_count'),
            'unique_users' => $stats->sum('users_count'),
            'avg_daily_conversations' => $stats->avg('conversations_count'),
            'avg_response_time' => $stats->avg('avg_response_time'),
            'avg_satisfaction' => $stats->avg('satisfaction_score'),
            'peak_hours' => $this->calculatePeakHours($stats),
            'common_questions' => $this->calculateCommonQuestions($stats),
            'tool_usage' => $this->calculateToolUsage($stats),
        ];

        // Export based on format
        if ($request->format === 'csv') {
            return $this->exportCsv($stats, $metrics);
        } elseif ($request->format === 'pdf') {
            return $this->exportPdf($stats, $metrics);
        }

        return Inertia::render('Admin/AgentUsageStats/Report', [
            'stats' => $stats,
            'metrics' => $metrics,
            'agent' => $request->agent_id ? AIAgent::find($request->agent_id) : null,
        ]);
    }

    /**
     * Dashboard statistics
     */
    public function dashboard()
    {
        $today = now()->format('Y-m-d');
        $lastWeek = now()->subDays(7)->format('Y-m-d');

        // Today's stats
        $todayStats = AgentUsageStat::where('date', $today)->get();

        // Last 7 days stats
        $weeklyStats = AgentUsageStat::whereBetween('date', [$lastWeek, $today])
            ->selectRaw('DATE(date) as day,
                        SUM(conversations_count) as conversations,
                        SUM(messages_count) as messages,
                        SUM(users_count) as users,
                        AVG(avg_response_time) as response_time,
                        AVG(satisfaction_score) as satisfaction')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Top performing agents
        $topAgents = AgentUsageStat::selectRaw('agent_id,
                SUM(conversations_count) as total_conversations,
                AVG(satisfaction_score) as avg_satisfaction')
            ->whereBetween('date', [$lastWeek, $today])
            ->groupBy('agent_id')
            ->orderBy('total_conversations', 'desc')
            ->limit(5)
            ->with('agent')
            ->get();

        // Common questions
        $commonQuestions = AgentUsageStat::whereBetween('date', [$lastWeek, $today])
            ->whereNotNull('common_questions')
            ->get()
            ->pluck('common_questions')
            ->flatten(1)
            ->groupBy('question')
            ->map(function ($items) {
                return [
                    'question' => $items[0]['question'],
                    'count' => $items->sum('count'),
                ];
            })
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return Inertia::render('Admin/AgentUsageStats/Dashboard', [
            'todayStats' => [
                'conversations' => $todayStats->sum('conversations_count'),
                'messages' => $todayStats->sum('messages_count'),
                'users' => $todayStats->sum('users_count'),
                'avg_response_time' => $todayStats->avg('avg_response_time'),
                'avg_satisfaction' => $todayStats->avg('satisfaction_score'),
            ],
            'weeklyStats' => $weeklyStats,
            'topAgents' => $topAgents,
            'commonQuestions' => $commonQuestions,
        ]);
    }

    /**
     * Calculate peak hours from stats
     */
    private function calculatePeakHours($stats)
    {
        $hourlyData = [];

        foreach ($stats as $stat) {
            if ($stat->peak_hours) {
                foreach ($stat->peak_hours as $hour => $count) {
                    $hourlyData[$hour] = ($hourlyData[$hour] ?? 0) + $count;
                }
            }
        }

        arsort($hourlyData);
        return array_slice($hourlyData, 0, 5, true);
    }

    /**
     * Calculate common questions from stats
     */
    private function calculateCommonQuestions($stats)
    {
        $questions = [];

        foreach ($stats as $stat) {
            if ($stat->common_questions) {
                foreach ($stat->common_questions as $questionData) {
                    $question = $questionData['question'];
                    $count = $questionData['count'];

                    if (!isset($questions[$question])) {
                        $questions[$question] = 0;
                    }
                    $questions[$question] += $count;
                }
            }
        }

        arsort($questions);
        return array_slice($questions, 0, 10, true);
    }

    /**
     * Calculate tool usage from stats
     */
    private function calculateToolUsage($stats)
    {
        $tools = [];

        foreach ($stats as $stat) {
            if ($stat->tool_usage) {
                foreach ($stat->tool_usage as $tool => $count) {
                    if (!isset($tools[$tool])) {
                        $tools[$tool] = 0;
                    }
                    $tools[$tool] += $count;
                }
            }
        }

        arsort($tools);
        return $tools;
    }

    /**
     * Export to CSV
     */
    private function exportCsv($stats, $metrics)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="usage-report-' . date('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($stats, $metrics) {
            $file = fopen('php://output', 'w');

            // Write metrics
            fputcsv($file, ['Usage Report Summary']);
            fputcsv($file, ['Period', $metrics['period']['from'] . ' to ' . $metrics['period']['to']]);
            fputcsv($file, ['Total Conversations', $metrics['total_conversations']]);
            fputcsv($file, ['Total Messages', $metrics['total_messages']]);
            fputcsv($file, ['Unique Users', $metrics['unique_users']]);
            fputcsv($file, ['Average Daily Conversations', round($metrics['avg_daily_conversations'], 2)]);
            fputcsv($file, ['Average Response Time', round($metrics['avg_response_time'], 2) . 's']);
            fputcsv($file, ['Average Satisfaction', round($metrics['avg_satisfaction'], 2) . '/5']);
            fputcsv($file, []);

            // Write detailed data
            fputcsv($file, ['Date', 'Agent', 'Conversations', 'Messages', 'Users', 'Avg Response Time', 'Satisfaction Score']);

            foreach ($stats as $stat) {
                fputcsv($file, [
                    $stat->date,
                    $stat->agent->name,
                    $stat->conversations_count,
                    $stat->messages_count,
                    $stat->users_count,
                    $stat->avg_response_time,
                    $stat->satisfaction_score,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to PDF
     */
    private function exportPdf($stats, $metrics)
    {
        // This is a placeholder for PDF generation
        // You would typically use a package like DomPDF or TCPDF here

        return response()->json([
            'message' => 'PDF export would be implemented here with a PDF generation library.',
            'stats' => $stats,
            'metrics' => $metrics,
        ]);
    }
}
