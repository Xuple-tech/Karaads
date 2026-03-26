import type React from "react"
import { FileUp, Mic, MicOff, SendHorizonal, Square, X, PenTool, Image as ImageIcon, FileText, File, Plus, Paperclip, Settings2Icon } from "lucide-react"
import { type FormEvent, type KeyboardEvent, type RefObject, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { SidebarContextProvider } from "../ui/sidebar"
import { useLang } from "@/hooks/use-lang"
import ImageToggle from "./ImageToggle"
import CanvasEditor from "./CanvasEditor"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
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
        if (e.target.files && e.target.files.length > 0) {
            const allFiles = Array.from(e.target.files)
            let validFiles = allFiles.filter(file =>
                file.type.startsWith('image/') ||
                file.type.startsWith('text/') ||
                file.type === 'application/vnd.ms-excel' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            const invalidTypeCount = allFiles.length - validFiles.length
            const maxSize = 30 * 1024 * 1024
            const oversizedFiles = validFiles.filter(file => file.size > maxSize)
            validFiles = validFiles.filter(file => file.size <= maxSize)

            const skippedCount = invalidTypeCount + oversizedFiles.length
            if (skippedCount > 0) {
                let errorMsg = ''
                if (invalidTypeCount > 0) errorMsg += `${invalidTypeCount} unsupported file(s) skipped. `
                if (oversizedFiles.length > 0) errorMsg += `${oversizedFiles.length} file(s) too large (max 30MB each).`
                toast.error(errorMsg)
            }

            if (validFiles.length > 0) {
                setFiles((prev) => {
                    const newTotal = prev.length + validFiles.length
                    if (newTotal > 10) {
                        const toAdd = validFiles.slice(0, 10 - prev.length)
                        toast.success(`${toAdd.length} file(s) selected (max 10 files)`)
                        return [...prev, ...toAdd]
                    } else {
                        toast.success(`${validFiles.length} file(s) selected`)
                        return [...prev, ...validFiles]
                    }
                })
            }
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const allFiles = Array.from(e.dataTransfer.files)
            let validFiles = allFiles.filter(file =>
                file.type.startsWith('image/') ||
                file.type.startsWith('text/') ||
                file.type === 'application/vnd.ms-excel' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            const invalidTypeCount = allFiles.length - validFiles.length
            const maxSize = 30 * 1024 * 1024
            const oversizedFiles = validFiles.filter(file => file.size > maxSize)
            validFiles = validFiles.filter(file => file.size <= maxSize)

            const skippedCount = invalidTypeCount + oversizedFiles.length
            if (skippedCount > 0) {
                let errorMsg = ''
                if (invalidTypeCount > 0) errorMsg += `${invalidTypeCount} unsupported file(s) skipped. `
                if (oversizedFiles.length > 0) errorMsg += `${oversizedFiles.length} file(s) too large (max 30MB each).`
                toast.error(errorMsg)
            }

            if (validFiles.length > 0) {
                setFiles((prev) => {
                    const newTotal = prev.length + validFiles.length
                    if (newTotal > 10) {
                        const toAdd = validFiles.slice(0, 10 - prev.length)
                        toast.success(`${toAdd.length} file(s) dropped (max 10 files)`)
                        return [...prev, ...toAdd]
                    } else {
                        toast.success(`${validFiles.length} file(s) dropped`)
                        return [...prev, ...validFiles]
                    }
                })
            }
        }
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
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

    const getFilePreview = (file: File, index: number) => {
        const isImage = file.type.startsWith("image/")

        return (
            <div
                key={index}
                className="relative group bg-muted/50 hover:bg-muted border border-border rounded-lg p-2 flex items-center gap-2 transition-all duration-200"
            >
                {isImage ? (
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                    </p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                >
                    <X className="h-3 w-3" />
                </Button>
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
                            <div className="absolute inset-0 -top-20 bg-primary/5 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="text-center">
                                    <FileUp className="h-12 w-12 text-primary mx-auto mb-2" />
                                    <p className="text-sm font-medium">Drop files to upload</p>
                                </div>
                            </div>
                        )}

                        {/* File Previews */}
                        {files.length > 0 && (
                            <div className="mb-3 bg-card border border-border rounded-xl p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        Attached Files
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        {files.length}/10
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {files.map((file, index) => getFilePreview(file, index))}
                                </div>
                            </div>
                        )}

                        {/* Main Input Container */}
                        <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    onChange={handleInputChange}
                                    placeholder={
                                        mode === "text"
                                            ? "Ask anything..."
                                            : "Describe the image you want to generate..."
                                    }
                                    className="w-full resize-none bg-transparent px-4 pt-4 pb-3 text-sm focus:outline-none custom-scrollbar max-h-40 overflow-y-auto"
                                    rows={1}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    disabled={is_processing}
                                />
                            </div>

                            {/* Controls Bar */}
                            <div className="flex items-center justify-between px-3 pb-1 pt-1 border-t border-border/50">
                                <div className="flex items-center gap-1">
                                    {/* Attachment Menu */}
                                    <DropdownMenu>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 relative"
                                                    >
                                                        <Settings2Icon className="h-4 w-4" />
                                                        {files.length > 0 && (
                                                            <Badge
                                                                variant="destructive"
                                                                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                                                            >
                                                                {files.length}
                                                            </Badge>
                                                        )}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>Tools</TooltipContent>
                                        </Tooltip>
                                        <DropdownMenuContent align="start" className="w-48">
                                            <DropdownMenuItem onClick={triggerFileInput}>
                                                <FileUp className="h-4 w-4 mr-2" />
                                                Upload Files
                                            </DropdownMenuItem>
                                            {/* <DropdownMenuItem onClick={() => setShowCanvasEditor(true)}>
                                                <PenTool className="h-4 w-4 mr-2" />
                                                Canvas Editor
                                            </DropdownMenuItem> */}
                                            <DropdownMenuSeparator />
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
                                                variant={isRecording ? "default" : "ghost"}
                                                size="icon"
                                                onClick={toggleRecording}
                                                className={cn(
                                                    "h-9 w-9",
                                                    isRecording && "bg-destructive hover:bg-destructive/90"
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
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                            <ImageIcon className="h-3 w-3 mr-1" />
                                            Image Mode
                                        </Badge>
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
                                                "h-9 w-9 rounded-lg transition-all",
                                                is_processing && "animate-pulse"
                                            )}
                                        >
                                            {is_processing ? (
                                                <Square className="h-4 w-4" />
                                            ) : (
                                                <SendHorizonal className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {is_processing ? "Processing..." : "Send message"}
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
                            accept="image/*,text/*,.xlsx,.xls"
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
