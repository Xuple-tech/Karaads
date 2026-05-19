import { useDeferredValue, useMemo, useState, type CSSProperties } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    LayoutTemplate,
    Plus,
    Search,
    WandSparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/spa/lib/api';

type TemplateSlide = {
    id: string;
    title: string;
    summary: string;
    layout: string;
    canvas_settings?: { background?: string; grid?: boolean; preview_image_url?: string };
    elements?: Array<{
        type: string;
        name?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        style?: Record<string, string | number | boolean | undefined>;
        content?: {
            text?: string;
            src?: string;
            chartType?: string;
            labels?: string[];
            series?: Array<{
                name: string;
                data: number[];
            }>;
        };
    }>;
};

type TemplateBlock = {
    id: string;
    name: string;
    type: string;
    category?: string | null;
    description?: string | null;
};

type Template = {
    id: string;
    name: string;
    slug: string;
    category: string;
    description: string;
    slides_count: number;
    color_palette: string[];
    font_pair?: { heading?: string; body?: string };
    usage_count: number;
    favorites_count: number;
    is_favorited: boolean;
    access_tier?: string;
    built_in_assets?: {
        images?: number;
        charts?: number;
        text_blocks?: number;
        shape_blocks?: number;
    };
    is_powerpoint_template?: boolean;
    template_format?: string | null;
    source_file_name?: string | null;
    source_file_url?: string | null;
    google_slides_presentation_id?: string | null;
    google_slides_web_view_link?: string | null;
    preview_slides: TemplateSlide[];
    blocks: TemplateBlock[];
};

const normalizeTemplate = (template: Partial<Template> & Pick<Template, 'id' | 'name' | 'slug' | 'category'>): Template => ({
    id: template.id,
    name: template.name,
    slug: template.slug,
    category: template.category,
    description: template.description ?? '',
    slides_count: template.slides_count ?? template.preview_slides?.length ?? 0,
    color_palette: Array.isArray(template.color_palette) && template.color_palette.length > 0 ? template.color_palette : ['#0F172A', '#2563EB'],
    font_pair: template.font_pair ?? {},
    usage_count: template.usage_count ?? 0,
    favorites_count: template.favorites_count ?? 0,
    is_favorited: template.is_favorited ?? false,
    access_tier: template.access_tier,
    built_in_assets: template.built_in_assets ?? {},
    is_powerpoint_template: template.is_powerpoint_template ?? false,
    template_format: template.template_format ?? null,
    source_file_name: template.source_file_name ?? null,
    source_file_url: template.source_file_url ?? null,
    google_slides_presentation_id: template.google_slides_presentation_id ?? null,
    google_slides_web_view_link: template.google_slides_web_view_link ?? null,
    preview_slides: Array.isArray(template.preview_slides) ? template.preview_slides : [],
    blocks: Array.isArray(template.blocks) ? template.blocks : [],
});

type TemplateCategory = {
    id: string;
    name: string;
    slug: string;
    description: string;
    accent_color?: string | null;
};

type TemplateMarketplaceResponse = {
    access?: string;
    templates: Template[];
    sections: {
        trending: Template[];
        recommended: Template[];
        featured: Template[];
    };
    categories: TemplateCategory[];
};

type PresentationItem = {
    id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    theme_name?: string | null;
    status: string;
    slide_count: number;
    view_count: number;
};

type PresentationResponse = {
    presentations: PresentationItem[];
    stats: {
        total: number;
        drafts: number;
        shared: number;
        views: number;
    };
};

