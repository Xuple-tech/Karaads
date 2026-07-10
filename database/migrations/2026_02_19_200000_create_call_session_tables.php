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
        Schema::create('call_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('conversation_id');
            $table->uuid('initiator_id');
            $table->enum('mode', ['video', 'audio'])->default('video');
            $table->enum('status', ['ringing', 'accepted', 'ended', 'declined'])->default('ringing');
            $table->unsignedTinyInteger('max_participants')->default(8);
            $table->string('join_token_hash')->nullable();
            $table->timestamp('join_token_expires_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('record_persisted_at')->nullable();
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->foreign('initiator_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['conversation_id', 'status']);
            $table->index(['initiator_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('call_session_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('call_session_id');
            $table->uuid('user_id');
            $table->enum('role', ['initiator', 'participant'])->default('participant');
            $table->enum('invite_source', ['conversation_default', 'direct_invite', 'link_request'])->default('direct_invite');
            $table->enum('state', ['invited', 'joined', 'declined', 'left', 'kicked'])->default('invited');
            $table->uuid('invited_by_user_id')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('left_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->foreign('call_session_id')->references('id')->on('call_sessions')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('invited_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->unique(['call_session_id', 'user_id']);
            $table->index(['call_session_id', 'state']);
            $table->index(['user_id', 'state']);
        });

        Schema::create('call_join_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('call_session_id');
            $table->uuid('requested_by_user_id');
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
            $table->uuid('decided_by_user_id')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('call_session_id')->references('id')->on('call_sessions')->onDelete('cascade');
            $table->foreign('requested_by_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('decided_by_user_id')->references('id')->on('users')->nullOnDelete();
            $table->index(['call_session_id', 'status']);
            $table->index(['requested_by_user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_join_requests');
        Schema::dropIfExists('call_session_participants');
        Schema::dropIfExists('call_sessions');
    }
};
