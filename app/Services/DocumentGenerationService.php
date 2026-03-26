<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Log;

class DocumentGenerationService
{
    private array $formattingOptions = [
        'default' => [
            'font_size' => 12,
            'font_family' => 'Calibri',
            'line_height' => 1.6,
            'margin_top' => 30,
            'margin_bottom' => 20,
            'color_primary' => '#2c3e50',
            'color_secondary' => '#3498db'
        ],
        'business' => [
            'font_size' => 11,
            'font_family' => 'Arial',
            'line_height' => 1.5,
            'color_primary' => '#000000',
            'color_secondary' => '#0056b3'
        ],
        'academic' => [
            'font_size' => 12,
            'font_family' => 'Times New Roman',
            'line_height' => 2.0,
            'color_primary' => '#000000',
            'color_secondary' => '#800000'
        ],
        'creative' => [
            'font_size' => 14,
            'font_family' => 'Georgia',
            'line_height' => 1.8,
            'color_primary' => '#333333',
            'color_secondary' => '#e74c3c'
        ]
    ];

    /**
     * Generate document based on type and content
     */
    public function generateDocument(
        array $arguments,
        ?int $chatId = null,
        ?string $userPreferences = null
    ): array {
        $format = $arguments['format'] ?? 'pdf';
        
        return match ($format) {
            'pdf' => $this->generatePdfDocument($arguments, $chatId, $userPreferences),
            'docx' => $this->generateWordDocument($arguments, $chatId, $userPreferences),
            default => $this->generatePdfDocument($arguments, $chatId, $userPreferences)
        };
    }

    /**
     * Generate PDF document with intelligent content generation
     */
    public function generatePdfDocument(
        array $arguments,
        ?int $chatId = null,
        ?string $userPreferences = null
    ): array {
        try {
            // Extract and process arguments
            $title = $this->generateDocumentTitle($arguments['title'] ?? '', $arguments['content'] ?? '');
            $content = $this->generateIntelligentContent($arguments, $userPreferences);
            $documentType = $arguments['document_type'] ?? 'general';
            $formatting = $this->getFormattingOptions($documentType, $userPreferences);
            
            // Create document structure
            $documentStructure = $this->createDocumentStructure($content, $documentType, $formatting);
            
            // Generate HTML with professional styling
            $html = $this->generatePdfHtml($title, $documentStructure, $formatting, $documentType);
            
            // Create PDF
            $pdf = Pdf::loadHTML($html)
                ->setPaper('A4', 'portrait')
                ->setOption('defaultFont', $formatting['font_family'])
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isRemoteEnabled', true);
            
            // Generate filename and save
            $filename = $this->generateFilename($title, 'pdf');
            $storagePath = 'user-content/documents/' . date('Y/m/d') . '/' . $filename;
            
            Storage::disk('public')->put($storagePath, $pdf->output());
            
            return [
                'success' => true,
                'title' => $title,
                'filename' => $filename,
                'url' => Storage::url($storagePath),
                'storage_path' => $storagePath,
                'format' => 'pdf',
                'document_type' => $documentType,
                'size' => Storage::disk('public')->size($storagePath),
                'timestamp' => now()->toISOString(),
                'preview' => $this->generatePreview($content),
                'metadata' => [
                    'page_count' => $this->estimatePageCount($content),
                    'generated_content_length' => strlen($content),
                    'user_preferences_applied' => !empty($userPreferences)
                ]
            ];
            
        } catch (\Exception $e) {
            Log::error('PDF document generation error: ' . $e->getMessage());
            throw new \Exception('Failed to generate PDF: ' . $e->getMessage());
        }
    }

