<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailRule extends Model
{
    protected $fillable = [
        'user_id',
        'email_account_id',
        'name',
        'description',
        'conditions',
        'actions',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'conditions' => 'array',
        'actions' => 'array',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function emailAccount(): BelongsTo
    {
        return $this->belongsTo(EmailAccount::class);
    }

    public function responses(): HasMany
    {
        return $this->hasMany(EmailResponse::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForAccount($query, $accountId)
    {
        return $query->where(function ($q) use ($accountId) {
            $q->where('email_account_id', $accountId)
              ->orWhereNull('email_account_id');
        });
    }

    public function matchesEmail(Email $email): bool
    {
        foreach ($this->conditions as $condition) {
            if (!$this->checkCondition($condition, $email)) {
                return false;
            }
        }
        return true;
    }

    private function checkCondition(array $condition, Email $email): bool
    {
        $field = $condition['field'];
        $operator = $condition['operator'];
        $value = $condition['value'];

        $emailValue = $this->getEmailFieldValue($email, $field);

        return match ($operator) {
            'contains' => str_contains(strtolower($emailValue), strtolower($value)),
            'equals' => strtolower($emailValue) === strtolower($value),
            'starts_with' => str_starts_with(strtolower($emailValue), strtolower($value)),
            'ends_with' => str_ends_with(strtolower($emailValue), strtolower($value)),
            default => false,
        };
    }

    private function getEmailFieldValue(Email $email, string $field): string
    {
        return match ($field) {
            'subject' => $email->subject,
            'from_email' => $email->from['email'] ?? '',
            'from_name' => $email->from['name'] ?? '',
            'body' => $email->body_text ?? $email->body_html ?? '',
            'to' => implode(', ', array_column($email->to, 'email')),
            default => '',
        };
    }
}
