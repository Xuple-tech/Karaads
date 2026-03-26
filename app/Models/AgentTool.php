<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentTool extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'agent_id',
        'tool_type', // 'calculator', 'booking', 'product_search', 'support_ticket', 'custom'
        'name',
        'description',
        'configuration',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'configuration' => 'array',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class);
    }
}
