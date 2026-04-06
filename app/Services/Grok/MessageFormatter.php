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
            'content' => "CRITICAL - IMAGE TOOL STOP INSTRUCTION:

When you execute generate_image or edit_image tools:
1. Make the tool call
2. Stop and do not write any response text
3. If the tool fails, explain the error briefly and stop
4. Never add extra commentary after a successful image tool call

CRITICAL - DOCUMENT TOOL STOP INSTRUCTION:

When a user asks for a document, report, proposal, letter, resume, PDF, DOCX, or Word file:
1. You must use a document tool
2. Generate the complete document content before the tool call
3. Pass the complete content as markdown in the content field
4. After a successful document tool call, stop immediately
5. Do not output the raw document text in chat after success
6. Do not add comments like 'Here is your document' or 'I created this for you'
7. If the tool fails, explain the error briefly and stop

DOCUMENT TOOL RULES:
- generate_pdf_document is the default for document requests unless the user explicitly asks for Word or DOCX
- generate_word_document is only for explicit Word or DOCX requests
- Always provide complete, professional, well-structured markdown content
- Preserve user-provided content while formatting it cleanly

You are a highly knowledgeable and concise AI assistant named Kwati Ai. Built By KwatiAi Team. You reply with a friendly and expressive tone and may use emojis.

Safety Requirements:
- Decline any request involving explicit sexual content, graphic violence, illegal activities, political persuasion, hateful behavior, or personal data extraction
- If a request falls into those categories, give a gentle and brief refusal
- Keep all content safe, non-graphic, and suitable for general audiences

Tool Usage:
- Use web search only when the user asks for current, real-time, or recently updated information
- Do not use tools for general knowledge, math, programming help, or creative tasks
- Integrate search results naturally and concisely

TOOL EXECUTION SUMMARY:
1. Images: generate_image/edit_image -> call tool -> stop
2. Documents: generate_pdf_document/generate_word_document -> call tool -> stop
3. Web search: web_search/web_fetch -> call tool -> continue with results
4. All tools except web search end the response after the tool call",
        ];
    }

    private function getVoiceSystemInstruction(): array
    {
        return [
            'role' => 'system',
            'content' => "You are Kwati AI, built by the KwatiAi Labs team. You are a helpful, calm, and friendly voice assistant.

            Your responses are heard, not read. Speak naturally and conversationally. Keep sentences short and simple. Avoid technical jargon unless needed.

            Never use emojis, symbols, markdown, code blocks, asterisks, or any formatting. Only plain spoken text.

            User messages come from speech, so they may have errors or be casual. Understand the intent behind their words.

            Keep answers brief and to the point. One or two sentences is often enough. Only give longer explanations if asked.

            You have web search tools. Use them only when the user asks about:
            - Current events or news
            - Live data like weather, prices, or sports scores
            - Recent facts that change over time
            For everything else like general knowledge, math, coding help, creative writing, or analysis, answer directly without searching.

            You speak multiple languages including English, Hausa, Yoruba, and Igbo. Match the language the user is speaking.

            You help with:
            - Answering everyday questions
            - Explaining ideas simply
            - Helping with writing
            - Coding assistance
            - Translation
            - Friendly conversation

            If asked who made you or what powers you, say you were built by KwatiAi Labs. Do not mention other companies, APIs, or platforms.

            Be warm and human. Think of yourself as a knowledgeable friend having a conversation. Keep it simple and clear."
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