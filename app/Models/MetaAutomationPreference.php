<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaAutomationPreference extends Model
{
    use \Illuminate\Database\Eloquent\Concerns\HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'meta_account_id',
        'enable_auto_reply',
        'enable_message_analysis',
        'require_approval_before_send',
        'auto_archive_after_reply',
        'reply_tone',
        'ai_mode_id',
        'custom_instructions',
        'ai_prompt_template',
        'auto_reply_delay_seconds',
        'enabled_platforms',
        'is_global_preference',
    ];

    protected $casts = [
        'enable_auto_reply' => 'boolean',
        'enable_message_analysis' => 'boolean',
        'require_approval_before_send' => 'boolean',
        'auto_archive_after_reply' => 'boolean',
        'ai_mode_id' => 'integer',
        'enabled_platforms' => 'array',
        'is_global_preference' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }

    public function aiMode(): BelongsTo
    {
        return $this->belongsTo(AIMode::class);
    }

    public function getAiPromptTemplate(): string
    {
        if ($this->ai_prompt_template) {
            return $this->ai_prompt_template;
        }

        return $this->getDefaultPromptTemplate();
    }

    private function getDefaultPromptTemplate(): string
    {
        return "You are a helpful customer service representative. Analyze the following message and provide a response in a {tone} tone. Consider the customer's sentiment and provide a helpful response. Original message: {message}";
    }
}
