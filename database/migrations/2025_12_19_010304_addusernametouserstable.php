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
            // Add username column
            $table->string('username')->nullable()->after('email')->unique();
        });

        // Generate usernames for existing users
        $this->generateUsernamesForExistingUsers();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }

    /**
     * Generate unique usernames for existing users
     */
    private function generateUsernamesForExistingUsers(): void
    {
        // Get all existing users
        $users = DB::table('users')->get();

        foreach ($users as $user) {
            $username = $this->generateUniqueUsername($user);

            DB::table('users')
                ->where('id', $user->id)
                ->update(['username' => $username]);
        }

        // Make the username column not nullable after populating all records
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
        });
    }

    /**
     * Generate a unique username based on user data
     */
    private function generateUniqueUsername($user): string
    {
        // Try to create username from name
        $baseUsername = '';

        if (! empty($user->name)) {
            // Remove special characters and convert to lowercase
            $baseUsername = Str::slug($user->name, '');

            // If name results in empty string, use part of email
            if (empty($baseUsername)) {
                $baseUsername = Str::before($user->email, '@');
            }
        } else {
            // Use email prefix if name is not available
            $baseUsername = Str::before($user->email, '@');
        }

        // Clean the username - remove non-alphanumeric characters
        $baseUsername = preg_replace('/[^a-z0-9]/', '', strtolower($baseUsername));

        // If still empty, use a generic prefix
        if (empty($baseUsername)) {
            $baseUsername = 'user';
        }

        // Check if username exists and append numbers if needed
        $username = $baseUsername;
        $counter = 1;

        while (DB::table('users')->where('username', $username)->exists()) {
            $username = $baseUsername.$counter;
            $counter++;
        }

        return $username;
    }
};
