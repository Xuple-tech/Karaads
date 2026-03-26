<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentMessageController extends Controller
{
    public function index(Request $request, AIAgent $agent)
    {
        $this->authorize('view', $agent);

        $messages = AgentMessage::where('agent_id', $agent->id)
            ->with(['conversation', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $stats = [
            'total' => AgentMessage::where('agent_id', $agent->id)->count(),
            'from_user' => AgentMessage::where('agent_id', $agent->id)->fromUser()->count(),
            'from_agent' => AgentMessage::where('agent_id', $agent->id)->fromAgent()->count(),
            'unread' => AgentMessage::where('agent_id', $agent->id)->unread()->count(),
        ];

        return Inertia::render('User/Agents/Messages/Index', [
            'agent' => $agent,
            'messages' => $messages,
            'stats' => $stats,
        ]);
    }

    public function markRead(Request $request, AIAgent $agent, AgentMessage $message)
    {
        $this->authorize('update', $agent);

        if ($message->agent_id !== $agent->id) {
            abort(404);
        }

        $message->markAsRead();

        return back()->with('success', 'Message marked as read.');
    }
}
