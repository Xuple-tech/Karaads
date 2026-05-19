import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { AlignCenter, AlignLeft, AlignRight, ArrowLeft, Bold, ChevronLeft, ChevronRight, Download, FileText, Highlighter, Italic, Moon, Palette, RefreshCw, Sparkles, Sun, Type, Underline } from 'lucide-react';
import TurndownService from 'turndown';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiRequest } from '@/spa/lib/api';

type DocumentFormatting = {
    font_family: string;
    font_size: number;
    text_color: string;
    paper_size: 'a4' | 'letter' | 'legal';
    paper_theme: 'light' | 'dark';
};

type StoredDocument = {
    id: string;
    title: string;
    content: string;
    content_html?: string;
    format: 'word' | 'pdf';
    style: string;
    document_type: string;
    formatting?: DocumentFormatting;
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

type ExportResponse = {
    success: boolean;
    file: StoredDocument['file'];
};

const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
];

const fontSizes = [12, 14, 16, 18, 20, 24, 28];

const defaultFormatting: DocumentFormatting = {
    font_family: 'Inter',
    font_size: 14,
    text_color: '#1F2937',
    paper_size: 'a4',
    paper_theme: 'light',
};

const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
});

function storageKey(id: string) {
    return `kwati-doc-editor:${id}`;
}

function readStoredDocument(id: string | undefined): StoredDocument | null {
    if (!id || typeof window === 'undefined') {
        return null;
    }

    const raw = window.sessionStorage.getItem(storageKey(id));
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as StoredDocument;

        return {
            ...parsed,
            formatting: {
                ...defaultFormatting,
                ...(parsed.formatting ?? {}),
            },
        };
    } catch {
        return null;
    }
}

function saveStoredDocument(document: StoredDocument) {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(storageKey(document.id), JSON.stringify(document));
}

function triggerDownload(url?: string | null, filename?: string | null) {
    if (!url) {
        return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'document';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function plainTextToHtml(content: string): string {
    return content
        .split(/\n{2,}/)
        .map((block) => {
            const escaped = block
                .split('\n')
                .map((line) => line
                    .replaceAll('&', '&amp;')
                    .replaceAll('<', '&lt;')
                    .replaceAll('>', '&gt;'))
                .join('<br>');

            return `<p>${escaped || '<br>'}</p>`;
        })
        .join('');
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function markdownToRichHtml(markdown: string): string {
    const lines = markdown.split('\n');
    const html: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i] ?? '';
        const trimmed = line.trim();

        if (trimmed === '') {
            i += 1;
            continue;
        }

        if (trimmed.startsWith('|')) {
            const tableLines: string[] = [];
            while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
                tableLines.push((lines[i] ?? '').trim());
                i += 1;
            }

            const rows = tableLines
                .map((tableLine) => tableLine.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()))
                .filter((row) => !row.every((cell) => /^:?-+:?$/.test(cell)));

            if (rows.length > 0) {
                const [header, ...body] = rows;
                html.push('<table><thead><tr>');
                header.forEach((cell) => html.push(`<th>${escapeHtml(cell)}</th>`));
                html.push('</tr></thead><tbody>');
                body.forEach((row) => {
                    html.push('<tr>');
                    row.forEach((cell) => html.push(`<td>${escapeHtml(cell)}</td>`));
                    html.push('</tr>');
                });
                html.push('</tbody></table>');
            }

            continue;
        }

        if (/^###\s+/.test(trimmed)) {
            html.push(`<h3>${escapeHtml(trimmed.replace(/^###\s+/, ''))}</h3>`);
            i += 1;
            continue;
        }

        if (/^##\s+/.test(trimmed)) {
            html.push(`<h2>${escapeHtml(trimmed.replace(/^##\s+/, ''))}</h2>`);
            i += 1;
            continue;
        }

        if (/^#\s+/.test(trimmed)) {
            html.push(`<h1>${escapeHtml(trimmed.replace(/^#\s+/, ''))}</h1>`);
            i += 1;
            continue;
        }

        if (/^[-*]\s+/.test(trimmed)) {
            html.push('<ul>');
            while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? '').trim())) {
                html.push(`<li>${escapeHtml((lines[i] ?? '').trim().replace(/^[-*]\s+/, ''))}</li>`);
                i += 1;
            }
            html.push('</ul>');
            continue;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            html.push('<ol>');
            while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? '').trim())) {
                html.push(`<li>${escapeHtml((lines[i] ?? '').trim().replace(/^\d+\.\s+/, ''))}</li>`);
                i += 1;
            }
            html.push('</ol>');
            continue;
        }

        html.push(`<p>${escapeHtml(trimmed)}</p>`);
        i += 1;
    }

    return html.join('');
}

function sanitizeEditorHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['style', 'align', 'colspan', 'rowspan'],
    });
}

function htmlToPlainText(html: string): string {
    if (typeof window === 'undefined') {
        return html;
    }

    const container = window.document.createElement('div');
    container.innerHTML = html;

    return container.textContent?.trim() || '';
}

function htmlToExportMarkdown(html: string): string {
    if (typeof window === 'undefined') {
        return turndownService.turndown(html);
    }

    const container = window.document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('table').forEach((table) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) {
            return;
        }

        const markdownRows = rows.map((row) => {
            const cells = Array.from(row.querySelectorAll('th,td')).map((cell) => cell.textContent?.trim() || '');
            return `| ${cells.join(' | ')} |`;
        });

        const columnCount = Array.from(rows[0].querySelectorAll('th,td')).length || 1;
        markdownRows.splice(1, 0, `| ${Array(columnCount).fill('---').join(' | ')} |`);

        const replacement = window.document.createElement('p');
        replacement.textContent = markdownRows.join('\n');
        table.replaceWith(replacement);
    });

    return turndownService.turndown(container.innerHTML);
}

const paperMetrics = {
    a4: { widthClass: 'w-[794px]', heightClass: 'h-[1123px]', label: 'A4' },
    letter: { widthClass: 'w-[816px]', heightClass: 'h-[1056px]', label: 'Letter' },
    legal: { widthClass: 'w-[816px]', heightClass: 'h-[1344px]', label: 'Legal' },
} as const;

function estimatePageCount(content: string, html: string, paperSize: keyof typeof paperMetrics): number {
    const tableCount = (html.match(/<table/gi) || []).length;
    const headingCount = (html.match(/<h[1-3]/gi) || []).length;
    const baseUnits = content.length + (tableCount * 800) + (headingCount * 120);
    const pageCapacity = paperSize === 'legal' ? 3600 : paperSize === 'letter' ? 3000 : 3200;

    return Math.max(1, Math.ceil(baseUnits / pageCapacity));
}

