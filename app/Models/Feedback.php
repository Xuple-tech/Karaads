<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasUlids;
    protected $keyType =  'string';
    protected $fillable = [
        'rating',
        'message',
        'userid'
    ];
    function User() : BelongsTo {
        return $this->belongsTo(User::class, 'userid');
    }
}
