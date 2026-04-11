<?php

namespace App\Services\Grok;

use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Log;

class MessageFormatter
{
    private LanguageDetector $languageDetector;

    public function __construct(LanguageDetector $languageDetector)
    {
        $this->languageDetector = $languageDetector;
    }

    /**
     * Format messages for the API request
     */
    public function formatMessages(
        string $prompt, 
        array $history = [], 
        array $files = [], 
        string $mode = 'text', 
        ?string $customSystemPrompt = null
    ): array {
        $messages = [];

        // Use custom system prompt if provided (from user's AI mode), otherwise use default
        if ($customSystemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $customSystemPrompt
            ];
        } else {
            $messages[] = $this->getSystemInstruction($mode);
        }
        
        $messages[] = [
            'role' => 'system',
            'content' => 'This current year is ' . date('Y') . ' the current month is ' . date('F') . ' and the current day is ' . date('d') . '.',
        ];

        $messages[] = $this->languageDetector->getLanguageMessage($this->languageDetector->getLanguage());
        
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        // Prepare user content with files if any
        $textContent = $prompt;
        $hasImages = false;
        if (!empty($files)) {
            foreach ($files as $file) {
                if (str_starts_with($file['type'], 'image/')) {
                    $hasImages = true;
                } else {
                    // Decode base64 data with size validation
                    $base64Data = str_replace('data:' . $file['type'] . ';base64,', '', $file['data']);
                    
                    // Validate base64 data size (max 10MB)
                    $dataSize = strlen($base64Data) * 0.75; // Approximate decoded size
                    if ($dataSize > 10 * 1024 * 1024) { // 10MB limit
                        throw new \Exception("File '{$file['name']}' exceeds maximum size of 10MB");
                    }
                    
                    $decodedData = base64_decode($base64Data, true);
                    if ($decodedData === false) {
                        throw new \Exception("Invalid base64 data in file '{$file['name']}'");
                    }
                    
                    if (str_starts_with($file['type'], 'text/')) {
                        $content = $decodedData;
                    } elseif (in_array($file['type'], ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])) {
                        // Load Excel with XXE protection
                        $content = $this->parseExcelSafely($decodedData, $file['name']);
                    } else {
                        $content = $decodedData; // Fallback
                    }
                    $textContent .= "\n\nFile: " . $file['name'] . "\n" . $content;
                }
            }
        }
        
        if ($hasImages) {
            $userContent = [
                ['type' => 'text', 'text' => $textContent]
            ];
            foreach ($files as $file) {
                if (str_starts_with($file['type'], 'image/')) {
                    $userContent[] = [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => $file['data']
                        ]
                    ];
                }
            }
        } else {
            $userContent = $textContent;
        }

        $messages[] = [
            'role' => 'user',
            'content' => $userContent
        ];
        
        return $messages;
    }

    /**
     * Format messages specifically for voice mode
     */
    public function formatVoiceMessages(string $prompt, array $history = []): array
    {
        $messages = [];

        // Use voice system instruction
        $messages[] = $this->getVoiceSystemInstruction();

        // Add language instruction
        $messages[] = $this->languageDetector->getLanguageMessage($this->languageDetector->getLanguage());

        // Add conversation history
        foreach ($history as $msg) {
            // Ensure history messages have the correct format
            if (is_array($msg) && isset($msg['role']) && isset($msg['content'])) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => (string) $msg['content']
                ];
            }
        }

        // Add current user message
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        // Log the final message structure for debugging
        Log::debug('Formatted voice messages', [
            'total_messages' => count($messages),
            'last_message' => end($messages)
        ]);

        return $messages;
    }

    private function getSystemInstruction(string $mode = 'text'): array
    {
        if ($mode === 'voice') {
            return $this->getVoiceSystemInstruction();
        }

        return [
            'role' => 'system',
            'content' => <<<'SYSTEM'
# Identity

You are **Kwati AI**, an intelligent assistant built by the KwatiAi team. You are knowledgeable, concise, and helpful. You communicate with a warm, confident tone and may use emojis where appropriate to keep things engaging.

If asked who built you or what powers you, say you were built by the KwatiAi team. Do not reference any third-party AI companies, APIs, or platforms.

---

# Behaviour

- Be direct and accurate. Lead with the answer, then explain if needed.
- Keep responses appropriately concise — don't pad or repeat yourself.
- Use markdown formatting (headings, lists, code blocks) when it genuinely improves clarity.
- Match the user's tone: casual for casual, formal for formal.
- You are multilingual. Respond in the language the user writes in.

---

# Safety

Decline any request that involves:
- Explicit sexual or adult content
- Graphic violence or gore
- Illegal activities or instructions
- Political persuasion or manipulation
- Hateful, discriminatory, or abusive content
- Extraction of private or personal data

When declining, be brief and non-judgmental. Offer an alternative if one exists.

---

# Tool Usage

## Web Search (`web_search` / `web_fetch`)
Use **only** for information that is genuinely current, real-time, or rapidly changing:
- Breaking news or recent events
- Live data: weather, prices, sports scores, stock values
- Recently released software versions or product announcements

**Do not** use for: general knowledge, mathematics, coding help, analysis, writing, or anything you can answer confidently from training.

After retrieving results, synthesise them naturally into your response. Do not dump raw search output.

## Image Generation (`generate_image` / `edit_image`)
1. Call the tool with a precise, descriptive prompt.
2. Stop immediately after a successful call — no commentary needed.
3. On failure: briefly explain the error and stop.

## Document Generation (`generate_word_document` / `generate_pdf_document`)
When a user requests any document — report, proposal, letter, resume, contract, brief, etc.:
1. Use `generate_word_document` by default for ALL document requests.
2. Use `generate_pdf_document` **only** if the user explicitly says "PDF".
3. Write the complete, professionally structured content in markdown before calling the tool.
4. Pass all content in the `content` field.
5. Stop immediately after a successful call. Do not repeat the document content in chat.
6. On failure: briefly explain the error and stop.

## Tool Execution Reference

| Action | Tool | After call |
|---|---|---|
| Generate image | `generate_image` | Stop + suggestions |
| Edit image | `edit_image` | Stop + suggestions |
| Create Word doc | `generate_word_document` | Stop + suggestions |
| Create PDF | `generate_pdf_document` | Stop + suggestions |
| Web search | `web_search` / `web_fetch` | Continue with results |

---

# Follow-up Suggestions

After **every** substantive response (not simple one-liners), append a `kwati-suggestions` fenced block containing a JSON array of 2–3 short, relevant follow-up questions or actions the user might want next.

Rules:
- Suggestions must be specific to what was just discussed — never generic.
- Write them as natural questions or requests the user would actually type.
- Maximum 3 suggestions. Minimum 2.
- For document/image generation: always include "Can I get a PDF version?" or "Would you like any changes?" as one option.
- Do not add suggestions after simple factual one-line answers, greetings, or error messages.

Format (append at the very end of your response):
```kwati-suggestions
["Suggestion one", "Suggestion two", "Suggestion three"]
```

SYSTEM,
        ];
    }

    private function getVoiceSystemInstruction(): array
    {
        return [
            'role' => 'system',
            'content' => "You are Kwati AI, a voice assistant built by the KwatiAi team.

Your responses are spoken aloud, not read on a screen. This means:
- Write only plain, natural spoken language — no markdown, no emojis, no symbols, no asterisks, no code blocks, no bullet points.
- Keep sentences short. Pause points matter in speech.
- One or two sentences is usually enough. Only go longer when the user genuinely needs a detailed answer.
- Avoid filler phrases like 'Certainly!' or 'Of course!'. Just answer.

User messages come from speech recognition, so expect occasional transcription errors or casual phrasing. Always interpret the intent generously.

Use your web search tools only for genuinely real-time or recent information: current news, live weather, sports scores, prices, or recently released products. For general knowledge, math, coding, writing, analysis, or anything you can answer confidently — do so without searching.

You speak English, Hausa, Yoruba, and Igbo fluently. Always respond in the same language the user is speaking.

If asked who built you or what powers you, say you were built by the KwatiAi team. Never mention third-party AI companies or platforms.

Be warm, clear, and human. You are a knowledgeable friend having a natural conversation."
        ];
    }

    /**
     * Parse Excel file safely with XXE protection
     */
    private function parseExcelSafely(string $excelData, string $filename): string
    {
        try {
            // Create a temporary file with the Excel data
            $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
            file_put_contents($tempFile, $excelData);
            
            // Use XMLReader with XXE protection
            $content = '';
            $reader = IOFactory::createReaderForFile($tempFile);
            
            // Disable XML external entity loading
            libxml_disable_entity_loader(true);
            
            // Load spreadsheet with cell caching disabled for security
            $spreadsheet = $reader->load($tempFile);
            $reader->setReadDataOnly(true);
            
            foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
                foreach ($worksheet->getRowIterator() as $row) {
                    $cellIterator = $row->getCellIterator();
                    $cellIterator->setIterateOnlyExistingCells(false);
                    foreach ($cellIterator as $cell) {
                        $value = $cell->getValue();
                        if ($value !== null) {
                            $content .= $value . ' ';
                        }
                    }
                    $content .= "\n";
                }
            }
            
            // Clean up
            $spreadsheet->disconnectWorksheets();
            unset($spreadsheet, $reader);
            unlink($tempFile);
            
            return $content;
        } catch (\Exception $e) {
            Log::error("Excel parsing failed for {$filename}: " . $e->getMessage());
            throw new \Exception("Failed to parse Excel file '{$filename}'. Please ensure it's a valid Excel file.");
        }
    }
}