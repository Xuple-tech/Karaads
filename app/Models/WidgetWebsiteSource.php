<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WidgetWebsiteSource extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'widget_id',
        'user_id',
        'source_type',
        'site_name',
        'site_url',
        'site_host',
        'is_wordpress',
        'verification_method',
        'verification_token',
        'verification_status',
        'connection_token',
        'connection_secret',
        'plugin_connected_at',
        'crawl_status',
        'include_paths',
        'exclude_paths',
        'seed_urls',
        'settings',
        'metadata',
        'last_verified_at',
        'last_crawled_at',
        'last_sync_at',
        'next_recrawl_at',
        'is_active',
    ];

    protected $hidden = [
        'connection_secret',
    ];

    protected $casts = [
        'is_wordpress' => 'boolean',
        'include_paths' => 'array',
        'exclude_paths' => 'array',
        'seed_urls' => 'array',
        'settings' => 'array',
        'metadata' => 'array',
        'plugin_connected_at' => 'datetime',
        'last_verified_at' => 'datetime',
        'last_crawled_at' => 'datetime',
        'last_sync_at' => 'datetime',
        'next_recrawl_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function widget(): BelongsTo
    {
        return $this->belongsTo(WidgetConfig::class, 'widget_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pages(): HasMany
    {
        return $this->hasMany(WidgetWebsiteSourcePage::class, 'website_source_id');
    }
}
