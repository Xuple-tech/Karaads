<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReverbHealthController extends Controller
{
    public function show(): JsonResponse
    {
        $config = config('broadcasting.connections.reverb', []);
        $host = (string) ($config['host'] ?? env('REVERB_HOST', '127.0.0.1'));
        $port = (int) ($config['port'] ?? env('REVERB_PORT', 8080));
        $scheme = (string) ($config['scheme'] ?? env('REVERB_SCHEME', 'http'));

        $isSecure = in_array(strtolower($scheme), ['https', 'wss'], true);
        $target = ($isSecure ? 'ssl' : 'tcp') . "://{$host}:{$port}";

        $errno = 0;
        $errstr = '';
        $timeoutSeconds = 1.0;
        $startedAt = microtime(true);

        $socket = @stream_socket_client($target, $errno, $errstr, $timeoutSeconds);
        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

        if ($socket) {
            fclose($socket);
        }

        return response()->json([
            'ok' => (bool) $socket,
            'status' => $socket ? 'ok' : 'down',
            'host' => $host,
            'port' => $port,
            'scheme' => $scheme,
            'latency_ms' => $latencyMs,
            'error' => $socket ? null : ($errstr ?: "Unable to connect to {$host}:{$port}"),
        ]);
    }
}
