# Voice Conversation System with Python TTS & STT Integration

This guide explains how to integrate the Python-based Text-to-Speech (Edge TTS) and Speech-to-Text (Vosk) services into your voice conversation system.

## Overview

- **TTS (Text-to-Speech)**: Uses Microsoft Edge TTS (via Python) - **NO API KEY NEEDED**
- **STT (Speech-to-Text)**: Uses Vosk (local, offline) - **NO API KEY NEEDED**
- **Architecture**: Python scripts called via Laravel's Process component
- **Streaming**: Real-time audio streaming support

## Prerequisites

### System Requirements
- Python 3.7+
- Laravel 12
- PHP 8.2+

### Install Python Dependencies

```bash
# Install required Python packages
pip install edge-tts vosk pydub

# Optional: for better audio processing
pip install librosa soundfile

# Optional: for GPU acceleration (if needed)
pip install torch torchaudio
```

## File Structure

```
rheaapp/
├── _services/
│   ├── tts_stream.py          # Text-to-Speech script (Edge TTS)
│   ├── stts.py                # Speech-to-Text script (Vosk)
│   └── tts2.py                # Original TTS script
├── app/Services/
│   ├── TextToSpeechService.php     # Updated to use Python
│   ├── SpeechToTextService.php     # Updated to use Vosk
│   └── VoiceConversationService.php
└── routes/
    └── voice-conversation.php
```

## Setup Instructions

### 1. Python Scripts Setup

Both scripts are in `_services/` directory and are ready to use:

**tts_stream.py** - Text-to-Speech
- Converts text to speech MP3 files
- Supports multiple voices and languages
- Outputs JSON response with file information
- Usage: `python tts_stream.py "Hello world" aria +0% +0Hz`

**stts.py** - Speech-to-Text  
- Converts audio files to text (WAV, MP3)
- Supports 6+ languages locally
- No internet connection required
- Usage: `python stts.py audio.wav en`

### 2. Vosk Language Models Setup

For offline speech recognition, you need language models. Download them once:

```bash
# Create models directory
mkdir ~/.vosk

# Download English model (recommended - ~40MB)
# Download from: https://alphacephei.com/vosk/models

# Extract to ~/.vosk/
# Example:
# ~/.vosk/vosk-model-small-en-us-0.15/

# Supported languages:
# - en: English (vosk-model-small-en-us-0.15)
# - es: Spanish (vosk-model-small-es-0.42)
# - fr: French (vosk-model-small-fr-0.22)
# - de: German (vosk-model-small-de-0.15)
# - ru: Russian (vosk-model-small-ru-0.22)
# - zh: Chinese (vosk-model-small-zh-cn-0.22)
```

### 3. Laravel Service Configuration

The services are already updated in:
- `app/Services/TextToSpeechService.php`
- `app/Services/SpeechToTextService.php`

**No configuration changes needed** - they work with default settings.

## Usage

### Via Laravel Services

```php
// Text-to-Speech
$ttsService = app(TextToSpeechService::class);
$audioContent = $ttsService->synthesize('Hello world', [
    'voice' => 'aria',      // see available voices below
    'rate' => '+0%',        // speed: -50% to +50%
    'pitch' => '+0Hz'       // pitch: -20Hz to +20Hz
]);
// Returns: binary MP3 audio data

// Save to file or stream
Storage::put('audio.mp3', $audioContent);
```

```php
// Speech-to-Text
$sttService = app(SpeechToTextService::class);
$text = $sttService->transcribe($audioFile, [
    'language' => 'en'  // en, es, fr, de, ru, zh
]);
// Returns: transcribed text
```

## Available Voices (TTS)

### English Voices
- `aria` - Female (default)
- `jenny` - Female
- `davis` - Male
- `tony` - Male
- `sara` - Female
- `sonia` - Female (British)
- `ryan` - Male (British)
- `libby` - Female (British)
- `william` - Male (Australian)
- `natasha` - Female (Australian)

### Other Languages
- `spanish` - Spanish
- `french` - French
- `german` - German
- `italian` - Italian
- `japanese` - Japanese
- `korean` - Korean
- `chinese` - Chinese (Simplified)

### Parameters
- **Rate**: `-50%` to `+50%` (default: `+0%`)
- **Pitch**: `-20Hz` to `+20Hz` (default: `+0Hz`)

## API Endpoints

### Voice Conversation Routes

