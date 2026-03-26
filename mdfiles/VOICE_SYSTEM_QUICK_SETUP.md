# Voice Conversation System - Quick Setup Checklist

Complete integration guide for Python TTS/STT with your voice conversation system.

## ✅ Pre-Setup Verification

- [ ] Python 3.8+ installed: `python --version`
- [ ] pip package manager installed: `pip --version`
- [ ] Laravel 12 application running
- [ ] Database migrations completed
- [ ] Voice conversation tables exist in database

## 📦 Step 1: Install Python Dependencies (5 minutes)

```bash
# Navigate to project root
cd c:\Users\User\Documents\rheaapp

# Install all Python requirements
pip install -r _services/requirements.txt

# Verify installation
python -c "import edge_tts; import vosk; print('✓ All packages installed')"
```

### What gets installed:
- `edge-tts` - Text-to-speech engine (Microsoft)
- `vosk` - Speech-to-text engine (offline)
- `pydub` - Audio format handling
- Supporting libraries

## 🎤 Step 2: Download Vosk Language Models (5-10 minutes)

### Download Models

```bash
# Create models directory
mkdir %USERPROFILE%\.vosk

# Download models from:
# https://alphacephei.com/vosk/models

# For English (recommended for testing):
# - Download: vosk-model-small-en-us-0.15
# - Extract to: %USERPROFILE%\.vosk\vosk-model-small-en-us-0.15\
```

### Step-by-step for Windows:

1. Go to https://alphacephei.com/vosk/models
2. Click "vosk-model-small-en-us-0.15" (~43MB)
3. Extract the ZIP file
4. Move extracted folder to `C:\Users\YourUsername\.vosk\`
5. Result: `C:\Users\YourUsername\.vosk\vosk-model-small-en-us-0.15\`

### Verify Installation

```bash
# Check if model exists
if exist "%USERPROFILE%\.vosk\vosk-model-small-en-us-0.15\*" (
    echo ✓ English model installed
) else (
    echo ✗ Model not found
)
```

## 🔧 Step 3: Test Python Scripts (5 minutes)

### Test TTS Script

```bash
# Test text-to-speech
cd _services
python tts_stream.py "Hello world" aria +0% +0Hz

# Expected output (JSON):
# {
#   "success": true,
#   "filename": "abc123def456.mp3",
#   "voice": "en-US-AriaNeural",
#   "file_size": 45678
# }

# List available voices
python tts_stream.py "list-voices"
```

### Test STT Script

```bash
# If you have a test audio file (WAV format, 16kHz)
python stts.py C:\path\to\audio.wav en

# Expected output (JSON):
# {
#   "success": true,
#   "text": "hello world",
#   "language": "en"
# }

# List supported languages
python stts.py "list-languages"
```

## 🚀 Step 4: Update Laravel Services

### Services Already Updated ✓
- ✅ `app/Services/TextToSpeechService.php` - Uses Python TTS
- ✅ `app/Services/SpeechToTextService.php` - Uses Vosk STT
- ✅ `app/Services/VoiceConversationService.php` - Orchestrates services

### No additional changes needed! The services are pre-configured.

## 🧪 Step 5: Test via Laravel (10 minutes)

### Test TTS Service

```bash
# Enter Laravel Tinker
php artisan tinker

# Test TTS
$tts = app(\App\Services\TextToSpeechService::class);
$audio = $tts->synthesize('Hello world', ['voice' => 'aria']);
strlen($audio); // Should return audio file size > 0
file_put_contents('test.mp3', $audio); // Save test file
exit
```

### Test STT Service

```bash
# Enter Laravel Tinker
php artisan tinker

# Prepare an audio file (WAV format, 16kHz)
# Then test transcription
$stt = app(\App\Services\SpeechToTextService::class);
$text = $stt->transcribe('/path/to/test_audio.wav', ['language' => 'en']);
echo $text; // Should output transcribed text
exit
```

## 🌐 Step 6: Test API Endpoints

### Using Postman or cURL

#### Test Process Audio Endpoint

```bash
# Make sure you have an audio file (WebM or WAV)
curl -X POST http://localhost:8000/api/voice/process-audio \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "X-CSRF-TOKEN: YOUR_CSRF_TOKEN" \
  -F "audio=@test_audio.webm" \
  -F "conversation_id=1" \
  -F "duration=5"

# Expected response:
# {
#   "success": true,
#   "data": {
#     "user_message": {...},
#     "ai_response": {
#       "audio_url": "/api/voice/audio/123"
#     }
#   }
# }
```

#### Test Audio Streaming

```bash
# Stream audio file
curl http://localhost:8000/api/voice/audio/123 \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  --output response.mp3

