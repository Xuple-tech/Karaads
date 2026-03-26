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
        Schema::table('users', function (Blueprint $table) {
            // Chat personalization preferences (1-10 scale)
            $table->integer('tone_level')->default(5)->comment('1=Formal to 10=Casual'); // after ai_mode_id
            $table->integer('detail_level')->default(5)->comment('1=Brief to 10=Detailed');
            $table->integer('response_length')->default(5)->comment('1=Short to 10=Long');

            // Add these columns after existing columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tone_level', 'detail_level', 'response_length']);
        });
    }
};
