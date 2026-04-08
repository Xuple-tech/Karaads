<?php

namespace App\Services;

use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanFeature;
use Illuminate\Support\Collection;

class PlanEntitlementService
{
    public const CAPABILITIES = [
        'web_search' => [
            'label' => 'Web Search',
            'description' => 'Let users search the web for current information.',
        ],
        'image_generation' => [
            'label' => 'Image Generation',
            'description' => 'Allow users to generate images with AI models.',
        ],
        'api_access' => [
            'label' => 'API Access',
            'description' => 'Allow programmatic access to the platform APIs.',
        ],
        'voice_chat' => [
            'label' => 'Voice Chat',
            'description' => 'Enable speech-based conversations and voice tools.',
        ],
        'email_automation' => [
            'label' => 'Email Automation',
            'description' => 'Enable email automation workflows.',
        ],
        'projects' => [
            'label' => 'Projects',
            'description' => 'Enable project and workspace management features.',
        ],
        'priority_support' => [
            'label' => 'Priority Support',
            'description' => 'Give subscribers access to priority support handling.',
        ],
    ];

    public const QUOTAS = [
        'requests' => [
            'label' => 'Requests',
            'description' => 'AI request volume limits.',
            'unit' => 'requests',
            'daily_column' => 'requests_per_day',
            'monthly_column' => 'requests_per_month',
            'usage_daily_field' => 'requests_used',
            'usage_monthly_field' => 'requests_used',
        ],
        'tokens' => [
            'label' => 'Tokens',
            'description' => 'Token consumption limits.',
            'unit' => 'tokens',
            'daily_column' => 'tokens_per_day',
            'monthly_column' => 'tokens_per_month',
            'usage_daily_field' => 'tokens_used',
            'usage_monthly_field' => 'tokens_used',
        ],
        'images' => [
            'label' => 'Images',
            'description' => 'Image generation limits.',
            'unit' => 'images',
            'daily_column' => 'images_per_day',
            'monthly_column' => 'images_per_month',
            'usage_daily_field' => 'images_generated',
            'usage_monthly_field' => 'images_generated',
        ],
        'voice_messages' => [
            'label' => 'Voice Messages',
            'description' => 'Voice message volume limits.',
            'unit' => 'messages',
            'daily_column' => null,
            'monthly_column' => null,
            'usage_daily_field' => 'voice_messages',
            'usage_monthly_field' => 'voice_messages',
        ],
        'emails_processed' => [
            'label' => 'Emails Processed',
            'description' => 'Email automation throughput limits.',
            'unit' => 'emails',
            'daily_column' => null,
            'monthly_column' => null,
            'usage_daily_field' => 'emails_processed',
            'usage_monthly_field' => 'emails_processed',
        ],
    ];

    public function getCapabilityDefinitions(): array
    {
        return self::CAPABILITIES;
    }

    public function getQuotaDefinitions(): array
    {
        return self::QUOTAS;
    }

    public function getKnownFeatureKeys(): array
    {
        return array_merge(array_keys(self::CAPABILITIES), array_keys(self::QUOTAS));
    }

    public function hasCapability(SubscriptionPlan $plan, string $key): bool
    {
        if (! array_key_exists($key, self::CAPABILITIES)) {
            return false;
        }

        return $plan->planFeatures()
            ->where('feature_key', $key)
            ->where('is_enabled', true)
            ->exists();
    }

    public function getQuotaLimit(SubscriptionPlan $plan, string $key, string $period): ?int
    {
        if (! array_key_exists($key, self::QUOTAS)) {
            return null;
        }

        return $plan->planFeatures()
            ->where('feature_key', $key)
            ->where('limit_type', $period)
            ->where('is_enabled', true)
            ->value('limit');
    }

    public function getPlanEntitlements(SubscriptionPlan $plan): array
    {
        $plan->loadMissing('planFeatures');

        $features = $plan->planFeatures;

        $capabilities = [];
        foreach (self::CAPABILITIES as $key => $definition) {
            $capabilities[] = [
                'key' => $key,
                'label' => $definition['label'],
                'description' => $definition['description'],
                'enabled' => $features->contains(fn (SubscriptionPlanFeature $feature) => $feature->feature_key === $key && $feature->is_enabled),
            ];
        }

        $quotas = [];
        foreach (self::QUOTAS as $key => $definition) {
            $daily = $features->first(fn (SubscriptionPlanFeature $feature) => $feature->feature_key === $key && $feature->limit_type === 'daily' && $feature->is_enabled);
            $monthly = $features->first(fn (SubscriptionPlanFeature $feature) => $feature->feature_key === $key && $feature->limit_type === 'monthly' && $feature->is_enabled);
            $total = $features->first(fn (SubscriptionPlanFeature $feature) => $feature->feature_key === $key && $feature->limit_type === 'total' && $feature->is_enabled);

            $quotas[] = [
                'key' => $key,
                'label' => $definition['label'],
                'description' => $definition['description'],
                'unit' => $definition['unit'],
                'daily' => $daily?->limit,
                'monthly' => $monthly?->limit,
                'total' => $total?->limit,
            ];
        }

        return [
            'capabilities' => $capabilities,
            'quotas' => $quotas,
        ];
    }

