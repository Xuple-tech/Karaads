import { FileText, Sparkles, WandSparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ApiError, apiRequest } from '@/spa/lib/api';

type DocumentStyle = 'professional' | 'executive' | 'modern' | 'formal';
type DocumentFormat = 'word' | 'pdf';
type GeneratedDocumentResponse = {
    success: boolean;
    document: {
        id: string;
        title: string;
        content: string;
        format: DocumentFormat;
        style: DocumentStyle;
        document_type: string;
        file?: {
            url?: string | null;
            filename?: string | null;
            mime_type?: string | null;
            format?: string | null;
            document_type?: string | null;
            generated_at?: string | null;
        } | null;
        created_at?: string;
    };
};

const documentTypes = [
    'Business proposal',
    'Project report',
    'Company profile',
    'Meeting minutes',
    'Marketing plan',
    'Contract draft',
] as const;

export function Component() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [format, setFormat] = useState<DocumentFormat>('word');
    const [style, setStyle] = useState<DocumentStyle>('professional');
    const [documentType, setDocumentType] = useState<(typeof documentTypes)[number]>('Business proposal');

    const preparedPrompt = useMemo(() => {
        const trimmed = prompt.trim();
        if (!trimmed) {
            return '';
        }

        const formatInstruction = format === 'pdf'
            ? 'Create this as a PDF document.'
            : 'Create this as a Microsoft Word (.docx) document.';

        return `${formatInstruction} Use a ${style} document style. ${trimmed}`;
    }, [format, prompt, style]);

    const createDocument = useMutation({
        mutationFn: () =>
            apiRequest<GeneratedDocumentResponse>('/api/documents/generate', {
                method: 'POST',
                json: {
                    prompt,
                    format,
                    style,
                    document_type: documentType,
                },
            }),
        onSuccess: (payload) => {
            window.sessionStorage.setItem(`kwati-doc-editor:${payload.document.id}`, JSON.stringify(payload.document));
            toast.success('Your document is ready.');
            navigate(`/docs/editor/${payload.document.id}`);
        },
        onError: (error) => {
            toast.error(error instanceof ApiError ? error.message : 'Could not create the document right now.');
        },
    });

    return (
        <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_24%),radial-gradient(circle_at_right,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(180deg,#030712_0%,#08111d_48%,#0b1220_100%)] px-4 py-6 text-white sm:px-6">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                    <div className="mx-auto max-w-4xl space-y-6 text-center">
                        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                            <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 rounded-sm object-contain" draggable={false} />
                            Kwati Docs
                        </div>

                        <p className="text-sm leading-7 text-slate-300 sm:text-base">
                            Describe the document you want and Kwati AI will create the first draft for you, then open it straight in the document editor.
                        </p>

                        <div className="rounded-[30px] border border-white/10 bg-black/25 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                            <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4">
                                <textarea
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    placeholder="Create a business proposal for a retail inventory system, include pricing, implementation timeline, and expected ROI..."
                                    rows={5}
                                    className="w-full resize-none bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                                />

                                <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Document type</span>
                                        {documentTypes.map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => {
                                                    setDocumentType(item);
                                                    setPrompt(item);
                                                }}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Format</span>
                                        {(['word', 'pdf'] as const).map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setFormat(item)}
                                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                                    format === item
                                                        ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                                                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {item === 'word' ? 'Word' : 'PDF'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Style</span>
                                        {([
                                            { value: 'professional', label: 'Professional' },
                                            { value: 'executive', label: 'Executive' },
                                            { value: 'modern', label: 'Modern' },
                                            { value: 'formal', label: 'Formal' },
                                        ] as const).map((item) => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setStyle(item.value)}
                                                className={`rounded-full border px-3 py-2 text-xs transition ${
                                                    style === item.value
                                                        ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                                                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                                            {preparedPrompt || 'Your document request preview will appear here.'}
                                        </div>

                                        <Button
                                            className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100"
                                            onClick={() => createDocument.mutate()}
                                            disabled={!preparedPrompt || createDocument.isPending}
                                        >
                                            <WandSparkles className="mr-2 h-4 w-4" />
                                            {createDocument.isPending ? 'Creating...' : 'Create document'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                            <FileText className="h-4 w-4 text-emerald-300" />
                            Smart drafting
                        </div>
                        <p className="text-sm leading-7 text-slate-300">
                            Start with a simple prompt and let the main AI generate the first full draft for proposals, reports, letters, and profiles.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                            Format aware
                        </div>
                        <p className="text-sm leading-7 text-slate-300">
                            Choose Word when you want editable output or PDF when you want a ready-to-share final document.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                            <img src="/icon.png" alt="Kwati AI" className="h-4 w-4 rounded-sm object-contain" draggable={false} />
                            Kwati workflow
                        </div>
                        <p className="text-sm leading-7 text-slate-300">
                            This page sends users straight into the main AI document creation flow, so the same document tools and output pipeline are used.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
