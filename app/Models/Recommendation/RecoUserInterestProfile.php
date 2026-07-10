<?php

namespace App\Models\Recommendation;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoUserInterestProfile extends Model
{
    use HasUuids;

    protected $table = 'reco_user_interest_profiles';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'entity_type',
        'interests',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

