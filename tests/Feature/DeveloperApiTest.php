<?php

namespace Tests\Feature;

use App\Models\DeveloperUsageRecord;
use App\Models\User;
use App\Services\DeveloperApiBillingService;
use App\Services\DeveloperApiTokenService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DeveloperApiTest extends TestCase
{
    private string $developerApiBase = 'http://api.test';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');
        config()->set('developer-api.upstream.base_url', 'https://api.x.ai/v1');
        config()->set('developer-api.upstream.api_key', 'test-key');

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

        Schema::create('api_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('public_id')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('upstream_provider');
            $table->string('upstream_model');
            $table->decimal('input_price_per_1m_tokens', 12, 6)->default(0);
            $table->decimal('output_price_per_1m_tokens', 12, 6)->default(0);
            $table->unsignedInteger('max_context_tokens')->nullable();
            $table->boolean('supports_streaming')->default(true);
            $table->boolean('supports_tools')->default(false);
            $table->boolean('is_active')->default(true);
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

        Schema::create('developer_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->decimal('balance_usd', 12, 6)->default(0);
            $table->decimal('lifetime_credited_usd', 12, 6)->default(0);
            $table->decimal('lifetime_debited_usd', 12, 6)->default(0);
            $table->timestamps();
        });

        Schema::create('developer_credit_ledgers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('wallet_id');
            $table->uuid('user_id');
            $table->uuid('developer_api_key_id')->nullable();
            $table->string('type');
            $table->decimal('amount_usd', 12, 6);
            $table->decimal('balance_before_usd', 12, 6);
            $table->decimal('balance_after_usd', 12, 6);
            $table->string('external_reference')->nullable()->unique();
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('developer_usage_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('developer_api_key_id');
            $table->uuid('api_model_id');
            $table->string('request_id')->unique();
            $table->string('endpoint');
            $table->unsignedInteger('input_tokens')->default(0);
            $table->unsignedInteger('output_tokens')->default(0);
            $table->unsignedInteger('total_tokens')->default(0);
            $table->decimal('cost_usd', 12, 6)->default(0);
            $table->boolean('is_estimated_tokens')->default(false);
            $table->string('status')->default('success');
            $table->text('error_message')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->timestamps();
        });

        \DB::table('api_models')->insert([
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'public_id' => 'kwati-4',
                'name' => 'Kwati 4',
                'description' => 'General-purpose flagship text model.',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4-fast-reasoning',
                'input_price_per_1m_tokens' => 8.000000,
                'output_price_per_1m_tokens' => 24.000000,
                'max_context_tokens' => 128000,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'public_id' => 'kwati-4-fast',
                'name' => 'Kwati 4 Fast',
                'description' => 'Fast low-latency text model.',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4-fast-non-reasoning',
                'input_price_per_1m_tokens' => 4.000000,
                'output_price_per_1m_tokens' => 12.000000,
                'max_context_tokens' => 128000,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    private function createDeveloperKeyForUser(User $user): array
    {
        return app(DeveloperApiTokenService::class)->createKey($user, 'Test Key');
    }

    public function test_it_only_responds_on_the_developer_api_subdomain(): void
    {
        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->getJson('http://localhost/v1/models');

        $response->assertNotFound();
    }

    public function test_it_authenticates_a_valid_developer_api_key_and_lists_models(): void
    {
        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->getJson($this->developerApiBase . '/v1/models');

        $response->assertOk()
            ->assertJsonPath('object', 'list')
            ->assertJsonFragment(['id' => 'kwati-4'])
            ->assertJsonFragment(['id' => 'kwati-4-fast']);
    }

    public function test_it_returns_authenticated_account_metadata(): void
    {
        $user = User::factory()->create();
        [$apiKey, $plainKey] = app(DeveloperApiTokenService::class)->createKey(
            $user,
            'Scoped Key',
            ['kwati-4-fast']
        );

        app(DeveloperApiBillingService::class)->creditWallet($user, 25, 'adjustment', 'Seed credits');

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->getJson($this->developerApiBase . '/v1/me');

        $response->assertOk()
            ->assertJsonPath('object', 'developer_account')
            ->assertJsonPath('key.id', $apiKey->id)
            ->assertJsonPath('key.prefix', $apiKey->key_prefix)
            ->assertJsonPath('key.allowed_model_ids.0', 'kwati-4-fast')
            ->assertJsonPath('wallet.balance_usd', 25);
    }

    public function test_it_rejects_malformed_revoked_and_expired_keys(): void
    {
        $user = User::factory()->create();
        [$apiKey, $plainKey] = $this->createDeveloperKeyForUser($user);

        $this
            ->withHeader('Authorization', 'Bearer malformed-key')
            ->getJson($this->developerApiBase . '/v1/me')
            ->assertStatus(401);

        $apiKey->update(['is_active' => false]);

        $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->getJson($this->developerApiBase . '/v1/me')
            ->assertStatus(401);

        [$expiredKey, $expiredPlain] = app(DeveloperApiTokenService::class)->createKey($user, 'Expired', null, now()->subMinute()->toIso8601String());
        $expiredKey->refresh();

        $this
            ->withHeader('Authorization', 'Bearer ' . $expiredPlain)
            ->getJson($this->developerApiBase . '/v1/me')
            ->assertStatus(401);
    }

    public function test_it_returns_chat_completions_in_openai_like_shape_and_debits_the_wallet(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([
                'id' => 'upstream-1',
                'object' => 'chat.completion',
                'choices' => [[
                    'message' => ['role' => 'assistant', 'content' => 'Hello from Kwati API'],
                    'finish_reason' => 'stop',
                ]],
                'usage' => [
                    'prompt_tokens' => 12,
                    'completion_tokens' => 5,
                    'total_tokens' => 17,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'adjustment', 'Seed credits');

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4-fast',
                'messages' => [
                    ['role' => 'user', 'content' => 'Say hello'],
                ],
                'temperature' => 0.7,
                'max_tokens' => 100,
            ]);

        $response->assertOk()
            ->assertJsonPath('object', 'chat.completion')
            ->assertJsonPath('model', 'kwati-4-fast')
            ->assertJsonPath('choices.0.message.role', 'assistant')
            ->assertJsonPath('usage.total_tokens', 17);

        $this->assertSame(1, DeveloperUsageRecord::count());
        $this->assertLessThan(10.0, (float) $user->developerWallet()->first()->balance_usd);
    }

    public function test_it_returns_402_when_credits_are_insufficient(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([], 200),
        ]);

        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4',
                'messages' => [
                    ['role' => 'user', 'content' => str_repeat('a', 5000)],
                ],
                'max_tokens' => 4000,
            ]);

        $response->assertStatus(402)
            ->assertJsonPath('error.code', 'insufficient_credits');
    }

    public function test_it_rejects_models_outside_the_key_scope(): void
    {
        $user = User::factory()->create();
        [, $plainKey] = app(DeveloperApiTokenService::class)->createKey(
            $user,
            'Restricted',
            ['kwati-4-fast']
        );
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'adjustment', 'Seed credits');

        $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4',
                'messages' => [
                    ['role' => 'user', 'content' => 'Use the restricted model'],
                ],
            ])
            ->assertStatus(400)
            ->assertJsonPath('error.code', 'invalid_request');
    }

    public function test_it_supports_sse_streaming_responses(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['role' => 'assistant', 'content' => 'streamed response'],
                    'finish_reason' => 'stop',
                ]],
                'usage' => [
                    'prompt_tokens' => 4,
                    'completion_tokens' => 2,
                    'total_tokens' => 6,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'adjustment', 'Seed credits');

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4-fast',
                'stream' => true,
                'messages' => [
                    ['role' => 'user', 'content' => 'stream this'],
                ],
            ]);

        $response->assertOk();
        $this->assertStringContainsString('text/event-stream', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('chat.completion.chunk', $response->streamedContent());
        $this->assertStringContainsString('[DONE]', $response->streamedContent());
    }

    public function test_it_falls_back_to_estimated_token_accounting_when_upstream_usage_is_missing(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['role' => 'assistant', 'content' => 'Estimated tokens path'],
                    'finish_reason' => 'stop',
                ]],
            ], 200),
        ]);

        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'adjustment', 'Seed credits');

        $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4-fast',
                'messages' => [
                    ['role' => 'user', 'content' => 'No usage counts'],
                ],
            ])
            ->assertOk();

        $this->assertTrue((bool) DeveloperUsageRecord::first()->is_estimated_tokens);
    }

    public function test_it_returns_usage_summary_for_the_authenticated_key(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['role' => 'assistant', 'content' => 'Usage summary response'],
                    'finish_reason' => 'stop',
                ]],
                'usage' => [
                    'prompt_tokens' => 9,
                    'completion_tokens' => 3,
                    'total_tokens' => 12,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();
        [, $plainKey] = $this->createDeveloperKeyForUser($user);
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'adjustment', 'Seed credits');

        $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->postJson($this->developerApiBase . '/v1/chat/completions', [
                'model' => 'kwati-4-fast',
                'messages' => [
                    ['role' => 'user', 'content' => 'Create usage record'],
                ],
            ])
            ->assertOk();

        $this
            ->withHeader('Authorization', 'Bearer ' . $plainKey)
            ->getJson($this->developerApiBase . '/v1/usage?days=30')
            ->assertOk()
            ->assertJsonPath('object', 'usage_summary')
            ->assertJsonPath('summary.requests', 1)
            ->assertJsonPath('summary.total_tokens', 12);
    }
}
