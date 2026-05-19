<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presentation;
use App\Models\PresentationComment;
use App\Models\PresentationElement;
use App\Models\PresentationExport;
use App\Models\PresentationSlide;
use App\Models\PresentationTemplate;
use App\Models\UserSavedTemplate;
use App\Services\GrokApiService;
use App\Services\PythonDocumentGenerationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class PresentationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $presentations = Presentation::query()
            ->where('user_id', $request->user()->id)
            ->withCount(['comments', 'collaborators'])
            ->latest('last_edited_at')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'presentations' => $presentations,
            'stats' => [
                'total' => $presentations->count(),
                'drafts' => $presentations->where('status', 'draft')->count(),
                'shared' => $presentations->filter(fn (Presentation $presentation) => $presentation->visibility !== 'private')->count(),
                'views' => $presentations->sum('view_count'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:120'],
            'theme_name' => ['nullable', 'string', 'max:120'],
            'design_style' => ['nullable', 'string', 'max:120'],
            'ai_prompt' => ['nullable', 'string', 'max:4000'],
            'template_id' => ['nullable', 'string', 'exists:presentation_templates,id'],
            'template' => ['nullable', 'array'],
        ]);

        $selectedTemplate = null;
        if (!empty($validated['template_id'])) {
            $selectedTemplate = PresentationTemplate::query()
                ->with('slides')
                ->find($validated['template_id']);
        }

        $presentation = Presentation::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']) . '-' . Str::lower(Str::random(6)),
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'] ?? $selectedTemplate?->category ?? 'Business',
            'theme_name' => $validated['theme_name'] ?? $selectedTemplate?->name ?? 'Aurora Glass',
            'status' => 'draft',
            'visibility' => 'private',
            'slide_count' => max(1, $selectedTemplate?->slides->count() ?? 1),
            'is_template_based' => !empty($validated['template']) || $selectedTemplate !== null,
            'theme_config' => $selectedTemplate?->theme_config ?? $validated['template']['theme_config'] ?? [
                'primary' => '#2563EB',
                'secondary' => '#7C3AED',
                'accent' => '#06B6D4',
                'surface' => '#0F172A',
            ],
            'ai_metadata' => [
                'origin' => !empty($validated['template']) || $selectedTemplate ? 'template' : 'manual',
                'template_id' => $selectedTemplate?->id,
                'capabilities' => ['ai_generate', 'presenter_mode', 'export', 'collaboration'],
            ],
            'last_edited_at' => now(),
        ]);

        if (!empty($validated['ai_prompt'])) {
            $this->createSlidesFromAiPrompt(
                $presentation,
                $validated['ai_prompt'],
                $validated['category'] ?? $selectedTemplate?->category ?? 'Business',
                $selectedTemplate,
                $validated['design_style'] ?? null,
            );
        } elseif ($selectedTemplate && $selectedTemplate->slides->isNotEmpty()) {
            $this->createSlidesFromTemplate($presentation, $selectedTemplate);

            UserSavedTemplate::query()->updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'presentation_template_id' => $selectedTemplate->id,
                ],
                [
                    'last_used_at' => now(),
                ],
            );

            $selectedTemplate->increment('usage_count');
        } elseif ($selectedTemplate && $selectedTemplate->is_powerpoint_template) {
            $this->createSlidesFromPowerPointTemplate($presentation, $selectedTemplate);

            UserSavedTemplate::query()->updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'presentation_template_id' => $selectedTemplate->id,
                ],
                [
                    'last_used_at' => now(),
                ],
            );

            $selectedTemplate->increment('usage_count');
        } else {
            $this->createDefaultSlide($presentation);
        }

        return response()->json([
            'success' => true,
            'presentation' => $presentation->fresh(),
            'redirect_to' => "/slides/{$presentation->id}",
        ], 201);
    }

    public function show(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $this->upgradeLegacyPresentationStyleIfNeeded($presentation);
        $this->ensureExactSlidePreviews($presentation);

        $presentation->load([
            'slides.elements',
            'comments.user:id,name,email',
            'collaborators.user:id,name,email',
            'exports',
        ]);

        return response()->json([
            'success' => true,
            'presentation' => $presentation,
            'insights' => [
                'completion_score' => min(100, 54 + ($presentation->slides->count() * 8)),
                'design_health' => 'Strong',
                'suggested_next_action' => 'Generate content for the next slide with AI.',
            ],
        ]);
    }

    private function upgradeLegacyPresentationStyleIfNeeded(Presentation $presentation): void
    {
        $presentation->loadMissing('slides.elements');

        $designStyle = data_get($presentation->ai_metadata, 'design_style');
        if (is_string($designStyle) && trim($designStyle) !== '') {
            return;
        }

        $layouts = $presentation->slides
            ->pluck('layout')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $legacyLayouts = ['hero', 'content-grid'];
        $hasOnlyLegacyLayouts = $layouts !== [] && collect($layouts)->every(fn ($layout) => in_array($layout, $legacyLayouts, true));

        if (!$hasOnlyLegacyLayouts) {
            return;
        }

        /** @var PythonDocumentGenerationService $documentGenerator */
        $documentGenerator = app(PythonDocumentGenerationService::class);
        $markdown = $this->exportablePresentationMarkdown($presentation);
        $generatedDeck = $documentGenerator->buildInteractivePresentationFromMarkdown(
            title: $presentation->title,
            contentMarkdown: $markdown,
            documentType: Str::slug((string) ($presentation->category ?: 'general'), '_'),
            options: ['design_style' => 'template_real'],
        );
        $powerPointArtifact = $this->generatePowerPointArtifact(
            $documentGenerator,
            $presentation->title,
            $markdown,
            (string) ($presentation->category ?: 'general'),
            ['design_style' => 'template_real'],
        );

        $presentation->slides->each(function (PresentationSlide $slide): void {
            $slide->elements()->delete();
        });
        $presentation->slides()->delete();

        $this->syncPresentationSlidesFromGeneratedDeck($presentation, $generatedDeck);

        $presentation->update([
            'slide_count' => count($generatedDeck['slides'] ?? []),
            'last_edited_at' => now(),
            'theme_name' => Str::headline((string) ($generatedDeck['design_style'] ?? 'template_real')),
            'theme_config' => $generatedDeck['theme'] ?? $presentation->theme_config,
            'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                'origin' => data_get($presentation->ai_metadata, 'origin', 'manual'),
                'design_style' => $generatedDeck['design_style'] ?? 'template_real',
                'design_styles' => $generatedDeck['design_styles'] ?? ['template_real'],
                'upgraded_to_template_real_at' => now()->toISOString(),
                'exact_slide_previews' => null,
                'powerpoint_library' => [
                    'used' => $powerPointArtifact !== null,
                    'format' => 'pptx',
                    'artifact' => $powerPointArtifact,
                ],
            ]),
        ]);
    }

    private function ensureExactSlidePreviews(Presentation $presentation): void
    {
        $presentation->refresh();
        $presentation->loadMissing('slides.elements');

        if ((bool) data_get($presentation->ai_metadata, 'workspace_prefers_live_canvas', false)) {
            return;
        }

        $existing = collect(data_get($presentation->ai_metadata, 'exact_slide_previews.images', []))
            ->filter(fn ($item) => is_array($item) && !empty($item['url']))
            ->values();

        if ($existing->count() === $presentation->slides->count() && $existing->isNotEmpty()) {
            return;
        }

        $artifactPath = (string) data_get($presentation->ai_metadata, 'powerpoint_library.artifact.path', '');

        if ($artifactPath === '') {
            /** @var PythonDocumentGenerationService $documentGenerator */
            $documentGenerator = app(PythonDocumentGenerationService::class);
            $markdown = $this->exportablePresentationMarkdown($presentation);
            $category = (string) ($presentation->category ?: 'general');
            $options = [
                'design_styles' => data_get($presentation->ai_metadata, 'design_styles', ['template_real']),
                'design_style' => data_get($presentation->ai_metadata, 'design_style', 'template_real'),
            ];

            $artifact = $this->generatePowerPointArtifact(
                $documentGenerator,
                $presentation->title,
                $markdown,
                $category,
                $options,
            );

            if ($artifact !== null) {
                $artifactPath = (string) ($artifact['path'] ?? '');
                $presentation->update([
                    'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                        'powerpoint_library' => [
                            'used' => true,
                            'format' => 'pptx',
                            'artifact' => $artifact,
                        ],
                    ]),
                ]);
                $presentation->refresh();
            }
        }

        if ($artifactPath === '') {
            return;
        }

        $absolutePowerPointPath = Storage::disk('public')->path($artifactPath);
        if (!is_file($absolutePowerPointPath)) {
            return;
        }

        $tmpDir = storage_path('app/tmp/slide-previews/' . $presentation->id . '-' . Str::lower(Str::random(6)));
        $pdfDir = $tmpDir . '/pdf';
        $pngDir = $tmpDir . '/png';
        @mkdir($pdfDir, 0777, true);
        @mkdir($pngDir, 0777, true);

        try {
            $libreOfficeProfileDir = $tmpDir . '/libreoffice-profile';
            @mkdir($libreOfficeProfileDir, 0777, true);

            $convertToPdf = new Process([
                '/usr/bin/soffice',
                '-env:UserInstallation=file://' . str_replace(DIRECTORY_SEPARATOR, '/', $libreOfficeProfileDir),
                '--headless',
                '--convert-to',
                'pdf',
                '--outdir',
                $pdfDir,
                $absolutePowerPointPath,
            ], base_path());
            $convertToPdf->setTimeout(120);
            $convertToPdf->mustRun();

            $pdfFile = collect(glob($pdfDir . '/*.pdf') ?: [])->first();
            if (!$pdfFile || !is_file($pdfFile)) {
                return;
            }

            $pngPrefix = $pngDir . '/slide';
            $convertToPng = new Process([
                '/usr/bin/pdftoppm',
                '-png',
                $pdfFile,
                $pngPrefix,
            ], base_path());
            $convertToPng->setTimeout(120);
            $convertToPng->mustRun();

            $generatedPngs = collect(glob($pngDir . '/slide-*.png') ?: [])
                ->sort()
                ->values();

            if ($generatedPngs->isEmpty()) {
                return;
            }

            $storedImages = [];
            foreach ($generatedPngs as $index => $pngPath) {
                $storagePath = 'user-content/presentation-previews/' . $presentation->id . '/slide-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) . '.png';
                Storage::disk('public')->put($storagePath, file_get_contents($pngPath));
                $storedImages[] = [
                    'index' => $index,
                    'path' => $storagePath,
                    'url' => Storage::disk('public')->url($storagePath),
                ];
            }

            $presentation->update([
                'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                    'exact_slide_previews' => [
                        'format' => 'png',
                        'source' => 'powerpoint_artifact',
                        'images' => $storedImages,
                        'generated_at' => now()->toISOString(),
                    ],
                ]),
            ]);
        } catch (ProcessTimedOutException $exception) {
            Log::warning('Exact slide preview generation timed out.', [
                'presentation_id' => $presentation->id,
                'message' => $exception->getMessage(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Exact slide preview generation failed.', [
                'presentation_id' => $presentation->id,
                'message' => $exception->getMessage(),
            ]);
        } finally {
            $this->cleanupDirectory($tmpDir);
        }
    }

    public function update(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:120'],
            'theme_name' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
            'visibility' => ['nullable', 'string', 'max:40'],
            'theme_config' => ['nullable', 'array'],
        ]);

        $presentation->update(array_merge($validated, [
            'last_edited_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'presentation' => $presentation->fresh(),
        ]);
    }

    public function addSlide(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'layout' => ['nullable', 'string', 'max:80'],
        ]);

        $position = ((int) $presentation->slides()->max('position')) + 1;

        $slide = PresentationSlide::create([
            'presentation_id' => $presentation->id,
            'title' => $validated['title'] ?? "Slide {$position}",
            'position' => $position,
            'layout' => $validated['layout'] ?? 'content-grid',
            'canvas_settings' => [
                'background' => '#FFFFFF',
                'grid' => true,
            ],
        ]);

        $presentation->update([
            'slide_count' => $presentation->slides()->count(),
            'last_edited_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'slide' => $slide->fresh(),
        ], 201);
    }

    public function reorderSlides(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'slides' => ['required', 'array'],
            'slides.*.id' => ['required', 'string'],
            'slides.*.position' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($validated['slides'] as $item) {
            PresentationSlide::query()
                ->where('presentation_id', $presentation->id)
                ->where('id', $item['id'])
                ->update(['position' => $item['position']]);
        }

        $presentation->update(['last_edited_at' => now()]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function duplicateSlide(Request $request, Presentation $presentation, PresentationSlide $slide): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);
        abort_unless($slide->presentation_id === $presentation->id, 404);

        $nextPosition = ((int) $presentation->slides()->max('position')) + 1;

        $duplicate = PresentationSlide::create([
            'presentation_id' => $presentation->id,
            'title' => ($slide->title ?: "Slide {$slide->position}") . ' Copy',
            'position' => $nextPosition,
            'layout' => $slide->layout,
            'speaker_notes' => $slide->speaker_notes,
            'canvas_settings' => $slide->canvas_settings,
        ]);

        $this->syncElements(
            $duplicate,
            $slide->elements()
                ->orderBy('position')
                ->get()
                ->map(fn (PresentationElement $element) => [
                    'id' => (string) Str::ulid(),
                    'type' => $element->type,
                    'name' => $element->name,
                    'position' => $element->position,
                    'x' => $element->x + 16,
                    'y' => $element->y + 16,
                    'width' => $element->width,
                    'height' => $element->height,
                    'rotation' => $element->rotation,
                    'z_index' => $element->z_index,
                    'style' => $element->style,
                    'content' => $element->content,
                    'animation' => $element->animation,
                ]),
            true,
        );

        $presentation->update([
            'slide_count' => $presentation->slides()->count(),
            'last_edited_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'slide' => $duplicate->fresh('elements'),
        ], 201);
    }

    public function deleteSlide(Request $request, Presentation $presentation, PresentationSlide $slide): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);
        abort_unless($slide->presentation_id === $presentation->id, 404);

        if ($presentation->slides()->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'At least one slide must remain in the presentation.',
            ], 422);
        }

        $deletedPosition = $slide->position;
        $slide->delete();

        $presentation->slides()
            ->where('position', '>', $deletedPosition)
            ->orderBy('position')
            ->get()
            ->each(function (PresentationSlide $item) {
                $item->update([
                    'position' => max(1, $item->position - 1),
                ]);
            });

        $presentation->update([
            'slide_count' => $presentation->slides()->count(),
            'last_edited_at' => now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function updateSlide(Request $request, PresentationSlide $slide): JsonResponse
    {
        $presentation = $slide->presentation;
        abort_unless($presentation && $presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'layout' => ['sometimes', 'string', 'max:80'],
            'speaker_notes' => ['sometimes', 'nullable', 'string'],
            'canvas_settings' => ['sometimes', 'array'],
            'elements' => ['sometimes', 'array'],
            'elements.*.id' => ['nullable', 'string'],
            'elements.*.type' => ['required_with:elements', 'string', 'max:80'],
            'elements.*.name' => ['nullable', 'string', 'max:255'],
            'elements.*.position' => ['nullable', 'integer', 'min:1'],
            'elements.*.x' => ['nullable', 'integer'],
            'elements.*.y' => ['nullable', 'integer'],
            'elements.*.width' => ['nullable', 'integer', 'min:1'],
            'elements.*.height' => ['nullable', 'integer', 'min:1'],
            'elements.*.rotation' => ['nullable', 'integer'],
            'elements.*.z_index' => ['nullable', 'integer'],
            'elements.*.style' => ['nullable', 'array'],
            'elements.*.content' => ['nullable', 'array'],
            'elements.*.animation' => ['nullable', 'array'],
        ]);

        $slide->update(collect($validated)->except('elements')->all());

        if (array_key_exists('elements', $validated)) {
            $this->syncElements($slide, collect($validated['elements']));
        }

        $presentation->update(['last_edited_at' => now()]);

        return response()->json([
            'success' => true,
            'slide' => $slide->fresh('elements'),
        ]);
    }

    public function generateAiContent(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'slide_id' => ['required', 'string', 'exists:presentation_slides,id'],
            'prompt' => ['nullable', 'string', 'max:1000'],
        ]);

        $slide = PresentationSlide::query()
            ->where('presentation_id', $presentation->id)
            ->where('id', $validated['slide_id'])
            ->firstOrFail();

        $prompt = trim((string) ($validated['prompt'] ?? ''));
        $topic = $prompt !== '' ? $prompt : ($presentation->title ?: 'AI presentation');
        $category = $presentation->category ?: 'Business';

        $generatedElements = collect([
            [
                'id' => (string) Str::ulid(),
                'type' => 'heading',
                'name' => 'AI heading',
                'position' => 1,
                'x' => 72,
                'y' => 74,
                'width' => 660,
                'height' => 80,
                'rotation' => 0,
                'z_index' => 2,
                'style' => ['fontSize' => 36, 'fontWeight' => 700, 'color' => '#F8FAFC'],
                'content' => ['text' => $topic],
                'animation' => ['type' => 'fade-up', 'duration' => 0.35],
            ],
            [
                'id' => (string) Str::ulid(),
                'type' => 'text',
                'name' => 'AI summary',
                'position' => 2,
                'x' => 72,
                'y' => 170,
                'width' => 620,
                'height' => 110,
                'rotation' => 0,
                'z_index' => 2,
                'style' => ['fontSize' => 18, 'fontWeight' => 500, 'color' => '#D6E3F1'],
                'content' => ['text' => "This {$category} presentation focuses on {$topic}. It combines strategy, clear storytelling, and strong visual hierarchy to guide the audience from context to action."],
                'animation' => ['type' => 'fade', 'duration' => 0.3],
            ],
            [
                'id' => (string) Str::ulid(),
                'type' => 'text',
                'name' => 'AI bullets',
                'position' => 3,
                'x' => 72,
                'y' => 312,
                'width' => 520,
                'height' => 170,
                'rotation' => 0,
                'z_index' => 2,
                'style' => ['fontSize' => 17, 'fontWeight' => 500, 'color' => '#F8FAFC'],
                'content' => ['text' => "• Clarify the problem and why it matters\n• Present the proposed solution with confidence\n• Show measurable outcomes, traction, or next steps"],
                'animation' => ['type' => 'fade', 'duration' => 0.32],
            ],
            [
                'id' => (string) Str::ulid(),
                'type' => 'shape',
                'name' => 'AI accent card',
                'position' => 4,
                'x' => 640,
                'y' => 160,
                'width' => 220,
                'height' => 220,
                'rotation' => 0,
                'z_index' => 1,
                'style' => [
                    'shape' => 'rounded-rectangle',
                    'background' => 'linear-gradient(135deg, rgba(37,99,235,0.65), rgba(124,58,237,0.68))',
                    'borderColor' => 'rgba(255,255,255,0.18)',
                    'color' => '#FFFFFF',
                ],
                'content' => ['text' => 'AI\nready'],
                'animation' => ['type' => 'float', 'duration' => 0.4],
            ],
        ]);

        $slide->update([
            'title' => Str::limit($topic, 120, ''),
            'speaker_notes' => "Open with the opportunity behind {$topic}, explain the core message in simple terms, and close with a direct next step for the audience.",
        ]);

        $this->syncElements($slide, $generatedElements, true);
        $presentation->update([
            'last_edited_at' => now(),
            'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                'exact_slide_previews' => null,
                'powerpoint_library' => null,
                'workspace_prefers_live_canvas' => true,
            ]),
        ]);

        return response()->json([
            'success' => true,
            'slide' => $slide->fresh('elements'),
        ]);
    }

    public function addComment(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'slide_id' => ['nullable', 'string'],
            'anchor' => ['nullable', 'array'],
        ]);

        $comment = PresentationComment::create([
            'presentation_id' => $presentation->id,
            'slide_id' => $validated['slide_id'] ?? null,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'anchor' => $validated['anchor'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'comment' => $comment->load('user:id,name,email'),
        ], 201);
    }

    public function export(Request $request, Presentation $presentation): JsonResponse
    {
        abort_unless($presentation->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'format' => ['required', 'string', 'in:pdf,pptx,png,jpeg,mp4'],
        ]);

        if (in_array($validated['format'], ['pdf', 'pptx'], true)) {
            /** @var PythonDocumentGenerationService $documentGenerator */
            $documentGenerator = app(PythonDocumentGenerationService::class);
            $markdown = $this->exportablePresentationMarkdown($presentation);
            $options = $this->powerPointGenerationOptions(
                (string) ($presentation->description ?: $presentation->title),
            );

            $result = $documentGenerator->generateDocument(
                title: $presentation->title,
                contentMarkdown: $markdown,
                format: $validated['format'],
                documentType: Str::slug((string) ($presentation->category ?: 'general'), '_'),
                options: $options,
            );

            $export = PresentationExport::create([
                'presentation_id' => $presentation->id,
                'user_id' => $request->user()->id,
                'format' => $validated['format'],
                'status' => 'completed',
                'file_path' => $result['path'] ?? null,
                'options' => [
                    'quality' => 'high',
                    'theme' => $presentation->theme_name,
                    'url' => $result['url'] ?? null,
                    'filename' => $result['filename'] ?? null,
                ],
                'completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'export' => $export,
                'url' => $result['url'] ?? null,
                'filename' => $result['filename'] ?? null,
                'message' => strtoupper($validated['format']) . ' export ready.',
            ]);
        }

        $export = PresentationExport::create([
            'presentation_id' => $presentation->id,
            'user_id' => $request->user()->id,
            'format' => $validated['format'],
            'status' => 'queued',
            'options' => [
                'quality' => 'high',
                'theme' => $presentation->theme_name,
            ],
        ]);

        return response()->json([
            'success' => true,
            'export' => $export,
            'message' => "Your {$validated['format']} export has been queued.",
        ], 202);
    }

    private function createDefaultSlide(Presentation $presentation): void
    {
        $slide = PresentationSlide::create([
            'presentation_id' => $presentation->id,
            'title' => 'Opening Slide',
            'position' => 1,
            'layout' => 'hero',
            'speaker_notes' => 'Introduce the presentation and set the direction.',
            'canvas_settings' => [
                'background' => 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0EA5E9 100%)',
                'grid' => true,
            ],
        ]);

        $this->syncElements($slide, collect([
            [
                'id' => (string) Str::ulid(),
                'type' => 'heading',
                'name' => 'Hero heading',
                'position' => 1,
                'x' => 72,
                'y' => 74,
                'width' => 620,
                'height' => 96,
                'rotation' => 0,
                'z_index' => 1,
                'style' => ['fontSize' => 46, 'fontWeight' => 700, 'color' => '#F8FAFC'],
                'content' => ['text' => $presentation->title],
                'animation' => ['type' => 'fade-up', 'duration' => 0.45],
            ],
            [
                'id' => (string) Str::ulid(),
                'type' => 'text',
                'name' => 'Hero summary',
                'position' => 2,
                'x' => 72,
                'y' => 194,
                'width' => 540,
                'height' => 72,
                'rotation' => 0,
                'z_index' => 2,
                'style' => ['fontSize' => 18, 'lineHeight' => 1.6, 'color' => '#CBD5E1'],
                'content' => ['text' => $presentation->description ?: 'A modern AI-powered deck workspace with live editing, design intelligence, and premium storytelling tools.'],
                'animation' => ['type' => 'fade', 'duration' => 0.35],
            ],
        ]), true);
    }

    private function createSlidesFromTemplate(Presentation $presentation, PresentationTemplate $template): void
    {
        $templateSlides = $template->slides
            ->sortBy('position')
            ->values();

        foreach ($templateSlides as $index => $templateSlide) {
            $slide = PresentationSlide::create([
                'presentation_id' => $presentation->id,
                'title' => $templateSlide->title,
                'position' => $index + 1,
                'layout' => $templateSlide->layout,
                'speaker_notes' => $templateSlide->summary,
                'canvas_settings' => $templateSlide->canvas_settings ?? [
                    'background' => '#0F172A',
                    'grid' => false,
                ],
            ]);

            $elements = collect($templateSlide->elements ?? [])
                ->map(function (array $element) use ($presentation, $index) {
                    if (($element['type'] ?? null) === 'heading' && $index === 0) {
                        data_set($element, 'content.text', $presentation->title);
                    }

                    return array_merge($element, [
                        'id' => (string) Str::ulid(),
                    ]);
                });

            $this->syncElements($slide, $elements, true);
        }

        $presentation->update([
            'slide_count' => $templateSlides->count(),
        ]);
    }

    private function exportablePresentationMarkdown(Presentation $presentation): string
    {
        $powerPointMarkdown = (string) data_get($presentation->ai_metadata, 'powerpoint_markdown', '');

        if (trim($powerPointMarkdown) !== '') {
            return $powerPointMarkdown;
        }

        $presentation->loadMissing('slides.elements');

        $sections = ["# {$presentation->title}"];

        foreach ($presentation->slides->sortBy('position') as $slide) {
            if ($slide->layout === 'template-real-hero') {
                continue;
            }

            $sections[] = '## ' . ($slide->title ?: 'Slide');

            if (is_string($slide->layout) && str_starts_with($slide->layout, 'template-real-')) {
                $textBlocks = $slide->elements
                    ->sortBy('position')
                    ->map(function (PresentationElement $element) {
                        $text = trim((string) data_get($element->content, 'text', ''));
                        $normalizedText = str_replace(["\r\n", "\n", "\r", '\\n'], ' ', $text);
                        $normalizedText = preg_replace('/\s+/', ' ', $normalizedText) ?? $normalizedText;
                        $normalizedText = trim($normalizedText);
                        $name = Str::lower(trim((string) ($element->name ?? '')));

                        if ($element->type === 'chart') {
                            return $this->chartMarkdownFromElement($element);
                        }

                        if ($normalizedText === '') {
                            return null;
                        }

                        if (in_array($name, ['hero title', 'hero subtitle', 'slide heading', 'preview icon', 'preview title', 'panel icon', 'panel title', 'chart summary text'], true)) {
                            return null;
                        }

                        if (in_array($normalizedText, ['★', '☾', '✹', '☁', 'Focus', 'Narrative', 'Proof', 'Action', 'AI ready'], true)) {
                            return null;
                        }

                        return $normalizedText;
                    })
                    ->filter()
                    ->values()
                    ->all();

                if ($textBlocks === []) {
                    $sections[] = '- Presentation slide content';
                    continue;
                }

                foreach ($textBlocks as $block) {
                    $sections[] = $this->markdownizeSlideText($block);
                }

                continue;
            }

            $textBlocks = $slide->elements
                ->sortBy('position')
                ->map(function (PresentationElement $element) {
                    $text = trim((string) data_get($element->content, 'text', ''));
                    if ($text === '') {
                        return null;
                    }

                    return match ($element->type) {
                        'heading' => null,
                        'chart' => $this->chartMarkdownFromElement($element),
                        default => $text,
                    };
                })
                ->filter()
                ->values()
                ->all();

            if ($textBlocks === []) {
                $sections[] = '- Presentation slide content';
                continue;
            }

            foreach ($textBlocks as $block) {
                $sections[] = $this->markdownizeSlideText($block);
            }
        }

        return implode("\n\n", $sections);
    }

    private function chartMarkdownFromElement(PresentationElement $element): string
    {
        $title = trim((string) data_get($element->content, 'text', $element->name ?: 'Bar Chart'));
        $chartType = strtolower((string) data_get($element->content, 'chartType', 'bar'));
        $heading = match ($chartType) {
            'pie' => $title . ' Pie Chart',
            'line' => $title . ' Bar Chart',
            default => $title . ' Bar Chart',
        };

        $labels = collect(data_get($element->content, 'labels', []))->values();
        $series = collect(data_get($element->content, 'series', []))->values();

        $rows = $labels->map(function ($label, $index) use ($series) {
            $value = $series->get($index, 0);
            return '- ' . trim((string) $label) . ': ' . (is_numeric($value) ? $value : 0);
        })->implode("\n");

        return trim($heading . "\n" . $rows);
    }

    private function markdownizeSlideText(string $text): string
    {
        $lines = preg_split("/\r\n|\n|\r/", trim($text)) ?: [];

        return collect($lines)
            ->map(function (string $line) {
                $trimmed = trim($line);
                if ($trimmed === '') {
                    return null;
                }

                if (str_starts_with($trimmed, '•')) {
                    return '- ' . trim(mb_substr($trimmed, 1));
                }

                if (preg_match('/^[-*]\s+/', $trimmed)) {
                    return $trimmed;
                }

                return $trimmed;
            })
            ->filter()
            ->implode("\n");
    }

    private function createSlidesFromAiPrompt(Presentation $presentation, string $prompt, string $category, ?PresentationTemplate $selectedTemplate = null, ?string $designStyle = null): void
    {
        $selectedTemplate ??= $this->findDesignReferenceTemplate($prompt, $category, $designStyle);

        /** @var PythonDocumentGenerationService $documentGenerator */
        $documentGenerator = app(PythonDocumentGenerationService::class);
        $markdown = $this->generatePowerPointMarkdown($presentation->title, $prompt, $category);
        $generationOptions = $this->powerPointGenerationOptions($prompt, $selectedTemplate, $designStyle);
        $generatedDeck = $documentGenerator->buildInteractivePresentationFromMarkdown(
            title: $presentation->title,
            contentMarkdown: $markdown,
            documentType: Str::slug($category, '_'),
            options: $generationOptions,
        );
        $powerPointArtifact = $this->generatePowerPointArtifact(
            $documentGenerator,
            $presentation->title,
            $markdown,
            $category,
            $generationOptions,
        );

        $this->syncPresentationSlidesFromGeneratedDeck($presentation, $generatedDeck);

        $presentation->update([
            'slide_count' => count($generatedDeck['slides']),
            'last_edited_at' => now(),
            'description' => $presentation->description ?: $prompt,
            'theme_name' => $selectedTemplate?->name ?: Str::headline((string) ($generatedDeck['design_style'] ?? 'template_real')),
            'theme_config' => !empty($selectedTemplate?->theme_config) ? $selectedTemplate->theme_config : ($generatedDeck['theme'] ?? $presentation->theme_config),
            'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                'origin' => 'ai_powerpoint_workflow',
                'powerpoint_markdown' => $markdown,
                'design_style' => $generatedDeck['design_style'] ?? 'template_real',
                'design_styles' => $generatedDeck['design_styles'] ?? ['template_real'],
                'source_template_id' => $selectedTemplate?->id,
                'source_template_name' => $selectedTemplate?->name,
                'source_template_file' => $selectedTemplate?->source_file_name,
                'matched_design_reference' => $selectedTemplate ? [
                    'id' => $selectedTemplate->id,
                    'name' => $selectedTemplate->name,
                    'file' => $selectedTemplate->source_file_name,
                    'format' => $selectedTemplate->template_format,
                ] : null,
                'main_ai_features' => [
                    'powerpoint_workflow' => true,
                    'chart_detection' => true,
                    'design_library' => true,
                ],
                'powerpoint_library' => [
                    'used' => $powerPointArtifact !== null,
                    'format' => 'pptx',
                    'artifact' => $powerPointArtifact,
                ],
            ]),
        ]);
    }

    private function createSlidesFromPowerPointTemplate(Presentation $presentation, PresentationTemplate $template): void
    {
        $prompt = trim((string) ($presentation->description ?: $template->description ?: $presentation->title));

        $this->createSlidesFromAiPrompt(
            $presentation,
            $prompt,
            $presentation->category ?: $template->category ?: 'Business',
            $template,
        );

        $presentation->update([
            'theme_name' => $template->name,
            'theme_config' => !empty($template->theme_config) ? $template->theme_config : $presentation->theme_config,
            'ai_metadata' => array_merge($presentation->ai_metadata ?? [], [
                'origin' => 'uploaded_powerpoint_template',
                'source_template_id' => $template->id,
                'source_template_name' => $template->name,
                'source_template_file' => $template->source_file_name,
                'source_template_format' => $template->template_format,
                'source_template_url' => $template->source_file_path ? \Storage::disk('public')->url($template->source_file_path) : null,
            ]),
        ]);
    }

    private function syncPresentationSlidesFromGeneratedDeck(Presentation $presentation, array $generatedDeck): void
    {
        foreach (($generatedDeck['slides'] ?? []) as $index => $blueprint) {
            $slide = PresentationSlide::create([
                'presentation_id' => $presentation->id,
                'title' => $blueprint['title'],
                'position' => $index + 1,
                'layout' => $blueprint['layout'] ?? ($index === 0 ? 'hero' : 'content-grid'),
                'speaker_notes' => $blueprint['speaker_notes'] ?? null,
                'canvas_settings' => $blueprint['canvas_settings'] ?? [
                    'background' => 'linear-gradient(135deg, #07111f 0%, #172554 100%)',
                    'grid' => false,
                ],
            ]);

            $elements = collect($blueprint['elements'] ?? [])
                ->map(fn (array $element, int $elementIndex) => array_merge($element, [
                    'id' => $element['id'] ?? (string) Str::ulid(),
                    'position' => $element['position'] ?? ($elementIndex + 1),
                    'animation' => $element['animation'] ?? ['type' => 'fade', 'duration' => 0.3],
                ]));

            $this->syncElements($slide, $elements, true);
        }
    }

    private function generatePowerPointMarkdown(string $title, string $prompt, string $category): string
    {
        try {
            /** @var GrokApiService $grok */
            $grok = app(GrokApiService::class);

            $response = trim((string) $grok->generateChat(
                prompt: "Create the full markdown content for a professional PowerPoint presentation.\n\nTitle: {$title}\nCategory: {$category}\nUser request: {$prompt}\n\nRequirements:\n- Return markdown only\n- Use one heading per slide section\n- Under each heading, add concise bullets and short supporting paragraphs when useful\n- Make it presentation-ready, polished, and business clear\n- Create 5 to 7 content slides\n- Do not wrap the answer in code fences\n- If a chart is needed, include \"Bar Chart\", \"Pie Chart\", or \"Histogram\" in the slide heading\n- For chart data, write bullets in `Label: number` format, for example `- Q1: 125`\n- If the user asks for startup, business, board, financial, dark, minimal, warm, or creative styling, reflect that in the slide structure and tone",
                model: 'grok-4-fast-non-reasoning',
                history: [],
                tools: [],
            ));

            if ($response !== '') {
                return $response;
            }
        } catch (\Throwable $exception) {
            Log::warning('AI PowerPoint markdown generation fell back to local markdown generation.', [
                'message' => $exception->getMessage(),
                'prompt' => $prompt,
            ]);
        }

        return implode("\n\n", [
            "# {$title}",
            "## Presentation overview\n- Introduce the topic clearly\n- Explain why it matters now\n- Set the audience outcome\n\nThis AI-generated {$category} deck is built around {$prompt}.",
            "## Problem and opportunity\n- Describe the current gap\n- Show the impact of inaction\n- Highlight the strategic opening\n\nFrame the challenge in a way that creates urgency and clarity.",
            "## Proposed approach\n- Present the core solution\n- Break the work into phases\n- Keep execution practical\n\nShow how the recommendation moves from idea to action.",
            "## Key benefits\n- Emphasize measurable value\n- Connect benefits to stakeholder needs\n- Reinforce credibility and momentum\n\nTranslate the solution into outcomes the audience cares about.",
            "## Next steps\n- Confirm the recommended action\n- Define the next milestone\n- Invite approval or feedback\n\nClose with confident, simple next steps.",
        ]);
    }

    private function powerPointGenerationOptions(string $prompt, ?PresentationTemplate $selectedTemplate = null, ?string $designStyle = null): array
    {
        $resolvedDesignStyle = $selectedTemplate?->is_powerpoint_template
            ? null
            : ($designStyle ?: null);

        $resolvedDesignStyles = $selectedTemplate?->is_powerpoint_template
            ? $this->inferReferenceDesignStyles($selectedTemplate, $prompt, $designStyle)
            : null;

        return array_filter([
            'design_style' => $resolvedDesignStyle,
            'design_styles' => $resolvedDesignStyles,
            'design_description' => trim(implode(' ', array_filter([
                $prompt,
                $designStyle ? Str::headline($designStyle) : null,
                $selectedTemplate?->is_powerpoint_template ? 'Use the uploaded PowerPoint design reference style, spacing, tone, and visual treatment where appropriate.' : null,
                $selectedTemplate?->name,
                $selectedTemplate?->description,
                $selectedTemplate?->category,
                is_array($selectedTemplate?->tags) ? implode(' ', $selectedTemplate->tags) : null,
                $selectedTemplate?->source_file_name,
            ]))),
        ], fn ($value) => !($value === null || $value === ''));
    }

    private function inferReferenceDesignStyles(PresentationTemplate $template, string $prompt, ?string $designStyle = null): array
    {
        $signals = Str::lower(implode(' ', array_filter([
            $prompt,
            $designStyle,
            $template->name,
            $template->description,
            $template->category,
            $template->source_file_name,
            is_array($template->tags) ? implode(' ', $template->tags) : null,
            data_get($template->structure, 'design_summary'),
        ])));

        $styles = [];

        if (
            str_contains($signals, 'sgmms')
            || str_contains($signals, 'state government ministry management system')
            || str_contains($signals, 'official proposal')
            || str_contains($signals, 'government erp')
            || str_contains($signals, 'ministry proposal')
        ) {
            $styles[] = 'sgmms_proposal';
        }

        if (str_contains($signals, 'finance') || str_contains($signals, 'investor') || str_contains($signals, 'financial')) {
            $styles[] = 'financial_clean';
        }

        if (str_contains($signals, 'board') || str_contains($signals, 'executive') || str_contains($signals, 'boardroom')) {
            $styles[] = 'boardroom';
        }

        if (str_contains($signals, 'tech') || str_contains($signals, 'saas') || str_contains($signals, 'product')) {
            $styles[] = 'tech_grid';
        }

        if (
            str_contains($signals, 'proposal')
            || str_contains($signals, 'consult')
            || str_contains($signals, 'corporate')
            || str_contains($signals, 'business')
            || str_contains($signals, 'blue')
            || str_contains($signals, 'sgmms')
        ) {
            $styles[] = 'business_blue';
        }

        if ($styles === []) {
            $styles[] = 'corporate';
        }

        return array_values(array_unique($styles));
    }

    private function findDesignReferenceTemplate(string $prompt, string $category, ?string $designStyle = null): ?PresentationTemplate
    {
        $references = PresentationTemplate::query()
            ->where('is_powerpoint_template', true)
            ->where('is_active', true)
            ->get();

        if ($references->isEmpty()) {
            return null;
        }

        $haystack = Str::lower(trim(implode(' ', array_filter([$prompt, $category, $designStyle]))));
        if ($haystack === '') {
            return null;
        }

        $bestTemplate = null;
        $bestScore = 0;

        foreach ($references as $reference) {
            $score = 0;
            $signals = array_filter([
                $reference->name,
                $reference->description,
                $reference->category,
                $reference->source_file_name,
                is_array($reference->tags) ? implode(' ', $reference->tags) : null,
                data_get($reference->structure, 'design_summary'),
                implode(' ', array_filter((array) data_get($reference->structure, 'keywords', []))),
            ]);

            foreach ($signals as $signal) {
                $signalText = Str::lower((string) $signal);
                if ($signalText === '') {
                    continue;
                }

                similar_text($haystack, $signalText, $similarity);
                $score += (int) floor($similarity / 10);

                $signalWords = preg_split('/[^a-z0-9]+/', $signalText) ?: [];
                foreach ($signalWords as $word) {
                    if ($word !== '' && strlen($word) > 3 && str_contains($haystack, $word)) {
                        $score += 3;
                    }
                }
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestTemplate = $reference;
            }
        }

        return $bestScore >= 6 ? $bestTemplate : null;
    }

    private function generatePowerPointArtifact(
        PythonDocumentGenerationService $documentGenerator,
        string $title,
        string $markdown,
        string $category,
        array $options = [],
    ): ?array {
        try {
            $export = $documentGenerator->generateDocument(
                title: $title,
                contentMarkdown: $markdown,
                format: 'pptx',
                documentType: Str::slug($category, '_'),
                options: $options,
            );

            return [
                'url' => $export['url'] ?? null,
                'path' => $export['path'] ?? null,
                'filename' => $export['filename'] ?? null,
                'mime_type' => $export['mime_type'] ?? null,
                'generated_at' => $export['generated_at'] ?? now()->toISOString(),
            ];
        } catch (\Throwable $exception) {
            Log::warning('PowerPoint library generation failed for slides flow.', [
                'message' => $exception->getMessage(),
                'title' => $title,
                'category' => $category,
            ]);

            return null;
        }
    }

    private function syncElements(PresentationSlide $slide, Collection $elements, bool $replaceAll = false): void
    {
        $existingIds = $slide->elements()->pluck('id')->all();
        $incomingIds = $elements->pluck('id')->filter()->all();

        if ($replaceAll) {
            $slide->elements()->delete();
        } else {
            $idsToDelete = array_diff($existingIds, $incomingIds);
            if (!empty($idsToDelete)) {
                $slide->elements()->whereIn('id', $idsToDelete)->delete();
            }
        }

        foreach ($elements->values() as $index => $element) {
            $payload = [
                'slide_id' => $slide->id,
                'type' => $element['type'],
                'name' => $element['name'] ?? null,
                'position' => $element['position'] ?? ($index + 1),
                'x' => $element['x'] ?? 0,
                'y' => $element['y'] ?? 0,
                'width' => $element['width'] ?? 320,
                'height' => $element['height'] ?? 120,
                'rotation' => $element['rotation'] ?? 0,
                'z_index' => $element['z_index'] ?? 1,
                'style' => $element['style'] ?? null,
                'content' => $element['content'] ?? null,
                'animation' => $element['animation'] ?? null,
            ];

            PresentationElement::query()->updateOrCreate(
                ['id' => $element['id'] ?? (string) Str::ulid()],
                $payload
            );
        }
    }

    private function cleanupDirectory(string $directory): void
    {
        if ($directory === '' || !is_dir($directory)) {
            return;
        }

        foreach (array_diff(scandir($directory) ?: [], ['.', '..']) as $item) {
            $path = $directory . DIRECTORY_SEPARATOR . $item;

            if (is_dir($path)) {
                $this->cleanupDirectory($path);
            } elseif (is_file($path)) {
                @unlink($path);
            }
        }

        @rmdir($directory);
    }
}
