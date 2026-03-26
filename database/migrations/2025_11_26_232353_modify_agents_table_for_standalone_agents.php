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
        Schema::table('agents', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['project_id']);

            // Make project_id nullable since agents are standalone
            $table->foreignUlid('project_id')->nullable()->change();

            // Add new fields for standalone agents
            $table->boolean('is_system_agent')->default(false)->after('user_id');
            $table->json('available_tools')->nullable()->after('capabilities');
            $table->text('custom_instructions')->nullable()->after('available_tools');
            $table->enum('visibility', ['public', 'private', 'system'])->default('private')->after('custom_instructions');

            // Add indexes
            $table->index(['is_system_agent', 'visibility']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            // Remove added columns
            $table->dropColumn(['is_system_agent', 'available_tools', 'custom_instructions', 'visibility']);

            // Restore project_id as required
            $table->foreignUlid('project_id')->constrained('projects')->onDelete('cascade')->change();
        });
    }
};
