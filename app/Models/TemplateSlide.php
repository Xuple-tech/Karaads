<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateSlide extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'presentation_template_id',
        'title',
        'position',
        'layout',
        'summary',
        'canvas_settings',
        'elements',
    ];

    protected $casts = [
        'canvas_settings' => 'array',
        'elements' => 'array',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'presentation_template_id');
    }
}
