# Quick Reference: Currency Tracking & Request Monitoring

## 🚀 Quick Start (5 Minutes)

### 1. Setup
```bash
# 1. Add API key to .env
echo "OPENEXCHANGERATES_API_KEY=your_key" >> .env

# 2. Run migrations
php artisan migrate

# 3. Clear cache
php artisan config:cache
```

### 2. Test Currency Conversion
```bash
# Get exchange rate
curl "http://localhost:8000/api/currency/exchange-rate?from=USD&to=EUR"

# Convert price
curl -X POST http://localhost:8000/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}'

# Detect user's currency
curl http://localhost:8000/api/currency/detect
```

## 📊 Database Tables at a Glance

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `currency_rates` | Exchange rate cache | base_currency, target_currency, rate, expires_at |
| `request_logs` | Request tracking | ip_address, method, path, bot_score, is_suspected_bot |
| `prompt_logs` | Prompt analytics | prompt_hash, ip_address, is_likely_abuse, abuse_reason |
| `ip_reputation` | IP scoring | ip_address, reputation_score, is_blocked |
| `user_currency_preferences` | User settings | user_id, preferred_currency, auto_detect |
| `suspicious_activity_alerts` | Security alerts | ip_address, alert_type, severity |

## 🔧 Common Tasks

### Get User's Preferred Currency
```php
use App\Services\CurrencyService;

$service = app(CurrencyService::class);
$currency = $service->getUserCurrency($userId, $ipAddress);
```

### Convert Price
```php
$converted = $service->convertPrice(99.99, 'USD', 'EUR');
```

### Format Price
```php
$formatted = $service->formatPrice(99.99, 'EUR'); // €99,99
```

### Track Request Manually
```php
use App\Services\RequestTrackingService;

$tracking = app(RequestTrackingService::class);
$tracking->trackRequest(
    ipAddress: request()->ip(),
    method: request()->method(),
    path: request()->path(),
    userAgent: request()->userAgent(),
    userId: auth()->id(),
);
```

### Track Prompt for Abuse Detection
```php
$tracking->trackPrompt(
    ipAddress: request()->ip(),
    prompt: $userMessage,
    userId: auth()->id()
);
```

### Check IP Reputation
```php
use App\Models\IpReputation;

$ip = IpReputation::where('ip_address', '192.168.1.1')->first();
if ($ip && $ip->isCurrentlyBlocked()) {
    return response()->json(['error' => 'Access denied'], 403);
}
```

## 🛡️ Bot Detection

### View Bot Activity
```bash
php artisan report:bots --days=7
```

### Manual IP Blocking
```bash
# Temporary block (1 hour)
php artisan ip:block 192.168.1.1

# Temporary block (24 hours)
php artisan ip:block 192.168.1.1 --hours=24

# Permanent block
php artisan ip:block 192.168.1.1 --permanent

# Unblock
php artisan ip:unblock 192.168.1.1
```

### Query Bot Requests
```php
use App\Models\RequestLog;

// All suspected bots
RequestLog::bot()->get();

// High bot score
RequestLog::highBotScore(70)->get();

// By IP
RequestLog::byIp('192.168.1.1')->get();

// Last hour
RequestLog::lastHour()->get();
```

## 📱 React Components

### Currency Selector
```tsx
import CurrencySelector from '@/components/CurrencySelector';

export default function App() {
  return (
    <CurrencySelector 
      onCurrencyChange={(currency) => console.log(currency)}
      showAutoDetect={true}
    />
  );
}
```

### Price Display
```tsx
import PriceDisplay from '@/components/PriceDisplay';

export default function Product() {
  return (
    <PriceDisplay 
      amountInUSD={99.99}
      userCurrency={userCurrency}
      className="text-2xl font-bold"
    />
  );
}
```

### Subscription Pricing
```tsx
import SubscriptionPricing from '@/components/SubscriptionPricing';

export default function Pricing() {
  return <SubscriptionPricing />;
}
```

## 📊 Analytics Queries

