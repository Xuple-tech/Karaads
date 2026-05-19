import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Presentation,
    WandSparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SlideCanvas, type SlideShape } from '@/spa/components/SlideCanvas';
import { apiRequest } from '@/spa/lib/api';

type PresentationPayload = {
    presentation: {
        id: string;
        title: string;
        description?: string | null;
        category?: string | null;
        slide_count: number;
        theme_name?: string | null;
        ai_metadata?: {
            workspace_prefers_live_canvas?: boolean;
            exact_slide_previews?: {
                format?: string;
                source?: string;
                images?: Array<{
                    index: number;
                    path?: string | null;
                    url?: string | null;
                }>;
            } | null;
            powerpoint_library?: {
                used?: boolean;
                format?: string;
                artifact?: {
                    url?: string | null;
                    filename?: string | null;
                } | null;
            } | null;
        } | null;
        slides: SlideShape[];
    };
    insights?: {
        completion_score?: number;
        design_health?: string;
        suggested_next_action?: string;
    };
};

export function Component() {
    const { presentationId } = useParams();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [aiPrompt, setAiPrompt] = useState('');

    const presentation = useQuery({
        queryKey: ['spa', 'slides', 'library', presentationId],
        enabled: Boolean(presentationId),
        queryFn: () => apiRequest<PresentationPayload>(`/api/presentations/${presentationId}`),
    });

    const exportDeck = useMutation({
        mutationFn: (format: 'pdf' | 'pptx') =>
            apiRequest<{ url?: string | null; filename?: string | null; message?: string }>(`/api/presentations/${presentationId}/exports`, {
                method: 'POST',
                json: { format },
            }),
        onSuccess: (payload, format) => {
            if (payload?.url) {
                const link = document.createElement('a');
                link.href = payload.url;
                link.download = payload.filename || `${title}.${format}`;
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                link.remove();
                toast.success(payload.message || `${format.toUpperCase()} export ready.`);
                return;
            }

            toast.success(`${format.toUpperCase()} export queued.`);
        },
        onError: () => toast.error('Could not export right now.'),
    });

    const applyAiChanges = useMutation({
        mutationFn: (prompt: string) =>
            apiRequest<{ success: boolean; slide: SlideShape }>(`/api/presentations/${presentationId}/ai-content`, {
                method: 'POST',
                json: {
                    slide_id: activeSlide?.id,
                    prompt,
                },
            }),
        onSuccess: async () => {
            setAiPrompt('');
            await presentation.refetch();
            toast.success('AI changes applied to the current slide.');
        },
        onError: () => toast.error('Could not apply AI changes right now.'),
    });

    const slides = presentation.data?.presentation.slides ?? [];
    const activeSlide = useMemo(() => slides[activeIndex] ?? slides[0], [activeIndex, slides]);
    const title = presentation.data?.presentation.title || 'Presentation';
    const powerPointArtifact = presentation.data?.presentation.ai_metadata?.powerpoint_library?.artifact;
    const prefersLiveCanvas = presentation.data?.presentation.ai_metadata?.workspace_prefers_live_canvas ?? false;
    const exactPreviewImages = presentation.data?.presentation.ai_metadata?.exact_slide_previews?.images ?? [];
    const activePreviewImage = prefersLiveCanvas ? null : exactPreviewImages[activeIndex]?.url;

    return (
        <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.2),_transparent_22%),radial-gradient(circle_at_right,_rgba(124,58,237,0.14),_transparent_28%),linear-gradient(180deg,#030712_0%,#09111f_50%,#0b1220_100%)] px-4 py-6 text-white sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-3">
                            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 rounded-sm object-contain" draggable={false} />
                                Kwati Slides
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                                    {presentation.data?.presentation.description || 'Your slides are ready. Browse the deck, preview each slide, and present when you are ready.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => exportDeck.mutate('pdf')}
                                disabled={exportDeck.isPending}
                            >
                                Export PDF
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => exportDeck.mutate('pptx')}
                                disabled={exportDeck.isPending}
                            >
                                Export PPTX
                            </Button>
                            {powerPointArtifact?.url ? (
                                <Button
                                    variant="ghost"
                                    className="rounded-full border border-cyan-300/20 bg-cyan-400/10 text-white hover:bg-cyan-400/15"
                                    onClick={() => window.open(powerPointArtifact.url || '', '_blank', 'noopener,noreferrer')}
                                >
                                    Open PowerPoint
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="rounded-[30px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm font-semibold text-white">Slides</div>
                                <div className="text-xs text-slate-400">{slides.length || 0} generated slides</div>
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                                {presentation.data?.presentation.category || 'General'}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className={`w-full rounded-[24px] border p-3 text-left transition ${
                                        index === activeIndex
                                            ? 'border-cyan-300/40 bg-cyan-400/10'
                                            : 'border-white/10 bg-black/10 hover:border-white/20 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="mb-3 overflow-hidden rounded-[18px] border border-white/10">
                                        {!prefersLiveCanvas && exactPreviewImages[index]?.url ? (
                                            <img
                                                src={exactPreviewImages[index]?.url || ''}
                                                alt={slide.title || `Slide ${index + 1}`}
                                                className="block aspect-[16/9] h-auto w-full rounded-none border-0 bg-white object-cover"
                                            />
                                        ) : (
                                            <SlideCanvas slide={slide} className="rounded-none border-0" />
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-white">
                                        {index + 1}. {slide.title || `Slide ${index + 1}`}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className="space-y-5">
                        <div className="rounded-[32px] border border-white/10 bg-[#0b1220] p-4 sm:p-6">
                            {activePreviewImage ? (
                                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
                                    <img
                                        src={activePreviewImage}
                                        alt={activeSlide?.title || 'Slide preview'}
                                        className="block aspect-[16/9] h-auto w-full object-cover"
                                    />
                                </div>
                            ) : activeSlide ? (
                                <SlideCanvas slide={activeSlide} />
                            ) : null}
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-lg font-semibold text-white">{activeSlide?.title || 'Slide preview'}</div>
                                    <div className="text-sm text-slate-400">
                                        Slide {activeIndex + 1} of {slides.length || 1}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                                        disabled={activeIndex === 0}
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        onClick={() => setActiveIndex((current) => Math.min(slides.length - 1, current + 1))}
                                        disabled={activeIndex >= slides.length - 1}
                                    >
                                        Next
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                    <WandSparkles className="h-4 w-4 text-cyan-300" />
                                    AI changes
                                </div>
                                <div className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(event) => setAiPrompt(event.target.value)}
                                        placeholder="Ask AI to change this slide. Example: make this slide look more formal, add a pie chart, turn this into a proposal summary, or rewrite it for an executive audience."
                                        rows={5}
                                        className="w-full resize-none bg-transparent text-sm leading-7 text-white outline-none placeholder:text-slate-500"
                                    />
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                                        <div className="text-xs leading-6 text-slate-400">
                                            The AI will update the currently selected slide and keep you in this workspace.
                                        </div>
                                        <Button
                                            className="rounded-full bg-white text-slate-950 hover:bg-slate-100"
                                            onClick={() => {
                                                const prompt = aiPrompt.trim();
                                                if (!prompt || !activeSlide?.id) {
                                                    toast.error('Write what you want changed first.');
                                                    return;
                                                }

                                                applyAiChanges.mutate(prompt);
                                            }}
                                            disabled={applyAiChanges.isPending || !activeSlide?.id}
                                        >
                                            <WandSparkles className="mr-2 h-4 w-4" />
                                            {applyAiChanges.isPending ? 'Applying...' : 'Apply with AI'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                    <Presentation className="h-4 w-4 text-cyan-300" />
                                    Speaker notes
                                </div>
                                <div className="rounded-[22px] border border-white/10 bg-black/10 p-4 text-sm leading-7 text-slate-300">
                                    {activeSlide?.speaker_notes || 'AI speaker notes will appear here when available for this slide.'}
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                                <div className="mb-3 text-sm font-semibold text-white">Deck insights</div>
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Completion</div>
                                        <div className="mt-2 text-2xl font-semibold text-white">
                                            {presentation.data?.insights?.completion_score ?? 0}%
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Design health</div>
                                        <div className="mt-2 text-sm font-medium text-white">
                                            {presentation.data?.insights?.design_health || 'Strong'}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Next action</div>
                                        <div className="mt-2 text-sm leading-6 text-slate-300">
                                            {presentation.data?.insights?.suggested_next_action || 'Open presenter mode when you are ready to walk through the slides.'}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Prompt-driven features</div>
                                        <div className="mt-2 text-sm leading-6 text-slate-300">
                                            Ask for things like bar charts, pie charts, timelines, pricing tables, image-heavy slides, or startup pitch styling in your prompt and the AI will apply them directly while building the deck.
                                        </div>
                                    </div>
                                    {powerPointArtifact?.url ? (
                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">PowerPoint library</div>
                                            <div className="mt-2 text-sm leading-6 text-slate-300">
                                                This deck was also generated through the PowerPoint library path, so a real `.pptx` version is ready alongside the web slide library.
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
