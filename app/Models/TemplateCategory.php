<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class TemplateCategory extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'accent_color',
        'sort_order',
    ];
}
