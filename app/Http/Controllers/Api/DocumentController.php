<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Grok\AssetWorkflowService;
use App\Services\GrokApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function generate(
        Request $request,
        GrokApiService $grokApiService,
        AssetWorkflowService $assetWorkflowService,
    ): JsonResponse {
        $validated = $request->validate([
            'prompt' => ['required', 'string', 'max:8000'],
            'format' => ['required', 'string', 'in:word,pdf'],
            'style' => ['nullable', 'string', 'max:80'],
            'document_type' => ['nullable', 'string', 'max:120'],
            'formatting' => ['nullable', 'array'],
            'formatting.font_family' => ['nullable', 'string', 'max:120'],
            'formatting.font_size' => ['nullable', 'integer', 'min:10', 'max:32'],
            'formatting.text_color' => ['nullable', 'string', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'formatting.paper_size' => ['nullable', 'string', 'in:a4,letter,legal'],
            'formatting.paper_theme' => ['nullable', 'string', 'in:light,dark'],
        ]);

        $prompt = trim((string) $validated['prompt']);
        $format = (string) $validated['format'];
        $style = (string) ($validated['style'] ?? 'professional');
        $documentType = $this->normalizeDocumentType((string) ($validated['document_type'] ?? 'general'));

        $title = $this->resolveDocumentTitle($grokApiService, $prompt, $documentType);
        $content = $this->generateMarkdownDraft($grokApiService, $prompt, $style, $documentType);

        $generationPayload = [
            'title' => $title,
            'content' => $content,
            'document_type' => $documentType,
            'design_style' => $style,
            'include_header' => true,
            'include_page_numbers' => true,
            'formatting' => $this->normalizeFormatting($validated['formatting'] ?? []),
        ];

        $file = $format === 'pdf'
            ? $assetWorkflowService->generatePdfDocument($generationPayload)
            : $assetWorkflowService->generateWordDocument($generationPayload);

        return response()->json([
            'success' => true,
            'document' => [
                'id' => (string) Str::ulid(),
                'title' => $title,
                'content' => $content,
                'format' => $format,
                'style' => $style,
                'document_type' => $documentType,
                'formatting' => $this->normalizeFormatting($validated['formatting'] ?? []),
                'file' => $this->formatGeneratedFile($file),
                'created_at' => now()->toISOString(),
            ],
        ], 201);
    }

    public function export(
        Request $request,
        AssetWorkflowService $assetWorkflowService,
    ): JsonResponse {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:50000'],
            'format' => ['required', 'string', 'in:word,pdf'],
            'style' => ['nullable', 'string', 'max:80'],
            'document_type' => ['nullable', 'string', 'max:120'],
            'formatting' => ['nullable', 'array'],
            'formatting.font_family' => ['nullable', 'string', 'max:120'],
            'formatting.font_size' => ['nullable', 'integer', 'min:10', 'max:32'],
            'formatting.text_color' => ['nullable', 'string', 'regex:/^#?[0-9A-Fa-f]{6}$/'],
            'formatting.paper_size' => ['nullable', 'string', 'in:a4,letter,legal'],
            'formatting.paper_theme' => ['nullable', 'string', 'in:light,dark'],
        ]);

        $payload = [
            'title' => trim((string) $validated['title']),
            'content' => trim((string) $validated['content']),
            'document_type' => $this->normalizeDocumentType((string) ($validated['document_type'] ?? 'general')),
            'design_style' => (string) ($validated['style'] ?? 'professional'),
            'include_header' => true,
            'include_page_numbers' => true,
            'formatting' => $this->normalizeFormatting($validated['formatting'] ?? []),
        ];

        $file = $validated['format'] === 'pdf'
            ? $assetWorkflowService->generatePdfDocument($payload)
            : $assetWorkflowService->generateWordDocument($payload);

        return response()->json([
            'success' => true,
            'file' => $this->formatGeneratedFile($file),
        ]);
    }

    private function resolveDocumentTitle(
        GrokApiService $grokApiService,
        string $prompt,
        string $documentType,
    ): string {
        try {
            $title = trim($grokApiService->generateTitle($prompt));
        } catch (\Throwable) {
            $title = '';
        }

        if ($title === '') {
            $title = Str::headline(str_replace('_', ' ', $documentType));
        }

        return Str::limit(trim($title, " \t\n\r\0\x0B\"'"), 120, '');
    }

    private function generateMarkdownDraft(
        GrokApiService $grokApiService,
        string $prompt,
        string $style,
        string $documentType,
    ): string {
        $instruction = <<<PROMPT
Create a complete {$style} {$documentType} in clean Markdown.

Requirements:
- Return only the document body in Markdown.
- Use a clear title, sections, and concise paragraphs.
- Include practical details, structure, and polished wording.
- Do not include code fences.
- Do not explain what you are doing.

User request:
{$prompt}
PROMPT;

        try {
            $content = trim($grokApiService->generateContent($instruction, 'markdown'));
        } catch (\Throwable) {
            $content = '';
        }

        if ($content === '') {
            $fallbackTitle = Str::headline(str_replace('_', ' ', $documentType));

            return implode("\n\n", [
                "# {$fallbackTitle}",
                "## Overview",
                $prompt,
                "## Key Points",
                "- Purpose",
                "- Scope",
                "- Recommendations",
            ]);
        }

        return preg_replace('/^```[a-zA-Z0-9_-]*\s*|\s*```$/m', '', $content) ?: $content;
    }

    private function normalizeDocumentType(string $documentType): string
    {
        $normalized = Str::of($documentType)
            ->lower()
            ->replace(['&', '/'], ' ')
            ->replaceMatches('/[^a-z0-9]+/', '_')
            ->trim('_')
            ->value();

        return $normalized !== '' ? $normalized : 'general';
    }

    private function formatGeneratedFile(array $file): array
    {
        return [
            'url' => $file['url'] ?? null,
            'filename' => $file['filename'] ?? null,
            'mime_type' => $file['mime_type'] ?? null,
            'format' => $file['format'] ?? null,
            'document_type' => $file['document_type'] ?? null,
            'generated_at' => $file['generated_at'] ?? null,
        ];
    }

    private function normalizeFormatting(array $formatting): array
    {
        $fontFamily = trim((string) ($formatting['font_family'] ?? 'Inter'));
        $fontSize = (int) ($formatting['font_size'] ?? 14);
        $textColor = strtoupper(ltrim((string) ($formatting['text_color'] ?? '#F8FAFC'), '#'));
        $paperSize = (string) ($formatting['paper_size'] ?? 'a4');
        $paperTheme = (string) ($formatting['paper_theme'] ?? 'light');
        $paperSize = in_array($paperSize, ['a4', 'letter', 'legal'], true) ? $paperSize : 'a4';
        $paperTheme = in_array($paperTheme, ['light', 'dark'], true) ? $paperTheme : 'light';

        return [
            'font_family' => $fontFamily !== '' ? $fontFamily : 'Inter',
            'font_size' => max(10, min(32, $fontSize)),
            'text_color' => '#' . (preg_match('/^[0-9A-F]{6}$/', $textColor) ? $textColor : 'F8FAFC'),
            'paper_size' => $paperSize,
            'paper_theme' => $paperTheme,
        ];
    }
}
