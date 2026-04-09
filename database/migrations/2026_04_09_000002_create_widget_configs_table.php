<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_configs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id')->index();
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->string('bot_name')->default('Kwati');
            $table->string('greeting')->default('Hi! How can I help you today?');
            $table->string('theme_color')->default('#7c3aed');
            $table->string('avatar_url')->nullable();
            $table->text('system_prompt')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('allow_file_uploads')->default(false);
            $table->json('allowed_domains')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_configs');
    }
};
