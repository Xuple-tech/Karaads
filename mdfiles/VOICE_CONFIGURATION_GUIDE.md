# Voice Conversation System - Configuration Guide

Advanced configuration options for the Python TTS/STT integration.

## Environment Variables

Add these to your `.env` file for custom configuration:

```env
# ============================================
# VOICE SYSTEM CONFIGURATION
# ============================================

# TTS Service
TTS_SERVICE=python          # 'python', 'elevenlabs', or 'fallback'
TTS_DEFAULT_VOICE=aria      # Default voice for new conversations
TTS_TIMEOUT=60              # Timeout in seconds for TTS processing
TTS_LANGUAGE=en             # Default language

# STT Service  
STT_SERVICE=vosk            # 'vosk', 'elevenlabs', or 'fallback'
STT_LANGUAGE=en             # Default language for transcription
STT_TIMEOUT=300             # Timeout in seconds (5 minutes)
STT_CONFIDENCE=0.5          # Minimum confidence threshold

# Audio Storage
AUDIO_STORAGE_PATH=storage/conversations
AUDIO_MAX_SIZE=10485760     # 10MB in bytes
AUDIO_FORMAT=webm           # webm, mp3, wav

# Model Configuration
VOSK_MODELS_PATH=~/.vosk    # Path to Vosk models directory
PYTHON_PATH=python          # Python executable path (full path if not in PATH)

# Streaming Configuration
ENABLE_AUDIO_STREAMING=true
STREAM_CHUNK_SIZE=4096      # Chunk size in bytes
STREAM_TIMEOUT=300          # Stream timeout in seconds

# Cache Settings
TTS_CACHE_DURATION=3600     # Cache TTS results for 1 hour
STT_CACHE_DURATION=86400    # Cache STT results for 24 hours

# Logging
VOICE_LOG_LEVEL=info        # debug, info, warning, error
VOICE_DEBUG_MODE=false      # Enable detailed logging
```

## Service Configuration

### 1. TTS Service Configuration

In `app/Services/TextToSpeechService.php`, customize:

```php
// Available voices by language
private array $voicesByLanguage = [
    'en' => ['aria', 'jenny', 'davis', 'tony', 'sara'],
    'es' => ['spanish'],
    'fr' => ['french'],
    'de' => ['german'],
    'it' => ['italian'],
    'ja' => ['japanese'],
    'ko' => ['korean'],
    'zh' => ['chinese']
];

// Voice quality presets
private array $qualityPresets = [
    'low' => ['bitrate' => '24k'],      // ~180KB per minute
    'medium' => ['bitrate' => '64k'],   // ~480KB per minute (default)
    'high' => ['bitrate' => '128k']     // ~960KB per minute
];

// Speech rate presets
private array $ratePresets = [
    'slow' => '-50%',
    'normal' => '+0%',
    'fast' => '+50%'
];
```

### 2. STT Service Configuration

In `app/Services/SpeechToTextService.php`:

```php
// Supported languages and models
private array $supportedModels = [
    'en' => 'vosk-model-small-en-us-0.15',
    'es' => 'vosk-model-small-es-0.42',
    'fr' => 'vosk-model-small-fr-0.22',
    'de' => 'vosk-model-small-de-0.15',
    'ru' => 'vosk-model-small-ru-0.22',
    'zh' => 'vosk-model-small-zh-cn-0.22'
];

// Confidence thresholds
private array $confidenceThresholds = [
    'en' => 0.7,
    'es' => 0.6,
    'fr' => 0.6,
    'de' => 0.65,
    'ru' => 0.6,
    'zh' => 0.5  // Lower confidence for Chinese
];
```

### 3. Voice Conversation Service

In `app/Services/VoiceConversationService.php`:

```php
// Default voice settings for new conversations
private array $defaultVoiceSettings = [
    'voice' => 'aria',
    'speed' => 1.0,
    'pitch' => 0.0,
    'volume' => 1.0,
    'language' => 'en'
];

// Audio parameters
private array $audioConfig = [
    'sample_rate' => 16000,      // 16kHz
    'channels' => 1,              // Mono
    'bit_depth' => 16,            // 16-bit
    'format' => 'webm'
];
```

