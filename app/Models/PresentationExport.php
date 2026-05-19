<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PresentationExport extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'presentation_id',
        'user_id',
        'format',
        'status',
        'file_path',
        'options',
        'completed_at',
    ];

    protected $casts = [
        'options' => 'array',
        'completed_at' => 'datetime',
    ];

    public function presentation(): BelongsTo
    {
        return $this->belongsTo(Presentation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
