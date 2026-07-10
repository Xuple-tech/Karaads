# KaraAds VPS Deployment

This project is a Laravel 12 + React/Vite app with:
- PHP-FPM + Nginx
- Node build step
- Laravel queues
- Laravel Reverb for realtime
- Inertia SSR enabled

## 1) VPS requirements

Install these first on Ubuntu:
- Nginx
- PHP 8.2+ with `php-fpm`, `mbstring`, `xml`, `curl`, `mysql`, `sqlite3`, `zip`, `bcmath`, `intl`, `gd`
- Composer
- Node.js 20+
- MySQL or MariaDB
- Git

Example:

```bash
sudo apt update
sudo apt install -y nginx mysql-server unzip git curl
sudo apt install -y php8.3 php8.3-fpm php8.3-cli php8.3-mysql php8.3-sqlite3 php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl php8.3-gd
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
rm composer-setup.php
```

## 2) Upload the project

Put the app here:

```bash
sudo mkdir -p /var/www/karaads
sudo chown -R $USER:$USER /var/www/karaads
```

Then upload with one of these:
- `git clone` into `/var/www/karaads`
- SFTP from your computer
- `scp -r` from your computer

## 3) Create the database

Example MySQL setup:

```bash
sudo mysql
```

```sql
CREATE DATABASE karaads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'karaads'@'localhost' IDENTIFIED BY 'change-this-password';
GRANT ALL PRIVILEGES ON karaads.* TO 'karaads'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 4) Configure `.env`

Inside `/var/www/karaads`, create your production `.env`.

Minimum values to review:
- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://example.com`
- `DB_CONNECTION=mysql`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=karaads`
- `DB_USERNAME=karaads`
- `DB_PASSWORD=...`
- `QUEUE_CONNECTION=database`
- `SESSION_DRIVER=database`
- `CACHE_STORE=database` or `redis`
- `BROADCAST_DRIVER=reverb`
- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`
- `REVERB_HOST=ws.example.com`
- `REVERB_PORT=443`
- `REVERB_SCHEME=https`
- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST=ws.example.com`
- `VITE_REVERB_PORT=443`
- `VITE_REVERB_SCHEME=https`

Because SSR is enabled in this repo, make sure Node is installed and keep the SSR service running.

If you use call features, also configure:
- `VITE_WEBRTC_ICE_SERVERS`

## 5) First-time app setup

From the app directory:

```bash
composer install
npm ci
php artisan key:generate
php artisan migrate --force
php artisan storage:link
npm run build:ssr
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

Create `.env` manually first if it does not already exist. This repository does not currently include a root `.env.example`.

## 6) Permissions

```bash
sudo chown -R www-data:www-data /var/www/karaads
sudo find /var/www/karaads -type f -exec chmod 644 {} \;
sudo find /var/www/karaads -type d -exec chmod 755 {} \;
sudo chown -R www-data:www-data /var/www/karaads/storage /var/www/karaads/bootstrap/cache
sudo chmod -R 775 /var/www/karaads/storage /var/www/karaads/bootstrap/cache
```

## 7) Nginx

Copy the example config:

```bash
sudo cp deploy/nginx/karaads.conf /etc/nginx/sites-available/karaads
sudo ln -s /etc/nginx/sites-available/karaads /etc/nginx/sites-enabled/karaads
```

If you use Reverb on a websocket subdomain:

```bash
sudo cp deploy/nginx/karaads-reverb.conf /etc/nginx/sites-available/karaads-reverb
sudo ln -s /etc/nginx/sites-available/karaads-reverb /etc/nginx/sites-enabled/karaads-reverb
```

Update:
- domain names
- PHP socket path if not `php8.3-fpm.sock`
- app root path if different

Then test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 8) SSL

Use Certbot after Nginx is live:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot --nginx -d ws.example.com
```

## 9) Background services

Install the provided `systemd` services:

```bash
sudo cp deploy/systemd/karaads-queue.service /etc/systemd/system/
sudo cp deploy/systemd/karaads-reverb.service /etc/systemd/system/
sudo cp deploy/systemd/karaads-ssr.service /etc/systemd/system/
sudo cp deploy/systemd/karaads-scheduler.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now karaads-queue karaads-reverb karaads-ssr karaads-scheduler
```

If your PHP binary is not `/usr/bin/php`, edit the service files first.

## 10) Future deployments

After you upload new code:

```bash
bash scripts/deploy-vps.sh /var/www/karaads
sudo systemctl restart karaads-queue karaads-reverb karaads-ssr karaads-scheduler
```

## 11) Quick checks

Use these when something fails:

```bash
php artisan about
php artisan migrate:status
php artisan queue:failed
sudo systemctl status karaads-queue
sudo systemctl status karaads-reverb
sudo systemctl status karaads-ssr
sudo journalctl -u karaads-reverb -n 100 --no-pager
sudo journalctl -u karaads-ssr -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/karaads-error.log
tail -n 100 storage/logs/laravel.log
```

## 12) Important note for this repo

`docs/calls-production-deploy.md` references helper scripts that are not currently present in this repository. Use the files in `deploy/` and `scripts/deploy-vps.sh` as the working deployment baseline for now.
