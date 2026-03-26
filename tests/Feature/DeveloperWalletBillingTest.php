<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DeveloperApiBillingService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DeveloperWalletBillingTest extends TestCase
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
            $table->rememberToken()->nullable();
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
    }

    public function test_credit_wallet_is_idempotent_for_the_same_external_reference(): void
    {
        $user = User::factory()->create();
        $billing = app(DeveloperApiBillingService::class);

        $first = $billing->creditWallet(
            $user,
            25.00,
            'topup',
            'Stripe top-up',
            ['stripe_checkout_session_id' => 'cs_test_123'],
            'cs_test_123'
        );

        $second = $billing->creditWallet(
            $user,
            25.00,
            'topup',
            'Stripe top-up',
            ['stripe_checkout_session_id' => 'cs_test_123'],
            'cs_test_123'
        );

        $wallet = $billing->getOrCreateWallet($user)->fresh();

        $this->assertSame($first->id, $second->id);
        $this->assertSame('25.000000', $wallet->balance_usd);
        $this->assertDatabaseCount('developer_credit_ledgers', 1);
    }

    public function test_negative_adjustment_updates_debit_totals(): void
    {
        $user = User::factory()->create();
        $billing = app(DeveloperApiBillingService::class);

        $billing->creditWallet($user, 20.00, 'topup', 'Initial credit');
        $billing->adjustWallet($user, -5.00, 'Manual debit');

        $wallet = $billing->getOrCreateWallet($user)->fresh();

        $this->assertSame('15.000000', $wallet->balance_usd);
        $this->assertSame('20.000000', $wallet->lifetime_credited_usd);
        $this->assertSame('5.000000', $wallet->lifetime_debited_usd);
    }
}
