import type React from "react"
import {
    Bot, CheckSquare, ChevronDown, FileUp, Mic, MicOff, Palette, Plus, Search, SendHorizonal, Square, X,
    Image as ImageIcon, FileText, FileSpreadsheet, File as FileIcon, Paperclip
} from "lucide-react"
import {
    type FormEvent, type KeyboardEvent, type RefObject,
    useCallback, useContext, useEffect, useRef, useState
} from "react"
import { Button } from "@/components/ui/button"
import { SidebarContextProvider } from "@/components/ui/sidebar"
import { useSpaLang } from "@/spa/lib/lang"
import ImageToggle from "@/components/chat/ImageToggle"
import CanvasEditor from "@/components/chat/CanvasEditor"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ─── Types ───────────────────────────────────────────────────────────────────

declare global {
    interface Window {
        webkitSpeechRecognition?: new () => SpeechRecognition
        SpeechRecognition?: new () => SpeechRecognition
    }
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    start: () => void
    stop: () => void
}

interface SpeechRecognitionEvent extends Event {
    results: { item(i: number): { item(j: number): { transcript: string } }; length: number }
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
}

interface ChatInputProps {
    onSend: (e: FormEvent, type: "text" | "image", files?: File[]) => void
    ref: RefObject<HTMLTextAreaElement | null>
    is_processing: boolean
    handleKeyDown: (e: KeyboardEvent) => void
    mode: "text" | "image"
    setMode: (mode: string) => void
    isAuthenticated?: boolean
    files?: File[]
    setFiles?: (files: File[] | ((prev: File[]) => File[])) => void
    powerPointDesigns?: PowerPointDesign[]
    onTogglePowerPointDesign?: (design: PowerPointDesign, checked: boolean) => void
    onClearPowerPointDesigns?: () => void
    layout?: "floating" | "inline"
}

const POWERPOINT_DESIGN_OPTIONS = [
    { value: "business_blue", label: "Business Blue", description: "Executive blue presentation with refined side panels, clean white content areas, and polished strategy-report layouts" },
    { value: "boardroom", label: "Boardroom", description: "Executive dark-neutral slides with premium accent tones for serious leadership decks" },
    { value: "corporate", label: "Corporate", description: "Clean and business-focused" },
    { value: "creative", label: "Creative", description: "Bold and colorful layouts" },
    { value: "editorial", label: "Editorial", description: "Magazine-style presentation with refined typography and storytelling rhythm" },
    { value: "tech_grid", label: "Tech Grid", description: "Modern SaaS and product deck look with structured data-friendly layouts" },
    { value: "financial_clean", label: "Financial Clean", description: "Crisp investor-style slides for finance, metrics, and reports" },
    { value: "minimalist", label: "Minimalist", description: "Simple and spacious" },
    { value: "dark", label: "Dark", description: "High-contrast dramatic slides" },
    { value: "warm", label: "Warm", description: "Friendly, energetic tones" },
    { value: "mixed", label: "Mixed", description: "Auto-mixed built-in themes" },
] as const

type PowerPointDesign = typeof POWERPOINT_DESIGN_OPTIONS[number]["value"]

// ─── File helpers ─────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = [
    "image/",
    "text/",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const isValidFile = (file: File) =>
    ACCEPTED_TYPES.some(t => file.type === t || file.type.startsWith(t))

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileTypeInfo = (file: File): { icon: React.ReactNode; colorClass: string; ext: string } => {
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "?"
    if (file.type.startsWith("image/"))
        return { icon: <ImageIcon className="h-4 w-4" />, colorClass: "text-violet-400 bg-violet-400/10", ext }
    if (file.type === "application/pdf" || file.name.endsWith(".pdf"))
        return { icon: <FileText className="h-4 w-4" />, colorClass: "text-red-400 bg-red-400/10", ext: "PDF" }
    if (file.type.includes("spreadsheet") || file.type === "application/vnd.ms-excel")
        return { icon: <FileSpreadsheet className="h-4 w-4" />, colorClass: "text-green-400 bg-green-400/10", ext }
    if (file.type.includes("word") || file.name.match(/\.docx?$/i))
        return { icon: <FileText className="h-4 w-4" />, colorClass: "text-blue-400 bg-blue-400/10", ext }
    return { icon: <FileIcon className="h-4 w-4" />, colorClass: "text-muted-foreground bg-muted", ext }
}

