<?php

namespace App\Models;

use App\Services\Media\MediaPathService;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BusinessPage extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'owner_user_id',
        'name',
        'slug',
        'category',
        'description',
        'avatar_path',
        'cover_path',
        'follower_count',
    ];

    protected function casts(): array
    {
        return [
            'follower_count' => 'integer',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'business_page_followers')
            ->withTimestamps();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->toPublicUrl($this->avatar_path);
    }

    public function getCoverUrlAttribute(): ?string
    {
        return $this->toPublicUrl($this->cover_path);
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return app(MediaPathService::class)->toUrl($path, 'public');
    }
}
