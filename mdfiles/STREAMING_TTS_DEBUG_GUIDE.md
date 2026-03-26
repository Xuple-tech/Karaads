# Streaming TTS Debug Guide

## Issue: Getting "chunks: 0" Instead of Audio Chunks

### Root Cause Analysis

The `chunks: 0` response means no audio was generated. This typically happens when:

1. **Text chunks are too short** (< 50 characters minimum)
2. **Text doesn't contain sentence delimiters** (.!?)
3. **Google TTS service is failing silently**
4. **Buffer is being reset before audio generation**

### Recent Fixes Applied

#### 1. **Lowered Minimum Chunk Length**
   - **Before**: 50 characters minimum
   - **After**: 10 characters minimum
   - **Why**: Short responses were completely skipped
   - **File**: `app/Services/StreamingTextToSpeechService.php` (line 18)

#### 2. **Improved Text Buffering**
   - **Before**: Each sentence sent individually
   - **After**: Sentences accumulated into 100+ char buffers
   - **Why**: Allows more efficient TTS generation
   - **File**: `app/Http/Controllers/VoiceConversationController.php` (lines 325-392)

#### 3. **Added Comprehensive Logging**
   - Starting TTS stream info
   - Sentence splitting details
   - Buffer processing status
   - Audio generation results
   - Failures and warnings
   - **File**: `app/Http/Controllers/VoiceConversationController.php`

### How to Debug

#### Step 1: Check the Logs
```bash
# Watch real-time logs
tail -f storage/logs/laravel.log

# Or check the latest log
cat storage/logs/laravel.log | tail -100
```

#### Step 2: Look for These Log Patterns
```
[INFO] Starting TTS streaming
  └─ Should show: text_length, language, voice, text_preview

[DEBUG] Text split into sentences
  └─ Should show: sentence_count and list of sentences

[DEBUG] Processing TTS buffer
  └─ Should show: buffer_length >= threshold before processing

[INFO] TTS audio chunk generated
  └─ This is the SUCCESS message you want to see!
  └─ Should show: chunk_index and audio_size in bytes

[DEBUG] No audio data returned from processChunk
  └─ This means buffer exists but generateAudio returned null
  └─ Usually due to buffer too short or missing delimiters
```

### Testing Steps

#### Test 1: Simple Response
Send this text via the voice chat:
```
"Hello. This is a test. It should work."
```

**Expected behavior**:
- Text should split into 3 sentences
- Each ~20 chars, buffered into groups
- At least 1-2 audio chunks should be generated

**Check logs for**:
```
sentence_count: 3
sentences: ["Hello.", "This is a test.", "It should work."]
Processing TTS buffer (multiple times)
TTS audio chunk generated (at least once)
```

#### Test 2: Long Response
Send a longer text (100+ characters):
```
"This is a longer response to test the streaming TTS system. It should generate multiple audio chunks as the text is being processed. The system should buffer sentences and convert them to audio efficiently."
```

**Expected behavior**:
- Should generate 2-3 audio chunks
- Chunks arrive within seconds

#### Test 3: Response Without Punctuation
Send:
```
"Hello world"
```

**Expected behavior**:
- No sentence delimiter, so it goes to finalize()
- Should still generate audio (via finalize())
- Check that MIN_CHUNK_LENGTH is being respected

### Common Issues and Solutions

#### Issue: Still Getting "chunks: 0"
```
[DEBUG] No audio data returned from processChunk
```

**Solutions**:
1. Check if Google TTS service is working:
   ```bash
   php artisan tinker
   >>> $service = app(\App\Services\GoogleTextToSpeechService::class);
   >>> $result = $service->synthesize("Hello world", "en");
   >>> dd($result);
   ```

2. Check text has proper sentences:
   - Must contain `.`, `!`, or `?`
   - Each sentence must be at least 10 characters

3. Check Google credentials are valid:
   - See `config/tts.php`
   - See `services.google.tts_api_key` in `.env`

#### Issue: Slow Audio Generation
**Symptoms**: Large delay before first audio chunk

**Solutions**:
1. Google TTS is slow on first call (API initialization)
2. Increase `bufferThreshold` (currently 100 chars) for better batching
3. Monitor network latency to Google API

#### Issue: Partial Audio or Cuts Off Mid-Word
**Symptoms**: Audio plays but seems incomplete

**Solutions**:
1. Sentence splitting might be too aggressive
2. Buffer threshold too small
3. Google TTS has issue with specific text

**Debug**:
```
Check logs for:
buffer_preview: (shows what was sent to TTS)
sentence_index: (which sentence is being processed)
```

### Tweaking Parameters

#### File: `app/Services/StreamingTextToSpeechService.php`

```php
// Line 18: Minimum characters before TTS generation
private const MIN_CHUNK_LENGTH = 10;  // Can lower to 5 for faster response

// Line 19: Maximum buffer before forcing generation
private const MAX_BUFFER_LENGTH = 500;  // Can lower to 200 for more chunks
```

#### File: `app/Http/Controllers/VoiceConversationController.php`

```php
// Line 326: How many characters to buffer before sending to TTS
$bufferThreshold = 100;  // Lower = more chunks (slower), Higher = fewer chunks (faster first chunk)
```

### Expected Performance

With the fixes applied:

| Text Length | Expected Chunks | Time to First Chunk |
|-------------|-----------------|-------------------|
| 30 chars    | 1               | 3-5 seconds       |
| 100 chars   | 1-2             | 2-4 seconds       |
| 500 chars   | 2-5             | 2-3 seconds       |
| 1000+ chars | 5+              | 2-3 seconds       |

### Next Steps

1. **Send a test message** in voice chat
2. **Check the logs** using the patterns above
3. **Share the log output** if issues persist
4. **Adjust thresholds** based on performance needs

### Logging Configuration

To increase verbosity temporarily:

Edit `.env`:
```
LOG_LEVEL=debug
```

This will capture all DEBUG logs including:
- Buffer processing details
- Text splitting results
- Service method calls
- Performance metrics

Remember to change back to `LOG_LEVEL=production` after debugging.