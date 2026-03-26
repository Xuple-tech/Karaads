# Multi-Currency & Request Tracking System Setup Guide

## Overview
This system provides comprehensive multi-currency support with automatic IP-based detection, request tracking, bot prevention, and prompt abuse detection.

## Features

### 1. **Multi-Currency Support**
- Real-time exchange rate conversion from Open Exchange Rates API
- 50+ supported currencies
- Automatic detection based on user's IP geolocation
- User preference management with manual override
- Proper currency formatting with locale-specific symbols
- 1-hour cache with automatic fallback to last known rate

### 2. **Request Tracking**
- Complete audit trail of all HTTP requests
- IP address and user agent logging
- Response time and status code tracking
- Bot detection scoring (0-100)
- Currency detection per request
- Soft deletes for audit preservation

### 3. **Bot Prevention & Detection**
- Multi-factor bot scoring:
  - User-agent pattern matching (50+ bot patterns)
  - Request rate analysis (>100 req/min alerts)
  - IP reputation historical analysis
  - Missing/suspicious user agent detection
- Automatic blocking of known crawlers
- 403 response for blocked bot requests
- Prevents search engine indexing

### 4. **Prompt Abuse Detection**
- Spam pattern detection (repeated characters)
- Command injection attempt detection
- Duplicate prompt detection via SHA256 hashing
- Rate limiting violations tracking
- Abuse flagging with detailed reasons
- Token usage estimation

## Installation & Setup

### Step 1: Environment Configuration

Add to `.env`:

```env
# Currency Exchange Rates API
OPENEXCHANGERATES_API_KEY=your_api_key_here
DEFAULT_CURRENCY=USD

# Optional: Configure rate cache duration
CURRENCY_CACHE_HOURS=1
```

Get your free API key from: https://openexchangerates.org/

### Step 2: Database Migration

Run the migration to create all required tables:

```bash
php artisan migrate
```

This creates 6 tables:
- `currency_rates` - Exchange rate caching
- `request_logs` - HTTP request audit trail
- `prompt_logs` - Prompt analytics
- `ip_reputation` - IP reputation scoring
- `user_currency_preferences` - User settings
- `suspicious_activity_alerts` - Security alerts

### Step 3: Verify Middleware Registration

Check `app/Http/Kernel.php` - middleware should be registered globally:

```php
protected $middleware = [
    // ... other middleware
    TrackRequest::class,
    BotDetection::class,
];
```

### Step 4: Clear Configuration Cache

```bash
php artisan config:cache
php artisan view:cache
```

## API Endpoints

### Currency Endpoints (Public)

#### Get Exchange Rate
```
GET /api/currency/exchange-rate?from=USD&to=EUR
```

Response:
```json
{
  "from": "USD",
  "to": "EUR",
  "rate": 0.92,
  "timestamp": "2025-01-24T12:00:00Z"
}
```

#### Convert Currency
```
POST /api/currency/convert
Content-Type: application/json

{
  "amount": 100,
  "from": "USD",
  "to": "EUR"
}
```

#### Detect User Currency
```
GET /api/currency/detect
```

Response:
```json
{
  "ip_address": "192.168.1.1",
  "detected_currency": "EUR",
  "user_agent": "Mozilla/5.0..."
}
```

#### Get Supported Currencies
```
GET /api/currency/supported
```

#### Get Subscription Prices in User's Currency
```
GET /api/currency/subscription-prices
```

### Currency Endpoints (Authenticated)

#### Get User's Preferred Currency
```
GET /api/currency/user-currency
```

#### Set User's Preferred Currency
```
POST /api/currency/user-currency
Content-Type: application/json

{
  "currency": "EUR",
  "auto_detect": false
}
```

## Usage in Controllers

### Example: Display Price in User's Currency

```php
use App\Services\CurrencyService;

class SubscriptionController extends Controller
{
    public function __construct(private CurrencyService $currencyService)
    {}

    public function show(Request $request)
    {
        $user = $request->user();
        $ipAddress = $request->ip();
        
        // Get price in user's currency
        $priceData = $this->currencyService->getPriceInUserCurrency(
            amountInUSD: 99.99,
            userId: $user->id,
            ipAddress: $ipAddress
        );

        return response()->json([
            'price' => $priceData['converted_amount'],
            'currency' => $priceData['user_currency'],
            'original_usd' => $priceData['original_amount'],
        ]);
    }
}
```

### Example: Track Custom Prompt

```php
use App\Services\RequestTrackingService;

class ChatController extends Controller
{
    public function sendPrompt(Request $request, RequestTrackingService $tracking)
    {
        // ... process chat

        // Track the prompt
        $tracking->trackPrompt(
            ipAddress: $request->ip(),
            prompt: $request->input('message'),
            userId: $request->user()?->id
        );

        // Check if marked as abuse
        $lastPrompt = PromptLog::latest()->first();
        if ($lastPrompt->is_likely_abuse) {
            return response()->json(['error' => 'Request flagged as spam'], 429);
        }

        return response()->json(['success' => true]);
    }
}
```

