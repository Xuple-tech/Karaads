<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reco_surface_configs', function (Blueprint $table) {
            if (! Schema::hasColumn('reco_surface_configs', 'rollout_mode')) {
                $table->enum('rollout_mode', ['rules_only', 'canary', 'big_bang'])->default('big_bang')->after('is_active');
            }
            if (! Schema::hasColumn('reco_surface_configs', 'canary_percentage')) {
                $table->unsignedTinyInteger('canary_percentage')->default(100)->after('rollout_mode');
            }
        });

        Schema::create('reco_model_training_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('config_id')->nullable()->constrained('reco_surface_configs')->nullOnDelete();
            $table->enum('entity_type', ['ad', 'post']);
            $table->enum('surface', ['feed', 'moments', 'profile']);
            $table->string('slot')->nullable();
            $table->string('action', 32)->default('trained_applied');
            $table->string('model_version')->nullable();
            $table->timestamp('trained_at')->nullable();
            $table->json('weights')->nullable();
            $table->json('metrics')->nullable();
            $table->timestamps();

            $table->index(['entity_type', 'surface', 'created_at'], 'reco_model_hist_entity_surface_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reco_model_training_history');

        Schema::table('reco_surface_configs', function (Blueprint $table) {
            if (Schema::hasColumn('reco_surface_configs', 'canary_percentage')) {
                $table->dropColumn('canary_percentage');
            }
            if (Schema::hasColumn('reco_surface_configs', 'rollout_mode')) {
                $table->dropColumn('rollout_mode');
            }
        });
    }
};

