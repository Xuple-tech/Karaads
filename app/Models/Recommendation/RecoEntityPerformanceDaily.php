<?php

namespace App\Models\Recommendation;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RecoEntityPerformanceDaily extends Model
{
    use HasUuids;

    protected $table = 'reco_entity_performance_daily';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'date',
        'entity_type',
        'entity_id',
        'surface',
        'impressions',
        'views',
        'clicks',
        'completions',
        'dismissals',
        'ctr',
        'completion_rate',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'ctr' => 'decimal:6',
            'completion_rate' => 'decimal:6',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}

