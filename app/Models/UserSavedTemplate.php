<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSavedTemplate extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'presentation_template_id',
        'customizations',
        'last_used_at',
    ];

    protected $casts = [
        'customizations' => 'array',
        'last_used_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(PresentationTemplate::class, 'presentation_template_id');
    }
}
