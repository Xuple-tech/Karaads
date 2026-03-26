<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectVersion extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'user_id',
        'version_number',
        'title',
        'description',
        'changes',
        'data',
    ];

    protected $casts = [
        'changes' => 'array',
        'data' => 'array',
    ];

    /**
     * Get the project
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    /**
     * Get the user who created this version
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get next version number
     */
    public static function getNextVersion(string $projectId): string
    {
        $latest = self::where('project_id', $projectId)
            ->latest('version_number')
            ->first();

        if (!$latest) {
            return '1.0.0';
        }

        $parts = explode('.', $latest->version_number);
        $parts[2]++;

        return implode('.', $parts);
    }
}
