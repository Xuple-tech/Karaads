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
        // Schema::table('image_generations', function (Blueprint $table) {
        //     // First, make sure the chat_id column is the right type
        //     if (Schema::hasColumn('image_generations', 'chat_id')) {
        //         $table->dropForeign(['chat_id']);
        //         $table->dropColumn('chat_id');
        //     }

        //     // Add the chat_id column with the correct type (UUID)
        //     $table->uuid('chat_id')->nullable();
        //     $table->foreign('chat_id')
        //           ->references('id')
        //           ->on('chats')
        //           ->onDelete('cascade');
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('image_generations', function (Blueprint $table) {
            $table->dropForeign(['chat_id']);
            $table->dropColumn('chat_id');
        });
    }
};
