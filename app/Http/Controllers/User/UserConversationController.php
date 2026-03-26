<?php

namespace App\Http\Controllers\User;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * UserConversationController
 *
 * Manage user conversations
 */
class UserConversationController extends \Illuminate\Routing\Controller
{
    /**
     * Show user conversations
     */
    public function index()
    {
        $user = auth()->user();

        $conversations = Conversation::where('user_id', $user->id)
            ->with('chats')
            ->latest()
            ->paginate(20)
            ->through(fn ($conv) => [
                'id' => $conv->id,
                'title' => $conv->title ?? 'Untitled',
                'created_at' => $conv->created_at->toIso8601String(),
                'updated_at' => $conv->updated_at->toIso8601String(),
                'message_count' => $conv->chats()->count(),
            ]);

        return Inertia::render('User/Conversations', [
            'conversations' => $conversations,
        ]);
    }
}
