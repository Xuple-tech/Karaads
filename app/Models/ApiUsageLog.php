<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiUsageLog extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'saas_owner_id',
        'api_provider',
        'model',
        'endpoint',
        'tokens_used',
        'input_tokens',
        'output_tokens',
        'response_time_ms',
        'status',
        'error_message',
        'metadata',
        'ip_address',
        'country'
    ];
    protected $casts = [
        'metadata' => 'json',
    ];

    /**
     * User who made the request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * SaaS owner if applicable
     */
    public function saasOwner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'saas_owner_id');
    }

    /**
     * Log API usage
     */
    public static function logUsage(array $data)
    {
        $ipAddress = $data['ip_address'] ?? request()->ip();
        $country = $data['country'] ?? null;

        // Try to get country if not provided
        if (!$country && $ipAddress) {
            try {
                $location = \Torann\GeoIP\Facades\GeoIP::getLocation($ipAddress);
                $country = $location['country'] ?? null;
            } catch (\Exception $e) {
                // GeoIP might fail
            }
        }

        return self::create([
            'user_id' => auth('web')->id(),
            'saas_owner_id' => $data['saas_owner_id'] ?? null,
            'api_provider' => $data['provider'] ?? 'grok',
            'model' => $data['model'] ?? 'grok-3',
            'endpoint' => $data['endpoint'] ?? '/chat/completions',
            'tokens_used' => $data['tokens'] ?? 0,
            'input_tokens' => $data['input_tokens'] ?? 0,
            'output_tokens' => $data['output_tokens'] ?? 0,
            'response_time_ms' => $data['response_time'] ?? 0,
            'status' => $data['status'] ?? 'success',
            'error_message' => $data['error'] ?? null,
            'ip_address' => $ipAddress,
            'country' => $country,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    /**
     * Get usage statistics for a period
     */
    public static function getStats($from = null, $to = null, $userId = null)
    {
        $query = self::query();

        if ($from) {
            $query->where('created_at', '>=', $from);
        }
        if ($to) {
            $query->where('created_at', '<=', $to);
        }
        if ($userId) {
            $query->where('user_id', $userId);
        }

        return [
            'total_requests' => $query->count(),
            'total_tokens' => $query->sum('tokens_used'),
            'avg_response_time' => $query->avg('response_time_ms'),
            'error_count' => $query->where('status', 'error')->count(),
            'by_provider' => $query->groupBy('api_provider')->selectRaw('api_provider, count(*) as count, sum(tokens_used) as tokens')->get(),
        ];
    }
}
