# Voice Conversation - Real-Time Streaming Implementation

Guide for implementing real-time audio streaming in the voice conversation system.

## Architecture Overview

```
Frontend (Browser)
    ↓
    Record Audio (WebM)
    ↓
Send to Laravel API
    ↓
Laravel (Process Audio)
    ├─ Transcribe (STT) - Python Vosk
    ├─ Generate AI Response - GROK API
    └─ Synthesize (TTS) - Python Edge TTS
    ↓
Stream Audio Back to Frontend
    ↓
Frontend (Play Audio)
```

## Frontend Implementation

### Recording & Sending Audio

Already implemented in `resources/js/pages/VoiceConversation.tsx`:

```typescript
// 1. Get microphone access
const stream = await navigator.mediaDevices.getUserMedia({
    audio: { 
        sampleRate: 16000, 
        channelCount: 1, 
        echoCancellation: true 
    }
});

// 2. Record audio
mediaRecorder.start(1000); // Push data every 1 second

// 3. Send to server
formData.append('audio', audioBlob, 'recording.webm');
await fetch('/api/voice/process-audio', {
    method: 'POST',
    body: formData
});
```

### Receiving & Playing Audio

```typescript
// 1. Receive audio URL from response
const aiMessage = {
    audio_url: '/api/voice/audio/123'
};

// 2. Play audio
const audio = new Audio(aiMessage.audio_url);
audio.play();

// 3. Handle playback events
audio.onended = () => setIsPlaying(false);
```

## Backend Implementation

### 1. Audio Processing Endpoint

Update `routes/voice-conversation.php`:

```php
Route::prefix('api')->group(function(){
    Route::middleware(['auth:sanctum'])->prefix('voice')->group(function () {
        // Existing routes...
        Route::post('/process-audio', [VoiceConversationController::class, 'processAudio']);
        Route::get('/audio/{messageId}', [VoiceConversationController::class, 'streamAudio'])
            ->name('voice.audio.stream');
    });
});
```

### 2. Process Audio Controller

Add to `app/Http/Controllers/Api/VoiceConversationController.php`:

```php
public function processAudio(Request $request)
{
    $request->validate([
        'audio' => 'required|file|mimes:webm,mp3,wav,m4a|max:10240',
        'conversation_id' => 'required|integer',
        'duration' => 'integer'
    ]);

    try {
        // Get conversation
        $conversation = Conversation::where('id', $request->conversation_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // 1. Store user audio
        $audioPath = $request->file('audio')->store(
            "conversations/{$conversation->id}/audio",
            'local'
        );

        // 2. Convert speech to text (STT)
        $sttService = app(SpeechToTextService::class);
        $transcription = $sttService->transcribe(
            storage_path("app/{$audioPath}"),
            ['language' => $conversation->language ?? 'en']
        );

        // 3. Save user message
        $userMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $transcription,
            'type' => 'audio',
            'is_voice' => true,
            'audio_path' => $audioPath,
            'audio_duration' => $request->duration ?? 0,
        ]);

        // 4. Generate AI response
        $aiService = app(AIChatService::class);
        $aiResponse = $aiService->generateResponse(
            $conversation->id,
            $transcription
        );

        // 5. Synthesize speech (TTS)
        $ttsService = app(TextToSpeechService::class);
        $audioContent = $ttsService->synthesize($aiResponse, [
            'voice' => $conversation->voice_settings['voice'] ?? 'aria',
            'rate' => $conversation->voice_settings['rate'] ?? '+0%',
            'pitch' => $conversation->voice_settings['pitch'] ?? '+0Hz',
        ]);

        // 6. Store AI audio
        $aiAudioPath = "conversations/{$conversation->id}/audio/ai_" . uniqid() . '.mp3';
        Storage::put($aiAudioPath, $audioContent);

        // 7. Save AI message
        $aiMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $aiResponse,
            'type' => 'audio',
            'is_voice' => true,
            'audio_path' => $aiAudioPath,
            'audio_duration' => $this->estimateAudioDuration($aiResponse),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user_message' => [
                    'id' => $userMessage->id,
                    'content' => $transcription,
                    'role' => 'user',
                    'type' => 'audio',
                    'created_at' => $userMessage->created_at->toIso8601String(),
                ],
                'ai_response' => [
                    'id' => $aiMessage->id,
                    'content' => $aiResponse,
                    'role' => 'assistant',
                    'type' => 'audio',
                    'audio_url' => route('voice.audio.stream', $aiMessage->id),
                    'audio_duration' => $aiMessage->audio_duration,
                    'created_at' => $aiMessage->created_at->toIso8601String(),
                ]
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Voice audio processing error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
```

### 3. Audio Streaming Endpoint

Add to controller:

```php
public function streamAudio($messageId)
{
    try {
        // Get message with authorization check
        $message = Chat::whereHas('conversation', function ($query) {
            $query->where('user_id', Auth::id());
        })
        ->where('type', 'audio')
        ->findOrFail($messageId);

        $audioPath = $message->audio_path;

        // Validate path exists
        if (!Storage::exists($audioPath)) {
            return response()->json([
                'error' => 'Audio file not found'
            ], 404);
        }

        $file = Storage::get($audioPath);
        $mimeType = 'audio/mpeg';

        // Stream response with proper headers for audio playback
        return response($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => strlen($file),
            'Content-Disposition' => 'inline; filename="audio.mp3"',
            'Cache-Control' => 'public, max-age=31536000',
            'Accept-Ranges' => 'bytes',
        ]);

    } catch (\Exception $e) {
        Log::error('Audio streaming error: ' . $e->getMessage());
        return response()->json([
            'error' => 'Failed to stream audio'
        ], 500);
    }
}
```