    /**
     * Generate Word document with intelligent content
     */
    public function generateWordDocument(
        array $arguments,
        ?int $chatId = null,
        ?string $userPreferences = null
    ): array {
        try {
            $title = $this->generateDocumentTitle($arguments['title'] ?? '', $arguments['content'] ?? '');
            $content = $this->generateIntelligentContent($arguments, $userPreferences);
            $documentType = $arguments['document_type'] ?? 'general';
            $formatting = $this->getFormattingOptions($documentType, $userPreferences);
            
            // Create Word document
            $phpWord = new PhpWord();
            $properties = $phpWord->getDocInfo();
            $properties->setCreator('Kwati AI');
            $properties->setCompany('KwatiAi Labs');
            $properties->setTitle($title);
            $properties->setDescription("Generated by Kwati AI");
            
            // Add sections with intelligent formatting
            $section = $phpWord->addSection();
            $this->addWordContent($section, $title, $content, $formatting, $documentType);
            
            // Save document
            $tempPath = tempnam(sys_get_temp_dir(), 'doc_') . '.docx';
            $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
            $objWriter->save($tempPath);
            
            // Save to storage
            $filename = $this->generateFilename($title, 'docx');
            $storagePath = 'user-content/documents/' . date('Y/m/d') . '/' . $filename;
            
            Storage::disk('public')->put($storagePath, file_get_contents($tempPath));
            unlink($tempPath);
            
            return [
                'success' => true,
                'title' => $title,
                'filename' => $filename,
                'url' => Storage::url($storagePath),
                'storage_path' => $storagePath,
                'format' => 'docx',
                'document_type' => $documentType,
                'size' => Storage::disk('public')->size($storagePath),
                'timestamp' => now()->toISOString()
            ];
            
        } catch (\Exception $e) {
            Log::error('Word document generation error: ' . $e->getMessage());
            throw new \Exception('Failed to generate Word document: ' . $e->getMessage());
        }
    }

    /**
     * Generate intelligent content based on user request and preferences
     */
    private function generateIntelligentContent(array $arguments, ?string $userPreferences = null): string
    {
        $userContent = $arguments['content'] ?? '';
        $documentType = $arguments['document_type'] ?? 'general';
        $additionalParams = $arguments['additional_params'] ?? [];
        
        // If user provides content, enhance it based on document type
        if (!empty($userContent)) {
            return $this->enhanceUserContent($userContent, $documentType, $userPreferences);
        }
        
        // Otherwise generate content based on title/description
        return $this->generateContentFromTitle(
            $arguments['title'] ?? 'Document',
            $documentType,
            $additionalParams,
            $userPreferences
        );
    }

    /**
     * Enhance user-provided content with proper structure
     */
    private function enhanceUserContent(string $content, string $documentType, ?string $preferences = null): string
    {
        // Convert markdown to structured content
        $structuredContent = Str::markdown($content);
        
        // Add document-type specific enhancements
        $structuredContent = $this->addDocumentTypeElements($structuredContent, $documentType);
        
        // Apply user preferences if available
        if ($preferences) {
            $structuredContent = $this->applyUserPreferences($structuredContent, $preferences);
        }
        
        return $structuredContent;
    }

    /**
     * Add document type specific elements
     */
    private function addDocumentTypeElements(string $content, string $documentType): string
    {
        $enhancedContent = $content;
        
        switch ($documentType) {
            case 'business':
                $enhancedContent = $this->addBusinessElements($content);
                break;
            case 'academic':
                $enhancedContent = $this->addAcademicElements($content);
                break;
            case 'resume':
                $enhancedContent = $this->addResumeElements($content);
                break;
            case 'report':
                $enhancedContent = $this->addReportElements($content);
                break;
        }
        
        return $enhancedContent;
    }

    /**
     * Add business elements to content
     */
    private function addBusinessElements(string $content): string
    {
        $enhancedContent = $content;
        
        // Ensure there's an executive summary
        if (!preg_match('/##?\s*(Executive Summary|Abstract)/i', $content)) {
            $enhancedContent = "## Executive Summary\n" . 
                "This document provides a comprehensive overview and analysis. " .
                "It outlines key findings, recommendations, and strategic insights.\n\n" .
                $enhancedContent;
        }
        
        // Add recommendations section if not present
        if (!preg_match('/##?\s*(Recommendations|Next Steps|Action Items)/i', $content)) {
            $enhancedContent .= "\n\n## Recommendations\n" .
                "Based on the analysis presented in this document, the following recommendations are proposed:\n" .
                "- Implement strategic initiatives as outlined\n" .
                "- Monitor progress and adjust as necessary\n" .
                "- Establish clear metrics for success measurement";
        }
        
        // Add conclusion if not present
        if (!preg_match('/##?\s*(Conclusion|Summary)/i', $content)) {
            $enhancedContent .= "\n\n## Conclusion\n" .
                "This document provides a comprehensive analysis with actionable insights. " .
                "The recommendations presented offer a clear path forward for achieving the desired outcomes.";
        }
        
        return $enhancedContent;
    }

