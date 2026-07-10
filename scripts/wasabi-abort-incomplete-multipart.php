<?php

require __DIR__ . '/../vendor/autoload.php';

$bucket = getenv('WASABI_BUCKET') ?: getenv('AWS_BUCKET') ?: 'karaads-media';
$region = getenv('WASABI_REGION') ?: getenv('AWS_DEFAULT_REGION') ?: 'eu-west-1';
$endpoint = getenv('WASABI_ENDPOINT') ?: getenv('AWS_ENDPOINT') ?: "https://s3.{$region}.wasabisys.com";
$key = getenv('WASABI_ACCESS_KEY_ID') ?: getenv('AWS_ACCESS_KEY_ID');
$secret = getenv('WASABI_SECRET_ACCESS_KEY') ?: getenv('AWS_SECRET_ACCESS_KEY');
$prefix = trim(getenv('WASABI_SCAN_PREFIX') ?: '', '/');
$abort = getenv('WASABI_ABORT_MULTIPART') === '1';

if (! $key || ! $secret) {
    fwrite(STDERR, "Missing WASABI_ACCESS_KEY_ID/WASABI_SECRET_ACCESS_KEY environment variables.\n");
    exit(1);
}

$uploads = [];
$keyMarker = null;
$uploadIdMarker = null;

do {
    $query = ['uploads' => ''];
    if ($prefix !== '') {
        $query['prefix'] = "{$prefix}/";
    }
    if ($keyMarker) {
        $query['key-marker'] = $keyMarker;
    }
    if ($uploadIdMarker) {
        $query['upload-id-marker'] = $uploadIdMarker;
    }

    $result = wasabiRequest($endpoint, $region, $bucket, $key, $secret, 'GET', '', $query);
    $xml = simplexml_load_string($result['body']);
    if (! $xml) {
        throw new RuntimeException('Wasabi returned invalid XML.');
    }

    foreach ($xml->Upload ?? [] as $upload) {
        $uploads[] = [
            'key' => (string) $upload->Key,
            'upload_id' => (string) $upload->UploadId,
            'initiated' => (string) $upload->Initiated,
        ];
    }

    $isTruncated = strtolower((string) ($xml->IsTruncated ?? 'false')) === 'true';
    $keyMarker = (string) ($xml->NextKeyMarker ?? '');
    $uploadIdMarker = (string) ($xml->NextUploadIdMarker ?? '');
    $keyMarker = $keyMarker !== '' ? $keyMarker : null;
    $uploadIdMarker = $uploadIdMarker !== '' ? $uploadIdMarker : null;
} while ($isTruncated && $keyMarker && $uploadIdMarker);

$aborted = 0;
$failed = 0;

foreach ($uploads as $upload) {
    if (! $abort) {
        continue;
    }

    try {
        wasabiRequest($endpoint, $region, $bucket, $key, $secret, 'DELETE', $upload['key'], [
            'uploadId' => $upload['upload_id'],
        ]);
        $aborted++;
    } catch (Throwable $e) {
        $failed++;
        fwrite(STDERR, "Failed {$upload['key']} :: {$e->getMessage()}\n");
    }
}

echo $abort ? "Abort mode: on\n" : "Abort mode: dry-run\n";
echo "Incomplete multipart uploads found: " . count($uploads) . "\n";
echo "Aborted: {$aborted}\n";
echo "Failed: {$failed}\n";

foreach (array_slice($uploads, 0, 20) as $upload) {
    echo "{$upload['initiated']} {$upload['key']}\n";
}

/**
 * @param  array<string, string>  $query
 * @return array{status: int, body: string}
 */
function wasabiRequest(
    string $endpoint,
    string $region,
    string $bucket,
    string $accessKey,
    string $secretKey,
    string $method,
    string $objectKey,
    array $query
): array {
    $endpoint = rtrim($endpoint, '/');
    $host = parse_url($endpoint, PHP_URL_HOST);
    if (! is_string($host) || $host === '') {
        throw new RuntimeException('Invalid Wasabi endpoint.');
    }

    ksort($query);
    $canonicalQuery = http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    $path = '/' . rawurlencode($bucket);
    if ($objectKey !== '') {
        $segments = array_map('rawurlencode', explode('/', ltrim($objectKey, '/')));
        $path .= '/' . implode('/', $segments);
    }

    $url = "{$endpoint}{$path}" . ($canonicalQuery !== '' ? "?{$canonicalQuery}" : '');
    $now = gmdate('Ymd\THis\Z');
    $date = gmdate('Ymd');
    $payloadHash = hash('sha256', '');
    $canonicalHeaders = "host:{$host}\n" . "x-amz-content-sha256:{$payloadHash}\n" . "x-amz-date:{$now}\n";
    $signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    $canonicalRequest = implode("\n", [
        $method,
        $path,
        $canonicalQuery,
        $canonicalHeaders,
        $signedHeaders,
        $payloadHash,
    ]);
    $credentialScope = "{$date}/{$region}/s3/aws4_request";
    $stringToSign = implode("\n", [
        'AWS4-HMAC-SHA256',
        $now,
        $credentialScope,
        hash('sha256', $canonicalRequest),
    ]);
    $signature = hash_hmac('sha256', $stringToSign, awsSigningKey($secretKey, $date, $region, 's3'));
    $authorization = "AWS4-HMAC-SHA256 Credential={$accessKey}/{$credentialScope}, SignedHeaders={$signedHeaders}, Signature={$signature}";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_HTTPHEADER => [
            "Authorization: {$authorization}",
            "x-amz-content-sha256: {$payloadHash}",
            "x-amz-date: {$now}",
        ],
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $status < 200 || $status >= 300) {
        throw new RuntimeException("Wasabi {$method} request failed with HTTP {$status}. {$error} {$body}");
    }

    return ['status' => $status, 'body' => (string) $body];
}

function awsSigningKey(string $secretKey, string $date, string $region, string $service): string
{
    $dateKey = hash_hmac('sha256', $date, 'AWS4' . $secretKey, true);
    $dateRegionKey = hash_hmac('sha256', $region, $dateKey, true);
    $dateRegionServiceKey = hash_hmac('sha256', $service, $dateRegionKey, true);

    return hash_hmac('sha256', 'aws4_request', $dateRegionServiceKey, true);
}
