<?php

namespace App\Models;
// note this agent are made sepcifilcally just for site agents powered by AI
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AIAgent extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'ai_agents';
    protected $fillable = [
        'user_id',
        'site_id',
        'name',
        'slug',
        'description',
        'agent_type', // 'widget', 'api', 'full_site', 'mobile_app'
        'behavior_profile',
        'welcome_message',
        'primary_color',
        'secondary_color',
        'logo_url',
        'is_active',
        'max_context_length',
        'response_temperature',
        'knowledge_base_enabled',
        'web_search_enabled',
        'file_upload_enabled',
        'voice_enabled',
        'default_language',
        'supported_languages',
        'working_hours',
        'offline_message',
        'widget_position', // 'bottom-right', 'bottom-left', 'center', 'custom'
        'widget_icon',
        'created_by_admin',
        'template_id',
        'custom_css',
        'custom_js',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'knowledge_base_enabled' => 'boolean',
        'web_search_enabled' => 'boolean',
        'file_upload_enabled' => 'boolean',
        'voice_enabled' => 'boolean',
        'created_by_admin' => 'boolean',
        'supported_languages' => 'array',
        'working_hours' => 'array',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(AgentConversation::class, 'agent_id');
    }

    public function knowledgeBase(): HasMany
    {
        return $this->hasMany(AgentKnowledgeBase::class,'agent_id','id');
    }

    public function tools(): HasMany
    {
        return $this->hasMany(AgentTool::class,'agent_id','id');
    }

    public function widgetSettings(): HasOne
    {
        return $this->hasOne(AgentWidgetSettings::class,'agent_id','id');
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(AgentApiKey::class,'agent_id','id');
    }

    public function usageStats(): HasMany
    {
        return $this->hasMany(AgentUsageStat::class,'agent_id','id');
    }

    public function getKnowledgeBaseTitles(): array
    {
        return $this->knowledgeBase()
            ->where('is_active', true)
            ->pluck('title')
            ->filter()
            ->unique()
            ->values()
            ->toArray();
    }

    public function getKnowledgeBaseMetadata(): array
    {
        return $this->knowledgeBase()
            ->where('is_active', true)
            ->orderBy('order')
            ->select('id', 'title', 'content_type')
            ->get()
            ->map(function ($kb) {
                return [
                    'id' => $kb->id,
                    'title' => $kb->title,
                    'type' => $kb->content_type,
                ];
            })
            ->toArray();
    }

    public function hasKnowledgeBase(): bool
    {
        return $this->knowledge_base_enabled && 
               $this->knowledgeBase()->where('is_active', true)->exists();
    }

    public function getKnowledgeBaseSummary(): string
    {
        $titles = $this->getKnowledgeBaseTitles();
        
        if (empty($titles)) {
            return '';
        }

        return 'Available knowledge base topics: ' . implode(', ', $titles) . '.';
    }
}
