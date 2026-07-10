<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPushToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PushTokenController extends Controller
{
    public function index(Request $request): array
    {
        $user = $request->user();

        return [
            'tokens' => UserPushToken::query()
                ->where('user_id', (string) $user->id)
                ->orderByDesc('updated_at')
                ->get()
                ->map(fn(UserPushToken $token): array => [
                    'id' => (string) $token->id,
                    'provider' => (string) $token->provider,
                    'platform' => $token->platform,
                    'device_id' => $token->device_id,
                    'device_name' => $token->device_name,
                    'app_version' => $token->app_version,
                    'is_active' => (bool) $token->is_active,
                    'last_used_at' => $token->last_used_at?->toISOString(),
                    'created_at' => $token->created_at?->toISOString(),
                    'updated_at' => $token->updated_at?->toISOString(),
                ])->values()->all(),
        ];
    }

    public function upsert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:4096'],
            'provider' => ['nullable', 'string', 'max:32'],
            'platform' => ['nullable', 'string', 'max:32'],
            'device_id' => ['nullable', 'string', 'max:191'],
            'device_name' => ['nullable', 'string', 'max:191'],
            'app_version' => ['nullable', 'string', 'max:64'],
            'meta' => ['nullable', 'array'],
        ]);

        $user = $request->user();
        $tokenHash = hash('sha256', (string) $validated['token']);
        $provider = (string) ($validated['provider'] ?? 'expo');

        $existing = UserPushToken::query()
            ->where('user_id', (string) $user->id)
            ->where(function ($query) use ($validated, $tokenHash): void {
                $deviceId = isset($validated['device_id']) ? (string) $validated['device_id'] : null;
                if ($deviceId !== null && $deviceId !== '') {
                    $query->where('device_id', $deviceId);
                    return;
                }
                $query->where('token_hash', $tokenHash);
            })
            ->first();

        $payload = [
            'user_id' => (string) $user->id,
            'provider' => $provider,
            'platform' => $validated['platform'] ?? null,
            'device_id' => $validated['device_id'] ?? null,
            'device_name' => $validated['device_name'] ?? null,
            'app_version' => $validated['app_version'] ?? null,
            'token' => (string) $validated['token'],
            'token_hash' => $tokenHash,
            'is_active' => true,
            'last_used_at' => now(),
            'meta' => $validated['meta'] ?? null,
        ];

        if ($existing) {
            $existing->fill($payload);
            $existing->save();
            $model = $existing;
            $created = false;
        } else {
            $model = UserPushToken::query()->create([
                'id' => (string) Str::uuid(),
                ...$payload,
            ]);
            $created = true;
        }

        Log::info('push.token.upserted', [
            'user_id' => (string) $user->id,
            'token_id' => (string) $model->id,
            'provider' => $model->provider,
            'platform' => $model->platform,
            'device_id' => $model->device_id,
            'created' => $created,
        ]);

        return response()->json([
            'id' => (string) $model->id,
            'is_active' => (bool) $model->is_active,
        ], $created ? 201 : 200);
    }

    public function destroy(Request $request, string $tokenOrId): JsonResponse
    {
        $user = $request->user();
        $tokenHash = hash('sha256', $tokenOrId);

        $query = UserPushToken::query()
            ->where('user_id', (string) $user->id)
            ->where(function ($where) use ($tokenOrId, $tokenHash): void {
                $where->where('id', $tokenOrId)
                    ->orWhere('token_hash', $tokenHash);
            });

        $updated = $query->update([
            'is_active' => false,
            'updated_at' => now(),
        ]);

        Log::info('push.token.deactivated', [
            'user_id' => (string) $user->id,
            'selector' => $tokenOrId,
            'updated_count' => $updated,
        ]);

        return response()->json(['ok' => true, 'updated' => $updated]);
    }
}
