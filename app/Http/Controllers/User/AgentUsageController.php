<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentUsageStat;
use App\Models\AgentConversation;
use App\Models\AgentMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AgentUsageController extends Controller
{
    public function index(Request $request, AIAgent $agent)
    {
        $this->authorize('view', $agent);

        // Get date range from request or default to last 30 days
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        $usageStats = $agent->usageStats()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        // Calculate summary stats
        $summary = [
            'total_conversations' => $usageStats->sum('conversations_count'),
            'total_messages' => $usageStats->sum('messages_count'),
            'total_users' => $usageStats->sum('users_count'),
            'avg_response_time' => $usageStats->avg('avg_response_time'),
            'avg_satisfaction' => $usageStats->avg('satisfaction_score'),
        ];

        // Get peak hours
        $peakHours = $this->calculatePeakHours($agent, $startDate, $endDate);

        // Get common questions
        $commonQuestions = $this->getCommonQuestions($agent, $startDate, $endDate);

        // Get tool usage
        $toolUsage = $this->getToolUsage($agent, $startDate, $endDate);

        return Inertia::render('User/Agents/Analytics/Index', [
            'agent' => $agent,
            'usageStats' => $usageStats,
            'summary' => $summary,
            'peakHours' => $peakHours,
            'commonQuestions' => $commonQuestions,
            'toolUsage' => $toolUsage,
            'dateRange' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function export(Request $request, AIAgent $agent)
    {
        $this->authorize('view', $agent);

        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        $usageStats = $agent->usageStats()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        // Generate CSV content
        $csvData = "Date,Conversations,Messages,Unique Users,Avg Response Time,Satisfaction Score\n";

        foreach ($usageStats as $stat) {
            $csvData .= sprintf(
                "%s,%d,%d,%d,%.2f,%.2f\n",
                $stat->date->format('Y-m-d'),
                $stat->conversations_count,
                $stat->messages_count,
                $stat->users_count,
                $stat->avg_response_time,
                $stat->satisfaction_score
            );
        }

        $filename = "agent-{$agent->slug}-usage-{$startDate}-to-{$endDate}.csv";

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    public function overview(Request $request)
    {
        $user = $request->user();

        // Get user's agents
        $agents = $user->aiAgents()->pluck('id');

        // Get date range
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->format('Y-m-d'));

        // Get aggregated usage stats
        $usageStats = AgentUsageStat::whereIn('agent_id', $agents)
            ->whereBetween('date', [$startDate, $endDate])
            ->select(
                'date',
                DB::raw('SUM(conversations_count) as conversations_count'),
                DB::raw('SUM(messages_count) as messages_count'),
                DB::raw('SUM(users_count) as users_count'),
                DB::raw('AVG(avg_response_time) as avg_response_time'),
                DB::raw('AVG(satisfaction_score) as satisfaction_score')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Get agent-specific stats
        $agentStats = AgentUsageStat::whereIn('agent_id', $agents)
            ->whereBetween('date', [$startDate, $endDate])
            ->select(
                'agent_id',
                DB::raw('SUM(conversations_count) as conversations_count'),
                DB::raw('SUM(messages_count) as messages_count'),
                DB::raw('SUM(users_count) as users_count')
            )
            ->groupBy('agent_id')
            ->with(['agent:id,name,slug'])
            ->orderBy('conversations_count', 'desc')
            ->get();

        return Inertia::render('User/Analytics/Overview', [
            'usageStats' => $usageStats,
            'agentStats' => $agentStats,
            'totalAgents' => count($agents),
            'dateRange' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function conversations(Request $request)
    {
        $user = $request->user();

        $agents = $user->aiAgents()->pluck('id');

        $conversations = AgentConversation::whereIn('agent_id', $agents)
            ->with(['aiAgent:id,name,slug'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(50);

        $stats = [
            'total' => AgentConversation::whereIn('agent_id', $agents)->count(),
            'active' => AgentConversation::whereIn('agent_id', $agents)->where('status', 'active')->count(),
            'closed' => AgentConversation::whereIn('agent_id', $agents)->where('status', 'closed')->count(),
            'avg_satisfaction' => AgentConversation::whereIn('agent_id', $agents)->avg('satisfaction_score'),
        ];

        return Inertia::render('User/Analytics/Conversations', [
            'conversations' => $conversations,
            'stats' => $stats,
        ]);
    }

    public function messages(Request $request)
    {
        $user = $request->user();

        $agents = $user->aiAgents()->pluck('id');

        $messages = AgentMessage::whereIn('agent_id', $agents)
            ->with(['aiAgent:id,name,slug', 'conversation:id,title', 'user:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(100);

        $stats = [
            'total' => AgentMessage::whereIn('agent_id', $agents)->count(),
            'from_user' => AgentMessage::whereIn('agent_id', $agents)->fromUser()->count(),
            'from_agent' => AgentMessage::whereIn('agent_id', $agents)->fromAgent()->count(),
            'with_attachments' => AgentMessage::whereIn('agent_id', $agents)->whereNotNull('attachments')->count(),
        ];

        return Inertia::render('User/Analytics/Messages', [
            'messages' => $messages,
            'stats' => $stats,
        ]);
    }

    private function calculatePeakHours($agent, $startDate, $endDate)
    {
        $conversations = AgentConversation::where('agent_id', $agent->id)
            ->whereBetween('started_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
            ->selectRaw('HOUR(started_at) as hour, COUNT(*) as count')
            ->groupBy(DB::raw('HOUR(started_at)'))
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        return $conversations->map(function($item) {
            return [
                'hour' => $item->hour,
                'count' => $item->count,
                'period' => $this->formatHour($item->hour),
            ];
        });
    }

    private function getCommonQuestions($agent, $startDate, $endDate)
    {
        $messages = AgentMessage::where('agent_id', $agent->id)
            ->where('sender_type', 'user')
            ->whereBetween('created_at', [$startDate, Carbon::parse($endDate)->endOfDay()])
            ->select('content')
            ->limit(20)
            ->get();

        // Simple keyword extraction (in production, use NLP)
        $keywords = [];
        foreach ($messages as $message) {
            $words = str_word_count(strtolower($message->content), 1);
            foreach ($words as $word) {
                if (strlen($word) > 3 && !in_array($word, ['this', 'that', 'with', 'from', 'your', 'have'])) {
                    $keywords[$word] = isset($keywords[$word]) ? $keywords[$word] + 1 : 1;
                }
            }
        }

        arsort($keywords);

        return array_slice($keywords, 0, 10, true);
    }

    private function getToolUsage($agent, $startDate, $endDate)
    {
        $usageStats = AgentUsageStat::where('agent_id', $agent->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $toolUsage = [];

        foreach ($usageStats as $stat) {
            if ($stat->tool_usage) {
                foreach ($stat->tool_usage as $tool => $count) {
                    $toolUsage[$tool] = isset($toolUsage[$tool]) ? $toolUsage[$tool] + $count : $count;
                }
            }
        }

        arsort($toolUsage);

        return $toolUsage;
    }

    private function formatHour($hour)
    {
        if ($hour == 0) {
            return '12 AM';
        } elseif ($hour < 12) {
            return "{$hour} AM";
        } elseif ($hour == 12) {
            return '12 PM';
        } else {
            return ($hour - 12) . ' PM';
        }
    }
}
