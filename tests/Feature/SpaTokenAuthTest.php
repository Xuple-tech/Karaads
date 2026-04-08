<?php

namespace Tests\Feature;

use App\Services\StripeService;
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

    public function test_spa_billing_portal_endpoint_accepts_bearer_auth_without_cookie_session(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('spa:v1')->plainTextToken;

        $this->mock(StripeService::class, function ($mock): void {
            $mock->shouldReceive('createBillingPortalSession')
                ->once()
                ->andReturn('https://billing.example.test/session');
        });

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/subscription/billing-portal')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('portal_url', 'https://billing.example.test/session');
    }

    public function test_protected_spa_endpoint_returns_json_unauthorized_for_invalid_token(): void
    {
        $this->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/subscription/my-subscription')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_spa_logout_deletes_current_token_and_session_probe_becomes_unauthenticated(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
        ]);

        $login = $this->postJson('/api/session/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/session/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertCount(0, $user->fresh()->tokens);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/session/user')
            ->assertOk()
            ->assertJsonPath('authenticated', false)
            ->assertJsonPath('user', null);
    }
}
