<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImageGeneration extends Model
{
    use HasFactory;

    protected $keyType = 'int';
    public $incrementing = true;
    protected $fillable = [
        'user_id',
        'ip_address',
        'email',
        'prompt',
        'revised_prompt',
        'image_url',
        'image_path',
        'image_content',
        'model',
        'provider',
        'size',
        'quality',
        'style',
        'background',
        'output_format',
        'operation',
        'chat_id',
        'status',
        'error_message',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_GENERATING = 'generating';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public static function getDailyUsageCount($userId = null, $ipAddress = null, $email = null)
    {
        $query = self::query()
            ->whereDate('created_at', today());

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($email) {
            $query->where('email', $email);
        } else {
            $query->where('ip_address', $ipAddress);
        }

        return $query->count();
    }
}
