<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ai_modes', function (Blueprint $table) {
            $table->boolean('is_automation_template')->default(false)->after('is_active');
        });

        // Mark the WhatsApp bot templates as automation-only
        \App\Models\AIMode::whereIn('name', [
            'nigerian_legal', 'fashion_vendor', 'food_delivery',
            'logistics', 'real_estate', 'general_business',
        ])->update(['is_automation_template' => true]);
    }

    public function down(): void
    {
        Schema::table('ai_modes', function (Blueprint $table) {
            $table->dropColumn('is_automation_template');
        });
    }
};
