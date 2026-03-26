<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StripeCustomer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'stripe_customer_id',
        'email',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user associated with this Stripe customer
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Find or create Stripe customer for user
     */
    public static function findOrCreateForUser(User $user): self
    {
        return self::firstOrCreate(
            ['user_id' => $user->id],
            ['stripe_customer_id' => null, 'email' => $user->email]
        );
    }

    /**
     * Get Stripe customer by customer ID
     */
    public static function findByStripeCustomerId(string $stripeCustomerId)
    {
        return self::where('stripe_customer_id', $stripeCustomerId)->first();
    }
}
