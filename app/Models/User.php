<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

    /**
     * The primary key type.
     *
     * @var string
     */
    protected $keyType = 'string';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'language',
        'google_id',
        'avatar',
        'role',
        'is_admin',
        'ai_mode_id',
        'call_by_name',
        'tone_level',
        'detail_level',
        'response_length',
        'email_verified_at',
        'stripe_id',
        'current_plan',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'call_by_name' => 'boolean',
            'current_plan' => 'json',
        ];
    }
    /**
     * User's selected AI mode
     */
    public function aiMode(): BelongsTo
    {
        return $this->belongsTo(AIMode::class, 'ai_mode_id');
    }

    /**
     * User's chat preferences
     */
    public function chatPreferences()
    {
        return $this->hasOne(\App\Models\UserChatPreference::class, 'user_id');
    }

    /**
     * Users can have many conversations
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Get all chats associated with this user through conversations
     */
    public function chats()
    {
        return $this->hasManyThrough(Chat::class, Conversation::class);
    }

    /**
     * Get all image uploads associated with this user
     * This is a convenience method for the admin dashboard
     */
    public function imageUploads()
    {
        return $this->conversations();
    }

    /**
     * Check if user is an admin (CTO)
     */
    public function isAdmin(): bool
    {
        return $this->getHidden()['role'] === 'admin' || $this->getHidden()['role'] === 'super_admin';
    }

    /**
     * Check if user is a staff member
     */
    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    /**
     * Check if user is a SaaS owner
     */
    public function isSaasOwner(): bool
    {
        return $this->role === 'saas_owner';
    }

    /**
     * Check if user is an admin or staff
     */
    public function isAdminOrStaff(): bool
    {
        return $this->role === 'admin' || $this->role === 'staff';
    }

    /**
     * Check if user has management privileges (admin or staff)
     */
    public function hasManagementAccess(): bool
    {
        return $this->isAdmin() || $this->isStaff() || $this->isSaasOwner();
    }

    /**
     * User can have multiple email accounts (Gmail, Outlook, IMAP)
     */
    public function emailAccounts(): HasMany
    {
        return $this->hasMany(EmailAccount::class);
    }

    /**
     * User can have multiple email automation rules
     */
    public function emailRules(): HasMany
    {
        return $this->hasMany(EmailRule::class);
    }

    /**
     * Get all email responses through email accounts
     */
    public function emailResponses()
    {
        return $this->hasManyThrough(EmailResponse::class, EmailAccount::class);
    }

    /**
     * User can have multiple Meta accounts (Facebook, Instagram, WhatsApp)
     */
    public function metaAccounts(): HasMany
    {
        return $this->hasMany(MetaAccount::class);
    }

    /**
     * User can have multiple Meta automation preferences
     */
    public function metaAutomationPreferences(): HasMany
    {
        return $this->hasMany(MetaAutomationPreference::class);
    }

    /**
     * Get user preferences
     */
    public function getPreferences(): array
    {
        return [
            'language' => $this->language ?? 'ENGLISH',
            'ai_mode' => $this->ai_mode_id ? $this->aiMode->name : null,
            'call_by_name' => $this->call_by_name ?? false,
        ];
    }

    /**
     * Set user preferences
     */
    public function setPreferences(array $preferences): bool
    {
        $updateData = [];

        if (isset($preferences['language'])) {
            $updateData['language'] = $preferences['language'];
        }

        if (isset($preferences['call_by_name'])) {
            $updateData['call_by_name'] = $preferences['call_by_name'];
        }

        if (isset($preferences['ai_mode_id'])) {
            $updateData['ai_mode_id'] = $preferences['ai_mode_id'];
        }

        return $this->update($updateData);
    }

    /**
     * Get preferred AI mode
     */
    public function getPreferredAIMode()
    {
        return $this->aiMode;
    }

    /**
     * Set preferred AI mode
     */
    public function setPreferredAIMode(string $modeId): bool
    {
        return $this->update(['ai_mode_id' => $modeId]);
    }

    /**
     * Get user's subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get user's active subscription
     */
    public function activeSubscription()
    {
        return Subscription::getActiveSubscriptionForUser($this->id);
    }

    /**
     * Get user's current subscription (active or free)
     */
    public function currentSubscription()
    {
        return Subscription::getCurrentSubscriptionForUser($this->id);
    }

    /**
     * Get user's current plan
     */
    public function getCurrentPlan()
    {
        $subscription = $this->currentSubscription();
        return $subscription ? $subscription->plan : SubscriptionPlan::getFreePlan();
    }

    /**
     * Get user's usage quota
     */
    public function usageQuotas(): HasMany
    {
        return $this->hasMany(UsageQuota::class);
    }

    /**
     * Get today's usage quota
     */
    public function getTodayUsage()
    {
        return UsageQuota::getTodayQuota($this->id);
    }

    /**
     * Check if user can perform action based on subscription
     */
    public function canPerformAction(string $action): bool
    {
        $plan = $this->getCurrentPlan();

        if (!$plan) {
            return false;
        }

        // Define what each plan can do
        $permissions = [
            'web_search' => true, // All plans can search
            'image_generation' => true, // All plans can generate images
            'api_access' => $plan->supports_api,
            'voice_chat' => $plan->supports_voice,
            'email_automation' => $plan->supports_email_automation,
            'projects' => $plan->supports_projects,
        ];

        return $permissions[$action] ?? false;
    }

    /**
     * Check if user is on free plan
     */
    public function isOnFreePlan(): bool
    {
        $plan = $this->getCurrentPlan();
        return $plan && $plan->isFree();
    }
    function roles()
    {
        return $this->hasOne(HiddenRole::class, 'user_id');
    }
    // In User.php model, add these relationships:

    public function sites(): HasMany
    {
        return $this->hasMany(Site::class);
    }

    public function aiAgents(): HasMany
    {
        return $this->hasMany(AIAgent::class);
    }

    public function agentSubscriptions(): HasMany
    {
        return $this->hasMany(SiteSubscription::class);
    }

    public function getTotalAgentsCount(): int
    {
        return $this->aiAgents()->count();
    }

    public function getActiveSitesCount(): int
    {
        return $this->sites()->where('is_active', true)->count();
    }

    public function isOnTrial(): bool
    {
        $subscription = $this->currentSubscription();

        if (!$subscription) {
            return false;
        }

        return $subscription->isInTrial();
    }

    public function hasTrialExpired(): bool
    {
        $subscription = $this->currentSubscription();

        if (!$subscription) {
            return true;
        }

        return $subscription->hasTrialEnded();
    }

    public function getTrialExpiresAt()
    {
        $subscription = $this->currentSubscription();

        return $subscription?->trial_ends_at;
    }

    public function canCreateAgents(): bool
    {
        $subscription = $this->currentSubscription();

        if (!$subscription) {
            return false;
        }

        if ($subscription->is_trial) {
            return $subscription->isInTrial();
        }

        return $subscription->isActive();
    }

    public function getTrialDaysRemaining(): int
    {
        if (!$this->isOnTrial()) {
            return 0;
        }

        $subscription = $this->currentSubscription();

        if (!$subscription || !$subscription->trial_ends_at) {
            return 0;
        }

        return (int) now()->diffInDays($subscription->trial_ends_at, false);
    }

    public function getAgentCreationQuota(): int
    {
        $subscription = $this->currentSubscription();

        if (!$subscription) {
            return 0;
        }

        $plan = $subscription->plan;

        return $plan->max_agents_per_team ?? $plan->max_concurrent_agents ?? 1;
    }

    public function getRemainingAgentQuota(): int
    {
        $quota = $this->getAgentCreationQuota();
        $used = $this->aiAgents()->count();

        return max(0, $quota - $used);
    }
}
