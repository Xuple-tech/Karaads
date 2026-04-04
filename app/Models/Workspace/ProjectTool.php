<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTool extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'created_by',
        'name',
        'slug',
        'description',
        'type',
        'handler',
        'config',
        'input_schema',
        'output_schema',
        'status',
    ];

    protected $casts = [
        'config' => 'array',
        'input_schema' => 'array',
        'output_schema' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
