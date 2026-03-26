# Voice Backend - Error Logging Setup

## Quick Setup (5 minutes)

### Step 1: Add Log Channel

Edit `config/logging.php` and add this channel in the `channels` array:

```php
'voice' => [
    'driver' => 'single',
    'path' => storage_path('logs/voice-errors.log'),
    'level' => env('LOG_LEVEL', 'debug'),
],
```

### Step 2: Create Controller Method

Add this to your `VoiceController` (or create it if missing):

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoiceController extends Controller
{
    /**
     * Log frontend errors to backend
     */
    public function logError(Request $request)
    {
        Log::channel('voice')->error('Frontend Error', [
            'level' => $request->input('level', 'error'),
            'message' => $request->input('message'),
            'session_id' => $request->input('session_id'),
            'timestamp' => $request->input('timestamp'),
            'context' => $request->input('context', []),
            'user_agent' => $request->input('user_agent'),
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
        ]);

        return response()->json(['success' => true]);
    }
}
```

### Step 3: Add Route

Add this to `routes/api.php`:

```php
Route::post('/voice/log', [VoiceController::class, 'logError']);
```

### Step 4: Test

1. Open the voice conversation page
2. Try to record (should work normally)
3. Check logs: `tail -f storage/logs/voice-errors.log`
4. Trigger an error (deny microphone permission and try to record)
5. Should see error logged

---

## Complete Implementation

### Full VoiceController

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\VoiceConversation;

class VoiceController extends Controller
{
    /**
     * Log frontend errors to backend for monitoring
     */
    public function logError(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'level' => 'string|in:error,warn,info',
            'message' => 'required|string|max:500',
            'session_id' => 'string',
            'timestamp' => 'string',
            'context' => 'array',
            'user_agent' => 'string',
        ]);

        // Log with all context
        Log::channel('voice')->error('Frontend Error', [
            'level' => $validated['level'] ?? 'error',
            'message' => $validated['message'],
            'session_id' => $validated['session_id'] ?? 'unknown',
            'timestamp' => $validated['timestamp'] ?? now(),
            'context' => $validated['context'] ?? [],
            'user_agent' => $validated['user_agent'] ?? request()->userAgent(),
            'user_id' => auth()->id() ?? 'guest',
            'ip' => request()->ip(),
            'url' => request()->url(),
        ]);

        // Return success
        return response()->json(['success' => true], 200);
    }

    /**
     * Start voice conversation
     */
    public function start(Request $request)
    {
        try {
            // Your existing start logic
            $voiceConversation = VoiceConversation::create([
                'conversation_id' => $request->input('conversation_id'),
                'language' => $request->input('language'),
                'voice_settings' => $request->input('voice_settings'),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'voice_conversation_id' => $voiceConversation->id,
                ]
            ]);
        } catch (\Exception $e) {
            Log::channel('voice')->error('Failed to start conversation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to start conversation'
            ], 500);
        }
    }

    /**
     * Process audio and generate response
     */
    public function processAudio(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'audio' => 'required|file|mimes:webm,mp3,wav',
                'conversation_id' => 'required|exists:conversations,id',
                'duration' => 'integer|min:0',
            ]);

            // Process audio (your logic here)
            // For now, just log it
            Log::channel('voice')->info('Processing audio', [
                'file_size' => $request->file('audio')->getSize(),
                'duration' => $request->input('duration'),
                'conversation_id' => $request->input('conversation_id'),
            ]);

            // Your existing audio processing logic
            // ...

            return response()->json([
                'success' => true,
                'data' => [
                    'user_message' => [...],
                    'ai_response' => [...],
                ]
            ]);
        } catch (\Exception $e) {
            Log::channel('voice')->error('Audio processing failed', [
                'error' => $e->getMessage(),
                'conversation_id' => $request->input('conversation_id'),
                'file_size' => $request->file('audio')?->getSize(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process audio'
            ], 500);
        }
    }

    /**
     * End voice conversation
     */
    public function end(Request $request)
    {
        try {
            $voiceConversation = VoiceConversation::find(
                $request->input('voice_conversation_id')
            );

            if (!$voiceConversation) {
                throw new \Exception('Conversation not found');
            }

            // Calculate total duration
            $totalDuration = $voiceConversation->messages->sum('duration');

            // Your cleanup logic here
            // ...

            Log::channel('voice')->info('Conversation ended', [
                'conversation_id' => $voiceConversation->conversation_id,
                'total_duration' => $totalDuration,
                'message_count' => $voiceConversation->messages->count(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_duration' => $totalDuration,
                ]
            ]);
        } catch (\Exception $e) {
            Log::channel('voice')->error('Failed to end conversation', [
                'error' => $e->getMessage(),
                'voice_conversation_id' => $request->input('voice_conversation_id'),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to end conversation'
            ], 500);
        }
    }
}
```

### Full Routes Setup

```php
// routes/api.php

Route::middleware(['api'])->group(function () {
    // Voice conversation endpoints
    Route::post('/voice/log', [VoiceController::class, 'logError']);
    Route::post('/voice/start', [VoiceController::class, 'start']);
    Route::post('/voice/process-audio', [VoiceController::class, 'processAudio']);
    Route::post('/voice/end', [VoiceController::class, 'end']);
    Route::get('/voice/audio/{messageId}', [VoiceController::class, 'getAudio']);
});
```

---

## Monitoring & Debugging

### View Recent Errors

```bash
# Last 50 errors
tail -50 storage/logs/voice-errors.log

# Watch in real-time
tail -f storage/logs/voice-errors.log

# Search for specific session
grep "vc_1705123456789_abc123" storage/logs/voice-errors.log
```

### Filter by Error Type

