<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WidgetConfig extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'name',
        'token',
        'bot_name',
        'greeting',
        'theme_color',
        'avatar_url',
        'system_prompt',
        'is_active',
        'allow_file_uploads',
        'allowed_domains',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'allow_file_uploads' => 'boolean',
        'allowed_domains' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(WidgetSession::class, 'widget_id');
    }

    public function knowledgeItems(): HasMany
    {
        return $this->hasMany(WidgetKnowledgeItem::class, 'widget_id');
    }

    public function tools(): HasMany
    {
        return $this->hasMany(WidgetTool::class, 'widget_id');
    }

    public static function generateToken(): string
    {
        do {
            $token = bin2hex(random_bytes(24));
        } while (self::where('token', $token)->exists());

        return $token;
    }
}
