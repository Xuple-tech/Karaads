<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_requests', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('pending');
            $table->string('category', 50)->default('creator');
            $table->string('full_name');
            $table->string('username_snapshot');
            $table->string('contact_email');
            $table->text('reason');
            $table->string('portfolio_url')->nullable();
            $table->string('social_url')->nullable();
            $table->unsignedInteger('followers_count_snapshot')->default(0);
            $table->text('review_notes')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_requests');
    }
};
