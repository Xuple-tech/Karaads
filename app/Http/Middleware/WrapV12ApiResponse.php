<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class WrapV12ApiResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!($response instanceof JsonResponse)) {
            return $response;
        }

        $payload = $response->getData(true);
        if (is_array($payload) && array_key_exists('success', $payload)) {
            return $response;
        }

        $status = $response->getStatusCode();

        if ($status >= 400) {
            $codeByStatus = [
                401 => 'UNAUTHENTICATED',
                403 => 'FORBIDDEN',
                404 => 'NOT_FOUND',
                409 => 'CONFLICT',
                422 => 'VALIDATION_ERROR',
                429 => 'RATE_LIMITED',
            ];
            $errorCode = $codeByStatus[$status] ?? 'HTTP_ERROR';
            $message = $payload['message'] ?? $payload['error'] ?? 'Request failed.';

            return response()->json([
                'success' => false,
                'error' => [
                    'code' => $errorCode,
                    'message' => $message,
                    'details' => $payload['details'] ?? $payload['errors'] ?? null,
                ],
            ], $status);
        }

        if ($status === 204) {
            return response()->json([
                'success' => true,
                'data' => null,
            ], 200);
        }

        if (!is_array($payload)) {
            $payload = ['value' => $payload];
        }

        $wrapped = [
            'success' => true,
            'data' => $payload,
        ];

        if (array_key_exists('data', $payload) && is_array($payload['data'])) {
            $wrapped['data'] = $payload['data'];
            $meta = [];

            // Collect pagination/extra info into meta if it's not already there
            foreach ($payload as $key => $value) {
                if ($key !== 'data' && $key !== 'meta' && $key !== 'links') {
                    $meta[$key] = $value;
                }
            }

            if (isset($payload['meta']) && is_array($payload['meta'])) {
                $meta = array_merge($meta, $payload['meta']);
            }
            if (isset($payload['links']) && is_array($payload['links'])) {
                $meta['links'] = $payload['links'];
            }

            if ($meta !== []) {
                $wrapped['meta'] = $meta;
            }
        }

        return response()->json($wrapped, $status, $response->headers->all());
    }
}

