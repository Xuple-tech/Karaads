<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresentationElement extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'slide_id',
        'type',
        'name',
        'position',
        'x',
        'y',
        'width',
        'height',
        'rotation',
        'z_index',
        'style',
        'content',
        'animation',
    ];

    protected $casts = [
        'style' => 'array',
        'content' => 'array',
        'animation' => 'array',
    ];

    public function slide(): BelongsTo
    {
        return $this->belongsTo(PresentationSlide::class, 'slide_id');
    }
}
