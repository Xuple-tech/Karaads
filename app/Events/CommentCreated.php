<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Comment $comment,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('posts'),
            new PrivateChannel('feed.'.$this->comment->post->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->comment->id,
            'post_id' => $this->comment->post_id,
            'user_id' => $this->comment->user_id,
            'content' => $this->comment->content,
            'parent_id' => $this->comment->parent_id,
            'reply_count' => 0,
            'user' => [
                'id' => $this->comment->user->id,
                'name' => $this->comment->user->name,
                'username' => $this->comment->user->username,
            ],
            'created_at' => $this->comment->created_at,
        ];
    }
}
