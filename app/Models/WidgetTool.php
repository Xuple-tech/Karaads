<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetTool extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'widget_id',
        'tool_type',
        'name',
        'description',
        'endpoint_url',
        'method',
        'transport',
        'headers',
        'parameters',
        'configuration',
        'is_active',
    ];

    protected $casts = [
        'headers' => 'array',
        'parameters' => 'array',
        'configuration' => 'array',
        'is_active' => 'boolean',
    ];

    public function widget(): BelongsTo
    {
        return $this->belongsTo(WidgetConfig::class, 'widget_id');
    }
}
