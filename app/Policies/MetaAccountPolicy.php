<?php

namespace App\Policies;

use App\Models\MetaAccount;
use App\Models\User;

class MetaAccountPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MetaAccount $metaAccount): bool
    {
        return $user->id === $metaAccount->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MetaAccount $metaAccount): bool
    {
        return $user->id === $metaAccount->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MetaAccount $metaAccount): bool
    {
        return $user->id === $metaAccount->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, MetaAccount $metaAccount): bool
    {
        return $user->id === $metaAccount->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, MetaAccount $metaAccount): bool
    {
        return $user->id === $metaAccount->user_id;
    }
}
