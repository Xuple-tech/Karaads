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
        Schema::create('personalization_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('system_personalization_id')->nullable();
            $table->foreign('system_personalization_id')
                ->references('id')
                ->on('system_personalizations')
                ->onDelete('set null');

            $table->string('name')->unique(); // e.g., "Creative Professional", "Quick Responder"
            $table->text('description')->nullable();
            $table->string('emoji')->default('📝'); // Visual identifier

            // Default values for this template
            $table->integer('default_tone_level')->default(5);
            $table->integer('default_detail_level')->default(5);
            $table->integer('default_response_length')->default(5);

            // System personalization bound to this template
            // Users selecting this template inherit system constraints
            $table->boolean('is_system_template')->default(false); // Created by admin vs user
            $table->boolean('is_active')->default(true);
            $table->integer('usage_count')->default(0); // Track template popularity

            $table->timestamps();
            $table->softDeletes(); // Allow soft delete of templates
            $table->index(['system_personalization_id', 'is_active'], 'pers_templ_sys_pers_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personalization_templates');
    }
};
