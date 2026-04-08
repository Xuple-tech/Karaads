<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meta_conversations', function (Blueprint $table) {
            $table->enum('crm_status', ['new', 'lead', 'customer', 'vip', 'closed'])->default('new')->after('is_archived');
            $table->json('tags')->nullable()->after('crm_status');
            $table->text('notes')->nullable()->after('tags');
        });
    }

    public function down(): void
    {
        Schema::table('meta_conversations', function (Blueprint $table) {
            $table->dropColumn(['crm_status', 'tags', 'notes']);
        });
    }
};
