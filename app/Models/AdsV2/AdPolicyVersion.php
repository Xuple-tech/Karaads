<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AdPolicyVersion extends Model
{
    use HasUuids;

    protected $table = 'ad_policy_versions';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'version',
        'status',
        'rules',
        'effective_at',
    ];

    protected function casts(): array
    {
        return [
            'rules' => 'array',
            'effective_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
