<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdRevenueSplit extends Model
{
    use HasUuids;

    protected $table = 'ad_revenue_splits';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'policy_version_id',
        'placement_id',
        'bucket',
        'percentage',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function policyVersion(): BelongsTo
    {
        return $this->belongsTo(AdPolicyVersion::class, 'policy_version_id');
    }

    public function placement(): BelongsTo
    {
        return $this->belongsTo(AdPlacement::class, 'placement_id');
    }
}
