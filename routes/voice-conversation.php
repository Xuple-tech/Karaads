<?php
use App\Http\Controllers\SpaController;
// routes/web.php

use App\Http\Controllers\VoiceConversationController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
Route::get('/voice-chat', SpaController::class)->name('voice.chat');
Route::middleware(['auth'])->group(function () {
    Route::get('/c/{conversation}/voice', SpaController::class)
        ->name('voice.conversation');
});

Route::prefix('api')->group(function(){


Route::middleware(['auth:sanctum'])->withoutMiddleware(VerifyCsrfToken::class)->prefix('voice')->group(function () {
    Route::post('/start', [VoiceConversationController::class, 'start']);
    Route::post('/process-audio', [VoiceConversationController::class, 'processAudio']);
    Route::post('/process-text', [VoiceConversationController::class, 'processText']);
    Route::post('/end', [VoiceConversationController::class, 'end']);
    Route::get('/history/{conversationId}', [VoiceConversationController::class, 'history']);
    Route::get('/stream-audio/{messageId}', [VoiceConversationController::class, 'streamAudio'])
        ->name('voice.audio.stream');

});
});
