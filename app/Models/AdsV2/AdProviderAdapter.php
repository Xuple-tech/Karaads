<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdProviderAdapter extends Model
{
    use HasUuids;

    protected $table = 'ad_provider_adapters';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'provider_key',
        'adapter_type',
        'status',
        'config',
        'secrets',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'secrets' => 'encrypted:array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