```php
// Start voice conversation
POST /api/voice/start
{
    "conversation_id": "123",
    "language": "en",
    "voice_settings": {
        "voice": "aria",
        "speed": 1.0
    }
}

// Process audio (STT + AI response + TTS)
POST /api/voice/process-audio
FormData: {
    "audio": <file>,
    "conversation_id": "123",
    "duration": 5
}

// Process text (direct text input)
POST /api/voice/process-text
{
    "text": "Hello",
    "conversation_id": "123"
}

// Stream audio response
GET /api/voice/audio/{messageId}
Response: Binary MP3 stream

// End conversation
POST /api/voice/end
{
    "voice_conversation_id": "123"
}

// Get conversation history
GET /api/voice/history/{conversationId}
```

## Performance Considerations

### TTS (Text-to-Speech)
- **First request**: ~1-3 seconds (downloads voice models)
- **Subsequent requests**: ~0.5-1 second
- **Audio quality**: 48kHz MP3 (high quality)
- **Supported formats**: MP3 (streaming ready)

### STT (Speech-to-Text)
- **Processing time**: ~0.5-2 seconds per audio (depends on length)
- **CPU usage**: Low-Medium (no GPU required)
- **Accuracy**: ~85-95% (varies by language)
- **Language models**: ~40-60MB each

### Storage
- Audio files stored in `storage/conversations/{conversation_id}/audio/`
- Automatic cleanup recommended (configure in your app)

## Error Handling

Both services have automatic fallback mechanisms:

1. **TTS**: Python Edge TTS → Eleven Labs (if API key) → Silent MP3
2. **STT**: Vosk (local) → Eleven Labs (if API key) → Mock responses

Check logs in `storage/logs/laravel.log` for errors.

## Troubleshooting

### Python Script Not Found
```
Error: "Python script path not found"
Solution: Verify scripts exist in _services/ directory
```

### Vosk Model Not Found
```
Error: "Language model not found"
Solution: Download models to ~/.vosk/ directory
Download from: https://alphacephei.com/vosk/models
```

### Edge TTS Not Available
```
Error: "No module named edge_tts"
Solution: Install with: pip install edge-tts
```

### Audio Processing Timeout
```
Error: "Process exceeded timeout"
Solution: Increase timeout or check system resources
Edit: app/Services/SpeechToTextService.php (line 81)
Change: $process->setTimeout(300);  // in seconds
```

### Windows Path Issues
If running on Windows, scripts automatically handle path conversion. Ensure:
- Python is in system PATH
- Use absolute paths for file references

## Testing

### Test TTS
```bash
python _services/tts_stream.py "Hello world" aria +0% +0Hz
# Should output JSON with file_id and filename
```

### Test STT
```bash
python _services/stts.py /path/to/audio.wav en
# Should output JSON with transcribed text
```

### Test via Laravel
```php
// In Laravel tinker
$tts = app(\App\Services\TextToSpeechService::class);
$audio = $tts->synthesize('Test');

$stt = app(\App\Services\SpeechToTextService::class);
// $text = $stt->transcribe($audioFile);
```

## Advanced Configuration

### Custom Voice Models

To add custom voices or language-specific models:

1. Download model from [Vosk Models](https://alphacephei.com/vosk/models)
2. Extract to `~/.vosk/model-name/`
3. Update `stts.py` supported_models dictionary

### Streaming Implementation

For real-time streaming of TTS output:

```php
// Get streaming chunks
$result = $this->ttsService->getStreamingChunks($text);

// Stream chunks to client via WebSocket or Server-Sent Events
foreach ($result['chunks'] as $chunk) {
    // Send chunk to frontend
    echo json_encode(['audio_chunk' => base64_encode($chunk)]);
    flush();
}
```

## Production Deployment

### Recommendations
1. **Use queue workers** for long-running transcriptions
2. **Cache models** in application directory (not home)
3. **Set file permissions** for storage directories
4. **Monitor disk usage** (audio files accumulate)
5. **Use CDN** for audio file distribution
6. **Implement rate limiting** on TTS/STT endpoints

### Environment Variables
```env
# Optional: Override Python path if not in PATH
PYTHON_PATH=/usr/bin/python3

# Optional: Custom models directory
VOSK_MODELS_PATH=/opt/vosk-models
```

## Migration from Eleven Labs

If migrating from Eleven Labs API:

1. **No code changes needed** - Services handle fallback automatically
2. **Remove API keys** - Not required anymore (optional for fallback)
3. **Test endpoints** - Verify TTS/STT work with new services
4. **Monitor performance** - Compare latency and quality

## Support & Resources

- **Edge TTS**: https://github.com/rany2/edge-tts
- **Vosk**: https://alphacephei.com/vosk/
- **Voice Models**: https://alphacephei.com/vosk/models
- **Laravel Process**: https://symfony.com/doc/current/components/process.html

## License Notes

- **Edge TTS**: MIT License
- **Vosk**: Apache 2.0 License
- Both are open-source and free to use

---

**Last Updated**: 2024
**Integration Version**: 1.0