## Advanced Configuration Examples

### 1. Multi-Language Setup

```php
// In your controller
$conversation->update([
    'language' => 'es',  // Spanish
    'voice_settings' => [
        'voice' => 'spanish',
        'speed' => 0.9,  // Slightly slower for clarity
    ]
]);
```

### 2. Voice Customization

```php
// Apply voice settings to user preferences
$voiceSettings = $user->voice_preferences ?? [
    'voice' => 'aria',
    'rate' => '+10%',    // Slightly faster speech
    'pitch' => '+5Hz'    // Slightly higher pitch
];

$audioContent = $ttsService->synthesize($text, $voiceSettings);
```

### 3. Audio Preprocessing

```php
// Before STT processing, normalize audio
private function normalizeAudio($audioPath)
{
    // Use ffmpeg to normalize
    $command = "ffmpeg -i {$audioPath} -filter:a loudnorm {$audioPath}.normalized.wav";
    exec($command);
    
    return "{$audioPath}.normalized.wav";
}
```

### 4. Cache Configuration

```php
// Cache TTS results for repeated text
$cacheKey = "tts:" . md5($text . $voice);
$cached = Cache::get($cacheKey);

if ($cached) {
    return $cached;
}

$audio = $ttsService->synthesize($text, ['voice' => $voice]);
Cache::put($cacheKey, $audio, now()->addHours(1));

return $audio;
```

### 5. Fallback Chains

```php
// Implement smart fallback logic
private function synthesizeWithFallbacks($text, $options)
{
    try {
        // Try primary: Python Edge TTS
        return $this->synthesizeWithPython($text, $options);
    } catch (Exception $e) {
        Log::warning('Python TTS failed, trying Eleven Labs');
        
        try {
            // Try secondary: Eleven Labs API
            return $this->synthesizeWithElevenLabs($text, $options);
        } catch (Exception $e2) {
            Log::error('TTS services exhausted, using fallback');
            
            // Use fallback: Silent MP3
            return $this->synthesizeWithFallback($text);
        }
    }
}
```

## Performance Tuning

### 1. Optimize TTS Performance

```php
// Batch processing for efficiency
private function synthesizeBatch(array $texts, $voice)
{
    $results = [];
    
    foreach ($texts as $text) {
        // Reuse same process for multiple texts
        $results[] = $this->synthesizeWithPython($text, ['voice' => $voice]);
    }
    
    return $results;
}
```

### 2. Optimize STT Performance

```php
// Pre-process audio for better accuracy
private function preprocessAudio($audioPath)
{
    // Convert to WAV 16kHz mono (optimal for Vosk)
    $command = "ffmpeg -i {$audioPath} -ar 16000 -ac 1 {$audioPath}.wav";
    exec($command);
    
    return "{$audioPath}.wav";
}
```

### 3. Database Optimization

```php
// Index frequently queried columns
Schema::table('chats', function (Blueprint $table) {
    $table->index(['conversation_id', 'created_at']);
    $table->index(['role', 'type']);
});

// Soft delete old audio files
Schema::table('chats', function (Blueprint $table) {
    $table->softDeletes();
});
```

## Database Schema Extensions

If you need additional fields for voice configuration:

```php
// Create migration
php artisan make:migration add_voice_settings_to_conversations

// In migration file
Schema::table('conversations', function (Blueprint $table) {
    $table->string('language')->default('en');
    $table->json('voice_settings')->nullable();
    $table->json('audio_config')->nullable();
    $table->boolean('voice_enabled')->default(true);
    $table->timestamp('voice_last_used')->nullable();
});
```

## Storage Configuration

### 1. Configure Storage Paths

