<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Kwati  Ai Developer API Test Script
|--------------------------------------------------------------------------
|
| Usage:
|   php examples/php/test-developer-api.php models
|   php examples/php/test-developer-api.php me
|   php examples/php/test-developer-api.php usage
|   php examples/php/test-developer-api.php chat
|   php examples/php/test-developer-api.php image
|
| Before running:
|   1. Generate a key in the developer console.
|   2. Paste it into $apiKey below.
|   3. Set $baseUrl to your real API base URL.
|   4. Upstream SSL handling is managed by the server. API consumers do not
|      need to configure TLS verification in this client script.
|
*/

$baseUrl = 'http://localhost:8000/v1';
$apiKey = 'kwati_ramk7oglm4rq.3jBugRGrIXox6zjN4t8lQ83MZZJTCdUdEzdojZqg';
$model = 'kwati-4-fast';

$action = $argv[1] ?? 'models';

if ($apiKey === 'PASTE_YOUR_DEVELOPER_API_KEY_HERE') {
    fwrite(STDERR, "Set your developer API key in examples/php/test-developer-api.php first.\n");
    exit(1);
}

switch ($action) {
    case 'models':
        request('GET', $baseUrl . '/models', $apiKey);
        break;

    case 'me':
        request('GET', $baseUrl . '/me', $apiKey);
        break;

    case 'usage':
        request('GET', $baseUrl . '/usage', $apiKey);
        break;

    case 'chat':
        request('POST', $baseUrl . '/chat/completions', $apiKey, [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are concise and practical.'],
                ['role' => 'user', 'content' => 'Write a short PHP hello-world example.'],
            ],
            'temperature' => 0.7,
            'max_tokens' => 300,
            'stream' => false,
        ]);
        break;

    case 'image':
        request('POST', $baseUrl . '/images/generations', $apiKey, [
            'model' => 'kwati-imagine-image',
            'prompt' => 'Create a clean product-style illustration of a futuristic developer console dashboard.',
            'n' => 1,
            'size' => '1024x1024',
            'response_format' => 'b64_json',
        ]);
        break;

    default:
        fwrite(STDERR, "Unknown action: {$action}\n");
        fwrite(STDERR, "Allowed actions: models, me, usage, chat, image\n");
        exit(1);
}

function request(string $method, string $url, string $apiKey, ?array $payload = null): void
{
    $ch = curl_init($url);

    $headers = [
        'Accept: application/json',
        'Authorization: Bearer ' . $apiKey,
    ];

    if ($payload !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 60,
    ]);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($response === false) {
        fwrite(STDERR, 'cURL error: ' . curl_error($ch) . PHP_EOL);
        curl_close($ch);
        exit(1);
    }

    curl_close($ch);

    echo "HTTP {$statusCode}\n\n";

    $decoded = json_decode($response, true);

    if (json_last_error() === JSON_ERROR_NONE) {
        echo json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
        return;
    }

    echo $response . PHP_EOL;
}
