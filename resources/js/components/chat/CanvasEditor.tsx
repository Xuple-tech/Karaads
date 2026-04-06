"use client"

import { useState, useRef } from "react"
import Editor from "@monaco-editor/react"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Bot, Lightbulb, X, Save, RotateCcw, Play, MessageSquare, Code, FileText, Download, File } from "lucide-react"
import toast from "react-hot-toast"

interface CanvasEditorProps {
  onClose: () => void
  onSaveAsFile: (content: string, language: string) => void
  initialContent?: string
  initialLanguage?: string
}

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
]

export default function CanvasEditor({
  onClose,
  onSaveAsFile,
  initialContent = "",
  initialLanguage = "plaintext",
}: CanvasEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [language, setLanguage] = useState(initialLanguage)
  const [versions, setVersions] = useState<string[]>([initialContent])
  const [currentVersion, setCurrentVersion] = useState(0)
  const [showChat, setShowChat] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatePrompt, setGeneratePrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleSave = () => {
    onSaveAsFile(content, language)
    onClose()
  }

  const handleCreateCheckpoint = () => {
    const newVersions = versions.slice(0, currentVersion + 1)
    newVersions.push(content)
    setVersions(newVersions)
    setCurrentVersion(newVersions.length - 1)
    toast.success("Checkpoint created")
  }

  const handleUndo = () => {
    if (currentVersion > 0) {
      setCurrentVersion(currentVersion - 1)
      setContent(versions[currentVersion - 1])
    }
  }

  const handleRedo = () => {
    if (currentVersion < versions.length - 1) {
      setCurrentVersion(currentVersion + 1)
      setContent(versions[currentVersion + 1])
    }
  }

  const handleExecute = () => {
    toast("For code execution, please use external tools like Replit or your local IDE", {
      icon: <Lightbulb className="h-4 w-4 text-yellow-400" />,
      duration: 5000,
    })
  }

  const handleAIEdit = () => {
    toast("AI editing feature coming soon! For now, ask in the main chat.", {
      icon: <Bot className="h-4 w-4 text-primary" />,
    })
  }

  const handleGenerate = async () => {
    if (!generatePrompt.trim()) return
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-canvas-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          prompt: generatePrompt,
          language,
          model: "grok-4",
        }),
      })
      const data = await response.json()
      if (data.success) {
        setContent(data.content)
        setShowGenerateModal(false)
        setGeneratePrompt("")
        toast.success("Content generated successfully")
      } else {
        toast.error(data.error || "Failed to generate content")
      }
    } catch (error) {
      toast.error("Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToWord = async () => {
    const { Document, Packer, Paragraph, TextRun } = await import("docx")
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: content.split("\n").map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line)],
              }),
          ),
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `canvas.${language === "markdown" ? "docx" : language === "plaintext" ? "docx" : "docx"}`
    a.click()
    toast.success("Exported to Word document")
  }

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF()
    const lines = pdf.splitTextToSize(content, 180)
    pdf.text(lines, 10, 10)
    pdf.save("canvas.pdf")
    toast.success("Exported to PDF")
  }

  const exportAsText = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `canvas.${language === "python" ? "py" : language === "javascript" ? "js" : language === "html" ? "html" : "txt"}`
    a.click()
    toast.success("Exported as text file")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex z-[9949]">
      <div className="bg-background flex-1 flex flex-col max-h-screen border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Canvas Editor</h2>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={handleCreateCheckpoint} title="Create checkpoint">
              <Save className="h-4 w-4" />
              <span className="sr-only">Checkpoint</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={currentVersion === 0} title="Undo">
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Undo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={currentVersion === versions.length - 1}
              title="Redo"
            >
              <RotateCcw className="h-4 w-4 rotate-180" />
              <span className="sr-only">Redo</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExecute} title="Run code">
              <Play className="h-4 w-4" />
              <span className="sr-only">Run</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowGenerateModal(true)} title="Generate with AI">
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">Generate</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={exportToWord} title="Export to Word">
              <File className="h-4 w-4" />
              <span className="sr-only">Word</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={exportToPDF} title="Export to PDF">
              <Download className="h-4 w-4" />
              <span className="sr-only">PDF</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={exportAsText} title="Export as text">
              <FileText className="h-4 w-4" />
              <span className="sr-only">Text</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)} title="Toggle chat panel">
              {showChat ? <Code className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
              <span className="sr-only">Chat</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close editor">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={content}
              onChange={(value) => setContent(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
              }}
              theme="vs-light"
            />
          </div>

          {showChat && (
            <div className="w-80 border-l border-border bg-muted/30 p-4 overflow-y-auto">
              <h3 className="font-semibold text-foreground mb-4">Conversation Context</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Chat history and AI suggestions will appear here.</p>
                <p>Currently, interact with AI in the main chat interface.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            Version {currentVersion + 1} of {versions.length}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm">
              Save as File
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Content with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              disabled={isGenerating}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGenerateModal(false)} disabled={isGenerating} size="sm">
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating || !generatePrompt.trim()} size="sm">
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