export function Component() {
    const navigate = useNavigate();
    const { documentId } = useParams();
    const initialDocument = useMemo(() => readStoredDocument(documentId), [documentId]);
    const [title, setTitle] = useState(initialDocument?.title ?? 'Untitled document');
    const [htmlContent, setHtmlContent] = useState(() =>
        sanitizeEditorHtml(initialDocument?.content_html || markdownToRichHtml(initialDocument?.content ?? '')),
    );
    const [file, setFile] = useState<StoredDocument['file']>(initialDocument?.file ?? null);
    const [formatting, setFormatting] = useState<DocumentFormatting>(initialDocument?.formatting ?? defaultFormatting);
    const [highlightColor, setHighlightColor] = useState('#FEF08A');
    const [currentPage, setCurrentPage] = useState(1);
    const editorRef = useRef<HTMLDivElement | null>(null);

    const content = useMemo(() => htmlToPlainText(htmlContent), [htmlContent]);
    const pageCount = useMemo(() => estimatePageCount(content, htmlContent, formatting.paper_size), [content, htmlContent, formatting.paper_size]);
    const paperMetric = paperMetrics[formatting.paper_size];
    const effectiveTextColor = formatting.paper_theme === 'dark' ? '#F8FAFC' : '#111827';
    const paperShellClass = formatting.paper_theme === 'dark' ? 'bg-[#050816]' : 'bg-white';
    const tableBorderClass = formatting.paper_theme === 'dark' ? '[&_td]:border-slate-700 [&_th]:border-slate-700 [&_th]:bg-slate-900/90' : '[&_td]:border-slate-300 [&_th]:border-slate-300 [&_th]:bg-slate-100';

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== htmlContent) {
            editorRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent]);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, pageCount));
    }, [pageCount]);

    const applyCommand = (command: string, value?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        setHtmlContent(sanitizeEditorHtml(editorRef.current?.innerHTML || ''));
    };

    const handleEditorInput = () => {
        setHtmlContent(sanitizeEditorHtml(editorRef.current?.innerHTML || ''));
    };

    const goToPage = (page: number) => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        const nextPage = Math.max(1, Math.min(pageCount, page));
        const pageHeight = editor.clientHeight;
        editor.scrollTo({
            top: (nextPage - 1) * pageHeight,
            behavior: 'smooth',
        });
        setCurrentPage(nextPage);
    };

    const handleEditorScroll = () => {
        const editor = editorRef.current;
        if (!editor) {
            return;
        }

        const pageHeight = Math.max(editor.clientHeight, 1);
        const nextPage = Math.max(1, Math.min(pageCount, Math.round(editor.scrollTop / pageHeight) + 1));
        if (nextPage !== currentPage) {
            setCurrentPage(nextPage);
        }
    };

    const exportDocument = useMutation({
        mutationFn: (format: 'word' | 'pdf') =>
            apiRequest<ExportResponse>('/api/documents/export', {
                method: 'POST',
                json: {
                    title,
                    content: htmlToExportMarkdown(htmlContent),
                    format,
                    style: initialDocument?.style ?? 'professional',
                    document_type: initialDocument?.document_type ?? 'general',
                    formatting,
                },
            }),
        onSuccess: (payload, format) => {
            const nextFile = payload.file ?? null;
            setFile(nextFile);

            if (initialDocument) {
                saveStoredDocument({
                    ...initialDocument,
                    title,
                    content,
                    content_html: htmlContent,
                    format,
                    formatting,
                    file: nextFile,
                });
            }

            triggerDownload(nextFile?.url, nextFile?.filename);
            toast.success(`${format === 'word' ? 'Word' : 'PDF'} download is ready.`);
        },
        onError: (error) => {
            toast.error(error instanceof ApiError ? error.message : 'Could not export the document.');
        },
    });

    const handleSaveDraft = () => {
        if (!initialDocument) {
            return;
        }

        saveStoredDocument({
            ...initialDocument,
            title,
            content,
            content_html: htmlContent,
            formatting,
            file,
        });

        toast.success('Draft saved');
    };

    if (!initialDocument || !documentId) {
        return (
            <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(37,99,235,0.14),_transparent_28%),linear-gradient(180deg,#030712_0%,#08111d_52%,#0b1220_100%)] px-4 py-6 text-white sm:px-6">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-[34px] border border-white/10 bg-white/[0.05] p-8 text-center backdrop-blur-xl">
                    <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                        <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 rounded-sm object-contain" draggable={false} />
                        Kwati Docs
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-3xl font-semibold text-white">Document draft not found</h1>
                        <p className="text-sm leading-7 text-slate-300 sm:text-base">
                            This editor opens right after AI creates a document draft. Start from the docs page to generate a fresh one.
                        </p>
                    </div>
                    <div>
                        <Button className="rounded-full bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={() => navigate('/docs')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Kwati Docs
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_24%),radial-gradient(circle_at_right,_rgba(37,99,235,0.14),_transparent_28%),linear-gradient(180deg,#030712_0%,#08111d_52%,#0b1220_100%)] px-4 py-6 text-white sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-sm font-semibold text-emerald-100">
                                <img src="/icon.png" alt="Kwati AI" className="h-5 w-5 rounded-sm object-contain" draggable={false} />
                                Kwati Docs
                            </div>
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                                    AI created the first draft for you. Edit the content here, then download a fresh Word or PDF file whenever you’re ready.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => navigate('/docs')}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={handleSaveDraft}
                            >
                                Save draft
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => exportDocument.mutate('word')}
                                disabled={exportDocument.isPending}
                            >
                                {exportDocument.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download Word
                            </Button>
                            <Button
                                variant="ghost"
                                className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                onClick={() => exportDocument.mutate('pdf')}
                                disabled={exportDocument.isPending}
                            >
                                {exportDocument.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="rounded-[30px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                        <div className="mb-4 space-y-3">
                            <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">Document title</label>
                            <Input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-slate-500"
                                placeholder="Document title"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-black/10 p-4">
                                <div className="mr-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                                    <Type className="h-4 w-4 text-emerald-300" />
                                    Typography
                                </div>

                                <Select
                                    value={formatting.font_family}
                                    onValueChange={(value) => setFormatting((current) => ({ ...current, font_family: value }))}
                                >
                                    <SelectTrigger className="h-10 w-[180px] rounded-2xl border-white/10 bg-black/20 text-white">
                                        <SelectValue placeholder="Font family" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fontFamilies.map((font) => (
                                            <SelectItem key={font.value} value={font.value}>
                                                {font.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={String(formatting.font_size)}
                                    onValueChange={(value) => setFormatting((current) => ({ ...current, font_size: Number(value) }))}
                                >
                                    <SelectTrigger className="h-10 w-[110px] rounded-2xl border-white/10 bg-black/20 text-white">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fontSizes.map((size) => (
                                            <SelectItem key={size} value={String(size)}>
                                                {size}px
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <label className="flex h-10 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-slate-300">
                                    <Highlighter className="h-4 w-4 text-cyan-300" />
                                    <input
                                        type="color"
                                        value={highlightColor}
                                        onChange={(event) => setHighlightColor(event.target.value)}
                                        className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                                    />
                                </label>

                                <Select
                                    value={formatting.paper_size}
                                    onValueChange={(value: 'a4' | 'letter' | 'legal') => setFormatting((current) => ({ ...current, paper_size: value }))}
                                >
                                    <SelectTrigger className="h-10 w-[130px] rounded-2xl border-white/10 bg-black/20 text-white">
                                        <SelectValue placeholder="Paper" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="a4">A4</SelectItem>
                                        <SelectItem value="letter">Letter</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={formatting.paper_theme}
                                    onValueChange={(value: 'light' | 'dark') => setFormatting((current) => ({ ...current, paper_theme: value }))}
                                >
                                    <SelectTrigger className="h-10 w-[130px] rounded-2xl border-white/10 bg-black/20 text-white">
                                        <SelectValue placeholder="Theme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('bold')}
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('italic')}
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('underline')}
                                >
                                    <Underline className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('hiliteColor', highlightColor)}
                                >
                                    <Palette className="mr-2 h-4 w-4" />
                                    Highlight
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('justifyLeft')}
                                >
                                    <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('justifyCenter')}
                                >
                                    <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-10 rounded-2xl border border-white/10 bg-black/20 px-3 text-white hover:bg-white/10"
                                    onClick={() => applyCommand('justifyRight')}
                                >
                                    <AlignRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">Document content</label>
                            <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-black/10 p-4">
                                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                                    <span>{paperMetric.label} paper</span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 rounded-full border border-white/10 bg-white/5 px-2 text-white hover:bg-white/10"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage <= 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span>Page {currentPage} of {pageCount}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-8 rounded-full border border-white/10 bg-white/5 px-2 text-white hover:bg-white/10"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage >= pageCount}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    className={`mx-auto overflow-hidden rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.25)] ${paperShellClass} ${paperMetric.widthClass} ${paperMetric.heightClass}`}
                                >
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onInput={handleEditorInput}
                                        onScroll={handleEditorScroll}
                                        className={`h-full overflow-y-auto p-12 outline-none [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mb-2 [&_li]:ml-5 [&_li]:list-disc [&_ol]:mb-4 [&_ol]:ml-5 [&_p]:mb-4 [&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left ${tableBorderClass}`}
                                        style={{
                                            fontFamily: formatting.font_family,
                                            fontSize: `${formatting.font_size}px`,
                                            color: effectiveTextColor,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                <Sparkles className="h-4 w-4 text-emerald-300" />
                                Draft status
                            </div>
                            <div className="space-y-3 text-sm leading-7 text-slate-300">
                                <p>Format: <span className="font-medium text-white">{(initialDocument.format || 'word').toUpperCase()}</span></p>
                                <p>Style: <span className="font-medium capitalize text-white">{initialDocument.style}</span></p>
                                <p>Type: <span className="font-medium text-white">{initialDocument.document_type.replaceAll('_', ' ')}</span></p>
                                <p>Font: <span className="font-medium text-white">{formatting.font_family}</span></p>
                                <p>Size: <span className="font-medium text-white">{formatting.font_size}px</span></p>
                                <p>Paper: <span className="font-medium text-white">{paperMetric.label}</span></p>
                                <p>Theme: <span className="font-medium text-white">{formatting.paper_theme === 'dark' ? 'Dark' : 'Light'}</span></p>
                                <p>Page: <span className="font-medium text-white">{currentPage} / {pageCount}</span></p>
                                <p className="flex items-center gap-2">Text color: <span className="font-medium text-white">{effectiveTextColor}</span><span className="inline-block h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: effectiveTextColor }} /></p>
                                <p className="flex items-center gap-2">Highlight: <span className="font-medium text-white">{highlightColor}</span><span className="inline-block h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: highlightColor }} /></p>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                <FileText className="h-4 w-4 text-cyan-300" />
                                Latest file
                            </div>
                            <div className="space-y-3 text-sm leading-7 text-slate-300">
                                <p>{file?.filename || 'No exported file yet for this draft.'}</p>
                                {file?.url ? (
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                                        onClick={() => triggerDownload(file.url, file.filename)}
                                    >
                                        Download latest file
                                    </Button>
                                ) : null}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                {formatting.paper_theme === 'dark' ? <Moon className="h-4 w-4 text-emerald-300" /> : <Sun className="h-4 w-4 text-amber-300" />}
                                Paper appearance
                            </div>
                            <p className="text-sm leading-7 text-slate-300">
                                Light paper uses black text. Dark paper uses white text automatically.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
