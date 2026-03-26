<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteSubscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'site_id',
        'plan_id',
        'user_id',
        'stripe_subscription_id',
        'stripe_customer_id',
        'status', // 'active', 'canceled', 'past_due', 'trialing', 'incomplete'
        'billing_cycle', // 'monthly', 'yearly'
        'price',
        'currency',
        'starts_at',
        'expires_at',
        'canceled_at',
        'trial_ends_at',
        'metadata',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'canceled_at' => 'datetime',
        'trial_ends_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(AgentPlan::class, 'plan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
