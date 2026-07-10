<?php

require __DIR__ . '/../vendor/autoload.php';

$bucket = getenv('WASABI_BUCKET') ?: getenv('AWS_BUCKET') ?: 'karaads-media';
$region = getenv('WASABI_REGION') ?: getenv('AWS_DEFAULT_REGION') ?: 'eu-west-1';
$endpoint = getenv('WASABI_ENDPOINT') ?: getenv('AWS_ENDPOINT') ?: "https://s3.{$region}.wasabisys.com";
$key = getenv('WASABI_ACCESS_KEY_ID') ?: getenv('AWS_ACCESS_KEY_ID');
$secret = getenv('WASABI_SECRET_ACCESS_KEY') ?: getenv('AWS_SECRET_ACCESS_KEY');
$minAgeDaysValue = getenv('WASABI_MIN_AGE_DAYS');
$minAgeDays = max(0, (int) ($minAgeDaysValue === false ? 30 : $minAgeDaysValue));
$minSizeMb = max(1, (int) (getenv('WASABI_MIN_SIZE_MB') ?: 25));
$limitGb = max(1, (int) (getenv('WASABI_DELETE_LIMIT_GB') ?: 10));
$delete = getenv('WASABI_DELETE_ORIGINALS') === '1';
$requireThumbnail = getenv('WASABI_REQUIRE_THUMBNAIL') === '1';

if (! $key || ! $secret) {
    fwrite(STDERR, "Missing WASABI_ACCESS_KEY_ID/WASABI_SECRET_ACCESS_KEY environment variables.\n");
    exit(1);
}

$cutoff = new DateTimeImmutable("-{$minAgeDays} days");
$minSizeBytes = $minSizeMb * 1024 * 1024;
$limitBytes = $limitGb * 1024 * 1024 * 1024;
$videoExtensions = ['mp4', 'mov', 'm4v', 'webm'];
$deleted = 0;
$failed = 0;
$candidateBytes = 0;
$deletedBytes = 0;
$candidates = [];
$derivedKeys = [];

foreach (listWasabiObjects($endpoint, $region, $bucket, $key, $secret, 'posts/derived/') as $object) {
    $derivedKeys[$object['key']] = true;
}

foreach (listWasabiObjects($endpoint, $region, $bucket, $key, $secret, 'posts/original/') as $object) {
    $objectKey = $object['key'];
    $size = $object['size'];
    $extension = strtolower(pathinfo($objectKey, PATHINFO_EXTENSION));

    if (! in_array($extension, $videoExtensions, true) || $size < $minSizeBytes) {
        continue;
    }

    $lastModified = $object['last_modified'] ? new DateTimeImmutable($object['last_modified']) : null;
    if (! $lastModified || $lastModified > $cutoff) {
        continue;
    }

    $base = pathinfo($objectKey, PATHINFO_FILENAME);
    $processedKey = "posts/derived/{$base}_processed.mp4";
    $thumbKey = "posts/derived/{$base}_thumb.webp";

    if (! isset($derivedKeys[$processedKey])) {
        continue;
    }

    if ($requireThumbnail && ! isset($derivedKeys[$thumbKey])) {
        continue;
    }

    $candidateBytes += $size;
    $candidates[] = [
        'original' => $objectKey,
        'processed' => $processedKey,
        'thumbnail' => $thumbKey,
        'bytes' => $size,
        'gb' => round($size / 1024 / 1024 / 1024, 3),
        'last_modified' => $object['last_modified'],
    ];

    if ($candidateBytes >= $limitBytes) {
        break;
    }
}

foreach ($candidates as $candidate) {
    if (! $delete) {
        break;
    }

    try {
        foreach (array_chunk($candidates, 1000) as $chunk) {
            $deletedKeys = batchDeleteObjects(
                $endpoint,
                $region,
                $bucket,
                $key,
                $secret,
                array_column($chunk, 'original')
            );
            $deleted += $deletedKeys;

            foreach ($chunk as $deletedCandidate) {
                $deletedBytes += $deletedCandidate['bytes'];
            }
        }

        break;
    } catch (Throwable $e) {
        $failed += count($candidates) - $deleted;
        fwrite(STDERR, "Batch delete failed :: {$e->getMessage()}\n");
        break;
    }
}

$report = [
    'mode' => $delete ? 'delete' : 'dry-run',
    'bucket' => $bucket,
    'generated_at' => date(DATE_ATOM),
    'min_age_days' => $minAgeDays,
    'min_size_mb' => $minSizeMb,
    'delete_limit_gb' => $limitGb,
    'require_thumbnail' => $requireThumbnail,
    'derived_objects_loaded' => count($derivedKeys),
    'candidate_count' => count($candidates),
    'candidate_gb' => round($candidateBytes / 1024 / 1024 / 1024, 2),
    'deleted_count' => $deleted,
    'deleted_gb' => round($deletedBytes / 1024 / 1024 / 1024, 2),
    'failed_count' => $failed,
    'candidates' => $candidates,
];

