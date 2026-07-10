<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reporter_id')->nullable();
            $table->uuid('post_id')->nullable();
            $table->uuid('comment_id')->nullable();
            $table->string('reason', 120);
            $table->text('details')->nullable();
            $table->enum('status', ['open', 'resolved'])->default('open');
            $table->uuid('reviewed_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_note')->nullable();
            $table->timestamps();

            $table->foreign('reporter_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
            $table->foreign('comment_id')->references('id')->on('comments')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('admins')->nullOnDelete();

            $table->index(['status', 'created_at']);
            $table->index(['post_id', 'status']);
            $table->index(['comment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reports');
    }
};
