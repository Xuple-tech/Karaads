<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('agent_messages', function (Blueprint $table) {
            $table->json('tool_calls')->nullable()->after('content');
            $table->json('tool_responses')->nullable()->after('tool_calls');
            $table->index(['sender_type', 'created_at']);
        });
    }

    public function down()
    {
        Schema::table('agent_messages', function (Blueprint $table) {
            $table->dropColumn(['tool_calls', 'tool_responses']);
            $table->dropIndex(['sender_type', 'created_at']);
        });
    }
};
