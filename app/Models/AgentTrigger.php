<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentTrigger extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'trigger_type',
        'trigger_value',
        'description',
        'is_active',
        'priority',
        'conditions',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'conditions' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Check if trigger matches the given data
     */
    public function matches(string $data): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return match($this->trigger_type) {
            'keyword' => str_contains(strtolower($data), strtolower($this->trigger_value)),
            'pattern' => preg_match('/' . $this->trigger_value . '/i', $data) === 1,
            'event' => $data === $this->trigger_value,
            default => false,
        };
    }

    /**
     * Check if conditions are met
     */
    public function conditionsMet(array $context = []): bool
    {
        if (!$this->conditions) {
            return true;
        }

        foreach ($this->conditions as $condition) {
            if (!$this->evaluateCondition($condition, $context)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate a single condition
     */
    private function evaluateCondition(array $condition, array $context): bool
    {
        $field = $condition['field'] ?? null;
        $operator = $condition['operator'] ?? '=';
        $value = $condition['value'] ?? null;
        $contextValue = $context[$field] ?? null;

        return match($operator) {
            '=' => $contextValue === $value,
            '!=' => $contextValue !== $value,
            '>' => $contextValue > $value,
            '<' => $contextValue < $value,
            '>=' => $contextValue >= $value,
            '<=' => $contextValue <= $value,
            'in' => in_array($contextValue, (array) $value),
            'contains' => str_contains((string) $contextValue, (string) $value),
            default => false,
        };
    }
}
