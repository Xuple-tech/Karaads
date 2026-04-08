<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AIMode extends Model
{
    use HasFactory;

    protected $table = 'ai_modes';

    protected $fillable = [
        'name',
        'system_prompt',
        'description',
        'emoji',
        'is_active',
        'is_automation_template',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_automation_template' => 'boolean',
        'display_order' => 'integer',
    ];

    /**
     * Get all users that use this mode
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'ai_mode_id');
    }

    /**
     * All active modes (chat + automation templates)
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('display_order');
    }

    /**
     * Only modes that appear in general chat (not WhatsApp bot templates)
     */
    public function scopeForChat($query)
    {
        return $query->where('is_active', true)
                     ->where('is_automation_template', false)
                     ->orderBy('display_order');
    }

    /**
     * Only automation/WhatsApp bot templates
     */
    public function scopeForAutomation($query)
    {
        return $query->where('is_active', true)
                     ->orderBy('display_order');
    }

    /**
     * Get mode by name
     */
    public static function getByName($name)
    {
        return self::where('name', $name)->first();
    }
}
