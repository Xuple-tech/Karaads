<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Services\GeminiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateConversationTitles extends Command
{
    protected $signature = 'conversations:generate-titles
                          {--limit=10 : Number of conversations to process per run}
                          {--dry-run : Show what would be processed without making changes}';

    protected $description = 'Generate AI-powered titles for conversations using Gemini';

    private GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        parent::__construct();
        $this->geminiService = $geminiService;
    }

    public function handle()
    {
        $limit = (int) $this->option('limit');
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🧪 DRY RUN MODE - No changes will be made');
        }

        // Find conversations that need title generation
        // Look for default titles like "New Chat" or titles that are too generic
        $conversations = Conversation::with(['chats' => function ($query) {
            $query->where('role', 'user')
                  ->orderBy('created_at', 'asc')
                  ->limit(5); // Get first few user messages for context
        }])
        ->where(function ($query) {
            $query->where('title', 'New Chat')
                  ->orWhere('title', 'like', 'New Conversation%')
                  ->orWhere('title', 'like', 'Chat %')
                  ->orWhere('title', 'like', 'Conversation %')
                  ->orWhereNull('title');
        })
        ->whereHas('chats', function ($query) {
            $query->where('role', 'user');
        })
        ->orderBy('updated_at', 'desc')
        ->limit($limit)
        ->get();

        if ($conversations->isEmpty()) {
            $this->info('✅ No conversations found that need title generation');
            return 0;
        }

        $this->info("📝 Found {$conversations->count()} conversations to process");
        $this->newLine();

        $progressBar = $this->output->createProgressBar($conversations->count());
        $progressBar->start();

        $processed = 0;
        $successful = 0;
        $failed = 0;

        foreach ($conversations as $conversation) {
            try {
                $newTitle = $this->generateTitleForConversation($conversation);

                if ($newTitle && $newTitle !== $conversation->title) {
                    if (!$dryRun) {
                        $conversation->update(['title' => $newTitle]);
                        Log::info("Generated title for conversation {$conversation->id}: '{$newTitle}'");
                    }

                    $this->line("  ✅ {$conversation->id}: '{$conversation->title}' → '{$newTitle}'");
                    $successful++;
                } else {
                    $this->line("  ⚠️  {$conversation->id}: Could not generate better title");
                }

                $processed++;

                // Add a small delay to avoid overwhelming the API
                sleep(1);

            } catch (\Exception $e) {
                $this->error("  ❌ Failed to process conversation {$conversation->id}: {$e->getMessage()}");
                Log::error("Failed to generate title for conversation {$conversation->id}: {$e->getMessage()}");
                $failed++;
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->info("📊 Summary:");
        $this->info("   Processed: {$processed}");
        $this->info("   Successful: {$successful}");
        $this->info("   Failed: {$failed}");

        if ($dryRun) {
            $this->warn("🧪 This was a dry run - no changes were made");
        }

        return 0;
    }

    /**
     * Generate a title for a conversation using Gemini AI
     */
    private function generateTitleForConversation(Conversation $conversation): ?string
    {
        // Get the first few user messages to understand the conversation topic
        $userMessages = $conversation->chats->pluck('message')->take(3)->toArray();

        if (empty($userMessages)) {
            return null;
        }

        // Create a prompt for Gemini to generate a concise title
        $messagesText = implode("\n", array_map(function ($msg, $index) {
            return ($index + 1) . ". " . substr($msg, 0, 200) . (strlen($msg) > 200 ? '...' : '');
        }, $userMessages, array_keys($userMessages)));

        $prompt = <<<PROMPT
Based on the following conversation messages, generate a concise, descriptive title (max 50 characters) that captures the main topic or question:

{$messagesText}

Requirements:
- Keep it under 50 characters
- Make it descriptive and specific
- Use title case
- Avoid generic titles like "New Chat" or "Conversation"
- Focus on the main topic, question, or task

Title:
PROMPT;

        try {
            $generatedTitle = '';

            // Use Gemini to generate the title
            $this->geminiService->generateTextStream($prompt, function ($chunk) use (&$generatedTitle) {
                $generatedTitle .= $chunk;
            });

            // Clean up the generated title
            $generatedTitle = trim($generatedTitle);
            $generatedTitle = preg_replace('/^["\']|["\']$/', '', $generatedTitle); // Remove quotes
            $generatedTitle = ucwords(strtolower($generatedTitle)); // Title case

            // Validate the title
            if (strlen($generatedTitle) > 50 || strlen($generatedTitle) < 3) {
                return null;
            }

            // Check if it's not a generic title
            $genericTitles = ['new chat', 'conversation', 'chat', 'discussion', 'question'];
            if (in_array(strtolower($generatedTitle), $genericTitles)) {
                return null;
            }

            return $generatedTitle;

        } catch (\Exception $e) {
            Log::error("Gemini title generation failed: {$e->getMessage()}");
            return null;
        }
    }
}
