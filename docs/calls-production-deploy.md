# Production Calling Deployment (Nginx + PHP-FPM + Reverb + Coturn)

## 1) Required env values
Use `.env.calls.production.example` as baseline. Confirm these are not localhost values:
- `APP_URL`
- `REVERB_HOST`
- `VITE_REVERB_HOST`

## 2) Install Coturn
Run as root on VPS:

```bash
sudo bash scripts/install-coturn-ubuntu.sh \
  --domain turn.example.com \
  --public-ip 203.0.113.10 \
  --user karaads-turn \
  --password 'strong-password' \
  --realm example.com
```

Update `VITE_WEBRTC_ICE_SERVERS` in `.env` with your real TURN domain and credentials.

## 3) Nginx WebSocket proxy check (if Reverb behind Nginx)
Ensure your `server` block for `ws.example.com` supports upgrade headers:

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 600s;
}
```

## 4) Build, cache, and restart
Run on VPS app dir:

```bash
bash scripts/deploy-calls-production.sh /var/www/karaads
```

## 5) Cross-network verification
- User A on home Wi-Fi, User B on mobile data.
- Start call and verify both audio/video directions.
- In `chrome://webrtc-internals`, confirm candidate pair includes `relay` when NAT is strict.

## 6) Expected observability
- Browser console should not show localhost Reverb host fallback warnings.
- Reverb channels connect over `wss`.
- Call signaling events arrive in realtime (invite/accept/hangup).