const FALLBACK_TEMPLATES: Template[] = [
    {
        id: 'fallback-business',
        name: 'Bluechip Board Review',
        slug: 'bluechip-board-review',
        category: 'Business',
        description: 'Executive-ready slides for metrics, strategy, and stakeholder storytelling.',
        slides_count: 8,
        color_palette: ['#0F172A', '#2563EB', '#06B6D4', '#E2E8F0'],
        font_pair: { heading: 'Inter', body: 'Poppins' },
        usage_count: 124,
        favorites_count: 42,
        is_favorited: false,
        preview_slides: [
            {
                id: 'fallback-business-1',
                title: 'Quarterly momentum',
                summary: 'A refined opener for strategy, performance, and next moves.',
                layout: 'hero',
                canvas_settings: { background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)' },
            },
        ],
        blocks: [],
    },
    {
        id: 'fallback-startup',
        name: 'Founder Signal',
        slug: 'founder-signal',
        category: 'Startup Pitch Deck',
        description: 'Investor-focused slides for problem, traction, product, and ask.',
        slides_count: 10,
        color_palette: ['#09090B', '#7C3AED', '#06B6D4', '#F8FAFC'],
        font_pair: { heading: 'Poppins', body: 'Inter' },
        usage_count: 97,
        favorites_count: 31,
        is_favorited: false,
        preview_slides: [
            {
                id: 'fallback-startup-1',
                title: 'A market-sized problem',
                summary: 'Frame the tension with clarity, urgency, and investor confidence.',
                layout: 'hero',
                canvas_settings: { background: 'linear-gradient(135deg, #09090B 0%, #7C3AED 100%)' },
            },
        ],
        blocks: [],
    },
    {
        id: 'fallback-church',
        name: 'Grace Gathering',
        slug: 'grace-gathering',
        category: 'Church',
        description: 'Warm ministry slides for worship, scripture, sermon flow, and announcements.',
        slides_count: 6,
        color_palette: ['#1E1B4B', '#A855F7', '#F59E0B', '#FAF5FF'],
        font_pair: { heading: 'Poppins', body: 'Inter' },
        usage_count: 65,
        favorites_count: 18,
        is_favorited: false,
        preview_slides: [
            {
                id: 'fallback-church-1',
                title: 'Welcome and worship',
                summary: 'Set a peaceful tone with layered light, warmth, and clear scripture-first hierarchy.',
                layout: 'hero',
                canvas_settings: { background: 'linear-gradient(135deg, #1E1B4B 0%, #A855F7 100%)' },
            },
        ],
        blocks: [],
    },
];

