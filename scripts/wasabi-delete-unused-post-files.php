<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$bucket = getenv('WASABI_BUCKET') ?: getenv('AWS_BUCKET') ?: config('filesystems.disks.s3.bucket', 'karaads-media');
$region = getenv('WASABI_REGION') ?: getenv('AWS_DEFAULT_REGION') ?: config('filesystems.disks.s3.region', 'eu-west-1');
$endpoint = getenv('WASABI_ENDPOINT') ?: getenv('AWS_ENDPOINT') ?: config('filesystems.disks.s3.endpoint', "https://s3.{$region}.wasabisys.com");
$key = getenv('WASABI_ACCESS_KEY_ID') ?: getenv('AWS_ACCESS_KEY_ID') ?: config('filesystems.disks.s3.key');
$secret = getenv('WASABI_SECRET_ACCESS_KEY') ?: getenv('AWS_SECRET_ACCESS_KEY') ?: config('filesystems.disks.s3.secret');
$delete = getenv('WASABI_DELETE_UNUSED_POST_FILES') === '1';
$minAgeHours = max(0, (int) (getenv('WASABI_UNUSED_MIN_AGE_HOURS') ?: 24));
$limitGb = max(1, (int) (getenv('WASABI_UNUSED_DELETE_LIMIT_GB') ?: 25));
$prefixes = array_values(array_filter(array_map(
    static fn (string $prefix): string => trim($prefix, '/'),
    explode(',', getenv('WASABI_UNUSED_PREFIXES') ?: 'posts,post-music')
)));

if (! $key || ! $secret || ! $bucket || ! $region || ! $endpoint) {
    fwrite(STDERR, "Missing Wasabi/S3 environment configuration.\n");
    exit(1);
}

$referenced = collectActivePostPaths();
$cutoff = new DateTimeImmutable("-{$minAgeHours} hours");
$limitBytes = $limitGb * 1024 * 1024 * 1024;
$candidateBytes = 0;
$candidates = [];
$scanned = 0;

foreach ($prefixes as $prefix) {
    foreach (listWasabiObjects($endpoint, $region, $bucket, $key, $secret, $prefix) as $object) {
        $scanned++;

        $objectKey = normalizeStoragePath($object['key']);
        if ($objectKey === '' || isset($referenced[$objectKey])) {
            continue;
        }

        $lastModified = $object['last_modified'] ? new DateTimeImmutable($object['last_modified']) : null;
        if ($lastModified && $lastModified > $cutoff) {
            continue;
        }

        $candidateBytes += $object['size'];
        $candidates[] = [
            'key' => $objectKey,
            'bytes' => $object['size'],
            'gb' => round($object['size'] / 1024 / 1024 / 1024, 4),
            'last_modified' => $object['last_modified'],
        ];

        if ($candidateBytes >= $limitBytes) {
            break 2;
        }
    }
}

$deleted = 0;
$deletedBytes = 0;
$failed = 0;

if ($delete && $candidates !== []) {
    foreach (array_chunk($candidates, 1000) as $chunk) {
        try {
            $deletedKeys = batchDeleteObjects(
                $endpoint,
                $region,
                $bucket,
                $key,
                $secret,
                array_column($chunk, 'key')
            );
            $deleted += $deletedKeys;
            $deletedBytes += array_sum(array_column($chunk, 'bytes'));
        } catch (Throwable $e) {
            $failed += count($chunk);
            fwrite(STDERR, "Batch delete failed :: {$e->getMessage()}\n");
        }
    }
}

$report = [
    'mode' => $delete ? 'delete' : 'dry-run',
    'bucket' => $bucket,
    'prefixes' => $prefixes,
    'generated_at' => date(DATE_ATOM),
    'active_post_references' => count($referenced),
    'scanned_objects' => $scanned,
    'min_age_hours' => $minAgeHours,
    'delete_limit_gb' => $limitGb,
    'candidate_count' => count($candidates),
    'candidate_gb' => round($candidateBytes / 1024 / 1024 / 1024, 2),
    'deleted_count' => $deleted,
    'deleted_gb' => round($deletedBytes / 1024 / 1024 / 1024, 2),
    'failed_count' => $failed,
    'sample_candidates' => array_slice($candidates, 0, 100),
];

