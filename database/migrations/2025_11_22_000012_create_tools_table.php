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
        Schema::create('tools', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name')->unique(); // web_search, file_read, file_create, api_call, web_fetch, code_execute
            $table->string('display_name');
            $table->text('description');
            $table->string('category'); // search, file, api, code, utility
            $table->json('parameters')->nullable(); // JSON schema of tool parameters
            $table->json('return_schema')->nullable(); // Expected return structure
            $table->string('icon_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_api_key')->default(false);
            $table->integer('rate_limit')->default(100); // per minute
            $table->json('configuration')->nullable(); // Default config for the tool
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
