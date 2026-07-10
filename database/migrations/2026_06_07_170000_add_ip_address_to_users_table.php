<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'ip_address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('ip_address', 45)->nullable()->after('last_login_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'ip_address')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('ip_address');
            });
        }
    }
};
