<?php

namespace App\Observers;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Support\Str;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Create wallet for new user
        UserWallet::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'balance' => 0,
            'total_earned' => 0,
            'total_withdrawn' => 0,
            'pending_withdrawal' => 0,
            'currency' => 'NGN',
            'min_payout_amount' => 10,
            'is_active' => true,
        ]);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        //
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        // Delete associated wallet
        $user->wallet()?->delete();
    }
}
