<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_monetizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('post_id')->unique()->constrained('posts')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_monetized')->default(false);
            $table->boolean('ad_integration')->default(false);
            $table->decimal('cpm_rate', 12, 6)->default(0.50);
            $table->decimal('cpc_rate', 12, 6)->default(0.05);
            $table->decimal('revenue_share', 6, 4)->default(0.60);
            $table->decimal('total_earnings', 15, 6)->default(0);
            $table->integer('total_impressions')->default(0);
            $table->integer('total_clicks')->default(0);
            $table->decimal('estimated_earnings', 15, 6)->default(0);
            $table->enum('monetization_status', ['active', 'paused', 'blocked'])->default('active');
            $table->integer('ad_spaces_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_monetizations');
    }
};