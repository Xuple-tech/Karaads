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
        //     $table->text('prompt')->nullable(); // Store the prompt used to generate the image
        //     $table->text('image_url')->nullable(); // Store the URL of the generated image
        //     $table->foreignUuid('chat_id')->nullable()->constrained('chats')->onDelete('cascade'); // Link to chat message
        // });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('image_generations', function (Blueprint $table) {
            $table->dropColumn(['prompt', 'image_url']);
            $table->dropForeign(['chat_id']);
            $table->dropColumn('chat_id');
        });
    }
};
