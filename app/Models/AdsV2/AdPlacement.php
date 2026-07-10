<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdPlacement extends Model
{
    use HasUuids;

    protected $table = 'ad_placements_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'surface',
        'slot',
        'source_type',
        'status',
        'adapter_id',
        'fallback_placement_id',
        'constraints',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'constraints' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function adapter(): BelongsTo
    {
        return $this->belongsTo(AdProviderAdapter::class, 'adapter_id');
    }

    public function fallbackPlacement(): BelongsTo
    {
        return $this->belongsTo(AdPlacement::class, 'fallback_placement_id');
    }
}
