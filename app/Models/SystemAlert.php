<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemAlert extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = ['severity', 'category', 'title', 'message', 'data', 'is_resolved', 'resolved_by', 'resolved_at'];
    protected $casts = [
        'data' => 'json',
        'is_resolved' => 'boolean',
    ];

    /**
     * User who resolved the alert
     */
    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Create system alert
     */
    public static function createAlert(string $severity, string $category, string $title, string $message, array $data = null)
    {
        return self::create([
            'severity' => $severity,
            'category' => $category,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Mark as resolved
     */
    public function resolve()
    {
        $this->update([
            'is_resolved' => true,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);
    }

    /**
     * Get unresolved critical alerts
     */
    public static function getCriticalAlerts()
    {
        return self::where('severity', 'critical')
            ->where('is_resolved', false)
            ->latest()
            ->get();
    }
}
