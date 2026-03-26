<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaAccount extends Model
{
    use \Illuminate\Database\Eloquent\Concerns\HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'platform',
        'account_id',
        'access_token',
        'access_token_encrypted',
        'refresh_token',
        'page_id',
        'account_name',
        'account_email',
        'profile_picture_url',
        'is_business_account',
        'is_active',
        'token_expires_at',
        'last_sync_at',
        'platform_data',
    ];

    protected $casts = [
        'is_business_account' => 'boolean',
        'is_active' => 'boolean',
        'token_expires_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'platform_data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MetaMessage::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(MetaConversation::class);
    }

    public function preferences()
    {
        return $this->hasOne(MetaAutomationPreference::class);
    }

    public function isTokenExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }

    public function isWhatsAppBusinessAccount(): bool
    {
        return $this->platform === 'whatsapp' && $this->is_business_account;
    }
}
