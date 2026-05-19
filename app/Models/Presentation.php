<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Presentation extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'category',
        'theme_name',
        'status',
        'visibility',
        'slide_count',
        'view_count',
        'share_count',
        'is_template_based',
        'theme_config',
        'ai_metadata',
        'last_edited_at',
    ];

    protected $casts = [
        'theme_config' => 'array',
        'ai_metadata' => 'array',
        'is_template_based' => 'boolean',
        'last_edited_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function slides(): HasMany
    {
        return $this->hasMany(PresentationSlide::class)->orderBy('position');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PresentationComment::class);
    }

    public function collaborators(): HasMany
    {
        return $this->hasMany(PresentationCollaborator::class);
    }

    public function exports(): HasMany
    {
        return $this->hasMany(PresentationExport::class);
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(PresentationAnalytic::class);
    }
}
