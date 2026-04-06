<?php

namespace App\Services\Grok;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class LanguageDetector
{
    // Language-specific constants
    private const LANG_PATTERNS = [
        'ha' => '/\b(sannu|yaya|nagode|gaskiya|lafiya|barkan|ina|wane|yaushe|gobe|yanzu|kuma|amma)\b/ui',
        'yo' => '/\b(bawo|pele|jowo|ekaaro|ekasan|odabo|kaabo|seun|mogbe|omo|kini|nibo|nigba)\b/ui',
        'ig' => '/\b(kedu|biko|daalu|ndewo|maka|nnọọ|gịnị|olee|kedụ|ebee|onye)\b/ui'
    ];

    // Supported languages with their codes
    private const SUPPORTED_LANGUAGES = [
        'en' => 'English',
        'ha' => 'Hausa',
        'yo' => 'Yoruba',
        'ig' => 'Igbo'
    ];

    private string $defaultLanguage = 'en';

    /**
     * Detect language from input text
     */
    public function detect(string $text): string
    {
        $text = strtolower(trim($text));
        foreach (self::LANG_PATTERNS as $lang => $pattern) {
            if (preg_match($pattern, $text)) {
                return $lang;
            }
        }
        return 'en';
    }

    /**
     * Set the language for responses
     */
    public function setLanguage(string $language): void
    {
        if (isset(self::SUPPORTED_LANGUAGES[$language])) {
            $this->defaultLanguage = $language;
            Log::info('Language set to: ' . self::SUPPORTED_LANGUAGES[$language]);
        } else {
            Log::warning("Attempted to set unsupported language: {$language}");
        }
    }

    /**
     * Get the current language
     */
    public function getLanguage(): string
    {
        return $this->defaultLanguage;
    }

    /**
     * Get user's preferred language or default to English
     */
    public function getUserLanguage(): string
    {
        if (Auth::check()) {
            $userLanguage = strtolower(Auth::user()->language ?? '');
            if ($userLanguage && isset(self::SUPPORTED_LANGUAGES[$userLanguage])) {
                return $userLanguage;
            }
        }
        return 'en';
    }

    /**
     * Get language-specific message
     */
    public function getLanguageMessage(string $language): array
    {
        $languageInstructions = [
            'ha' => "Ya kamata in amsa da Hausa.",
            'yo' => "Jọwọ dahun ni Yoruba.",
            'ig' => "Biko zaa m n'asụsụ Igbo.",
            'en' => ""
        ];
        return [
            'role' => 'system',
            'content' => $languageInstructions[$language] ?? ""
        ];
    }

    /**
     * Get all supported languages
     */
    public function getSupportedLanguages(): array
    {
        return self::SUPPORTED_LANGUAGES;
    }

    /**
     * Check if language is supported
     */
    public function isSupported(string $language): bool
    {
        return isset(self::SUPPORTED_LANGUAGES[$language]);
    }
}