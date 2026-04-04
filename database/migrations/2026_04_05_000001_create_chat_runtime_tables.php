<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('conversation_id', 255);
            $table->uuid('legacy_chat_id')->nullable()->index();
            $table->uuid('reply_to_id')->nullable()->index();
            $table->string('role', 32);
            $table->string('status', 32)->default('completed');
            $table->string('provider', 64)->nullable();
            $table->string('model', 128)->nullable();
            $table->string('type', 32)->default('text');
            $table->longText('content_markdown')->nullable();
            $table->longText('content_text')->nullable();
            $table->longText('thinking')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->cascadeOnDelete();
        });

        Schema::create('chat_message_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_message_id')->index();
            $table->unsignedBigInteger('legacy_chat_file_id')->nullable()->index();
            $table->string('kind', 32)->default('file');
            $table->string('name');
            $table->string('mime_type', 191)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->string('url')->nullable();
            $table->string('path')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->foreign('chat_message_id')->references('id')->on('chat_messages')->cascadeOnDelete();
        });

        Schema::create('chat_tool_runs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_message_id')->index();
            $table->string('tool_name', 128);
            $table->string('status', 32)->default('executing');
            $table->text('summary')->nullable();
            $table->json('arguments')->nullable();
            $table->json('result')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('chat_message_id')->references('id')->on('chat_messages')->cascadeOnDelete();
        });

        Schema::create('chat_message_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('chat_message_id')->index();
            $table->uuid('chat_tool_run_id')->nullable()->index();
            $table->unsignedInteger('position')->default(0);
            $table->string('title')->nullable();
            $table->string('url')->nullable();
            $table->text('snippet')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->foreign('chat_message_id')->references('id')->on('chat_messages')->cascadeOnDelete();
            $table->foreign('chat_tool_run_id')->references('id')->on('chat_tool_runs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_message_sources');
        Schema::dropIfExists('chat_tool_runs');
        Schema::dropIfExists('chat_message_attachments');
        Schema::dropIfExists('chat_messages');
    }
};
