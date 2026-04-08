<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, string $id) {
    return $user->id === $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, string $conversationId) {
    return Conversation::query()
        ->where('id', $conversationId)
        ->where('user_id', $user->id)
        ->exists();
});
