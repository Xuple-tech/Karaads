<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeveloperUsageRecord extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'developer_api_key_id',
        'api_model_id',
        'request_id',
        'endpoint',
        'input_tokens',
        'output_tokens',
        'total_tokens',
        'cost_usd',
        'is_estimated_tokens',
        'status',
        'error_message',
        'ip_address',
        'user_agent',
        'request_payload',
        'response_payload',
    ];

    protected $casts = [
        'cost_usd' => 'decimal:6',
        'is_estimated_tokens' => 'boolean',
        'request_payload' => 'array',
        'response_payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(DeveloperApiKey::class, 'developer_api_key_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(ApiModel::class, 'api_model_id');
    }
}
