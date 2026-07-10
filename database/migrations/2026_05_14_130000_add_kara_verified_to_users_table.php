<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'kara_verified_at')) {
                $table->timestamp('kara_verified_at')->nullable()->after('content_validation_agreed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'kara_verified_at')) {
                $table->dropColumn('kara_verified_at');
            }
        });
    }
};
