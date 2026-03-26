<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApiModel extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'public_id',
        'name',
        'description',
        'upstream_provider',
        'upstream_model',
        'input_price_per_1m_tokens',
        'output_price_per_1m_tokens',
        'max_context_tokens',
        'supports_streaming',
        'supports_tools',
        'is_active',
    ];

    protected $casts = [
        'input_price_per_1m_tokens' => 'decimal:6',
        'output_price_per_1m_tokens' => 'decimal:6',
        'supports_streaming' => 'boolean',
        'supports_tools' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function usageRecords(): HasMany
    {
        return $this->hasMany(DeveloperUsageRecord::class);
    }
}
