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
        if (! Schema::hasTable('subscription_plan_features')) {
            Schema::create('subscription_plan_features', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('plan_id');
                $table->string('feature_key', 100);
                $table->string('feature_name');
                $table->text('description')->nullable();
                $table->integer('limit')->nullable();
                $table->string('limit_type')->nullable();
                $table->boolean('is_enabled')->default(true);
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('cascade');
                $table->index(['plan_id', 'feature_key']);
            });
        }

        $plans = DB::table('subscription_plans')->get();

        foreach ($plans as $plan) {
            $existing = DB::table('subscription_plan_features')
                ->where('plan_id', $plan->id)
                ->count();

            if ($existing > 0) {
                continue;
            }

            $capabilities = [
                'web_search' => [
                    'enabled' => true,
                    'label' => 'Web Search',
                    'description' => 'Let users search the web for current information.',
                ],
                'image_generation' => [
                    'enabled' => true,
                    'label' => 'Image Generation',
                    'description' => 'Allow users to generate images with AI models.',
                ],
                'api_access' => [
                    'enabled' => (bool) ($plan->supports_api ?? false),
                    'label' => 'API Access',
                    'description' => 'Allow programmatic access to the platform APIs.',
                ],
                'voice_chat' => [
                    'enabled' => (bool) ($plan->supports_voice ?? false),
                    'label' => 'Voice Chat',
                    'description' => 'Enable speech-based conversations and voice tools.',
                ],
                'email_automation' => [
                    'enabled' => (bool) ($plan->supports_email_automation ?? false),
                    'label' => 'Email Automation',
                    'description' => 'Enable email automation workflows.',
                ],
                'projects' => [
                    'enabled' => (bool) ($plan->supports_projects ?? false),
                    'label' => 'Projects',
                    'description' => 'Enable project and workspace management features.',
                ],
                'priority_support' => [
                    'enabled' => (bool) ($plan->priority_support ?? false),
                    'label' => 'Priority Support',
                    'description' => 'Give subscribers access to priority support handling.',
                ],
            ];

            foreach ($capabilities as $featureKey => $config) {
                if (! $config['enabled']) {
                    continue;
                }

                DB::table('subscription_plan_features')->insert([
                    'id' => (string) Str::uuid(),
                    'plan_id' => $plan->id,
                    'feature_key' => $featureKey,
                    'feature_name' => $config['label'],
                    'description' => $config['description'],
                    'limit' => null,
                    'limit_type' => null,
                    'is_enabled' => true,
                    'metadata' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $quotaRows = [
                ['feature_key' => 'requests', 'feature_name' => 'Requests', 'limit' => $plan->requests_per_day, 'limit_type' => 'daily'],
                ['feature_key' => 'requests', 'feature_name' => 'Requests', 'limit' => $plan->requests_per_month, 'limit_type' => 'monthly'],
                ['feature_key' => 'tokens', 'feature_name' => 'Tokens', 'limit' => $plan->tokens_per_day, 'limit_type' => 'daily'],
                ['feature_key' => 'tokens', 'feature_name' => 'Tokens', 'limit' => $plan->tokens_per_month, 'limit_type' => 'monthly'],
                ['feature_key' => 'images', 'feature_name' => 'Images', 'limit' => $plan->images_per_day, 'limit_type' => 'daily'],
                ['feature_key' => 'images', 'feature_name' => 'Images', 'limit' => $plan->images_per_month, 'limit_type' => 'monthly'],
            ];

            foreach ($quotaRows as $row) {
                if ($row['limit'] === null) {
                    continue;
                }

                DB::table('subscription_plan_features')->insert([
                    'id' => (string) Str::uuid(),
                    'plan_id' => $plan->id,
                    'feature_key' => $row['feature_key'],
                    'feature_name' => $row['feature_name'],
                    'description' => $row['feature_name'] . ' quota',
                    'limit' => $row['limit'],
                    'limit_type' => $row['limit_type'],
                    'is_enabled' => true,
                    'metadata' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_features');
    }
};
