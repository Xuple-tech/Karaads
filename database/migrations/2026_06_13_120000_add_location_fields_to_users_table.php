<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'country')) {
                $table->string('country', 120)->nullable()->after('ip_address');
            }

            if (! Schema::hasColumn('users', 'state')) {
                $table->string('state', 120)->nullable()->after('country');
            }

            if (! Schema::hasColumn('users', 'location')) {
                $table->string('location', 180)->nullable()->after('state');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            foreach (['location', 'state', 'country'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