```bash
# Count microphone permission errors
grep "NotAllowedError" storage/logs/voice-errors.log | wc -l

# Find all recording start failures
grep "Recording start failed" storage/logs/voice-errors.log

# Find all network errors
grep "HTTP" storage/logs/voice-errors.log
```

### Analyze Log Format

Each log entry will look like:

```json
[2024-01-05 10:30:45] local.ERROR: Frontend Error {"level":"error","message":"Recording start failed: NotAllowedError","session_id":"vc_1705123456789_abc123","timestamp":"2024-01-05T10:30:45.123Z","context":{},"user_agent":"Mozilla/5.0...","user_id":42,"ip":"192.168.1.100","url":"http://localhost/voice"}
```

---

## Advanced: Error Analytics

### Dashboard Query

Create a command to analyze errors:

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AnalyzeVoiceErrors extends Command
{
    protected $signature = 'voice:analyze-errors {--days=7}';
    protected $description = 'Analyze voice conversation errors';

    public function handle()
    {
        $days = $this->option('days');
        $logFile = storage_path('logs/voice-errors.log');

        if (!file_exists($logFile)) {
            $this->error('No voice error logs found');
            return;
        }

        $lines = file($logFile);
        $errors = [];

        foreach ($lines as $line) {
            if (strpos($line, 'ERROR') !== false) {
                preg_match('/("message":"([^"]+)")|message":"([^"]+)"/', $line, $matches);
                $message = $matches[2] ?? $matches[3] ?? 'Unknown';
                $errors[$message] = ($errors[$message] ?? 0) + 1;
            }
        }

        arsort($errors);

        $this->info("\n=== Voice Error Analysis (last {$days} days) ===\n");
        $this->table(['Error Message', 'Count'], 
            collect($errors)->map(fn ($count, $msg) => [$msg, $count])->values()->toArray()
        );

        // Alert on high error rates
        $totalErrors = array_sum($errors);
        if ($totalErrors > 100) {
            $this->warn("\n⚠️  High error rate: {$totalErrors} errors");
        }
    }
}
```

Run it with:
```bash
php artisan voice:analyze-errors --days=7
```

---

## Testing

### Test 1: Verify Endpoint Exists

```bash
curl -X POST http://localhost/api/voice/log \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: your-csrf-token" \
  -d '{
    "level": "error",
    "message": "Test error",
    "session_id": "test_123",
    "timestamp": "2024-01-05T10:30:45Z",
    "context": {"test": true},
    "user_agent": "curl"
  }'
```

Should return:
```json
{"success": true}
```

### Test 2: Check Log File

```bash
tail -1 storage/logs/voice-errors.log
```

Should show your test error.

### Test 3: Frontend Integration

1. Open browser DevTools → Network tab
2. Filter by "voice/log"
3. Record audio and trigger an error
4. Should see POST to `/api/voice/log`
5. Check response is `{"success": true}`

---

## Production Considerations

### 1. Log Rotation

```php
// config/logging.php
'voice' => [
    'driver' => 'daily',  // Change from 'single' to 'daily'
    'path' => storage_path('logs/voice-errors.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => 30,  // Keep 30 days of logs
],
```

### 2. Performance

Logging is asynchronous on frontend (silent fail), so no performance impact.

For backend, if logging is slow:
```php
// Queue the logging
Queue::push(function () use ($logData) {
    Log::channel('voice')->error('Frontend Error', $logData);
});
```

### 3. Security

- All errors logged with user ID (if authenticated)
- IP address recorded for security analysis
- Session ID provided for correlation
- User agent logged for browser compatibility analysis
- Sanitize any user input before logging

### 4. Compliance

- GDPR: Consider log retention policy (30 days recommended)
- PII: Don't log sensitive user data in context
- Storage: Keep logs in `storage/` (private directory)

---

## Troubleshooting

### Logs Not Appearing

**Issue:** Frontend errors not showing in backend logs

**Causes:**
1. `/api/voice/log` endpoint doesn't exist
2. CSRF token not sent or incorrect
3. Log channel not configured

**Solution:**
```bash
# 1. Check route exists
php artisan route:list | grep voice/log

# 2. Check config
php artisan tinker
>>> config('logging.channels.voice')

# 3. Verify permissions
ls -la storage/logs/
# Should be writable by web server

# 4. Test endpoint manually
curl -X POST http://localhost/api/voice/log -H "Content-Type: application/json" -d '{"message":"test"}'
```

### Too Many Logs

**Issue:** Log file is very large

**Solution:**
1. Enable daily rotation (see Production Considerations)
2. Add filtering in controller:
```php
public function logError(Request $request)
{
    // Only log if important
    if (!$this->isImportantError($request->input('message'))) {
        return response()->json(['success' => true]);
    }
    
    Log::channel('voice')->error(...);
}
```

### Logs Take Too Much Storage

**Issue:** Voice logs consuming too much disk space

**Solution:**
```bash
# Check size
du -sh storage/logs/voice-errors.log

# Rotate older logs
gzip storage/logs/voice-errors.log*
tar -czf voice-logs-archive.tar.gz storage/logs/voice-errors.log*
rm storage/logs/voice-errors.log*
```

---

## Summary

### What You Get

✅ All frontend errors logged to backend
✅ Session-based error tracking
✅ User context (ID, IP, browser)
✅ Real-time monitoring capability
✅ Error analytics and patterns
✅ Easy debugging with session IDs

### Files to Create/Update

1. ✅ `config/logging.php` - Add voice channel
2. ✅ `app/Http/Controllers/VoiceController.php` - Add logError method
3. ✅ `routes/api.php` - Add POST /voice/log route

### Time to Setup

⏱️ **5 minutes** for basic setup
⏱️ **15 minutes** for production-ready setup

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** ✅ Ready to Implement
