<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tool extends Model
{
    use HasUlids;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'category',
        'parameters',
        'return_schema',
        'icon_url',
        'is_active',
        'requires_api_key',
        'rate_limit',
        'configuration',
    ];

    protected $casts = [
        'parameters' => 'json',
        'return_schema' => 'json',
        'is_active' => 'boolean',
        'requires_api_key' => 'boolean',
        'configuration' => 'json',
    ];

    /**
     * Get agents that use this tool
     */
    public function agents(): BelongsToMany
    {
        return $this->belongsToMany(Agent::class, 'agent_tools')
            ->withPivot('configuration', 'permissions', 'is_enabled', 'sequence')
            ->withTimestamps();
    }

    /**
     * Get tool by name
     */
    public static function byName(string $name): ?self
    {
        return self::where('name', $name)->first();
    }

    /**
     * Get all active tools
     */
    public static function active()
    {
        return self::where('is_active', true);
    }

    /**
     * Get tools by category
     */
    public static function inCategory(string $category)
    {
        return self::where('category', $category)->where('is_active', true);
    }

    /**
     * Check if tool requires API key
     */
    public function needsApiKey(): bool
    {
        return $this->requires_api_key;
    }

    /**
     * Get tool parameters schema
     */
    public function getParametersSchema(): array
    {
        return $this->parameters ?? [];
    }

    /**
     * Get return schema
     */
    public function getReturnSchema(): array
    {
        return $this->return_schema ?? [];
    }
}
