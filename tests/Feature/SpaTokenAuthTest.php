<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class SpaTokenAuthTest extends TestCase
{
    public function test_spa_login_returns_bearer_token_and_authenticated_user(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $login = $this->postJson('/api/session/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');

        $this->assertIsString($token);
        $this->assertNotEmpty($token);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/session/user')
            ->assertOk()
            ->assertJsonPath('authenticated', true)
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_session_user_returns_unauthenticated_without_token(): void
    {
        $this->getJson('/api/session/user')
            ->assertOk()
            ->assertJsonPath('authenticated', false)
            ->assertJsonPath('user', null);
    }
}
