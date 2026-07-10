#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_HOST="${APP_HOST:-127.0.0.1}"
VITE_HOST="${VITE_HOST:-127.0.0.1}"
VITE_PORT="${VITE_PORT:-5173}"
REVERB_HOST="${REVERB_HOST:-127.0.0.1}"
REVERB_SERVER_HOST="${REVERB_SERVER_HOST:-0.0.0.0}"
REVERB_SERVER_PORT="${REVERB_SERVER_PORT:-8080}"
PHP_UPLOAD_LIMIT="${PHP_UPLOAD_LIMIT:-50G}"
PHP_UPLOAD_INI_DIR="${SCRIPT_DIR}/php-conf.d"
export PHP_INI_SCAN_DIR="${PHP_INI_SCAN_DIR:-}:${PHP_UPLOAD_INI_DIR}"

detect_default_app_port() {
    php -r '
        $appUrl = getenv("APP_URL") ?: "http://127.0.0.1:8002";
        $port = parse_url($appUrl, PHP_URL_PORT) ?: 8002;
        echo $port;
    '
}

port_is_free() {
    php -r '
        $host = $argv[1];
        $port = (int) $argv[2];
        $server = @stream_socket_server("tcp://{$host}:{$port}", $errno, $errstr);
        if ($server === false) {
            exit(1);
        }
        fclose($server);
    ' "$1" "$2"
}

APP_PORT="${APP_PORT:-$(detect_default_app_port)}"

while ! port_is_free "$APP_HOST" "$APP_PORT"; do
    APP_PORT="$((APP_PORT + 1))"
done

export APP_URL="http://${APP_HOST}:${APP_PORT}"
export REVERB_HOST
export REVERB_SERVER_HOST
export REVERB_SERVER_PORT

echo "Starting KaraAds"
echo "Laravel: ${APP_URL}"
echo "Vite:    http://${VITE_HOST}:${VITE_PORT}"
echo "Reverb:  http://${REVERB_HOST}:${REVERB_SERVER_PORT}"
echo "Uploads: ${PHP_UPLOAD_LIMIT} max per request/file"

exec node node_modules/concurrently/dist/bin/concurrently.js \
    -c "#93c5fd,#c4b5fd,#fb7185,#fdba74,#34d399" \
    "php -d upload_max_filesize=${PHP_UPLOAD_LIMIT} -d post_max_size=${PHP_UPLOAD_LIMIT} -d max_input_time=-1 -d max_execution_time=0 artisan serve --host=${APP_HOST} --port=${APP_PORT}" \
    "php artisan queue:listen --tries=1" \
    "php artisan pail --timeout=0" \
    "php artisan reverb:start --host=${REVERB_SERVER_HOST} --port=${REVERB_SERVER_PORT}" \
    "node node_modules/vite/bin/vite.js --host ${VITE_HOST} --port ${VITE_PORT}" \
    --names=server,queue,logs,reverb,vite \
    --kill-others
