<?php

namespace App\Models\Recommendation;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RecoSurfaceConfig extends Model
{
    use HasUuids;

    protected $table = 'reco_surface_configs';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'entity_type',
        'surface',
        'slot',
        'is_active',
        'rollout_mode',
        'canary_percentage',
        'weights',
        'thresholds',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'canary_percentage' => 'integer',
            'weights' => 'array',
            'thresholds' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
