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
        Schema::create('openrouter_api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('key')->unique();
            $table->string('model')->nullable();
            $table->integer('request_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('openrouter_api_keys');
    }
};
