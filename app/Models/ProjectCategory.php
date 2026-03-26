<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectCategory extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'color',
        'description',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Projects::class, 'category_id');
    }

    /**
     * Generate slug from name
     */
    public static function generateSlug(string $name, int $userId): string
    {
        $slug = str($name)->slug('-');
        $originalSlug = (string) $slug;
        $count = 1;

        while (static::where('user_id', $userId)
            ->where('slug', (string) $slug)
            ->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return (string) $slug;
    }
}
