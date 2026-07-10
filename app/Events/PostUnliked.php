<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostUnliked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Post $post,
        public string $userId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('posts'),
            new PrivateChannel('feed.'.$this->post->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'post.unliked';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->post->id,
            'user_id' => $this->userId,
            'like_count' => $this->post->like_count,
        ];
    }
}
