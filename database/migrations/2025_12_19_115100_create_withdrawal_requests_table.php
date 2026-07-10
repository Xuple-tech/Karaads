<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('user_wallet_id')->constrained('user_wallets')->onDelete('cascade');
            $table->decimal('amount', 15, 6);
            $table->string('currency', 3)->default('NGN');
            $table->enum('payout_method', ['paypal', 'bank_transfer', 'crypto', 'payoneer']);
            $table->json('payout_details')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected', 'failed'])->default('pending');
            $table->datetime('processed_at')->nullable();
            $table->datetime('completed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('transaction_id')->nullable();
            $table->decimal('fee', 10, 6)->default(0);
            $table->decimal('net_amount', 15, 6)->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawal_requests');
    }
};
