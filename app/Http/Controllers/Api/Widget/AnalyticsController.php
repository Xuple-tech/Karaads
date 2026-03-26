<?php

namespace App\Http\Controllers\Api\Widget;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentConversation;
use App\Models\AgentMessage;
use App\Models\AgentUsageStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function summary(Request $request, $agentSlug)
    {
        $agent = AIAgent::where('slug', $agentSlug)
            ->where('is_active', true)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'error' => 'Agent not found'
            ], 404);
        }

        // Get today's date
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();
        $lastWeek = now()->subWeek()->toDateString();

        // Get conversation stats
        $todayConversations = AgentConversation::where('agent_id', $agent->id)
            ->whereDate('started_at', $today)
            ->count();

        $yesterdayConversations = AgentConversation::where('agent_id', $agent->id)
            ->whereDate('started_at', $yesterday)
            ->count();

        // Get message stats
        $todayMessages = AgentMessage::where('agent_id', $agent->id)
            ->whereDate('created_at', $today)
            ->count();

        $totalMessages = AgentMessage::where('agent_id', $agent->id)->count();
        $totalConversations = AgentConversation::where('agent_id', $agent->id)->count();

        // Get active conversations
        $activeConversations = AgentConversation::where('agent_id', $agent->id)
            ->where('status', 'active')
            ->count();

        // Get average response time (simplified)
        $avgResponseTime = AgentMessage::where('agent_id', $agent->id)
            ->where('sender_type', 'agent')
            ->avg('processing_time') ?? 0;

        // Get satisfaction score
        $avgSatisfaction = AgentConversation::where('agent_id', $agent->id)
            ->whereNotNull('satisfaction_score')
            ->avg('satisfaction_score') ?? 0;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => [
                    'today_conversations' => $todayConversations,
                    'yesterday_conversations' => $yesterdayConversations,
                    'conversation_change' => $yesterdayConversations > 0
                        ? (($todayConversations - $yesterdayConversations) / $yesterdayConversations) * 100
                        : 0,

                    'today_messages' => $todayMessages,
                    'total_messages' => $totalMessages,
                    'total_conversations' => $totalConversations,
                    'active_conversations' => $activeConversations,

                    'avg_response_time' => round($avgResponseTime, 2),
                    'avg_satisfaction' => round($avgSatisfaction, 2),

                    'unique_visitors' => AgentConversation::where('agent_id', $agent->id)
                        ->distinct('visitor_id')
                        ->count(),
                ],
                'agent' => [
                    'name' => $agent->name,
                    'status' => $agent->is_active ? 'active' : 'inactive',
                    'created_at' => $agent->created_at->toISOString(),
                ]
            ]
        ]);
    }

    public function usage(Request $request, $agentSlug)
    {
        $agent = AIAgent::where('slug', $agentSlug)
            ->where('is_active', true)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'error' => 'Agent not found'
            ], 404);
        }

        $days = min($request->input('days', 30), 365); // Max 365 days

        // Get usage stats from AgentUsageStat model
        $usageStats = AgentUsageStat::where('agent_id', $agent->id)
            ->where('date', '>=', now()->subDays($days))
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($stat) {
                return [
                    'date' => $stat->date->toDateString(),
                    'conversations' => $stat->conversations_count,
                    'messages' => $stat->messages_count,
                    'users' => $stat->users_count,
                    'avg_response_time' => $stat->avg_response_time,
                    'satisfaction_score' => $stat->satisfaction_score,
                ];
            });

        // If no usage stats exist, generate from conversations/messages
        if ($usageStats->isEmpty()) {
            $usageStats = $this->generateUsageStats($agent, $days);
        }

        // Get peak hours
        $peakHours = $this->getPeakHours($agent, $days);

        // Get common questions
        $commonQuestions = $this->getCommonQuestions($agent, $days);

        return response()->json([
            'success' => true,
            'data' => [
                'usage_stats' => $usageStats,
                'peak_hours' => $peakHours,
                'common_questions' => $commonQuestions,
                'period' => [
                    'days' => $days,
                    'start_date' => now()->subDays($days)->toDateString(),
                    'end_date' => now()->toDateString(),
                ]
            ]
        ]);
    }

    private function generateUsageStats($agent, $days)
    {
        $stats = [];

        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();

            $conversations = AgentConversation::where('agent_id', $agent->id)
                ->whereDate('started_at', $date)
                ->count();

            $messages = AgentMessage::where('agent_id', $agent->id)
                ->whereDate('created_at', $date)
                ->count();

            $users = AgentConversation::where('agent_id', $agent->id)
                ->whereDate('started_at', $date)
                ->distinct('visitor_id')
                ->count('visitor_id');

            // Calculate average response time for the day
            $avgResponseTime = AgentMessage::where('agent_id', $agent->id)
                ->where('sender_type', 'agent')
                ->whereDate('created_at', $date)
                ->avg('processing_time') ?? 0;

            // Calculate average satisfaction for the day
            $avgSatisfaction = AgentConversation::where('agent_id', $agent->id)
                ->whereNotNull('satisfaction_score')
                ->whereDate('started_at', $date)
                ->avg('satisfaction_score') ?? 0;

            $stats[] = [
                'date' => $date,
                'conversations' => $conversations,
                'messages' => $messages,
                'users' => $users,
                'avg_response_time' => round($avgResponseTime, 2),
                'satisfaction_score' => round($avgSatisfaction, 2),
            ];
        }

        return $stats;
    }

    private function getPeakHours($agent, $days)
    {
        $peakHours = AgentConversation::where('agent_id', $agent->id)
            ->where('started_at', '>=', now()->subDays($days))
            ->select(DB::raw('HOUR(started_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('HOUR(started_at)'))
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => $item->hour,
                    'count' => $item->count,
                    'period' => $this->formatHour($item->hour),
                ];
            });

        return $peakHours;
    }

    private function getCommonQuestions($agent, $days)
    {
        $commonQuestions = AgentMessage::where('agent_id', $agent->id)
            ->where('sender_type', 'user')
            ->where('created_at', '>=', now()->subDays($days))
            ->select('content')
            ->limit(50)
            ->get()
            ->pluck('content');

        // Simple keyword extraction (in production, use NLP)
        $keywords = [];
        foreach ($commonQuestions as $question) {
            $words = str_word_count(strtolower($question), 1);
            foreach ($words as $word) {
                if (strlen($word) > 3 && !in_array($word, ['this', 'that', 'with', 'from', 'your', 'have', 'what', 'when', 'where', 'how'])) {
                    $keywords[$word] = isset($keywords[$word]) ? $keywords[$word] + 1 : 1;
                }
            }
        }

        arsort($keywords);

        return array_slice($keywords, 0, 10, true);
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
