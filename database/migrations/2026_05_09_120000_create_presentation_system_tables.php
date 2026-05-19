<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('presentations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->string('title');
            $table->string('slug')->nullable()->index();
            $table->text('description')->nullable();
            $table->string('category')->nullable()->index();
            $table->string('theme_name')->nullable();
            $table->string('status')->default('draft')->index();
            $table->string('visibility')->default('private');
            $table->unsignedInteger('slide_count')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('share_count')->default(0);
            $table->boolean('is_template_based')->default(false);
            $table->json('theme_config')->nullable();
            $table->json('ai_metadata')->nullable();
            $table->timestamp('last_edited_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('presentation_slides', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_id');
            $table->string('title')->nullable();
            $table->unsignedInteger('position')->default(1);
            $table->string('layout')->default('title-content');
            $table->text('speaker_notes')->nullable();
            $table->json('canvas_settings')->nullable();
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->cascadeOnDelete();
            $table->unique(['presentation_id', 'position']);
        });

        Schema::create('presentation_elements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('slide_id');
            $table->string('type')->index();
            $table->string('name')->nullable();
            $table->unsignedInteger('position')->default(1);
            $table->integer('x')->default(0);
            $table->integer('y')->default(0);
            $table->integer('width')->default(320);
            $table->integer('height')->default(120);
            $table->integer('rotation')->default(0);
            $table->integer('z_index')->default(1);
            $table->json('style')->nullable();
            $table->json('content')->nullable();
            $table->json('animation')->nullable();
            $table->timestamps();

            $table->foreign('slide_id')->references('id')->on('presentation_slides')->cascadeOnDelete();
        });

        Schema::create('presentation_templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('name');
            $table->string('category')->index();
            $table->string('thumbnail_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_system')->default(false);
            $table->json('theme_config')->nullable();
            $table->json('structure')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('presentation_comments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_id');
            $table->ulid('slide_id')->nullable();
            $table->uuid('user_id');
            $table->text('body');
            $table->json('anchor')->nullable();
            $table->boolean('resolved')->default(false);
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->cascadeOnDelete();
            $table->foreign('slide_id')->references('id')->on('presentation_slides')->nullOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('presentation_collaborators', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_id');
            $table->uuid('user_id');
            $table->string('role')->default('editor');
            $table->string('status')->default('active');
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['presentation_id', 'user_id']);
        });

        Schema::create('presentation_exports', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_id');
            $table->uuid('user_id');
            $table->string('format')->index();
            $table->string('status')->default('queued')->index();
            $table->string('file_path')->nullable();
            $table->json('options')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('presentation_analytics', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_id');
            $table->uuid('user_id')->nullable();
            $table->string('event_type')->index();
            $table->string('session_id')->nullable()->index();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table->foreign('presentation_id')->references('id')->on('presentations')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('presentation_analytics');
        Schema::dropIfExists('presentation_exports');
        Schema::dropIfExists('presentation_collaborators');
        Schema::dropIfExists('presentation_comments');
        Schema::dropIfExists('presentation_templates');
        Schema::dropIfExists('presentation_elements');
        Schema::dropIfExists('presentation_slides');
        Schema::dropIfExists('presentations');
    }
};
