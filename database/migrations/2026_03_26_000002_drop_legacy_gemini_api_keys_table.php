<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('gemini_api_keys');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Legacy table intentionally not recreated.
    }
};
