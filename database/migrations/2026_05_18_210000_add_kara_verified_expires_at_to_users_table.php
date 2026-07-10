<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'kara_verified_expires_at')) {
                $table->timestamp('kara_verified_expires_at')->nullable()->after('kara_verified_at');
            }
        });

        $driver = DB::connection()->getDriverName();
        $expiryExpression = match ($driver) {
            'sqlite' => "datetime(kara_verified_at, '+30 days')",
            'pgsql' => "kara_verified_at + interval '30 days'",
            default => 'DATE_ADD(kara_verified_at, INTERVAL 30 DAY)',
        };

        DB::table('users')
            ->whereNotNull('kara_verified_at')
            ->whereNull('kara_verified_expires_at')
            ->update([
                'kara_verified_expires_at' => DB::raw($expiryExpression),
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'kara_verified_expires_at')) {
                $table->dropColumn('kara_verified_expires_at');
            }
        });
    }
};
