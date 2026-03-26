<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentConversation;
use App\Models\AgentMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentConversationController extends Controller
{
    public function index(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        $conversations = $agent->conversations()
            ->with(['messages' => function($query) {
                $query->orderBy('created_at', 'desc')->take(1);
            }])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20);

        $stats = [
            'total' => $agent->conversations()->count(),
            'active' => $agent->conversations()->where('status', 'active')->count(),
            'closed' => $agent->conversations()->where('status', 'closed')->count(),
        ];

        return Inertia::render('User/Agents/Conversations/Index', [
            'agent' => $agent,
            'conversations' => $conversations,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, AIAgent $agent, AgentConversation $conversation)
    {
        // $this->authorize('view', $agent);

        if ($conversation->agent_id !== $agent->id) {
            abort(404);
        }

        $conversation->load(['messages' => function($query) {
            $query->orderBy('created_at', 'asc');
        }]);

        // Mark unread messages as read if user is viewing
        $conversation->messages()
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return Inertia::render('User/Agents/Conversations/Show', [
            'agent' => $agent,
            'conversation' => $conversation,
        ]);
    }

    public function destroy(Request $request, AIAgent $agent, AgentConversation $conversation)
    {
        // $this->authorize('delete', $agent);

        if ($conversation->agent_id !== $agent->id) {
            abort(404);
        }

        $conversation->delete();

        return back()->with('success', 'Conversation deleted successfully.');
    }

    public function close(Request $request, AIAgent $agent, AgentConversation $conversation)
    {
        // $this->authorize('update', $agent);

        if ($conversation->agent_id !== $agent->id) {
            abort(404);
        }

        $conversation->close();

        return back()->with('success', 'Conversation closed successfully.');
    }

    public function reopen(Request $request, AIAgent $agent, AgentConversation $conversation)
    {
        // $this->authorize('update', $agent);

        if ($conversation->agent_id !== $agent->id) {
            abort(404);
        }

        $conversation->reopen();

        return back()->with('success', 'Conversation reopened successfully.');
    }
}
