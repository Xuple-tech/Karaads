<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdInteraction extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'ad_id',
        'ad_space_id',
        'user_id',
        'post_id',
        'interaction_type',
        'ip_address',
        'user_agent',
        'referrer',
        'country',
        'city',
        'device_type',
        'duration',
        'converted',
        'conversion_value',
    ];

    protected $casts = [
        'converted' => 'boolean',
        'conversion_value' => 'decimal:2',
        'duration' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const TYPE_IMPRESSION = 'impression';
    const TYPE_CLICK = 'click';
    const TYPE_VIEW = 'view';
    const TYPE_ENGAGEMENT = 'engagement';

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function adSpace(): BelongsTo
    {
        return $this->belongsTo(AdSpace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}