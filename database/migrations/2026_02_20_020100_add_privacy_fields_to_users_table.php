<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'message_policy')) {
                $table->enum('message_policy', ['everyone', 'followers', 'nobody'])
                    ->default('everyone')
                    ->after('bio');
            }

            if (! Schema::hasColumn('users', 'default_post_visibility')) {
                $table->enum('default_post_visibility', ['everyone', 'followers', 'private'])
                    ->default('everyone')
                    ->after('message_policy');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'default_post_visibility')) {
                $table->dropColumn('default_post_visibility');
            }

            if (Schema::hasColumn('users', 'message_policy')) {
                $table->dropColumn('message_policy');
            }
        });
    }
};

