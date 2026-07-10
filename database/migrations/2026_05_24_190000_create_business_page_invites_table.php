<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_page_invites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_page_id')->constrained('business_pages')->cascadeOnDelete();
            $table->foreignUuid('inviter_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('invited_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 24)->default('pending');
            $table->timestamps();

            $table->unique(['business_page_id', 'invited_user_id']);
            $table->index(['invited_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_page_invites');
    }
};
