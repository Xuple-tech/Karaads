<?php

namespace App\Http\Controllers\User;

use App\Models\Conversation;
use App\Models\Chat;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * UserDashboardController
 *
 * User dashboard with conversation stats and recent activity
 */
class UserDashboardController extends \Illuminate\Routing\Controller
{
    /**
     * Show user dashboard
     */
    public function index()
    {
        $user = auth()->user();

        // Get stats
        $stats = [
            'total_conversations' => Conversation::where('user_id', $user->id)->count(),
            'total_messages' => Chat::whereHas('conversation', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count(),
            'current_month_usage' => Chat::whereHas('conversation', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'api_calls_remaining' => 1000, // Mock data
            'feature_access' => [
                'can_use_grok' => true,
                'can_generate_images' => true,
                'can_voice_chat' => true,
            ],
        ];

        // Get recent conversations
        $recentConversations = Conversation::where('user_id', $user->id)
            ->with('chats')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($conv) => [
                'id' => $conv->id,
                'title' => $conv->title ?? 'Untitled',
                'created_at' => $conv->created_at->toIso8601String(),
                'message_count' => $conv->chats()->count(),
            ]);

        return Inertia::render('User/Dashboard', [
            'stats' => $stats,
            'recentConversations' => $recentConversations,
        ]);
    }
}
