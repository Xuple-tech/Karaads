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
        Schema::table('projects', function (Blueprint $table) {
            if (!Schema::hasColumn('projects', 'template_id')) {
                $table->ulid('template_id')->nullable()->after('category_id');
                $table->foreign('template_id')->references('id')->on('project_templates')->onDelete('set null');
            }

            if (!Schema::hasColumn('projects', 'logo')) {
                $table->string('logo')->nullable()->after('description');
            }

            if (!Schema::hasColumn('projects', 'visibility')) {
                $table->enum('visibility', ['private', 'shared', 'public'])->default('private')->after('logo');
            }

            if (!Schema::hasColumn('projects', 'status')) {
                $table->enum('status', ['active', 'archived', 'deleted'])->default('active')->after('visibility');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'template_id')) {
                $table->dropForeign(['template_id']);
                $table->dropColumn('template_id');
            }

            if (Schema::hasColumn('projects', 'logo')) {
                $table->dropColumn('logo');
            }

            if (Schema::hasColumn('projects', 'visibility')) {
                $table->dropColumn('visibility');
            }

            if (Schema::hasColumn('projects', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
