<?php
// database/migrations/xxxx_xx_xx_000006_create_agent_knowledge_base_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_knowledge_base', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');

            // Content Info
            $table->enum('content_type', ['faq', 'product_info', 'policy', 'custom', 'website_content', 'document', 'article', 'tutorial'])->default('custom');
            $table->string('title');
            $table->longText('content')->nullable();

            // Source Info
            $table->string('source_url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();

            // Embedding for AI Search
            $table->text('embedding_vector')->nullable()->comment('Vector embedding for semantic search');

            // Metadata
            $table->json('metadata')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['agent_id', 'content_type']);
            $table->index(['agent_id', 'is_active']);
            $table->fullText(['title', 'content']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_knowledge_base');
    }
};
