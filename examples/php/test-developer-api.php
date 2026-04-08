<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Kwati AI Developer API  Test Script
|--------------------------------------------------------------------------
|
| Usage:
|   php examples/php/test-developer-api.php                    # runs all
|   php examples/php/test-developer-api.php models             # list models (no auth)
|   php examples/php/test-developer-api.php me                 # account info
|   php examples/php/test-developer-api.php usage              # usage stats
|   php examples/php/test-developer-api.php chat               # chat completion
|   php examples/php/test-developer-api.php stream             # streaming chat
|
| Setup:
|   $env:KWATI_API_KEY  = 'kwati_xxxx.secret'
|   $env:KWATI_API_BASE = 'http://127.0.0.1:8000/api/v1'   # optional
|   $env:KWATI_MODEL    = 'kwati-1'                         # optional
|
--------------------------------------------------------------------------
*/

$baseUrl  = rtrim((string) (getenv('KWATI_API_BASE') ?: 'http://127.0.0.1:8000/api/v1'), '/');
$apiKey   = (string) (getenv('KWATI_API_KEY') ?: '');
$model    = (string) (getenv('KWATI_MODEL') ?: 'kwati-1');
$verifySsl = false; // always off for local dev

if ($apiKey === '') {
    fwrite(STDERR, "Error: set KWATI_API_KEY environment variable before running.\n");
    fwrite(STDERR, "  PowerShell: \$env:KWATI_API_KEY='kwati_xxxx.secret'\n");
    exit(1);
}

$action = $argv[1] ?? 'all';
$sep    = str_repeat('-', 60);

function run(string $label, callable $fn): void
{
    global $sep;
    echo "\n{$sep}\n  {$label}\n{$sep}\n";
    try {
        $fn();
    } catch (Throwable $e) {
        echo "  ERROR: " . $e->getMessage() . "\n";
    }
}

switch ($action) {
    case 'all':
        run('GET /models  (no auth required)', fn() => get('/models', false));
        run('GET /me', fn() => get('/me'));
        run('GET /usage', fn() => get('/usage'));
        run('POST /chat/completions', fn() => chat(false));
        run('POST /chat/completions (streaming)', fn() => chat(true));
        break;
    case 'models':
        run('GET /models', fn() => get('/models', false));
        break;
    case 'me':
        run('GET /me', fn() => get('/me'));
        break;
    case 'usage':
        run('GET /usage', fn() => get('/usage'));
        break;
    case 'chat':
        run('POST /chat/completions', fn() => chat(false));
        break;
    case 'stream':
        run('POST /chat/completions (streaming)', fn() => chat(true));
        break;
    default:
        fwrite(STDERR, "Unknown action: {$action}\n");
        fwrite(STDERR, "Allowed: all, models, me, usage, chat, stream\n");
        exit(1);
}

echo "\n{$sep}\n  Done\n{$sep}\n";

// ---------------------------------------------------------------------------

function get(string $path, bool $auth = true): void
{
    global $baseUrl, $apiKey, $verifySsl;

    $headers = ['Accept: application/json'];
    if ($auth) {
        $headers[] = 'Authorization: Bearer ' . $apiKey;
    }

    $ch = curl_init($baseUrl . $path);
    curl_setopt_array($ch, [
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => $verifySsl,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);

    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err    = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        throw new RuntimeException("cURL error: {$err}");
    }

    printResponse($status, (string) $body);
}

function chat(bool $stream): void
{
    global $baseUrl, $apiKey, $model, $verifySsl;

    $payload = json_encode([
        'model'       => $model,
        'messages'    => [
            ['role' => 'system', 'content' => 'You are concise and practical.'],
            ['role' => 'user',   'content' => 'In one sentence, what is Kwati AI?'],
        ],
        'temperature' => 0.7,
        'max_tokens'  => 150,
        'stream'      => $stream,
    ]);

    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ];

    $ch = curl_init($baseUrl . '/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_SSL_VERIFYPEER => $verifySsl,
        CURLOPT_SSL_VERIFYHOST => 0,
    ]);

    if ($stream) {
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, string $chunk): int {
            foreach (explode("\n", $chunk) as $line) {
                $line = trim($line);
                if ($line === 'data: [DONE]') {
                    echo "\n[stream done]\n";
                    continue;
                }
                if (str_starts_with($line, 'data: ')) {
                    $json  = json_decode(substr($line, 6), true);
                    $delta = $json['choices'][0]['delta']['content'] ?? null;
                    if ($delta !== null) {
                        echo $delta;
                    }
                }
            }
            return strlen($chunk);
        });

        curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err    = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new RuntimeException("cURL error: {$err}");
        }
        echo "\nHTTP {$status}\n";
    } else {
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $body   = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err    = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            throw new RuntimeException("cURL error: {$err}");
        }

        printResponse($status, (string) $body);

        $decoded = json_decode((string) $body, true);
        $content = $decoded['choices'][0]['message']['content'] ?? null;
        if ($content !== null) {
            echo "\n Message content \n{$content}\n";
        }
    }
}

function printResponse(int $status, string $body): void
{
    $ok    = $status >= 200 && $status < 300;
    $label = $ok ? " HTTP {$status}" : " HTTP {$status}";
    echo "{$label}\n\n";

    $decoded = json_decode($body, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo $body . "\n";
    }
}
