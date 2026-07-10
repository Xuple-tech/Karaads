<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\ReferralRewardService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(
        private readonly ReferralRewardService $referralRewardService,
    ) {}

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'referral_code' => ['nullable', 'string', 'exists:users,referral_code'],
        ])->validate();

        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        $this->referralRewardService->createPendingReferralForUser($user, $input['referral_code'] ?? null);

        return $user;
    }
}
