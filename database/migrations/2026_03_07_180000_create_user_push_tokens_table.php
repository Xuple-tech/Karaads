<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_push_tokens', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('provider', 32)->default('expo');
            $table->string('platform', 32)->nullable();
            $table->string('device_id', 191)->nullable();
            $table->string('device_name', 191)->nullable();
            $table->string('app_version', 64)->nullable();
            $table->text('token');
            $table->string('token_hash', 64)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['user_id', 'device_id'], 'user_push_tokens_user_device_unique');
            $table->index(['user_id', 'is_active'], 'user_push_tokens_user_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_push_tokens');
    }
};
