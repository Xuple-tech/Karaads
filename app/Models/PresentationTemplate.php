<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresentationTemplate extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'category',
        'thumbnail_url',
        'preview_image_url',
        'description',
        'slides_count',
        'is_featured',
        'is_trending',
        'is_recommended',
        'is_system',
        'usage_count',
        'theme_config',
        'color_palette',
        'font_pair',
        'tags',
        'preview_mode',
        'structure',
        'template_format',
        'source_file_path',
        'source_file_name',
        'source_file_size',
        'source_file_mime_type',
        'is_powerpoint_template',
        'is_active',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'is_recommended' => 'boolean',
        'is_system' => 'boolean',
        'is_powerpoint_template' => 'boolean',
        'is_active' => 'boolean',
        'theme_config' => 'array',
        'color_palette' => 'array',
        'font_pair' => 'array',
        'tags' => 'array',
        'structure' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function slides(): HasMany
    {
        return $this->hasMany(TemplateSlide::class, 'presentation_template_id')->orderBy('position');
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(TemplateBlock::class, 'presentation_template_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(TemplateFavorite::class, 'presentation_template_id');
    }

    public function saves(): HasMany
    {
        return $this->hasMany(UserSavedTemplate::class, 'presentation_template_id');
    }
}
