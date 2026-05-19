<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('presentation_templates', function (Blueprint $table) {
            $table->string('template_format')->nullable()->after('preview_mode');
            $table->string('source_file_path')->nullable()->after('template_format');
            $table->string('source_file_name')->nullable()->after('source_file_path');
            $table->unsignedBigInteger('source_file_size')->nullable()->after('source_file_name');
            $table->string('source_file_mime_type')->nullable()->after('source_file_size');
            $table->boolean('is_powerpoint_template')->default(false)->after('source_file_mime_type');
            $table->boolean('is_active')->default(true)->after('is_powerpoint_template');
        });
    }

    public function down(): void
    {
        Schema::table('presentation_templates', function (Blueprint $table) {
            $table->dropColumn([
                'template_format',
                'source_file_path',
                'source_file_name',
                'source_file_size',
                'source_file_mime_type',
                'is_powerpoint_template',
                'is_active',
            ]);
        });
    }
};
