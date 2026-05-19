import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowDown,
    ArrowUp,
    Bot,
    BarChart3,
    ChevronLeft,
    Circle,
    Copy,
    Eye,
    EyeOff,
    Grid3X3,
    ImagePlus,
    Layers3,
    LayoutTemplate,
    Link2,
    Lock,
    LockOpen,
    Minus,
    MonitorPlay,
    Paintbrush2,
    PanelRightClose,
    PanelRightOpen,
    Plus,
    Save,
    Search,
    Share2,
    Sparkles,
    Square,
    TextCursorInput,
    Trash2,
    Undo2,
    Redo2,
    Upload,
    Users2,
    Video,
} from 'lucide-react';
import { type ChangeEvent, type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { renderSlideElementInner, type SlideElementShape as ElementShape, type SlideShape } from '@/spa/components/SlideCanvas';
import { apiRequest } from '@/spa/lib/api';

type PresentationPayload = {
    presentation: {
        id: string;
        title: string;
        description?: string | null;
        category?: string | null;
        theme_name?: string | null;
        status: string;
        visibility: string;
        theme_config?: Record<string, string> | null;
        slides: SlideShape[];
        comments: Array<{ id: string; body: string; user?: { name?: string | null } }>;
        collaborators: Array<{ id: string; role: string; user?: { name?: string | null } }>;
        exports: Array<{ id: string; format: string; status: string }>;
    };
    insights: {
        completion_score: number;
        design_health: string;
        suggested_next_action: string;
    };
};

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const SNAP_SIZE = 8;

const themes = [
    {
        name: 'Aurora Glass',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0EA5E9 100%)',
        text: '#F8FAFC',
        body: '#D6E3F1',
        accent: 'rgba(255,255,255,0.12)',
    },
    {
        name: 'Pitch Night',
        background: 'linear-gradient(135deg, #111827 0%, #312E81 48%, #7C3AED 100%)',
        text: '#F8FAFC',
        body: '#E9D5FF',
        accent: 'rgba(124,58,237,0.28)',
    },
    {
        name: 'Canva Air',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #DBEAFE 48%, #BFDBFE 100%)',
        text: '#111827',
        body: '#334155',
        accent: 'rgba(37,99,235,0.18)',
    },
];

const insertGroups = [
    {
        title: 'Start with structure',
        items: [
            { id: 'hero', label: 'Hero block', hint: 'Opening slide headline and support' },
            { id: 'stats', label: 'Stats block', hint: 'Three quick KPI cards' },
            { id: 'timeline', label: 'Timeline', hint: 'Milestones and rollout' },
        ],
    },
    {
        title: 'Quick elements',
        items: [
            { id: 'text', label: 'Text', hint: 'Headline or paragraph' },
            { id: 'image', label: 'Image', hint: 'Upload a visual to the slide' },
            { id: 'video', label: 'Video', hint: 'Embed YouTube, Vimeo, or mp4' },
            { id: 'chart', label: 'Chart', hint: 'Bar, line, or pie chart blocks' },
            { id: 'rectangle', label: 'Rectangle', hint: 'Card, frame, or panel' },
            { id: 'circle', label: 'Circle', hint: 'Badge or spotlight shape' },
            { id: 'triangle', label: 'Triangle', hint: 'Pointer or visual accent' },
        ],
    },
];

type HistoryState = {
    snapshots: SlideShape[][];
    index: number;
};