# Play the audio
# On Windows: response.mp3
# On Linux: ffplay response.mp3
# On Mac: afplay response.mp3
```

## 🎨 Step 7: Frontend Integration

### Already Implemented ✓
- ✅ `resources/js/pages/VoiceConversation.tsx` - Full UI component
- ✅ Recording functionality
- ✅ Audio playback
- ✅ Streaming support
- ✅ Settings management

### No frontend changes needed!

## 📝 Step 8: Verify Complete Setup

Run this checklist:

```bash
# 1. Check Python installation
python --version

# 2. Check Python packages
pip list | findstr "edge-tts vosk pydub"

# 3. Check Vosk models
dir %USERPROFILE%\.vosk

# 4. Check Laravel services
# In your IDE, verify:
# - app/Services/TextToSpeechService.php
# - app/Services/SpeechToTextService.php

# 5. Check Python scripts exist
dir _services\*.py

# 6. Test database tables
php artisan tinker
DB::table('conversations')->count(); // Should return >= 0
exit
```

## 🎯 Expected Results

After setup, you should be able to:

1. ✅ **Record voice input** - Microphone access working
2. ✅ **Convert speech to text** - Audio → Text transcription
3. ✅ **Generate AI response** - Text → AI Response (via GROK)
4. ✅ **Convert text to speech** - Response → Audio playback
5. ✅ **Stream audio** - Real-time audio delivery to frontend

## ⚙️ Configuration Options

### Voice Settings

```php
// In VoiceConversation.tsx
const settings = {
    language: 'en',           // en, es, fr, de, ru, zh
    voice: 'aria',            // Default voice
    speed: 1.0,               // 0.5 = slow, 1.5 = fast
};
```

### Audio Parameters

```php
// TTS Options (in synthesize call)
[
    'voice' => 'aria',        // Voice name
    'rate' => '+0%',          // Speed: -50% to +50%
    'pitch' => '+0Hz'         // Pitch: -20Hz to +20Hz
]

// STT Options (in transcribe call)
[
    'language' => 'en'        // Language code
]
```

## 🐛 Troubleshooting

### Problem: Python not found
```
Error: "python: command not found"
Solution: Add Python to PATH or use full path: C:\Python\python.exe
```

### Problem: Vosk model not found
```
Error: "Language model not found"
Solution: Download model to C:\Users\YourUsername\.vosk\
```

### Problem: Edge TTS not working
```
Error: "No module named edge_tts"
Solution: pip install edge-tts
```

### Problem: Audio file not found
```
Error: "Audio file not found"
Solution: Verify audio file path exists and is readable
```

### Problem: Slow transcription
```
Solution: This is normal for first request (model loads)
- First request: 1-3 seconds
- Subsequent: 0.5-1 second
```

## 📊 Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| TTS (first) | 1-3s | Model initialization |
| TTS (cached) | 0.5-1s | Fast on repeat voices |
| STT (short) | 0.5-1s | 5-10 second audio |
| STT (long) | 1-3s | 30+ second audio |
| AI Response | 2-5s | Depends on GROK API |
| **Total Round Trip** | **5-10s** | Typical conversation turn |

## 🔐 Security Notes

- ✅ No API keys exposed (local processing)
- ✅ Audio files encrypted in storage
- ✅ User authentication required for endpoints
- ✅ File access restricted to authenticated users
- ✅ Automatic cleanup of temporary files

## 📚 Documentation Files

Created files for reference:

1. **VOICE_CONVERSATION_PYTHON_SETUP.md** - Comprehensive setup guide
2. **VOICE_STREAMING_IMPLEMENTATION.md** - Advanced streaming patterns
3. **_services/requirements.txt** - Python dependencies
4. **_services/tts_stream.py** - TTS implementation
5. **_services/stts.py** - STT implementation

## 🚀 Next Steps

1. Complete the setup checklist above
2. Test each component individually
3. Verify API endpoints work
4. Use in frontend application
5. Monitor performance and logs

## 📞 Support Resources

- Edge TTS: https://github.com/rany2/edge-tts
- Vosk Models: https://alphacephei.com/vosk/models
- Laravel Docs: https://laravel.com/docs/12
- Python Docs: https://docs.python.org/3/

---

## ✅ Final Verification

When everything is set up, run this command:

```bash
# Test complete integration
php artisan tinker

# Create test data
$conversation = App\Models\Conversation::first();
$tts = app(\App\Services\TextToSpeechService::class);
$audio = $tts->synthesize('Setup complete! System ready.');
echo "✓ TTS Working: " . strlen($audio) . " bytes\n";

# If you see bytes count > 10000, TTS is working!
exit
```

🎉 **Congratulations! Voice conversation system is ready to use!**

---

**Setup Version**: 1.0  
**Last Updated**: 2024  
**Estimated Setup Time**: 30-45 minutes
