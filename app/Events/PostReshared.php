<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostReshared implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Post $post,
        public Post $originalPost,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('posts'),
            new PrivateChannel('feed.'.$this->originalPost->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'post.reshared';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->post->id,
            'original_post_id' => $this->originalPost->id,
            'user_id' => $this->post->user_id,
            'type' => $this->post->type,
            'user' => [
                'id' => $this->post->user->id,
                'name' => $this->post->user->name,
                'username' => $this->post->user->username,
            ],
            'original_post' => [
                'id' => $this->originalPost->id,
                'content' => $this->originalPost->content,
                'user_id' => $this->originalPost->user_id,
            ],
            'created_at' => $this->post->created_at,
        ];
    }
}