function uid(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneSlides(slides: SlideShape[]): SlideShape[] {
    return JSON.parse(JSON.stringify(slides)) as SlideShape[];
}

function snapValue(value: number, enabled: boolean): number {
    return enabled ? Math.round(value / SNAP_SIZE) * SNAP_SIZE : value;
}

export function Component() {
    const { presentationId } = useParams();
    const navigate = useNavigate();
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [localSlides, setLocalSlides] = useState<SlideShape[]>([]);
    const [activeTheme, setActiveTheme] = useState<string>('Aurora Glass');
    const [slideSearch, setSlideSearch] = useState('');
    const [leftPanelTab, setLeftPanelTab] = useState<'slides' | 'insert' | 'brand'>('slides');
    const [zoom, setZoom] = useState(100);
    const [showGrid, setShowGrid] = useState(true);
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'layers' | 'assistant'>('properties');
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const [commentDraft, setCommentDraft] = useState('');
    const [imageTargetElementId, setImageTargetElementId] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryState>({ snapshots: [], index: -1 });
    const [interaction, setInteraction] = useState<null | {
        type: 'drag' | 'resize';
        elementId: string;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
    }>(null);

    const slidesRef = useRef<SlideShape[]>([]);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const initializedRef = useRef(false);
    useEffect(() => {
        slidesRef.current = localSlides;
    }, [localSlides]);

    const presentation = useQuery({
        queryKey: ['spa', 'slides', presentationId],
        enabled: Boolean(presentationId),
        queryFn: () => apiRequest<PresentationPayload>(`/api/presentations/${presentationId}`),
    });

    useEffect(() => {
        const deck = presentation.data?.presentation;
        if (!deck) return;
        const nextSlides = cloneSlides(deck.slides);
        setLocalSlides(nextSlides);
        setHistory({ snapshots: [cloneSlides(nextSlides)], index: 0 });
        setActiveTheme(deck.theme_name || 'Aurora Glass');
        setSelectedSlideId((current) => current ?? deck.slides[0]?.id ?? null);
        setShowGrid(deck.slides[0]?.canvas_settings?.grid ?? true);
        setSaveState('saved');
        initializedRef.current = true;
    }, [presentation.data]);

    const pushHistory = (nextSlides: SlideShape[]) => {
        setHistory((current) => {
            const base = current.snapshots.slice(0, current.index + 1);
            return {
                snapshots: [...base, cloneSlides(nextSlides)],
                index: base.length,
            };
        });
    };

    const applySlides = (nextSlides: SlideShape[], trackHistory = true) => {
        setLocalSlides(nextSlides);
        if (initializedRef.current) {
            setSaveState('unsaved');
        }
        if (trackHistory) {
            pushHistory(nextSlides);
        }
    };

    const addSlide = useMutation({
        mutationFn: () =>
            apiRequest(`/api/presentations/${presentationId}/slides`, {
                method: 'POST',
                json: { title: 'New slide', layout: 'content-grid' },
            }),
        onSuccess: () => {
            toast.success('Slide added');
            void presentation.refetch();
        },
    });

    const duplicateSlideMutation = useMutation({
        mutationFn: (slideId: string) =>
            apiRequest(`/api/presentations/${presentationId}/slides/${slideId}/duplicate`, {
                method: 'POST',
            }),
        onSuccess: () => {
            toast.success('Slide duplicated');
            void presentation.refetch();
        },
        onError: () => toast.error('Could not duplicate slide.'),
    });

    const deleteSlideMutation = useMutation({
        mutationFn: (slideId: string) =>
            apiRequest(`/api/presentations/${presentationId}/slides/${slideId}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            toast.success('Slide removed');
            setSelectedElementId(null);
            void presentation.refetch();
        },
        onError: () => toast.error('Could not delete slide.'),
    });

    const reorderSlides = useMutation({
        mutationFn: (slides: SlideShape[]) =>
            apiRequest(`/api/presentations/${presentationId}/slides/reorder`, {
                method: 'PUT',
                json: {
                    slides: slides.map((slide, index) => ({
                        id: slide.id,
                        position: index + 1,
                    })),
                },
            }),
        onError: () => toast.error('Could not reorder slides.'),
    });

    const queueExport = useMutation({
        mutationFn: (format: 'pdf' | 'pptx' | 'png') =>
            apiRequest(`/api/presentations/${presentationId}/exports`, {
                method: 'POST',
                json: { format },
            }),
        onSuccess: (payload: { message: string }) => toast.success(payload.message),
    });

    const saveSlide = useMutation({
        mutationFn: (slide: SlideShape) =>
            apiRequest<{ slide: SlideShape }>(`/api/presentations/slides/${slide.id}`, {
                method: 'PUT',
                json: {
                    title: slide.title,
                    layout: slide.layout,
                    speaker_notes: slide.speaker_notes,
                    canvas_settings: {
                        ...(slide.canvas_settings || {}),
                        grid: showGrid,
                    },
                    elements: slide.elements.map((element, index) => ({
                        ...element,
                        position: element.position ?? index + 1,
                        rotation: Math.round(Number(element.rotation ?? 0)),
                        z_index: element.z_index ?? index + 1,
                    })),
                },
            }),
        onSuccess: ({ slide }) => {
            const nextSlides = slidesRef.current.map((item) => (item.id === slide.id ? slide : item));
            setLocalSlides(nextSlides);
            setSaveState('saved');
            toast.success('Slide updated');
        },
        onError: () => toast.error('Could not save slide changes.'),
    });

    const saveTheme = useMutation({
        mutationFn: (theme: (typeof themes)[number]) =>
            apiRequest(`/api/presentations/${presentationId}`, {
                method: 'PUT',
                json: {
                    theme_name: theme.name,
                    theme_config: {
                        primary: theme.text,
                        secondary: theme.body,
                        accent: theme.accent,
                        surface: theme.background,
                    },
                },
            }),
        onError: () => toast.error('Could not update theme.'),
    });

    const aiGenerate = useMutation({
        mutationFn: (slideId: string) =>
            apiRequest<{ slide: SlideShape }>(`/api/presentations/${presentationId}/ai-content`, {
                method: 'POST',
                json: {
                    slide_id: slideId,
                    prompt: presentation.data?.presentation.title,
                },
            }),
        onSuccess: ({ slide }) => {
            const nextSlides = slidesRef.current.map((item) => (item.id === slide.id ? slide : item));
            applySlides(nextSlides);
            toast.success('AI content added to slide');
        },
        onError: () => toast.error('AI content generation failed.'),
    });

    const addComment = useMutation({
        mutationFn: () =>
            apiRequest(`/api/presentations/${presentationId}/comments`, {
                method: 'POST',
                json: {
                    body: commentDraft,
                    slide_id: selectedSlide?.id,
                },
            }),
        onSuccess: () => {
            setCommentDraft('');
            toast.success('Comment added for collaborators');
            void presentation.refetch();
        },
        onError: () => toast.error('Could not add comment.'),
    });

    const deck = presentation.data?.presentation;
    const slides = localSlides;

    const visibleSlides = useMemo(() => {
        const query = slideSearch.trim().toLowerCase();
        if (!query) return slides;
        return slides.filter((slide) =>
            `${slide.title || ''} ${slide.layout}`.toLowerCase().includes(query),
        );
    }, [slideSearch, slides]);

    const selectedSlide = useMemo(() => {
        if (!slides.length) return null;
        return slides.find((slide) => slide.id === selectedSlideId) ?? slides[0];
    }, [selectedSlideId, slides]);

    const selectedElement = useMemo(
        () => selectedSlide?.elements.find((element) => element.id === selectedElementId) ?? null,
        [selectedElementId, selectedSlide],
    );

    const canvasBackground = selectedSlide?.canvas_settings?.background || '#0F172A';

    useEffect(() => {
        setSelectedElementId(null);
        setEditingElementId(null);
    }, [selectedSlideId]);

    useEffect(() => {
        if (!initializedRef.current || !selectedSlide || saveState !== 'unsaved') {
            return;
        }

        const timeout = window.setTimeout(() => {
            setSaveState('saving');
            void saveSlide.mutate({
                ...selectedSlide,
                canvas_settings: {
                    ...(selectedSlide.canvas_settings || {}),
                    grid: showGrid,
                },
            });
        }, 1200);

        return () => window.clearTimeout(timeout);
    }, [saveState, selectedSlide, showGrid]);

    const patchSelectedSlide = (updater: (slide: SlideShape) => SlideShape, trackHistory = true) => {
        if (!selectedSlide) return null;
        const nextSlides = slides.map((slide) => (slide.id === selectedSlide.id ? updater(slide) : slide));
        applySlides(nextSlides, trackHistory);
        return nextSlides.find((slide) => slide.id === selectedSlide.id) ?? null;
    };

    const patchSelectedElement = (
        elementId: string,
        updater: (element: ElementShape) => ElementShape,
        trackHistory = true,
    ) => {
        return patchSelectedSlide(
            (slide) => ({
                ...slide,
                elements: slide.elements.map((element) => (element.id === elementId ? updater(element) : element)),
            }),
            trackHistory,
        );
    };

    const reorderElements = (elements: ElementShape[]) =>
        elements.map((element, index) => ({
            ...element,
            position: index + 1,
            z_index: index + 1,
        }));

    const addTextElement = () => {
        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([
                ...slide.elements,
                {
                    id: uid('text'),
                    type: 'text',
                    name: 'Text block',
                    x: 96,
                    y: 428,
                    width: 420,
                    height: 96,
                    content: { text: 'Write a sharper point, investor message, or headline here.' },
                    style: {
                        fontSize: 20,
                        fontWeight: 500,
                        color: activeTheme === 'Canva Air' ? '#111827' : '#F8FAFC',
                        opacity: 100,
                    },
                    animation: { type: 'fade', duration: 0.3 },
                },
            ]),
        }));

        if (nextSlide) {
            setSelectedElementId(nextSlide.elements.at(-1)?.id ?? null);
            toast.success('Text added');
        }
    };

    const addShapeElement = (shape: 'rectangle' | 'circle' | 'triangle' = 'rectangle') => {
        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([
                ...slide.elements,
                {
                    id: uid('shape'),
                    type: 'shape',
                    name: `${shape} shape`,
                    x: shape === 'circle' ? 760 : 640,
                    y: 360,
                    width: shape === 'triangle' ? 180 : 220,
                    height: shape === 'circle' ? 180 : 140,
                    content: { text: shape === 'rectangle' ? 'Key point' : '' },
                    style: {
                        shape,
                        background: activeTheme === 'Canva Air'
                            ? 'rgba(37,99,235,0.16)'
                            : 'linear-gradient(135deg, rgba(37,99,235,0.78), rgba(124,58,237,0.75))',
                        borderColor: activeTheme === 'Canva Air' ? 'rgba(37,99,235,0.35)' : 'rgba(255,255,255,0.22)',
                        color: activeTheme === 'Canva Air' ? '#111827' : '#FFFFFF',
                        opacity: 100,
                    },
                    animation: { type: 'zoom', duration: 0.35 },
                },
            ]),
        }));

        if (nextSlide) {
            setSelectedElementId(nextSlide.elements.at(-1)?.id ?? null);
            toast.success('Shape added');
        }
    };

    const addImageElement = (src: string, alt = 'Uploaded image') => {
        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([
                ...slide.elements,
                {
                    id: uid('image'),
                    type: 'image',
                    name: 'Image',
                    x: 700,
                    y: 120,
                    width: 320,
                    height: 220,
                    content: { src, alt },
                    style: {
                        radius: '24px',
                        opacity: 100,
                    },
                    animation: { type: 'zoom', duration: 0.35 },
                },
            ]),
        }));

        if (nextSlide) {
            setSelectedElementId(nextSlide.elements.at(-1)?.id ?? null);
            toast.success('Image added');
        }
    };

    const addVideoElement = () => {
        const rawUrl = window.prompt('Paste a YouTube, Vimeo, or direct video URL');
        if (!rawUrl) return;

        const normalized = rawUrl.includes('watch?v=')
            ? rawUrl.replace('watch?v=', 'embed/')
            : rawUrl.includes('youtu.be/')
              ? rawUrl.replace('youtu.be/', 'www.youtube.com/embed/')
              : rawUrl;

        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([
                ...slide.elements,
                {
                    id: uid('video'),
                    type: 'video',
                    name: 'Video',
                    x: 640,
                    y: 120,
                    width: 360,
                    height: 220,
                    content: {
                        url: rawUrl,
                        embedUrl: normalized,
                    },
                    style: {
                        opacity: 100,
                    },
                    animation: { type: 'fade', duration: 0.3 },
                },
            ]),
        }));

        if (nextSlide) {
            setSelectedElementId(nextSlide.elements.at(-1)?.id ?? null);
            toast.success('Video embedded');
        }
    };

    const addChartElement = (chartType: 'bar' | 'line' | 'pie' = 'bar') => {
        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([
                ...slide.elements,
                {
                    id: uid('chart'),
                    type: 'chart',
                    name: `${chartType} chart`,
                    x: 640,
                    y: 340,
                    width: 360,
                    height: 220,
                    content: {
                        text: chartType === 'pie' ? 'Audience mix' : 'Quarterly growth',
                        chartType,
                        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                        series: [24, 42, 58, 76],
                    },
                    style: {
                        chartColor: '#60A5FA',
                        chartAccentColor: '#A78BFA',
                        chartAxisColor: 'rgba(255,255,255,0.22)',
                        color: activeTheme === 'Canva Air' ? '#111827' : '#F8FAFC',
                        opacity: 100,
                    },
                    animation: { type: 'slide-up', duration: 0.35 },
                },
            ]),
        }));

        if (nextSlide) {
            setSelectedElementId(nextSlide.elements.at(-1)?.id ?? null);
            toast.success('Chart added');
        }
    };

    const addBlock = (type: 'hero' | 'stats' | 'timeline') => {
        const accentText = activeTheme === 'Canva Air' ? '#111827' : '#F8FAFC';
        const accentBody = activeTheme === 'Canva Air' ? '#334155' : '#D6E3F1';
        const blockElements: ElementShape[] =
            type === 'hero'
                ? [
                      {
                          id: uid('hero-title'),
                          type: 'heading',
                          name: 'Hero heading',
                          x: 90,
                          y: 90,
                          width: 640,
                          height: 90,
                          content: { text: 'A bold opening statement for this slide' },
                          style: { fontSize: 42, fontWeight: 700, color: accentText, opacity: 100 },
                          animation: { type: 'fade-up', duration: 0.35 },
                      },
                      {
                          id: uid('hero-body'),
                          type: 'text',
                          name: 'Hero summary',
                          x: 92,
                          y: 194,
                          width: 560,
                          height: 120,
                          content: { text: 'Summarize the narrative, business angle, or product insight in one clear supporting paragraph.' },
                          style: { fontSize: 18, fontWeight: 500, color: accentBody, opacity: 100 },
                          animation: { type: 'fade', duration: 0.3 },
                      },
                  ]
                : type === 'stats'
                  ? Array.from({ length: 3 }, (_, index) => ({
                        id: uid(`stat-${index}`),
                        type: 'shape',
                        name: `Stat card ${index + 1}`,
                        x: 92 + index * 250,
                        y: 410,
                        width: 220,
                        height: 140,
                        content: { text: `${index === 0 ? '42%' : index === 1 ? '120K' : '18'}\nMetric` },
                        style: {
                            shape: 'rectangle',
                            background: activeTheme === 'Canva Air'
                                ? 'rgba(255,255,255,0.78)'
                                : 'rgba(255,255,255,0.12)',
                            borderColor: 'rgba(255,255,255,0.18)',
                            color: accentText,
                            opacity: 100,
                        },
                        animation: { type: 'slide-up', duration: 0.3 + index * 0.05 },
                    }))
                  : Array.from({ length: 4 }, (_, index) => ({
                        id: uid(`timeline-${index}`),
                        type: 'text',
                        name: `Timeline step ${index + 1}`,
                        x: 100 + index * 250,
                        y: 580,
                        width: 190,
                        height: 70,
                        content: { text: `Phase ${index + 1}\nKey milestone` },
                        style: { fontSize: 16, fontWeight: 600, color: accentText, opacity: 100 },
                        animation: { type: 'fade', duration: 0.25 + index * 0.04 },
                    }));

        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([...slide.elements, ...blockElements]),
        }));

        if (nextSlide) {
            setSelectedElementId(blockElements[0]?.id ?? null);
            toast.success(`${type} block added`);
        }
    };

    const duplicateSelectedElement = () => {
        if (!selectedSlide || !selectedElement) return;

        const duplicate: ElementShape = {
            ...selectedElement,
            id: uid(selectedElement.type),
            name: `${selectedElement.name || selectedElement.type} Copy`,
            x: selectedElement.x + 20,
            y: selectedElement.y + 20,
        };

        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements([...slide.elements, duplicate]),
        }));

        if (nextSlide) {
            setSelectedElementId(duplicate.id);
            toast.success('Element duplicated');
        }
    };

    const deleteSelectedElement = () => {
        if (!selectedSlide || !selectedElement) return;
        patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements(slide.elements.filter((element) => element.id !== selectedElement.id)),
        }));
        setSelectedElementId(null);
        toast.success('Element removed');
    };

    const changeLayerOrder = (elementId: string, direction: 'forward' | 'backward') => {
        if (!selectedSlide) return;
        const currentIndex = selectedSlide.elements.findIndex((element) => element.id === elementId);
        if (currentIndex === -1) return;
        const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        if (targetIndex < 0 || targetIndex >= selectedSlide.elements.length) return;

        const nextElements = [...selectedSlide.elements];
        const [element] = nextElements.splice(currentIndex, 1);
        nextElements.splice(targetIndex, 0, element);

        patchSelectedSlide((slide) => ({
            ...slide,
            elements: reorderElements(nextElements),
        }));
    };

    const toggleElementFlag = (elementId: string, flag: 'locked' | 'hidden') => {
        patchSelectedElement(elementId, (element) => ({
            ...element,
            style: {
                ...element.style,
                [flag]: !(element.style?.[flag] === true),
            },
        }));
    };

    const applyTheme = (theme: (typeof themes)[number]) => {
        setActiveTheme(theme.name);

        const nextSlide = patchSelectedSlide((slide) => ({
            ...slide,
            canvas_settings: {
                ...(slide.canvas_settings || {}),
                background: theme.background,
                grid: showGrid,
            },
            elements: slide.elements.map((element) => ({
                ...element,
                style: {
                    ...element.style,
                    color: element.type === 'heading' ? theme.text : theme.body,
                    ...(element.type === 'shape'
                        ? {
                              background: theme.name === 'Canva Air'
                                  ? 'rgba(37,99,235,0.16)'
                                  : 'linear-gradient(135deg, rgba(37,99,235,0.7), rgba(124,58,237,0.72))',
                              borderColor: theme.name === 'Canva Air' ? 'rgba(37,99,235,0.35)' : 'rgba(255,255,255,0.2)',
                          }
                        : {}),
                },
            })),
        }));

        saveTheme.mutate(theme);
        if (nextSlide) {
            void saveSlide.mutate(nextSlide);
        }
        toast.success(`${theme.name} applied`);
    };

    const saveCurrentSlide = () => {
        if (!selectedSlide) return;
        setSaveState('saving');
        void saveSlide.mutate({
            ...selectedSlide,
            canvas_settings: {
                ...(selectedSlide.canvas_settings || {}),
                grid: showGrid,
            },
        });
    };

    const moveSlide = (slideId: string, direction: 'up' | 'down') => {
        const currentIndex = slides.findIndex((slide) => slide.id === slideId);
        if (currentIndex === -1) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= slides.length) return;

        const nextSlides = [...slides];
        const [slide] = nextSlides.splice(currentIndex, 1);
        nextSlides.splice(targetIndex, 0, slide);
        const normalized = nextSlides.map((item, index) => ({ ...item, position: index + 1 }));
        applySlides(normalized);
        reorderSlides.mutate(normalized);
    };

    const handleInsert = (id: string) => {
        if (id === 'hero' || id === 'stats' || id === 'timeline') {
            addBlock(id);
            return;
        }
        if (id === 'text') {
            addTextElement();
            return;
        }
        if (id === 'image') {
            setImageTargetElementId(null);
            imageInputRef.current?.click();
            return;
        }
        if (id === 'video') {
            addVideoElement();
            return;
        }
        if (id === 'chart') {
            addChartElement('bar');
            return;
        }
        if (id === 'rectangle' || id === 'circle' || id === 'triangle') {
            addShapeElement(id);
        }
    };

    const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                if (imageTargetElementId) {
                    patchSelectedElement(imageTargetElementId, (element) => ({
                        ...element,
                        content: {
                            ...element.content,
                            src: reader.result as string,
                            alt: file.name,
                        },
                    }));
                    toast.success('Image replaced');
                    setImageTargetElementId(null);
                } else {
                    addImageElement(reader.result, file.name);
                }
            }
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    useEffect(() => {
        if (!interaction) return;

        const onMove = (event: MouseEvent) => {
            const deltaX = (event.clientX - interaction.startX) / (zoom / 100);
            const deltaY = (event.clientY - interaction.startY) / (zoom / 100);

            patchSelectedElement(
                interaction.elementId,
                (element) => {
                    if (interaction.type === 'drag') {
                        return {
                            ...element,
                            x: Math.max(0, snapValue(interaction.originX + deltaX, snapEnabled)),
                            y: Math.max(0, snapValue(interaction.originY + deltaY, snapEnabled)),
                        };
                    }

                    return {
                        ...element,
                        width: Math.max(90, snapValue(interaction.originWidth + deltaX, snapEnabled)),
                        height: Math.max(60, snapValue(interaction.originHeight + deltaY, snapEnabled)),
                    };
                },
                false,
            );
        };

        const onUp = () => {
            setInteraction(null);
            pushHistory(slidesRef.current);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [interaction, snapEnabled, zoom]);

    const beginDrag = (event: ReactMouseEvent, element: ElementShape) => {
        if (element.style?.locked === true) return;
        event.preventDefault();
        event.stopPropagation();
        setSelectedElementId(element.id);
        setInteraction({
            type: 'drag',
            elementId: element.id,
            startX: event.clientX,
            startY: event.clientY,
            originX: element.x,
            originY: element.y,
            originWidth: element.width,
            originHeight: element.height,
        });
    };

    const beginResize = (event: ReactMouseEvent, element: ElementShape) => {
        if (element.style?.locked === true) return;
        event.preventDefault();
        event.stopPropagation();
        setSelectedElementId(element.id);
        setInteraction({
            type: 'resize',
            elementId: element.id,
            startX: event.clientX,
            startY: event.clientY,
            originX: element.x,
            originY: element.y,
            originWidth: element.width,
            originHeight: element.height,
        });
    };

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const meta = event.metaKey || event.ctrlKey;

            if (meta && event.key.toLowerCase() === 's') {
                event.preventDefault();
                saveCurrentSlide();
                return;
            }

            if (meta && event.key.toLowerCase() === 'd' && selectedElement) {
                event.preventDefault();
                duplicateSelectedElement();
                return;
            }

            if (meta && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                setHistory((current) => {
                    if (current.index <= 0) return current;
                    const nextIndex = current.index - 1;
                    setLocalSlides(cloneSlides(current.snapshots[nextIndex]));
                    return { ...current, index: nextIndex };
                });
                return;
            }

            if (meta && ((event.shiftKey && event.key.toLowerCase() === 'z') || event.key.toLowerCase() === 'y')) {
                event.preventDefault();
                setHistory((current) => {
                    if (current.index >= current.snapshots.length - 1) return current;
                    const nextIndex = current.index + 1;
                    setLocalSlides(cloneSlides(current.snapshots[nextIndex]));
                    return { ...current, index: nextIndex };
                });
                return;
            }

            if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElement) {
                const activeTag = (document.activeElement as HTMLElement | null)?.tagName.toLowerCase();
                if (activeTag === 'input' || activeTag === 'textarea') return;
                event.preventDefault();
                deleteSelectedElement();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedElement, selectedSlide]);

    return (
        <div className="min-h-full overflow-y-auto bg-[#07101b] px-4 py-4 text-white sm:px-5">
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
            />
            <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() => navigate('/slides')}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <div className="text-lg font-semibold text-white">{deck?.title || 'Professional slide editor'}</div>
                            <div className="text-sm text-slate-400">
                                {deck?.category || 'Business'} workspace • {slides.length} slides • {deck?.collaborators.length ?? 0} collaborators
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() =>
                                setHistory((current) => {
                                    if (current.index <= 0) return current;
                                    const nextIndex = current.index - 1;
                                    setLocalSlides(cloneSlides(current.snapshots[nextIndex]));
                                    return { ...current, index: nextIndex };
                                })
                            }
                        >
                            <Undo2 className="mr-2 h-4 w-4" />
                            Undo
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() =>
                                setHistory((current) => {
                                    if (current.index >= current.snapshots.length - 1) return current;
                                    const nextIndex = current.index + 1;
                                    setLocalSlides(cloneSlides(current.snapshots[nextIndex]));
                                    return { ...current, index: nextIndex };
                                })
                            }
                        >
                            <Redo2 className="mr-2 h-4 w-4" />
                            Redo
                        </Button>
                        <Button variant="ghost" className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white" onClick={saveCurrentSlide}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() => queueExport.mutate('pdf')}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() => queueExport.mutate('png')}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Export PNG
                        </Button>
                        <Button
                            variant="ghost"
                            className="rounded-full text-slate-300 hover:bg-white/8 hover:text-white"
                            onClick={() => navigate(`/slides/${presentationId}/present`)}
                        >
                            <MonitorPlay className="mr-2 h-4 w-4" />
                            Present
                        </Button>
                        <Button className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                        <span className={`rounded-full border px-3 py-1 text-xs ${
                            saveState === 'saved'
                                ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'
                                : saveState === 'saving'
                                  ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                                  : 'border-white/10 bg-white/5 text-slate-300'
                        }`}>
                            {saveState === 'saved' ? 'All changes saved' : saveState === 'saving' ? 'Auto-saving...' : 'Unsaved changes'}
                        </span>
                    </div>
                </div>

                <div className={`grid min-h-[calc(100vh-170px)] gap-4 ${rightPanelOpen ? 'xl:grid-cols-[290px_minmax(0,1fr)_360px]' : 'xl:grid-cols-[290px_minmax(0,1fr)]'}`}>
                    <aside className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                        <div className="mb-4 flex gap-2">
                            {[
                                ['slides', 'Slides'],
                                ['insert', 'Insert'],
                                ['brand', 'Brand'],
                            ].map(([tabKey, label]) => (
                                <button
                                    key={tabKey}
                                    type="button"
                                    onClick={() => setLeftPanelTab(tabKey as 'slides' | 'insert' | 'brand')}
                                    className={`rounded-full px-4 py-2 text-sm transition ${
                                        leftPanelTab === tabKey
                                            ? 'bg-cyan-400 text-slate-950'
                                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {leftPanelTab === 'slides' ? (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-white">Slides workflow</div>
                                        <div className="text-xs text-slate-400">Pick a slide, then design with insert and properties.</div>
                                    </div>
                                    <Button size="icon" className="h-9 w-9 rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={() => addSlide.mutate()}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="relative mb-4">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                    <Input
                                        value={slideSearch}
                                        onChange={(event) => setSlideSearch(event.target.value)}
                                        placeholder="Search slides"
                                        className="rounded-2xl border-white/10 bg-black/20 pl-10 text-white placeholder:text-slate-500"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {visibleSlides.map((slide) => (
                                        <div
                                            key={slide.id}
                                            className={`rounded-[22px] border p-3 transition ${
                                                selectedSlide?.id === slide.id
                                                    ? 'border-cyan-300/50 bg-cyan-400/10'
                                                    : 'border-white/10 bg-black/10 hover:bg-white/5'
                                            }`}
                                        >
                                            <button type="button" onClick={() => setSelectedSlideId(slide.id)} className="w-full text-left">
                                                <div className="mb-3 aspect-video rounded-2xl border border-white/10" style={{ background: slide.canvas_settings?.background || 'linear-gradient(135deg,#0f172a,#1e293b)' }} />
                                                <div className="text-sm font-medium text-white">{slide.title || `Slide ${slide.position}`}</div>
                                                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{slide.layout}</div>
                                            </button>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => moveSlide(slide.id, 'up')}>
                                                    <ArrowUp className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => moveSlide(slide.id, 'down')}>
                                                    <ArrowDown className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => duplicateSlideMutation.mutate(slide.id)}>
                                                    <Copy className="mr-2 h-3.5 w-3.5" />
                                                    Duplicate
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => deleteSlideMutation.mutate(slide.id)}>
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}

                        {leftPanelTab === 'insert' ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="text-sm font-semibold text-white">Simple workflow</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-400">
                                        1. Pick a block.
                                        <br />
                                        2. Drop it onto the slide.
                                        <br />
                                        3. Click any item to edit it on the right.
                                    </div>
                                </div>
                                {insertGroups.map((group) => (
                                    <div key={group.title} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                        <div className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">{group.title}</div>
                                        <div className="space-y-2">
                                            {group.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleInsert(item.id)}
                                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:bg-white/10"
                                                >
                                                    <div className="text-sm font-medium text-white">{item.label}</div>
                                                    <div className="mt-1 text-xs text-slate-400">{item.hint}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <Button className="w-full rounded-full bg-[linear-gradient(135deg,#2563EB,#7C3AED)] text-white hover:opacity-95" onClick={() => selectedSlide && aiGenerate.mutate(selectedSlide.id)}>
                                    <Bot className="mr-2 h-4 w-4" />
                                    Generate with AI
                                </Button>
                            </div>
                        ) : null}

                        {leftPanelTab === 'brand' ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="text-sm font-semibold text-white">Brand and style</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-400">
                                        Keep the workflow simple by picking one visual direction for the whole deck, then adjusting only what matters.
                                    </div>
                                </div>
                                {themes.map((theme) => (
                                    <button
                                        key={theme.name}
                                        type="button"
                                        onClick={() => applyTheme(theme)}
                                        className={`w-full rounded-2xl border p-3 text-left transition ${
                                            activeTheme === theme.name
                                                ? 'border-cyan-300/40 bg-cyan-400/10'
                                                : 'border-white/10 bg-black/10 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="mb-2 h-12 rounded-xl border border-white/10" style={{ background: theme.background }} />
                                        <div className="text-sm text-white">{theme.name}</div>
                                        <div className="mt-1 text-xs text-slate-400">{theme.text} • {theme.body}</div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </aside>

                    <main className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-2">
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={addTextElement}>
                                    <TextCursorInput className="mr-2 h-4 w-4" />
                                    Text
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => imageInputRef.current?.click()}>
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    Image
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={addVideoElement}>
                                    <Video className="mr-2 h-4 w-4" />
                                    Video
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addChartElement('bar')}>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Chart
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addShapeElement('rectangle')}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Rectangle
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addShapeElement('circle')}>
                                    <Circle className="mr-2 h-4 w-4" />
                                    Circle
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addBlock('hero')}>
                                    <LayoutTemplate className="mr-2 h-4 w-4" />
                                    Hero block
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addBlock('stats')}>
                                    <Layers3 className="mr-2 h-4 w-4" />
                                    Stats block
                                </Button>
                                <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" onClick={() => addBlock('timeline')}>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Timeline
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="ghost"
                                    className={`rounded-full border ${showGrid ? 'border-cyan-300/40 bg-cyan-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'} hover:bg-white/10`}
                                    onClick={() => {
                                        setShowGrid((current) => !current);
                                        patchSelectedSlide((slide) => ({
                                            ...slide,
                                            canvas_settings: {
                                                ...(slide.canvas_settings || {}),
                                                grid: !showGrid,
                                            },
                                        }));
                                    }}
                                >
                                    <Grid3X3 className="mr-2 h-4 w-4" />
                                    Grid
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={`rounded-full border ${snapEnabled ? 'border-cyan-300/40 bg-cyan-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'} hover:bg-white/10`}
                                    onClick={() => setSnapEnabled((current) => !current)}
                                >
                                    Snap
                                </Button>
                                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setZoom((current) => Math.max(50, current - 10))}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="min-w-14 text-center text-sm text-white">{zoom}%</span>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setZoom((current) => Math.min(150, current + 10))}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button className="rounded-full bg-[linear-gradient(135deg,#2563EB,#7C3AED)] text-white hover:opacity-95" onClick={() => selectedSlide && aiGenerate.mutate(selectedSlide.id)}>
                                    <Bot className="mr-2 h-4 w-4" />
                                    AI generate
                                </Button>
                            </div>
                        </div>

                        {!selectedElement ? (
                            <div className="mb-4 grid gap-3 rounded-[24px] border border-white/8 bg-black/20 p-4 md:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 1</div>
                                    <div className="mt-1 text-sm font-medium text-white">Choose the slide</div>
                                    <div className="mt-1 text-xs text-slate-400">Use the left panel to move around the deck.</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 2</div>
                                    <div className="mt-1 text-sm font-medium text-white">Insert a block</div>
                                    <div className="mt-1 text-xs text-slate-400">Hero, stats, timeline, text, or shapes.</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 3</div>
                                    <div className="mt-1 text-sm font-medium text-white">Fine-tune the details</div>
                                    <div className="mt-1 text-xs text-slate-400">Click anything on the canvas to edit it.</div>
                                </div>
                            </div>
                        ) : null}

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-black/20 px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{selectedSlide?.title || 'Untitled slide'}</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{selectedSlide?.layout || 'content-grid'}</span>
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{selectedSlide?.elements.length || 0} layers</span>
                            </div>
                            <Button variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setRightPanelOpen((current) => !current)}>
                                {rightPanelOpen ? <PanelRightClose className="mr-2 h-4 w-4" /> : <PanelRightOpen className="mr-2 h-4 w-4" />}
                                {rightPanelOpen ? 'Hide panel' : 'Show panel'}
                            </Button>
                        </div>

                        <div className="flex min-h-[760px] items-center justify-center rounded-[32px] border border-white/10 bg-[#0b1220] p-4">
                            <div
                                className="relative overflow-auto rounded-[30px] border border-white/8 bg-[#09111f] p-8"
                                style={{ width: '100%' }}
                            >
                                <div
                                    className="mx-auto origin-top"
                                    style={{
                                        width: CANVAS_WIDTH,
                                        height: CANVAS_HEIGHT,
                                        transform: `scale(${zoom / 100})`,
                                        transformOrigin: 'top center',
                                    }}
                                >
                                    <div
                                        className="relative h-full w-full overflow-hidden rounded-[30px] border border-white/10 bg-white shadow-[0_40px_90px_rgba(0,0,0,0.32)]"
                                        onMouseDown={() => setSelectedElementId(null)}
                                    >
                                        <div className="absolute inset-0" style={{ background: canvasBackground }} />
                                        {showGrid ? (
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
                                        ) : null}

                                        {selectedSlide?.elements
                                            .slice()
                                            .sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0))
                                            .map((element) => {
                                                if (element.style?.hidden === true) return null;
                                                const opacity = Number(element.style?.opacity ?? 100) / 100;
                                                const isInlineTextEditable = !['shape', 'image', 'video', 'chart'].includes(element.type);
                                                return (
                                                    <div
                                                        key={element.id}
                                                        className={`absolute overflow-visible ${interaction?.type === 'drag' && interaction.elementId === element.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                                                        style={{
                                                            left: element.x,
                                                            top: element.y,
                                                            width: element.width,
                                                            minHeight: element.height,
                                                            zIndex: element.z_index ?? 1,
                                                            transform: `rotate(${Number(element.rotation ?? 0)}deg)`,
                                                        }}
                                                        onMouseDown={(event) => beginDrag(event, element)}
                                                    >
                                                        <div className={`relative h-full w-full rounded-2xl ${selectedElementId === element.id ? 'ring-2 ring-cyan-300/90 ring-offset-2 ring-offset-transparent' : ''}`} style={{ opacity }}>
                                                            {editingElementId === element.id && isInlineTextEditable ? (
                                                                <textarea
                                                                    autoFocus
                                                                    value={element.content?.text ?? ''}
                                                                    onChange={(event) =>
                                                                        patchSelectedElement(element.id, (current) => ({
                                                                            ...current,
                                                                            content: {
                                                                                ...current.content,
                                                                                text: event.target.value,
                                                                            },
                                                                        }), false)
                                                                    }
                                                                    onBlur={() => {
                                                                        setEditingElementId(null);
                                                                        pushHistory(slidesRef.current);
                                                                    }}
                                                                    className="h-full w-full resize-none rounded-2xl border border-cyan-300/40 bg-white/15 p-4 text-sm text-white outline-none backdrop-blur-sm"
                                                                    style={{
                                                                        color: String(element.style?.color || '#111827'),
                                                                        fontSize: Number(element.style?.fontSize || 18),
                                                                        fontWeight: Number(element.style?.fontWeight || 500),
                                                                        minHeight: element.height,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="h-full"
                                                                    onDoubleClick={(event) => {
                                                                        event.stopPropagation();
                                                                        if (isInlineTextEditable) {
                                                                            setEditingElementId(element.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    {renderSlideElementInner(element, 'editor')}
                                                                </div>
                                                            )}

                                                            {selectedElementId === element.id ? (
                                                                <>
                                                                    <div className="absolute -top-12 left-0 flex items-center gap-1 rounded-full border border-white/10 bg-[#050816]/90 p-1 shadow-lg backdrop-blur-xl">
                                                                        <button type="button" className="rounded-full px-2.5 py-1 text-xs text-white transition hover:bg-white/10" onClick={(event) => { event.stopPropagation(); duplicateSelectedElement(); }}>
                                                                            Duplicate
                                                                        </button>
                                                                        <button type="button" className="rounded-full px-2.5 py-1 text-xs text-white transition hover:bg-white/10" onClick={(event) => { event.stopPropagation(); changeLayerOrder(element.id, 'forward'); }}>
                                                                            Front
                                                                        </button>
                                                                        <button type="button" className="rounded-full px-2.5 py-1 text-xs text-white transition hover:bg-white/10" onClick={(event) => { event.stopPropagation(); changeLayerOrder(element.id, 'backward'); }}>
                                                                            Back
                                                                        </button>
                                                                        <button type="button" className="rounded-full px-2.5 py-1 text-xs text-rose-200 transition hover:bg-rose-500/15" onClick={(event) => { event.stopPropagation(); deleteSelectedElement(); }}>
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                    <div className="pointer-events-none absolute -top-8 left-0 rounded-full bg-cyan-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-950">
                                                                        {element.type}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        aria-label="Resize element"
                                                                        className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full border border-white/70 bg-white shadow-lg"
                                                                        onMouseDown={(event) => beginResize(event, element)}
                                                                    />
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-white">Animation timeline</div>
                                    <div className="text-xs text-slate-400">Sequence content the way modern presentation tools do.</div>
                                </div>
                                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                    {selectedSlide?.elements.length || 0} cues
                                </div>
                            </div>
                            <div className="space-y-2">
                                {selectedSlide?.elements
                                    .slice()
                                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                                    .map((element, index) => (
                                        <div key={`${element.id}-timeline`} className="grid grid-cols-[160px_minmax(0,1fr)_92px] items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-3 py-3">
                                            <div className="truncate text-sm font-medium text-white">{element.name || element.type}</div>
                                            <div className="relative h-3 rounded-full bg-white/10">
                                                <div
                                                    className="absolute inset-y-0 rounded-full bg-[linear-gradient(90deg,#2563EB,#7C3AED)]"
                                                    style={{
                                                        left: `${Math.min(index * 8, 72)}%`,
                                                        width: `${Math.max(14, Number(element.animation?.duration ?? 0.3) * 18)}%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="text-right text-xs text-slate-300">
                                                {String(element.animation?.type ?? 'fade')} • {Number(element.animation?.duration ?? 0.3).toFixed(1)}s
                                            </div>
                                        </div>
                                    ))}
                                {!selectedSlide?.elements.length ? (
                                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                                        Add text, images, charts, or video to build the first timeline.
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </main>

                    {rightPanelOpen ? (
                        <aside className="space-y-4">
                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                                <div className="mb-4 flex gap-2">
                                    {[
                                        ['properties', 'Properties'],
                                        ['layers', 'Layers'],
                                        ['assistant', 'AI'],
                                    ].map(([tabKey, label]) => (
                                        <button
                                            key={tabKey}
                                            type="button"
                                            onClick={() => setRightPanelTab(tabKey as 'properties' | 'layers' | 'assistant')}
                                            className={`rounded-full px-4 py-2 text-sm transition ${
                                                rightPanelTab === tabKey
                                                    ? 'bg-cyan-400 text-slate-950'
                                                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {rightPanelTab === 'properties' ? (
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Theme</div>
                                            <div className="grid gap-2">
                                                {themes.map((theme) => (
                                                    <button
                                                        key={theme.name}
                                                        type="button"
                                                        onClick={() => applyTheme(theme)}
                                                        className={`rounded-2xl border p-3 text-left transition ${
                                                            activeTheme === theme.name
                                                                ? 'border-cyan-300/40 bg-cyan-400/10'
                                                                : 'border-white/10 bg-black/10 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <div className="mb-2 h-10 rounded-xl border border-white/10" style={{ background: theme.background }} />
                                                        <div className="text-sm text-white">{theme.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedElement ? (
                                            <>
                                                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Selected element</div>
                                                    <Input
                                                        value={selectedElement.name ?? ''}
                                                        onChange={(event) =>
                                                            patchSelectedElement(selectedElement.id, (element) => ({
                                                                ...element,
                                                                name: event.target.value,
                                                            }))
                                                        }
                                                        className="mb-3 rounded-2xl border-white/10 bg-white/5 text-white"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            ['X', 'x'],
                                                            ['Y', 'y'],
                                                            ['W', 'width'],
                                                            ['H', 'height'],
                                                        ].map(([label, key]) => (
                                                            <label key={key} className="text-xs text-slate-400">
                                                                {label}
                                                                <Input
                                                                    type="number"
                                                                    value={Number(selectedElement[key as keyof ElementShape] ?? 0)}
                                                                    onChange={(event) =>
                                                                        patchSelectedElement(selectedElement.id, (element) => ({
                                                                            ...element,
                                                                            [key]: Number(event.target.value || 0),
                                                                        }))
                                                                    }
                                                                    className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                                />
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Appearance</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <label className="text-xs text-slate-400">
                                                            Font size
                                                            <Input
                                                                type="number"
                                                                value={Number(selectedElement.style?.fontSize ?? 18)}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        style: {
                                                                            ...element.style,
                                                                            fontSize: Number(event.target.value || 18),
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                        <label className="text-xs text-slate-400">
                                                            Weight
                                                            <Input
                                                                type="number"
                                                                value={Number(selectedElement.style?.fontWeight ?? 500)}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        style: {
                                                                            ...element.style,
                                                                            fontWeight: Number(event.target.value || 500),
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                        <label className="text-xs text-slate-400">
                                                            Rotation
                                                            <Input
                                                                type="number"
                                                                value={Number(selectedElement.rotation ?? 0)}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        rotation: Number(event.target.value || 0),
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                        <label className="text-xs text-slate-400">
                                                            Opacity
                                                            <Input
                                                                type="number"
                                                                value={Number(selectedElement.style?.opacity ?? 100)}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        style: {
                                                                            ...element.style,
                                                                            opacity: Number(event.target.value || 100),
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        <label className="text-xs text-slate-400">
                                                            Text color
                                                            <input
                                                                type="color"
                                                                value={String(selectedElement.style?.color || '#ffffff')}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        style: {
                                                                            ...element.style,
                                                                            color: event.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 h-10 w-full rounded-2xl border border-white/10 bg-white/5 p-1"
                                                            />
                                                        </label>
                                                        <label className="text-xs text-slate-400">
                                                            Fill
                                                            <input
                                                                type="color"
                                                                value={String(selectedElement.style?.background || '#2563eb').startsWith('#') ? selectedElement.style?.background : '#2563eb'}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        style: {
                                                                            ...element.style,
                                                                            background: event.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 h-10 w-full rounded-2xl border border-white/10 bg-white/5 p-1"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Content & animation</div>
                                                    {!['image', 'video', 'chart'].includes(selectedElement.type) ? (
                                                        <Textarea
                                                            value={selectedElement.content?.text ?? ''}
                                                            onChange={(event) =>
                                                                patchSelectedElement(selectedElement.id, (element) => ({
                                                                    ...element,
                                                                    content: {
                                                                        ...element.content,
                                                                        text: event.target.value,
                                                                    },
                                                                }))
                                                            }
                                                            rows={5}
                                                            className="w-full rounded-2xl border-white/10 bg-white/5 text-sm text-white"
                                                        />
                                                    ) : null}

                                                    {selectedElement.type === 'image' ? (
                                                        <div className="space-y-2">
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                                                onClick={() => {
                                                                    setImageTargetElementId(selectedElement.id);
                                                                    imageInputRef.current?.click();
                                                                }}
                                                            >
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                Replace image
                                                            </Button>
                                                            <Input
                                                                value={selectedElement.content?.alt ?? ''}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        content: {
                                                                            ...element.content,
                                                                            alt: event.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                placeholder="Alt text"
                                                                className="rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </div>
                                                    ) : null}

                                                    {selectedElement.type === 'video' ? (
                                                        <div className="space-y-2">
                                                            <Input
                                                                value={selectedElement.content?.embedUrl || selectedElement.content?.url || ''}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        content: {
                                                                            ...element.content,
                                                                            url: event.target.value,
                                                                            embedUrl: event.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                placeholder="Embed or video URL"
                                                                className="rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                            <div className="text-xs text-slate-400">
                                                                Works with YouTube, Vimeo, or direct mp4 links.
                                                            </div>
                                                        </div>
                                                    ) : null}

                                                    {selectedElement.type === 'chart' ? (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <label className="text-xs text-slate-400">
                                                                    Chart type
                                                                    <Input
                                                                        value={String(selectedElement.content?.chartType || 'bar')}
                                                                        onChange={(event) =>
                                                                            patchSelectedElement(selectedElement.id, (element) => ({
                                                                                ...element,
                                                                                content: {
                                                                                    ...element.content,
                                                                                    chartType: event.target.value as 'bar' | 'line' | 'pie',
                                                                                },
                                                                            }))
                                                                        }
                                                                        className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                                    />
                                                                </label>
                                                                <label className="text-xs text-slate-400">
                                                                    Title
                                                                    <Input
                                                                        value={selectedElement.content?.text ?? ''}
                                                                        onChange={(event) =>
                                                                            patchSelectedElement(selectedElement.id, (element) => ({
                                                                                ...element,
                                                                                content: {
                                                                                    ...element.content,
                                                                                    text: event.target.value,
                                                                                },
                                                                            }))
                                                                        }
                                                                        className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                                    />
                                                                </label>
                                                            </div>
                                                            <label className="block text-xs text-slate-400">
                                                                Labels
                                                                <Input
                                                                    value={(selectedElement.content?.labels || []).join(', ')}
                                                                    onChange={(event) =>
                                                                        patchSelectedElement(selectedElement.id, (element) => ({
                                                                            ...element,
                                                                            content: {
                                                                                ...element.content,
                                                                                labels: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                                                                            },
                                                                        }))
                                                                    }
                                                                    className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                                />
                                                            </label>
                                                            <label className="block text-xs text-slate-400">
                                                                Values
                                                                <Input
                                                                    value={(selectedElement.content?.series || []).join(', ')}
                                                                    onChange={(event) =>
                                                                        patchSelectedElement(selectedElement.id, (element) => ({
                                                                            ...element,
                                                                            content: {
                                                                                ...element.content,
                                                                                series: event.target.value.split(',').map((item) => Number(item.trim()) || 0),
                                                                            },
                                                                        }))
                                                                    }
                                                                    className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                                />
                                                            </label>
                                                        </div>
                                                    ) : null}
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        <label className="text-xs text-slate-400">
                                                            Animation
                                                            <Input
                                                                value={String(selectedElement.animation?.type ?? 'fade')}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        animation: {
                                                                            ...element.animation,
                                                                            type: event.target.value,
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                        <label className="text-xs text-slate-400">
                                                            Duration
                                                            <Input
                                                                type="number"
                                                                value={Number(selectedElement.animation?.duration ?? 0.3)}
                                                                onChange={(event) =>
                                                                    patchSelectedElement(selectedElement.id, (element) => ({
                                                                        ...element,
                                                                        animation: {
                                                                            ...element.animation,
                                                                            duration: Number(event.target.value || 0.3),
                                                                        },
                                                                    }))
                                                                }
                                                                className="mt-1 rounded-2xl border-white/10 bg-white/5 text-white"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button className="flex-1 rounded-full bg-white text-slate-950 hover:bg-slate-100" onClick={duplicateSelectedElement}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Duplicate
                                                    </Button>
                                                    <Button variant="ghost" className="flex-1 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={deleteSelectedElement}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-slate-400">
                                                Select an element on the canvas to edit its typography, size, colors, animation, and positioning.
                                            </div>
                                        )}

                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Speaker notes</div>
                                            <textarea
                                                value={selectedSlide?.speaker_notes ?? ''}
                                                onChange={(event) =>
                                                    patchSelectedSlide((slide) => ({
                                                        ...slide,
                                                        speaker_notes: event.target.value,
                                                    }))
                                                }
                                                rows={4}
                                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                {rightPanelTab === 'layers' ? (
                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-slate-300">
                                            Layer manager with ordering, lock, and visibility controls for the active slide.
                                        </div>
                                        {selectedSlide?.elements
                                            .slice()
                                            .sort((a, b) => (b.z_index ?? 0) - (a.z_index ?? 0))
                                            .map((element) => (
                                                <div
                                                    key={element.id}
                                                    className={`rounded-2xl border p-3 transition ${
                                                        selectedElementId === element.id
                                                            ? 'border-cyan-300/40 bg-cyan-400/10'
                                                            : 'border-white/10 bg-black/10'
                                                    }`}
                                                >
                                                    <button type="button" className="w-full text-left" onClick={() => setSelectedElementId(element.id)}>
                                                        <div className="text-sm font-medium text-white">{element.name || element.type}</div>
                                                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                                            {element.type} • z{element.z_index ?? 1}
                                                        </div>
                                                    </button>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => changeLayerOrder(element.id, 'forward')}>
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => changeLayerOrder(element.id, 'backward')}>
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => toggleElementFlag(element.id, 'locked')}>
                                                            {element.style?.locked === true ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-8 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => toggleElementFlag(element.id, 'hidden')}>
                                                            {element.style?.hidden === true ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : null}

                                {rightPanelTab === 'assistant' ? (
                                    <div className="space-y-4">
                                        <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),rgba(124,58,237,0.14))] p-4 backdrop-blur-xl">
                                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                                                <Bot className="h-4 w-4 text-cyan-200" />
                                                Slide-aware AI assistant
                                            </div>
                                            <div className="space-y-3 text-sm text-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => selectedSlide && aiGenerate.mutate(selectedSlide.id)}
                                                    className="block w-full rounded-2xl bg-black/10 p-3 text-left transition hover:bg-black/20"
                                                >
                                                    Generate a premium investor slide with cleaner hierarchy and sharper copy.
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => selectedSlide && aiGenerate.mutate(selectedSlide.id)}
                                                    className="block w-full rounded-2xl bg-black/10 p-3 text-left transition hover:bg-black/20"
                                                >
                                                    Rewrite this slide for a church presentation with a warmer tone and simpler language.
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => selectedSlide && aiGenerate.mutate(selectedSlide.id)}
                                                    className="block w-full rounded-2xl bg-black/10 p-3 text-left transition hover:bg-black/20"
                                                >
                                                    Create a statistics-focused slide with three KPI cards and a timeline.
                                                </button>
                                                <div className="rounded-2xl border border-white/10 bg-black/10 p-3 text-slate-300">
                                                    {presentation.data?.insights.suggested_next_action || 'Generate speaker notes for the active slide.'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                                            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">Design health</div>
                                            <div className="text-sm text-white">{presentation.data?.insights.design_health || 'Strong'}</div>
                                            <div className="mt-2 text-sm text-slate-400">
                                                Completion score: {presentation.data?.insights.completion_score ?? 0}%
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
                                <div className="mb-3 text-sm font-semibold text-white">Comments & team</div>
                                <div className="mb-4 rounded-2xl border border-white/10 bg-black/10 p-3">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                                        <Users2 className="h-4 w-4 text-cyan-300" />
                                        Active collaborators
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(deck?.collaborators ?? []).map((collaborator) => (
                                            <div key={collaborator.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                                                {collaborator.user?.name || 'Teammate'} • {collaborator.role}
                                            </div>
                                        ))}
                                        {!(deck?.collaborators?.length) ? (
                                            <div className="rounded-full border border-dashed border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                                                Invite collaborators when sharing is enabled
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-300">
                                    {(deck?.comments ?? []).slice(0, 3).map((comment) => (
                                        <div key={comment.id} className="rounded-2xl border border-white/8 bg-black/10 p-3">
                                            <div className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                                {comment.user?.name || 'Teammate'}
                                            </div>
                                            <div>{comment.body}</div>
                                        </div>
                                    ))}
                                    {!(deck?.comments?.length) ? (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-3 text-slate-400">
                                            Comments will appear here once collaborators review the deck.
                                        </div>
                                    ) : null}
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Textarea
                                        value={commentDraft}
                                        onChange={(event) => setCommentDraft(event.target.value)}
                                        placeholder="Leave a comment for your team on this slide"
                                        rows={3}
                                        className="rounded-2xl border-white/10 bg-black/10 text-white"
                                    />
                                    <Button
                                        className="w-full rounded-full bg-white text-slate-950 hover:bg-slate-100"
                                        onClick={() => addComment.mutate()}
                                        disabled={!commentDraft.trim() || addComment.isPending}
                                    >
                                        Add comment
                                    </Button>
                                </div>
                            </div>
                        </aside>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
