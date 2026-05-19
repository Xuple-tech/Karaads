<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateFavorite extends Model
{
    use HasUlids;

    protected $table = 'favorites';

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'presentation_template_id',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'presentation_template_id');
    }
}
