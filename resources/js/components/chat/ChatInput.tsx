import type React from "react"
import { FileUp, Mic, MicOff, SendHorizonal, Square, X, Image as ImageIcon, FileText, FileSpreadsheet, File as FileIcon, Paperclip } from "lucide-react"
import { type FormEvent, type KeyboardEvent, type RefObject, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { SidebarContextProvider } from "../ui/sidebar"
import { useLang } from "@/hooks/use-lang"
import ImageToggle from "./ImageToggle"
import CanvasEditor from "./CanvasEditor"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { usePage } from "@inertiajs/react"

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
    results: {
        item(index: number): { item(index: number): { transcript: string } }
        length: number
    }
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
}

interface ChatInputProps {
    onSend: (e: FormEvent, type: "text" | "image", files?: File[]) => void
    ref: RefObject<HTMLTextAreaElement>
    is_processing: boolean
    handleKeyDown: (e: KeyboardEvent) => void
    mode: 'text' | 'image'
    setMode: (mode: string) => void
    files?: File[]
    setFiles?: (files: File[]) => void
}

export default function ChatInput({
    onSend,
    ref: inputRef,
    is_processing,
    handleKeyDown,
    mode,
    setMode,
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
    const { auth } = usePage().props;
    const sidebarContext = useContext(SidebarContextProvider)
    const { getLanguageForSpeech, lang } = useLang()

    const isValidFile = (file: File) =>
        file.type.startsWith('image/') ||
        file.type.startsWith('text/') ||
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const addFiles = useCallback((incoming: File[]) => {
        const MAX_SIZE = 30 * 1024 * 1024
        const valid = incoming.filter(isValidFile)
        const invalidCount = incoming.length - valid.length
        const oversized = valid.filter(f => f.size > MAX_SIZE)
        const accepted = valid.filter(f => f.size <= MAX_SIZE)

        if (invalidCount > 0) toast.error(`${invalidCount} unsupported file${invalidCount > 1 ? 's' : ''} skipped`)
        if (oversized.length > 0) toast.error(`${oversized.length} file${oversized.length > 1 ? 's' : ''} exceed 30 MB limit`)

        if (accepted.length === 0) return

        setFiles(prev => {
            const slots = 10 - prev.length
            if (slots <= 0) { toast.error('Maximum 10 files reached'); return prev }
            const toAdd = accepted.slice(0, slots)
            if (accepted.length > slots) toast.error(`Only ${slots} more file${slots > 1 ? 's' : ''} can be added`)
            return [...prev, ...toAdd]
        })
    }, [setFiles])

    useEffect(() => {
        if (!recognition) {
            if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
                return
            }

            const SpeechRecognitionAPI = window.webkitSpeechRecognition || window.SpeechRecognition
            if (!SpeechRecognitionAPI) return

            const recognitionInstance = new SpeechRecognitionAPI()
            recognitionInstance.continuous = true
            recognitionInstance.interimResults = false

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                const result = event.results.item(event.results.length - 1).item(0)
                const transcript = result.transcript.trim()
                if (inputRef.current) {
                    inputRef.current.value += transcript + " "
                    inputRef.current.dispatchEvent(new Event("input", { bubbles: true }))
                }
            }

            recognitionInstance.onend = () => setIsRecording(false)
            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                setIsRecording(false)
                toast.error(`Speech recognition error: ${event.error}`)
            }

            setRecognition(recognitionInstance)
        }

        if (recognition) {
            recognition.lang = getLanguageForSpeech(lang)
        }

        return () => {
            if (recognition) recognition.stop()
        }
    }, [lang, getLanguageForSpeech, inputRef])
