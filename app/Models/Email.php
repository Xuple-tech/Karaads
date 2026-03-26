<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Email extends Model
{
    protected $fillable = [
        'email_account_id',
        'message_id',
        'subject',
        'body_text',
        'body_html',
        'from',
        'to',
        'cc',
        'bcc',
        'attachments',
        'sent_at',
        'received_at',
        'is_read',
        'folder',
        'labels',
        'ai_analysis',
    ];

    protected $casts = [
        'from' => 'array',
        'to' => 'array',
        'cc' => 'array',
        'bcc' => 'array',
        'attachments' => 'array',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
        'is_read' => 'boolean',
        'labels' => 'array',
        'ai_analysis' => 'array',
    ];

    public function emailAccount(): BelongsTo
    {
        return $this->belongsTo(EmailAccount::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(EmailResponse::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeInFolder($query, $folder)
    {
        return $query->where('folder', $folder);
    }

    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    public function markAsUnread()
    {
        $this->update(['is_read' => false]);
    }
}