## Advanced: Server-Sent Events (SSE) Streaming

For real-time streaming of TTS chunks:

### Backend (Controller)

```php
public function streamAudioSSE($messageId)
{
    try {
        $message = Chat::findOrFail($messageId);
        
        $response = new StreamedResponse(function () use ($message) {
            // Get audio file
            $audioPath = $message->audio_path;
            $file = Storage::get($audioPath);
            
            // Stream in 4KB chunks
            $chunkSize = 4096;
            $offset = 0;
            
            while ($offset < strlen($file)) {
                $chunk = substr($file, $offset, $chunkSize);
                $offset += $chunkSize;
                
                echo 'data: ' . json_encode([
                    'audio_chunk' => base64_encode($chunk),
                    'offset' => $offset,
                    'total' => strlen($file)
                ]) . "\n\n";
                
                flush();
                ob_flush();
            }
            
            // Signal completion
            echo 'data: ' . json_encode([
                'status' => 'complete'
            ]) . "\n\n";
        });
        
        $response->headers->set('Content-Type', 'text/event-stream');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('Connection', 'keep-alive');
        
        return $response;

    } catch (\Exception $e) {
        Log::error('SSE streaming error: ' . $e->getMessage());
    }
}
```

### Frontend (React)

```typescript
// Use EventSource for SSE
const streamAudio = (messageId: string) => {
    const eventSource = new EventSource(`/api/voice/audio-sse/${messageId}`);
    const chunks: Uint8Array[] = [];
    
    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.status === 'complete') {
            // Combine chunks and create blob
            const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Play audio
            const audio = new Audio(audioUrl);
            audio.play();
            
            eventSource.close();
        } else if (data.audio_chunk) {
            // Accumulate chunks
            const binaryString = atob(data.audio_chunk);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            chunks.push(bytes);
        }
    };
    
    eventSource.onerror = () => {
        console.error('Streaming error');
        eventSource.close();
    };
};
```

## WebSocket Streaming (Real-time)

For truly real-time bidirectional streaming:

### Backend Setup

```php
// Install Laravel WebSocket package
composer require beyondcode/laravel-websockets

// Configure in config/websockets.php
// Define channel for voice conversation
```

### Frontend Usage

```typescript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:6001/voice/123');

// Send audio chunks
ws.send(JSON.stringify({
    type: 'audio_chunk',
    data: base64EncodedChunk
}));

// Receive processed audio
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'response_audio') {
        // Play AI response audio
        playAudio(data.audio_url);
    }
};
```

## Performance Optimization

### 1. Compress Audio Before Sending

```typescript
// Compress audio blob before upload
const compressAudio = async (blob: Blob) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    // Process if needed...
    return blob; // Return compressed blob
};
```

### 2. Cache Generated Audio

```php
// Cache TTS responses
$cacheKey = "tts:" . md5($text . $voice);
$audioContent = Cache::remember($cacheKey, 3600, function () use ($text, $voice) {
    return $this->ttsService->synthesize($text, ['voice' => $voice]);
});
```

### 3. Pre-generate Common Responses

```php
// Warm up cache with common responses
$commonResponses = [
    'Hello, how can I help?',
    'That\'s a great question.',
    'I didn\'t understand that.',
];

foreach ($commonResponses as $response) {
    $this->ttsService->synthesize($response);
}
```

## Monitoring & Debugging

### Enable Logging

```php
// In TextToSpeechService.php
Log::info('TTS Request', [
    'text_length' => strlen($text),
    'voice' => $options['voice'] ?? 'aria',
    'memory_usage' => memory_get_usage(true)
]);

Log::info('TTS Response', [
    'audio_size' => strlen($audioContent),
    'generation_time' => microtime(true) - $start
]);
```

### Monitor Performance

```bash
# Check Python process resources
ps aux | grep python

# Monitor audio file sizes
du -sh storage/conversations/*/audio/

# Clear old audio files (optional)
find storage/conversations -name "*.mp3" -mtime +30 -delete
```

## Testing

### Test Audio Processing Endpoint

```bash
# Test with cURL
curl -X POST http://localhost:8000/api/voice/process-audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@test_audio.webm" \
  -F "conversation_id=1" \
  -F "duration=5"
```

### Test Audio Streaming

```bash
# Get audio stream
curl http://localhost:8000/api/voice/audio/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output response.mp3

# Play with ffplay
ffplay response.mp3
```

## Troubleshooting

### Audio Not Playing
- Check CORS headers
- Verify audio MIME type
- Check browser console for errors
- Ensure audio file exists in storage

### Streaming Timeout
- Increase server timeout in nginx/Apache
- Check network connection
- Reduce chunk size
- Monitor server resources

### Transcription Errors
- Verify audio format (WAV recommended)
- Check Vosk model exists
- Monitor microphone permissions
- Test with known good audio file

---

**Last Updated**: 2024
