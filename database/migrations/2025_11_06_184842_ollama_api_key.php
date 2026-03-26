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
        Schema::create('ollama_api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->comment('Name/identifier for the API key');
            $table->text('key')->comment('The actual API key');
            $table->string('model')->default('gpt-oss:120b-cloud')->comment('Default model for this key');
            $table->unsignedInteger('request_count')->default(0)->comment('Number of requests made with this key');
            $table->timestamp('last_used_at')->nullable()->comment('When this key was last used');
            $table->boolean('is_active')->default(true)->comment('Whether this key is active');
            $table->unsignedInteger('rate_limit')->default(50)->comment('Rate limit for this key');
            $table->text('notes')->nullable()->comment('Additional notes about the key');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('is_active');
            $table->index('request_count');
            $table->index('last_used_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ollama_api_keys');
    }
};