function TemplateCanvasPreview({
    slide,
    template,
    className = '',
    compact = false,
}: {
    slide: TemplateSlide | null;
    template: Template;
    className?: string;
    compact?: boolean;
}) {
    const background =
        slide?.canvas_settings?.background ??
        `linear-gradient(135deg, ${template.color_palette[0] ?? '#0F172A'} 0%, ${template.color_palette[1] ?? '#2563EB'} 100%)`;
    const exactPreviewImage = slide?.canvas_settings?.preview_image_url;

    const elements = slide?.elements ?? [];

    return (
        <div
            className={`relative overflow-hidden rounded-[28px] border border-white/10 ${className}`}
            style={{ background }}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%)]" />
            {exactPreviewImage ? (
                <div className="relative mx-auto aspect-[16/9] w-full max-w-[960px]">
                    <img
                        src={exactPreviewImage}
                        alt={slide?.title ?? `${template.name} slide preview`}
                        className="h-full w-full rounded-[28px] object-contain"
                    />
                </div>
            ) : elements.length > 0 && !compact ? (
                <div className="relative mx-auto aspect-[16/9] w-full max-w-[960px]">
                    {elements.map((element, index) => {
                        const x = element.x ?? 0;
                        const y = element.y ?? 0;
                        const width = element.width ?? 240;
                        const height = element.height ?? 80;
                        const style = element.style ?? {};
                        const sharedStyle: CSSProperties = {
                            position: 'absolute',
                            left: `${(x / 960) * 100}%`,
                            top: `${(y / 540) * 100}%`,
                            width: `${(width / 960) * 100}%`,
                            minHeight: `${Math.max((height / 540) * 100, 8)}%`,
                            color: typeof style.color === 'string' ? style.color : '#F8FAFC',
                            fontSize: typeof style.fontSize === 'number' ? `clamp(12px, ${style.fontSize / 12}vw, ${style.fontSize}px)` : undefined,
                            fontWeight: typeof style.fontWeight === 'number' ? style.fontWeight : 500,
                            lineHeight: typeof style.lineHeight === 'number' ? String(style.lineHeight) : '1.4',
                            borderRadius: typeof style.shape === 'string' && style.shape.includes('rounded') ? '24px' : '0px',
                            background: typeof style.background === 'string' ? style.background : 'transparent',
                            border: typeof style.borderColor === 'string' ? `1px solid ${style.borderColor}` : undefined,
                            boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
                            padding: element.type === 'shape' ? '1rem' : 0,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                        };

                        if (element.type === 'image' && element.content?.src) {
                            return (
                                <img
                                    key={`${element.name ?? element.type}-${index}`}
                                    src={element.content.src}
                                    alt={element.name ?? 'Slide image'}
                                    className="absolute rounded-[20px] object-cover"
                                    style={sharedStyle}
                                />
                            );
                        }

                        if (element.type === 'chart') {
                            const labels = element.content?.labels ?? [];
                            const series = element.content?.series ?? [];
                            const data = series[0]?.data ?? [];
                            const maxValue = Math.max(...data, 1);

                            return (
                                <div
                                    key={`${element.name ?? element.type}-${index}`}
                                    className="absolute rounded-[22px] border border-white/15 bg-black/15 p-4 backdrop-blur-sm"
                                    style={sharedStyle}
                                >
                                    <div className="mb-3 text-sm font-semibold text-white">{series[0]?.name ?? 'Chart'}</div>
                                    <div className="flex h-full items-end gap-2">
                                        {data.slice(0, 6).map((value, dataIndex) => (
                                            <div key={`${value}-${dataIndex}`} className="flex flex-1 flex-col items-center justify-end gap-2">
                                                <div
                                                    className="w-full rounded-t-xl bg-gradient-to-t from-cyan-400 to-blue-500"
                                                    style={{ height: `${Math.max((value / maxValue) * 70, 12)}%` }}
                                                />
                                                <div className="text-center text-[10px] text-slate-100/80">
                                                    {labels[dataIndex] ?? `#${dataIndex + 1}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={`${element.name ?? element.type}-${index}`}
                                className={element.type === 'shape' ? 'flex items-end' : ''}
                                style={sharedStyle}
                            >
                                {element.content?.text ?? ''}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="relative flex min-h-[420px] flex-col justify-between p-8">
                    <div className="max-w-2xl">
                        <div className="text-4xl font-semibold text-white">{slide?.title ?? template.name}</div>
                        <div className="mt-4 text-base leading-7 text-slate-100/90">{slide?.summary ?? template.description}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TemplateCard({
    template,
    onUse,
}: {
    template: Template;
    onUse: (template: Template) => void;
}) {
    return (
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] p-3 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/[0.07]">
            <div className="relative h-44 overflow-hidden rounded-[20px] border border-white/10 p-2">
                <TemplateCanvasPreview slide={template.preview_slides[0] ?? null} template={template} className="h-full" compact />
                <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/90">
                        {template.category}
                    </span>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                        {template.is_powerpoint_template ? `Real ${template.template_format?.toUpperCase() || 'PPT'}` : (template.access_tier || 'Free')}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">{template.name}</div>
                    <div className="mt-1 text-xs text-slate-300">{template.slides_count} slides</div>
                    <div className="mt-1 line-clamp-2 break-words text-xs leading-5 text-slate-400">
                        {template.is_powerpoint_template
                            ? `${template.source_file_name || 'Uploaded PowerPoint template'}`
                            : (template.built_in_assets?.images ?? 0) > 0 || (template.built_in_assets?.charts ?? 0) > 0
                            ? `Built-in ${(template.built_in_assets?.images ?? 0) > 0 ? 'images' : ''}${(template.built_in_assets?.images ?? 0) > 0 && (template.built_in_assets?.charts ?? 0) > 0 ? ' + ' : ''}${(template.built_in_assets?.charts ?? 0) > 0 ? 'charts' : ''}`
                            : template.description}
                    </div>
                </div>
                <div className="flex shrink-0 gap-2 self-start sm:self-auto">
                    <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={() => onUse(template)}>
                        Use
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function Component() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [promptDraft, setPromptDraft] = useState('');
    const [designStyle, setDesignStyle] = useState<'auto' | 'template_real' | 'business_blue' | 'boardroom' | 'editorial' | 'tech_grid' | 'financial_clean'>('auto');
    const deferredSearch = useDeferredValue(search);

    const presentations = useQuery({
        queryKey: ['spa', 'slides', 'presentations'],
        queryFn: () => apiRequest<PresentationResponse>('/api/presentations'),
    });

    const templates = useQuery({
        queryKey: ['spa', 'slides', 'free-templates', deferredSearch],
        queryFn: () => {
            const query = new URLSearchParams();
            if (deferredSearch.trim()) query.set('search', deferredSearch.trim());
            return apiRequest<TemplateMarketplaceResponse>(`/api/presentations/free-templates${query.toString() ? `?${query.toString()}` : ''}`);
        },
    });

    const createPresentation = useMutation({
        mutationFn: async (payload: { title: string; category: string; template?: Template; aiPrompt?: string; designStyle?: string | null }) =>
            apiRequest<{ presentation: PresentationItem; redirect_to: string }>('/api/presentations', {
                method: 'POST',
                json: {
                    title: payload.title,
                    category: payload.category,
                    description: `${payload.category} presentation workspace`,
                    theme_name: payload.template?.name ?? 'Aurora Glass',
                    design_style: payload.designStyle ?? null,
                    template_id: payload.template?.id ?? null,
                    ai_prompt: payload.aiPrompt ?? null,
                },
            }),
        onSuccess: ({ redirect_to }) => {
            void presentations.refetch();
            void templates.refetch();
            navigate(redirect_to);
        },
        onError: () => toast.error('Could not create presentation.'),
    });

    const marketplace = templates.data;
    const marketplaceData: TemplateMarketplaceResponse =
        marketplace && marketplace.templates.length > 0
            ? {
                  ...marketplace,
                  templates: marketplace.templates.map(normalizeTemplate),
                  sections: {
                      trending: marketplace.sections.trending.map(normalizeTemplate),
                      recommended: marketplace.sections.recommended.map(normalizeTemplate),
                      featured: marketplace.sections.featured.map(normalizeTemplate),
                  },
              }
            : {
                  access: 'free',
                  templates: FALLBACK_TEMPLATES,
                  sections: {
                      trending: FALLBACK_TEMPLATES,
                      recommended: FALLBACK_TEMPLATES,
                      featured: FALLBACK_TEMPLATES,
                  },
                  categories: [],
              };

    const visibleTemplates = useMemo(
        () => (marketplaceData.sections.featured.length ? marketplaceData.sections.featured : marketplaceData.templates).slice(0, 3),
        [marketplaceData],
    );

    const createFromPrompt = (prompt: string) => {
        const trimmed = prompt.trim();
        if (!trimmed) {
            toast.error('Enter what you want the slides to be about.');
            return;
        }

        createPresentation.mutate({
            title: trimmed.slice(0, 80),
            category: 'Business',
            aiPrompt: trimmed,
            designStyle: designStyle === 'auto' ? null : designStyle,
        });
    };

    const designOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'template_real', label: 'Template Real' },
        { value: 'business_blue', label: 'Business Blue' },
        { value: 'boardroom', label: 'Boardroom' },
        { value: 'editorial', label: 'Editorial' },
        { value: 'tech_grid', label: 'Tech Grid' },
        { value: 'financial_clean', label: 'Financial' },
    ] as const;

    const promptSuggestions = [
        'Startup pitch deck',
        'Church presentation',
        'Marketing strategy',
        'Quarterly business review',
        'Business deck with a bar chart',
        'Create a school management proposal deck in a profissonal design with a polished consulting-style blue corporate design, clean section dividers, executive typography, and client-facing visuals.',
    ];

    return (
        <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_right,_rgba(124,58,237,0.16),_transparent_28%),linear-gradient(180deg,#030712_0%,#09111f_46%,#0b1220_100%)] px-4 py-6 text-white sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                    <div className="mx-auto max-w-4xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                            <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 rounded-sm object-contain" draggable={false} />
                            Kwati Slides
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm leading-7 text-slate-300 sm:text-base">
                                Keep it simple: write your topic, generate the deck, and your slides open automatically in the slide library.
                            </p>
                        </div>

                        <div className="rounded-[30px] border border-white/10 bg-black/25 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                                <textarea
                                    value={promptDraft}
                                    onChange={(event) => setPromptDraft(event.target.value)}
                                    placeholder="Create a startup pitch deck for an AI accounting product with a bar chart, timeline, and investor-ready visuals..."
                                    rows={4}
                                    className="w-full resize-none bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                                />
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {promptSuggestions.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    setPromptDraft(item);
                                                    if (item.includes('a profissonal design')) {
                                                        setDesignStyle('business_blue');
                                                    }
                                                }}
                                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                                    item.includes('a profissonal design')
                                                        ? 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15 hover:text-white'
                                                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {item.includes('a profissonal design') ? 'A profissonal Design' : item}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Design</span>
                                        {designOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setDesignStyle(option.value)}
                                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                                    designStyle === option.value
                                                        ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                                                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                            onClick={() =>
                                                createPresentation.mutate({
                                                    title: 'Untitled deck',
                                                    category: 'Business',
                                                    designStyle: designStyle === 'auto' ? null : designStyle,
                                                })
                                            }
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Blank
                                        </Button>
                                        <Button className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={() => createFromPrompt(promptDraft)}>
                                            <WandSparkles className="mr-2 h-4 w-4" />
                                            Generate slides
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs leading-6 text-slate-400">
                                    Tip: leave Design on `Auto` and ask naturally in the prompt, like `make it minimal`, `use a dark investor style`, `create a polished consulting proposal design`, `add a pie chart`, or `make it feel like a medical report`.
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Start from a template</h2>
                            <p className="text-sm text-slate-400">Pick one if you do not want to start from a prompt.</p>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search templates..."
                                className="h-11 rounded-full border-white/10 bg-black/20 pl-11 text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                        {visibleTemplates.map((template) => (
                            <TemplateCard
                            key={template.id}
                            template={template}
                            onUse={(pickedTemplate) =>
                                createPresentation.mutate({
                                    title: pickedTemplate.name,
                                        category: pickedTemplate.category,
                                        template: pickedTemplate,
                                        designStyle: designStyle === 'auto' ? null : designStyle,
                                    })
                                }
                            />
                        ))}
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-white">Recent decks</h2>
                        <p className="text-sm text-slate-400">Open a deck, preview the generated slides, or present it right away.</p>
                    </div>
                    <div className="grid gap-3">
                        {(presentations.data?.presentations ?? []).length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-slate-400">
                                No decks yet. Generate your first one above.
                            </div>
                        ) : (
                            presentations.data?.presentations.map((presentation) => (
                                <button
                                    key={presentation.id}
                                    type="button"
                                    onClick={() => navigate(`/slides/${presentation.id}`)}
                                    className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[#0f1b32]/70 p-4 text-left transition hover:border-cyan-400/30 hover:bg-[#12203a]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="text-lg font-medium text-white">{presentation.title}</div>
                                            <div className="mt-1 text-sm text-slate-400">{presentation.description || `${presentation.category || 'General'} workspace`}</div>
                                        </div>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                                            {presentation.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                                        <span>{presentation.slide_count} slides</span>
                                        <span>{presentation.theme_name || 'Aurora Glass'}</span>
                                        <span>{presentation.view_count} views</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