    /**
     * Add academic elements to content
     */
    private function addAcademicElements(string $content): string
    {
        $enhancedContent = $content;
        
        // Add abstract if not present
        if (!preg_match('/##?\s*(Abstract)/i', $content)) {
            $enhancedContent = "## Abstract\n" .
                "This paper presents a comprehensive analysis and discussion of the topic. " .
                "It includes methodology, findings, and conclusions based on thorough research.\n\n" .
                $enhancedContent;
        }
        
        // Add references section placeholder
        if (!preg_match('/##?\s*(References|Bibliography)/i', $content)) {
            $enhancedContent .= "\n\n## References\n" .
                "1. Author, A. (Year). *Title of the work*. Publisher.\n" .
                "2. Researcher, B. (Year). \"Article Title.\" *Journal Name*, Volume(Issue), pages.\n" .
                "3. Expert, C. (Year). *Book Title* (Edition). Publishing Company.";
        }
        
        // Ensure proper section numbering
        $enhancedContent = preg_replace_callback(
            '/##\s+(.+)/',
            function($matches) {
                static $sectionCount = 0;
                $sectionCount++;
                return "## {$sectionCount}.0 {$matches[1]}";
            },
            $enhancedContent
        );
        
        // Add methodology section if it seems like research
        if (preg_match('/(research|study|analysis)/i', $content) && 
            !preg_match('/##?\s*(Methodology|Methods)/i', $content)) {
            $enhancedContent = preg_replace(
                '/(##\s+.*?(?=##|$))/s',
                "$1\n\n## Methodology\n" .
                "This research employed a mixed-methods approach, combining qualitative and quantitative analysis " .
                "to ensure comprehensive understanding of the subject matter.",
                $enhancedContent
            );
        }
        
        return $enhancedContent;
    }

    /**
     * Add resume elements to content
     */
    private function addResumeElements(string $content): string
    {
        $enhancedContent = $content;
        
        // Ensure there's a professional summary
        if (!preg_match('/##?\s*(Professional Summary|Profile|Objective)/i', $content)) {
            $enhancedContent = "## Professional Summary\n" .
                "Experienced professional with a proven track record of success. " .
                "Skilled in relevant areas with strong problem-solving abilities and excellent communication skills.\n\n" .
                $enhancedContent;
        }
        
        // Add skills section if not present
        if (!preg_match('/##?\s*(Skills|Technical Skills|Core Competencies)/i', $content)) {
            $enhancedContent .= "\n\n## Skills\n" .
                "### Technical Skills\n" .
                "- Programming Languages: Relevant languages\n" .
                "- Tools & Technologies: Industry-standard tools\n" .
                "- Methodologies: Agile, Scrum, etc.\n\n" .
                "### Professional Skills\n" .
                "- Leadership & Management\n" .
                "- Communication & Collaboration\n" .
                "- Problem Solving & Analysis";
        }
        
        // Add experience section structure if missing
        if (!preg_match('/##?\s*(Experience|Work History)/i', $content)) {
            $enhancedContent = preg_replace(
                '/(##\s+.*?(?=##|$))/s',
                "$1\n\n## Work Experience\n" .
                "### Position Title\n" .
                "*Company Name* | *Date Range*\n" .
                "- Key achievement or responsibility 1\n" .
                "- Key achievement or responsibility 2\n" .
                "- Key achievement or responsibility 3",
                $enhancedContent
            );
        }
        
        // Add education section if not present
        if (!preg_match('/##?\s*(Education|Qualifications)/i', $content)) {
            $enhancedContent .= "\n\n## Education\n" .
                "### Degree Name\n" .
                "*University Name* | *Graduation Year*\n" .
                "- Relevant coursework or honors\n" .
                "- GPA or academic achievements if notable";
        }
        
        return $enhancedContent;
    }

