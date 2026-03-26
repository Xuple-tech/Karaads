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
        // Meta Accounts - stores linked Facebook/Instagram/WhatsApp accounts
        Schema::create('meta_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->enum('platform', ['facebook', 'instagram', 'whatsapp'])->index();
            $table->string('account_id')->unique(); // Meta's account ID
            $table->text('access_token'); // Changed from string to text
            $table->text('access_token_encrypted')->nullable(); // Changed from string to text
            $table->text('refresh_token')->nullable(); // Changed from string to text
            $table->string('page_id')->nullable(); // For Facebook/Instagram pages
            $table->string('account_name');
            $table->string('account_email')->nullable();
            $table->string('profile_picture_url')->nullable();
            $table->boolean('is_business_account')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('token_expires_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->json('platform_data')->nullable(); // Store platform-specific data
            $table->timestamps();
            $table->index(['user_id', 'platform']);
        });

        // Meta Messages - stores incoming/outgoing messages
        Schema::create('meta_messages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('meta_account_id');
            $table->foreign('meta_account_id')->references('id')->on('meta_accounts')->onDelete('cascade');
            $table->string('conversation_id')->index();
            $table->string('message_id')->unique();
            $table->enum('direction', ['incoming', 'outgoing'])->index();
            $table->string('sender_id');
            $table->string('sender_name')->nullable();
            $table->text('content');
            $table->json('media_attachments')->nullable();
            $table->enum('status', ['received', 'sent', 'read', 'failed'])->default('received');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'direction']);
        });

        // Meta Conversations - groups messages into conversations
        Schema::create('meta_conversations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('meta_account_id');
            $table->foreign('meta_account_id')->references('id')->on('meta_accounts')->onDelete('cascade');
            $table->string('conversation_id')->unique();
            $table->string('participant_id');
            $table->string('participant_name')->nullable();
            $table->text('last_message')->nullable();
            $table->integer('unread_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['meta_account_id', 'participant_id']);
        });

        // Meta Message Drafts - AI-generated message drafts
        Schema::create('meta_message_drafts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('meta_message_id')->nullable();
            $table->foreign('meta_message_id')->references('id')->on('meta_messages')->onDelete('cascade');
            $table->ulid('meta_conversation_id');
            $table->foreign('meta_conversation_id')->references('id')->on('meta_conversations')->onDelete('cascade');
            $table->text('original_message');
            $table->text('draft_reply');
            $table->text('ai_analysis')->nullable();
            $table->enum('sentiment', ['positive', 'negative', 'neutral'])->nullable();
            $table->enum('category', ['question', 'complaint', 'feedback', 'order', 'other'])->nullable();
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->enum('status', ['draft', 'approved', 'sent', 'rejected'])->default('draft');
            $table->boolean('auto_approved')->default(false);
            $table->json('user_modifications')->nullable();
            $table->timestamps();
        });

        // Meta Automation Preferences - user preferences for automation
        Schema::create('meta_automation_preferences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->ulid('meta_account_id')->nullable();
            $table->foreign('meta_account_id')->references('id')->on('meta_accounts')->onDelete('cascade');
            $table->boolean('enable_auto_reply')->default(false);
            $table->boolean('enable_message_analysis')->default(true);
            $table->boolean('require_approval_before_send')->default(true);
            $table->boolean('auto_archive_after_reply')->default(false);
            $table->enum('reply_tone', ['professional', 'friendly', 'casual', 'formal'])->default('professional');
            $table->text('custom_instructions')->nullable();
            $table->text('ai_prompt_template')->nullable();
            $table->integer('auto_reply_delay_seconds')->default(0);
            $table->json('enabled_platforms')->nullable(); // JSON array of platforms
            $table->boolean('is_global_preference')->default(false); // Apply to all accounts
            $table->timestamps();
            $table->unique(['user_id', 'meta_account_id']);
        });

        // Meta Automation Logs - track automation activities
        Schema::create('meta_automation_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->ulid('meta_account_id');
            $table->foreign('meta_account_id')->references('id')->on('meta_accounts')->onDelete('cascade');
            $table->ulid('meta_message_draft_id')->nullable();
            $table->foreign('meta_message_draft_id')->references('id')->on('meta_message_drafts')->onDelete('cascade');
            $table->enum('action', ['analyze', 'draft', 'approve', 'send', 'reject', 'sync', 'error'])->index();
            $table->text('description');
            $table->json('data')->nullable();
            $table->string('error_message')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_automation_logs');
        Schema::dropIfExists('meta_automation_preferences');
        Schema::dropIfExists('meta_message_drafts');
        Schema::dropIfExists('meta_conversations');
        Schema::dropIfExists('meta_messages');
        Schema::dropIfExists('meta_accounts');
    }
};
