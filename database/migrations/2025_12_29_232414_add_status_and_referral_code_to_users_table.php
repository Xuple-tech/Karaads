<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned'])->default('active')->after('username');
            $table->string('referral_code')->unique()->nullable()->after('status');
            $table->uuid('referred_by')->nullable()->constrained('users')->onDelete('set null')->after('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'referral_code', 'referred_by']);
        });
    }
};
