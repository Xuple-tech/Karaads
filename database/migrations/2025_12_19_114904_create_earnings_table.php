<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('earnings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('ad_id')->nullable();
            $table->uuid('ad_space_id')->nullable();
            $table->uuid('ad_interaction_id')->nullable();
            $table->foreignUuid('post_id')->nullable()->constrained('posts')->onDelete('cascade');
            $table->enum('earning_type', ['ad_impression', 'ad_click', 'ad_conversion', 'content_creator', 'referral', 'bonus'])->default('bonus');
            $table->decimal('amount', 15, 6);
            $table->string('currency', 3)->default('NGN');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'processing', 'paid', 'failed'])->default('pending');
            $table->datetime('paid_at')->nullable();
            $table->string('payout_method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->decimal('split_percentage', 6, 4)->nullable();
            $table->decimal('base_amount', 15, 6)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('earnings');
    }
};
