<?php
// database/migrations/xxxx_xx_xx_000009_create_agent_api_keys_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');

            // Key Info
            $table->string('name');
            $table->string('api_key')->unique();
            $table->string('secret_key')->nullable();

            // Usage Tracking
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Permissions
            $table->json('permissions')->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'is_active']);
            $table->index('api_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_api_keys');
    }
};
