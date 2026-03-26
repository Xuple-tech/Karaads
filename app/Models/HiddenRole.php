<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class HiddenRole extends Model
{
    use HasUlids;
    public $incrementing = false;
    protected $primaryKey = 'id';
    protected $table = 'hidden_roles';
    protected $fillable = ['id', 'user_id', 'permission_level', 'created_at', 'updated_at'];
}