useEffect(()=>{
    const query = location.search;
     const params = new URLSearchParams(location.search);
     if(params.get('s')){
        inputRef.current.value = params.get('s') || '';
        handleInputChange();
     }
    if(query.includes('mode=canvas')){
        setShowCanvasEditor(true);
    }

},[]);

    // Paste images from clipboard
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = Array.from(e.clipboardData?.items || [])
            const imageFiles = items
                .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
                .map(item => item.getAsFile())
                .filter(Boolean) as File[]
            if (imageFiles.length > 0) {
                e.preventDefault()
                addFiles(imageFiles)
            }
        }
        document.addEventListener('paste', handlePaste)
        return () => document.removeEventListener('paste', handlePaste)
    }, [addFiles])

    const toggleRecording = () => {
        if (isRecording) {
            recognition?.stop()
            setIsRecording(false)
        } else {
            if (recognition) {
                recognition.start()
                setIsRecording(true)
            } else {
                toast.error("Speech recognition is not ready or supported.")
            }
        }
    }

    const handleInputChange = () => {
        const textarea = inputRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSend(e, mode, files.length > 0 ? files : undefined)
        setFiles([])
        if (inputRef.current) {
            inputRef.current.style.height = "auto"
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            addFiles(Array.from(e.target.files))
            e.target.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files))
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const clearAllFiles = () => {
        setFiles([])
    }

    const handleSaveCanvas = (content: string, language: string) => {
        const extensionMap: Record<string, { ext: string; mime: string }> = {
            markdown: { ext: 'md', mime: 'text/markdown' },
            python: { ext: 'py', mime: 'text/x-python' },
            javascript: { ext: 'js', mime: 'text/javascript' },
            html: { ext: 'html', mime: 'text/html' },
            css: { ext: 'css', mime: 'text/css' },
            json: { ext: 'json', mime: 'application/json' },
            java: { ext: 'java', mime: 'text/x-java-source' },
            cpp: { ext: 'cpp', mime: 'text/x-c++src' }
        }

        const { ext = 'txt', mime = 'text/plain' } = extensionMap[language] || {}
        const blob = new Blob([content], { type: mime })
        const file = new File([blob], `canvas-${Date.now()}.${ext}`, { type: mime })

        setFiles((prev) => {
            if (prev.length >= 10) {
                toast.error('Maximum 10 files allowed')
                return prev
            }
            toast.success('Canvas content added as file')
            return [...prev, file]
        })
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const getFileTypeInfo = (file: File): { icon: React.ReactNode; color: string; ext: string } => {
        const ext = file.name.split('.').pop()?.toUpperCase() || '?'
        if (file.type.startsWith('image/')) return { icon: <ImageIcon className="h-4 w-4" />, color: 'text-violet-400 bg-violet-400/10', ext }
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return { icon: <FileText className="h-4 w-4" />, color: 'text-red-400 bg-red-400/10', ext: 'PDF' }
        if (file.type.includes('spreadsheet') || file.type === 'application/vnd.ms-excel') return { icon: <FileSpreadsheet className="h-4 w-4" />, color: 'text-green-400 bg-green-400/10', ext: ext || 'XLS' }
        if (file.type.includes('word') || file.name.match(/\.docx?$/i)) return { icon: <FileText className="h-4 w-4" />, color: 'text-blue-400 bg-blue-400/10', ext: ext || 'DOC' }
        return { icon: <FileIcon className="h-4 w-4" />, color: 'text-muted-foreground bg-muted', ext }
    }

    const getFilePreview = (file: File, index: number) => {
        const isImage = file.type.startsWith('image/')
        const { icon, color, ext } = getFileTypeInfo(file)

        return (
            <div
                key={index}
                className="relative group flex items-center gap-2.5 bg-background/50 hover:bg-background border border-border/50 rounded-xl p-2 transition-all duration-150"
            >
                {/* Thumbnail or icon */}
                {isImage ? (
                    <div className="h-11 w-11 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/40">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : (
                    <div className={`h-11 w-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0 gap-0.5 ${color}`}>
                        {icon}
                        <span className="text-[9px] font-bold leading-none">{ext}</span>
                    </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate leading-tight">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatSize(file.size)}</p>
                </div>

                {/* Remove button — always visible on mobile, hover on desktop */}
                <button
                    type="button"
                    className="h-5 w-5 flex items-center justify-center rounded-full bg-muted/80 hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors md:opacity-0 md:group-hover:opacity-100 flex-shrink-0"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background to-background/0 pb-4 pt-8",
                    sidebarContext?.open && auth.user && "lg:left-64"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className={cn(
                    "container mx-auto px-4",
                    {
                        "max-w-4xl": auth.user && !sidebarContext?.open,
                        "max-w-3xl": !auth.user || (auth.user && sidebarContext?.open)
                    }
                )}>
                    <form onSubmit={handleFormSubmit} className="relative">
                        {/* Drag Overlay */}
                        {isDragging && (
                            <div className="absolute inset-0 -top-20 rounded-2xl border-2 border-dashed border-primary bg-primary/5 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-2">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FileUp className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium text-primary">Drop to attach</p>
                                <p className="text-xs text-muted-foreground">Images, PDFs, docs, spreadsheets · max 30 MB each</p>
                            </div>
                        )}

                        {/* File Previews */}
                        {files.length > 0 && (
                            <div className="mb-2 bg-card/60 border border-border/40 rounded-2xl p-2.5">
                                <div className="flex items-center justify-between mb-2 px-0.5">
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        {files.length} / 10 attached
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearAllFiles}
                                        className="text-[11px] text-muted-foreground/70 hover:text-destructive transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                                    {files.map((file, index) => getFilePreview(file, index))}
                                </div>
                            </div>
                        )}

                        {/* Main Input Container */}
                        <div className="bg-card border border-border/60 rounded-2xl shadow-md overflow-hidden focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all duration-200">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    onChange={handleInputChange}
                                    placeholder={
                                        mode === "text"
                                            ? "Ask anything…"
                                            : "Describe the image you want to generate…"
                                    }
                                    className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm focus:outline-none custom-scrollbar max-h-[160px] overflow-y-auto placeholder:text-muted-foreground/50"
                                    rows={1}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    disabled={is_processing}
                                />
                            </div>

                            {/* Controls Bar */}
                            <div className="flex items-center justify-between px-2.5 pb-2 pt-1 border-t border-border/30">
                                <div className="flex items-center gap-1">
                                                    {/* Attach files */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 relative text-muted-foreground hover:text-foreground"
                                                onClick={triggerFileInput}
                                            >
                                                <Paperclip className="h-4 w-4" />
                                                {files.length > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center text-[9px] text-primary-foreground font-medium">
                                                        {files.length}
                                                    </span>
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Attach files</TooltipContent>
                                    </Tooltip>

                                    {/* Image mode toggle */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", mode === 'image' && "text-primary")}
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-44">
                                            <DropdownMenuItem asChild>
                                                <ImageToggle mode={mode} onToggle={setMode} />
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* Voice Input */}
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
                                                {isRecording ? (
                                                    <MicOff className="h-4 w-4 animate-pulse" />
                                                ) : (
                                                    <Mic className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isRecording ? "Stop recording" : "Voice input"}
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Mode Badge */}
                                    {mode === "image" && (
                                        <span className="ml-1 inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                            <ImageIcon className="h-2.5 w-2.5" />
                                            Image
                                        </span>
                                    )}
                                </div>

                                {/* Send Button */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={is_processing}
                                            className={cn(
                                                "h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all",
                                                is_processing && "opacity-80"
                                            )}
                                        >
                                            {is_processing ? (
                                                <Square className="h-3.5 w-3.5" />
                                            ) : (
                                                <SendHorizonal className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {is_processing ? "Processing…" : "Send (Enter)"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Footer Info */}
                            {/* <div className="px-4 pb-2 pt-1">
                                <p className="text-[10px] text-muted-foreground text-center">
                                    {mode === "text"
                                        ? "AI can make mistakes. Verify important information."
                                        : "Daily limit: 5 images"}
                                </p>
                            </div> */}
                        </div>

                        {/* Hidden File Input */}
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

            {/* Canvas Editor Modal */}
            {showCanvasEditor && (
                <CanvasEditor
                    onClose={() => setShowCanvasEditor(false)}
                    onSaveAsFile={handleSaveCanvas}
                />
            )}
        </TooltipProvider>
    )
}