### Active Countries
```php
RequestLog::where('created_at', '>', now()->subDay())
    ->selectRaw('user_country, COUNT(*) as count')
    ->groupBy('user_country')
    ->orderByDesc('count')
    ->get();
```

### Currency Distribution
```php
RequestLog::selectRaw('detected_currency, COUNT(*) as count')
    ->whereNotNull('detected_currency')
    ->groupBy('detected_currency')
    ->orderByDesc('count')
    ->get();
```

### Suspicious Prompts
```php
PromptLog::where('is_likely_abuse', true)
    ->where('created_at', '>', now()->subDay())
    ->with('user')
    ->orderByDesc('created_at')
    ->get();
```

### Abuse Report
```bash
php artisan report:abuse --days=7
```

## ⚙️ Configuration

### Adjust Bot Detection Sensitivity
Edit `app/Services/RequestTrackingService.php`:
```php
private const BOT_SCORE_THRESHOLD = 70; // Increase = more tolerant
private const BOT_RATE_LIMIT = 100;    // Requests per minute
```

### Adjust Rate Limiting
Edit `app/Services/RequestTrackingService.php`:
```php
private const RATE_LIMITS = [
    'requests_per_minute' => 60,
    'requests_per_hour' => 1000,
    'prompts_per_minute' => 5,
    'prompts_per_hour' => 100,
];
```

### API Configuration
`.env`:
```env
OPENEXCHANGERATES_API_KEY=your_api_key
DEFAULT_CURRENCY=USD
CURRENCY_CACHE_HOURS=1
```

## 🔍 Debugging

### Check Middleware is Running
```bash
# Should see request logs
php artisan tinker
>>> RequestLog::count()
```

### Test API Key
```bash
php artisan tinker
>>> app(App\Services\CurrencyService::class)->getExchangeRate('USD', 'EUR')
```

### View Recent Requests
```php
RequestLog::latest()->limit(20)->get();
```

### Check Bot Scores
```php
RequestLog::selectRaw('AVG(bot_score) as avg, MAX(bot_score) as max')
    ->where('created_at', '>', now()->subDay())
    ->first();
```

## 🚨 Alerts

### High Bot Activity
```php
// If >50% of requests are bots in last hour
$botCount = RequestLog::bot()->lastHour()->count();
$totalCount = RequestLog::lastHour()->count();

if ($botCount / $totalCount > 0.5) {
    Log::warning('High bot activity detected');
}
```

### Suspicious Prompt Patterns
```php
// If >10% abuse rate in last hour
$abuseCount = PromptLog::where('is_likely_abuse', true)
    ->where('timestamp', '>', now()->subHour())
    ->count();
$totalCount = PromptLog::where('timestamp', '>', now()->subHour())->count();

if ($abuseCount / $totalCount > 0.1) {
    Log::alert('High abuse rate detected');
}
```

## 📚 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|------------|
| `/api/currency/exchange-rate` | GET | No | Get exchange rate |
| `/api/currency/convert` | POST | No | Convert amount |
| `/api/currency/detect` | GET | No | Detect user's currency |
| `/api/currency/supported` | GET | No | List supported currencies |
| `/api/currency/user-currency` | GET | Yes | Get user preference |
| `/api/currency/user-currency` | POST | Yes | Set user preference |
| `/api/currency/subscription-prices` | GET | No | Get pricing in user's currency |

## 🎯 Best Practices

1. **Always use CurrencyService** - Don't hardcode exchange rates
2. **Cache aggressively** - Exchange rates change slowly
3. **Monitor bot scores** - Review high scores, not just blocked IPs
4. **Whitelist known bots** - Some bot traffic is legitimate (indexing)
5. **Review abuse alerts** - May catch false positives
6. **Rotate API keys** - Regularly update Open Exchange Rates key
7. **Log user preferences** - For analytics and recommendations

## 📞 Support

For issues or questions:
1. Check `CURRENCY_TRACKING_SETUP.md` for detailed documentation
2. Review Artisan command help: `php artisan command:name --help`
3. Check logs: `storage/logs/laravel.log`
4. Database audit: `request_logs`, `suspicious_activity_alerts` tables
