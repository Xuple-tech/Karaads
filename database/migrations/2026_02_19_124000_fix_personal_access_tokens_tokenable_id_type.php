<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('personal_access_tokens')) {
            return;
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $column = DB::selectOne("SHOW COLUMNS FROM personal_access_tokens LIKE 'tokenable_id'");

        if (! $column) {
            return;
        }

        $type = strtolower((string) $column->Type);

        // Old Sanctum tables commonly have BIGINT tokenable_id, which breaks UUID/ULID user IDs.
        if (str_contains($type, 'bigint') || str_contains($type, 'int(')) {
            DB::statement('ALTER TABLE personal_access_tokens MODIFY tokenable_id CHAR(36) NOT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('personal_access_tokens')) {
            return;
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $column = DB::selectOne("SHOW COLUMNS FROM personal_access_tokens LIKE 'tokenable_id'");

        if (! $column) {
            return;
        }

        $type = strtolower((string) $column->Type);

        if (str_contains($type, 'char(36)') || str_contains($type, 'varchar(36)')) {
            DB::statement('ALTER TABLE personal_access_tokens MODIFY tokenable_id BIGINT UNSIGNED NOT NULL');
        }
    }
};
