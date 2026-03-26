# Frontend Debugging Quick Start Guide

## Quick Reference

### Open Browser DevTools
- **Chrome/Edge:** `F12` or `Ctrl+Shift+I`
- **Firefox:** `F12` or `Ctrl+Shift+I`
- **Safari:** `Cmd+Option+I`

### View Logs
1. Press `F12` to open DevTools
2. Click **Console** tab
3. Click **Record** button (if needed)
4. Perform action that needs debugging
5. Review logs that appear

## Common Scenarios

### Scenario 1: Microphone Not Working

#### What You'll See in Console

```
[vc_1705123456789_abc123] +0ms INFO: Starting audio recording
[vc_1705123456789_abc123] +50ms DEBUG: Requesting microphone access
  { audio: { sampleRate: 16000, channelCount: 1, ... } }
[vc_1705123456789_abc123] +100ms ERROR: Error starting recording
  { error: "NotAllowedError: Permission denied" }
[vc_1705123456789_abc123] +150ms ERROR: Failed to start recording
  { error: "Microphone permission denied. Please allow access in browser settings." }
```

#### Diagnosis

- **NotAllowedError** = User denied microphone permission
- **NotFoundError** = No microphone device found
- **NotReadableError** = Microphone in use by another app

#### Solution

1. **For NotAllowedError:**
   - Click address bar → Lock icon → Site settings
   - Find "Microphone" → Set to "Allow"
   - Reload page and try again

2. **For NotFoundError:**
   - Check microphone is connected
   - Try different USB port
   - Restart browser

3. **For NotReadableError:**
   - Close other apps using microphone (Skype, Zoom, Teams, etc.)
   - Restart browser
   - Restart computer if issue persists

---

### Scenario 2: Voice Not Changing

#### What You'll See in Console

```
[vc_1705123456789_abc123] +3250ms INFO: Voice changed
  { from: 'aria', to: 'jenny' }
```

**But AI still speaks with old voice**

#### Diagnosis

Check if backend properly uses new voice. Look for:

```
INFO: Sending start request
  { voice: 'jenny' } ← This is what was sent
```

#### Solution

1. Check **Network tab** in DevTools:
   - Go to **Network**
   - Look for `/api/voice/start` request
   - Click it → **Payload** tab
   - Verify `voice_settings.voice` contains correct voice name

2. If correct in request but wrong in response:
   - Issue is in backend Python TTS service
   - Check server logs: `storage/logs/laravel.log`

3. If wrong in request:
   - Frontend bug
   - Reload page and try again

---

### Scenario 3: Audio Processing Takes Too Long

#### What You'll See in Console

```
[vc_1705123456789_abc123] +5000ms INFO: Sending audio to server
  { chunksCount: 50, duration: 5 }
[vc_1705123456789_abc123] +12000ms DEBUG: Audio processing response received ← 7 second delay
  { success: true, ... }
```

#### Diagnosis

More than 5 seconds to process suggests:
- Network latency issue
- Backend processing slow
- STT service slow
- AI service slow

#### Solution

1. Check **Network tab**:
   - Go to Network → Filter by XHR
   - Look for `/api/voice/process-audio`
   - Check "Time" column (total time including processing)

2. If request+response time > 5s:
   - Check **Backend** logs for slow services
   - Check network connection speed
   - Try again at different time

3. If processing consistently slow:
   - Backend may need optimization
   - STT or TTS service might be bottleneck
   - Check server resources (CPU, RAM)

---

### Scenario 4: No Audio Playback

#### What You'll See in Console

```
[vc_1705123456789_abc123] +10000ms INFO: AI response audio queued for playback
[vc_1705123456789_abc123] +10050ms INFO: Playing audio
  { audioUrl: "/api/voice/audio/123" }
[vc_1705123456789_abc123] +10100ms DEBUG: Audio playback started
[vc_1705123456789_abc123] +10150ms DEBUG: Audio playback ended ← Ended too quickly
```

#### Diagnosis

Audio started but ended immediately suggests:
- Audio file is empty or corrupted
- Audio file is too short
- Browser issue
- Audio player issue