## Monitoring & Administration

### View Suspicious IPs

```bash
php artisan tinker

# Get high-risk IPs
IpReputation::highRisk()->get();

# Get blocked IPs
IpReputation::blocked()->get();

# Get recent alerts
SuspiciousActivityAlert::unresolved()->recent()->get();
```

### Block an IP Manually

```php
use App\Models\IpReputation;

// Temporary block (60 minutes)
$ip = IpReputation::where('ip_address', '192.168.1.1')->first();
$ip->blockTemporarily(60);

// Permanent block
$ip->blockPermanently();

// Unblock
$ip->unblock();
```

### Refresh Currency Rates

```bash
php artisan currency:refresh
```

Or force refresh:
```bash
php artisan currency:refresh --force
```

## Database Queries

### Most Active IPs (Last 24 Hours)
```php
RequestLog::where('created_at', '>', now()->subDay())
    ->groupBy('ip_address')
    ->selectRaw('ip_address, COUNT(*) as count')
    ->orderByDesc('count')
    ->limit(10)
    ->get();
```

### Detected Bots
```php
RequestLog::where('is_suspected_bot', true)
    ->where('created_at', '>', now()->subDay())
    ->get();
```

### Bot Score Distribution
```php
RequestLog::selectRaw('ROUND(bot_score, 0) as score, COUNT(*) as count')
    ->groupBy('score')
    ->orderBy('score')
    ->get();
```

### Abusive Prompts
```php
PromptLog::where('is_likely_abuse', true)
    ->with('user')
    ->orderByDesc('created_at')
    ->limit(20)
    ->get();
```

### Currency Conversion Trends
```php
RequestLog::selectRaw('detected_currency, COUNT(*) as count')
    ->whereNotNull('detected_currency')
    ->groupBy('detected_currency')
    ->orderByDesc('count')
    ->get();
```

## Configuration Options

### Custom Bot Detection Threshold

Edit `app/Services/RequestTrackingService.php`:

```php
private const BOT_SCORE_THRESHOLD = 70; // Blocks bots above this score
private const BOT_RATE_LIMIT = 100; // Requests per minute
```

### Custom Rate Limiting

Edit `app/Services/RequestTrackingService.php`:

```php
private const RATE_LIMITS = [
    'requests_per_minute' => 60,
    'requests_per_hour' => 1000,
    'prompts_per_minute' => 5,
    'prompts_per_hour' => 100,
];
```

## Troubleshooting

### API Key Not Configured
**Error**: `Open Exchange Rates API key not configured`
**Solution**: Add `OPENEXCHANGERATES_API_KEY` to `.env`

### Migration Not Found
**Error**: `No such table: currency_rates`
**Solution**: Run `php artisan migrate`

### Middleware Not Tracking
**Error**: No data in `request_logs` table
**Solution**: Verify middleware is registered in `app/Http/Kernel.php`

### Bot Detection Too Aggressive
**Issue**: Legitimate users blocked as bots
**Solution**: Increase `BOT_SCORE_THRESHOLD` in RequestTrackingService

### Currency Conversion Fails
**Issue**: "Unsupported currency" errors
**Solution**: Verify currency code format (3 uppercase letters) and check `getSupportedCurrencies()` list

## Performance Optimization

### Enable Query Caching
```php
// In CurrencyService
Cache::remember("rate_{$from}_{$to}", now()->addHour(), function () {
    return $this->fetchRateFromAPI($from, $to);
});
```

### Index Database Tables
Already included in migration, key indexes:
- `currency_rates(base_currency, target_currency)` - Exchange rate lookup
- `request_logs(ip_address, created_at)` - IP analysis
- `request_logs(is_suspected_bot, bot_score)` - Bot filtering
- `prompt_logs(prompt_hash)` - Duplicate detection
- `ip_reputation(blocked_until)` - Block expiration

### Prune Old Logs
```bash
php artisan model:prune --model=RequestLog
php artisan model:prune --model=PromptLog
```

## Security Notes

1. **API Key Security**: Keep `OPENEXCHANGERATES_API_KEY` private, never commit to version control
2. **Sensitive Data**: Passwords, tokens, and card details are automatically sanitized from logs
3. **IP Blocking**: Use permanent blocks sparingly; prefer temporary blocks with investigation
4. **Rate Limiting**: Adjust thresholds based on your expected user behavior
5. **GDPR Compliance**: Request logs are soft-deleted for audit trails; consider retention policies

## Support & Maintenance

- Monitor `ip_reputation` table for high-risk IPs
- Review `suspicious_activity_alerts` daily
- Check `request_logs` for unusual patterns
- Validate `prompt_logs.is_likely_abuse` for false positives
- Refresh currency rates at least daily

## Next Steps

1. Set `OPENEXCHANGERATES_API_KEY` in production
2. Run database migrations
3. Test currency conversion endpoints
4. Monitor request logs for accuracy
5. Fine-tune bot detection thresholds based on your traffic patterns
