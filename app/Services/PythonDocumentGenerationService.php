<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpPresentation\DocumentLayout;
use PhpOffice\PhpPresentation\IOFactory;
use PhpOffice\PhpPresentation\PhpPresentation;
use PhpOffice\PhpPresentation\Shape\AutoShape;
use PhpOffice\PhpPresentation\Shape\Chart\Legend;
use PhpOffice\PhpPresentation\Shape\Chart\Series;
use PhpOffice\PhpPresentation\Shape\Chart\Type\AbstractTypeBar;
use PhpOffice\PhpPresentation\Shape\Chart\Type\Bar;
use PhpOffice\PhpPresentation\Shape\Chart\Type\Pie;
use PhpOffice\PhpPresentation\Shape\Drawing\Base64 as Base64Drawing;
use PhpOffice\PhpPresentation\Shape\RichText;
use PhpOffice\PhpPresentation\Slide\Background\Color as BackgroundColor;
use PhpOffice\PhpPresentation\Style\Alignment;
use PhpOffice\PhpPresentation\Style\Bullet;
use PhpOffice\PhpPresentation\Style\Color;
use PhpOffice\PhpPresentation\Style\Fill;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class PythonDocumentGenerationService
{
    public function buildInteractivePresentationFromMarkdown(
        string $title,
        string $contentMarkdown,
        string $documentType = 'general',
        array $options = [],
    ): array {
        $designStyles = $this->resolvePresentationDesignStyles(
            $options['design_styles'] ?? $options['design_style'] ?? $options['design'] ?? 'template_real',
            $options['design_description'] ?? null,
        );

        $slides = $this->presentationSlidesFromMarkdown($title, $contentMarkdown);
        $titleTheme = $this->titleTheme($designStyles);

        return [
            'design_style' => $this->summarizeDesignStyles($designStyles),
            'design_styles' => $designStyles,
            'theme' => $this->themeForInteractiveUi($titleTheme),
            'slides' => array_merge([
                $this->buildInteractiveTitleSlideBlueprint($title, $documentType, $titleTheme),
            ], collect($slides)
                ->values()
                ->map(fn (array $slide, int $index) => $this->buildInteractiveContentSlideBlueprint($slide, $index, $designStyles))
                ->all()),
        ];
    }

    public function generateDocument(
        string $title,
        string $contentMarkdown,
        string $format,
        string $documentType = 'general',
        array $options = [],
    ): array {
        $normalizedFormat = strtolower($format);

        if (!in_array($normalizedFormat, ['pdf', 'docx', 'pptx'], true)) {
            throw new \InvalidArgumentException("Unsupported document format [{$format}]");
        }

        if ($normalizedFormat === 'pptx') {
            return $this->generatePresentation($title, $contentMarkdown, $documentType, $options);
        }

        $this->bootstrapVirtualEnvIfNeeded();

        $payload = [
            'title' => $title,
            'content_markdown' => $contentMarkdown,
            'format' => $normalizedFormat,
            'document_type' => $documentType,
            'options' => $options,
        ];

        $process = new Process([
            $this->resolvePythonExecutable(),
            $this->entrypoint(),
            '--stdin',
        ], base_path());

        $process->setInput(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        $process->setTimeout($this->timeout());

        try {
            $process->mustRun();
        } catch (ProcessTimedOutException $exception) {
            throw new \RuntimeException('Python document generator timed out.');
        } catch (\Throwable $exception) {
            $message = trim($process->getErrorOutput()) ?: $exception->getMessage();
            throw new \RuntimeException('Python document generator failed: ' . $message);
        }

        $decoded = json_decode(trim($process->getOutput()), true);

        if (!is_array($decoded)) {
            throw new \RuntimeException('Python document generator returned invalid JSON.');
        }

        if (!($decoded['success'] ?? false)) {
            throw new \RuntimeException($decoded['error'] ?? 'Python document generation failed.');
        }

        $outputPath = $decoded['output_path'] ?? null;
        if (!is_string($outputPath) || $outputPath === '' || !is_file($outputPath)) {
            throw new \RuntimeException('Python document generator did not return a valid output file.');
        }

        $filename = $decoded['filename'] ?? $this->defaultFilename($title, $normalizedFormat);
        $storagePath = 'user-content/documents/' . now()->format('Y/m/d') . '/' . $filename;

        Storage::disk('public')->put($storagePath, file_get_contents($outputPath));
        @unlink($outputPath);

        return [
            'success' => true,
            'title' => $title,
            'format' => $normalizedFormat,
            'filename' => $filename,
            'url' => Storage::url($storagePath),
            'path' => $storagePath,
            'mime_type' => $decoded['mime_type'] ?? $this->mimeTypeFor($normalizedFormat),
            'size' => Storage::disk('public')->size($storagePath),
            'document_type' => $documentType,
            'generated_at' => now()->toISOString(),
        ];
    }

    private function resolvePythonExecutable(): string
    {
        $configured = (string) config('document_generation.python_binary', 'py');
        $venvPath = (string) config('document_generation.venv_path', '');

        if ($configured !== '' && $configured !== 'py') {
            return $configured;
        }

        if ($venvPath !== '') {
            $candidate = DIRECTORY_SEPARATOR === '\\'
                ? $venvPath . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe'
                : $venvPath . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'python';

            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return $configured;
    }

    private function bootstrapVirtualEnvIfNeeded(): void
    {
        if (!config('document_generation.bootstrap', false)) {
            return;
        }

        $venvPath = (string) config('document_generation.venv_path', '');
        if ($venvPath === '') {
            return;
        }

        $pythonExecutable = DIRECTORY_SEPARATOR === '\\'
            ? $venvPath . DIRECTORY_SEPARATOR . 'Scripts' . DIRECTORY_SEPARATOR . 'python.exe'
            : $venvPath . DIRECTORY_SEPARATOR . 'bin' . DIRECTORY_SEPARATOR . 'python';

        if (is_file($pythonExecutable)) {
            return;
        }

        $script = DIRECTORY_SEPARATOR === '\\'
            ? base_path('_services/docgen/bootstrap.ps1')
            : base_path('_services/docgen/bootstrap.sh');

        if (!is_file($script)) {
            return;
        }

        $command = DIRECTORY_SEPARATOR === '\\'
            ? ['powershell', '-ExecutionPolicy', 'Bypass', '-File', $script]
            : ['sh', $script];

        $process = new Process($command, base_path());
        $process->setTimeout($this->timeout());
        $process->mustRun();
    }

    private function entrypoint(): string
    {
        return (string) config('document_generation.entrypoint', base_path('_services/docgen/main.py'));
    }

    private function timeout(): float
    {
        return (float) config('document_generation.timeout', 120);
    }

    private function defaultFilename(string $title, string $format): string
    {
        return 'document_' . Str::slug($title) . '_' . Str::lower(Str::random(8)) . '.' . $format;
    }

    private function mimeTypeFor(string $format): string
    {
        return match ($format) {
            'pdf' => 'application/pdf',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            default => 'application/octet-stream',
        };
    }

    private function generatePresentation(string $title, string $contentMarkdown, string $documentType, array $options = []): array
    {
        $designStyles = $this->resolvePresentationDesignStyles(
            $options['design_styles'] ?? $options['design_style'] ?? $options['design'] ?? 'template_real',
            $options['design_description'] ?? null,
        );
        $designStyle = $this->summarizeDesignStyles($designStyles);
        $logo = $this->normalizeLogoImage($options['logo_image'] ?? null);
        $logoPosition = $this->normalizeLogoPosition((string) ($options['logo_position'] ?? 'top_right'));
        $presentation = new PhpPresentation();
        $presentation->getLayout()->setDocumentLayout(DocumentLayout::LAYOUT_SCREEN_16X9);
        $presentation->getDocumentProperties()
            ->setCreator((string) config('app.name', 'KWati AI'))
            ->setTitle($title)
            ->setSubject($documentType);

        $slides = $this->presentationSlidesFromMarkdown($title, $contentMarkdown);
        $this->fillTitleSlide($presentation->getSlide(0), $title, $documentType, $designStyles, $logo, $logoPosition);

        foreach ($slides as $index => $slideData) {
            $this->fillContentSlide($presentation->createSlide(), $slideData['title'], $slideData['items'], $index, $designStyles, $logo, $logoPosition);
        }

        $outputPath = tempnam(sys_get_temp_dir(), 'kwati-presentation-') . '.pptx';
        IOFactory::createWriter($presentation, 'PowerPoint2007')->save($outputPath);

        $filename = $this->defaultFilename($title, 'pptx');
        $storagePath = 'user-content/documents/' . now()->format('Y/m/d') . '/' . $filename;

        Storage::disk('public')->put($storagePath, file_get_contents($outputPath));
        @unlink($outputPath);

        return [
            'success' => true,
            'title' => $title,
            'format' => 'pptx',
            'filename' => $filename,
            'url' => Storage::url($storagePath),
            'path' => $storagePath,
            'mime_type' => $this->mimeTypeFor('pptx'),
            'size' => Storage::disk('public')->size($storagePath),
            'document_type' => $documentType,
            'design_style' => $designStyle,
            'design_styles' => $designStyles,
            'design_description' => $options['design_description'] ?? null,
            'has_logo' => $logo !== null,
            'generated_at' => now()->toISOString(),
        ];
    }

    private function buildInteractiveTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        if (($theme['template'] ?? null) === 'template_real') {
            return $this->buildInteractiveTemplateRealTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'sgmms_proposal') {
            return $this->buildInteractiveSgmmsTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'business_blue') {
            return $this->buildInteractiveBusinessBlueTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'boardroom') {
            return $this->buildInteractiveBoardroomTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'editorial') {
            return $this->buildInteractiveEditorialTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'tech_grid') {
            return $this->buildInteractiveTechGridTitleSlideBlueprint($title, $documentType, $theme);
        }

        if (($theme['template'] ?? null) === 'financial_clean') {
            return $this->buildInteractiveFinancialTitleSlideBlueprint($title, $documentType, $theme);
        }

        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'AI Presentation';

        return [
            'title' => $title,
            'layout' => 'hero',
            'speaker_notes' => "Introduce {$title}, explain the purpose of the deck, and prepare the audience for the story ahead.",
            'canvas_settings' => [
                'background' => $this->themeToGradient($theme, true),
                'grid' => false,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Hero accent band',
                    'position' => 1,
                    'x' => 0,
                    'y' => 0,
                    'width' => 960,
                    'height' => 88,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => [
                        'shape' => 'rectangle',
                        'background' => $this->themeColor($theme['primary']),
                        'borderColor' => 'transparent',
                    ],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Hero title',
                    'position' => 2,
                    'x' => 72,
                    'y' => 148,
                    'width' => 620,
                    'height' => 120,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 44, 'fontWeight' => 700, 'color' => '#F8FAFC'],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Hero subtitle',
                    'position' => 3,
                    'x' => 76,
                    'y' => 292,
                    'width' => 340,
                    'height' => 54,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 14, 'fontWeight' => 600, 'color' => '#D7E6F5'],
                    'content' => ['text' => Str::upper($subtitle)],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Hero side card',
                    'position' => 4,
                    'x' => 704,
                    'y' => 118,
                    'width' => 188,
                    'height' => 280,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => [
                        'shape' => 'rounded-rectangle',
                        'background' => 'linear-gradient(180deg, '
                            . $this->themeColor($theme['accent']) . ', '
                            . $this->themeColor($theme['dark']) . ')',
                        'borderColor' => 'rgba(255,255,255,0.16)',
                        'color' => '#FFFFFF',
                    ],
                    'content' => ['text' => "KWATI\nSlides"],
                ],
            ],
        ];
    }

    private function buildInteractiveContentSlideBlueprint(array $slide, int $index, array $designStyles): array
    {
        $theme = $this->slideTheme($index, $designStyles);

        if (($theme['template'] ?? null) === 'template_real') {
            return $this->buildInteractiveTemplateRealContentSlideBlueprint($slide, $theme);
        }

        if (($theme['template'] ?? null) === 'sgmms_proposal') {
            return $this->buildInteractiveSgmmsContentSlideBlueprint($slide, $theme, $index);
        }

        if (($theme['template'] ?? null) === 'business_blue') {
            return $this->buildInteractiveBusinessBlueContentSlideBlueprint($slide, $theme, $index);
        }

        if (($theme['template'] ?? null) === 'boardroom') {
            return $this->buildInteractiveBoardroomContentSlideBlueprint($slide, $theme, $index);
        }

        if (($theme['template'] ?? null) === 'editorial') {
            return $this->buildInteractiveEditorialContentSlideBlueprint($slide, $theme, $index);
        }

        if (($theme['template'] ?? null) === 'tech_grid') {
            return $this->buildInteractiveTechGridContentSlideBlueprint($slide, $theme, $index);
        }

        if (($theme['template'] ?? null) === 'financial_clean') {
            return $this->buildInteractiveFinancialContentSlideBlueprint($slide, $theme, $index);
        }

        $chart = $this->chartFromSlideContent((string) ($slide['title'] ?? 'Slide'), $slide['items'] ?? []);
        $summaryText = collect($slide['items'] ?? [])
            ->filter(fn (array $item) => $item['type'] === 'paragraph')
            ->map(fn (array $item) => $item['text'])
            ->implode("\n\n");
        $bulletText = collect($slide['items'] ?? [])
            ->filter(fn (array $item) => in_array($item['type'], ['bullet', 'numbered'], true))
            ->map(fn (array $item) => '• ' . $item['text'])
            ->implode("\n");

        if ($bulletText === '') {
            $bulletText = '• Introduce the core message clearly' . "\n"
                . '• Support it with practical detail' . "\n"
                . '• End with a confident takeaway';
        }

        $summaryHeight = $this->estimateInteractiveTextHeight($summaryText, $chart ? 320 : 560, 17, 28, 96, 156);
        $contentCardY = 164 + $summaryHeight + 26;
        $availableCardHeight = $chart ? 468 - $contentCardY : 500 - $contentCardY;
        $cardHeight = $this->estimateInteractiveTextHeight($bulletText, $chart ? 328 : 566, 17, 27, 154, max(154, $availableCardHeight));
        $contentX = 300;
        $chartWidth = 236;
        $gutter = 28;
        $summaryWidth = $chart ? 340 : 560;
        $cardWidth = $chart ? 340 : 566;
        $chartX = $contentX + $cardWidth + $gutter;
        $elements = [
            [
                'type' => 'shape',
                'name' => 'Left panel',
                'position' => 1,
                'x' => 0,
                'y' => 0,
                'width' => 250,
                'height' => 540,
                'rotation' => 0,
                'z_index' => 1,
                'style' => [
                    'shape' => 'rectangle',
                    'background' => $this->themeColor($theme['primary']),
                    'borderColor' => 'transparent',
                ],
                'content' => ['text' => ''],
            ],
            [
                'type' => 'shape',
                'name' => 'Accent rail',
                'position' => 2,
                'x' => 232,
                'y' => 0,
                'width' => 18,
                'height' => 540,
                'rotation' => 0,
                'z_index' => 2,
                'style' => [
                    'shape' => 'rectangle',
                    'background' => $this->themeColor($theme['accent']),
                    'borderColor' => 'transparent',
                ],
                'content' => ['text' => ''],
            ],
            [
                'type' => 'heading',
                'name' => 'Slide heading',
                'position' => 3,
                'x' => $contentX,
                'y' => 76,
                'width' => $chart ? 520 : 540,
                'height' => 70,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 30, 'fontWeight' => 700, 'color' => $this->themeColor($theme['dark'])],
                'content' => ['text' => $slide['title'] ?? 'Slide'],
            ],
            [
                'type' => 'text',
                'name' => 'Slide summary',
                'position' => 4,
                'x' => $contentX,
                'y' => 164,
                'width' => $summaryWidth,
                'height' => $summaryHeight,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 17, 'fontWeight' => 500, 'color' => $this->themeColor($theme['secondary'])],
                'content' => ['text' => $summaryText !== '' ? $summaryText : 'A structured AI-generated slide using the same presentation workflow as PowerPoint creation.'],
            ],
            [
                'type' => 'shape',
                'name' => 'Content card',
                'position' => 5,
                'x' => $contentX,
                'y' => $contentCardY,
                'width' => $cardWidth,
                'height' => $cardHeight,
                'rotation' => 0,
                'z_index' => 2,
                'style' => [
                    'shape' => 'rounded-rectangle',
                    'background' => $this->themeColor($theme['soft']),
                    'borderColor' => 'rgba(15,23,42,0.08)',
                    'color' => $this->themeColor($theme['dark']),
                    'textAlign' => 'left',
                    'contentAlign' => 'top',
                ],
                'content' => ['text' => $bulletText],
            ],
        ];

        if ($chart !== null) {
            $chartType = $chart['type'] === 'histogram' ? 'bar' : $chart['type'];
            $elements[] = [
                'type' => 'chart',
                'name' => $chart['label'] ?? 'Chart',
                'position' => 6,
                'x' => $chartX,
                'y' => 164,
                'width' => $chartWidth,
                'height' => max(304, ($contentCardY + $cardHeight) - 164),
                'rotation' => 0,
                'z_index' => 3,
                'style' => [
                    'chartColor' => '#' . ltrim((string) ($chart['colors'][0] ?? '2563EB'), '#'),
                    'chartAccentColor' => '#' . ltrim((string) ($chart['colors'][1] ?? '7C3AED'), '#'),
                    'chartAxisColor' => 'rgba(15,23,42,0.16)',
                    'color' => $this->themeColor($theme['dark']),
                    'background' => 'rgba(255,255,255,0.72)',
                    'borderColor' => 'rgba(15,23,42,0.08)',
                    'opacity' => 100,
                ],
                'content' => [
                    'text' => $chart['label'] ?? 'Chart',
                    'chartType' => $chartType,
                    'labels' => array_keys($chart['values'] ?? []),
                    'series' => array_map(static fn ($value) => (float) $value, array_values($chart['values'] ?? [])),
                ],
                'animation' => ['type' => 'slide-up', 'duration' => 0.35],
            ];
        }

        return [
            'title' => $slide['title'] ?? 'Slide',
            'layout' => 'content-grid',
            'speaker_notes' => 'Explain the point of this slide in simple language, then connect it to the next part of the story.',
            'canvas_settings' => [
                'background' => $this->themeToGradient($theme, false),
                'grid' => false,
            ],
            'elements' => $elements,
        ];
    }

    private function buildInteractiveSgmmsTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Official proposal';
        $variant = $this->designVariantSeed($title . '|sgmms_proposal|title', 3);

        return [
            'title' => $title,
            'layout' => "sgmms-proposal-hero-{$variant}",
            'speaker_notes' => "Introduce {$title} as a formal, high-confidence proposal.",
            'canvas_settings' => [
                'background' => $this->themeColor($theme['dark']),
                'grid' => true,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Hero circle right',
                    'position' => 1,
                    'x' => $variant === 1 ? 618 : 586,
                    'y' => $variant === 2 ? -26 : -8,
                    'width' => 392,
                    'height' => 392,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'circle', 'background' => 'rgba(44,69,150,0.92)', 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Hero circle left',
                    'position' => 2,
                    'x' => $variant === 2 ? -64 : -44,
                    'y' => 278,
                    'width' => 344,
                    'height' => 344,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'circle', 'background' => 'rgba(32,53,122,0.88)', 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Teal rail',
                    'position' => 3,
                    'x' => 72,
                    'y' => 54,
                    'width' => 6,
                    'height' => 432,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['accent']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'text',
                    'name' => 'Proposal eyebrow',
                    'position' => 4,
                    'x' => 124,
                    'y' => 42,
                    'width' => 220,
                    'height' => 26,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 12, 'fontWeight' => 700, 'color' => '#D1D5DB', 'textTransform' => 'uppercase'],
                    'content' => ['text' => 'OFFICIAL PROPOSAL'],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Hero title',
                    'position' => 5,
                    'x' => 122,
                    'y' => 96,
                    'width' => 456,
                    'height' => 128,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 52, 'fontWeight' => 800, 'color' => '#FFFFFF'],
                    'content' => ['text' => Str::upper($title)],
                ],
                [
                    'type' => 'text',
                    'name' => 'Hero subtitle',
                    'position' => 6,
                    'x' => 122,
                    'y' => 236,
                    'width' => 560,
                    'height' => 78,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 18, 'fontWeight' => 500, 'color' => '#E5E7EB'],
                    'content' => ['text' => "A polished {$subtitle} deck designed with a secure, modern, government-ready visual system."],
                ],
                ...collect([
                    ['x' => 122, 'label' => 'Modernize workflows'],
                    ['x' => 354, 'label' => 'Increase efficiency'],
                    ['x' => 586, 'label' => 'Data-driven governance'],
                ])->map(fn (array $pill, int $pillIndex) => [
                    [
                        'type' => 'shape',
                        'name' => 'Hero pill',
                        'position' => 10 + ($pillIndex * 2),
                        'x' => $pill['x'],
                        'y' => 368,
                        'width' => 190,
                        'height' => 46,
                        'rotation' => 0,
                        'z_index' => 2,
                        'style' => [
                            'shape' => 'rounded-rectangle',
                            'background' => 'rgba(255,255,255,0.06)',
                            'borderColor' => 'rgba(255,255,255,0.14)',
                        ],
                        'content' => ['text' => ''],
                    ],
                    [
                        'type' => 'text',
                        'name' => 'Hero pill label',
                        'position' => 11 + ($pillIndex * 2),
                        'x' => $pill['x'] + 24,
                        'y' => 382,
                        'width' => 150,
                        'height' => 18,
                        'rotation' => 0,
                        'z_index' => 3,
                        'style' => ['fontSize' => 14, 'fontWeight' => 700, 'color' => '#FFFFFF'],
                        'content' => ['text' => Str::title($pill['label'])],
                    ],
                ])->flatten(1)->all(),
            ],
        ];
    }

    private function buildInteractiveSgmmsContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        $summaryText = collect($slide['items'] ?? [])
            ->filter(fn (array $item) => $item['type'] === 'paragraph')
            ->map(fn (array $item) => $item['text'])
            ->implode("\n\n");
        $cards = $this->sgmmsCardsFromItems($slide['items'] ?? []);
        $chart = $this->chartFromSlideContent((string) ($slide['title'] ?? 'Slide'), $slide['items'] ?? []);
        $variant = $this->designVariantSeed(($slide['title'] ?? 'Slide') . '|sgmms_proposal|' . $index, 2);

        $elements = [
            [
                'type' => 'heading',
                'name' => 'SGMMS heading',
                'position' => 1,
                'x' => 46,
                'y' => 38,
                'width' => 860,
                'height' => 54,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 34, 'fontWeight' => 800, 'color' => '#22409A'],
                'content' => ['text' => $slide['title'] ?? 'Slide'],
            ],
            [
                'type' => 'text',
                'name' => 'SGMMS intro',
                'position' => 2,
                'x' => 46,
                'y' => 96,
                'width' => 842,
                'height' => 54,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 16, 'fontWeight' => 600, 'color' => '#111827'],
                'content' => ['text' => $summaryText !== '' ? $summaryText : 'A structured overview aligned to the SGMMS proposal style.'],
            ],
        ];

        if ($chart !== null) {
            $chartType = $chart['type'] === 'histogram' ? 'bar' : $chart['type'];
            $elements[] = [
                'type' => 'shape',
                'name' => 'Chart support card',
                'position' => 3,
                'x' => 46,
                'y' => 164,
                'width' => 248,
                'height' => 250,
                'rotation' => 0,
                'z_index' => 1,
                'style' => [
                    'shape' => 'rounded-rectangle',
                    'background' => '#FFFFFF',
                    'borderColor' => $variant === 0 ? '#3B82F6' : '#10B981',
                ],
                'content' => ['text' => "Proposal insight\n\n" . ($chart['label'] ?? 'Data summary')],
            ];
            $elements[] = [
                'type' => 'chart',
                'name' => $chart['label'] ?? 'Chart',
                'position' => 4,
                'x' => 324,
                'y' => 164,
                'width' => 564,
                'height' => 260,
                'rotation' => 0,
                'z_index' => 3,
                'style' => [
                    'chartColor' => '#' . ltrim((string) ($chart['colors'][0] ?? '22409A'), '#'),
                    'chartAccentColor' => '#' . ltrim((string) ($chart['colors'][1] ?? '10B981'), '#'),
                    'chartAxisColor' => 'rgba(15,23,42,0.16)',
                    'color' => '#0F172A',
                    'background' => '#FFFFFF',
                    'borderColor' => 'rgba(34,64,154,0.12)',
                    'opacity' => 100,
                ],
                'content' => [
                    'text' => $chart['label'] ?? 'Chart',
                    'chartType' => $chartType,
                    'labels' => array_keys($chart['values'] ?? []),
                    'series' => array_map(static fn ($value) => (float) $value, array_values($chart['values'] ?? [])),
                ],
            ];
        } else {
            foreach ($cards as $cardIndex => $card) {
                $column = $cardIndex % 2;
                $row = intdiv($cardIndex, 2);
                $x = $column === 0 ? 46 : 482;
                $y = 164 + ($row * 126);
                $border = ['#3B82F6', '#10B981', '#1D4ED8', '#14B8A6'][$cardIndex % 4];
                $iconBg = $column === 0 ? '#EAF2FF' : '#E8FBF2';

                $elements[] = [
                    'type' => 'shape',
                    'name' => 'Feature card',
                    'position' => 10 + ($cardIndex * 3),
                    'x' => $x,
                    'y' => $y,
                    'width' => 392,
                    'height' => 102,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => [
                        'shape' => 'rounded-rectangle',
                        'background' => '#FFFFFF',
                        'borderColor' => $border,
                    ],
                    'content' => ['text' => ''],
                ];
                $elements[] = [
                    'type' => 'shape',
                    'name' => 'Feature icon block',
                    'position' => 11 + ($cardIndex * 3),
                    'x' => $x + 18,
                    'y' => $y + 18,
                    'width' => 44,
                    'height' => 44,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => [
                        'shape' => 'rounded-rectangle',
                        'background' => $iconBg,
                        'borderColor' => 'transparent',
                    ],
                    'content' => ['text' => ''],
                ];
                $elements[] = [
                    'type' => 'text',
                    'name' => 'Feature content',
                    'position' => 12 + ($cardIndex * 3),
                    'x' => $x + 78,
                    'y' => $y + 18,
                    'width' => 286,
                    'height' => 64,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 13, 'fontWeight' => 600, 'color' => '#233A63', 'textAlign' => 'left', 'contentAlign' => 'top'],
                    'content' => ['text' => $card['title'] . "\n" . $card['body']],
                ];
            }
        }

        return [
            'title' => $slide['title'] ?? 'Slide',
            'layout' => $chart ? "sgmms-proposal-chart-{$variant}" : "sgmms-proposal-cards-{$variant}",
            'speaker_notes' => 'Present the page as a formal proposal section with strong operational clarity.',
            'canvas_settings' => [
                'background' => '#F7F8FA',
                'grid' => false,
            ],
            'elements' => $elements,
        ];
    }

    private function sgmmsCardsFromItems(array $items): array
    {
        $bullets = collect($items)
            ->filter(fn (array $item) => in_array($item['type'], ['bullet', 'numbered'], true))
            ->pluck('text')
            ->filter()
            ->values();

        if ($bullets->isEmpty()) {
            $bullets = collect([
                'Operational efficiency|Digitize workflows, automate approvals, and reduce processing bottlenecks.',
                'Transparency & accountability|Ensure audit trails, version control, and real-time document visibility.',
                'Workforce management|Centralize profiles, attendance, and performance tracking.',
                'Secure collaboration|Enable protected communication, task assignment, and file sharing.',
            ]);
        }

        return $bullets
            ->take(6)
            ->map(function (string $bullet, int $index) {
                $parts = preg_split('/[:|-]/', $bullet, 2) ?: [];
                $title = trim((string) ($parts[0] ?? 'Key capability'));
                $body = trim((string) ($parts[1] ?? $bullet));

                return [
                    'title' => Str::headline($title),
                    'body' => $body,
                ];
            })
            ->all();
    }

    private function buildInteractiveBusinessBlueTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::upper(Str::headline($documentType)) : 'BUSINESS PRESENTATION';
        $variant = $this->designVariantSeed($title . '|business_blue|title', 3);

        $leftWidth = $variant === 1 ? 560 : ($variant === 2 ? 652 : 612);
        $railX = $leftWidth - 27;
        $rightX = $leftWidth;
        $rightWidth = 960 - $leftWidth;
        $titleX = $variant === 2 ? 84 : 72;
        $titleY = $variant === 1 ? 132 : 152;
        $titleWidth = $variant === 2 ? 520 : 468;
        $metricY = $variant === 1 ? 172 : 142;

        return [
            'title' => $title,
            'layout' => "business-blue-hero-{$variant}",
            'speaker_notes' => "Open {$title} with a polished business tone and clear executive framing.",
            'canvas_settings' => [
                'background' => $this->themeToGradient($theme, true),
                'grid' => false,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Left hero block',
                    'position' => 1,
                    'x' => 0,
                    'y' => 0,
                    'width' => $leftWidth,
                    'height' => 540,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['dark']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Right accent block',
                    'position' => 2,
                    'x' => $rightX,
                    'y' => 0,
                    'width' => $rightWidth,
                    'height' => 540,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['primary']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Accent rail',
                    'position' => 3,
                    'x' => $railX,
                    'y' => 0,
                    'width' => 18,
                    'height' => 540,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['accent']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Hero title',
                    'position' => 4,
                    'x' => $titleX,
                    'y' => $titleY,
                    'width' => $titleWidth,
                    'height' => 140,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 40, 'fontWeight' => 700, 'color' => '#FFFFFF'],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Hero subtitle',
                    'position' => 5,
                    'x' => 76,
                    'y' => 322,
                    'width' => 360,
                    'height' => 34,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 14, 'fontWeight' => 600, 'color' => '#BFDBFE'],
                    'content' => ['text' => $subtitle],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Metric panel',
                    'position' => 6,
                    'x' => 676,
                    'y' => $metricY,
                    'width' => 196,
                    'height' => 214,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => [
                        'shape' => 'rounded-rectangle',
                        'background' => 'rgba(255,255,255,0.12)',
                        'borderColor' => 'rgba(255,255,255,0.2)',
                        'color' => '#FFFFFF',
                    ],
                    'content' => ['text' => "Executive\nproposal\nlayout"],
                ],
            ],
        ];
    }

    private function buildInteractiveBoardroomTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Executive Briefing';
        $variant = $this->designVariantSeed($title . '|boardroom|title', 3);

        return [
            'title' => $title,
            'layout' => "boardroom-hero-{$variant}",
            'speaker_notes' => "Introduce {$title} with a premium executive tone.",
            'canvas_settings' => [
                'background' => 'linear-gradient(180deg, ' . $this->themeColor($theme['background']) . ' 0%, ' . $this->themeColor($theme['soft']) . ' 100%)',
                'grid' => false,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Frame line',
                    'position' => 1,
                    'x' => $variant === 1 ? 70 : 54,
                    'y' => $variant === 2 ? 60 : 44,
                    'width' => $variant === 1 ? 820 : 852,
                    'height' => $variant === 2 ? 420 : 452,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rounded-rectangle', 'background' => 'transparent', 'borderColor' => $this->themeColor($theme['accent'])],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Board title',
                    'position' => 2,
                    'x' => $variant === 1 ? 122 : 102,
                    'y' => $variant === 2 ? 150 : 170,
                    'width' => $variant === 1 ? 716 : 756,
                    'height' => 76,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 38, 'fontWeight' => 700, 'color' => $this->themeColor($theme['dark']), 'textAlign' => 'center'],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Board subtitle',
                    'position' => 3,
                    'x' => 210,
                    'y' => 268,
                    'width' => 540,
                    'height' => 32,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 15, 'fontWeight' => 500, 'color' => $this->themeColor($theme['secondary']), 'textAlign' => 'center'],
                    'content' => ['text' => $subtitle],
                ],
            ],
        ];
    }

    private function buildInteractiveEditorialTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Story-led deck';
        $variant = $this->designVariantSeed($title . '|editorial|title', 3);

        return [
            'title' => $title,
            'layout' => "editorial-hero-{$variant}",
            'speaker_notes' => "Introduce {$title} like a refined editorial feature.",
            'canvas_settings' => [
                'background' => $this->themeColor($theme['background']),
                'grid' => false,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Editorial stripe',
                    'position' => 1,
                    'x' => $variant === 1 ? 120 : 86,
                    'y' => 56,
                    'width' => 6,
                    'height' => 428,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['accent']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Editorial title',
                    'position' => 2,
                    'x' => $variant === 2 ? 148 : 124,
                    'y' => $variant === 1 ? 108 : 126,
                    'width' => $variant === 2 ? 520 : 556,
                    'height' => 118,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 42, 'fontWeight' => 700, 'color' => $this->themeColor($theme['dark'])],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Editorial subtitle',
                    'position' => 3,
                    'x' => 128,
                    'y' => 276,
                    'width' => 420,
                    'height' => 58,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 17, 'fontWeight' => 500, 'color' => $this->themeColor($theme['secondary'])],
                    'content' => ['text' => $subtitle],
                ],
                [
                    'type' => 'shape',
                    'name' => 'Editorial image block',
                    'position' => 4,
                    'x' => $variant === 1 ? 628 : 676,
                    'y' => $variant === 2 ? 124 : 98,
                    'width' => $variant === 1 ? 246 : 198,
                    'height' => $variant === 2 ? 250 : 290,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => ['shape' => 'rounded-rectangle', 'background' => $this->themeColor($theme['soft']), 'borderColor' => 'rgba(28,25,23,0.08)'],
                    'content' => ['text' => 'Feature block'],
                ],
            ],
        ];
    }

    private function buildInteractiveTechGridTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::upper(Str::headline($documentType)) : 'PRODUCT / SYSTEM / ROADMAP';
        $variant = $this->designVariantSeed($title . '|tech_grid|title', 3);

        return [
            'title' => $title,
            'layout' => "tech-grid-hero-{$variant}",
            'speaker_notes' => "Open {$title} with a product-forward, technical visual tone.",
            'canvas_settings' => [
                'background' => 'linear-gradient(180deg, ' . $this->themeColor($theme['background']) . ' 0%, ' . $this->themeColor($theme['soft']) . ' 100%)',
                'grid' => true,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Tech panel',
                    'position' => 1,
                    'x' => $variant === 1 ? 44 : 58,
                    'y' => $variant === 2 ? 54 : 74,
                    'width' => $variant === 1 ? 872 : 844,
                    'height' => $variant === 2 ? 428 : 392,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rounded-rectangle', 'background' => 'rgba(255,255,255,0.65)', 'borderColor' => 'rgba(14,165,233,0.2)'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Tech title',
                    'position' => 2,
                    'x' => 104,
                    'y' => 134,
                    'width' => 520,
                    'height' => 96,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 38, 'fontWeight' => 700, 'color' => $this->themeColor($theme['dark'])],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Tech subtitle',
                    'position' => 3,
                    'x' => 108,
                    'y' => 252,
                    'width' => 440,
                    'height' => 34,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 14, 'fontWeight' => 600, 'color' => $this->themeColor($theme['secondary'])],
                    'content' => ['text' => $subtitle],
                ],
            ],
        ];
    }

    private function buildInteractiveFinancialTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Financial presentation';
        $variant = $this->designVariantSeed($title . '|financial_clean|title', 3);

        return [
            'title' => $title,
            'layout' => "financial-hero-{$variant}",
            'speaker_notes' => "Introduce {$title} with a clean analytical tone.",
            'canvas_settings' => [
                'background' => $this->themeColor($theme['background']),
                'grid' => false,
            ],
            'elements' => [
                [
                    'type' => 'shape',
                    'name' => 'Top financial rail',
                    'position' => 1,
                    'x' => 0,
                    'y' => 0,
                    'width' => 960,
                    'height' => 74,
                    'rotation' => 0,
                    'z_index' => 1,
                    'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['primary']), 'borderColor' => 'transparent'],
                    'content' => ['text' => ''],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Financial title',
                    'position' => 2,
                    'x' => $variant === 1 ? 74 : 84,
                    'y' => $variant === 2 ? 134 : 154,
                    'width' => $variant === 1 ? 660 : 620,
                    'height' => 92,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 40, 'fontWeight' => 700, 'color' => $this->themeColor($theme['dark'])],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Financial subtitle',
                    'position' => 3,
                    'x' => 88,
                    'y' => 268,
                    'width' => 380,
                    'height' => 32,
                    'rotation' => 0,
                    'z_index' => 3,
                    'style' => ['fontSize' => 15, 'fontWeight' => 600, 'color' => $this->themeColor($theme['secondary'])],
                    'content' => ['text' => $subtitle],
                ],
                [
                    'type' => 'shape',
                    'name' => 'KPI block',
                    'position' => 4,
                    'x' => 700,
                    'y' => 134,
                    'width' => 166,
                    'height' => 228,
                    'rotation' => 0,
                    'z_index' => 2,
                    'style' => ['shape' => 'rounded-rectangle', 'background' => $this->themeColor($theme['soft']), 'borderColor' => 'rgba(20,83,45,0.12)'],
                    'content' => ['text' => "Clean\nmetrics\nview"],
                ],
            ],
        ];
    }

    private function buildInteractiveBusinessBlueContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        return $this->buildInteractiveStyledContentSlideBlueprint($slide, $theme, $index, 'business_blue');
    }

    private function buildInteractiveBoardroomContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        return $this->buildInteractiveStyledContentSlideBlueprint($slide, $theme, $index, 'boardroom');
    }

    private function buildInteractiveEditorialContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        return $this->buildInteractiveStyledContentSlideBlueprint($slide, $theme, $index, 'editorial');
    }

    private function buildInteractiveTechGridContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        return $this->buildInteractiveStyledContentSlideBlueprint($slide, $theme, $index, 'tech_grid');
    }

    private function buildInteractiveFinancialContentSlideBlueprint(array $slide, array $theme, int $index): array
    {
        return $this->buildInteractiveStyledContentSlideBlueprint($slide, $theme, $index, 'financial_clean');
    }

    private function buildInteractiveStyledContentSlideBlueprint(array $slide, array $theme, int $index, string $family): array
    {
        $variant = $this->designVariantSeed(($slide['title'] ?? 'slide') . '|' . $family . '|' . $index, 3);
        $chart = $this->chartFromSlideContent((string) ($slide['title'] ?? 'Slide'), $slide['items'] ?? []);
        $summaryText = collect($slide['items'] ?? [])
            ->filter(fn (array $item) => $item['type'] === 'paragraph')
            ->map(fn (array $item) => $item['text'])
            ->implode("\n\n");
        $bulletText = collect($slide['items'] ?? [])
            ->filter(fn (array $item) => in_array($item['type'], ['bullet', 'numbered'], true))
            ->map(fn (array $item) => '• ' . $item['text'])
            ->implode("\n");

        if ($bulletText === '') {
            $bulletText = "• Clarify the core point\n• Add supporting detail\n• Close with a clear takeaway";
        }

        $presets = [
            'business_blue' => [
                'layout' => 'business-blue-content',
                'background' => 'linear-gradient(135deg, ' . $this->themeColor($theme['background']) . ' 0%, ' . $this->themeColor($theme['soft']) . ' 100%)',
                'grid' => false,
                'titleColor' => $this->themeColor($theme['dark']),
                'summaryColor' => $this->themeColor($theme['secondary']),
                'cardBg' => '#FFFFFF',
                'cardBorder' => 'rgba(20,84,141,0.12)',
                'cardText' => $this->themeColor($theme['dark']),
                'panels' => [
                    ['x' => 0, 'y' => 0, 'w' => 232, 'h' => 540, 'bg' => $this->themeColor($theme['primary'])],
                    ['x' => 232, 'y' => 0, 'w' => 18, 'h' => 540, 'bg' => $this->themeColor($theme['accent'])],
                    ['x' => 286, 'y' => 116, 'w' => 614, 'h' => 344, 'bg' => '#FFFFFF', 'border' => 'rgba(20,84,141,0.12)'],
                ],
                'title' => ['x' => 300, 'y' => 64, 'w' => 548],
                'summary' => ['x' => 300, 'y' => 128, 'w' => 520],
                'card' => ['x' => 300, 'y' => 232, 'w' => 340],
                'chart' => ['x' => 668, 'y' => 160, 'w' => 196],
            ],
            'boardroom' => [
                'layout' => 'boardroom-content',
                'background' => $this->themeColor($theme['background']),
                'grid' => false,
                'titleColor' => $this->themeColor($theme['dark']),
                'summaryColor' => $this->themeColor($theme['secondary']),
                'cardBg' => $this->themeColor($theme['soft']),
                'cardBorder' => $this->themeColor($theme['accent']),
                'cardText' => $this->themeColor($theme['dark']),
                'panels' => [
                    ['x' => 54, 'y' => 44, 'w' => 852, 'h' => 452, 'bg' => 'transparent', 'border' => $this->themeColor($theme['accent'])],
                ],
                'title' => ['x' => 102, 'y' => 86, 'w' => 720],
                'summary' => ['x' => 106, 'y' => 150, 'w' => 688],
                'card' => ['x' => 106, 'y' => 246, 'w' => 372],
                'chart' => ['x' => 518, 'y' => 170, 'w' => 304],
            ],
            'editorial' => [
                'layout' => 'editorial-content',
                'background' => $this->themeColor($theme['background']),
                'grid' => false,
                'titleColor' => $this->themeColor($theme['dark']),
                'summaryColor' => $this->themeColor($theme['secondary']),
                'cardBg' => $this->themeColor($theme['soft']),
                'cardBorder' => 'rgba(28,25,23,0.08)',
                'cardText' => $this->themeColor($theme['dark']),
                'panels' => [
                    ['x' => 82, 'y' => 52, 'w' => 8, 'h' => 438, 'bg' => $this->themeColor($theme['accent'])],
                    ['x' => 654, 'y' => 96, 'w' => 222, 'h' => 320, 'bg' => $this->themeColor($theme['soft']), 'border' => 'rgba(28,25,23,0.08)'],
                ],
                'title' => ['x' => 120, 'y' => 72, 'w' => 486],
                'summary' => ['x' => 124, 'y' => 154, 'w' => 454],
                'card' => ['x' => 124, 'y' => 272, 'w' => 454],
                'chart' => ['x' => 654, 'y' => 140, 'w' => 222],
            ],
            'tech_grid' => [
                'layout' => 'tech-grid-content',
                'background' => 'linear-gradient(180deg, ' . $this->themeColor($theme['background']) . ' 0%, ' . $this->themeColor($theme['soft']) . ' 100%)',
                'grid' => true,
                'titleColor' => $this->themeColor($theme['dark']),
                'summaryColor' => $this->themeColor($theme['secondary']),
                'cardBg' => 'rgba(255,255,255,0.84)',
                'cardBorder' => 'rgba(14,165,233,0.16)',
                'cardText' => $this->themeColor($theme['dark']),
                'panels' => [
                    ['x' => 54, 'y' => 54, 'w' => 852, 'h' => 432, 'bg' => 'rgba(255,255,255,0.58)', 'border' => 'rgba(14,165,233,0.16)'],
                ],
                'title' => ['x' => 96, 'y' => 82, 'w' => 708],
                'summary' => ['x' => 100, 'y' => 152, 'w' => 644],
                'card' => ['x' => 100, 'y' => 252, 'w' => 380],
                'chart' => ['x' => 520, 'y' => 170, 'w' => 286],
            ],
            'financial_clean' => [
                'layout' => 'financial-content',
                'background' => $this->themeColor($theme['background']),
                'grid' => false,
                'titleColor' => $this->themeColor($theme['dark']),
                'summaryColor' => $this->themeColor($theme['secondary']),
                'cardBg' => '#FFFFFF',
                'cardBorder' => 'rgba(20,83,45,0.12)',
                'cardText' => $this->themeColor($theme['dark']),
                'panels' => [
                    ['x' => 0, 'y' => 0, 'w' => 960, 'h' => 72, 'bg' => $this->themeColor($theme['primary'])],
                    ['x' => 0, 'y' => 468, 'w' => 960, 'h' => 72, 'bg' => $this->themeColor($theme['soft'])],
                    ['x' => 72, 'y' => 124, 'w' => 816, 'h' => 286, 'bg' => '#FFFFFF', 'border' => 'rgba(20,83,45,0.12)'],
                ],
                'title' => ['x' => 92, 'y' => 96, 'w' => 700],
                'summary' => ['x' => 96, 'y' => 156, 'w' => 660],
                'card' => ['x' => 96, 'y' => 252, 'w' => 376],
                'chart' => ['x' => 522, 'y' => 168, 'w' => 286],
            ],
        ];

        $preset = $this->interactiveStylePresetVariant($presets[$family], $family, $variant);
        $summaryHeight = $this->estimateInteractiveTextHeight($summaryText, $preset['summary']['w'], 16, 26, 84, 146);
        $cardY = $preset['card']['y'];
        $cardWidth = $preset['card']['w'];
        $chartWidth = $preset['chart']['w'];
        $chartX = $preset['chart']['x'];
        $cardHeight = $this->estimateInteractiveTextHeight($bulletText, $cardWidth - 32, 16, 25, 148, 220);

        $elements = [];

        foreach ($preset['panels'] as $panelIndex => $panel) {
            $elements[] = [
                'type' => 'shape',
                'name' => 'Styled panel',
                'position' => 1 + $panelIndex,
                'x' => $panel['x'],
                'y' => $panel['y'],
                'width' => $panel['w'],
                'height' => $panel['h'],
                'rotation' => 0,
                'z_index' => 1,
                'style' => [
                    'shape' => 'rounded-rectangle',
                    'background' => $panel['bg'],
                    'borderColor' => $panel['border'] ?? 'transparent',
                ],
                'content' => ['text' => ''],
            ];
        }

        $elements[] = [
            'type' => 'heading',
            'name' => 'Styled heading',
            'position' => 10,
            'x' => $preset['title']['x'],
            'y' => $preset['title']['y'],
            'width' => $preset['title']['w'],
            'height' => 68,
            'rotation' => 0,
            'z_index' => 3,
            'style' => ['fontSize' => 30, 'fontWeight' => 700, 'color' => $preset['titleColor']],
            'content' => ['text' => $slide['title'] ?? 'Slide'],
        ];

        $elements[] = [
            'type' => 'text',
            'name' => 'Styled summary',
            'position' => 11,
            'x' => $preset['summary']['x'],
            'y' => $preset['summary']['y'],
            'width' => $preset['summary']['w'],
            'height' => $summaryHeight,
            'rotation' => 0,
            'z_index' => 3,
            'style' => ['fontSize' => 16, 'fontWeight' => 500, 'color' => $preset['summaryColor']],
            'content' => ['text' => $summaryText !== '' ? $summaryText : 'AI-generated content tailored to the requested design direction.'],
        ];

        $elements[] = [
            'type' => 'shape',
            'name' => 'Styled content card',
            'position' => 12,
            'x' => $preset['card']['x'],
            'y' => $cardY,
            'width' => $cardWidth,
            'height' => $cardHeight,
            'rotation' => 0,
            'z_index' => 2,
            'style' => [
                'shape' => 'rounded-rectangle',
                'background' => $preset['cardBg'],
                'borderColor' => $preset['cardBorder'],
                'color' => $preset['cardText'],
                'textAlign' => 'left',
                'contentAlign' => 'top',
            ],
            'content' => ['text' => $bulletText],
        ];

        if ($chart !== null) {
            $chartType = $chart['type'] === 'histogram' ? 'bar' : $chart['type'];
            $elements[] = [
                'type' => 'chart',
                'name' => $chart['label'] ?? 'Chart',
                'position' => 13,
                'x' => $chartX,
                'y' => $preset['chart']['y'],
                'width' => $chartWidth,
                'height' => max(248, ($cardY + $cardHeight) - $preset['chart']['y']),
                'rotation' => 0,
                'z_index' => 3,
                'style' => [
                    'chartColor' => '#' . ltrim((string) ($chart['colors'][0] ?? $theme['secondary']), '#'),
                    'chartAccentColor' => '#' . ltrim((string) ($chart['colors'][1] ?? $theme['accent']), '#'),
                    'chartAxisColor' => 'rgba(15,23,42,0.16)',
                    'color' => $preset['cardText'],
                    'background' => '#FFFFFF',
                    'borderColor' => $preset['cardBorder'],
                    'opacity' => 100,
                ],
                'content' => [
                    'text' => $chart['label'] ?? 'Chart',
                    'chartType' => $chartType,
                    'labels' => array_keys($chart['values'] ?? []),
                    'series' => array_map(static fn ($value) => (float) $value, array_values($chart['values'] ?? [])),
                ],
            ];
        }

        return [
            'title' => $slide['title'] ?? 'Slide',
            'layout' => $preset['layout'] . '-' . $variant,
            'speaker_notes' => 'Explain the slide clearly and connect it to the requested design story.',
            'canvas_settings' => [
                'background' => $preset['background'],
                'grid' => $preset['grid'],
            ],
            'elements' => $elements,
        ];
    }

    private function interactiveStylePresetVariant(array $preset, string $family, int $variant): array
    {
        if ($variant === 0) {
            return $preset;
        }

        $mutated = $preset;

        if ($family === 'business_blue') {
            if ($variant === 1) {
                $mutated['panels'][0]['w'] = 198;
                $mutated['panels'][1]['x'] = 198;
                $mutated['panels'][2]['x'] = 254;
                $mutated['panels'][2]['w'] = 660;
                $mutated['title']['x'] = 272;
                $mutated['summary']['x'] = 272;
                $mutated['card']['x'] = 272;
                $mutated['card']['w'] = 374;
                $mutated['chart']['x'] = 672;
                $mutated['chart']['w'] = 212;
            } elseif ($variant === 2) {
                $mutated['background'] = 'linear-gradient(180deg, ' . $mutated['summaryColor'] . '08 0%, ' . $mutated['cardBg'] . ' 100%)';
                $mutated['panels'][0]['h'] = 192;
                $mutated['panels'][2]['y'] = 224;
                $mutated['panels'][2]['h'] = 236;
                $mutated['title']['y'] = 82;
                $mutated['summary']['y'] = 132;
                $mutated['card']['y'] = 264;
            }
        } elseif ($family === 'boardroom') {
            if ($variant === 1) {
                $mutated['panels'][0]['x'] = 70;
                $mutated['panels'][0]['w'] = 820;
                $mutated['title']['x'] = 126;
                $mutated['summary']['w'] = 620;
                $mutated['chart']['x'] = 492;
                $mutated['chart']['w'] = 330;
            } elseif ($variant === 2) {
                $mutated['panels'][0]['y'] = 64;
                $mutated['panels'][0]['h'] = 408;
                $mutated['title']['y'] = 108;
                $mutated['summary']['y'] = 176;
                $mutated['card']['y'] = 286;
                $mutated['chart']['y'] = 196;
            }
        } elseif ($family === 'editorial') {
            if ($variant === 1) {
                $mutated['panels'][0]['x'] = 120;
                $mutated['panels'][1]['x'] = 610;
                $mutated['panels'][1]['w'] = 266;
                $mutated['title']['x'] = 156;
                $mutated['summary']['x'] = 160;
                $mutated['card']['x'] = 160;
            } elseif ($variant === 2) {
                $mutated['panels'][1]['y'] = 134;
                $mutated['panels'][1]['h'] = 236;
                $mutated['title']['y'] = 92;
                $mutated['summary']['y'] = 182;
                $mutated['card']['y'] = 294;
                $mutated['chart']['y'] = 168;
            }
        } elseif ($family === 'tech_grid') {
            if ($variant === 1) {
                $mutated['panels'][0]['x'] = 38;
                $mutated['panels'][0]['w'] = 884;
                $mutated['title']['x'] = 84;
                $mutated['summary']['w'] = 680;
                $mutated['card']['w'] = 356;
                $mutated['chart']['x'] = 490;
                $mutated['chart']['w'] = 316;
            } elseif ($variant === 2) {
                $mutated['panels'][0]['y'] = 36;
                $mutated['panels'][0]['h'] = 458;
                $mutated['title']['y'] = 64;
                $mutated['summary']['y'] = 146;
                $mutated['card']['y'] = 278;
                $mutated['chart']['y'] = 188;
            }
        } elseif ($family === 'financial_clean') {
            if ($variant === 1) {
                $mutated['panels'][2]['x'] = 52;
                $mutated['panels'][2]['w'] = 856;
                $mutated['title']['x'] = 72;
                $mutated['summary']['w'] = 704;
                $mutated['card']['w'] = 344;
                $mutated['chart']['x'] = 468;
                $mutated['chart']['w'] = 340;
            } elseif ($variant === 2) {
                $mutated['panels'][0]['h'] = 56;
                $mutated['panels'][2]['y'] = 112;
                $mutated['panels'][2]['h'] = 306;
                $mutated['title']['y'] = 82;
                $mutated['summary']['y'] = 148;
                $mutated['card']['y'] = 266;
                $mutated['chart']['y'] = 182;
            }
        }

        return $mutated;
    }

    private function designVariantSeed(string $seed, int $variants = 3): int
    {
        $variants = max(1, $variants);

        return abs(crc32($seed)) % $variants;
    }

    private function buildInteractiveTemplateRealTitleSlideBlueprint(string $title, string $documentType, array $theme): array
    {
        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'AI Presentation';

        return [
            'title' => $title,
            'layout' => 'template-real-hero',
            'speaker_notes' => "Introduce {$title}, explain the purpose of the deck, and prepare the audience for the story ahead.",
            'canvas_settings' => [
                'background' => '#FFFFFF',
                'grid' => false,
            ],
            'elements' => array_merge(
                $this->templateRealDecorativeElements($theme),
                [
                    [
                        'type' => 'heading',
                        'name' => 'Hero title',
                        'position' => 10,
                        'x' => 120,
                        'y' => 108,
                        'width' => 720,
                        'height' => 64,
                        'rotation' => 0,
                        'z_index' => 3,
                        'style' => ['fontSize' => 30, 'fontWeight' => 700, 'color' => '#1F2937', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                        'content' => ['text' => Str::upper($title)],
                    ],
                    [
                        'type' => 'text',
                        'name' => 'Hero subtitle',
                        'position' => 11,
                        'x' => 220,
                        'y' => 178,
                        'width' => 520,
                        'height' => 28,
                        'rotation' => 0,
                        'z_index' => 3,
                        'style' => ['fontSize' => 15, 'fontWeight' => 500, 'color' => '#64748B', 'textAlign' => 'center'],
                        'content' => ['text' => $subtitle],
                    ],
                    ...$this->buildInteractiveTemplateRealPreviewCards($theme),
                ],
            ),
        ];
    }

    private function buildInteractiveTemplateRealContentSlideBlueprint(array $slide, array $theme): array
    {
        $title = (string) ($slide['title'] ?? 'Slide');
        $items = $slide['items'] ?? [];
        $chart = $this->chartFromSlideContent($title, $items);

        if ($chart !== null) {
            $chartType = $chart['type'] === 'histogram' ? 'bar' : $chart['type'];

            return [
                'title' => $title,
                'layout' => 'template-real-chart',
                'speaker_notes' => 'Explain the chart insight simply, then connect it to the slide takeaway.',
                'canvas_settings' => [
                    'background' => '#FFFFFF',
                    'grid' => false,
                ],
                'elements' => array_merge(
                    $this->templateRealDecorativeElements($theme),
                    [
                        [
                            'type' => 'heading',
                            'name' => 'Slide heading',
                            'position' => 10,
                            'x' => 80,
                            'y' => 42,
                            'width' => 800,
                            'height' => 44,
                            'rotation' => 0,
                            'z_index' => 3,
                            'style' => ['fontSize' => 24, 'fontWeight' => 700, 'color' => '#1F2937', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                            'content' => ['text' => Str::upper($title)],
                        ],
                        [
                            'type' => 'shape',
                            'name' => 'Chart summary panel',
                            'position' => 11,
                            'x' => 40,
                            'y' => 132,
                            'width' => 220,
                            'height' => 304,
                            'rotation' => 0,
                            'z_index' => 1,
                            'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['primary']), 'borderColor' => 'transparent'],
                            'content' => ['text' => ''],
                        ],
                        [
                            'type' => 'text',
                            'name' => 'Chart summary text',
                            'position' => 12,
                            'x' => 68,
                            'y' => 178,
                            'width' => 164,
                            'height' => 212,
                            'rotation' => 0,
                            'z_index' => 3,
                            'style' => ['fontSize' => 18, 'fontWeight' => 700, 'color' => '#FFFFFF', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                            'content' => ['text' => $chart['label'] . "\n\n" . match ($chart['type']) {
                                'pie' => 'Composition view',
                                'histogram' => 'Range distribution',
                                default => 'Category comparison',
                            }],
                        ],
                        [
                            'type' => 'chart',
                            'name' => $chart['label'] ?? 'Chart',
                            'position' => 13,
                            'x' => 300,
                            'y' => 132,
                            'width' => 620,
                            'height' => 304,
                            'rotation' => 0,
                            'z_index' => 3,
                            'style' => [
                                'chartColor' => '#' . ltrim((string) ($chart['colors'][0] ?? $theme['secondary']), '#'),
                                'chartAccentColor' => '#' . ltrim((string) ($chart['colors'][1] ?? ($theme['tertiary'] ?? 'E54B87')), '#'),
                                'chartAxisColor' => 'rgba(15,23,42,0.18)',
                                'color' => '#1F2937',
                                'background' => '#FFFFFF',
                                'borderColor' => 'rgba(15,23,42,0.08)',
                                'opacity' => 100,
                            ],
                            'content' => [
                                'text' => $chart['label'] ?? 'Chart',
                                'chartType' => $chartType,
                                'labels' => array_keys($chart['values'] ?? []),
                                'series' => array_map(static fn ($value) => (float) $value, array_values($chart['values'] ?? [])),
                            ],
                        ],
                    ],
                ),
            ];
        }

        $cards = $this->templateRealCardsFromItems($title, $items);
        $palette = [
            $this->themeColor($theme['primary']),
            $this->themeColor($theme['secondary']),
            $this->themeColor($theme['tertiary'] ?? 'FFE54B87'),
            $this->themeColor($theme['accent']),
        ];
        $icons = ['★', '☾', '✹', '☁'];

        $cardElements = [];
        foreach ($cards as $cardIndex => $card) {
            $x = $cardIndex * 240;
            $cardElements[] = [
                'type' => 'shape',
                'name' => 'Panel background',
                'position' => 20 + ($cardIndex * 4),
                'x' => $x,
                'y' => 112,
                'width' => 240,
                'height' => 360,
                'rotation' => 0,
                'z_index' => 1,
                'style' => ['shape' => 'rectangle', 'background' => $palette[$cardIndex], 'borderColor' => 'transparent'],
                'content' => ['text' => ''],
            ];
            $cardElements[] = [
                'type' => 'text',
                'name' => 'Panel icon',
                'position' => 21 + ($cardIndex * 4),
                'x' => $x + 88,
                'y' => 144,
                'width' => 64,
                'height' => 30,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 28, 'fontWeight' => 700, 'color' => '#FFFFFF', 'textAlign' => 'center'],
                'content' => ['text' => $icons[$cardIndex]],
            ];
            $cardElements[] = [
                'type' => 'heading',
                'name' => 'Panel title',
                'position' => 22 + ($cardIndex * 4),
                'x' => $x + 30,
                'y' => 194,
                'width' => 180,
                'height' => 40,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 18, 'fontWeight' => 700, 'color' => '#FFFFFF', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                'content' => ['text' => $card['title']],
            ];
            $cardElements[] = [
                'type' => 'text',
                'name' => 'Panel body',
                'position' => 23 + ($cardIndex * 4),
                'x' => $x + 30,
                'y' => 252,
                'width' => 180,
                'height' => 164,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 12, 'fontWeight' => 500, 'color' => '#102A43', 'textAlign' => 'center'],
                'content' => ['text' => $card['body']],
            ];
        }

        return [
            'title' => $title,
            'layout' => 'template-real-panels',
            'speaker_notes' => 'Walk through each panel clearly and tie them together with one strong takeaway.',
            'canvas_settings' => [
                'background' => '#FFFFFF',
                'grid' => false,
            ],
            'elements' => array_merge(
                $this->templateRealDecorativeElements($theme),
                [
                    [
                        'type' => 'heading',
                        'name' => 'Slide heading',
                        'position' => 10,
                        'x' => 80,
                        'y' => 42,
                        'width' => 800,
                        'height' => 44,
                        'rotation' => 0,
                        'z_index' => 3,
                        'style' => ['fontSize' => 24, 'fontWeight' => 700, 'color' => '#1F2937', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                        'content' => ['text' => Str::upper($title)],
                    ],
                ],
                $cardElements,
            ),
        ];
    }

    private function templateRealDecorativeElements(array $theme): array
    {
        return [
            [
                'type' => 'shape',
                'name' => 'Top line left',
                'position' => 1,
                'x' => 120,
                'y' => 14,
                'width' => 300,
                'height' => 2,
                'rotation' => 0,
                'z_index' => 1,
                'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['primary']), 'borderColor' => 'transparent'],
                'content' => ['text' => ''],
            ],
            [
                'type' => 'shape',
                'name' => 'Top line right',
                'position' => 2,
                'x' => 540,
                'y' => 14,
                'width' => 300,
                'height' => 2,
                'rotation' => 0,
                'z_index' => 1,
                'style' => ['shape' => 'rectangle', 'background' => $this->themeColor($theme['accent']), 'borderColor' => 'transparent'],
                'content' => ['text' => ''],
            ],
            ...collect([
                ['x' => 470, 'color' => $this->themeColor($theme['primary'])],
                ['x' => 490, 'color' => $this->themeColor($theme['secondary'])],
                ['x' => 510, 'color' => $this->themeColor($theme['tertiary'] ?? 'FFE54B87')],
                ['x' => 530, 'color' => $this->themeColor($theme['accent'])],
            ])->map(fn (array $dot, int $index) => [
                'type' => 'shape',
                'name' => 'Top dot',
                'position' => 3 + $index,
                'x' => $dot['x'],
                'y' => 8,
                'width' => 8,
                'height' => 8,
                'rotation' => 0,
                'z_index' => 2,
                'style' => ['shape' => 'circle', 'background' => $dot['color'], 'borderColor' => 'transparent'],
                'content' => ['text' => ''],
            ])->all(),
        ];
    }

    private function buildInteractiveTemplateRealPreviewCards(array $theme): array
    {
        $palette = [
            $this->themeColor($theme['primary']),
            $this->themeColor($theme['secondary']),
            $this->themeColor($theme['tertiary'] ?? 'FFE54B87'),
            $this->themeColor($theme['accent']),
        ];
        $icons = ['★', '☾', '✹', '☁'];
        $titles = ['Focus', 'Narrative', 'Proof', 'Action'];

        $elements = [];
        foreach ($palette as $index => $color) {
            $x = 130 + ($index * 176);
            $elements[] = [
                'type' => 'shape',
                'name' => 'Preview card',
                'position' => 20 + ($index * 3),
                'x' => $x,
                'y' => 285,
                'width' => 158,
                'height' => 170,
                'rotation' => 0,
                'z_index' => 1,
                'style' => ['shape' => 'rectangle', 'background' => $color, 'borderColor' => 'transparent'],
                'content' => ['text' => ''],
            ];
            $elements[] = [
                'type' => 'text',
                'name' => 'Preview icon',
                'position' => 21 + ($index * 3),
                'x' => $x + 49,
                'y' => 313,
                'width' => 60,
                'height' => 28,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 24, 'fontWeight' => 700, 'color' => '#FFFFFF', 'textAlign' => 'center'],
                'content' => ['text' => $icons[$index]],
            ];
            $elements[] = [
                'type' => 'heading',
                'name' => 'Preview title',
                'position' => 22 + ($index * 3),
                'x' => $x + 24,
                'y' => 360,
                'width' => 110,
                'height' => 26,
                'rotation' => 0,
                'z_index' => 3,
                'style' => ['fontSize' => 17, 'fontWeight' => 700, 'color' => '#FFFFFF', 'fontFamily' => 'Times New Roman', 'textAlign' => 'center'],
                'content' => ['text' => $titles[$index]],
            ];
        }

        return $elements;
    }

    private function estimateInteractiveTextHeight(
        string $text,
        int $width,
        int $fontSize,
        int $lineHeight,
        int $minHeight,
        int $maxHeight,
    ): int {
        $normalized = trim($text);

        if ($normalized === '') {
            return $minHeight;
        }

        $charactersPerLine = max(18, (int) floor($width / max(8, $fontSize * 0.58)));
        $lines = 0;

        foreach (preg_split("/\r\n|\n|\r/", $normalized) ?: [] as $paragraph) {
            $paragraph = trim((string) $paragraph);

            if ($paragraph === '') {
                $lines += 1;
                continue;
            }

            $lines += max(1, (int) ceil(mb_strlen($paragraph) / $charactersPerLine));
        }

        $height = ($lines * $lineHeight) + 24;

        return max($minHeight, min($maxHeight, $height));
    }

    private function themeToGradient(array $theme, bool $hero): string
    {
        return $hero
            ? 'linear-gradient(135deg, '
                . $this->themeColor($theme['dark']) . ' 0%, '
                . $this->themeColor($theme['primary']) . ' 52%, '
                . $this->themeColor($theme['secondary']) . ' 100%)'
            : 'linear-gradient(135deg, '
                . $this->themeColor($theme['background']) . ' 0%, '
                . $this->themeColor($theme['soft']) . ' 100%)';
    }

    private function themeForInteractiveUi(array $theme): array
    {
        return [
            'background' => $this->themeColor($theme['background'] ?? $theme['dark']),
            'primary' => $this->themeColor($theme['primary']),
            'secondary' => $this->themeColor($theme['secondary']),
            'accent' => $this->themeColor($theme['accent']),
            'surface' => $this->themeColor($theme['soft'] ?? $theme['background']),
            'dark' => $this->themeColor($theme['dark']),
        ];
    }

    private function themeColor(string $hex): string
    {
        $normalized = strtoupper(ltrim(trim($hex), '#'));

        if (strlen($normalized) === 8) {
            $normalized = substr($normalized, 2);
        }

        return '#' . $normalized;
    }

    private function fillTitleSlide($slide, string $title, string $documentType, array $designStyles = ['mixed'], ?array $logo = null, string $logoPosition = 'top_right'): void
    {
        $theme = $this->titleTheme($designStyles);

        if (($theme['template'] ?? null) === 'template_real') {
            $this->fillTemplateRealTitleSlide($slide, $title, $documentType, $theme, $logo, $logoPosition);
            return;
        }

        if (($theme['template'] ?? null) === 'business_blue') {
            $this->fillBusinessBlueTitleSlide($slide, $title, $documentType, $theme, $logo, $logoPosition);
            return;
        }

        $this->setSlideBackground($slide, $theme['dark']);
        $this->addFilledShape($slide, 0, 0, 960, 90, $theme['primary']);
        $this->addFilledShape($slide, 700, 0, 260, 540, $theme['secondary']);
        $this->addFilledShape($slide, 675, 0, 36, 540, $theme['accent']);
        $this->addFilledShape($slide, 60, 145, 500, 6, $theme['accent']);

        $titleShape = $slide->createRichTextShape()
            ->setHeight(180)
            ->setWidth(600)
            ->setOffsetX(60)
            ->setOffsetY(175);
        $titleRun = $titleShape->getActiveParagraph()->createTextRun($title);
        $titleRun->getFont()
            ->setBold(true)
            ->setSize(40)
            ->setColor(new Color('FFFFFFFF'));

        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Presentation';
        $subtitleShape = $slide->createRichTextShape()
            ->setHeight(70)
            ->setWidth(560)
            ->setOffsetX(60)
            ->setOffsetY(360);
        $subtitleRun = $subtitleShape->getActiveParagraph()->createTextRun($subtitle);
        $subtitleRun->getFont()
            ->setSize(22)
            ->setColor(new Color('FFCCFBF1'));

        $dateShape = $slide->createRichTextShape()
            ->setHeight(40)
            ->setWidth(250)
            ->setOffsetX(60)
            ->setOffsetY(460);
        $dateRun = $dateShape->getActiveParagraph()->createTextRun(now()->format('F j, Y'));
        $dateRun->getFont()
            ->setSize(14)
            ->setColor(new Color('FFE2E8F0'));

        $this->addLogoToSlide($slide, $logo, $logoPosition, true);
    }

    private function fillContentSlide($slide, string $title, array $items, int $index = 0, array $designStyles = ['mixed'], ?array $logo = null, string $logoPosition = 'top_right'): void
    {
        $theme = $this->slideTheme($index, $designStyles);

        if (($theme['template'] ?? null) === 'template_real') {
            $this->fillTemplateRealContentSlide($slide, $title, $items, $index, $theme, $logo, $logoPosition);
            return;
        }

        $variant = ($theme['template'] ?? null) === 'business_blue' ? $index % 3 : $index % 4;

        $this->setSlideBackground($slide, $theme['background']);
        $this->paintSlideDesign($slide, $theme, $variant);

        $titleShape = $slide->createRichTextShape()
            ->setHeight(70)
            ->setWidth($variant === 1 ? 570 : 820)
            ->setOffsetX($variant === 1 ? 330 : 60)
            ->setOffsetY($variant === 1 ? 42 : 20);
        $titleRun = $titleShape->getActiveParagraph()->createTextRun($title);
        $titleRun->getFont()
            ->setBold(true)
            ->setSize($variant === 1 ? 30 : 26)
            ->setColor(new Color($variant === 2 ? $theme['dark'] : 'FFFFFFFF'));

        if ($chart = $this->chartFromSlideContent($title, $items)) {
            $this->fillChartSlide($slide, $title, $chart, $theme, $variant);
            $this->addLogoToSlide($slide, $logo, $logoPosition);
            return;
        }

        $bodyShape = $slide->createRichTextShape()
            ->setHeight($variant === 1 ? 330 : 320)
            ->setWidth($variant === 1 ? 520 : 760)
            ->setOffsetX($variant === 1 ? 340 : 105)
            ->setOffsetY($variant === 1 ? 150 : 155);
        $bodyShape->setAutoFit(RichText::AUTOFIT_NORMAL);

        foreach (array_values($items) as $index => $item) {
            $paragraph = $index === 0 ? $bodyShape->getActiveParagraph() : $bodyShape->createParagraph();
            $paragraph->getAlignment()->setMarginLeft($item['type'] === 'heading' ? 0 : 22);
            $paragraph->getAlignment()->setIndent($item['type'] === 'heading' ? 0 : -14);

            if ($item['type'] === 'bullet' || $item['type'] === 'numbered') {
                $paragraph->getBulletStyle()->setBulletType(
                    $item['type'] === 'numbered' ? Bullet::TYPE_NUMERIC : Bullet::TYPE_BULLET
                );
            }

            $run = $paragraph->createTextRun($item['text']);
            $run->getFont()
                ->setSize($item['type'] === 'heading' ? 20 : 18)
                ->setBold($item['type'] === 'heading')
                ->setColor(new Color($item['type'] === 'heading' ? $theme['primary'] : 'FF1F2937'));
        }

        $this->addLogoToSlide($slide, $logo, $logoPosition);
    }

    private function fillChartSlide($slide, string $title, array $chartData, array $theme, int $variant): void
    {
        if ($variant === 1) {
            $this->addFilledShape($slide, 330, 136, 540, 336, 'FFFFFFFF');
            $this->addFilledShape($slide, 330, 136, 540, 10, $chartData['accent']);
            $chartX = 350;
            $chartWidth = 500;
        } else {
            $this->addFilledShape($slide, 96, 138, 768, 330, 'FFFFFFFF');
            $this->addFilledShape($slide, 96, 138, 768, 10, $chartData['accent']);
            $chartX = 120;
            $chartWidth = 720;
        }

        $chart = $slide->createChartShape()
            ->setName($title)
            ->setResizeProportional(false)
            ->setHeight(300)
            ->setWidth($chartWidth)
            ->setOffsetX($chartX)
            ->setOffsetY(160);
        $chart->setIncludeSpreadsheet(true);
        $chart->getTitle()->setText($chartData['label']);
        $chart->getTitle()->getFont()->setSize(16)->setBold(true);

        $series = new Series($chartData['series_title'], $chartData['values']);
        $series->setShowValue(true);

        foreach (array_values($chartData['colors']) as $index => $color) {
            $series->getDataPointFill($index)
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color($color));
        }

        if ($chartData['type'] === 'pie') {
            $series->setShowPercentage(true);
            $series->setShowCategoryName(true);
            $series->setShowValue(false);

            $type = new Pie();
            $chart->getLegend()
                ->setVisible(true)
                ->setPosition(Legend::POSITION_RIGHT);
        } else {
            $series->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color($chartData['accent']));

            $type = (new Bar())
                ->setBarDirection(AbstractTypeBar::DIRECTION_VERTICAL)
                ->setBarGrouping(AbstractTypeBar::GROUPING_CLUSTERED)
                ->setGapWidthPercent($chartData['type'] === 'histogram' ? 30 : 80);
            $chart->getLegend()->setVisible(false);
        }

        $type->addSeries($series);
        $chart->getPlotArea()->setType($type);

        $caption = match ($chartData['type']) {
            'pie' => 'Share of total',
            'histogram' => 'Distribution by range',
            default => 'Comparison by category',
        };
        $captionShape = $slide->createRichTextShape()
            ->setHeight(35)
            ->setWidth(360)
            ->setOffsetX($chartX)
            ->setOffsetY(486);
        $captionRun = $captionShape->getActiveParagraph()->createTextRun($caption);
        $captionRun->getFont()
            ->setSize(12)
            ->setColor(new Color('FF64748B'));
    }

    private function paintSlideDesign($slide, array $theme, int $variant): void
    {
        if (($theme['template'] ?? null) === 'template_real') {
            $this->paintTemplateRealSlideDesign($slide, $theme);
            return;
        }

        if (($theme['template'] ?? null) === 'business_blue') {
            $this->paintBusinessBlueSlideDesign($slide, $theme, $variant);
            return;
        }

        if ($variant === 0) {
            $this->addFilledShape($slide, 0, 0, 960, 76, $theme['primary']);
            $this->addFilledShape($slide, 0, 76, 960, 8, $theme['accent']);
            $this->addFilledShape($slide, 64, 125, 832, 355, 'FFFFFFFF');
            $this->addFilledShape($slide, 64, 125, 10, 355, $theme['secondary']);
            $this->addFilledShape($slide, 820, 492, 76, 6, $theme['primary']);
            return;
        }

        if ($variant === 1) {
            $this->addFilledShape($slide, 0, 0, 285, 540, $theme['primary']);
            $this->addFilledShape($slide, 285, 0, 28, 540, $theme['accent']);
            $this->addFilledShape($slide, 340, 130, 530, 350, 'FFFFFFFF');
            $this->addFilledShape($slide, 54, 90, 150, 8, 'FFFFFFFF');
            $this->addFilledShape($slide, 78, 420, 130, 42, $theme['secondary']);
            return;
        }

        if ($variant === 2) {
            $this->addFilledShape($slide, 0, 0, 960, 540, 'FFFFFFFF');
            $this->addFilledShape($slide, 0, 0, 960, 32, $theme['accent']);
            $this->addFilledShape($slide, 0, 508, 960, 32, $theme['primary']);
            $this->addFilledShape($slide, 70, 118, 820, 340, $theme['soft']);
            $this->addFilledShape($slide, 70, 118, 820, 8, $theme['secondary']);
            return;
        }

        $this->addFilledShape($slide, 0, 0, 960, 540, $theme['dark']);
        $this->addFilledShape($slide, 0, 0, 960, 92, $theme['secondary']);
        $this->addFilledShape($slide, 70, 138, 820, 338, 'FFFFFFFF');
        $this->addFilledShape($slide, 735, 0, 225, 540, $theme['primary']);
        $this->addFilledShape($slide, 70, 138, 8, 338, $theme['accent']);
    }

    private function slideTheme(int $index, array $designStyles = ['mixed']): array
    {
        $themes = $this->designThemes($designStyles);

        return $themes[$index % count($themes)];
    }

    private function titleTheme(array $designStyles = ['mixed']): array
    {
        return $this->designThemes($designStyles)[0];
    }

    private function designThemes(array $designStyles = ['mixed']): array
    {
        $mixedThemes = [
            ['background' => 'FFF8FAFC', 'primary' => 'FF0F766E', 'secondary' => 'FF2563EB', 'accent' => 'FFF59E0B', 'soft' => 'FFEFFAF8', 'dark' => 'FF0F172A'],
            ['background' => 'FFFFFBEB', 'primary' => 'FF7C2D12', 'secondary' => 'FF0F766E', 'accent' => 'FF2563EB', 'soft' => 'FFFFF7ED', 'dark' => 'FF1C1917'],
            ['background' => 'FFF7F7FF', 'primary' => 'FF4338CA', 'secondary' => 'FFDB2777', 'accent' => 'FF14B8A6', 'soft' => 'FFF0F9FF', 'dark' => 'FF111827'],
            ['background' => 'FFF8FAFC', 'primary' => 'FF16A34A', 'secondary' => 'FF0F172A', 'accent' => 'FFF97316', 'soft' => 'FFF0FDF4', 'dark' => 'FF052E16'],
        ];

        $styleThemes = [
            'template_real' => [
                [
                    'background' => 'FFFFFFFF',
                    'primary' => 'FF7F59AE',
                    'secondary' => 'FF60C4E4',
                    'accent' => 'FFF8B621',
                    'tertiary' => 'FFE54B87',
                    'soft' => 'FFF8F7FC',
                    'dark' => 'FF1F2937',
                    'template' => 'template_real',
                ],
            ],
            'sgmms_proposal' => [
                [
                    'background' => 'FFF7F8FA',
                    'primary' => 'FF22409A',
                    'secondary' => 'FF233A63',
                    'accent' => 'FF1ED6A2',
                    'tertiary' => 'FF3B82F6',
                    'soft' => 'FFEAF2FF',
                    'dark' => 'FF111A31',
                    'template' => 'sgmms_proposal',
                ],
            ],
            'business_blue' => [
                ['background' => 'FFF8FAFC', 'primary' => 'FF0E3A67', 'secondary' => 'FF14548D', 'accent' => 'FF3C7FB1', 'soft' => 'FFF2F6FA', 'dark' => 'FF092847', 'template' => 'business_blue'],
                ['background' => 'FFFFFFFF', 'primary' => 'FF123E6B', 'secondary' => 'FF1A5C97', 'accent' => 'FF5D92BC', 'soft' => 'FFF4F7FA', 'dark' => 'FF0B2C4B', 'template' => 'business_blue'],
                ['background' => 'FFF8FBFD', 'primary' => 'FF163F68', 'secondary' => 'FF245E8C', 'accent' => 'FF789FBE', 'soft' => 'FFF0F5F9', 'dark' => 'FF0C2B47', 'template' => 'business_blue'],
            ],
            'boardroom' => [
                ['background' => 'FFF8F8F6', 'primary' => 'FF232B38', 'secondary' => 'FF4A5568', 'accent' => 'FFC8A96A', 'soft' => 'FFF3F1EC', 'dark' => 'FF111827'],
                ['background' => 'FFFFFFFF', 'primary' => 'FF1F2937', 'secondary' => 'FF6B7280', 'accent' => 'FFD4B483', 'soft' => 'FFF7F5F0', 'dark' => 'FF0F172A'],
            ],
            'editorial' => [
                ['background' => 'FFFFFCF7', 'primary' => 'FF1C1917', 'secondary' => 'FF57534E', 'accent' => 'FFB45309', 'soft' => 'FFFAF6ED', 'dark' => 'FF0C0A09'],
                ['background' => 'FFFFFFFF', 'primary' => 'FF292524', 'secondary' => 'FF78716C', 'accent' => 'FFD97706', 'soft' => 'FFFFFBF2', 'dark' => 'FF1C1917'],
            ],
            'tech_grid' => [
                ['background' => 'FFF4F9FF', 'primary' => 'FF0F172A', 'secondary' => 'FF0EA5E9', 'accent' => 'FF22C55E', 'soft' => 'FFEAF6FF', 'dark' => 'FF020617'],
                ['background' => 'FFF8FAFC', 'primary' => 'FF111827', 'secondary' => 'FF2563EB', 'accent' => 'FF14B8A6', 'soft' => 'FFF1F5F9', 'dark' => 'FF030712'],
            ],
            'financial_clean' => [
                ['background' => 'FFF8FAFC', 'primary' => 'FF14532D', 'secondary' => 'FF166534', 'accent' => 'FF94A3B8', 'soft' => 'FFF2F8F4', 'dark' => 'FF052E16'],
                ['background' => 'FFFFFFFF', 'primary' => 'FF1E3A2E', 'secondary' => 'FF15803D', 'accent' => 'FF64748B', 'soft' => 'FFF4FAF6', 'dark' => 'FF0F241A'],
            ],
            'corporate' => [
                ['background' => 'FFF8FAFC', 'primary' => 'FF1D4ED8', 'secondary' => 'FF0F172A', 'accent' => 'FF38BDF8', 'soft' => 'FFEFF6FF', 'dark' => 'FF111827'],
                ['background' => 'FFF1F5F9', 'primary' => 'FF334155', 'secondary' => 'FF2563EB', 'accent' => 'FF14B8A6', 'soft' => 'FFFFFFFF', 'dark' => 'FF0F172A'],
            ],
            'creative' => [
                ['background' => 'FFFDF2F8', 'primary' => 'FFDB2777', 'secondary' => 'FF7C3AED', 'accent' => 'FFF97316', 'soft' => 'FFFFF1F2', 'dark' => 'FF312E81'],
                ['background' => 'FFF0FDFA', 'primary' => 'FF0D9488', 'secondary' => 'FF9333EA', 'accent' => 'FFFACC15', 'soft' => 'FFECFEFF', 'dark' => 'FF134E4A'],
            ],
            'minimalist' => [
                ['background' => 'FFFFFFFF', 'primary' => 'FF111827', 'secondary' => 'FF64748B', 'accent' => 'FFEAB308', 'soft' => 'FFF8FAFC', 'dark' => 'FF020617'],
                ['background' => 'FFF8FAFC', 'primary' => 'FF334155', 'secondary' => 'FF0F172A', 'accent' => 'FF94A3B8', 'soft' => 'FFFFFFFF', 'dark' => 'FF111827'],
            ],
            'dark' => [
                ['background' => 'FF020617', 'primary' => 'FF7C3AED', 'secondary' => 'FF0EA5E9', 'accent' => 'FF22C55E', 'soft' => 'FF111827', 'dark' => 'FF020617'],
                ['background' => 'FF111827', 'primary' => 'FF14B8A6', 'secondary' => 'FF334155', 'accent' => 'FFF97316', 'soft' => 'FF1F2937', 'dark' => 'FF030712'],
            ],
            'warm' => [
                ['background' => 'FFFFFBEB', 'primary' => 'FFB45309', 'secondary' => 'FF9A3412', 'accent' => 'FFDC2626', 'soft' => 'FFFFF7ED', 'dark' => 'FF431407'],
                ['background' => 'FFFFF1F2', 'primary' => 'FFBE123C', 'secondary' => 'FF7C2D12', 'accent' => 'FFF59E0B', 'soft' => 'FFFFFBEB', 'dark' => 'FF450A0A'],
            ],
        ];

        $normalizedStyles = $this->normalizeDesignStyles($designStyles);

        if ($normalizedStyles === ['mixed']) {
            return $mixedThemes;
        }

        $themes = [];

        foreach ($normalizedStyles as $style) {
            foreach ($styleThemes[$style] ?? [] as $theme) {
                $themes[] = $theme;
            }
        }

        return $themes !== [] ? $themes : $mixedThemes;
    }

    private function normalizeDesignStyles(mixed $designStyle): array
    {
        $rawStyles = is_array($designStyle)
            ? $designStyle
            : (preg_split('/(?:,|\/|\||\+| and )/i', (string) $designStyle) ?: []);

        $styles = collect($rawStyles)
            ->map(fn ($style) => $this->normalizeDesignStyleToken((string) $style))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if ($styles === [] || in_array('mixed', $styles, true)) {
            return ['mixed'];
        }

        return $styles;
    }

    private function normalizeDesignStyleToken(string $designStyle): ?string
    {
        $style = Str::of($designStyle)->trim()->lower()->replace([' ', '_'], '-')->toString();

        if ($style === '') {
            return null;
        }

        return match ($style) {
            'template-real', 'real-template', 'odp-template', 'infographic-panels', 'four-panel', 'four-panels', 'color-panels' => 'template_real',
            'sgmms-proposal', 'sgmms', 'ministry-proposal', 'government-proposal', 'erp-proposal' => 'sgmms_proposal',
            'business-blue', 'business-slide', 'business-template', 'strategy-template', 'blue-template' => 'business_blue',
            'boardroom', 'executive', 'executive-deck', 'luxury-business' => 'boardroom',
            'editorial', 'magazine', 'print-style', 'reportage' => 'editorial',
            'tech-grid', 'tech', 'saas', 'dashboard', 'product-launch' => 'tech_grid',
            'financial-clean', 'finance', 'investor', 'banking', 'annual-report' => 'financial_clean',
            'business', 'professional', 'corporate-blue', 'blue' => 'corporate',
            'fun', 'bold', 'colorful', 'creative-color' => 'creative',
            'simple', 'clean', 'minimal', 'minimalist-clean' => 'minimalist',
            'dark-mode', 'dark-editorial', 'night' => 'dark',
            'orange', 'earthy', 'sunset' => 'warm',
            'corporate', 'creative', 'minimalist', 'dark', 'warm', 'business_blue', 'boardroom', 'editorial', 'tech_grid', 'financial_clean', 'template_real', 'sgmms_proposal' => $style,
            'mixed' => 'template_real',
            default => null,
        };
    }

    private function resolvePresentationDesignStyles(mixed $explicitStyles, mixed $designDescription = null): array
    {
        $styles = $this->normalizeDesignStyles($explicitStyles);

        if ($styles !== ['mixed']) {
            return $styles;
        }

        if (!is_string($designDescription) || trim($designDescription) === '') {
            return $styles;
        }

        $matched = $this->matchDesignStylesFromDescription($designDescription);

        return $matched !== [] ? $matched : $styles;
    }

    private function matchDesignStylesFromDescription(string $description): array
    {
        $haystack = Str::of($description)->lower()->replace(['_', '-'], ' ')->toString();
        $catalog = $this->presentationDesignLibrary();
        $scores = [];

        foreach ($catalog as $style => $meta) {
            $score = 0;

            foreach ($meta['keywords'] as $keyword) {
                if (str_contains($haystack, $keyword)) {
                    $score += 2;
                }
            }

            foreach ($meta['traits'] as $trait) {
                if (str_contains($haystack, $trait)) {
                    $score += 1;
                }
            }

            if ($score > 0) {
                $scores[$style] = $score;
            }
        }

        arsort($scores);

        return array_slice(array_keys($scores), 0, 2);
    }

    private function presentationDesignLibrary(): array
    {
        return [
            'template_real' => [
                'keywords' => ['template-real', 'infographic cards', 'four panels', 'bright cards', 'color blocks', 'odp'],
                'traits' => ['playful', 'structured', 'icons', 'serif headings', 'white background'],
            ],
            'sgmms_proposal' => [
                'keywords' => ['sgmms', 'state government ministry management system', 'official proposal', 'government erp', 'ministry proposal'],
                'traits' => ['dark navy hero', 'teal accents', 'blue headings', 'white cards', 'formal proposal'],
            ],
            'business_blue' => [
                'keywords' => ['blue', 'strategy', 'corporate', 'business template', 'angled panels', 'infographic'],
                'traits' => ['executive', 'clean', 'professional', 'consulting', 'report'],
            ],
            'boardroom' => [
                'keywords' => ['boardroom', 'executive', 'luxury', 'premium', 'formal'],
                'traits' => ['serious', 'confident', 'mature', 'gold accents', 'dark neutral'],
            ],
            'editorial' => [
                'keywords' => ['editorial', 'magazine', 'print', 'article', 'storytelling'],
                'traits' => ['elegant', 'text heavy', 'clean typography', 'refined', 'publication'],
            ],
            'tech_grid' => [
                'keywords' => ['tech', 'saas', 'product', 'dashboard', 'startup', 'data'],
                'traits' => ['grid', 'modern', 'digital', 'product launch', 'innovation'],
            ],
            'financial_clean' => [
                'keywords' => ['finance', 'banking', 'investor', 'earnings', 'annual report'],
                'traits' => ['green', 'trust', 'clean', 'metrics', 'structured'],
            ],
            'corporate' => [
                'keywords' => ['corporate', 'professional', 'business', 'office'],
                'traits' => ['blue', 'clean', 'formal', 'simple'],
            ],
            'creative' => [
                'keywords' => ['creative', 'bold', 'colorful', 'campaign', 'brand'],
                'traits' => ['playful', 'vibrant', 'expressive', 'energetic'],
            ],
            'minimalist' => [
                'keywords' => ['minimalist', 'minimal', 'simple', 'clean', 'white space'],
                'traits' => ['spacious', 'subtle', 'calm', 'pared back'],
            ],
            'dark' => [
                'keywords' => ['dark', 'night', 'black', 'charcoal'],
                'traits' => ['dramatic', 'high contrast', 'modern'],
            ],
            'warm' => [
                'keywords' => ['warm', 'friendly', 'earthy', 'sunset'],
                'traits' => ['human', 'inviting', 'soft'],
            ],
        ];
    }

    private function fillTemplateRealTitleSlide($slide, string $title, string $documentType, array $theme, ?array $logo = null, string $logoPosition = 'top_right'): void
    {
        $this->setSlideBackground($slide, 'FFFFFFFF');
        $this->paintTemplateRealSlideDesign($slide, $theme);

        $titleShape = $slide->createRichTextShape()
            ->setHeight(110)
            ->setWidth(760)
            ->setOffsetX(100)
            ->setOffsetY(110);
        $titleShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $titleRun = $titleShape->getActiveParagraph()->createTextRun(Str::upper($title));
        $titleRun->getFont()
            ->setName('Times New Roman')
            ->setBold(true)
            ->setSize(28)
            ->setColor(new Color($theme['dark']));

        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'AI Presentation';
        $subtitleShape = $slide->createRichTextShape()
            ->setHeight(36)
            ->setWidth(520)
            ->setOffsetX(220)
            ->setOffsetY(218);
        $subtitleShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $subtitleRun = $subtitleShape->getActiveParagraph()->createTextRun($subtitle);
        $subtitleRun->getFont()
            ->setSize(15)
            ->setColor(new Color('FF64748B'));

        $previewCards = [
            [$theme['primary'], '★'],
            [$theme['secondary'], '☾'],
            [$theme['tertiary'] ?? 'FFE54B87', '✹'],
            [$theme['accent'], '☁'],
        ];

        foreach ($previewCards as $index => [$color, $icon]) {
            $x = 130 + ($index * 176);
            $this->addFilledShape($slide, $x, 285, 158, 170, $color);

            $iconShape = $slide->createRichTextShape()
                ->setHeight(32)
                ->setWidth(50)
                ->setOffsetX($x + 54)
                ->setOffsetY(315);
            $iconShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $iconRun = $iconShape->getActiveParagraph()->createTextRun($icon);
            $iconRun->getFont()
                ->setSize(24)
                ->setColor(new Color('FFFFFFFF'));

            $labelShape = $slide->createRichTextShape()
                ->setHeight(32)
                ->setWidth(110)
                ->setOffsetX($x + 24)
                ->setOffsetY(362);
            $labelShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $labelRun = $labelShape->getActiveParagraph()->createTextRun(match ($index) {
                0 => 'Focus',
                1 => 'Narrative',
                2 => 'Proof',
                default => 'Action',
            });
            $labelRun->getFont()
                ->setName('Times New Roman')
                ->setBold(true)
                ->setSize(17)
                ->setColor(new Color('FFFFFFFF'));
        }

        $this->addLogoToSlide($slide, $logo, $logoPosition, true);
    }

    private function fillTemplateRealContentSlide($slide, string $title, array $items, int $index, array $theme, ?array $logo = null, string $logoPosition = 'top_right'): void
    {
        $this->setSlideBackground($slide, 'FFFFFFFF');
        $this->paintTemplateRealSlideDesign($slide, $theme);

        $titleShape = $slide->createRichTextShape()
            ->setHeight(48)
            ->setWidth(820)
            ->setOffsetX(70)
            ->setOffsetY(42);
        $titleShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $titleRun = $titleShape->getActiveParagraph()->createTextRun(Str::upper($title));
        $titleRun->getFont()
            ->setName('Times New Roman')
            ->setBold(true)
            ->setSize(24)
            ->setColor(new Color($theme['dark']));

        if ($chart = $this->chartFromSlideContent($title, $items)) {
            $this->fillTemplateRealChartSlide($slide, $title, $chart, $theme);
            $this->addLogoToSlide($slide, $logo, $logoPosition);
            return;
        }

        $cards = $this->templateRealCardsFromItems($title, $items);
        $palette = [
            $theme['primary'],
            $theme['secondary'],
            $theme['tertiary'] ?? 'FFE54B87',
            $theme['accent'],
        ];
        $icons = ['★', '☾', '✹', '☁'];

        foreach ($cards as $cardIndex => $card) {
            $x = 0 + ($cardIndex * 240);
            $this->addFilledShape($slide, $x, 112, 240, 360, $palette[$cardIndex]);

            $iconShape = $slide->createRichTextShape()
                ->setHeight(34)
                ->setWidth(60)
                ->setOffsetX($x + 90)
                ->setOffsetY(148);
            $iconShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $iconRun = $iconShape->getActiveParagraph()->createTextRun($icons[$cardIndex]);
            $iconRun->getFont()
                ->setSize(26)
                ->setColor(new Color('FFFFFFFF'));

            $headingShape = $slide->createRichTextShape()
                ->setHeight(42)
                ->setWidth(180)
                ->setOffsetX($x + 30)
                ->setOffsetY(196);
            $headingShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $headingRun = $headingShape->getActiveParagraph()->createTextRun($card['title']);
            $headingRun->getFont()
                ->setName('Times New Roman')
                ->setBold(true)
                ->setSize(18)
                ->setColor(new Color('FFFFFFFF'));

            $bodyShape = $slide->createRichTextShape()
                ->setHeight(180)
                ->setWidth(180)
                ->setOffsetX($x + 30)
                ->setOffsetY(252);
            $bodyShape->setAutoFit(RichText::AUTOFIT_NORMAL);
            $bodyShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $bodyRun = $bodyShape->getActiveParagraph()->createTextRun($card['body']);
            $bodyRun->getFont()
                ->setSize(12)
                ->setColor(new Color('FF102A43'));
        }

        $this->addLogoToSlide($slide, $logo, $logoPosition);
    }

    private function fillTemplateRealChartSlide($slide, string $title, array $chartData, array $theme): void
    {
        $this->addFilledShape($slide, 40, 132, 220, 304, $theme['primary']);
        $this->addFilledShape($slide, 300, 132, 620, 304, 'FFFFFFFF');

        $summaryShape = $slide->createRichTextShape()
            ->setHeight(220)
            ->setWidth(170)
            ->setOffsetX(66)
            ->setOffsetY(176);
        $summaryShape->setAutoFit(RichText::AUTOFIT_NORMAL);
        $summaryShape->getActiveParagraph()->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $summaryRun = $summaryShape->getActiveParagraph()->createTextRun($chartData['label'] . "\n\n" . match ($chartData['type']) {
            'pie' => 'Composition view',
            'histogram' => 'Range distribution',
            default => 'Category comparison',
        });
        $summaryRun->getFont()
            ->setName('Times New Roman')
            ->setBold(true)
            ->setSize(18)
            ->setColor(new Color('FFFFFFFF'));

        $chart = $slide->createChartShape()
            ->setName($title)
            ->setResizeProportional(false)
            ->setHeight(248)
            ->setWidth(560)
            ->setOffsetX(330)
            ->setOffsetY(160);
        $chart->setIncludeSpreadsheet(true);
        $chart->getTitle()->setText($chartData['label']);
        $chart->getTitle()->getFont()->setSize(16)->setBold(true);

        $series = new Series($chartData['series_title'], $chartData['values']);
        $series->setShowValue(true);

        foreach (array_values($chartData['colors']) as $pointIndex => $color) {
            $series->getDataPointFill($pointIndex)
                ->setFillType(Fill::FILL_SOLID)
                ->setStartColor(new Color($color));
        }

        if ($chartData['type'] === 'pie') {
            $series->setShowPercentage(true);
            $series->setShowCategoryName(true);
            $series->setShowValue(false);
            $type = new Pie();
            $chart->getLegend()->setVisible(true)->setPosition(Legend::POSITION_RIGHT);
        } else {
            $type = (new Bar())
                ->setBarDirection(AbstractTypeBar::DIRECTION_VERTICAL)
                ->setBarGrouping(AbstractTypeBar::GROUPING_CLUSTERED)
                ->setGapWidthPercent($chartData['type'] === 'histogram' ? 30 : 70);
            $chart->getLegend()->setVisible(false);
        }

        $type->addSeries($series);
        $chart->getPlotArea()->setType($type);
    }

    private function paintTemplateRealSlideDesign($slide, array $theme): void
    {
        $this->addFilledShape($slide, 0, 0, 960, 540, 'FFFFFFFF');
        $this->addFilledShape($slide, 120, 14, 300, 2, $theme['primary']);
        $this->addFilledShape($slide, 540, 14, 300, 2, $theme['accent']);

        foreach ([
            ['x' => 470, 'color' => $theme['primary']],
            ['x' => 490, 'color' => $theme['secondary']],
            ['x' => 510, 'color' => $theme['tertiary'] ?? 'FFE54B87'],
            ['x' => 530, 'color' => $theme['accent']],
        ] as $dot) {
            $circle = $slide->createAutoShape()
                ->setType(AutoShape::TYPE_OVAL)
                ->setOffsetX($dot['x'])
                ->setOffsetY(9)
                ->setWidth(8)
                ->setHeight(8);
            $circle->getFill()->setFillType(Fill::FILL_SOLID)->setStartColor(new Color($dot['color']));
            $circle->getOutline()->getFill()->setFillType(Fill::FILL_NONE);
        }
    }

    private function templateRealCardsFromItems(string $slideTitle, array $items): array
    {
        $texts = collect($items)
            ->filter(fn (array $item) => in_array($item['type'], ['paragraph', 'bullet', 'numbered', 'heading'], true))
            ->map(fn (array $item) => trim((string) $item['text']))
            ->filter()
            ->values();

        if ($texts->isEmpty()) {
            $texts = collect([
                'Clarify the core message and context.',
                'Show the supporting detail that matters most.',
                'Highlight the proof point or metric.',
                'Close with the next action or takeaway.',
            ]);
        }

        $chunks = array_chunk($texts->all(), max(1, (int) ceil($texts->count() / 4)));
        $cards = [];

        for ($i = 0; $i < 4; $i++) {
            $chunk = $chunks[$i] ?? [];
            $raw = trim(implode("\n", $chunk));
            if ($raw === '') {
                $raw = match ($i) {
                    0 => 'Open with the essential context for this slide.',
                    1 => 'Add the most useful supporting explanation.',
                    2 => 'Show the proof point that builds confidence.',
                    default => 'Finish with the decision or next move.',
                };
            }

            $firstSentence = trim((string) preg_split('/[\.\!\?\n]/', $raw)[0]);
            $cardTitle = Str::title(Str::limit($firstSentence !== '' ? $firstSentence : $slideTitle, 18, ''));
            $cardTitle = Str::words($cardTitle, 2, '');
            $body = Str::limit($raw, 180, '...');

            $cards[] = [
                'title' => $cardTitle !== '' ? $cardTitle : ('Panel ' . ($i + 1)),
                'body' => $body,
            ];
        }

        return $cards;
    }

    private function fillBusinessBlueTitleSlide($slide, string $title, string $documentType, array $theme, ?array $logo = null, string $logoPosition = 'top_right'): void
    {
        $this->setSlideBackground($slide, 'FFF6F8FA');
        $this->addFilledShape($slide, 0, 0, 332, 540, $theme['primary']);
        $this->addFilledShape($slide, 244, 0, 72, 540, $theme['secondary']);
        $this->addFilledShape($slide, 300, 0, 18, 540, $theme['accent']);
        $this->addFilledShape($slide, 360, 0, 600, 540, 'FFFFFFFF');
        $this->addFilledShape($slide, 532, 350, 238, 70, 'FFF4F7FA');
        $this->addFilledShape($slide, 552, 380, 180, 4, $theme['accent']);
        $this->addFilledShape($slide, 402, 100, 430, 1, 'FFE2E8F0');

        $titleShape = $slide->createRichTextShape()
            ->setHeight(170)
            ->setWidth(228)
            ->setOffsetX(44)
            ->setOffsetY(164);
        $titleRun = $titleShape->getActiveParagraph()->createTextRun(Str::upper($title));
        $titleRun->getFont()
            ->setBold(true)
            ->setSize(24)
            ->setColor(new Color('FFFFFFFF'));

        $subtitle = $documentType !== 'general' ? Str::headline($documentType) : 'Business Presentation';
        $subtitleShape = $slide->createRichTextShape()
            ->setHeight(40)
            ->setWidth(250)
            ->setOffsetX(44)
            ->setOffsetY(350);
        $subtitleRun = $subtitleShape->getActiveParagraph()->createTextRun(Str::upper($subtitle));
        $subtitleRun->getFont()
            ->setSize(12)
            ->setColor(new Color('FFD8E5F3'));

        $dateShape = $slide->createRichTextShape()
            ->setHeight(35)
            ->setWidth(250)
            ->setOffsetX(44)
            ->setOffsetY(380);
        $dateRun = $dateShape->getActiveParagraph()->createTextRun(now()->format('F Y'));
        $dateRun->getFont()
            ->setSize(11)
            ->setColor(new Color('FFE7EFF8'));

        $calloutShape = $slide->createRichTextShape()
            ->setHeight(56)
            ->setWidth(190)
            ->setOffsetX(552)
            ->setOffsetY(364);
        $calloutRun = $calloutShape->getActiveParagraph()->createTextRun('Executive strategy update');
        $calloutRun->getFont()
            ->setSize(13)
            ->setBold(true)
            ->setColor(new Color($theme['primary']));

        $this->addLogoToSlide($slide, $logo, $logoPosition, true);
    }

    private function paintBusinessBlueSlideDesign($slide, array $theme, int $variant): void
    {
        if ($variant === 0) {
            $this->addFilledShape($slide, 0, 0, 960, 540, 'FFFFFFFF');
            $this->addFilledShape($slide, 0, 0, 300, 540, $theme['primary']);
            $this->addFilledShape($slide, 222, 0, 72, 540, $theme['secondary']);
            $this->addFilledShape($slide, 278, 0, 16, 540, $theme['accent']);
            $this->addFilledShape($slide, 332, 120, 570, 324, 'FFFFFFFF');
            $this->addFilledShape($slide, 332, 120, 570, 4, $theme['accent']);
            return;
        }

        if ($variant === 1) {
            $this->addFilledShape($slide, 0, 0, 960, 540, 'FFFFFFFF');
            $this->addFilledShape($slide, 0, 0, 960, 88, $theme['primary']);
            $this->addFilledShape($slide, 568, 0, 212, 88, $theme['secondary']);
            $this->addFilledShape($slide, 750, 0, 22, 88, $theme['accent']);
            $this->addFilledShape($slide, 72, 136, 816, 308, 'FFF6F8FB');
            $this->addFilledShape($slide, 72, 136, 816, 4, $theme['accent']);
            return;
        }

        $this->addFilledShape($slide, 0, 0, 960, 540, 'FFF6F9FB');
        $this->addFilledShape($slide, 676, 0, 284, 540, $theme['primary']);
        $this->addFilledShape($slide, 640, 0, 44, 540, $theme['secondary']);
        $this->addFilledShape($slide, 628, 0, 14, 540, $theme['accent']);
        $this->addFilledShape($slide, 64, 130, 500, 314, 'FFFFFFFF');
        $this->addFilledShape($slide, 64, 130, 500, 4, $theme['accent']);
    }

    private function summarizeDesignStyles(array $designStyles): string
    {
        return count($designStyles) === 1
            ? $designStyles[0]
            : implode(', ', $designStyles);
    }

    private function setSlideBackground($slide, string $argb): void
    {
        $background = new BackgroundColor();
        $background->setColor(new Color($argb));
        $slide->setBackground($background);
    }

    private function addFilledShape($slide, int $x, int $y, int $width, int $height, string $argb): void
    {
        $shape = $slide->createAutoShape()
            ->setType(AutoShape::TYPE_RECTANGLE)
            ->setOffsetX($x)
            ->setOffsetY($y)
            ->setWidth($width)
            ->setHeight($height);

        $shape->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->setStartColor(new Color($argb));
        $shape->getOutline()->getFill()->setFillType(Fill::FILL_NONE);
    }

    private function chartFromSlideContent(string $title, array $items): ?array
    {
        $chartType = $this->detectChartType($title);

        if ($chartType === null) {
            foreach ($items as $item) {
                $chartType = $this->detectChartType($item['text']);
                if ($chartType !== null) {
                    break;
                }
            }
        }

        if ($chartType === null) {
            return null;
        }

        $values = [];
        foreach ($items as $item) {
            if ($item['type'] === 'heading') {
                continue;
            }

            if (preg_match('/^(.+?)\s*(?::|=|-|–|—)\s*(-?\d+(?:\.\d+)?)\s*%?$/', $item['text'], $matches)) {
                $label = trim($matches[1]);
                $value = (float) $matches[2];

                if ($label !== '') {
                    $values[$label] = (string) $value;
                }
            }
        }

        if (count($values) < 2) {
            return null;
        }

        return [
            'type' => $chartType,
            'label' => $this->chartTitle($title, $chartType),
            'series_title' => $chartType === 'histogram' ? 'Frequency' : 'Value',
            'values' => $values,
            'accent' => match ($chartType) {
                'pie' => 'FF2563EB',
                'histogram' => 'FF7C3AED',
                default => 'FF14B8A6',
            },
            'colors' => $this->chartColors(count($values)),
        ];
    }

    private function detectChartType(string $text): ?string
    {
        $lower = Str::lower($text);

        return match (true) {
            str_contains($lower, 'pie chart') || preg_match('/\bpie\b/', $lower) => 'pie',
            str_contains($lower, 'histogram') => 'histogram',
            str_contains($lower, 'bar chart') || str_contains($lower, 'column chart') => 'bar',
            default => null,
        };
    }

    private function chartTitle(string $title, string $chartType): string
    {
        $clean = trim(preg_replace('/\b(bar chart|column chart|pie chart|histogram|chart)\b/i', '', $title) ?? $title);

        return $clean !== '' ? $clean : Str::headline($chartType);
    }

    private function chartColors(int $count): array
    {
        $palette = [
            'FF14B8A6',
            'FF2563EB',
            'FFF59E0B',
            'FFEF4444',
            'FF7C3AED',
            'FF22C55E',
            'FF0EA5E9',
            'FFF97316',
        ];

        $colors = [];
        for ($index = 0; $index < $count; $index++) {
            $colors[] = $palette[$index % count($palette)];
        }

        return $colors;
    }

    private function normalizeLogoImage(mixed $logoImage): ?array
    {
        if (!is_array($logoImage)) {
            return null;
        }

        $type = (string) ($logoImage['type'] ?? '');
        $data = (string) ($logoImage['data'] ?? '');

        if (!in_array($type, ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'], true)) {
            return null;
        }

        if (!str_starts_with($data, 'data:' . $type . ';base64,')) {
            return null;
        }

        return [
            'type' => $type,
            'data' => $data,
            'name' => (string) ($logoImage['name'] ?? 'Logo'),
        ];
    }

    private function normalizeLogoPosition(string $position): string
    {
        return match (Str::of($position)->lower()->replace([' ', '-'], '_')->toString()) {
            'top_left', 'bottom_right', 'bottom_left' => Str::of($position)->lower()->replace([' ', '-'], '_')->toString(),
            default => 'top_right',
        };
    }

    private function addLogoToSlide($slide, ?array $logo, string $position, bool $isTitleSlide = false): void
    {
        if ($logo === null) {
            return;
        }

        [$x, $y] = match ($position) {
            'top_left' => [32, $isTitleSlide ? 18 : 18],
            'bottom_right' => [810, 468],
            'bottom_left' => [32, 468],
            default => [810, $isTitleSlide ? 18 : 18],
        };

        $image = (new Base64Drawing())
            ->setName($logo['name'])
            ->setDescription($logo['name'])
            ->setData($logo['data'])
            ->setResizeProportional(true)
            ->setWidth(112)
            ->setHeight(52)
            ->setOffsetX($x)
            ->setOffsetY($y);

        $slide->addShape($image);
    }

    private function presentationSlidesFromMarkdown(string $title, string $contentMarkdown): array
    {
        $blocks = $this->parsePresentationBlocks($contentMarkdown);
        $slides = [];
        $current = ['title' => $title, 'items' => []];

        foreach ($blocks as $block) {
            if ($block['type'] === 'heading' && !empty($current['items'])) {
                $slides[] = $current;
                $current = ['title' => $block['text'], 'items' => []];
                continue;
            }

            if ($block['type'] === 'heading' && empty($current['items']) && $current['title'] === $title) {
                $current['title'] = $block['text'];
                continue;
            }

            $current['items'][] = $block;

            if (count($current['items']) >= 6) {
                $slides[] = $current;
                $current = ['title' => 'Continued', 'items' => []];
            }
        }

        if (!empty($current['items'])) {
            $slides[] = $current;
        }

        return $slides ?: [[
            'title' => $title,
            'items' => [['type' => 'paragraph', 'text' => 'Presentation content']],
        ]];
    }

    private function parsePresentationBlocks(string $contentMarkdown): array
    {
        $blocks = [];

        foreach (preg_split('/\R/', $contentMarkdown) ?: [] as $line) {
            $line = trim($line);

            if ($line === '' || preg_match('/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/', $line)) {
                continue;
            }

            $type = 'paragraph';

            if (preg_match('/^#{1,3}\s+(.+)$/', $line, $matches)) {
                $type = 'heading';
                $line = $matches[1];
            } elseif (preg_match('/^[-*]\s+(.+)$/', $line, $matches)) {
                $type = 'bullet';
                $line = $matches[1];
            } elseif (preg_match('/^\d+\.\s+(.+)$/', $line, $matches)) {
                $type = 'numbered';
                $line = $matches[1];
            } elseif (str_starts_with($line, '|')) {
                $type = 'bullet';
                $line = implode(' - ', array_filter(array_map('trim', explode('|', trim($line, '|')))));
            }

            $blocks[] = [
                'type' => $type,
                'text' => $this->stripMarkdownInline($line),
            ];
        }

        return array_values(array_filter($blocks, fn (array $block): bool => $block['text'] !== ''));
    }

    private function stripMarkdownInline(string $text): string
    {
        $text = preg_replace('/\*\*(.+?)\*\*/', '$1', $text) ?? $text;
        $text = preg_replace('/\*(.+?)\*/', '$1', $text) ?? $text;
        $text = preg_replace('/__(.+?)__/', '$1', $text) ?? $text;
        $text = preg_replace('/_(.+?)_/', '$1', $text) ?? $text;
        $text = preg_replace('/`(.+?)`/', '$1', $text) ?? $text;

        return trim($text);
    }
}
