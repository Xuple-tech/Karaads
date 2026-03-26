<?php
// app/Models/PodcastEpisode.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PodcastEpisode extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'topic',
        'script',
        'audio_path',
        'audio_url',
        'duration',
        'genre',
        'format',
        'voice',
        'status',
        'metadata'
    ];

    protected $casts = [
        'duration' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relationship with user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for completed episodes
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for user's episodes
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Get file size in human readable format
     */
    public function getFileSizeAttribute(): string
    {
        if (!file_exists(storage_path('app/' . $this->audio_path))) {
            return '0 MB';
        }

        $size = filesize(storage_path('app/' . $this->audio_path));

        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;

        while ($size >= 1024 && $i < count($units) - 1) {
            $size /= 1024;
            $i++;
        }

        return round($size, 2) . ' ' . $units[$i];
    }

    /**
     * Get duration in minutes:seconds format
     */
    public function getFormattedDurationAttribute(): string
    {
        $minutes = floor($this->duration);
        $seconds = ($this->duration - $minutes) * 60;

        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
