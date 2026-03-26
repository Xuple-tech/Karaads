<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            // Rich content support
            if (!Schema::hasColumn('chats', 'content_type')) {
                $table->enum('content_type', ['text', 'markdown', 'code', 'rich_html'])->default('text')->after('message');
            }

            // Mentions support
            if (!Schema::hasColumn('chats', 'mentions')) {
                $table->json('mentions')->nullable()->after('content_type'); // Array of mentioned user IDs
            }

            // Pin/flag important messages
            if (!Schema::hasColumn('chats', 'is_pinned')) {
                $table->boolean('is_pinned')->default(false)->after('mentions');
            }

            // Reference to another message (replies, threads)
            if (!Schema::hasColumn('chats', 'reply_to_id')) {
                $table->uuid('reply_to_id')->nullable()->after('is_pinned');
            }

            // For agent generated responses
            if (!Schema::hasColumn('chats', 'agent_id')) {
                $table->foreignUlid('agent_id')->nullable()->after('reply_to_id')->constrained('agents')->nullOnDelete();
            }

            // Tags for organization
            if (!Schema::hasColumn('chats', 'tags')) {
                $table->json('tags')->nullable()->after('agent_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $columns = ['content_type', 'mentions', 'is_pinned', 'reply_to_id', 'agent_id', 'tags'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('chats', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
