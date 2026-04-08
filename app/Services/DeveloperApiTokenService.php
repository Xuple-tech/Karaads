<?php

namespace App\Services;

use App\Models\DeveloperApiKey;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Str;

class DeveloperApiTokenService
{
    public function createKey(
        User $user,
        string $name,
        ?array $allowedModelIds = null,
        ?string $expiresAt = null,
        ?string $notes = null
    ): array {
        $prefix = 'kwati_' . Str::lower(Str::random(12));
        $secret = Str::random(40);
        $plainTextKey = $prefix . '.' . $secret;

        $apiKey = $user->developerApiKeys()->create([
            'name' => $name,
            'key_prefix' => $prefix,
            'hashed_secret' => hash('sha256', $plainTextKey),
            'notes' => $notes,
            'allowed_model_ids' => $allowedModelIds ?: null,
            'expires_at' => $expiresAt,
            'is_active' => true,
            'last_rotated_at' => now(),
        ]);

        return [$apiKey, $plainTextKey];
    }

    public function updateKey(
        DeveloperApiKey $apiKey,
        string $name,
        ?array $allowedModelIds = null,
        CarbonInterface|string|null $expiresAt = null,
        ?string $notes = null
    ): DeveloperApiKey {
        $apiKey->update([
            'name' => $name,
            'allowed_model_ids' => $allowedModelIds ?: null,
            'expires_at' => $expiresAt,
            'notes' => $notes,
        ]);

        return $apiKey->refresh();
    }

    public function regenerateKey(DeveloperApiKey $apiKey): array
    {
        $prefix = 'kwati_' . Str::lower(Str::random(12));
        $secret = Str::random(40);
        $plainTextKey = $prefix . '.' . $secret;

        $apiKey->update([
            'key_prefix' => $prefix,
            'hashed_secret' => hash('sha256', $plainTextKey),
            'is_active' => true,
            'last_rotated_at' => now(),
        ]);

        return [$apiKey->refresh(), $plainTextKey];
    }

    public function findActiveKeyFromBearer(?string $bearerToken): ?DeveloperApiKey
    {
        if (!$bearerToken || !str_contains($bearerToken, '.')) {
            return null;
        }

        [$prefix] = explode('.', $bearerToken, 2);

        /** @var DeveloperApiKey|null $apiKey */
        $apiKey = DeveloperApiKey::with('user')->where('key_prefix', $prefix)->first();

        if (!$apiKey || !$apiKey->is_active || $apiKey->isExpired()) {
            return null;
        }

        if (!hash_equals($apiKey->hashed_secret, hash('sha256', $bearerToken))) {
            return null;
        }

        return $apiKey;
    }
}
