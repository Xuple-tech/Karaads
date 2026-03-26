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
        Schema::create('project_file_shares', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('project_file_id')->constrained('project_files')->onDelete('cascade');
            $table->foreignUlid('shared_with_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('permission', ['view', 'download', 'edit'])->default('view');
            $table->dateTime('expires_at')->nullable();
            $table->boolean('is_public_link')->default(false);
            $table->string('public_token')->unique()->nullable();
            $table->timestamps();

            $table->unique(['project_file_id', 'shared_with_user_id']);
            $table->index(['shared_with_user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_file_shares');
    }
};