$reportPath = __DIR__ . '/../storage/app/wasabi-unused-post-files-report.json';
file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo ($delete ? "Delete mode" : "Dry-run mode") . "\n";
echo "Prefixes: " . implode(', ', $prefixes) . "\n";
echo "Active post references: " . count($referenced) . "\n";
echo "Scanned objects: {$scanned}\n";
echo "Candidates: " . count($candidates) . "\n";
echo "Candidate space: " . round($candidateBytes / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Deleted: {$deleted}\n";
echo "Deleted space: " . round($deletedBytes / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Failed: {$failed}\n";
echo "Report: {$reportPath}\n";

/**
 * @return array<string, true>
 */
function collectActivePostPaths(): array
{
    $paths = [];

    DB::table('posts')
        ->whereNull('deleted_at')
        ->whereNotNull('music_path')
        ->orderBy('id')
        ->select(['music_path'])
        ->chunk(1000, function ($rows) use (&$paths): void {
            foreach ($rows as $row) {
                addPath($paths, $row->music_path ?? null);
            }
        });

    DB::table('post_media')
        ->join('posts', 'posts.id', '=', 'post_media.post_id')
        ->whereNull('posts.deleted_at')
        ->orderBy('post_media.id')
        ->select([
            'post_media.file_path',
            'post_media.processed_file_path',
            'post_media.thumbnail_path',
            'post_media.variants',
        ])
        ->chunk(1000, function ($rows) use (&$paths): void {
            foreach ($rows as $row) {
                addPath($paths, $row->file_path ?? null);
                addPath($paths, $row->processed_file_path ?? null);
                addPath($paths, $row->thumbnail_path ?? null);

                $variants = json_decode((string) ($row->variants ?? ''), true);
                if (is_array($variants)) {
                    array_walk_recursive($variants, function ($value) use (&$paths): void {
                        addPath($paths, is_string($value) ? $value : null);
                    });
                }
            }
        });

    return $paths;
}

/**
 * @param array<string, true> $paths
 */
function addPath(array &$paths, ?string $path): void
{
    $normalized = normalizeStoragePath($path);
    if ($normalized !== '') {
        $paths[$normalized] = true;
    }
}

function normalizeStoragePath(?string $path): string
{
    $path = trim((string) $path);
    if ($path === '' || $path === '0') {
        return '';
    }

    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
        $parsedPath = parse_url($path, PHP_URL_PATH);
        $path = is_string($parsedPath) ? $parsedPath : $path;
    }

    $path = ltrim(str_replace('\\', '/', $path), '/');

    foreach (['storage/', 'public/'] as $prefix) {
        if (str_starts_with($path, $prefix)) {
            $path = substr($path, strlen($prefix));
        }
    }

    return trim(rawurldecode($path), '/');
}

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
            'prefix' => $prefix === '' ? '' : "{$prefix}/",
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
            if ($attempt < 3) {
                usleep(250000 * $attempt);
            }
        }
    }

    throw $lastError ?? new RuntimeException('Wasabi request failed.');
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
    $payloadHash = hash('sha256', '');
    $headers = signedWasabiHeaders($method, $path, $canonicalQuery, $payloadHash, $host, $region, $accessKey, $secretKey);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => $headers,
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false || $status >= 400) {
        throw new RuntimeException("Wasabi {$method} request failed with HTTP {$status}. {$error} {$body}");
    }

    return ['status' => $status, 'body' => (string) $body];
}

/**
 * @param array<int, string> $keys
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

    wasabiRequestWithBody($endpoint, $region, $bucket, $accessKey, $secretKey, 'POST', '', ['delete' => ''], $xml);

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
    $payloadHash = hash('sha256', $body);
    $headers = signedWasabiHeaders($method, $path, $canonicalQuery, $payloadHash, $host, $region, $accessKey, $secretKey);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => false,
        CURLOPT_TIMEOUT => 120,
        CURLOPT_HTTPHEADER => array_merge($headers, [
            'Content-Type: application/xml',
            'Content-Length: ' . strlen($body),
        ]),
    ]);

    $responseBody = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($responseBody === false || $status >= 400) {
        throw new RuntimeException("Wasabi {$method} request failed with HTTP {$status}. {$error} {$responseBody}");
    }

    return ['status' => $status, 'body' => (string) $responseBody];
}

/**
 * @return array<int, string>
 */
function signedWasabiHeaders(
    string $method,
    string $path,
    string $canonicalQuery,
    string $payloadHash,
    string $host,
    string $region,
    string $accessKey,
    string $secretKey
): array {
    $now = gmdate('Ymd\THis\Z');
    $date = gmdate('Ymd');
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

    return [
        "Authorization: {$authorization}",
        "x-amz-content-sha256: {$payloadHash}",
        "x-amz-date: {$now}",
    ];
}

function awsSigningKey(string $secretKey, string $date, string $region, string $service): string
{
    $kDate = hash_hmac('sha256', $date, 'AWS4' . $secretKey, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);

    return hash_hmac('sha256', 'aws4_request', $kService, true);
}