$reportPath = __DIR__ . '/../storage/app/wasabi-safe-original-delete-report.json';
file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo ($delete ? "Delete mode" : "Dry-run mode") . "\n";
echo "Criteria: originals older than {$minAgeDays} days, larger than {$minSizeMb}MB, with processed video present" . ($requireThumbnail ? " and thumbnail present" : "") . ".\n";
echo "Derived objects loaded: " . count($derivedKeys) . "\n";
echo "Candidates: " . count($candidates) . "\n";
echo "Candidate space: " . round($candidateBytes / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Deleted: {$deleted}\n";
echo "Deleted space: " . round($deletedBytes / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Failed: {$failed}\n";
echo "Report: {$reportPath}\n";

/**
 * @return Generator<int, array{key: string, size: int, etag: string, last_modified: ?string}>
 */
function listWasabiObjects(string $endpoint, string $region, string $bucket, string $accessKey, string $secretKey, string $prefix): Generator
{
    $continuationToken = null;

    do {
        $query = [
            'list-type' => '2',
            'max-keys' => '1000',
            'prefix' => $prefix,
        ];
        if ($continuationToken) {
            $query['continuation-token'] = $continuationToken;
        }

        $result = wasabiRequestWithRetry($endpoint, $region, $bucket, $accessKey, $secretKey, 'GET', '', $query);
        $xml = simplexml_load_string($result['body']);
        if (! $xml) {
            throw new RuntimeException('Wasabi returned invalid XML.');
        }

        foreach ($xml->Contents ?? [] as $item) {
            yield [
                'key' => (string) $item->Key,
                'size' => (int) $item->Size,
                'etag' => trim((string) $item->ETag, '"'),
                'last_modified' => ((string) $item->LastModified) ?: null,
            ];
        }

        $continuationToken = (string) ($xml->NextContinuationToken ?? '');
        $continuationToken = $continuationToken !== '' ? $continuationToken : null;
    } while ($continuationToken);
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
        CURLOPT_TIMEOUT => 180,
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

/**
 * @param  array<string, string>  $query
 * @return array{status: int, body: string}
 */
function wasabiRequestWithRetry(
    string $endpoint,
    string $region,
    string $bucket,
    string $accessKey,
    string $secretKey,
    string $method,
    string $objectKey,
    array $query
): array {
    $lastError = null;

    for ($attempt = 1; $attempt <= 3; $attempt++) {
        try {
            return wasabiRequest($endpoint, $region, $bucket, $accessKey, $secretKey, $method, $objectKey, $query);
        } catch (Throwable $e) {
            $lastError = $e;
            sleep($attempt);
        }
    }

    throw $lastError ?? new RuntimeException('Wasabi request failed.');
}

/**
 * @param  array<int, string>  $keys
 */
function batchDeleteObjects(
    string $endpoint,
    string $region,
    string $bucket,
    string $accessKey,
    string $secretKey,
    array $keys
): int {
    if ($keys === []) {
        return 0;
    }

    $xml = '<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Quiet>true</Quiet>';
    foreach ($keys as $key) {
        $xml .= '<Object><Key>' . htmlspecialchars($key, ENT_XML1) . '</Key></Object>';
    }
    $xml .= '</Delete>';

    $result = wasabiRequestWithBody($endpoint, $region, $bucket, $accessKey, $secretKey, 'POST', '', ['delete' => ''], $xml);
    $response = simplexml_load_string($result['body']);
    if (! $response) {
        throw new RuntimeException('Wasabi returned invalid batch delete XML.');
    }

    $errors = [];
    foreach ($response->Error ?? [] as $error) {
        $errors[] = (string) $error->Key . ': ' . (string) $error->Message;
    }

    if ($errors !== []) {
        throw new RuntimeException(implode('; ', array_slice($errors, 0, 5)));
    }

    return count($keys);
}

/**
 * @param  array<string, string>  $query
 * @return array{status: int, body: string}
 */
function wasabiRequestWithBody(
    string $endpoint,
    string $region,
    string $bucket,
    string $accessKey,
    string $secretKey,
    string $method,
    string $objectKey,
    array $query,
    string $body
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
    $payloadHash = hash('sha256', $body);
    $contentMd5 = base64_encode(md5($body, true));
    $canonicalHeaders = "content-md5:{$contentMd5}\n" . "host:{$host}\n" . "x-amz-content-sha256:{$payloadHash}\n" . "x-amz-date:{$now}\n";
    $signedHeaders = 'content-md5;host;x-amz-content-sha256;x-amz-date';
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
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_TIMEOUT => 180,
        CURLOPT_HTTPHEADER => [
            "Authorization: {$authorization}",
            "Content-MD5: {$contentMd5}",
            'Content-Type: application/xml',
            "x-amz-content-sha256: {$payloadHash}",
            "x-amz-date: {$now}",
        ],
    ]);

    $responseBody = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $status < 200 || $status >= 300) {
        throw new RuntimeException("Wasabi {$method} request failed with HTTP {$status}. {$error} {$responseBody}");
    }

    return ['status' => $status, 'body' => (string) $responseBody];
}

function awsSigningKey(string $secretKey, string $date, string $region, string $service): string
{
    $dateKey = hash_hmac('sha256', $date, 'AWS4' . $secretKey, true);
    $dateRegionKey = hash_hmac('sha256', $region, $dateKey, true);
    $dateRegionServiceKey = hash_hmac('sha256', $service, $dateRegionKey, true);

    return hash_hmac('sha256', 'aws4_request', $dateRegionServiceKey, true);
}
