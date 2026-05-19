<?php

namespace Tests\Feature;

use App\Models\ApiModel;
use App\Models\DeveloperUsageRecord;
use App\Models\User;
use App\Services\DeveloperApiBillingService;
use App\Services\DeveloperApiModelCatalogService;
use App\Services\DeveloperApiTokenService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DeveloperApiTest extends TestCase
{
    public function test_models_endpoint_returns_branded_fallback_models_when_catalog_is_empty(): void
    {
        $this->assertSame(0, ApiModel::query()->count());

        $response = $this->getJson('/api/v1/models')
            ->assertOk()
            ->assertJsonPath('object', 'list');

        $models = $response->json('data');

        $this->assertCount(3, $models);
        $this->assertSame('kwati', $models[0]['id']);
        $this->assertSame('Kwati', $models[0]['name']);
        $this->assertArrayHasKey('supports_tools', $models[0]);
        $this->assertArrayHasKey('supports_streaming', $models[0]);
        $this->assertGreaterThanOrEqual(3, ApiModel::query()->count());
    }

    public function test_chat_completions_rejects_invalid_api_key(): void
    {
        $this->postJson('/api/v1/chat/completions', [
            'model' => 'grok-4-fast-non-reasoning',
            'messages' => [
                ['role' => 'user', 'content' => 'Hello'],
            ],
        ], [
            'Authorization' => 'Bearer invalid-key',
        ])->assertStatus(401)
            ->assertJsonPath('error.code', 'invalid_api_key');
    }

    public function test_chat_completions_returns_response_and_records_usage(): void
    {
        Http::fake([
            'https://api.x.ai/v1/chat/completions' => Http::response([
                'object' => 'chat.completion',
                'choices' => [[
                    'message' => ['content' => 'Hello from Kwati'],
                    'finish_reason' => 'stop',
                ]],
                'usage' => [
                    'prompt_tokens' => 1000,
                    'completion_tokens' => 500,
                ],
            ], 200),
        ]);

        $user = User::factory()->create();
        [$apiKey, $plainTextKey] = app(DeveloperApiTokenService::class)->createKey($user, 'Developer Test Key');
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'topup', 'Seed developer credits');

        $model = app(DeveloperApiModelCatalogService::class)->findTextModel('grok-4-fast-non-reasoning');
        $this->assertNotNull($model);

        $model->update([
            'input_price_per_1m_tokens' => 1,
            'output_price_per_1m_tokens' => 2,
        ]);

        $this->postJson('/api/v1/chat/completions', [
            'model' => 'kwati-fast',
            'messages' => [
                ['role' => 'user', 'content' => 'Say hello'],
            ],
        ], [
            'Authorization' => 'Bearer ' . $plainTextKey,
        ])->assertOk()
            ->assertJsonPath('object', 'chat.completion')
            ->assertJsonPath('model', 'grok-4-fast-non-reasoning')
            ->assertJsonPath('choices.0.message.content', 'Hello from Kwati')
            ->assertJsonPath('usage.prompt_tokens', 1000)
            ->assertJsonPath('usage.completion_tokens', 500);

        $this->assertDatabaseCount('developer_usage_records', 1);
        $this->assertSame(1, DeveloperUsageRecord::query()->count());
        $this->assertDatabaseHas('developer_wallets', [
            'user_id' => $user->id,
            'balance_usd' => 9.998000,
        ]);
    }

    public function test_chat_completions_rejects_streaming_until_real_streaming_is_supported(): void
    {
        $user = User::factory()->create();
        [, $plainTextKey] = app(DeveloperApiTokenService::class)->createKey($user, 'Developer Test Key');
        app(DeveloperApiBillingService::class)->creditWallet($user, 10, 'topup', 'Seed developer credits');

        $this->postJson('/api/v1/chat/completions', [
            'model' => 'grok-4-fast-non-reasoning',
            'messages' => [
                ['role' => 'user', 'content' => 'Hello'],
            ],
            'stream' => true,
        ], [
            'Authorization' => 'Bearer ' . $plainTextKey,
        ])->assertStatus(400)
            ->assertJsonPath('error.code', 'unsupported_feature');
    }

    public function test_developer_portal_can_create_api_key_with_branded_model_aliases(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from('/developer-api/keys')
            ->post('/developer-api/keys', [
                'name' => 'Portal Key',
                'allowed_model_ids' => ['kwati-fast', 'kwati-reasoning'],
            ])
            ->assertRedirect('/developer-api/keys')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('developer_api_keys', [
            'user_id' => $user->id,
            'name' => 'Portal Key',
        ]);

        $key = \App\Models\DeveloperApiKey::query()->where('user_id', $user->id)->firstOrFail();

        $this->assertSame(
            ['grok-4-fast-non-reasoning', 'grok-4-fast-reasoning'],
            $key->allowed_model_ids
        );
    }
}
