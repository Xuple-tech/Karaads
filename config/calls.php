<?php

return [
    'enabled_v2' => env('CALLS_ENABLED_V2', false),

    'default_max_participants' => (int) env('CALLS_DEFAULT_MAX_PARTICIPANTS', 8),

    'hard_max_participants' => (int) env('CALLS_HARD_MAX_PARTICIPANTS', 8),

    'call_ttl_minutes' => (int) env('CALLS_TTL_MINUTES', 10),

    'ringing_timeout_seconds' => (int) env('CALLS_RINGING_TIMEOUT_SECONDS', 60),

    'inactive_accepted_timeout_seconds' => (int) env('CALLS_INACTIVE_ACCEPTED_TIMEOUT_SECONDS', 120),

    'signal_ttl_minutes' => (int) env('CALLS_SIGNAL_TTL_MINUTES', 3),

    'join_token_ttl_minutes' => (int) env('CALLS_JOIN_TOKEN_TTL_MINUTES', 15),

    'lock_ttl_seconds' => (int) env('CALLS_LOCK_TTL_SECONDS', 5),

    'resume_poll_interval_ms' => (int) env('CALLS_RESUME_POLL_INTERVAL_MS', 5000),

    'sdp_max_len' => (int) env('CALLS_SDP_MAX_LEN', 50000),

    'ice_max_len' => (int) env('CALLS_ICE_MAX_LEN', 20000),
];
