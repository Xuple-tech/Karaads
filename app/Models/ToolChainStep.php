<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToolChainStep extends Model
{
    use HasUlids;

    protected $fillable = [
        'tool_chain_id',
        'sequence',
        'tool_name',
        'parameters',
        'next_step_on_success',
        'next_step_on_failure',
        'is_conditional',
        'condition_logic',
    ];

    protected $casts = [
        'parameters' => 'json',
        'condition_logic' => 'json',
    ];

    public function toolChain(): BelongsTo
    {
        return $this->belongsTo(ToolChain::class);
    }

    /**
     * Get tool details if available
     */
    public function tool(): ?Tool
    {
        return Tool::byName($this->tool_name);
    }

    /**
     * Check if step is valid
     */
    public function isValid(): bool
    {
        $tool = $this->tool();
        return $tool !== null && $tool->is_active;
    }

    /**
     * Replace parameter placeholders with actual values
     */
    public function resolveParameters(array $context = []): array
    {
        $params = $this->parameters ?? [];
        $resolved = [];

        foreach ($params as $key => $value) {
            if (is_string($value) && str_starts_with($value, '{{') && str_ends_with($value, '}}')) {
                // Reference to previous step output or context
                $refKey = trim($value, '{}');
                $resolved[$key] = $context[$refKey] ?? $value;
            } else {
                $resolved[$key] = $value;
            }
        }

        return $resolved;
    }
}
