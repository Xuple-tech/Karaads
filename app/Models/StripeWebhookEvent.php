<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StripeWebhookEvent extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    protected $fillable = [
        'stripe_event_id',
        'event_type',
        'payload',
        'status',
        'error_message',
        'retry_count',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    /**
     * Log a webhook event
     */
    public static function logEvent(string $eventId, string $eventType, array $payload): self
    {
        return self::create([
            'stripe_event_id' => $eventId,
            'event_type' => $eventType,
            'payload' => $payload,
            'status' => 'received',
        ]);
    }

    /**
     * Mark event as processed
     */
    public function markProcessed(): bool
    {
        return $this->update([
            'status' => 'processed',
            'processed_at' => now(),
        ]);
    }

    /**
     * Mark event as failed
     */
    public function markFailed(string $errorMessage): bool
    {
        return $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    /**
     * Get unprocessed events
     */
    public function scopeUnprocessed($query)
    {
        return $query->where('status', 'received');
    }

    /**
     * Get failed events
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Get processed events
     */
    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }
}