#### Solution

1. **Check audio file URL:**
   ```javascript
   // In console, run:
   fetch('/api/voice/audio/123').then(r => r.blob()).then(b => {
       console.log('Audio blob size:', b.size, 'bytes');
       console.log('Audio type:', b.type);
   });
   ```
   - Size should be > 1000 bytes
   - Type should be "audio/mpeg"

2. **Test audio file directly:**
   - Right-click in console and look at Network requests
   - Find `/api/voice/audio/123` request
   - Check response size (should be > 1KB)

3. **If file is too small:**
   - TTS service isn't generating audio
   - Check backend logs for TTS errors

4. **If everything looks good:**
   - Browser issue
   - Try different browser
   - Clear cache and reload

---

### Scenario 5: Settings Don't Save

#### What You'll See in Console

```
[vc_1705123456789_abc123] +1000ms INFO: Voice changed
  { from: 'aria', to: 'jenny' }
[vc_1705123456789_abc123] +1050ms DEBUG: Speed changed
  { from: 1.0, to: 1.2 }
```

**But next time you load, settings are back to default**

#### Diagnosis

Settings are changed in UI but not persisted. Check:
1. Are they changing in the dialog?
2. Are they being sent to backend?
3. Are they being retrieved on load?

#### Solution

1. **Check if settings are sent to API:**
   - Open Network tab
   - Change voice/speed
   - Look for any API calls (might be auto-save)
   - If no calls, settings aren't being saved

2. **If settings should auto-save:**
   - Backend endpoint might be missing
   - Check `/api/voice/settings` endpoints

3. **If settings are supposed to persist in DB:**
   - Check conversation object has voice_settings
   - Verify backend saves them on conversation creation
   - Query database to verify

---

## Log Levels Explained

### When You See Each Level

#### 🔵 INFO (Blue)
**Indicates:** Normal operation/important state changes

```
+150ms INFO: Voice conversation started successfully
```

**What to do:** Generally good sign. Operation succeeded.

---

#### 🔴 ERROR (Red)
**Indicates:** Something failed

```
+500ms ERROR: Error starting recording
```

**What to do:** 
1. Read the error message
2. Check context data
3. Follow solution for that error type

---

#### 🟠 WARN (Orange)
**Indicates:** Non-critical issue but not ideal

```
+100ms WARN: WebM codec not supported, audio quality may be reduced
```

**What to do:** Operation will continue but quality/compatibility may be affected.

---

#### 🟣 DEBUG (Purple, dev mode only)
**Indicates:** Detailed diagnostic information

```
+200ms DEBUG: Audio chunk received
  { size: 8192 }
```

**What to do:** Only shows in development. Helps trace execution flow.

---

## Session ID Tracking

Every log has a session ID that uniquely identifies that user's session:

```
[vc_1705123456789_abc123]
  ↑ This is the session ID
```

### Why This Matters

1. **Correlate with backend logs:**
   ```bash
   # In server terminal
   grep "session_id: vc_1705123456789_abc123" storage/logs/laravel.log
   ```

2. **Provide to support:**
   - User can copy session ID from console
   - Support can look up all logs from that session
   - Makes debugging much faster

3. **Consistent across reload:**
   - Each page load gets new session ID
   - Enables tracking multiple requests in one session

---

## Network Debugging

### Check API Requests

1. Open DevTools → **Network** tab
2. Filter by "XHR" (to see API calls only)
3. Perform voice action
4. Click on `/api/voice/start` request

### Request Details (Headers tab)
```
POST /api/voice/start HTTP/1.1
Host: your-domain.com
Content-Type: application/json
X-CSRF-TOKEN: abc123def456
```

Check:
- ✅ CSRF-TOKEN is present
- ✅ Content-Type is correct
- ✅ POST method is used

### Request Payload (Payload tab)
```json
{
    "conversation_id": "123",
    "language": "en",
    "voice_settings": {
        "voice": "aria",
        "speed": 1.0
    }
}
```

Check:
- ✅ All fields present
- ✅ Values are correct types
- ✅ No null values

