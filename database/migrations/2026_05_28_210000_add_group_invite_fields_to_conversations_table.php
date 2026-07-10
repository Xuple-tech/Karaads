<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table): void {
            if (! Schema::hasColumn('conversations', 'invite_token')) {
                $table->string('invite_token', 80)->nullable()->unique()->after('avatar');
            }

            if (! Schema::hasColumn('conversations', 'invite_enabled')) {
                $table->boolean('invite_enabled')->default(true)->after('invite_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table): void {
            if (Schema::hasColumn('conversations', 'invite_token')) {
                $table->dropUnique(['invite_token']);
                $table->dropColumn('invite_token');
            }

            if (Schema::hasColumn('conversations', 'invite_enabled')) {
                $table->dropColumn('invite_enabled');
            }
        });
    }
};
