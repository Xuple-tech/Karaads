<?php

require __DIR__ . '/../vendor/autoload.php';

$bucket = getenv('WASABI_BUCKET') ?: getenv('AWS_BUCKET') ?: 'karaads-media';
$region = getenv('WASABI_REGION') ?: getenv('AWS_DEFAULT_REGION') ?: 'eu-west-1';
$endpoint = getenv('WASABI_ENDPOINT') ?: getenv('AWS_ENDPOINT') ?: "https://s3.{$region}.wasabisys.com";
$key = getenv('WASABI_ACCESS_KEY_ID') ?: getenv('AWS_ACCESS_KEY_ID');
$secret = getenv('WASABI_SECRET_ACCESS_KEY') ?: getenv('AWS_SECRET_ACCESS_KEY');
$prefix = trim(getenv('WASABI_SCAN_PREFIX') ?: 'posts', '/');
$reportPath = getenv('WASABI_REPORT_PATH') ?: __DIR__ . '/../storage/app/wasabi-media-space-report.json';

if (! $key || ! $secret) {
    fwrite(STDERR, "Missing WASABI_ACCESS_KEY_ID/WASABI_SECRET_ACCESS_KEY environment variables.\n");
    exit(1);
}

$prefixes = [];
$objects = [];
$duplicateCandidates = [];
$continuationToken = null;
$totalObjects = 0;
$totalBytes = 0;

do {
    $result = listWasabiObjects($endpoint, $region, $bucket, $key, $secret, [
        'list-type' => '2',
        'max-keys' => '1000',
        'prefix' => $prefix === '' ? '' : "{$prefix}/",
        ...($continuationToken ? ['continuation-token' => $continuationToken] : []),
    ]);

    foreach ($result['contents'] as $object) {
        $objectKey = $object['key'];
        $size = $object['size'];
        $etag = $object['etag'];
        $parts = explode('/', $objectKey);
        $topPrefix = count($parts) >= 2 ? "{$parts[0]}/{$parts[1]}" : ($parts[0] ?? '');

        $prefixes[$topPrefix] ??= ['objects' => 0, 'bytes' => 0];
        $prefixes[$topPrefix]['objects']++;
        $prefixes[$topPrefix]['bytes'] += $size;

        $totalObjects++;
        $totalBytes += $size;

        if ($size > 0 && $etag !== '') {
            $fingerprint = "{$size}:{$etag}";
            $duplicateCandidates[$fingerprint] ??= ['bytes_each' => $size, 'keys' => []];
            $duplicateCandidates[$fingerprint]['keys'][] = $objectKey;
        }

        if (count($objects) < 50) {
            $objects[] = [
                'key' => $objectKey,
                'bytes' => $size,
                'etag' => $etag,
                'last_modified' => $object['last_modified'],
            ];
        }
    }

    $continuationToken = $result['next_continuation_token'];
} while ($continuationToken);

$duplicates = [];
foreach ($duplicateCandidates as $candidate) {
    if (count($candidate['keys']) < 2) {
        continue;
    }

    $duplicates[] = [
        'copies' => count($candidate['keys']),
        'bytes_each' => $candidate['bytes_each'],
        'wasted_bytes_if_keep_one' => $candidate['bytes_each'] * (count($candidate['keys']) - 1),
        'keys' => $candidate['keys'],
    ];
}

usort($duplicates, static fn (array $a, array $b): int => $b['wasted_bytes_if_keep_one'] <=> $a['wasted_bytes_if_keep_one']);
uasort($prefixes, static fn (array $a, array $b): int => $b['bytes'] <=> $a['bytes']);

