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
        'model_type',
        'upstream_provider',
        'upstream_model',
        'input_price_per_1m_tokens',
        'output_price_per_1m_tokens',
        'provider_input_price_per_1m_tokens',
        'provider_output_price_per_1m_tokens',
        'price_per_image_usd',
        'provider_price_per_image_usd',
        'max_context_tokens',
        'supports_reasoning',
        'supports_streaming',
        'supports_tools',
        'is_active',
    ];

    protected $casts = [
        'model_type' => 'string',
        'input_price_per_1m_tokens' => 'decimal:6',
        'output_price_per_1m_tokens' => 'decimal:6',
        'provider_input_price_per_1m_tokens' => 'decimal:6',
        'provider_output_price_per_1m_tokens' => 'decimal:6',
        'price_per_image_usd' => 'decimal:6',
        'provider_price_per_image_usd' => 'decimal:6',
        'supports_reasoning' => 'boolean',
        'supports_streaming' => 'boolean',
        'supports_tools' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function isTextModel(): bool
    {
        return $this->model_type === 'text';
    }

    public function isImageModel(): bool
    {
        return $this->model_type === 'image';
    }

    public function usageRecords(): HasMany
    {
        return $this->hasMany(DeveloperUsageRecord::class);
    }
}