    /**
     * Add report elements to content
     */
    private function addReportElements(string $content): string
    {
        $enhancedContent = $content;
        
        // Ensure there's an introduction
        if (!preg_match('/##?\s*(Introduction|Overview)/i', $content)) {
            $enhancedContent = "## Introduction\n" .
                "This report provides a comprehensive analysis and overview of the subject matter. " .
                "It aims to present findings, analysis, and recommendations based on thorough examination.\n\n" .
                $enhancedContent;
        }
        
        // Add table of contents if it's a long document
        $lines = explode("\n", $content);
        $headingCount = 0;
        foreach ($lines as $line) {
            if (preg_match('/^##?\s+/', $line)) {
                $headingCount++;
            }
        }
        
        if ($headingCount > 3 && !preg_match('/##?\s*(Table of Contents|Contents)/i', $content)) {
            $toc = "## Table of Contents\n\n";
            foreach ($lines as $line) {
                if (preg_match('/^##\s+(.+)/', $line, $matches)) {
                    $toc .= "1. {$matches[1]}\n";
                }
            }
            $enhancedContent = $toc . "\n" . $enhancedContent;
        }
        
        // Add findings/analysis section if not present but content suggests it
        if (!preg_match('/##?\s*(Findings|Analysis|Results)/i', $content) && 
            preg_match('/(data|analysis|result|finding)/i', $content)) {
            $enhancedContent = preg_replace(
                '/(##\s+.*?(?=##|$))/s',
                "$1\n\n## Findings & Analysis\n" .
                "The analysis reveals key insights and patterns. " .
                "These findings provide a foundation for the recommendations that follow.",
                $enhancedContent
            );
        }
        
        // Add conclusion if not present
        if (!preg_match('/##?\s*(Conclusion|Summary)/i', $content)) {
            $enhancedContent .= "\n\n## Conclusion\n" .
                "This report has presented a detailed analysis of the subject. " .
                "The findings highlight important considerations and opportunities for action.";
        }
        
        // Add recommendations if not present
        if (!preg_match('/##?\s*(Recommendations|Next Steps)/i', $content)) {
            $enhancedContent .= "\n\n## Recommendations\n" .
                "Based on the analysis presented, the following actions are recommended:\n" .
                "1. Implement the primary strategy\n" .
                "2. Establish monitoring mechanisms\n" .
                "3. Review progress regularly";
        }
        
        return $enhancedContent;
    }

    /**
     * Generate content from title when no content is provided
     */
    private function generateContentFromTitle(
        string $title,
        string $documentType,
        array $params = [],
        ?string $preferences = null
    ): string {
        $template = $this->getDocumentTemplate($documentType);
        
        // Fill template with dynamic content
        $content = $this->fillTemplate($template, [
            'title' => $title,
            'date' => date('F j, Y'),
            'year' => date('Y'),
            ...$params
        ]);
        
        // Apply preferences
        if ($preferences) {
            $content = $this->applyUserPreferences($content, $preferences);
        }
        
        return $content;
    }

    /**
     * Apply user preferences to content
     */
    private function applyUserPreferences(string $content, string $preferences): string
    {
        try {
            $prefs = json_decode($preferences, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                // Apply JSON preferences
                if (isset($prefs['tone'])) {
                    $content = $this->adjustTone($content, $prefs['tone']);
                }
                if (isset($prefs['length'])) {
                    $content = $this->adjustLength($content, $prefs['length']);
                }
                if (isset($prefs['style'])) {
                    $content = $this->adjustStyle($content, $prefs['style']);
                }
            }
        } catch (\Exception $e) {
            Log::debug('Could not parse user preferences: ' . $e->getMessage());
        }
        
        return $content;
    }

