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
        Schema::table('projects', function (Blueprint $table) {
            $table->string('ai_model')->nullable()->after('status');
            $table->string('coding_framework')->nullable()->after('ai_model');
            $table->boolean('analytics_enabled')->default(false)->after('coding_framework');
            $table->boolean('auto_deploy')->default(false)->after('analytics_enabled');
            $table->string('repository_url')->nullable()->after('auto_deploy');
            $table->string('deployment_url')->nullable()->after('repository_url');
            $table->json('environment_variables')->nullable()->after('deployment_url');
            $table->json('dependencies')->nullable()->after('environment_variables');
            $table->enum('build_status', ['pending', 'building', 'success', 'failed', 'warning'])->nullable()->after('dependencies');
            $table->timestamp('last_build_at')->nullable()->after('build_status');
            $table->json('performance_metrics')->nullable()->after('last_build_at');
            $table->decimal('code_quality_score', 5, 2)->nullable()->after('performance_metrics');

            $table->index(['ai_model', 'coding_framework']);
            $table->index(['analytics_enabled', 'auto_deploy']);
            $table->index('build_status');
            $table->index('last_build_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['ai_model', 'coding_framework']);
            $table->dropIndex(['analytics_enabled', 'auto_deploy']);
            $table->dropIndex(['build_status']);
            $table->dropIndex(['last_build_at']);

            $table->dropColumn([
                'ai_model',
                'coding_framework',
                'analytics_enabled',
                'auto_deploy',
                'repository_url',
                'deployment_url',
                'environment_variables',
                'dependencies',
                'build_status',
                'last_build_at',
                'performance_metrics',
                'code_quality_score'
            ]);
        });
    }
};
