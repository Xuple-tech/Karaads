<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Attributes\SearchUsingPrefix;
use Laravel\Scout\Searchable;
use Laravel\Sanctum\HasApiTokens;
use Throwable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, Searchable, TwoFactorAuthenticatable;

    private const MAIL_RATE_LIMIT_CACHE_KEY = 'mail:smtp-rate-limited:password-reset';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'country',
        'state',
        'location',
        'password',
        'last_login_at',
        'must_set_password',
        'username',
        'status',
        'referral_code',
        'referred_by',
        'bio',
        'birth_date',
        'onboarding_interests',
        'onboarding_completed_at',
        'content_validation_agreed_at',
        'kara_verified_at',
        'kara_verified_expires_at',
        'monetization_activated_at',
        'monetization_paid_at',
        'monetization_payment_provider',
        'monetization_payment_reference',
        'monetization_payment_status',
        'monetization_payment_amount',
        'message_policy',
        'default_post_visibility',
        'post_email_notifications_enabled',
        'avatar',
        'avatar_variants',
        'avatar_processing_status',
        'avatar_processing_error',
        'cover',
        'cover_variants',
        'cover_processing_status',
        'cover_processing_error',
        'followers_count',
        'following_count',
        'google_id',
        'google_token',
        'google_refresh_token',
        'deletion_token',
        'deletion_token_expires_at',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar_url',
        'cover_url',
        'onboarding_complete',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'google_token',
        'google_refresh_token',
        'deletion_token',
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
            'last_login_at' => 'datetime',
            'birth_date' => 'date',
            'onboarding_interests' => 'array',
            'onboarding_completed_at' => 'datetime',
            'content_validation_agreed_at' => 'datetime',
            'kara_verified_at' => 'datetime',
            'kara_verified_expires_at' => 'datetime',
            'monetization_activated_at' => 'datetime',
            'monetization_paid_at' => 'datetime',
            'monetization_payment_amount' => 'decimal:2',
            'deletion_token_expires_at' => 'datetime',
            'avatar_variants' => 'array',
            'cover_variants' => 'array',
            'password' => 'hashed',
            'must_set_password' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'google_token' => 'encrypted',
            'google_refresh_token' => 'encrypted',
            'post_email_notifications_enabled' => 'boolean',
        ];
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot(): void
    {
        parent::boot();

        // Generate username automatically when creating a user
        static::creating(function ($user) {
            if (is_string($user->email)) {
                $user->email = strtolower(trim($user->email));
            }

            if (empty($user->username)) {
                $user->username = $user->generateUniqueUsername();
            }

            // Generate referral code if not provided
            if (empty($user->referral_code)) {
                $user->referral_code = $user->generateUniqueReferralCode();
            }
        });

        // Update username if it's empty when saving
        static::saving(function ($user) {
            if (is_string($user->email)) {
                $user->email = strtolower(trim($user->email));
            }

            if (empty($user->username)) {
                $user->username = $user->generateUniqueUsername();
            }
        });
    }

    public function sendPasswordResetNotification($token): void
    {
        $cache = Cache::store('database');

        if ($cache->has(self::MAIL_RATE_LIMIT_CACHE_KEY)) {
            throw ValidationException::withMessages([
                'email' => ['Email sending is temporarily busy. Please wait a few minutes and try again.'],
            ]);
        }

        try {
            $this->notify(new ResetPasswordNotification($token));
        } catch (Throwable $exception) {
            Log::warning('Password reset email delivery failed', [
                'user_id' => $this->id,
                'email' => $this->email,
                'message' => $exception->getMessage(),
            ]);

            if ($this->isMailProviderBusyMessage($exception->getMessage())) {
                $cache->put(self::MAIL_RATE_LIMIT_CACHE_KEY, true, now()->addMinutes(30));
            }

            throw ValidationException::withMessages([
                'email' => ['Email sending is temporarily busy. Please wait a few minutes and try again.'],
            ]);
        }
    }

    public function routeNotificationForMail($notification = null): ?string
    {
        $email = strtolower(trim((string) $this->email));

        return $email !== '' ? $email : null;
    }

    private function isMailProviderBusyMessage(string $message): bool
    {
        $message = strtolower($message);

        return str_contains($message, 'ratelimit')
            || str_contains($message, 'timeout')
            || str_contains($message, 'too many')
            || str_contains($message, '421')
            || str_contains($message, '451')
            || str_contains($message, 'smtp');
    }

    /**
     * Generate a unique username for the user
     */
    public function generateUniqueUsername(): string
    {
        // Try to create username from name
        $baseUsername = '';

        if (! empty($this->name)) {
            // Remove special characters and convert to lowercase
            $baseUsername = Str::slug($this->name, '');

            // If name results in empty string, use part of email
            if (empty($baseUsername)) {
                $baseUsername = Str::before($this->email, '@');
            }
        } else {
            // Use email prefix if name is not available
            $baseUsername = Str::before($this->email, '@');
        }

        // Clean the username - remove non-alphanumeric characters (keep underscores and hyphens)
        $baseUsername = preg_replace('/[^a-z0-9_-]/', '', strtolower($baseUsername));

        // If still empty, use a generic prefix
        if (empty($baseUsername)) {
            $baseUsername = 'user';
        }

        // Check if username exists and append numbers if needed
        $username = $baseUsername;
        $counter = 1;

        // Check if username already exists (excluding current user if updating)
        $query = static::where('username', $username);
        if ($this->exists) {
            $query->where('id', '!=', $this->id);
        }

        while ($query->exists()) {
            $username = $baseUsername . $counter;
            $query = static::where('username', $username);
            if ($this->exists) {
                $query->where('id', '!=', $this->id);
            }
            $counter++;
        }

        return $username;
    }

    /**
     * Generate a unique referral code for the user
     */
    public function generateUniqueReferralCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (static::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Get the route key for the model (for route model binding)
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    /**
     * Accessor for avatar URL
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->avatar
                ? (Str::startsWith($this->avatar, ['http://', 'https://'])
                    ? $this->avatar
                    : (app()->environment('local')
                        ? '/storage/' . ltrim($this->avatar, '/')
                        : asset('storage/' . $this->avatar)))
                : $this->generateDefaultAvatar()
        );
    }

    public function hasActiveKaraVerifiedBadge(): bool
    {
        return $this->kara_verified_at !== null
            && ($this->kara_verified_expires_at === null || $this->kara_verified_expires_at->isFuture());
    }

    /**
     * Accessor for cover URL
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->cover
                ? (Str::startsWith($this->cover, ['http://', 'https://'])
                    ? $this->cover
                    : (app()->environment('local')
                        ? '/storage/' . ltrim($this->cover, '/')
                        : asset('storage/' . $this->cover)))
                : null
        );
    }

    protected function onboardingComplete(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->hasCompletedOnboarding()
        );
    }

    public function hasCompletedOnboarding(): bool
    {
        return ! is_null($this->onboarding_completed_at);
    }

    /**
     * Generate a default avatar URL based on username
     */
    private function generateDefaultAvatar(): string
    {
        // You can use a service like DiceBear or generate initials
        $initials = strtoupper(substr($this->username, 0, 2));

        // Example using DiceBear avatars (optional)
        // return 'https://api.dicebear.com/7.x/initials/svg?seed=' . urlencode($this->username);

        // Or generate a colored background with initials
        return 'https://ui-avatars.com/api/?name=' . urlencode($initials) .
            '&color=FFFFFF&background=' . $this->generateColorFromUsername();
    }

    /**
     * Generate a consistent color from username
     */
    private function generateColorFromUsername(): string
    {
        $hash = md5($this->username);

        return substr($hash, 0, 6); // Returns a hex color
    }

    /**
     * Check if the user has a specific role (if you have roles)
     */
    public function hasRole($role): bool
    {
        // Implement if you have roles
        return false;
    }

    /**
     * Get the user's posts
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function stories(): HasMany
    {
        return $this->hasMany(Story::class);
    }

    /**
     * Get the user's comments
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the user's likes
     */
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get the user's followers
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'follows',
            'following_id',
            'follower_id',
            'id',
            'id'
        )
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    /**
     * Get users that this user is following
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'follows',
            'follower_id',
            'following_id',
            'id',
            'id'
        )
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    /**
     * Get users that this user has blocked
     */
    public function blocked(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'blocks',
            'blocker_id',
            'blocked_user_id',
            'id',
            'id'
        )
            ->withTimestamps();
    }

    /**
     * Get users that blocked this user.
     */
    public function blockedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'blocks',
            'blocked_user_id',
            'blocker_id',
            'id',
            'id'
        )
            ->withTimestamps();
    }

    /**
     * Get conversations the user is part of
     */
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(
            Conversation::class,
            'conversation_user',
            'user_id',
            'conversation_id'
        )
            ->withPivot('joined_at', 'left_at')
            ->withTimestamps();
    }

    /**
     * Get messages sent by the user
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get conversations created by the user
     */
    public function createdConversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'created_by');
    }

    /**
     * Update username safely (with uniqueness check)
     */
    public function updateUsername(string $newUsername): bool
    {
        $existingUser = static::where('username', $newUsername)
            ->where('id', '!=', $this->id)
            ->first();

        if ($existingUser) {
            return false; // Username already taken
        }

        $this->username = $newUsername;

        return $this->save();
    }
    // Add these methods to User model

    public function wallet(): HasOne
    {
        return $this->hasOne(UserWallet::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    public function withdrawals(): HasMany
    {
        // Legacy alias kept for older controllers; the live withdrawal system uses withdrawal_requests.
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function postMonetizations(): HasMany
    {
        return $this->hasMany(PostMonetization::class);
    }

    public function verificationRequests(): HasMany
    {
        return $this->hasMany(VerificationRequest::class);
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referredUsers(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function media(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(PostMedia::class, Post::class);
    }

    public function pushTokens(): HasMany
    {
        return $this->hasMany(UserPushToken::class);
    }

    #[SearchUsingPrefix(['username'])]
    #[SearchUsingFullText(['name', 'bio'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name ?? '',
            'username' => $this->username ?? '',
            'bio' => $this->bio ?? '',
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

}
