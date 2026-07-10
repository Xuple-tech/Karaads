<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_download_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('platform', 20)->default('android'); // android, ios, unknown
            $table->timestamps();

            $table->index('created_at');
            $table->index('platform');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_download_tracks');
    }
};