```php
// config/filesystems.php
'disks' => [
    'local' => [
        'driver' => 'local',
        'root' => storage_path('app'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'private',
    ],
    
    'voice' => [
        'driver' => 'local',
        'root' => storage_path('app/voice'),
        'url' => env('APP_URL').'/storage/voice',
        'visibility' => 'private',
    ],
];
```

### 2. Automatic Cleanup

```php
// Create scheduled job
php artisan make:job CleanupOldAudioFiles

// In app/Jobs/CleanupOldAudioFiles.php
public function handle()
{
    $days = 30;
    $path = storage_path('app/conversations');
    
    // Delete files older than 30 days
    $this->deleteOldFiles($path, $days);
}

// Schedule in app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->job(new CleanupOldAudioFiles)
        ->daily()
        ->at('02:00');  // Run at 2 AM
}
```

## API Rate Limiting

```php
// Prevent abuse of voice endpoints
Route::middleware('throttle:voice')->prefix('api/voice')->group(function () {
    // 60 requests per minute per user
    // Adjust in config/ratelimit.php
});

// Custom rate limiting
RateLimiter::for('voice', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

## Monitoring & Metrics

### 1. Track Service Usage

```php
// Log metrics
Log::info('Voice Service Metrics', [
    'tts_count' => Cache::increment('tts_count'),
    'stt_count' => Cache::increment('stt_count'),
    'avg_tts_time' => Cache::get('avg_tts_time'),
    'avg_stt_time' => Cache::get('avg_stt_time'),
]);
```

### 2. Monitor Resources

```php
// Track memory and CPU usage
$before = memory_get_usage();
$audio = $ttsService->synthesize($text);
$after = memory_get_usage();

Log::info('Memory Usage', [
    'service' => 'TTS',
    'memory_delta' => $after - $before,
    'audio_size' => strlen($audio)
]);
```

## Error Handling

### 1. Custom Error Messages

```php
// In TextToSpeechService
private array $errorMessages = [
    'VOICE_NOT_FOUND' => 'Selected voice is not available',
    'TEXT_TOO_LONG' => 'Text exceeds maximum length',
    'PYTHON_ERROR' => 'TTS service is temporarily unavailable',
    'MODEL_NOT_FOUND' => 'Language model not installed',
];
```

### 2. Graceful Degradation

```php
public function synthesize(string $text, array $options = []): string
{
    try {
        return $this->synthesizeWithPython($text, $options);
    } catch (ProcessFailedException $e) {
        Log::warning('TTS service degraded');
        
        if ($this->canUseFallback()) {
            return $this->synthesizeWithFallback($text);
        }
        
        throw new VoiceServiceException('Voice service unavailable');
    }
}
```

## Testing Configuration

```php
// In phpunit.xml or .env.testing
<env name="TTS_SERVICE" value="fallback"/>
<env name="STT_SERVICE" value="fallback"/>

// Use mocks in tests
$this->mock(TextToSpeechService::class, function ($mock) {
    $mock->shouldReceive('synthesize')
        ->andReturn(file_get_contents('tests/stubs/sample.mp3'));
});
```

## Deployment Configuration

### 1. Environment-Specific Settings

```env
# .env.production
TTS_SERVICE=python
TTS_TIMEOUT=60
TTS_CACHE_DURATION=3600

STT_SERVICE=vosk
STT_TIMEOUT=300
STT_CONFIDENCE=0.7

AUDIO_MAX_SIZE=10485760
ENABLE_AUDIO_STREAMING=true
```

### 2. Docker Configuration

```dockerfile
# Dockerfile
FROM php:8.2-fpm

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Install Python packages
COPY _services/requirements.txt /tmp/
RUN pip3 install -r /tmp/requirements.txt

# Copy Vosk models
COPY vosk-models /root/.vosk

# Rest of Dockerfile...
```

### 3. Queue Configuration

```php
// config/queue.php
'connections' => [
    'voice' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => 'voice',
        'retry_after' => 300,
    ],
],
```

---

**Last Updated**: 2024
**Configuration Version**: 1.0
