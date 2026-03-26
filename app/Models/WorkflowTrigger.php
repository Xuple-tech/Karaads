<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowTrigger extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'trigger_type',
        'trigger_config',
        'input_defaults',
        'enabled',
        'execution_count',
        'last_executed_at',
    ];

    protected $casts = [
        'trigger_config' => 'array',
        'input_defaults' => 'array',
        'last_executed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the workflow
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    /**
     * Record execution
     */
    public function recordExecution(): void
    {
        $this->increment('execution_count');
        $this->update(['last_executed_at' => now()]);
    }

    /**
     * Create schedule trigger
     */
    public static function createScheduleTrigger(Workflow $workflow, string $cron, array $inputDefaults = []): self
    {
        return $workflow->triggers()->create([
            'trigger_type' => 'schedule',
            'trigger_config' => ['cron' => $cron],
            'input_defaults' => $inputDefaults,
            'enabled' => true,
        ]);
    }

    /**
     * Create webhook trigger
     */
    public static function createWebhookTrigger(Workflow $workflow, string $path, array $inputDefaults = []): self
    {
        return $workflow->triggers()->create([
            'trigger_type' => 'webhook',
            'trigger_config' => ['path' => $path, 'token' => bin2hex(random_bytes(16))],
            'input_defaults' => $inputDefaults,
            'enabled' => true,
        ]);
    }

    /**
     * Get webhook URL
     */
    public function getWebhookUrl(): ?string
    {
        if ($this->trigger_type !== 'webhook') {
            return null;
        }
        $path = $this->trigger_config['path'] ?? null;
        return $path ? url("/api/workflows/webhook/{$path}") : null;
    }
}
