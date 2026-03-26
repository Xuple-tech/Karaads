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
        // First, let's make sure we have the base table
        if (!Schema::hasTable('image_generations')) {
            Schema::create('image_generations', function (Blueprint $table) {
                $table->id();
                $table->uuid('user_id')->nullable();
                $table->string('ip_address')->nullable();
                $table->string('email')->nullable();
                $table->text('prompt')->nullable();
                $table->text('image_url')->nullable();
                $table->uuid('chat_id')->nullable();
                $table->timestamps();

                // $table->foreign('chat_id')
                //       ->references('id')
                //       ->on('chats')
                //       ->onDelete('cascade');

                // $table->foreign('user_id')
                //       ->references('id')
                //       ->on('users')
                //       ->onDelete('set null');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('image_generations');
    }
};
