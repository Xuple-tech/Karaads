<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presentation_templates', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('name');
            $table->unsignedInteger('slides_count')->default(0)->after('description');
            $table->string('preview_image_url')->nullable()->after('thumbnail_url');
            $table->json('color_palette')->nullable()->after('theme_config');
            $table->json('font_pair')->nullable()->after('color_palette');
            $table->json('tags')->nullable()->after('font_pair');
            $table->string('preview_mode')->default('immersive')->after('tags');
            $table->boolean('is_trending')->default(false)->after('is_featured');
            $table->boolean('is_recommended')->default(false)->after('is_trending');
            $table->unsignedInteger('usage_count')->default(0)->after('is_recommended');
        });

        Schema::create('template_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('accent_color')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('template_slides', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_template_id');
            $table->string('title');
            $table->unsignedInteger('position')->default(1);
            $table->string('layout')->default('hero');
            $table->text('summary')->nullable();
            $table->json('canvas_settings')->nullable();
            $table->json('elements')->nullable();
            $table->timestamps();

            $table->foreign('presentation_template_id')->references('id')->on('presentation_templates')->cascadeOnDelete();
        });

        Schema::create('template_blocks', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('presentation_template_id')->nullable();
            $table->string('name');
            $table->string('type')->index();
            $table->string('category')->nullable()->index();
            $table->text('description')->nullable();
            $table->json('schema')->nullable();
            $table->boolean('is_system')->default(true);
            $table->timestamps();

            $table->foreign('presentation_template_id')->references('id')->on('presentation_templates')->nullOnDelete();
        });

        Schema::create('user_saved_templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->ulid('presentation_template_id');
            $table->json('customizations')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('presentation_template_id')->references('id')->on('presentation_templates')->cascadeOnDelete();
            $table->unique(['user_id', 'presentation_template_id']);
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->ulid('presentation_template_id');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('presentation_template_id')->references('id')->on('presentation_templates')->cascadeOnDelete();
            $table->unique(['user_id', 'presentation_template_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('user_saved_templates');
        Schema::dropIfExists('template_blocks');
        Schema::dropIfExists('template_slides');
        Schema::dropIfExists('template_categories');

        Schema::table('presentation_templates', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'slides_count',
                'preview_image_url',
                'color_palette',
                'font_pair',
                'tags',
                'preview_mode',
                'is_trending',
                'is_recommended',
                'usage_count',
            ]);
        });
    }
};
