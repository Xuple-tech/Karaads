<?php
// database/migrations/xxxx_xx_xx_000007_create_agent_tools_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_tools', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');

            // Tool Info
            $table->enum('tool_type', [
                'calculator',
                'booking',
                'product_search',
                'support_ticket',
                'form',
                'calendar',
                'payment',
                'navigation',
                'custom'
            ])->default('custom');

            $table->string('name');
            $table->text('description')->nullable();

            // Configuration
            $table->json('configuration')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);

            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'tool_type']);
            $table->index(['agent_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_tools');
    }
};
