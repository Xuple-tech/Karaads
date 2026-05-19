<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresentationComment extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'presentation_id',
        'slide_id',
        'user_id',
        'body',
        'anchor',
        'resolved',
    ];

    protected $casts = [
        'anchor' => 'array',
        'resolved' => 'boolean',
    ];

    public function presentation(): BelongsTo
    {
        return $this->belongsTo(Presentation::class);
    }

    public function slide(): BelongsTo
    {
        return $this->belongsTo(PresentationSlide::class, 'slide_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
