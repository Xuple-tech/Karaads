<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PresentationTemplate;
use App\Models\TemplateBlock;
use App\Models\TemplateCategory;
use App\Models\TemplateFavorite;
use App\Models\TemplateSlide;
use App\Models\UserSavedTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PresentationTemplateController extends Controller
{
    public function publicIndex(Request $request): JsonResponse
    {
        $this->ensureSystemTemplates();

        $search = trim((string) $request->string('search'));
        $category = trim((string) $request->string('category'));
        $templates = $this->templateCollection($search, $category, null);

        return response()->json([
            'success' => true,
            'access' => 'free',
            'templates' => $templates,
            'sections' => [
                'trending' => $templates->where('is_trending', true)->take(6)->values(),
                'recommended' => $templates->where('is_recommended', true)->take(6)->values(),
                'featured' => $templates->where('is_featured', true)->take(6)->values(),
            ],
            'categories' => $this->categoryCollection(),
        ]);
    }

    public function publicShow(PresentationTemplate $template): JsonResponse
    {
        abort_unless($template->is_system || ($template->is_powerpoint_template && $template->is_active), 404);

        $this->ensureSystemTemplates();
        $template->load(['slides', 'blocks']);
        $template->loadCount('favorites');

        return response()->json([
            'success' => true,
            'access' => 'free',
            'template' => $this->transformTemplate($template, false),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensureSystemTemplates();

        $search = trim((string) $request->string('search'));
        $category = trim((string) $request->string('category'));
        $user = $request->user();
        $templates = $this->templateCollection($search, $category, $user?->id);

        $recentTemplateIds = UserSavedTemplate::query()
            ->where('user_id', $user->id)
            ->orderByDesc('last_used_at')
            ->limit(6)
            ->pluck('presentation_template_id')
            ->all();

        $recentTemplates = collect($recentTemplateIds)
            ->map(fn (string $templateId) => $templates->firstWhere('id', $templateId))
            ->filter()
            ->values();

        $favoriteIds = TemplateFavorite::query()
            ->where('user_id', $user->id)
            ->pluck('presentation_template_id')
            ->all();

        $favorites = collect($favoriteIds)
            ->map(fn (string $templateId) => $templates->firstWhere('id', $templateId))
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'templates' => $templates,
            'sections' => [
                'trending' => $templates->where('is_trending', true)->take(6)->values(),
                'recommended' => $templates->where('is_recommended', true)->take(6)->values(),
                'featured' => $templates->where('is_featured', true)->take(6)->values(),
                'recent' => $recentTemplates,
                'favorites' => $favorites,
            ],
            'categories' => $this->categoryCollection(),
            'blocks' => TemplateBlock::query()
                ->whereNull('presentation_template_id')
                ->orderBy('name')
                ->get()
                ->map(fn (TemplateBlock $block) => [
                    'id' => $block->id,
                    'name' => $block->name,
                    'type' => $block->type,
                    'category' => $block->category,
                    'description' => $block->description,
                ]),
        ]);
    }

    public function show(Request $request, PresentationTemplate $template): JsonResponse
    {
        abort_unless($template->is_system || $template->user_id === $request->user()->id, 403);

        $this->ensureSystemTemplates();

        $template->load(['slides', 'blocks']);
        $template->loadCount('favorites');
        $isFavorited = $template->favorites()->where('user_id', $request->user()->id)->exists();

        return response()->json([
            'success' => true,
            'template' => $this->transformTemplate($template, $isFavorited),
        ]);
    }

    public function toggleFavorite(Request $request, PresentationTemplate $template): JsonResponse
    {
        abort_unless($template->is_system || $template->user_id === $request->user()->id, 403);

        $favorite = TemplateFavorite::query()->firstWhere([
            'user_id' => $request->user()->id,
            'presentation_template_id' => $template->id,
        ]);

        if ($favorite) {
            $favorite->delete();
            $favorited = false;
        } else {
            TemplateFavorite::query()->create([
                'user_id' => $request->user()->id,
                'presentation_template_id' => $template->id,
            ]);
            $favorited = true;
        }

        return response()->json([
            'success' => true,
            'favorited' => $favorited,
        ]);
    }

    public function markUsed(Request $request, PresentationTemplate $template): JsonResponse
    {
        abort_unless($template->is_system || $template->user_id === $request->user()->id, 403);

        UserSavedTemplate::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'presentation_template_id' => $template->id,
            ],
            [
                'last_used_at' => now(),
            ],
        );

        $template->increment('usage_count');

        return response()->json([
            'success' => true,
        ]);
    }

    private function transformTemplate(PresentationTemplate $template, ?bool $isFavorited = null): array
    {
        $assetSummary = Arr::get($template->structure ?? [], 'asset_summary', []);
        $googleSlides = Arr::get($template->structure ?? [], 'google_slides', []);

        return [
            'id' => $template->id,
            'name' => $template->name,
            'slug' => $template->slug,
            'category' => $template->category,
            'description' => $template->description,
            'thumbnail_url' => $template->thumbnail_url,
            'preview_image_url' => $template->preview_image_url,
            'slides_count' => $template->slides_count ?: $template->slides->count(),
            'theme_config' => $template->theme_config ?? [],
            'color_palette' => $template->color_palette ?? [],
            'font_pair' => $template->font_pair ?? [],
            'tags' => $template->tags ?? [],
            'preview_mode' => $template->preview_mode,
            'access_tier' => 'free',
            'built_in_assets' => [
                'images' => (int) ($assetSummary['images'] ?? 0),
                'charts' => (int) ($assetSummary['charts'] ?? 0),
                'text_blocks' => (int) ($assetSummary['text_blocks'] ?? 0),
                'shape_blocks' => (int) ($assetSummary['shape_blocks'] ?? 0),
            ],
            'is_powerpoint_template' => (bool) $template->is_powerpoint_template,
            'template_format' => $template->template_format,
            'source_file_name' => $template->source_file_name,
            'source_file_url' => $template->source_file_path ? Storage::disk('public')->url($template->source_file_path) : null,
            'google_slides_presentation_id' => $googleSlides['presentation_id'] ?? null,
            'google_slides_web_view_link' => $googleSlides['web_view_link'] ?? null,
            'is_featured' => (bool) $template->is_featured,
            'is_trending' => (bool) $template->is_trending,
            'is_recommended' => (bool) $template->is_recommended,
            'usage_count' => (int) $template->usage_count,
            'favorites_count' => (int) ($template->favorites_count ?? 0),
            'is_favorited' => $isFavorited ?? (bool) ($template->is_favorited ?? false),
            'preview_slides' => $template->slides->map(fn (TemplateSlide $slide) => [
                'id' => $slide->id,
                'title' => $slide->title,
                'summary' => $slide->summary,
                'layout' => $slide->layout,
                'canvas_settings' => $slide->canvas_settings ?? [],
                'elements' => $slide->elements ?? [],
            ])->values(),
            'blocks' => $template->blocks->map(fn (TemplateBlock $block) => [
                'id' => $block->id,
                'name' => $block->name,
                'type' => $block->type,
                'category' => $block->category,
                'description' => $block->description,
                'schema' => $block->schema ?? [],
            ])->values(),
        ];
    }

    private function templateCollection(string $search, string $category, ?string $userId): Collection
    {
        $baseQuery = PresentationTemplate::query()
            ->where(fn ($query) => $query
                ->where('is_system', true)
                ->when($userId, fn ($nested) => $nested->orWhere('user_id', $userId)))
            ->with(['slides', 'blocks'])
            ->withCount('favorites');

        if ($userId) {
            $baseQuery->withExists([
                'favorites as is_favorited' => fn ($query) => $query->where('user_id', $userId),
            ]);
        }

        if ($search !== '') {
            $baseQuery->where(function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($category !== '' && strtolower($category) !== 'all') {
            $baseQuery->where('category', $category);
        }

        return $baseQuery
            ->orderByDesc('is_featured')
            ->orderByDesc('is_trending')
            ->orderByDesc('usage_count')
            ->latest()
            ->get()
            ->map(fn (PresentationTemplate $template) => $this->transformTemplate($template));
    }

    private function categoryCollection(): Collection
    {
        return TemplateCategory::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (TemplateCategory $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'accent_color' => $category->accent_color,
            ]);
    }

    private function ensureSystemTemplates(): void
    {
        $categorySeeds = $this->categorySeed();
        $templateSeeds = $this->templateSeeds();
        $globalBlocks = $this->globalBlocks();

        $hasSeededLibrary =
            TemplateCategory::query()->count() >= count($categorySeeds)
            && PresentationTemplate::query()->where('is_system', true)->count() >= count($templateSeeds)
            && TemplateBlock::query()->whereNull('presentation_template_id')->count() >= count($globalBlocks);

        if ($hasSeededLibrary) {
            return;
        }

        DB::transaction(function () use ($categorySeeds, $templateSeeds, $globalBlocks) {
            foreach ($categorySeeds as $index => $category) {
                TemplateCategory::query()->updateOrCreate(
                    ['slug' => $category['slug']],
                    [
                        'name' => $category['name'],
                        'description' => $category['description'],
                        'accent_color' => $category['accent_color'],
                        'sort_order' => $index + 1,
                    ],
                );
            }

            foreach ($templateSeeds as $seed) {
                $template = PresentationTemplate::query()->updateOrCreate(
                    ['slug' => $seed['slug']],
                    Arr::except($seed, ['slides', 'blocks']),
                );

                foreach ($seed['slides'] as $position => $slide) {
                    TemplateSlide::query()->updateOrCreate(
                        [
                            'presentation_template_id' => $template->id,
                            'position' => $position + 1,
                        ],
                        [
                            'title' => $slide['title'],
                            'layout' => $slide['layout'],
                            'summary' => $slide['summary'],
                            'canvas_settings' => $slide['canvas_settings'],
                            'elements' => $slide['elements'],
                        ],
                    );
                }

                foreach ($seed['blocks'] as $block) {
                    TemplateBlock::query()->updateOrCreate(
                        [
                            'presentation_template_id' => $template->id,
                            'name' => $block['name'],
                        ],
                        [
                            'type' => $block['type'],
                            'category' => $block['category'],
                            'description' => $block['description'],
                            'schema' => $block['schema'],
                            'is_system' => true,
                        ],
                    );
                }
            }

            foreach ($globalBlocks as $block) {
                TemplateBlock::query()->updateOrCreate(
                    [
                        'presentation_template_id' => null,
                        'name' => $block['name'],
                    ],
                    [
                        'type' => $block['type'],
                        'category' => $block['category'],
                        'description' => $block['description'],
                        'schema' => $block['schema'],
                        'is_system' => true,
                    ],
                );
            }
        });
    }

    private function categorySeed(): array
    {
        return [
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Corporate strategy, reports, and client-ready decks.', 'accent_color' => '#2563EB'],
            ['name' => 'Startup Pitch Deck', 'slug' => 'startup-pitch-deck', 'description' => 'Investor-ready storytelling for founders and operators.', 'accent_color' => '#7C3AED'],
            ['name' => 'Education', 'slug' => 'education', 'description' => 'Courses, workshops, and learning-centered presentations.', 'accent_color' => '#06B6D4'],
            ['name' => 'Church', 'slug' => 'church', 'description' => 'Worship, sermon, and ministry presentation kits.', 'accent_color' => '#A855F7'],
            ['name' => 'Technology', 'slug' => 'technology', 'description' => 'Launches, architecture, and roadmap decks.', 'accent_color' => '#0EA5E9'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'description' => 'Campaigns, social growth, and brand planning.', 'accent_color' => '#F97316'],
            ['name' => 'Medical', 'slug' => 'medical', 'description' => 'Healthcare research and patient-facing storytelling.', 'accent_color' => '#10B981'],
            ['name' => 'Finance', 'slug' => 'finance', 'description' => 'Board reporting, KPI reviews, and investor updates.', 'accent_color' => '#14B8A6'],
            ['name' => 'Portfolio', 'slug' => 'portfolio', 'description' => 'Personal branding and project showcase decks.', 'accent_color' => '#F43F5E'],
            ['name' => 'Creative Agency', 'slug' => 'creative-agency', 'description' => 'Narrative-led client proposals and showcases.', 'accent_color' => '#8B5CF6'],
            ['name' => 'Real Estate', 'slug' => 'real-estate', 'description' => 'Listings, investment briefs, and market snapshots.', 'accent_color' => '#0284C7'],
            ['name' => 'Ecommerce', 'slug' => 'ecommerce', 'description' => 'Growth loops, retention, and storefront strategy.', 'accent_color' => '#F59E0B'],
            ['name' => 'Social Media', 'slug' => 'social-media', 'description' => 'Content plans and channel reporting decks.', 'accent_color' => '#EC4899'],
            ['name' => 'Proposal', 'slug' => 'proposal', 'description' => 'Professional proposal frameworks and client scopes.', 'accent_color' => '#3B82F6'],
            ['name' => 'Report', 'slug' => 'report', 'description' => 'Executive summaries and quarterly reviews.', 'accent_color' => '#64748B'],
            ['name' => 'Webinar', 'slug' => 'webinar', 'description' => 'Live session slide kits with speaking flow.', 'accent_color' => '#6366F1'],
            ['name' => 'Event Presentation', 'slug' => 'event-presentation', 'description' => 'Event agendas, openers, and sponsor storytelling.', 'accent_color' => '#E11D48'],
        ];
    }

    private function templateSeeds(): array
    {
        return [
            $this->makeTemplateSeed(
                name: 'Bluechip Board Review',
                slug: 'bluechip-board-review',
                category: 'Business',
                description: 'A polished executive review deck with KPI storytelling, quarterly momentum, and clean board-ready structure.',
                colorPalette: ['#0F172A', '#2563EB', '#06B6D4', '#E2E8F0'],
                fonts: ['heading' => 'Inter', 'body' => 'Poppins'],
                flags: ['featured' => true, 'trending' => true, 'recommended' => true],
                slides: [
                    ['Quarterly momentum', 'A refined opener for strategy, performance, and next moves.'],
                    ['Metrics spotlight', 'Showcase revenue, pipeline, and delivery health in one frame.'],
                    ['Roadmap confidence', 'Translate initiatives into crisp business decisions.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Founder Signal',
                slug: 'founder-signal',
                category: 'Startup Pitch Deck',
                description: 'A dramatic investor deck built for problem-solution flow, traction proof, and a confident fundraise narrative.',
                colorPalette: ['#09090B', '#7C3AED', '#06B6D4', '#F8FAFC'],
                fonts: ['heading' => 'Poppins', 'body' => 'Inter'],
                flags: ['featured' => true, 'trending' => true, 'recommended' => false],
                slides: [
                    ['A market-sized problem', 'Frame the tension with clarity and urgency.'],
                    ['Product and traction', 'Turn your screenshots and metrics into proof.'],
                    ['The ask', 'Land the raise with momentum, confidence, and precision.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Campus Lecture Flow',
                slug: 'campus-lecture-flow',
                category: 'Education',
                description: 'An elegant classroom template with lesson objectives, content hierarchy, and interactive discussion moments.',
                colorPalette: ['#0F172A', '#14B8A6', '#F8FAFC', '#CFFAFE'],
                fonts: ['heading' => 'Inter', 'body' => 'Inter'],
                flags: ['featured' => false, 'trending' => false, 'recommended' => true],
                slides: [
                    ['Learning outcomes', 'Begin with clear goals and expected takeaways.'],
                    ['Concept breakdown', 'Present ideas in digestible, visual-first segments.'],
                    ['Reflection and recap', 'Close with prompts and retention cues.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Grace Gathering',
                slug: 'grace-gathering',
                category: 'Church',
                description: 'Warm ministry slides designed for worship, scripture reading, sermon flow, and announcements.',
                colorPalette: ['#1E1B4B', '#A855F7', '#F59E0B', '#FAF5FF'],
                fonts: ['heading' => 'Poppins', 'body' => 'Inter'],
                flags: ['featured' => false, 'trending' => true, 'recommended' => true],
                slides: [
                    ['Welcome and worship', 'Set a peaceful tone with layered light and warmth.'],
                    ['Scripture focus', 'Keep the verse large, readable, and centered.'],
                    ['Community updates', 'Present ministry moments in a calm, modern layout.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Product Launch Grid',
                slug: 'product-launch-grid',
                category: 'Technology',
                description: 'A high-clarity tech launch template with product features, architecture views, and GTM storytelling.',
                colorPalette: ['#020617', '#0EA5E9', '#22D3EE', '#E0F2FE'],
                fonts: ['heading' => 'Inter', 'body' => 'Poppins'],
                flags: ['featured' => true, 'trending' => false, 'recommended' => true],
                slides: [
                    ['Launch vision', 'Introduce the product with a bold single-message opener.'],
                    ['Architecture and value', 'Balance technical confidence with user clarity.'],
                    ['Rollout plan', 'Sequence launch steps across teams and milestones.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Campaign Lift',
                slug: 'campaign-lift',
                category: 'Marketing',
                description: 'A vibrant campaign template for growth teams, performance reviews, and brand narratives.',
                colorPalette: ['#111827', '#F97316', '#EC4899', '#FFF7ED'],
                fonts: ['heading' => 'Poppins', 'body' => 'Inter'],
                flags: ['featured' => false, 'trending' => true, 'recommended' => false],
                slides: [
                    ['Campaign concept', 'Lead with the idea, audience, and message tension.'],
                    ['Channel mix', 'Break down content, spend, and engagement visually.'],
                    ['Performance recap', 'Spotlight outcomes and the next optimization move.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Capital Report',
                slug: 'capital-report',
                category: 'Finance',
                description: 'A structured finance presentation for board updates, fund reviews, and forecast storytelling.',
                colorPalette: ['#06202A', '#14B8A6', '#38BDF8', '#F8FAFC'],
                fonts: ['heading' => 'Inter', 'body' => 'Inter'],
                flags: ['featured' => false, 'trending' => false, 'recommended' => true],
                slides: [
                    ['Fund performance', 'Open with the signal that matters most to stakeholders.'],
                    ['Portfolio health', 'Use compact visuals for trends, risks, and upside.'],
                    ['Outlook and decision points', 'Bring the board into the next move.'],
                ],
            ),
            $this->makeTemplateSeed(
                name: 'Agency Showcase',
                slug: 'agency-showcase',
                category: 'Creative Agency',
                description: 'A stylish client-facing template for portfolios, creative proposals, and visual storytelling.',
                colorPalette: ['#18181B', '#8B5CF6', '#F43F5E', '#FAFAFA'],
                fonts: ['heading' => 'Poppins', 'body' => 'Inter'],
                flags: ['featured' => true, 'trending' => true, 'recommended' => false],
                slides: [
                    ['Creative direction', 'Use tension, whitespace, and visuals to anchor the story.'],
                    ['Selected work', 'Spotlight case studies in a premium editorial rhythm.'],
                    ['Engagement model', 'Present timelines, pricing, and delivery clearly.'],
                ],
            ),
        ];
    }

    private function makeTemplateSeed(
        string $name,
        string $slug,
        string $category,
        string $description,
        array $colorPalette,
        array $fonts,
        array $flags,
        array $slides,
    ): array {
        $elementsFor = function (string $title, string $summary, array $palette, string $category, int $index): array {
            $chartLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
            $chartSeries = [28 + ($index * 4), 41 + ($index * 3), 54 + ($index * 5), 68 + ($index * 4)];

            return [
                [
                    'type' => 'shape',
                    'name' => 'Accent glow',
                    'x' => 54,
                    'y' => 52,
                    'width' => 220,
                    'height' => 220,
                    'style' => ['background' => "radial-gradient(circle, {$palette[1]}55 0%, transparent 72%)", 'borderRadius' => 999],
                    'content' => [],
                ],
                [
                    'type' => 'heading',
                    'name' => 'Slide heading',
                    'x' => 74,
                    'y' => 82,
                    'width' => 610,
                    'height' => 92,
                    'style' => ['fontSize' => 42, 'fontWeight' => 700, 'color' => '#F8FAFC'],
                    'content' => ['text' => $title],
                ],
                [
                    'type' => 'text',
                    'name' => 'Slide summary',
                    'x' => 74,
                    'y' => 188,
                    'width' => 520,
                    'height' => 88,
                    'style' => ['fontSize' => 18, 'lineHeight' => 1.6, 'color' => '#E2E8F0'],
                    'content' => ['text' => $summary],
                ],
                [
                    'type' => 'image',
                    'name' => 'Built-in preview image',
                    'x' => 648,
                    'y' => 88,
                    'width' => 214,
                    'height' => 148,
                    'style' => [
                        'borderRadius' => 24,
                        'borderColor' => 'rgba(255,255,255,0.18)',
                        'objectFit' => 'cover',
                    ],
                    'content' => [
                        'src' => $this->makeBuiltInImage($title, $category, $palette, $index),
                        'alt' => "{$title} preview",
                    ],
                ],
                [
                    'type' => 'chart',
                    'name' => 'Built-in chart',
                    'x' => 612,
                    'y' => 266,
                    'width' => 274,
                    'height' => 172,
                    'style' => [
                        'chartType' => $index % 2 === 0 ? 'bar' : 'line',
                        'background' => 'rgba(15,23,42,0.22)',
                        'borderColor' => 'rgba(255,255,255,0.12)',
                        'color' => '#F8FAFC',
                    ],
                    'content' => [
                        'title' => $index % 2 === 0 ? 'Growth snapshot' : 'Trendline',
                        'labels' => $chartLabels,
                        'series' => [
                            [
                                'name' => 'Performance',
                                'data' => $chartSeries,
                                'color' => $palette[2],
                            ],
                        ],
                    ],
                ],
            ];
        };

        return [
            'user_id' => null,
            'name' => $name,
            'slug' => $slug,
            'category' => $category,
            'thumbnail_url' => null,
            'preview_image_url' => null,
            'description' => $description,
            'slides_count' => count($slides),
            'is_featured' => $flags['featured'],
            'is_trending' => $flags['trending'],
            'is_recommended' => $flags['recommended'],
            'is_system' => true,
            'usage_count' => 48 + (crc32($slug) % 120),
            'theme_config' => [
                'primary' => $colorPalette[1],
                'secondary' => $colorPalette[0],
                'accent' => $colorPalette[2],
                'surface' => $colorPalette[0],
            ],
            'color_palette' => $colorPalette,
            'font_pair' => $fonts,
            'tags' => [$category, 'Premium', 'SaaS', 'AI-ready'],
            'preview_mode' => 'immersive',
            'structure' => [
                'slides' => collect($slides)->map(fn (array $slide) => $slide[0])->all(),
            ],
            'slides' => collect($slides)->map(function (array $slide, int $index) use ($colorPalette, $elementsFor, $category) {
                return [
                    'title' => $slide[0],
                    'layout' => $index === 0 ? 'hero' : 'content-grid',
                    'summary' => $slide[1],
                    'canvas_settings' => [
                        'background' => "linear-gradient(135deg, {$colorPalette[0]} 0%, {$colorPalette[1]} 100%)",
                        'grid' => false,
                    ],
                    'elements' => $elementsFor($slide[0], $slide[1], $colorPalette, $category, $index),
                ];
            })->all(),
            'blocks' => [
                ['name' => 'Hero section', 'type' => 'hero', 'category' => 'Structure', 'description' => 'Large title block with supporting summary.', 'schema' => ['columns' => 1, 'supportsMedia' => true]],
                ['name' => 'Statistics cards', 'type' => 'stats', 'category' => 'Data', 'description' => 'Compact KPI storytelling cards.', 'schema' => ['cards' => 3]],
                ['name' => 'Timeline flow', 'type' => 'timeline', 'category' => 'Narrative', 'description' => 'Roadmap and milestone section.', 'schema' => ['steps' => 4]],
            ],
        ];
    }

    private function globalBlocks(): array
    {
        return [
            ['name' => 'Hero sections', 'type' => 'hero', 'category' => 'Sections', 'description' => 'Statement-led slide openers.', 'schema' => ['supportsImage' => true]],
            ['name' => 'Charts', 'type' => 'charts', 'category' => 'Data', 'description' => 'Column, pie, and line-chart layouts.', 'schema' => ['variants' => ['bar', 'line', 'pie']]],
            ['name' => 'Team sections', 'type' => 'team', 'category' => 'People', 'description' => 'Profile cards for leadership or ministry teams.', 'schema' => ['cards' => 4]],
            ['name' => 'Testimonials', 'type' => 'testimonials', 'category' => 'Social proof', 'description' => 'Quote-based story blocks.', 'schema' => ['quotes' => 2]],
            ['name' => 'Pricing tables', 'type' => 'pricing', 'category' => 'Commerce', 'description' => 'Tiered pricing comparison layouts.', 'schema' => ['plans' => 3]],
            ['name' => 'Timelines', 'type' => 'timeline', 'category' => 'Narrative', 'description' => 'Phase-based journey slides.', 'schema' => ['steps' => 5]],
            ['name' => 'Infographics', 'type' => 'infographics', 'category' => 'Visual', 'description' => 'Diagram-led explanation blocks.', 'schema' => ['icons' => 4]],
            ['name' => 'Statistics cards', 'type' => 'stats', 'category' => 'Data', 'description' => 'Big-number storytelling blocks.', 'schema' => ['cards' => 4]],
            ['name' => 'Comparison tables', 'type' => 'comparison', 'category' => 'Analysis', 'description' => 'Before and after or option comparisons.', 'schema' => ['columns' => 3]],
            ['name' => 'Contact sections', 'type' => 'contact', 'category' => 'Closing', 'description' => 'Contact info, QR, and CTA ending slides.', 'schema' => ['supportsQr' => true]],
        ];
    }

    private function makeBuiltInImage(string $title, string $category, array $palette, int $index): string
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$palette[0]}"/>
      <stop offset="100%" stop-color="{$palette[1]}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="800" rx="42" fill="url(#bg)"/>
  <circle cx="970" cy="150" r="120" fill="{$palette[2]}" fill-opacity="0.28"/>
  <circle cx="1070" cy="660" r="180" fill="#ffffff" fill-opacity="0.08"/>
  <rect x="72" y="74" width="240" height="34" rx="17" fill="#ffffff" fill-opacity="0.14"/>
  <text x="92" y="97" fill="#ffffff" font-size="20" font-family="Arial, sans-serif">{$category}</text>
  <text x="72" y="208" fill="#ffffff" font-size="58" font-weight="700" font-family="Arial, sans-serif">{$this->escapeSvgText($title)}</text>
  <text x="72" y="262" fill="#E2E8F0" font-size="24" font-family="Arial, sans-serif">Built-in free template image</text>
  <rect x="72" y="336" width="480" height="248" rx="28" fill="#ffffff" fill-opacity="0.11"/>
  <rect x="104" y="372" width="188" height="18" rx="9" fill="#ffffff" fill-opacity="0.76"/>
  <rect x="104" y="414" width="312" height="14" rx="7" fill="#ffffff" fill-opacity="0.32"/>
  <rect x="104" y="446" width="276" height="14" rx="7" fill="#ffffff" fill-opacity="0.24"/>
  <rect x="104" y="504" width="96" height="96" rx="26" fill="{$palette[2]}" fill-opacity="0.82"/>
  <rect x="224" y="504" width="96" height="96" rx="26" fill="#ffffff" fill-opacity="0.16"/>
  <rect x="344" y="504" width="96" height="96" rx="26" fill="#ffffff" fill-opacity="0.16"/>
  <text x="905" y="688" fill="#ffffff" fill-opacity="0.8" font-size="18" font-family="Arial, sans-serif">Slide __SLIDE_INDEX__</text>
</svg>
SVG;

        $svg = str_replace('__SLIDE_INDEX__', (string) ($index + 1), $svg);

        return 'data:image/svg+xml;utf8,' . rawurlencode($svg);
    }

    private function escapeSvgText(string $text): string
    {
        return htmlspecialchars($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }
}
