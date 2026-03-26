<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('developer_api_keys', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('hashed_secret');
            $table->timestamp('last_rotated_at')->nullable()->after('last_used_at');
        });
    }

    public function down(): void
    {
        Schema::table('developer_api_keys', function (Blueprint $table) {
            $table->dropColumn(['notes', 'last_rotated_at']);
        });
    }
};
