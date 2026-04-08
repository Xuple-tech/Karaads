<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_reply_templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('meta_account_id')->references('id')->on('meta_accounts')->cascadeOnDelete();
            $table->uuid('user_id');
            $table->string('name');
            $table->text('content');
            $table->string('category')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['meta_account_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_reply_templates');
    }
};