    /**
     * Adjust tone of content
     */
    private function adjustTone(string $content, string $tone): string
    {
        switch (strtolower($tone)) {
            case 'formal':
                // Replace informal language with formal equivalents
                $replacements = [
                    "don't" => "do not",
                    "can't" => "cannot",
                    "won't" => "will not",
                    "it's" => "it is",
                    "that's" => "that is",
                    "I'm" => "I am",
                    "you're" => "you are",
                    "they're" => "they are",
                    "we're" => "we are"
                ];
                $content = str_ireplace(array_keys($replacements), array_values($replacements), $content);
                $content = preg_replace('/\b(got|gotten)\b/i', 'obtained', $content);
                $content = preg_replace('/\b(awesome|great|cool)\b/i', 'excellent', $content);
                break;
                
            case 'casual':
                // Make content more conversational
                $content = preg_replace('/It is recommended that/i', 'We suggest', $content);
                $content = preg_replace('/One should consider/i', 'You might want to think about', $content);
                $content = preg_replace('/Upon examination/i', 'Looking at', $content);
                break;
                
            case 'technical':
                // Add technical precision
                $content = preg_replace('/\b(said|told)\b/i', 'stated', $content);
                $content = preg_replace('/\b(show|demonstrate)\b/i', 'illustrate', $content);
                $content = preg_replace('/\b(see|look at)\b/i', 'observe', $content);
                break;
                
            case 'persuasive':
                // Make content more persuasive
                $content = preg_replace('/\b(is|are)\b/i', 'truly is', $content);
                $content = preg_replace('/\b(can)\b/i', 'has the capability to', $content);
                $content = preg_replace('/\b(important)\b/i', 'crucial', $content);
                break;
        }
        
        return $content;
    }

    /**
     * Adjust length of content
     */
    private function adjustLength(string $content, string $length): string
    {
        $wordCount = str_word_count($content);
        $targetWords = 0;
        
        switch (strtolower($length)) {
            case 'brief':
                $targetWords = min(300, $wordCount);
                break;
            case 'detailed':
                $targetWords = max(800, $wordCount);
                // Add more detail
                $content = $this->addDetail($content);
                break;
            case 'comprehensive':
                $targetWords = max(1500, $wordCount);
                // Add comprehensive detail
                $content = $this->addComprehensiveDetail($content);
                break;
        }
        
        // If we need to shorten, do it intelligently
        if ($targetWords > 0 && $targetWords < $wordCount) {
            $content = $this->shortenContent($content, $targetWords);
        }
        
        return $content;
    }

    /**
     * Adjust style of content
     */
    private function adjustStyle(string $content, string $style): string
    {
        switch (strtolower($style)) {
            case 'bullet_points':
                // Convert paragraphs to bullet points where appropriate
                $content = preg_replace('/(\.\s+)([A-Z][^\.]+\.)/', "$1- $2", $content);
                break;
                
            case 'paragraphs':
                // Ensure proper paragraph structure
                $content = preg_replace('/\n\s*\n/', "\n\n", $content);
                break;
                
            case 'numbered':
                // Convert lists to numbered lists
                $content = preg_replace('/^-\s+/m', '1. ', $content);
                break;
        }
        
        return $content;
    }

    /**
     * Add detail to content
     */
    private function addDetail(string $content): string
    {
        $enhanced = $content;
        
        // Look for key sections and add more detail
        $sections = ['methodology', 'analysis', 'findings', 'results'];
        
        foreach ($sections as $section) {
            if (preg_match("/##\s*{$section}/i", $content)) {
                $detail = "\n\nAdditional detailed examination reveals further insights that support the primary conclusions. " .
                         "This includes specific data points, extended analysis, and supporting evidence that " .
                         "strengthens the overall argument and findings presented.";
                
                $enhanced = preg_replace(
                    "/(##\s*{$section}.*?)(?=##|$)/is",
                    "$1{$detail}",
                    $enhanced
                );
            }
        }
        
        return $enhanced;
    }

    /**
     * Add comprehensive detail to content
     */
    private function addComprehensiveDetail(string $content): string
    {
        $enhanced = $content;
        
        // Add comprehensive sections
        $sectionsToAdd = [
            'Background Context' => "This section provides essential historical and contextual information necessary for complete understanding.",
            'Methodological Details' => "Detailed explanation of the methods employed, including rationale, procedures, and validation techniques.",
            'Data Analysis' => "Comprehensive statistical analysis with supporting tables, charts, and explanatory commentary.",
            'Comparative Analysis' => "Comparison with relevant benchmarks, standards, or alternative approaches.",
            'Limitations' => "Discussion of study limitations and their potential impact on findings.",
            'Future Research' => "Suggestions for future research directions and unanswered questions."
        ];
        
        foreach ($sectionsToAdd as $section => $description) {
            if (!preg_match("/##\s*" . preg_quote($section, '/') . "/i", $content)) {
                $enhanced .= "\n\n## {$section}\n{$description}";
            }
        }
        
        return $enhanced;
    }

