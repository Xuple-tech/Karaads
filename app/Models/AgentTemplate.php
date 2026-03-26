<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgentTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'category', // 'ecommerce', 'support', 'booking', 'education', 'healthcare'
        'industry',
        'default_config',
        'welcome_message',
        'suggested_questions',
        'tools_config',
        'knowledge_base_structure',
        'widget_settings',
        'is_active',
        'is_premium',
        'price',
        'created_by_admin_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
        'default_config' => 'array',
        'suggested_questions' => 'array',
        'tools_config' => 'array',
        'knowledge_base_structure' => 'array',
        'widget_settings' => 'array',
    ];

    public function agents(): HasMany
    {
        return $this->hasMany(AIAgent::class, 'template_id');
    }
}
