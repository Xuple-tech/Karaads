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
        // Drop tables in correct order (child tables first)
        Schema::dropIfExists('team_activity_logs');
        Schema::dropIfExists('team_invitations');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');

        // Teams Table - Enterprise team organization
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignUuid('owner_id')->constrained('users')->onDelete('cascade'); // Fixed: properly constrained to users table
            $table->enum('type', ['enterprise', 'department', 'project'])->default('enterprise');
            $table->json('metadata')->nullable(); // Custom team data
            $table->json('settings')->nullable(); // Team-specific settings
            $table->enum('status', ['active', 'paused', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        // Team Members Table - Team membership and roles
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->foreignUuid('user_id'); // Using UUID for user_id
            $table->enum('role', ['admin', 'manager', 'member', 'viewer'])->default('member');
            $table->json('permissions')->nullable(); // Custom permissions
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade'); // Fixed: references UUID
            $table->unique(['team_id', 'user_id']);
            $table->index(['team_id', 'role']);
        });

        // Team Invitations Table
        Schema::create('team_invitations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->string('email');
            $table->enum('role', ['admin', 'manager', 'member', 'viewer'])->default('member');
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->foreignUuid('invited_by_id')->nullable(); // User who sent invitation
            $table->timestamps();

            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('invited_by_id')->references('id')->on('users')->onDelete('set null');
            $table->unique(['team_id', 'email']);
            $table->index('token');
        });

        // Team Activity Log
        Schema::create('team_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id');
            $table->foreignUuid('user_id')->nullable(); // Using UUID for user_id
            $table->string('action'); // invite, join, leave, update, etc.
            $table->string('entity_type'); // User, Workflow, Tool, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('changes')->nullable(); // What changed
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null'); // Fixed: references UUID
            $table->index(['team_id', 'action']);
            $table->index(['entity_type', 'entity_id']); // For polymorphic relationships
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop in reverse order (child tables first)
        Schema::dropIfExists('team_activity_logs');
        Schema::dropIfExists('team_invitations');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }
};
