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
        Schema::table('api_usage_logs', function (Blueprint $table) {
            $table->string('ip_address')->nullable()->after('saas_owner_id');
            $table->string('country')->nullable()->after('ip_address');
            $table->index(['ip_address', 'created_at']);
            $table->index(['country', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api_usage_logs', function (Blueprint $table) {
            $table->dropIndex(['ip_address', 'created_at']);
            $table->dropIndex(['country', 'created_at']);
            $table->dropColumn(['ip_address', 'country']);
        });
    }
};
