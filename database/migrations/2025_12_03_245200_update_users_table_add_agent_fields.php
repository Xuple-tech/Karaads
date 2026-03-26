<?php
// database/migrations/2025_12_03_000200_update_users_table_add_agent_fields.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add agent-related fields
            $table->integer('max_sites')->nullable()->after('current_plan');
            $table->integer('max_agents')->nullable()->after('max_sites');
            $table->integer('current_sites_count')->default(0)->after('max_agents');
            $table->integer('current_agents_count')->default(0)->after('current_sites_count');
            $table->enum('agent_billing_mode', ['per_site', 'per_agent', 'unlimited', 'none'])->default('none')->after('current_agents_count');

            // Add index
            $table->index(['agent_billing_mode', 'max_sites']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'max_sites',
                'max_agents',
                'current_sites_count',
                'current_agents_count',
                'agent_billing_mode'
            ]);
        });
    }
};
