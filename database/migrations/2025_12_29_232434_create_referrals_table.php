<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('referee_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->decimal('bonus_amount', 12, 6)->default(0);
            $table->text('notes')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('referrer_id');
            $table->index('referee_id');
            $table->index('status');
            $table->unique(['referrer_id', 'referee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
