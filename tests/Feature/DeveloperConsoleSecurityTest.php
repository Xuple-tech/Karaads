<?php

namespace Tests\Feature;

use App\Http\Middleware\AdminMiddleware;
use App\Models\User;
use App\Services\DeveloperApiTokenService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DeveloperConsoleSecurityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');

        Schema::dropAllTables();

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->nullable();
            $table->rememberToken()->nullable();
            $table->timestamps();
        });

        Schema::create('developer_api_keys', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('name');
            $table->string('key_prefix')->unique();
            $table->string('hashed_secret', 64);
            $table->text('notes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('last_rotated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('allowed_model_ids')->nullable();
            $table->timestamps();
        });

        Route::middleware(AdminMiddleware::class)->get('/__admin-gate-test', fn () => response('ok'));
    }

    public function test_non_admin_users_cannot_pass_admin_middleware(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get('/__admin-gate-test')
            ->assertRedirect(route('home'));
    }

    public function test_admin_users_can_pass_admin_middleware(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get('/__admin-gate-test')
            ->assertOk();
    }

    public function test_regenerating_a_developer_key_rotates_prefix_and_timestamp(): void
    {
        $user = User::factory()->create();
        $service = app(DeveloperApiTokenService::class);

        [$apiKey, $plainTextKey] = $service->createKey($user, 'Ops Key', ['kwati-4-fast'], null, 'Initial note');
        $originalPrefix = $apiKey->key_prefix;
        $originalHash = $apiKey->hashed_secret;

        sleep(1);

        [$rotatedKey, $rotatedPlainTextKey] = $service->regenerateKey($apiKey);

        $this->assertNotSame($plainTextKey, $rotatedPlainTextKey);
        $this->assertNotSame($originalPrefix, $rotatedKey->key_prefix);
        $this->assertNotSame($originalHash, $rotatedKey->hashed_secret);
        $this->assertNotNull($rotatedKey->last_rotated_at);
        $this->assertSame('Initial note', $rotatedKey->notes);
    }
}
