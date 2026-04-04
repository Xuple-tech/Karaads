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
        Schema::create('conversation_shares', function (Blueprint $table) {
            $table->id();
            $table->char('conversation_id', 255);
            $table->string('share_token')->unique();
            $table->boolean('is_public')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('share_token');
            $table->index('conversation_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_shares');
    }
};