    public function syncPlanEntitlements(SubscriptionPlan $plan, array $capabilities, array $quotas): void
    {
        $plan->loadMissing('planFeatures');

        $knownKeys = $this->getKnownFeatureKeys();
        $plan->planFeatures()->whereIn('feature_key', $knownKeys)->delete();

        foreach ($capabilities as $key => $enabled) {
            if (! $enabled || ! array_key_exists($key, self::CAPABILITIES)) {
                continue;
            }

            $plan->planFeatures()->create([
                'feature_key' => $key,
                'feature_name' => self::CAPABILITIES[$key]['label'],
                'description' => self::CAPABILITIES[$key]['description'],
                'limit' => null,
                'limit_type' => null,
                'is_enabled' => true,
            ]);
        }

        foreach ($quotas as $key => $periods) {
            if (! array_key_exists($key, self::QUOTAS) || ! is_array($periods)) {
                continue;
            }

            foreach (['daily', 'monthly', 'total'] as $period) {
                $limit = $periods[$period] ?? null;

                if ($limit === null || $limit === '') {
                    continue;
                }

                $plan->planFeatures()->create([
                    'feature_key' => $key,
                    'feature_name' => self::QUOTAS[$key]['label'],
                    'description' => self::QUOTAS[$key]['description'],
                    'limit' => (int) $limit,
                    'limit_type' => $period,
                    'is_enabled' => true,
                ]);
            }
        }

        $this->syncCompatibilityMirrors($plan);
    }

    public function syncCompatibilityMirrors(SubscriptionPlan $plan): void
    {
        $attributes = [
            'supports_api' => $this->hasCapability($plan, 'api_access'),
            'supports_voice' => $this->hasCapability($plan, 'voice_chat'),
            'supports_email_automation' => $this->hasCapability($plan, 'email_automation'),
            'supports_projects' => $this->hasCapability($plan, 'projects'),
            'priority_support' => $this->hasCapability($plan, 'priority_support'),
        ];

        foreach (self::QUOTAS as $key => $definition) {
            if ($definition['daily_column']) {
                $attributes[$definition['daily_column']] = $this->getQuotaLimit($plan, $key, 'daily');
            }

            if ($definition['monthly_column']) {
                $attributes[$definition['monthly_column']] = $this->getQuotaLimit($plan, $key, 'monthly');
            }
        }

        $attributes['features'] = $this->buildLegacyFeatureList($plan);

        $plan->forceFill($attributes)->save();
    }

    public function buildLegacyFeatureList(SubscriptionPlan $plan): array
    {
        $entitlements = $this->getPlanEntitlements($plan);
        $items = [];

        foreach ($entitlements['capabilities'] as $capability) {
            if ($capability['enabled']) {
                $items[] = $capability['label'];
            }
        }

        foreach ($entitlements['quotas'] as $quota) {
            if ($quota['daily']) {
                $items[] = "{$quota['daily']} {$quota['unit']} per day";
            }

            if ($quota['monthly']) {
                $items[] = "{$quota['monthly']} {$quota['unit']} per month";
            }

            if ($quota['total']) {
                $items[] = "{$quota['total']} {$quota['unit']} total";
            }
        }

        return array_values(array_unique($items));
    }

    public function getDisplayFeatures(SubscriptionPlan $plan): array
    {
        return $this->buildLegacyFeatureList($plan);
    }

    public function getQuotaSummary(SubscriptionPlan $plan): array
    {
        $summary = [];

        foreach (self::QUOTAS as $key => $definition) {
            $summary[$key] = [
                'daily' => $this->getQuotaLimit($plan, $key, 'daily'),
                'monthly' => $this->getQuotaLimit($plan, $key, 'monthly'),
                'total' => $this->getQuotaLimit($plan, $key, 'total'),
                'label' => $definition['label'],
                'unit' => $definition['unit'],
            ];
        }

        return $summary;
    }

    public function serializePlanForAdmin(SubscriptionPlan $plan): array
    {
        $plan->loadMissing('planFeatures');

        return array_merge($plan->toArray(), [
            'entitlements' => $this->getPlanEntitlements($plan),
            'quota_summary' => $this->getQuotaSummary($plan),
            'display_features' => $this->getDisplayFeatures($plan),
        ]);
    }

    public function getMonthlyLimitForUsage(SubscriptionPlan $plan, string $key): ?int
    {
        return $this->getQuotaLimit($plan, $key, 'monthly');
    }

    public function getDailyLimitForUsage(SubscriptionPlan $plan, string $key): ?int
    {
        return $this->getQuotaLimit($plan, $key, 'daily');
    }
}
