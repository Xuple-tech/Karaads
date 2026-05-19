<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateBlock extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'presentation_template_id',
        'name',
        'type',
        'category',
        'description',
        'schema',
        'is_system',
    ];

    protected $casts = [
        'schema' => 'array',
        'is_system' => 'boolean',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'presentation_template_id');
    }
}
