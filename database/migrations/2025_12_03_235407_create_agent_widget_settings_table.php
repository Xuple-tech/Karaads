<?php
// database/migrations/xxxx_xx_xx_000008_create_agent_widget_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_widget_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');

            // Widget Script
            $table->string('widget_script_url')->nullable();

            // Injection Method
            $table->enum('injection_method', ['manual', 'auto_inject'])->default('manual');
            $table->string('auto_inject_selector')->nullable();

            // Trigger Settings
            $table->enum('trigger_method', ['click', 'hover', 'delay', 'scroll', 'exit_intent'])->default('click');
            $table->integer('trigger_delay_seconds')->default(0);

            // Display Settings
            $table->boolean('show_on_mobile')->default(true);
            $table->boolean('show_on_desktop')->default(true);
            $table->boolean('language_detection')->default(false);
            $table->boolean('geolocation_enabled')->default(false);

            // Custom Code
            $table->text('custom_css')->nullable();
            $table->text('custom_js')->nullable();

            // Configuration
            $table->json('widget_config')->nullable();

            $table->timestamps();

            // Indexes
            $table->unique('agent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_widget_settings');
    }
};
