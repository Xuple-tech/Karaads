<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ConsoleSurfaceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Config::set('database.default', 'sqlite');
        Config::set('database.connections.sqlite.database', ':memory:');
        Config::set('console.domain', null);
        Config::set('console.path_prefix', 'console');

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
    }

    public function test_console_home_redirects_guests_to_console_login(): void
    {
        $this->get('/console')
            ->assertRedirect('/console/login');
    }

    public function test_console_docs_are_publicly_readable(): void
    {
        $this->get('/console/docs')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('docs/index'));
    }

    public function test_console_docs_share_the_console_session_when_authenticated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'console')
            ->get('/console/docs/api')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('docs/api/index')
                ->where('auth.user.email', $user->email)
                ->where('console.base_url', fn (string $value) => str_ends_with($value, '/console'))
            );
    }

    public function test_legacy_developer_api_docs_route_redirects_to_console_docs(): void
    {
        $this->get('/docs/developer-api')
            ->assertRedirectContains('/console/docs/api');
    }
}
