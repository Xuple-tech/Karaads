<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentPlan extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type', // 'per_site', 'per_agent', 'mixed'
        'stripe_product_id',
        'stripe_monthly_price_id',
        'stripe_yearly_price_id',
        'monthly_price',
        'yearly_price',
        'max_sites',
        'max_agents_per_site',
        'max_total_agents',
        'max_monthly_conversations',
        'max_daily_conversations',
        'max_monthly_messages',
        'knowledge_base_size_mb',
        'max_file_uploads',
        'custom_domains_allowed',
        'white_label_allowed',
        'api_access',
        'webhook_support',
        'advanced_analytics',
        'priority_support',
        'custom_branding',
        'sso_integration',
        'is_active',
        'display_order',
        'features',
        'limits',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'custom_domains_allowed' => 'boolean',
        'white_label_allowed' => 'boolean',
        'api_access' => 'boolean',
        'webhook_support' => 'boolean',
        'advanced_analytics' => 'boolean',
        'priority_support' => 'boolean',
        'custom_branding' => 'boolean',
        'sso_integration' => 'boolean',
        'features' => 'array',
        'limits' => 'array',
    ];

    public function siteSubscriptions(): HasMany
    {
        return $this->hasMany(SiteSubscription::class, 'plan_id');
    }

    public static function getFreePlan()
    {
        return self::where('slug', 'free')->first();
    }
}
