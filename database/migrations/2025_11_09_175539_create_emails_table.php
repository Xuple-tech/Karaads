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
        Schema::create('emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_account_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique();
            $table->string('subject');
            $table->text('body_text')->nullable();
            $table->text('body_html')->nullable();
            $table->json('from');
            $table->json('to');
            $table->json('cc')->nullable();
            $table->json('bcc')->nullable();
            $table->json('attachments')->nullable();
            $table->dateTime('sent_at'); // Changed to datetime
            $table->dateTime('received_at'); // Changed to datetime
            $table->boolean('is_read')->default(false);
            $table->string('folder')->default('INBOX');
            $table->json('labels')->nullable();
            $table->json('ai_analysis')->nullable();
            $table->timestamps();
            $table->index(['email_account_id', 'received_at']);
            $table->index(['email_account_id', 'is_read']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emails');
    }
};
