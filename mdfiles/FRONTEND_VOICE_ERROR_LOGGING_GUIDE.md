# Frontend Voice Conversation Error Logging Guide

## Overview

The updated `VoiceConversation.tsx` component includes comprehensive error logging and monitoring capabilities. All logs are structured, timestamped, and can be sent to the backend for persistent storage.

## Logging Architecture

### VoiceLogger Class

A custom logging utility that provides structured logging with:
- **Session ID**: Unique identifier for each user session
- **Timestamps**: Relative timing from session start
- **Multiple Log Levels**: info, error, warn, debug
- **Dual Output**: Browser console + backend server
- **Color-coded Console Output**: Easy visual identification

### Log Structure

```
[session_id] +elapsed_ms LEVEL: message
  additional context data
```

**Example:**
```
[vc_1705123456789_a1b2c3d4] +250ms INFO: Recording started successfully
  { audioTracks: 1 }
```

## Using the Logger

### Accessing the Logger

The logger is automatically initialized in the component:

```typescript
const loggerRef = useRef(new VoiceLogger());
const logger = loggerRef.current;
```

### Log Methods

#### `logger.info(message, data?)`
- **Color**: Blue
- **Use**: Important state changes, successful operations
- **Example**: Voice conversation started, recording stopped

```typescript
logger.info('Voice conversation started successfully', {
    voiceConversationId: data.data.voice_conversation_id
});
```

#### `logger.error(message, error?)`
- **Color**: Red
- **Use**: Errors and failures
- **Example**: Network errors, validation failures, permission denials

```typescript
logger.error('Error starting voice conversation', { 
    error: errorMessage 
});
```

#### `logger.warn(message, data?)`
- **Color**: Orange
- **Use**: Non-critical issues and warnings
- **Example**: Unsupported codecs, missing configurations

```typescript
logger.warn('WebM codec not supported, audio quality may be reduced', { 
    mimeType 
});
```

#### `logger.debug(message, data?)`
- **Color**: Purple (italic)
- **Environment**: Development only
- **Use**: Detailed debugging information
- **Example**: Chunk received, track stopped, timer cleared

```typescript
logger.debug('Audio chunk received', { size: event.data.size });
```

### Server-Side Logging

Send logs to the backend for persistent storage:

```typescript
logger.logToServer('error', 'Failed to start recording', {
    audioConstraints: constraints,
    browserInfo: navigator.userAgent
});
```

**Parameters:**
- `level`: 'info' | 'error' | 'warn'
- `message`: Log message
- `context`: Additional context (optional)

**Endpoint:** `POST /api/voice/log`

**Payload:**
```json
{
    "level": "error",
    "message": "Failed to start recording",
    "session_id": "vc_1705123456789_a1b2c3d4",
    "timestamp": "2024-01-13T10:30:45.123Z",
    "context": {
        "audioConstraints": { "sampleRate": 16000 },
        "browserInfo": "Mozilla/5.0..."
    },
    "user_agent": "Mozilla/5.0..."
}
```

## Voice Settings Integration

### Default Voices

The component now uses the new Python TTS system with these voices:

**English (en):**
- aria (Female) - Default
- jenny (Female)
- davis (Male)
- tony (Male)
- sara (Female)
- sonia (Female)
- ryan (Male)
- libby (Female)
- william (Male)
- natasha (Female)

**Other Languages:**
- Spanish (es): spanish
- French (fr): french
- German (de): german
- Italian (it): italian

### Voice Selection Logging

When users change voices or languages, the changes are logged:

```typescript
logger.info('Language changed', { from: 'en', to: 'es' });
logger.info('Voice changed', { from: 'aria', to: 'jenny' });
logger.debug('Speed changed', { from: 1.0, to: 1.2 });
```

## Error Handling Flow

### Recording Errors

When recording fails, specific error detection provides helpful user messages:

```
NotAllowedError → "Microphone permission denied"
NotFoundError → "No microphone found"
NotReadableError → "Microphone in use by another app"
```

### Audio Processing Errors

Audio processing errors log detailed information:
- HTTP status codes
- Response payloads
- Blob sizes and types
- Audio durations

### API Errors

All API calls are monitored with:
- CSRF token validation
- HTTP response status checking
- JSON parsing verification
- Meaningful error messages

## Browser Console Output

### Viewing Logs

Open browser DevTools (F12) and go to **Console** tab.

### Filtering Logs

By log level:
```javascript
// Show only errors
console.error() // Red
// Show only warnings
console.warn()  // Orange
// Show info
console.log()   // Blue
```

### Session Tracking

All logs from the same session have the same ID:
```
[vc_1705123456789_a1b2c3d4] +0ms INFO: Component mounted
[vc_1705123456789_a1b2c3d4] +250ms INFO: Voice conversation started
[vc_1705123456789_a1b2c3d4] +500ms ERROR: Recording failed
```

## Key Logged Events

### Component Lifecycle
- ✅ Component mounted
- ✅ Component unmounting
- ✅ Cleanup resources

### Voice Conversation
- ✅ Starting conversation
- ✅ Voice conversation started
- ✅ Conversation ended
- ✅ Duration tracking

### Recording
- ✅ Starting audio recording
- ✅ Microphone access granted
- ✅ Recording started
- ✅ Recording stopped
- ✅ Audio chunks received

### Audio Processing
- ✅ Audio blob created
- ✅ Sending to server
- ✅ Response received
- ✅ Messages added
- ✅ Audio playback queued

