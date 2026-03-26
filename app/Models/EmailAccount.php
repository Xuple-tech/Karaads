<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailAccount extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'email_address',
        'credentials',
        'settings',
        'is_active',
        'last_synced_at',
    ];

    protected $casts = [
        'credentials' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'last_synced_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function emails(): HasMany
    {
        return $this->hasMany(Email::class);
    }

    public function rules(): HasMany
    {
        return $this->hasMany(EmailRule::class);
    }

    public function getProviderInstance()
    {
        return match ($this->provider) {
            'gmail' => app(\App\Services\EmailProviders\GmailProvider::class, ['account' => $this]),
            'outlook' => app(\App\Services\EmailProviders\OutlookProvider::class, ['account' => $this]),
            'imap' => app(\App\Services\EmailProviders\ImapProvider::class, ['account' => $this]),
            default => throw new \InvalidArgumentException("Unsupported provider: {$this->provider}"),
        };
    }
}
