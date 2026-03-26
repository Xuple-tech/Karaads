<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use Illuminate\Console\Command;

class ListConversations extends Command
{
    protected $signature = 'conversations:list
                          {--user= : Filter by user ID}
                          {--limit=50 : Number of conversations to show}';

    protected $description = 'List conversations with their titles and stats';

    public function handle()
    {
        $query = Conversation::with(['user', 'chats'])
            ->withCount('chats');

        if ($this->option('user')) {
            $query->where('user_id', $this->option('user'));
        }

        $conversations = $query->orderBy('updated_at', 'desc')
            ->limit((int) $this->option('limit'))
            ->get();

        if ($conversations->isEmpty()) {
            $this->info('No conversations found');
            return 0;
        }

        $this->table(
            ['ID', 'User', 'Title', 'Messages', 'Created', 'Updated'],
            $conversations->map(function ($conversation) {
                return [
                    $conversation->id,
                    $conversation->user->name ?? $conversation->user_id,
                    $conversation->title ?? 'NULL',
                    $conversation->chats_count,
                    $conversation->created_at->diffForHumans(),
                    $conversation->updated_at->diffForHumans(),
                ];
            })
        );

        $this->newLine();
        $this->info("Total conversations: {$conversations->count()}");

        // Show title statistics
        $defaultTitles = $conversations->filter(function ($conv) {
            $title = strtolower($conv->title ?? '');
            return $title === 'new chat' ||
                   str_starts_with($title, 'new conversation') ||
                   str_starts_with($title, 'chat ') ||
                   str_starts_with($title, 'conversation ') ||
                   empty($title);
        });

        $this->info("Conversations with default/generic titles: {$defaultTitles->count()}");

        return 0;
    }
}
