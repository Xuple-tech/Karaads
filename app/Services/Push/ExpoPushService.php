<?php

namespace App\Services\Push;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushService
{
    /**
     * @param list<string> $tokens
     * @param array<string,mixed> $payload
     * @return array{tickets:list<array<string,mixed>>,errors:list<array<string,mixed>>}
     */
    public function send(array $tokens, array $payload): array
    {
        $validTokens = array_values(array_filter($tokens, static fn(string $token): bool => str_starts_with($token, 'ExponentPushToken[') || str_starts_with($token, 'ExpoPushToken[')));
        if ($validTokens === []) {
            return ['tickets' => [], 'errors' => []];
        }

        $messages = array_map(static fn(string $token): array => [
            'to' => $token,
            'sound' => 'default',
            ...$payload,
        ], $validTokens);

        $request = Http::baseUrl('https://exp.host')
            ->acceptJson()
            ->asJson();

        $accessToken = trim((string) config('services.expo.access_token', ''));
        if ($accessToken !== '') {
            $request = $request->withToken($accessToken);
        }

        $response = $request->post('/--/api/v2/push/send', $messages);

        if (!$response->successful()) {
            Log::warning('push.expo.send_failed', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return [
                'tickets' => [],
                'errors' => [[
                    'message' => 'Expo send failed',
                    'status' => $response->status(),
                ]],
            ];
        }

        $body = $response->json();
        $tickets = is_array($body['data'] ?? null) ? $body['data'] : [];
        $errors = is_array($body['errors'] ?? null) ? $body['errors'] : [];

        return ['tickets' => $tickets, 'errors' => $errors];
    }
}
