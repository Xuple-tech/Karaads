<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPromptTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = ['user_id', 'name', 'prompt', 'description', 'category', 'variables', 'usage_count', 'is_active'];
    protected $casts = [
        'variables' => 'json',
        'is_active' => 'boolean',
    ];

    /**
     * Owner of the template (SaaS owner or null for system-wide)
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get system-wide templates
     */
    public static function getSystemTemplates()
    {
        return self::whereNull('user_id')->where('is_active', true)->get();
    }

    /**
     * Get templates for specific SaaS owner
     */
    public static function getForOwner($ownerId)
    {
        return self::where('user_id', $ownerId)->where('is_active', true)->get();
    }

    /**
     * Increment usage count
     */
    public function use()
    {
        $this->increment('usage_count');
    }

    /**
     * Replace variables in prompt
     */
    public function renderPrompt(array $variables = []): string
    {
        $prompt = $this->prompt;

        foreach ($variables as $key => $value) {
            $prompt = str_replace('{{' . $key . '}}', $value, $prompt);
        }

        return $prompt;
    }
}
