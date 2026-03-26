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
        Schema::create('conversations', function (Blueprint $table) {
            $table->char('id', 255)->primary(); // Using ULID for unique conversation ID
            $table->char('user_id', 255)->nullable(); // Assuming user_id is a ULID
            $table->string('title')->nullable();
            $table->text('context')->nullable();
            $table->timestamps();
        });

        // Adding foreign key constraint to user_id
        Schema::table('conversations', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
        // Create index for faster lookups
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('user_id');
        });
        // Create index for title for faster search
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('title');
        });
        // Create index for context for faster search
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('context');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
