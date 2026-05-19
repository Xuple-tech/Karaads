import { ChevronLeft, ChevronRight, Maximize2, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { SlideCanvas, type SlideShape } from '@/spa/components/SlideCanvas';
import { apiRequest } from '@/spa/lib/api';

type PresentationPayload = {
    presentation: {
        title: string;
        slides: SlideShape[];
    };
};

export function Component() {
    const { presentationId } = useParams();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => setSeconds((current) => current + 1), 1000);
        return () => window.clearInterval(id);
    }, []);

    const presentation = useQuery({
        queryKey: ['spa', 'slides', 'present', presentationId],
        enabled: Boolean(presentationId),
        queryFn: () => apiRequest<PresentationPayload>(`/api/presentations/${presentationId}`),
    });

    const slides = presentation.data?.presentation.slides ?? [];
    const slide = useMemo(() => slides[activeIndex] ?? slides[0], [activeIndex, slides]);

    return (
        <div className="min-h-screen bg-[#020617] px-4 py-4 text-white">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-xl">
                    <div>
                        <div className="text-lg font-semibold">{presentation.data?.presentation.title || 'Presenter mode'}</div>
                        <div className="text-sm text-slate-400">Slide {activeIndex + 1} of {slides.length || 1}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="rounded-full text-white hover:bg-white/10" onClick={() => setSeconds(0)}>
                            <TimerReset className="mr-2 h-4 w-4" />
                            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
                        </Button>
                        <Button variant="ghost" className="rounded-full text-white hover:bg-white/10" onClick={() => navigate(`/slides/${presentationId}`)}>
                            <Maximize2 className="mr-2 h-4 w-4" />
                            Exit
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="rounded-[32px] border border-white/10 bg-[#0b1220] p-4">
                        <div className="mx-auto max-w-6xl">
                            {slide ? <SlideCanvas slide={slide} /> : null}
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                className="rounded-full text-white hover:bg-white/10"
                                onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full text-white hover:bg-white/10"
                                onClick={() => setActiveIndex((current) => Math.min(slides.length - 1, current + 1))}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <aside className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                        <div className="mb-3 text-sm font-semibold text-white">Speaker notes</div>
                        <div className="rounded-[22px] border border-white/10 bg-black/10 p-4 text-sm leading-7 text-slate-300">
                            {slide?.speaker_notes || 'No speaker notes yet. AI-generated notes will appear here when available.'}
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