$report = [
    'bucket' => $bucket,
    'endpoint' => $endpoint,
    'prefix' => $prefix,
    'generated_at' => date(DATE_ATOM),
    'total_objects' => $totalObjects,
    'total_bytes' => $totalBytes,
    'total_gb' => round($totalBytes / 1024 / 1024 / 1024, 2),
    'prefixes' => array_map(
        static fn (array $item): array => [
            'objects' => $item['objects'],
            'bytes' => $item['bytes'],
            'gb' => round($item['bytes'] / 1024 / 1024 / 1024, 2),
        ],
        $prefixes
    ),
    'duplicate_groups' => count($duplicates),
    'duplicate_wasted_bytes_top_100' => array_sum(array_column(array_slice($duplicates, 0, 100), 'wasted_bytes_if_keep_one')),
    'duplicate_wasted_gb_top_100' => round(array_sum(array_column(array_slice($duplicates, 0, 100), 'wasted_bytes_if_keep_one')) / 1024 / 1024 / 1024, 2),
    'top_duplicate_groups' => array_slice($duplicates, 0, 100),
    'sample_objects' => $objects,
];

if (! is_dir(dirname($reportPath))) {
    mkdir(dirname($reportPath), 0775, true);
}

file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

echo "Wasabi media report written to {$reportPath}\n";
echo "Objects: {$totalObjects}\n";
echo "Total: " . round($totalBytes / 1024 / 1024 / 1024, 2) . " GB\n";
echo "Duplicate groups: " . count($duplicates) . "\n";
echo "Top 100 duplicate waste: " . round(array_sum(array_column(array_slice($duplicates, 0, 100), 'wasted_bytes_if_keep_one')) / 1024 / 1024 / 1024, 2) . " GB\n";

/**
 * @param  array<string, string>  $query
 * @return array{contents: array<int, array{key: string, size: int, etag: string, last_modified: ?string}>, next_continuation_token: ?string}
 */
function listWasabiObjects(string $endpoint, string $region, string $bucket, string $accessKey, string $secretKey, array $query): array
{
    $endpoint = rtrim($endpoint, '/');
    $host = parse_url($endpoint, PHP_URL_HOST);
    if (! is_string($host) || $host === '') {
        throw new RuntimeException('Invalid Wasabi endpoint.');
    }

    ksort($query);
    $canonicalQuery = http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    $path = '/' . rawurlencode($bucket);
    $url = "{$endpoint}{$path}?{$canonicalQuery}";
    $now = gmdate('Ymd\THis\Z');
    $date = gmdate('Ymd');
    $payloadHash = hash('sha256', '');
    $canonicalHeaders = "host:{$host}\n" . "x-amz-content-sha256:{$payloadHash}\n" . "x-amz-date:{$now}\n";
    $signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    $canonicalRequest = implode("\n", [
        'GET',
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
    $signingKey = awsSigningKey($secretKey, $date, $region, 's3');
    $signature = hash_hmac('sha256', $stringToSign, $signingKey);
    $authorization = "AWS4-HMAC-SHA256 Credential={$accessKey}/{$credentialScope}, SignedHeaders={$signedHeaders}, Signature={$signature}";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
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
        throw new RuntimeException("Wasabi list request failed with HTTP {$status}. {$error} {$body}");
    }

    $xml = simplexml_load_string($body);
    if (! $xml) {
        throw new RuntimeException('Wasabi returned invalid XML.');
    }

    $contents = [];
    foreach ($xml->Contents ?? [] as $item) {
        $contents[] = [
            'key' => (string) $item->Key,
            'size' => (int) $item->Size,
            'etag' => trim((string) $item->ETag, '"'),
            'last_modified' => ((string) $item->LastModified) ?: null,
        ];
    }

    $nextToken = (string) ($xml->NextContinuationToken ?? '');

    return [
        'contents' => $contents,
        'next_continuation_token' => $nextToken !== '' ? $nextToken : null,
    ];
}

function awsSigningKey(string $secretKey, string $date, string $region, string $service): string
{
    $dateKey = hash_hmac('sha256', $date, 'AWS4' . $secretKey, true);
    $dateRegionKey = hash_hmac('sha256', $region, $dateKey, true);
    $dateRegionServiceKey = hash_hmac('sha256', $service, $dateRegionKey, true);

    return hash_hmac('sha256', 'aws4_request', $dateRegionServiceKey, true);
}
