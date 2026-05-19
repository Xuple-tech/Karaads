<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PresentationSlide extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'presentation_id',
        'title',
        'position',
        'layout',
        'speaker_notes',
        'canvas_settings',
    ];

    protected $casts = [
        'canvas_settings' => 'array',
    ];

    public function presentation(): BelongsTo
    {
        return $this->belongsTo(Presentation::class);
    }

    public function elements(): HasMany
    {
        return $this->hasMany(PresentationElement::class, 'slide_id')->orderBy('position');
    }
}