// ─── File preview chip ────────────────────────────────────────────────────────

function FileChip({ file, onRemove }: { file: File; onRemove: () => void }) {
    const isImage = file.type.startsWith("image/")
    const { icon, colorClass, ext } = getFileTypeInfo(file)

    return (
        <div className="relative group flex items-center gap-2.5 bg-background/50 hover:bg-background border border-border/40 rounded-xl p-2 transition-colors duration-150 min-w-0">
            {isImage ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/30">
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : (
                <div className={`h-10 w-10 rounded-lg flex flex-col items-center justify-center gap-0.5 flex-shrink-0 ${colorClass}`}>
                    {icon}
                    <span className="text-[9px] font-bold leading-none">{ext}</span>
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-tight">{file.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{formatSize(file.size)}</p>
            </div>
            <button
                type="button"
                onClick={onRemove}
                title="Remove"
                className="h-5 w-5 flex-shrink-0 flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors md:opacity-0 md:group-hover:opacity-100"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChatInput({
    onSend,
    ref: inputRef,
    is_processing,
    handleKeyDown,
    mode,
    setMode,
    isAuthenticated = false,
    files: propFiles,
    setFiles: propSetFiles,
    powerPointDesigns = [],
    onTogglePowerPointDesign,
    onClearPowerPointDesigns,
    layout = "floating",
}: ChatInputProps) {
    const [internalFiles, setInternalFiles] = useState<File[]>([])
    const files = propFiles ?? internalFiles
    const setFiles = propSetFiles ?? setInternalFiles

    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showCanvasEditor, setShowCanvasEditor] = useState(false)
    const [showPowerPointDesigns, setShowPowerPointDesigns] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const sidebarContext = useContext(SidebarContextProvider)
    const { getLanguageForSpeech, lang } = useSpaLang()

    // ── File validation & addition ────────────────────────────────────────────

    const addFiles = useCallback((incoming: File[]) => {
        const MAX_SIZE = 30 * 1024 * 1024
        const valid = incoming.filter(isValidFile)
        const invalidCount = incoming.length - valid.length
        const oversized = valid.filter(f => f.size > MAX_SIZE)
        const accepted = valid.filter(f => f.size <= MAX_SIZE)

        if (invalidCount > 0)
            toast.error(`${invalidCount} unsupported file${invalidCount > 1 ? "s" : ""} skipped`)
        if (oversized.length > 0)
            toast.error(`${oversized.length} file${oversized.length > 1 ? "s" : ""} exceed the 30 MB limit`)
        if (accepted.length === 0) return

        setFiles(prev => {
            const slots = 10 - prev.length
            if (slots <= 0) { toast.error("Maximum 10 files reached"); return prev }
            const toAdd = accepted.slice(0, slots)
            if (accepted.length > slots)
                toast.error(`Only ${slots} more file${slots > 1 ? "s" : ""} can be added`)
            return [...prev, ...toAdd]
        })
    }, [setFiles])

    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))
    const clearFiles = () => setFiles([])

    // ── Speech recognition ────────────────────────────────────────────────────

    useEffect(() => {
        if (!recognition) {
            if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) return
            const API = window.webkitSpeechRecognition || window.SpeechRecognition
            if (!API) return
            const r = new API()
            r.continuous = true
            r.interimResults = false
            r.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results.item(event.results.length - 1).item(0).transcript.trim()
                if (inputRef.current) {
                    inputRef.current.value += transcript + " "
                    inputRef.current.dispatchEvent(new Event("input", { bubbles: true }))
                }
            }
            r.onend = () => setIsRecording(false)
            r.onerror = (event: SpeechRecognitionErrorEvent) => {
                setIsRecording(false)
                toast.error(`Speech error: ${event.error}`)
            }
            setRecognition(r)
        }
        if (recognition) recognition.lang = getLanguageForSpeech(lang)
        return () => { if (recognition) recognition.stop() }
    }, [lang, getLanguageForSpeech, inputRef])

    // ── Query params (pre-fill & canvas mode) ─────────────────────────────────

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const s = params.get("s")
        if (s && inputRef.current) {
            inputRef.current.value = s
            autoResize()
        }
        if (location.search.includes("mode=canvas")) setShowCanvasEditor(true)
    }, [])

    // ── Paste images from clipboard ───────────────────────────────────────────

    useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const images = Array.from(e.clipboardData?.items || [])
                .filter(i => i.kind === "file" && i.type.startsWith("image/"))
                .map(i => i.getAsFile())
                .filter(Boolean) as File[]
            if (images.length > 0) { e.preventDefault(); addFiles(images) }
        }
        document.addEventListener("paste", onPaste)
        return () => document.removeEventListener("paste", onPaste)
    }, [addFiles])

    // ── Textarea auto-resize ──────────────────────────────────────────────────

    const autoResize = () => {
        const el = inputRef.current
        if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px` }
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    const toggleRecording = () => {
        if (isRecording) { recognition?.stop(); setIsRecording(false) }
        else if (recognition) { recognition.start(); setIsRecording(true) }
        else toast.error("Speech recognition not supported")
    }

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSend(e, mode, files.length > 0 ? files : undefined)
        clearFiles()
        if (inputRef.current) inputRef.current.style.height = "auto"
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) { addFiles(Array.from(e.target.files)); e.target.value = "" }
    }

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files))
    }

    const handleSaveCanvas = (content: string, language: string) => {
        const map: Record<string, { ext: string; mime: string }> = {
            markdown: { ext: "md", mime: "text/markdown" },
            python: { ext: "py", mime: "text/x-python" },
            javascript: { ext: "js", mime: "text/javascript" },
            html: { ext: "html", mime: "text/html" },
            css: { ext: "css", mime: "text/css" },
            json: { ext: "json", mime: "application/json" },
        }
        const { ext = "txt", mime = "text/plain" } = map[language] || {}
        const file = new File([new Blob([content], { type: mime })], `canvas-${Date.now()}.${ext}`, { type: mime })
        addFiles([file])
    }

    // ── Layout classes ────────────────────────────────────────────────────────

    const wrapperClass = cn(
        layout === "floating"
            ? "absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/94 to-transparent pb-10 pt-8 md:pb-12"
            : "relative w-full",
        sidebarContext?.open && isAuthenticated && "lg:left-0"
    )

    const innerClass = "mx-auto w-full max-w-2xl px-4"

    return (
        <TooltipProvider>
            <div
                className={wrapperClass}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className={innerClass}>
                    <form onSubmit={handleFormSubmit} className="relative">

                        {/* Drag overlay */}
                        {isDragging && (
                            <div className="absolute inset-0 -top-20 rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-2">
                                <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center">
                                    <FileUp className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-semibold text-primary">Drop to attach</p>
                                <p className="text-xs text-muted-foreground">Images, PDFs, docs, spreadsheets · max 30 MB</p>
                            </div>
                        )}

                        {/* File chips */}
                        {files.length > 0 && (
                            <div className="mb-0 border-b border-border/30 bg-card/30 px-3 pt-2.5 pb-2">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-muted-foreground/70">
                                        {files.length} / 10 attached
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearFiles}
                                        className="text-[11px] text-muted-foreground/50 hover:text-destructive transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-y-auto custom-scrollbar pr-0.5">
                                    {files.map((file, i) => (
                                        <FileChip key={i} file={file} onRemove={() => removeFile(i)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {showPowerPointDesigns && mode === "text" && (
                            <div className="border-b border-border/30 bg-card/30 px-3 py-3">
                                <div className="mb-2 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">PowerPoint styles</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            These selections apply when you ask for a PowerPoint, slide deck, or presentation.
                                        </p>
                                    </div>
                                    {powerPointDesigns.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={onClearPowerPointDesigns}
                                            className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {POWERPOINT_DESIGN_OPTIONS.map((option) => {
                                        const checked = powerPointDesigns.includes(option.value)

                                        return (
                                            <label
                                                key={option.value}
                                                className={cn(
                                                    "flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition-colors",
                                                    checked
                                                        ? "border-primary/50 bg-primary/10"
                                                        : "border-border/50 bg-background/40 hover:border-border hover:bg-background/60"
                                                )}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={(nextChecked) => onTogglePowerPointDesign?.(option.value, nextChecked === true)}
                                                    className="mt-0.5"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-xs font-medium text-foreground">{option.label}</span>
                                                    <span className="block text-[11px] text-muted-foreground">{option.description}</span>
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#202123]/95 shadow-[0_12px_40px_rgba(0,0,0,0.24)] transition-colors duration-150 focus-within:border-white/20 focus-within:shadow-[0_16px_44px_rgba(0,0,0,0.28)]">
                            <textarea
                                ref={inputRef}
                                onChange={autoResize}
                                placeholder={mode === "text" ? "Message Kwati AI" : "Describe the image to generate..."}
                                className="custom-scrollbar max-h-[200px] w-full resize-none bg-transparent px-5 pt-4 pb-3 text-[15px] leading-7 text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                                rows={1}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                disabled={is_processing}
                            />

                            <div className="px-3 pb-3 pt-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="relative h-9 rounded-full px-3 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Paperclip className="mr-2 h-4 w-4" />
                                                    Attach
                                                    {files.length > 0 && (
                                                        <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                                                            {files.length}
                                                        </span>
                                                    )}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Attach files · paste image</TooltipContent>
                                        </Tooltip>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-9 rounded-full px-3 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                        >
                                            <Bot className="mr-2 h-4 w-4" />
                                            Agent
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="h-9 rounded-full px-3 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground"
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            Search
                                        </Button>

                                        <DropdownMenu>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            className={cn(
                                                                "h-9 rounded-full px-3 text-sm text-muted-foreground hover:bg-white/6 hover:text-foreground",
                                                                mode === "image" && "bg-white/8 text-foreground"
                                                            )}
                                                        >
                                                            <ImageIcon className="mr-2 h-4 w-4" />
                                                            Image
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>Image mode</TooltipContent>
                                            </Tooltip>
                                            <DropdownMenuContent align="start" className="w-44">
                                                <DropdownMenuItem asChild>
                                                    <ImageToggle mode={mode} onToggle={setMode} />
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setShowPowerPointDesigns((current) => !current)}
                                                    className={cn(
                                                        "h-9 w-9 rounded-full text-muted-foreground hover:bg-white/6 hover:text-foreground",
                                                        (showPowerPointDesigns || powerPointDesigns.length > 0) && "bg-white/8 text-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {powerPointDesigns.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Choose PowerPoint styles</TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={toggleRecording}
                                                    className={cn(
                                                        "h-9 w-9 rounded-full text-muted-foreground hover:bg-white/6 hover:text-foreground",
                                                        isRecording && "bg-destructive/10 text-destructive hover:text-destructive"
                                                    )}
                                                >
                                                    {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{isRecording ? "Stop recording" : "Voice input"}</TooltipContent>
                                        </Tooltip>

                                        {mode === "text" && powerPointDesigns.length > 0 && (
                                            <span className="inline-flex max-w-[180px] items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                                                <Palette className="h-2.5 w-2.5" />
                                                <span className="truncate">{powerPointDesigns.join(", ")}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="hidden items-center gap-1 rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground md:flex"
                                        >
                                            K2.6 Instant
                                            <ChevronDown className="h-4 w-4" />
                                        </button>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    disabled={is_processing}
                                                    className={cn(
                                                        "h-9 w-9 rounded-full transition-all",
                                                        is_processing
                                                            ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                                            : "bg-foreground text-background hover:bg-foreground/90"
                                                    )}
                                                >
                                                    {is_processing ? <Square className="h-3 w-3" /> : <SendHorizonal className="h-4 w-4" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>{is_processing ? "Processing…" : "Send (Enter)"}</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,text/*,.pdf,.xlsx,.xls,.doc,.docx"
                            className="hidden"
                            multiple
                        />
                    </form>
                </div>
            </div>

            {showCanvasEditor && (
                <CanvasEditor
                    onClose={() => setShowCanvasEditor(false)}
                    onSaveAsFile={handleSaveCanvas}
                />
            )}
        </TooltipProvider>
    )
}
