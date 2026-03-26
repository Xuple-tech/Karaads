<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentWidgetSettings extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'agent_id',
        'widget_script_url',
        'injection_method', // 'manual', 'auto_inject'
        'auto_inject_selector',
        'trigger_method', // 'click', 'hover', 'delay', 'scroll', 'exit_intent'
        'trigger_delay_seconds',
        'show_on_mobile',
        'show_on_desktop',
        'language_detection',
        'geolocation_enabled',
        'custom_css',
        'custom_js',
        'widget_config',
    ];

    protected $casts = [
        'show_on_mobile' => 'boolean',
        'show_on_desktop' => 'boolean',
        'language_detection' => 'boolean',
        'geolocation_enabled' => 'boolean',
        'widget_config' => 'array',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class);
    }
}
