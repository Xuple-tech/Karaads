<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('conversations')->where('mode', 'doc_builder')->delete();

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['document_content', 'document_type', 'doc_model']);
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->longText('document_content')->nullable()->after('context');
            $table->string('document_type', 64)->nullable()->after('document_content');
            $table->string('doc_model', 128)->nullable()->after('document_type');
        });
    }
};
