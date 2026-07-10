<?php

namespace App\Models\Recommendation;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoModelTrainingHistory extends Model
{
    use HasUuids;

    protected $table = 'reco_model_training_history';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'config_id',
        'entity_type',
        'surface',
        'slot',
        'action',
        'model_version',
        'trained_at',
        'weights',
        'metrics',
    ];

    protected function casts(): array
    {
        return [
            'trained_at' => 'datetime',
            'weights' => 'array',
            'metrics' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function config(): BelongsTo
    {
        return $this->belongsTo(RecoSurfaceConfig::class, 'config_id');
    }
}

