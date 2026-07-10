<?php

return [
    'max_viewers_default' => (int) env('LIVE_MAX_VIEWERS', 50),
    'heartbeat_interval_seconds' => (int) env('LIVE_HEARTBEAT_INTERVAL', 10),
    'stale_stream_timeout_seconds' => (int) env('LIVE_STALE_TIMEOUT', 300),
    'archive_chunk_size_kb' => (int) env('LIVE_ARCHIVE_CHUNK_SIZE_KB', 5120),
    'media_server' => [
        'enabled' => (bool) env('LIVE_MEDIA_SERVER_ENABLED', env('LIVEKIT_ENABLED', false)),
        'provider' => env('LIVE_MEDIA_SERVER_PROVIDER', env('LIVEKIT_ENABLED', false) ? 'livekit' : 'webrtc-p2p'),
        'whip_url' => env('LIVE_WHIP_URL'),
        'whep_url' => env('LIVE_WHEP_URL'),
        'hls_base_url' => env('LIVE_HLS_BASE_URL'),
        'rtmp_ingest_url' => env('LIVE_RTMP_INGEST_URL'),
    ],
    'livekit' => [
        'enabled' => (bool) env('LIVEKIT_ENABLED', false),
        'url' => env('LIVEKIT_URL'),
        'api_key' => env('LIVEKIT_API_KEY'),
        'api_secret' => env('LIVEKIT_API_SECRET'),
        'token_ttl_seconds' => (int) env('LIVEKIT_TOKEN_TTL', 21600),
    ],
    'turn' => [
        'urls' => array_values(array_filter(explode(',', (string) env('LIVE_TURN_URLS', '')))),
        'username' => env('LIVE_TURN_USERNAME'),
        'credential' => env('LIVE_TURN_CREDENTIAL'),
    ],
    'cdn' => [
        'base_url' => env('LIVE_CDN_BASE_URL'),
        'cache_seconds' => (int) env('LIVE_CDN_CACHE_SECONDS', 60),
    ],
];
