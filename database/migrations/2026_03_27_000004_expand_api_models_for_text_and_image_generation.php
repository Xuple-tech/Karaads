<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('api_models', function (Blueprint $table) {
            $table->string('model_type')->default('text')->after('description');
            $table->boolean('supports_reasoning')->default(false)->after('max_context_tokens');
            $table->decimal('provider_input_price_per_1m_tokens', 12, 6)->nullable()->after('output_price_per_1m_tokens');
            $table->decimal('provider_output_price_per_1m_tokens', 12, 6)->nullable()->after('provider_input_price_per_1m_tokens');
            $table->decimal('price_per_image_usd', 12, 6)->nullable()->after('provider_output_price_per_1m_tokens');
            $table->decimal('provider_price_per_image_usd', 12, 6)->nullable()->after('price_per_image_usd');
        });

        $priceWithMarkup = static function (float $base): float {
            $markup = min(2.0, max(0.05, round($base * 0.5, 6)));

            return round($base + $markup, 6);
        };

        $now = now();

        DB::table('api_models')->upsert([
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4',
                'name' => 'Kwati 4',
                'description' => 'Flagship reasoning text model for high-depth tasks.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4.20-0309-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(2.00),
                'output_price_per_1m_tokens' => $priceWithMarkup(6.00),
                'provider_input_price_per_1m_tokens' => 2.00,
                'provider_output_price_per_1m_tokens' => 6.00,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4-fast',
                'name' => 'Kwati 4 Fast',
                'description' => 'Low-latency text model for fast non-reasoning completions.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4-1-fast-non-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(0.20),
                'output_price_per_1m_tokens' => $priceWithMarkup(0.50),
                'provider_input_price_per_1m_tokens' => 0.20,
                'provider_output_price_per_1m_tokens' => 0.50,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => false,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4.20-reasoning',
                'name' => 'Kwati 4.20 Reasoning',
                'description' => 'High-depth reasoning model mapped to Grok 4.20 reasoning.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4.20-0309-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(2.00),
                'output_price_per_1m_tokens' => $priceWithMarkup(6.00),
                'provider_input_price_per_1m_tokens' => 2.00,
                'provider_output_price_per_1m_tokens' => 6.00,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4.20-non-reasoning',
                'name' => 'Kwati 4.20 Non-Reasoning',
                'description' => 'High-capacity text model without reasoning overhead.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4.20-0309-non-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(2.00),
                'output_price_per_1m_tokens' => $priceWithMarkup(6.00),
                'provider_input_price_per_1m_tokens' => 2.00,
                'provider_output_price_per_1m_tokens' => 6.00,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => false,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4.20-multi-agent',
                'name' => 'Kwati 4.20 Multi-Agent',
                'description' => 'Reasoning-oriented text model optimized for multi-agent orchestration.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4.20-multi-agent-0309',
                'input_price_per_1m_tokens' => $priceWithMarkup(2.00),
                'output_price_per_1m_tokens' => $priceWithMarkup(6.00),
                'provider_input_price_per_1m_tokens' => 2.00,
                'provider_output_price_per_1m_tokens' => 6.00,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4.1-fast-reasoning',
                'name' => 'Kwati 4.1 Fast Reasoning',
                'description' => 'Fast reasoning text model for responsive complex prompts.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4-1-fast-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(0.20),
                'output_price_per_1m_tokens' => $priceWithMarkup(0.50),
                'provider_input_price_per_1m_tokens' => 0.20,
                'provider_output_price_per_1m_tokens' => 0.50,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => true,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-4.1-fast-non-reasoning',
                'name' => 'Kwati 4.1 Fast Non-Reasoning',
                'description' => 'Fast non-reasoning text model for low-latency generation.',
                'model_type' => 'text',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-4-1-fast-non-reasoning',
                'input_price_per_1m_tokens' => $priceWithMarkup(0.20),
                'output_price_per_1m_tokens' => $priceWithMarkup(0.50),
                'provider_input_price_per_1m_tokens' => 0.20,
                'provider_output_price_per_1m_tokens' => 0.50,
                'price_per_image_usd' => null,
                'provider_price_per_image_usd' => null,
                'max_context_tokens' => 2000000,
                'supports_reasoning' => false,
                'supports_streaming' => true,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-imagine-image',
                'name' => 'Kwati Imagine Image',
                'description' => 'Standard image generation model for general image outputs.',
                'model_type' => 'image',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-imagine-image',
                'input_price_per_1m_tokens' => 0,
                'output_price_per_1m_tokens' => 0,
                'provider_input_price_per_1m_tokens' => null,
                'provider_output_price_per_1m_tokens' => null,
                'price_per_image_usd' => $priceWithMarkup(0.02),
                'provider_price_per_image_usd' => 0.02,
                'max_context_tokens' => null,
                'supports_reasoning' => false,
                'supports_streaming' => false,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'public_id' => 'kwati-imagine-image-pro',
                'name' => 'Kwati Imagine Image Pro',
                'description' => 'Higher-quality image generation model for premium outputs.',
                'model_type' => 'image',
                'upstream_provider' => 'internal',
                'upstream_model' => 'grok-imagine-image-pro',
                'input_price_per_1m_tokens' => 0,
                'output_price_per_1m_tokens' => 0,
                'provider_input_price_per_1m_tokens' => null,
                'provider_output_price_per_1m_tokens' => null,
                'price_per_image_usd' => $priceWithMarkup(0.07),
                'provider_price_per_image_usd' => 0.07,
                'max_context_tokens' => null,
                'supports_reasoning' => false,
                'supports_streaming' => false,
                'supports_tools' => false,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ], ['public_id'], [
            'name',
            'description',
            'model_type',
            'upstream_provider',
            'upstream_model',
            'input_price_per_1m_tokens',
            'output_price_per_1m_tokens',
            'provider_input_price_per_1m_tokens',
            'provider_output_price_per_1m_tokens',
            'price_per_image_usd',
            'provider_price_per_image_usd',
            'max_context_tokens',
            'supports_reasoning',
            'supports_streaming',
            'supports_tools',
            'is_active',
            'updated_at',
        ]);
    }

    public function down(): void
    {
        DB::table('api_models')->whereIn('public_id', [
            'kwati-4.20-reasoning',
            'kwati-4.20-non-reasoning',
            'kwati-4.20-multi-agent',
            'kwati-4.1-fast-reasoning',
            'kwati-4.1-fast-non-reasoning',
            'kwati-imagine-image',
            'kwati-imagine-image-pro',
        ])->delete();

        Schema::table('api_models', function (Blueprint $table) {
            $table->dropColumn([
                'model_type',
                'supports_reasoning',
                'provider_input_price_per_1m_tokens',
                'provider_output_price_per_1m_tokens',
                'price_per_image_usd',
                'provider_price_per_image_usd',
            ]);
        });
    }
};