### Response (Response tab)
```json
{
    "success": true,
    "data": {
        "voice_conversation_id": "456"
    }
}
```

Check:
- ✅ `success: true`
- ✅ All expected fields present
- ✅ No error messages

---

## Console Commands for Debugging

### Check Session ID
```javascript
// In console, copy this to find all logs from a session
// Then grep backend logs with this ID
document.body.innerText.match(/\[vc_\d+_[a-z0-9]+\]/)[0]
```

### Test Microphone Access
```javascript
navigator.mediaDevices.getUserMedia({ 
    audio: { sampleRate: 16000 } 
}).then(stream => {
    console.log('Microphone access granted!');
    console.log('Tracks:', stream.getTracks());
    // Stop the stream
    stream.getTracks().forEach(t => t.stop());
}).catch(err => console.error('Denied:', err.name));
```

### Check Available Voices
```javascript
// This will show you the voices available in the current language
// Open the page, open console, run this
// (Assumes AVAILABLE_VOICES is in scope - you may need to inspect the component)
```

### Simulate Network Delay
```javascript
// In Chrome DevTools Network tab:
// 1. Click settings (gear icon)
// 2. Go to "Throttling"
// 3. Set to "Slow 4G" or custom value
// Simulate slow network conditions
```

---

## Performance Baseline

### Expected Timings

These are typical times for normal conditions:

| Operation | Time | Range |
|-----------|------|-------|
| Recording start | 0ms | Instant |
| Recording capture | 0.5-3s | User dependent |
| Audio processing | 2-5s | 1-10s typical |
| Voice response | 1-3s | 0.5-5s typical |
| Total roundtrip | 5-10s | 3-20s typical |

**If timings exceed ranges:**
- Check network (throttling in DevTools)
- Check backend logs
- Check system resources
- Monitor other processes

---

## Creating Bug Reports

### Include This Information

When reporting a bug, provide:

1. **Session ID** from console
   ```
   [vc_1705123456789_abc123]
   ```

2. **Error message** exactly as shown
   ```
   "Microphone permission denied..."
   ```

3. **Browser info** from console:
   ```javascript
   navigator.userAgent
   ```

4. **Steps to reproduce**
   - Exact actions taken
   - Settings used
   - Network conditions

5. **Console logs** (screenshot or copy-paste)
   - Show all INFO, WARN, ERROR messages
   - Show timestamps
   - Show context data

6. **Network logs** if applicable
   - Screenshot of Network tab
   - Request/Response details
   - HTTP status codes

---

## Troubleshooting Flowchart

```
Issue occurs

↓ Open DevTools (F12)

↓ Go to Console tab

↓ Search for ERROR or WARN

Found ERROR?
  YES → Read error message → Follow solution for that error
  NO → Check Network tab

↓ Go to Network tab

↓ Reproduce the issue

↓ Check /api/voice/* requests

Request failed (red)?
  YES → Check HTTP status code → 4xx = frontend issue, 5xx = backend issue
  NO → Check response data

Response success: true?
  YES → Issue might be in processing or playback
  NO → Check error message in response

↓ Copy session ID from console

↓ Search backend logs with session ID

Found backend error?
  YES → Fix backend issue
  NO → Issue might be in intermediate processing (Python services)
```

---

## Quick Fixes

### 99% of Issues Are:

1. **Microphone permission** (40%)
   - Fix: Check browser settings

2. **Microphone in use** (20%)
   - Fix: Close other apps using mic

3. **Network slow** (15%)
   - Fix: Check internet connection

4. **Browser cache** (15%)
   - Fix: Ctrl+Shift+Delete → Clear cache

5. **Backend error** (10%)
   - Fix: Check backend logs, restart services

---

## Resources

- **Console Logging Guide:** `FRONTEND_VOICE_ERROR_LOGGING_GUIDE.md`
- **Backend Setup:** `VOICE_CONVERSATION_PYTHON_SETUP.md`
- **System Overview:** `VOICE_SYSTEM_INTEGRATION_SUMMARY.md`
- **Browser DevTools:** https://developer.chrome.com/docs/devtools/

---

**Last Updated:** 2024
**Version:** 1.0