    /**
     * Shorten content to target word count
     */
    private function shortenContent(string $content, int $targetWords): string
    {
        $words = preg_split('/\s+/', $content);
        $currentWords = count($words);
        
        if ($currentWords <= $targetWords) {
            return $content;
        }
        
        // Remove less important sections first
        $sectionsToReduce = ['appendix', 'acknowledgments', 'additional notes', 'background context'];
        
        foreach ($sectionsToReduce as $section) {
            if (preg_match("/(##\s*{$section}.*?##\s*)/is", $content, $matches)) {
                $sectionContent = $matches[1];
                $sectionWords = str_word_count($sectionContent);
                if ($currentWords - $sectionWords >= $targetWords * 0.8) {
                    $content = str_replace($sectionContent, '', $content);
                    $currentWords -= $sectionWords;
                }
            }
        }
        
        // If still too long, trim each paragraph
        if ($currentWords > $targetWords) {
            $paragraphs = explode("\n\n", $content);
            $trimmedParagraphs = [];
            
            foreach ($paragraphs as $paragraph) {
                $paraWords = str_word_count($paragraph);
                if ($paraWords > 100) {
                    // Trim long paragraphs
                    $words = explode(' ', $paragraph);
                    $paragraph = implode(' ', array_slice($words, 0, 80)) . '...';
                }
                $trimmedParagraphs[] = $paragraph;
            }
            
            $content = implode("\n\n", $trimmedParagraphs);
        }
        
        return $content;
    }

    /**
     * Create document structure with sections
     */
    private function createDocumentStructure(string $content, string $documentType, array $formatting): array
    {
        $structure = [];
        
        // Parse markdown to extract sections
        $lines = explode("\n", $content);
        $currentSection = [];
        $sectionLevel = 0;
        
        foreach ($lines as $line) {
            $trimmedLine = trim($line);
            
            if (empty($trimmedLine)) {
                continue;
            }
            
            // Detect headings
            if (str_starts_with($trimmedLine, '# ')) {
                if (!empty($currentSection)) {
                    $structure[] = $currentSection;
                }
                $currentSection = [
                    'type' => 'heading1',
                    'content' => substr($trimmedLine, 2),
                    'level' => 1
                ];
            } elseif (str_starts_with($trimmedLine, '## ')) {
                if (!empty($currentSection)) {
                    $structure[] = $currentSection;
                }
                $currentSection = [
                    'type' => 'heading2',
                    'content' => substr($trimmedLine, 3),
                    'level' => 2
                ];
            } elseif (str_starts_with($trimmedLine, '### ')) {
                if (!empty($currentSection)) {
                    $structure[] = $currentSection;
                }
                $currentSection = [
                    'type' => 'heading3',
                    'content' => substr($trimmedLine, 4),
                    'level' => 3
                ];
            } else {
                if (isset($currentSection['type'])) {
                    // Add content to existing section
                    if (!isset($currentSection['paragraphs'])) {
                        $currentSection['paragraphs'] = [];
                    }
                    $currentSection['paragraphs'][] = $trimmedLine;
                } else {
                    // Start new paragraph section
                    $currentSection = [
                        'type' => 'paragraph',
                        'content' => $trimmedLine
                    ];
                }
            }
        }
        
        if (!empty($currentSection)) {
            $structure[] = $currentSection;
        }
        
        return $structure;
    }

    /**
     * Generate PDF HTML with professional styling
     */
    private function generatePdfHtml(string $title, array $structure, array $formatting, string $documentType): string
    {
        $css = $this->generatePdfCss($formatting, $documentType);
        
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>' . htmlspecialchars($title) . '</title>
            <style>' . $css . '</style>
        </head>
        <body>
            <div class="document-container">
                <header class="document-header">
                    <h1 class="document-title">' . htmlspecialchars($title) . '</h1>
                    <div class="document-meta">
                        <span class="generated-date">Generated on ' . date('F j, Y') . '</span>
                        <span class="document-type">' . ucfirst($documentType) . ' Document</span>
                    </div>
                </header>
                <main class="document-content">';
        
        foreach ($structure as $section) {
            $html .= $this->renderSection($section, $formatting);
        }
        
        $html .= '</main>
                <footer class="document-footer">
                    <div class="footer-content">
                        <div class="page-number">Page <span class="page"></span></div>
                        <div class="copyright">© ' . date('Y') . ' Kwati AI - Generated with KwatiAi</div>
                    </div>
                </footer>
            </div>
            <script>
                // Add page numbers
                var pages = document.querySelectorAll(".page");
                for (var i = 0; i < pages.length; i++) {
                    pages[i].textContent = (i + 1);
                }
            </script>
        </body>
        </html>';
        
        return $html;
    }

