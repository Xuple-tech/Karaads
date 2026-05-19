<?php

namespace App\Services;

use App\Models\PresentationTemplate;
use App\Models\TemplateSlide;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use ZipArchive;

class PowerPointTemplateImportService
{
    public function __construct(
        private readonly GoogleSlidesTemplateService $googleSlidesTemplateService,
    ) {}

    private const DEFAULT_SLIDE_WIDTH = 9144000;

    private const DEFAULT_SLIDE_HEIGHT = 5143500;

    public function importFromStoredFile(PresentationTemplate $template): void
    {
        if (!$template->source_file_path) {
            return;
        }

        $absolutePath = Storage::disk('public')->path($template->source_file_path);

        if (!is_file($absolutePath)) {
            return;
        }

        Storage::disk('public')->deleteDirectory($this->assetDirectory($template));
        Storage::disk('public')->deleteDirectory($this->previewDirectory($template));

        $import = $this->parsePptxSlides($absolutePath, $template);
        $slides = $import['slides'];
        $googleSlidesImport = $this->googleSlidesTemplateService->importPowerPointAsGoogleSlides($template, $absolutePath);
        $previewImages = $this->previewImagesFromGoogleImport($googleSlidesImport)
            ?: $this->generateRenderedPreviewImages($absolutePath, $template);

        foreach ($slides as $index => &$slide) {
            if (isset($previewImages[$index + 1])) {
                $slide['canvas_settings']['preview_image_url'] = $previewImages[$index + 1];
            }
            if ($googleSlidesImport && isset($googleSlidesImport['slide_previews'][$index])) {
                $slide['canvas_settings']['google_page_object_id'] = $googleSlidesImport['slide_previews'][$index]['page_object_id'] ?? null;
            }
        }
        unset($slide);

        $template->slides()->delete();

        foreach ($slides as $index => $slide) {
            TemplateSlide::create([
                'presentation_template_id' => $template->id,
                'title' => $slide['title'],
                'position' => $index + 1,
                'layout' => $slide['layout'],
                'summary' => $slide['summary'],
                'canvas_settings' => $slide['canvas_settings'],
                'elements' => $slide['elements'],
            ]);
        }

        $template->update([
            'slides_count' => count($slides),
            'preview_image_url' => $previewImages[1] ?? null,
            'color_palette' => $import['color_palette'],
            'theme_config' => [
                'primary' => $import['color_palette'][0] ?? '#0F172A',
                'secondary' => $import['color_palette'][1] ?? '#2563EB',
                'accent' => $import['color_palette'][2] ?? '#06B6D4',
                'surface' => $import['color_palette'][3] ?? '#F8FAFC',
            ],
            'structure' => [
                'slides' => collect($slides)->pluck('title')->all(),
                'source' => 'uploaded_powerpoint',
                'asset_summary' => $import['asset_summary'],
                'dimensions' => $import['dimensions'],
                'google_slides' => $googleSlidesImport ? [
                    'presentation_id' => $googleSlidesImport['presentation_id'] ?? null,
                    'drive_file_id' => $googleSlidesImport['drive_file_id'] ?? null,
                    'web_view_link' => $googleSlidesImport['web_view_link'] ?? null,
                    'thumbnail_source' => 'google_slides_api',
                ] : null,
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>|null  $googleSlidesImport
     * @return array<int, string>
     */
    private function previewImagesFromGoogleImport(?array $googleSlidesImport): array
    {
        if (!$googleSlidesImport || !isset($googleSlidesImport['slide_previews']) || !is_array($googleSlidesImport['slide_previews'])) {
            return [];
        }

        $images = [];
        foreach ($googleSlidesImport['slide_previews'] as $index => $preview) {
            $url = $preview['preview_image_url'] ?? null;
            if (is_string($url) && $url !== '') {
                $images[$index + 1] = $url;
            }
        }

        return $images;
    }

    /**
     * @return array<int, string>
     */
    private function generateRenderedPreviewImages(string $absolutePath, PresentationTemplate $template): array
    {
        $tempRoot = storage_path('app/tmp/ppt-preview-' . Str::uuid()->toString());
        $outputDir = $tempRoot . '/rendered';

        if (!is_dir($outputDir) && !mkdir($outputDir, 0777, true) && !is_dir($outputDir)) {
            return [];
        }

        try {
            $pdfProcess = new Process([
                'soffice',
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                $outputDir,
                $absolutePath,
            ]);
            $pdfProcess->setTimeout(120);
            $pdfProcess->run();

            if (!$pdfProcess->isSuccessful()) {
                return [];
            }

            $pdfFiles = glob($outputDir . '/*.pdf') ?: [];
            $pdfPath = $pdfFiles[0] ?? null;

            if (!$pdfPath || !is_file($pdfPath)) {
                return [];
            }

            $prefix = $outputDir . '/slide-preview';
            $pngProcess = new Process([
                'pdftoppm',
                '-png',
                '-r',
                '144',
                $pdfPath,
                $prefix,
            ]);
            $pngProcess->setTimeout(120);
            $pngProcess->run();

            if (!$pngProcess->isSuccessful()) {
                return [];
            }

            $images = [];
            $renderedFiles = glob($outputDir . '/slide-preview-*.png') ?: [];
            sort($renderedFiles, SORT_NATURAL);

            foreach ($renderedFiles as $index => $filePath) {
                $storedPath = $this->previewDirectory($template) . '/slide-' . ($index + 1) . '.png';
                Storage::disk('public')->put($storedPath, file_get_contents($filePath));
                $images[$index + 1] = Storage::disk('public')->url($storedPath);
            }

            return $images;
        } catch (\Throwable) {
            return [];
        } finally {
            $this->deleteDirectory($tempRoot);
        }
    }

    /**
     * @return array{slides: array<int, array<string, mixed>>, color_palette: array<int, string>, asset_summary: array<string, mixed>, dimensions: array<string, int>}
     */
    private function parsePptxSlides(string $absolutePath, PresentationTemplate $template): array
    {
        $zip = new ZipArchive();
        if ($zip->open($absolutePath) !== true) {
            return $this->fallbackImport($template);
        }

        $dimensions = $this->presentationDimensions($zip);
        $colorPalette = $this->themePalette($zip, $template);
        $assetSummary = [
            'images' => 0,
            'charts' => 0,
            'text_blocks' => 0,
            'shape_blocks' => 0,
        ];

        $slideFiles = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (preg_match('#^ppt/slides/slide(\d+)\.xml$#', $name, $matches)) {
                $slideFiles[(int) $matches[1]] = $name;
            }
        }
        ksort($slideFiles);

        $slides = [];

        foreach ($slideFiles as $position => $fileName) {
            $xml = $zip->getFromName($fileName);
            if (!is_string($xml) || trim($xml) === '') {
                continue;
            }

            $document = $this->loadXml($xml);
            if (!$document) {
                continue;
            }

            $xpath = $this->makeXPath($document);
            $relationships = $this->slideRelationships($zip, $fileName);

            $textElements = $this->extractTextElements($xpath, $dimensions);
            $imageElements = $this->extractImageElements($xpath, $relationships, $zip, $template, $dimensions, $position);
            $chartElements = $this->extractChartElements($xpath, $relationships, $zip, $dimensions);
            $shapeElements = $this->extractShapeElements($xpath, $dimensions, $colorPalette);

            $elements = array_values([
                ...$textElements,
                ...$imageElements,
                ...$chartElements,
                ...$shapeElements,
            ]);

            usort($elements, fn (array $left, array $right) => ($left['y'] ?? 0) <=> ($right['y'] ?? 0));

            $title = $textElements[0]['content']['text'] ?? "Slide {$position}";
            $summaryLines = collect($textElements)
                ->skip(1)
                ->map(fn (array $element) => trim((string) ($element['content']['text'] ?? '')))
                ->filter()
                ->take(6)
                ->values()
                ->all();

            $summary = implode("\n", $summaryLines);

            $assetSummary['images'] += count($imageElements);
            $assetSummary['charts'] += count($chartElements);
            $assetSummary['text_blocks'] += count($textElements);
            $assetSummary['shape_blocks'] += count($shapeElements);

            $slides[] = [
                'title' => Str::limit($title, 140, ''),
                'summary' => $summary !== '' ? $summary : 'Imported from uploaded PowerPoint template.',
                'layout' => $position === 1 ? 'hero' : 'content-grid',
                'canvas_settings' => [
                    'background' => $this->backgroundFor($colorPalette, $position - 1),
                    'grid' => false,
                    'source' => 'uploaded_powerpoint',
                    'dimensions' => $dimensions,
                ],
                'elements' => $elements !== [] ? $elements : $this->fallbackElements($title, $template->description ?: 'Imported PowerPoint slide content.', $colorPalette, $position - 1),
            ];
        }

        $zip->close();

        if ($slides === []) {
            return $this->fallbackImport($template);
        }

        return [
            'slides' => $slides,
            'color_palette' => $colorPalette,
            'asset_summary' => $assetSummary,
            'dimensions' => $dimensions,
        ];
    }

    private function loadXml(string $xml): ?DOMDocument
    {
        $document = new DOMDocument();

        return @$document->loadXML($xml) ? $document : null;
    }

    private function makeXPath(DOMDocument $document): DOMXPath
    {
        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main');
        $xpath->registerNamespace('p', 'http://schemas.openxmlformats.org/presentationml/2006/main');
        $xpath->registerNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
        $xpath->registerNamespace('c', 'http://schemas.openxmlformats.org/drawingml/2006/chart');

        return $xpath;
    }

    /**
     * @return array{width: int, height: int}
     */
    private function presentationDimensions(ZipArchive $zip): array
    {
        $xml = $zip->getFromName('ppt/presentation.xml');
        if (!is_string($xml)) {
            return ['width' => self::DEFAULT_SLIDE_WIDTH, 'height' => self::DEFAULT_SLIDE_HEIGHT];
        }

        $document = $this->loadXml($xml);
        if (!$document) {
            return ['width' => self::DEFAULT_SLIDE_WIDTH, 'height' => self::DEFAULT_SLIDE_HEIGHT];
        }

        $xpath = $this->makeXPath($document);
        $node = $xpath->query('//p:sldSz')->item(0);

        if (!$node instanceof DOMElement) {
            return ['width' => self::DEFAULT_SLIDE_WIDTH, 'height' => self::DEFAULT_SLIDE_HEIGHT];
        }

        return [
            'width' => (int) ($node->getAttribute('cx') ?: self::DEFAULT_SLIDE_WIDTH),
            'height' => (int) ($node->getAttribute('cy') ?: self::DEFAULT_SLIDE_HEIGHT),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function themePalette(ZipArchive $zip, PresentationTemplate $template): array
    {
        $xml = $zip->getFromName('ppt/theme/theme1.xml');
        if (!is_string($xml)) {
            return $template->color_palette ?: ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC'];
        }

        $document = $this->loadXml($xml);
        if (!$document) {
            return $template->color_palette ?: ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC'];
        }

        $xpath = $this->makeXPath($document);
        $scheme = $xpath->query('//a:clrScheme')->item(0);
        if (!$scheme instanceof DOMElement) {
            return $template->color_palette ?: ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC'];
        }

        $colors = [];
        foreach (['dk1', 'lt1', 'accent1', 'accent2', 'accent3', 'accent4'] as $name) {
            $node = $xpath->query("./a:{$name}/*", $scheme)->item(0);
            if (!$node instanceof DOMElement) {
                continue;
            }

            $value = $node->getAttribute('val');
            if ($value === '') {
                continue;
            }

            $colors[] = str_starts_with($value, '#') ? $value : "#{$value}";
        }

        return $colors !== [] ? array_values(array_unique($colors)) : ($template->color_palette ?: ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC']);
    }

    /**
     * @return array<string, string>
     */
    private function slideRelationships(ZipArchive $zip, string $slideFileName): array
    {
        $baseName = basename($slideFileName);
        $relsPath = "ppt/slides/_rels/{$baseName}.rels";
        $xml = $zip->getFromName($relsPath);

        if (!is_string($xml)) {
            return [];
        }

        $document = $this->loadXml($xml);
        if (!$document) {
            return [];
        }

        $xpath = new DOMXPath($document);
        $relationships = [];

        foreach ($xpath->query('/*[local-name()="Relationships"]/*[local-name()="Relationship"]') ?: [] as $node) {
            if (!$node instanceof DOMElement) {
                continue;
            }

            $id = $node->getAttribute('Id');
            $target = $node->getAttribute('Target');

            if ($id !== '' && $target !== '') {
                $relationships[$id] = $this->normalizeSlideTarget($target);
            }
        }

        return $relationships;
    }

    private function normalizeSlideTarget(string $target): string
    {
        $target = str_replace('\\', '/', $target);

        if (str_starts_with($target, '../')) {
            return 'ppt/' . ltrim(substr($target, 3), '/');
        }

        if (str_starts_with($target, '/')) {
            return ltrim($target, '/');
        }

        return 'ppt/slides/' . ltrim($target, '/');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function extractTextElements(DOMXPath $xpath, array $dimensions): array
    {
        $elements = [];

        foreach ($xpath->query('//p:sp') ?: [] as $index => $shape) {
            if (!$shape instanceof DOMElement) {
                continue;
            }

            $text = collect($xpath->query('.//a:t', $shape) ?: [])
                ->map(fn ($node) => trim((string) $node->textContent))
                ->filter()
                ->implode("\n");

            if ($text === '') {
                continue;
            }

            $frame = $this->nodeFrame($xpath, $shape, $dimensions);
            $fontSize = $this->shapeFontSize($xpath, $shape, $index === 0 ? 30 : 18);

            $elements[] = [
                'type' => $index === 0 ? 'heading' : 'text',
                'name' => $index === 0 ? 'Imported heading' : 'Imported text',
                'x' => $frame['x'],
                'y' => $frame['y'],
                'width' => $frame['width'],
                'height' => $frame['height'],
                'style' => [
                    'fontSize' => $fontSize,
                    'fontWeight' => $index === 0 ? 700 : 500,
                    'lineHeight' => 1.45,
                    'color' => '#F8FAFC',
                ],
                'content' => ['text' => $text],
            ];
        }

        return $elements;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function extractImageElements(
        DOMXPath $xpath,
        array $relationships,
        ZipArchive $zip,
        PresentationTemplate $template,
        array $dimensions,
        int $slidePosition,
    ): array {
        $elements = [];

        foreach ($xpath->query('//a:blip[@r:embed]') ?: [] as $index => $blip) {
            if (!$blip instanceof DOMElement) {
                continue;
            }

            $embedId = $blip->getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
            if (!$embedId || !isset($relationships[$embedId])) {
                continue;
            }

            $target = $relationships[$embedId];
            $binary = $zip->getFromName($target);

            if (!is_string($binary)) {
                continue;
            }

            $container = $this->nearestSlideShape($blip);
            if (!$container) {
                continue;
            }

            $assetPath = $this->storeExtractedAsset($template, $slidePosition, $index, $target, $binary);
            $frame = $this->nodeFrame($xpath, $container, $dimensions);

            $elements[] = [
                'type' => 'image',
                'name' => 'Imported image',
                'x' => $frame['x'],
                'y' => $frame['y'],
                'width' => $frame['width'],
                'height' => $frame['height'],
                'style' => [
                    'borderRadius' => 24,
                    'shadow' => '0 18px 40px rgba(0,0,0,0.18)',
                ],
                'content' => [
                    'src' => Storage::disk('public')->url($assetPath),
                ],
            ];
        }

        return $elements;
    }

    private function nearestSlideShape(DOMElement $node): ?DOMElement
    {
        $current = $node->parentNode;

        while ($current instanceof DOMElement) {
            if ($current->namespaceURI === 'http://schemas.openxmlformats.org/presentationml/2006/main'
                && in_array($current->localName, ['pic', 'sp', 'graphicFrame'], true)) {
                return $current;
            }

            $current = $current->parentNode;
        }

        return null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function extractChartElements(DOMXPath $xpath, array $relationships, ZipArchive $zip, array $dimensions): array
    {
        $elements = [];

        foreach ($xpath->query('//c:chart') ?: [] as $index => $chart) {
            if (!$chart instanceof DOMElement) {
                continue;
            }

            $relationshipId = $chart->getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
            if ($relationshipId === '' || !isset($relationships[$relationshipId])) {
                continue;
            }

            $target = $relationships[$relationshipId];
            $chartXml = $zip->getFromName($target);

            if (!is_string($chartXml)) {
                continue;
            }

            $parsedChart = $this->parseChartXml($chartXml);
            if (!$parsedChart) {
                continue;
            }

            $graphicFrame = $chart->parentNode?->parentNode?->parentNode;
            $frame = $graphicFrame instanceof DOMElement
                ? $this->nodeFrame($xpath, $graphicFrame, $dimensions)
                : ['x' => 540, 'y' => 160, 'width' => 320, 'height' => 220];

            $elements[] = [
                'type' => 'chart',
                'name' => 'Imported chart',
                'x' => $frame['x'],
                'y' => $frame['y'],
                'width' => $frame['width'],
                'height' => $frame['height'],
                'style' => [
                    'background' => 'rgba(255,255,255,0.08)',
                    'borderColor' => 'rgba(255,255,255,0.16)',
                    'shape' => 'rounded-rectangle',
                ],
                'content' => $parsedChart,
            ];
        }

        return $elements;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function extractShapeElements(DOMXPath $xpath, array $dimensions, array $palette): array
    {
        $elements = [];
        $primaryAccent = $palette[1] ?? '#2563EB';
        $secondaryAccent = $palette[2] ?? '#06B6D4';

        foreach ($xpath->query('//p:sp[p:spPr/a:prstGeom]') ?: [] as $shape) {
            if (!$shape instanceof DOMElement) {
                continue;
            }

            $isImageFill = ($xpath->query('.//a:blip', $shape)?->length ?? 0) > 0;
            if ($isImageFill) {
                continue;
            }

            $hasText = ($xpath->query('.//a:t', $shape)?->length ?? 0) > 0;
            if ($hasText) {
                continue;
            }

            $frame = $this->nodeFrame($xpath, $shape, $dimensions);
            $shapeName = $xpath->query('.//a:prstGeom/@prst', $shape)?->item(0)?->nodeValue ?: 'rect';

            if ($frame['width'] < 32 || $frame['height'] < 32) {
                continue;
            }

            $elements[] = [
                'type' => 'shape',
                'name' => 'Imported shape',
                'x' => $frame['x'],
                'y' => $frame['y'],
                'width' => $frame['width'],
                'height' => $frame['height'],
                'style' => [
                    'shape' => $shapeName === 'ellipse' ? 'circle' : 'rounded-rectangle',
                    'background' => "linear-gradient(135deg, {$primaryAccent}CC, {$secondaryAccent}AA)",
                    'borderColor' => 'rgba(255,255,255,0.12)',
                    'color' => '#FFFFFF',
                ],
                'content' => ['text' => ''],
            ];
        }

        return $elements;
    }

    /**
     * @return array{x: int, y: int, width: int, height: int}
     */
    private function nodeFrame(DOMXPath $xpath, DOMElement $node, array $dimensions): array
    {
        $off = $xpath->query('.//a:xfrm/a:off | .//p:xfrm/a:off', $node)?->item(0);
        $ext = $xpath->query('.//a:xfrm/a:ext | .//p:xfrm/a:ext', $node)?->item(0);

        $x = $off instanceof DOMElement ? (int) $off->getAttribute('x') : 0;
        $y = $off instanceof DOMElement ? (int) $off->getAttribute('y') : 0;
        $cx = $ext instanceof DOMElement ? (int) $ext->getAttribute('cx') : (int) ($dimensions['width'] * 0.3);
        $cy = $ext instanceof DOMElement ? (int) $ext->getAttribute('cy') : (int) ($dimensions['height'] * 0.12);

        return [
            'x' => $this->scaleCoordinate($x, $dimensions['width'], 960),
            'y' => $this->scaleCoordinate($y, $dimensions['height'], 540),
            'width' => max(80, $this->scaleCoordinate($cx, $dimensions['width'], 960)),
            'height' => max(48, $this->scaleCoordinate($cy, $dimensions['height'], 540)),
        ];
    }

    private function scaleCoordinate(int $value, int $sourceMax, int $targetMax): int
    {
        if ($sourceMax <= 0) {
            return $value;
        }

        return (int) round(($value / $sourceMax) * $targetMax);
    }

    private function shapeFontSize(DOMXPath $xpath, DOMElement $shape, int $fallback): int
    {
        $size = $xpath->query('.//a:rPr/@sz | .//a:defRPr/@sz', $shape)?->item(0)?->nodeValue;

        return $size ? max(14, (int) round(((int) $size) / 100)) : $fallback;
    }

    private function storeExtractedAsset(PresentationTemplate $template, int $slidePosition, int $index, string $target, string $binary): string
    {
        $extension = pathinfo($target, PATHINFO_EXTENSION) ?: 'bin';
        $filename = "slide-{$slidePosition}-asset-{$index}." . strtolower($extension);
        $path = $this->assetDirectory($template) . '/' . $filename;

        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    private function assetDirectory(PresentationTemplate $template): string
    {
        return 'presentation-templates/imported-assets/' . $template->id;
    }

    private function previewDirectory(PresentationTemplate $template): string
    {
        return 'presentation-templates/rendered-previews/' . $template->id;
    }

    private function deleteDirectory(string $path): void
    {
        if (!is_dir($path)) {
            return;
        }

        $items = scandir($path);
        if ($items === false) {
            return;
        }

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $fullPath = $path . DIRECTORY_SEPARATOR . $item;
            if (is_dir($fullPath)) {
                $this->deleteDirectory($fullPath);
            } elseif (is_file($fullPath)) {
                @unlink($fullPath);
            }
        }

        @rmdir($path);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseChartXml(string $xml): ?array
    {
        $document = $this->loadXml($xml);
        if (!$document) {
            return null;
        }

        $xpath = $this->makeXPath($document);
        $plotArea = $xpath->query('//c:plotArea/*')->item(0);

        if (!$plotArea instanceof DOMElement) {
            return null;
        }

        $type = $plotArea->localName;
        $labels = [];
        $series = [];

        foreach ($xpath->query('.//c:ser', $plotArea) ?: [] as $seriesIndex => $ser) {
            if (!$ser instanceof DOMElement) {
                continue;
            }

            $name = $xpath->query('./c:tx//c:v', $ser)?->item(0)?->nodeValue ?: 'Series ' . ($seriesIndex + 1);
            $cats = collect($xpath->query('./c:cat//c:v', $ser) ?: [])
                ->map(fn ($node) => trim((string) $node->textContent))
                ->filter()
                ->values()
                ->all();
            $vals = collect($xpath->query('./c:val//c:v', $ser) ?: [])
                ->map(fn ($node) => (float) $node->textContent)
                ->values()
                ->all();

            if ($labels === [] && $cats !== []) {
                $labels = $cats;
            }

            $series[] = [
                'name' => $name,
                'data' => $vals,
            ];
        }

        if ($series === []) {
            return null;
        }

        return [
            'chartType' => $this->normalizeChartType($type),
            'labels' => $labels,
            'series' => $series,
        ];
    }

    private function normalizeChartType(string $type): string
    {
        return match ($type) {
            'barChart' => 'bar',
            'lineChart' => 'line',
            'pieChart' => 'pie',
            'areaChart' => 'area',
            default => 'bar',
        };
    }

    private function backgroundFor(array $palette, int $index): string
    {
        $palette = $palette !== [] ? $palette : ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC'];
        $first = $palette[$index % count($palette)] ?? '#0F172A';
        $second = $palette[($index + 1) % count($palette)] ?? '#2563EB';

        return "linear-gradient(135deg, {$first} 0%, {$second} 100%)";
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function fallbackElements(string $title, string $body, array $palette, int $index): array
    {
        $primaryAccent = $palette[1] ?? '#2563EB';
        $secondaryAccent = $palette[2] ?? '#06B6D4';

        return [
            [
                'type' => 'heading',
                'name' => 'Imported heading',
                'x' => 72,
                'y' => 74,
                'width' => 640,
                'height' => 96,
                'style' => ['fontSize' => $index === 0 ? 42 : 34, 'fontWeight' => 700, 'color' => '#F8FAFC'],
                'content' => ['text' => $title],
            ],
            [
                'type' => 'text',
                'name' => 'Imported body',
                'x' => 76,
                'y' => 188,
                'width' => 560,
                'height' => 220,
                'style' => ['fontSize' => 18, 'lineHeight' => 1.6, 'color' => '#E2E8F0'],
                'content' => ['text' => $body],
            ],
            [
                'type' => 'shape',
                'name' => 'Imported accent card',
                'x' => 684,
                'y' => 130,
                'width' => 188,
                'height' => 240,
                'style' => [
                    'shape' => 'rounded-rectangle',
                    'background' => "linear-gradient(135deg, {$primaryAccent}CC, {$secondaryAccent}CC)",
                    'borderColor' => 'rgba(255,255,255,0.18)',
                    'color' => '#FFFFFF',
                ],
                'content' => ['text' => ''],
            ],
        ];
    }

    /**
     * @return array{slides: array<int, array<string, mixed>>, color_palette: array<int, string>, asset_summary: array<string, mixed>, dimensions: array<string, int>}
     */
    private function fallbackImport(PresentationTemplate $template): array
    {
        $colorPalette = $template->color_palette ?: ['#0F172A', '#2563EB', '#06B6D4', '#F8FAFC'];

        return [
            'slides' => [[
                'title' => $template->name,
                'summary' => $template->description ?: 'Uploaded PowerPoint template imported without readable slide text.',
                'layout' => 'hero',
                'canvas_settings' => [
                    'background' => $this->backgroundFor($colorPalette, 0),
                    'grid' => false,
                    'source' => 'uploaded_powerpoint',
                    'dimensions' => ['width' => self::DEFAULT_SLIDE_WIDTH, 'height' => self::DEFAULT_SLIDE_HEIGHT],
                ],
                'elements' => $this->fallbackElements($template->name, $template->description ?: 'Uploaded PowerPoint template', $colorPalette, 0),
            ]],
            'color_palette' => $colorPalette,
            'asset_summary' => [
                'images' => 0,
                'charts' => 0,
                'text_blocks' => 2,
                'shape_blocks' => 1,
            ],
            'dimensions' => ['width' => self::DEFAULT_SLIDE_WIDTH, 'height' => self::DEFAULT_SLIDE_HEIGHT],
        ];
    }
}
