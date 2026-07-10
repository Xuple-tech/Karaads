<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('live_streams')
            ->where('max_viewers', '<', 50)
            ->update(['max_viewers' => 50]);
    }

    public function down(): void
    {
        DB::table('live_streams')
            ->where('max_viewers', 50)
            ->update(['max_viewers' => 8]);
    }
};
