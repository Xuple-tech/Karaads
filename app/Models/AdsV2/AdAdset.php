<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdAdset extends Model
{
    use HasUuids;

    protected $table = 'ad_adsets_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'campaign_id',
        'name',
        'status',
        'budget_total',
        'budget_daily',
        'bid_amount',
        'placement_scope',
        'targeting',
        'start_at',
        'end_at',
    ];

    protected function casts(): array
    {
        return [
            'budget_total' => 'decimal:6',
            'budget_daily' => 'decimal:6',
            'bid_amount' => 'decimal:6',
            'placement_scope' => 'array',
            'targeting' => 'array',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }
}
