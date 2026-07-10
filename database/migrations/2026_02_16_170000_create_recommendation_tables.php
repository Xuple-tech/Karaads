<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reco_surface_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('entity_type', ['ad', 'post']);
            $table->enum('surface', ['feed', 'moments', 'profile']);
            $table->string('slot')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('weights');
            $table->json('thresholds')->nullable();
            $table->timestamps();

            $table->unique(['entity_type', 'surface', 'slot'], 'reco_surface_unique');
            $table->index(['entity_type', 'surface', 'is_active'], 'reco_surface_active_idx');
        });

        Schema::create('reco_user_interest_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('entity_type', ['ad', 'post']);
            $table->json('interests')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'entity_type'], 'reco_user_interest_unique');
            $table->index(['entity_type', 'updated_at'], 'reco_user_interest_type_updated_idx');
        });

        Schema::create('reco_entity_performance_daily', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date');
            $table->enum('entity_type', ['ad', 'post']);
            $table->uuid('entity_id');
            $table->enum('surface', ['feed', 'moments', 'profile']);
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->unsignedBigInteger('completions')->default(0);
            $table->unsignedBigInteger('dismissals')->default(0);
            $table->decimal('ctr', 8, 6)->default(0);
            $table->decimal('completion_rate', 8, 6)->default(0);
            $table->timestamps();

            $table->unique(['date', 'entity_type', 'entity_id', 'surface'], 'reco_entity_perf_unique');
            $table->index(['entity_type', 'entity_id', 'date'], 'reco_entity_perf_entity_date_idx');
            $table->index(['surface', 'entity_type', 'date'], 'reco_entity_perf_surface_date_idx');
        });

        Schema::create('reco_user_entity_stats_daily', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date');
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('entity_type', ['ad', 'post']);
            $table->uuid('entity_id');
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->unsignedBigInteger('completions')->default(0);
            $table->unsignedBigInteger('dismissals')->default(0);
            $table->timestamps();

            $table->unique(['date', 'user_id', 'entity_type', 'entity_id'], 'reco_user_entity_unique');
            $table->index(['user_id', 'entity_type', 'date'], 'reco_user_entity_user_date_idx');
            $table->index(['entity_type', 'entity_id', 'date'], 'reco_user_entity_entity_date_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reco_user_entity_stats_daily');
        Schema::dropIfExists('reco_entity_performance_daily');
        Schema::dropIfExists('reco_user_interest_profiles');
        Schema::dropIfExists('reco_surface_configs');
    }
};