### Playback
- ✅ Playing audio
- ✅ Audio playback started
- ✅ Audio playback ended

### Settings
- ✅ Language changed
- ✅ Voice changed
- ✅ Speed changed

## Debugging Workflow

### 1. User Reports an Issue

Ask them to open DevTools (F12) and describe what happened.

### 2. Check the Browser Console

Look for:
- Error messages in red
- Warning messages in orange
- Session ID for context

### 3. Find the Session in Server Logs

Use the session ID to find backend logs:
```
grep "session_id: vc_1705123456789_a1b2c3d4" storage/logs/laravel.log
```

### 4. Correlate with API Responses

Check if errors correlate with:
- Failed API calls
- Missing audio data
- Timeout issues

### 5. Check Network Tab

In DevTools **Network** tab, examine:
- API request/response headers
- CSRF token presence
- Audio blob sizes
- Response times

## Common Issues & Solutions

### Issue: "Microphone permission denied"

**Log Pattern:**
```
ERROR: Error starting recording
  error: "NotAllowedError: Permission denied"
ERROR: Failed to start recording: Microphone permission denied
```

**Solution:**
1. Check browser microphone permissions
2. Go to Settings → Privacy → Microphone
3. Allow the application
4. Reload and try again

### Issue: "WebM codec not supported"

**Log Pattern:**
```
WARN: WebM codec not supported, audio quality may be reduced
  { mimeType: "audio/webm;codecs=opus" }
```

**Solution:**
- Browser will fallback to available codec
- Audio quality may be reduced
- Consider updating browser

### Issue: Audio processing takes too long

**Log Pattern:**
```
INFO: Sending audio to server
  { chunksCount: 50, duration: 15 }
WARN: Audio processing response delay
  { elapsedMs: 5000 }
```

**Solution:**
1. Check network connectivity
2. Check server logs for bottlenecks
3. Monitor system resources

### Issue: Voice not changing

**Log Pattern:**
```
INFO: Voice changed
  { from: 'aria', to: 'jenny' }
DEBUG: Speed changed
  { from: 1.0, to: 1.2 }
```

**But AI responds with old voice**

**Solution:**
1. Check if voice ID is correctly passed to API
2. Verify Python TTS service is responding to new voice
3. Check TTS service logs: `storage/logs/laravel.log`

## Frontend-Backend Coordination

### When to Check Backend

If frontend logs show success but user sees issues:

```typescript
// Frontend: All logs show success
logger.info('Audio playback queued');
logger.info('AI response audio queued for playback');

// But audio doesn't play
// → Check: /api/voice/audio/{messageId} response
```

### Required Backend Logging

Ensure backend also logs:
- Audio file generation
- TTS service calls
- STT transcription results
- AI response generation
- Audio streaming

## Performance Monitoring

### Track Response Times

```typescript
const startTime = Date.now();
// ... do something ...
const duration = Date.now() - startTime;
logger.info('Operation completed', { durationMs: duration });
```

### Monitor Error Rates

```javascript
// In browser console
let errors = 0;
let total = 0;
// Count errors and totals from logs
// Calculate: errorRate = (errors / total) * 100
```

## Configuration Options

### Enable/Disable Server Logging

Currently, server logging is always attempted but silent-fails if endpoint unavailable.

To disable:
```typescript
// In logToServer method, return early:
if (!ENABLE_SERVER_LOGGING) return;
```

### Adjust Log Levels

For production, reduce debug output:
```typescript
debug(message: string, data?: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
        console.log(...);
    }
}
```

## Best Practices

✅ **DO:**
- Log at appropriate levels (info for state, error for failures)
- Include contextual data with each log
- Use consistent session IDs for correlation
- Send errors to backend for analysis
- Include user agent for browser context

❌ **DON'T:**
- Log sensitive information (API keys, auth tokens)
- Log every single operation (causes noise)
- Use only console.log (breaks structure)
- Ignore error logs during development
- Leave debug code in production

## Integration with Monitoring

### Set Up Centralized Logging

Store logs in a service like:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Datadog
- Sentry
- New Relic

### Query Logs by Session

```sql
SELECT * FROM logs 
WHERE session_id = 'vc_1705123456789_a1b2c3d4'
ORDER BY timestamp ASC;
```

### Alert on Error Patterns

Create alerts for:
- High error rate
- Specific error messages
- Repeated failures
- Performance degradation

## Testing the Logging

### Manual Test

1. Open DevTools (F12)
2. Go to Console tab
3. Start a voice conversation
4. Check logs appear in real-time
5. Look for your session ID
6. Verify timestamps increment

### Automated Test

```typescript
// In your test file
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    logToServer: jest.fn(),
};

// Verify logging calls
expect(mockLogger.info).toHaveBeenCalledWith(
    'Recording started successfully',
    expect.any(Object)
);
```

## Summary

The comprehensive error logging system provides:
- ✅ Real-time debugging in browser console
- ✅ Session-based log correlation
- ✅ Server-side log persistence
- ✅ Structured, typed log output
- ✅ Color-coded console display
- ✅ Contextual error information
- ✅ Performance monitoring
- ✅ Production-ready error tracking

**Key Integration Points:**
- `/api/voice/log` - Server logging endpoint
- Browser DevTools Console - Real-time visibility
- Backend logs - Historical analysis
- Session IDs - Cross-component correlation

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
