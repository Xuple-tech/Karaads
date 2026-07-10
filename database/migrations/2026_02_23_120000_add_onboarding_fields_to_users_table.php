<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('email_verified_at');
            }

            if (! Schema::hasColumn('users', 'onboarding_interests')) {
                $table->json('onboarding_interests')->nullable()->after('bio');
            }

            if (! Schema::hasColumn('users', 'onboarding_completed_at')) {
                $table->timestamp('onboarding_completed_at')->nullable()->after('onboarding_interests');
                $table->index('onboarding_completed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'onboarding_completed_at')) {
                $table->dropIndex(['onboarding_completed_at']);
                $table->dropColumn('onboarding_completed_at');
            }

            if (Schema::hasColumn('users', 'onboarding_interests')) {
                $table->dropColumn('onboarding_interests');
            }

            if (Schema::hasColumn('users', 'birth_date')) {
                $table->dropColumn('birth_date');
            }
        });
    }
};
