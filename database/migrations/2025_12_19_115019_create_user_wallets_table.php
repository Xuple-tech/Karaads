<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->decimal('balance', 15, 6)->default(0);
            $table->decimal('total_earned', 15, 6)->default(0);
            $table->decimal('total_withdrawn', 15, 6)->default(0);
            $table->decimal('pending_withdrawal', 15, 6)->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->string('payout_method')->nullable();
            $table->json('payout_details')->nullable();
            $table->decimal('min_payout_amount', 10, 2)->default(10.00);
            $table->datetime('last_payout_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_wallets');
    }
};
