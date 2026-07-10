<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdExternalMapping extends Model
{
    use HasUuids;

    protected $table = 'ad_external_mappings';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'creative_id',
        'adapter_id',
        'external_campaign_id',
        'external_creative_id',
        'external_placement_key',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }

    public function adapter(): BelongsTo
    {
        return $this->belongsTo(AdProviderAdapter::class, 'adapter_id');
    }
}
