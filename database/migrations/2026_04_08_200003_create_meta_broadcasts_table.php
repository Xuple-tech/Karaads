<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_broadcasts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('meta_account_id')->references('id')->on('meta_accounts')->cascadeOnDelete();
            $table->uuid('user_id');
            $table->string('name');
            $table->text('message');
            $table->enum('status', ['draft', 'sending', 'sent', 'failed'])->default('draft');
            $table->unsignedInteger('recipient_count')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['meta_account_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_broadcasts');
    }
};
