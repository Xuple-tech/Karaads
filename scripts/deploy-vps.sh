#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${1:-$(pwd)}"

if [[ ! -f "${APP_DIR}/artisan" ]]; then
  echo "artisan not found in ${APP_DIR}"
  echo "Usage: bash scripts/deploy-vps.sh /var/www/karaads"
  exit 1
fi

cd "${APP_DIR}"

echo "Deploying KaraAds from ${APP_DIR}"

mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views bootstrap/cache
chown -R www:www storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

php artisan down --render="errors::503" || true

composer install --no-dev --prefer-dist --optimize-autoloader
if ! npm ci; then
  echo "npm ci failed, retrying with --legacy-peer-deps"
  npm ci --legacy-peer-deps
fi
npm run build:ssr

php artisan migrate --force
php artisan storage:link || true
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

chown -R www:www storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

php artisan up

echo
echo "Deployment complete."
echo "If you use systemd, restart these services now:"
echo "  sudo systemctl restart karaads-queue"
echo "  sudo systemctl restart karaads-reverb"
echo "  sudo systemctl restart karaads-ssr"
echo "  sudo systemctl restart karaads-scheduler"
