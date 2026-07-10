<?php

namespace App\Models\Recommendation;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoUserEntityStatsDaily extends Model
{
    use HasUuids;

    protected $table = 'reco_user_entity_stats_daily';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'date',
        'user_id',
        'entity_type',
        'entity_id',
        'impressions',
        'views',
        'clicks',
        'completions',
        'dismissals',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

