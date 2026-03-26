<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PageContentExplainerController extends Controller
{
    /**
     * Explain page content based on user query
     */
    public function explainPageContent(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'query' => 'required|string|max:1000',
                'pageContent' => 'required|array',
                'pageContent.title' => 'string',
                'pageContent.subtitle' => 'string',
                'pageContent.sections' => 'array',
                'pageContent.headings' => 'array',
                'pageContent.paragraphs' => 'array',
                'pageContent.rawText' => 'string',
            ]);

            $query = $validated['query'];
            $pageContent = $validated['pageContent'];

            // Generate explanation using AI
            $explanation = $this->generateExplanation($query, $pageContent);

            return response()->json([
                'summary' => $explanation['summary'],
                'keyPoints' => $explanation['keyPoints'],
                'contentType' => $explanation['contentType'],
                'importance' => $explanation['importance'],
                'relatedSections' => $explanation['relatedSections'],
            ]);
        } catch (\Exception $e) {
            return response()->json(
                ['error' => $e->getMessage()],
                422
            );
        }
    }

    /**
     * Generate explanation from page content
     */
    private function generateExplanation(string $query, array $pageContent): array
    {
        $title = $pageContent['title'] ?? 'Unknown';
        $subtitle = $pageContent['subtitle'] ?? '';
        $headings = $pageContent['headings'] ?? [];
        $sections = $pageContent['sections'] ?? [];
        $paragraphs = $pageContent['paragraphs'] ?? [];

        // Determine what the user is asking about
        $queryLower = strtolower($query);

        // Get relevant sections
        $relevantSections = $this->findRelevantSections($query, $sections, $headings);
        $keyPoints = $this->extractKeyPoints($query, $headings, $paragraphs);

        // Generate summary based on query type
        $summary = $this->generateSummaryResponse($query, $title, $subtitle, $keyPoints, $relevantSections);

        return [
            'summary' => $summary,
            'keyPoints' => array_slice($keyPoints, 0, 5),
            'contentType' => $this->detectContentType($pageContent),
            'importance' => $this->evaluateImportance($query, $relevantSections),
            'relatedSections' => array_slice($relevantSections, 0, 3),
        ];
    }

    /**
     * Find sections related to the query
     */
    private function findRelevantSections(string $query, array $sections, array $headings): array
    {
        $queryTerms = array_filter(explode(' ', strtolower($query)));
        $relevant = [];

        foreach ($headings as $heading) {
            $headingText = strtolower($heading['text'] ?? '');
            $matches = 0;

            foreach ($queryTerms as $term) {
                if (strlen($term) > 3 && strpos($headingText, $term) !== false) {
                    $matches++;
                }
            }

            if ($matches > 0) {
                $relevant[] = $heading['text'];
            }
        }

        return !empty($relevant) ? $relevant : array_slice(array_column($headings, 'text'), 0, 3);
    }

    /**
     * Extract key points from content
     */
    private function extractKeyPoints(string $query, array $headings, array $paragraphs): array
    {
        // Use headings as key points if they're relevant
        $points = array_column($headings, 'text');

        // If query is asking for a summary, include first few paragraphs
        if (stripos($query, 'summar') !== false) {
            $shortParagraphs = array_filter(
                $paragraphs,
                fn($p) => strlen($p) > 50 && strlen($p) < 300
            );
            $points = array_merge($points, array_slice($shortParagraphs, 0, 3));
        }

        return array_slice(array_unique($points), 0, 8);
    }

    /**
     * Generate response based on query
     */
    private function generateSummaryResponse(
        string $query,
        string $title,
        string $subtitle,
        array $keyPoints,
        array $relatedSections
    ): string {
        $queryLower = strtolower($query);

        // Summarize the page
        if (stripos($queryLower, 'summar') !== false || stripos($queryLower, 'what') !== false) {
            $summary = "📄 **{$title}**\n\n";

            if ($subtitle) {
                $summary .= "{$subtitle}\n\n";
            }

            $summary .= "**Key Topics:**\n";
            foreach (array_slice($keyPoints, 0, 5) as $point) {
                if (strlen($point) > 0) {
                    $summary .= "• " . $point . "\n";
                }
            }

            return $summary;
        }

        // Explain specific section
        if (stripos($queryLower, 'explain') !== false || stripos($queryLower, 'how') !== false) {
            $summary = "📖 **Explanation**\n\n";
            $summary .= "Based on the page structure, here are the relevant sections:\n\n";

            foreach (array_slice($relatedSections, 0, 3) as $section) {
                $summary .= "• **" . $section . "**\n";
            }

            $summary .= "\nThe page covers these topics in detail. Each section provides specific information you can use.";

            return $summary;
        }

        // Default response
        $summary = "✨ **Page Content Analysis**\n\n";
        $summary .= "This page discusses: " . implode(', ', array_slice($keyPoints, 0, 3)) . "\n\n";
        $summary .= "**Key Sections:**\n";
        foreach (array_slice($relatedSections, 0, 3) as $section) {
            $summary .= "• " . $section . "\n";
        }

        return $summary;
    }

    /**
     * Detect the type of content on the page
     */
    private function detectContentType(array $pageContent): string
    {
        $title = strtolower($pageContent['title'] ?? '');
        $subtitle = strtolower($pageContent['subtitle'] ?? '');
        $text = $title . ' ' . $subtitle;

        if (stripos($text, 'doc') !== false) {
            return 'documentation';
        } elseif (stripos($text, 'guide') !== false) {
            return 'guide';
        } elseif (stripos($text, 'tutorial') !== false) {
            return 'tutorial';
        } elseif (stripos($text, 'api') !== false) {
            return 'api-reference';
        } elseif (stripos($text, 'faq') !== false) {
            return 'faq';
        }

        return 'general-content';
    }

    /**
     * Evaluate importance based on query and content
     */
    private function evaluateImportance(string $query, array $relatedSections): string
    {
        $hasRelated = !empty($relatedSections);

        if (stripos($query, 'important') !== false || stripos($query, 'critical') !== false) {
            return 'high';
        } elseif (stripos($query, 'nice') !== false || stripos($query, 'optional') !== false) {
            return 'low';
        }

        return $hasRelated ? 'medium' : 'low';
    }
}
