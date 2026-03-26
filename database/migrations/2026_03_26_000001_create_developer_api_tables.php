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
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('allowed_model_ids')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('developer_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->decimal('balance_usd', 12, 6)->default(0);
            $table->decimal('lifetime_credited_usd', 12, 6)->default(0);
            $table->decimal('lifetime_debited_usd', 12, 6)->default(0);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
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

            $table->foreign('wallet_id')->references('id')->on('developer_wallets')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('developer_api_key_id')->references('id')->on('developer_api_keys')->nullOnDelete();
            $table->index(['user_id', 'type']);
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

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('developer_api_key_id')->references('id')->on('developer_api_keys')->onDelete('cascade');
            $table->foreign('api_model_id')->references('id')->on('api_models')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
        });

        DB::table('api_models')->insert([
            [
                'id' => (string) Str::uuid(),
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
                'id' => (string) Str::uuid(),
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

    public function down(): void
    {
        Schema::dropIfExists('developer_usage_records');
        Schema::dropIfExists('developer_credit_ledgers');
        Schema::dropIfExists('developer_wallets');
        Schema::dropIfExists('developer_api_keys');
        Schema::dropIfExists('api_models');
    }
};