    /**
     * Generate PDF CSS
     */
    private function generatePdfCss(array $formatting, string $documentType): string
    {
        return '
            body { 
                font-family: ' . $formatting['font_family'] . '; 
                font-size: ' . $formatting['font_size'] . 'pt; 
                line-height: ' . $formatting['line_height'] . '; 
                color: ' . $formatting['color_primary'] . ';
                margin: 0;
                padding: 0;
            }
            .document-container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 40px;
            }
            .document-header {
                border-bottom: 2px solid ' . $formatting['color_secondary'] . ';
                margin-bottom: 30px;
                padding-bottom: 20px;
            }
            .document-title {
                color: ' . $formatting['color_primary'] . ';
                font-size: ' . ($formatting['font_size'] + 8) . 'pt;
                margin: 0 0 10px 0;
                font-weight: bold;
            }
            .document-meta {
                display: flex;
                justify-content: space-between;
                color: #666;
                font-size: ' . ($formatting['font_size'] - 2) . 'pt;
            }
            h1 { 
                font-size: ' . ($formatting['font_size'] + 8) . 'pt; 
                color: ' . $formatting['color_primary'] . ';
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 2px solid ' . $formatting['color_secondary'] . ';
                padding-bottom: 5px;
            }
            h2 { 
                font-size: ' . ($formatting['font_size'] + 4) . 'pt; 
                color: ' . $formatting['color_primary'] . ';
                margin-top: 25px;
                margin-bottom: 12px;
            }
            h3 { 
                font-size: ' . ($formatting['font_size'] + 2) . 'pt; 
                color: #7f8c8d;
                margin-top: 20px;
                margin-bottom: 10px;
            }
            p {
                margin-bottom: 15px;
                text-align: justify;
            }
            ul, ol {
                margin-left: 20px;
                margin-bottom: 15px;
            }
            li {
                margin-bottom: 5px;
            }
            .document-footer {
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: ' . ($formatting['font_size'] - 2) . 'pt;
                color: #666;
            }
            .footer-content {
                display: flex;
                justify-content: space-between;
            }
        ';
    }

    /**
     * Get document templates
     */
    private function getDocumentTemplate(string $type): string
    {
        $templates = [
            'business' => '# {title}

## Executive Summary
This document outlines the key business considerations and strategic approach for {title}. 

## Background
Provide context and background information relevant to this document.

## Objectives
- Primary objective 1
- Primary objective 2
- Supporting objectives

## Methodology
Describe the approach, methods, and techniques used.

## Findings/Analysis
Present the key findings, data analysis, and insights.

## Recommendations
Based on the analysis, provide actionable recommendations.

## Conclusion
Summarize the key points and next steps.

## Appendices
Include any supporting materials or references.',
            
            'report' => '# {title}

## Report Overview
This report provides a comprehensive analysis of {title}.

## Table of Contents
1. Introduction
2. Methodology
3. Findings
4. Analysis
5. Conclusions
6. Recommendations

## 1. Introduction
Background and purpose of this report.

## 2. Methodology
How this report was prepared and the sources used.

## 3. Findings
Key findings from the research or analysis.

## 4. Analysis
Detailed analysis of the findings.

## 5. Conclusions
Conclusions drawn from the analysis.

## 6. Recommendations
Specific recommendations for action.',
            
            'resume' => '# {title}

## Professional Summary
Experienced professional with expertise in relevant field.

## Work Experience
### Position Title
*Company Name* | *Dates*
- Key accomplishment 1
- Key accomplishment 2
- Key accomplishment 3

## Education
### Degree Name
*Institution Name* | *Graduation Year*
- Relevant coursework or honors

## Skills
- Skill category 1: Skill 1, Skill 2, Skill 3
- Skill category 2: Skill 1, Skill 2, Skill 3

## Certifications
- Certification 1 | Issuing Organization | Year
- Certification 2 | Issuing Organization | Year',
            
            'academic' => '# {title}

## Abstract
Brief summary of the document\'s content and findings.

## 1.0 Introduction
### 1.1 Background
Context and background information.

### 1.2 Problem Statement
The problem being addressed.

### 1.3 Objectives
The objectives of this work.

## 2.0 Literature Review
Review of relevant literature and previous work.

## 3.0 Methodology
Detailed description of methods used.

## 4.0 Results
Presentation of results and findings.

## 5.0 Discussion
Analysis and interpretation of results.

## 6.0 Conclusion
Summary of findings and implications.

## References
List of cited works.

## Appendices
Additional supporting materials.'
        ];
        
        return $templates[$type] ?? $templates['business'];
    }

    /**
     * Fill template with data
     */
    private function fillTemplate(string $template, array $data): string
    {
        foreach ($data as $key => $value) {
            $template = str_replace('{' . $key . '}', $value, $template);
        }
        return $template;
    }

    /**
     * Add Word content with proper formatting
     */
    private function addWordContent($section, string $title, string $content, array $formatting, string $documentType): void
    {
        // Add title
        $section->addTitle($title, 0);
        $section->addTextBreak(2);
        
        // Convert markdown to Word content
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            $trimmed = trim($line);
            
            if (empty($trimmed)) {
                $section->addTextBreak(1);
                continue;
            }
            
            if (str_starts_with($trimmed, '# ')) {
                $section->addTitle(substr($trimmed, 2), 1);
            } elseif (str_starts_with($trimmed, '## ')) {
                $section->addTitle(substr($trimmed, 3), 2);
            } elseif (str_starts_with($trimmed, '### ')) {
                $section->addTitle(substr($trimmed, 4), 3);
            } else {
                $section->addText($trimmed);
            }
        }
    }

    /**
     * Generate filename
     */
    private function generateFilename(string $title, string $extension): string
    {
        $slug = Str::slug($title);
        $timestamp = time();
        return "{$slug}_{$timestamp}.{$extension}";
    }

    /**
     * Generate document title
     */
    private function generateDocumentTitle(string $userTitle, string $content): string
    {
        if (!empty($userTitle)) {
            return $userTitle;
        }
        
        // Extract title from content if possible
        $lines = explode("\n", $content);
        foreach ($lines as $line) {
            if (str_starts_with($line, '# ')) {
                return substr($line, 2);
            }
        }
        
        return 'Document_' . date('Y-m-d_H-i-s');
    }

    /**
     * Get formatting options
     */
    private function getFormattingOptions(string $documentType, ?string $userPreferences = null): array
    {
        $options = $this->formattingOptions[$documentType] ?? $this->formattingOptions['default'];
        
        if ($userPreferences) {
            try {
                $prefs = json_decode($userPreferences, true);
                if (isset($prefs['formatting'])) {
                    $options = array_merge($options, $prefs['formatting']);
                }
            } catch (\Exception $e) {
                // Use default options if preferences can't be parsed
            }
        }
        
        return $options;
    }

    /**
     * Render section for HTML
     */
    private function renderSection(array $section, array $formatting): string
    {
        $html = '';
        
        switch ($section['type']) {
            case 'heading1':
                $html = '<h1>' . htmlspecialchars($section['content']) . '</h1>';
                break;
            case 'heading2':
                $html = '<h2>' . htmlspecialchars($section['content']) . '</h2>';
                break;
            case 'heading3':
                $html = '<h3>' . htmlspecialchars($section['content']) . '</h3>';
                break;
            case 'paragraph':
                $html = '<p>' . nl2br(htmlspecialchars($section['content'])) . '</p>';
                break;
            default:
                if (isset($section['paragraphs'])) {
                    foreach ($section['paragraphs'] as $paragraph) {
                        $html .= '<p>' . nl2br(htmlspecialchars($paragraph)) . '</p>';
                    }
                }
        }
        
        return $html;
    }

    /**
     * Estimate page count
     */
    private function estimatePageCount(string $content): int
    {
        $wordCount = str_word_count(strip_tags($content));
        return max(1, ceil($wordCount / 500)); // ~500 words per page
    }

    /**
     * Generate preview
     */
    private function generatePreview(string $content): string
    {
        $plainText = strip_tags($content);
        return Str::limit($plainText, 200);
    }
}