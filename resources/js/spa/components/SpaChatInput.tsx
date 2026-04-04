import type React from "react"
import {
    FileUp, Mic, MicOff, SendHorizonal, Square, X,
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
    ref: RefObject<HTMLTextAreaElement>
    is_processing: boolean
    handleKeyDown: (e: KeyboardEvent) => void
    mode: "text" | "image"
    setMode: (mode: string) => void
    isAuthenticated?: boolean
    files?: File[]
    setFiles?: (files: File[] | ((prev: File[]) => File[])) => void
}

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
}: ChatInputProps) {
    const [internalFiles, setInternalFiles] = useState<File[]>([])
    const files = propFiles ?? internalFiles
    const setFiles = propSetFiles ?? setInternalFiles

    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showCanvasEditor, setShowCanvasEditor] = useState(false)

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
        "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background to-transparent pb-4 pt-8",
        sidebarContext?.open && isAuthenticated && "lg:left-64"
    )

    const innerClass = cn("container mx-auto px-4", {
        "max-w-4xl": isAuthenticated && !sidebarContext?.open,
        "max-w-3xl": !isAuthenticated || (isAuthenticated && sidebarContext?.open),
    })

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
                            <div className="mb-2 bg-card/70 border border-border/40 rounded-2xl p-2.5">
                                <div className="flex items-center justify-between mb-2 px-0.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        {files.length} / 10 attached
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearFiles}
                                        className="text-[11px] text-muted-foreground/70 hover:text-destructive transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-0.5">
                                    {files.map((file, i) => (
                                        <FileChip key={i} file={file} onRemove={() => removeFile(i)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input box */}
                        <div className="bg-card border border-border/60 rounded-2xl shadow-md overflow-hidden focus-within:border-primary/40 focus-within:shadow-primary/5 focus-within:shadow-lg transition-all duration-200">

                            <textarea
                                ref={inputRef}
                                onChange={autoResize}
                                placeholder={mode === "text" ? "Ask anything…" : "Describe the image to generate…"}
                                className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm focus:outline-none custom-scrollbar max-h-[160px] overflow-y-auto placeholder:text-muted-foreground/50"
                                rows={1}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                disabled={is_processing}
                            />

                            {/* Controls */}
                            <div className="flex items-center justify-between px-2.5 pb-2 pt-0.5 border-t border-border/30">
                                <div className="flex items-center gap-0.5">

                                    {/* Attach */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 relative text-muted-foreground hover:text-foreground"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                {files.length > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center text-[9px] text-primary-foreground font-bold">
                                                        {files.length}
                                                    </span>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Attach files · paste image</TooltipContent>
                                    </Tooltip>

                                    {/* Image mode */}
                                    <DropdownMenu>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", mode === "image" && "text-primary")}
                                                    >
                                                        <ImageIcon className="h-4 w-4" />
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

                                    {/* Voice */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={toggleRecording}
                                                className={cn(
                                                    "h-8 w-8 text-muted-foreground hover:text-foreground",
                                                    isRecording && "text-destructive hover:text-destructive bg-destructive/10"
                                                )}
                                            >
                                                {isRecording
                                                    ? <MicOff className="h-4 w-4 animate-pulse" />
                                                    : <Mic className="h-4 w-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{isRecording ? "Stop recording" : "Voice input"}</TooltipContent>
                                    </Tooltip>

                                    {/* Image mode badge */}
                                    {mode === "image" && (
                                        <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Image
                                        </span>
                                    )}
                                </div>

                                {/* Send */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={is_processing}
                                            className={cn(
                                                "h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all",
                                                is_processing && "opacity-75"
                                            )}
                                        >
                                            {is_processing
                                                ? <Square className="h-3.5 w-3.5" />
                                                : <SendHorizonal className="h-3.5 w-3.5" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{is_processing ? "Processing…" : "Send (Enter)"}</TooltipContent>
                                </Tooltip>
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
