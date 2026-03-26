"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Head, Link, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Mic, Square, Settings, MessageSquare, X, Loader2, Zap, Home } from "lucide-react"
import toast from "react-hot-toast"
import AppLayout from "@/layouts/app-layout"
import { cn } from "@/lib/utils"

interface VoiceMessage {
  id: number
  speaker: "user" | "ai"
  content: string
  duration: number
  audio_url?: string
  created_at: string
}

interface VoiceSettings {
  language: string
  voice: string
  speed: number
  autoSend: boolean
  silenceThreshold: number
  outputVolume: number
}

interface VoiceConversationProps {
  conversation: {
    id: string
    title: string
    language?: string
    voice_settings?: any
  }
  messages: Array<{
    id: number
    content: string
    role: string
    type: string
    is_voice: boolean
    audio_path?: string
    audio_duration?: number
    created_at: string
  }>
  availableVoices: {
    [key: string]: Array<{
      id: string
      name: string
      gender: string
    }>
  }
}

const useLocalStorage = <T,>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      try {
        const valueToStore = newValue instanceof Function ? newValue(value) : newValue
        setValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, value],
  )

  return [value, setStoredValue] as const
}

const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [silenceCounter, setSilenceCounter] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async (onSilence: () => void, silenceThreshold: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream
      audioChunksRef.current = []

      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setRecordingDuration(0)
      setSilenceCounter(0)

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)

      const monitorAudio = () => {
        if (!analyserRef.current) return
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const normalizedLevel = Math.min(100, (average / 255) * 100)
        setAudioLevel(normalizedLevel)

        const SILENCE_THRESHOLD = 5
        if (normalizedLevel < SILENCE_THRESHOLD) {
          setSilenceCounter((prev) => {
            const newCount = prev + 0.1
            if (newCount >= silenceThreshold && audioChunksRef.current.length > 0) {
              onSilence()
              return 0
            }
            return newCount
          })
        } else {
          setSilenceCounter(0)
        }

        animationFrameRef.current = requestAnimationFrame(monitorAudio)
      }
      monitorAudio()
    } catch (error) {
      console.error("Error starting recording:", error)
      throw error
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      analyserRef.current = null
      setAudioLevel(0)
      setSilenceCounter(0)
    }
    return {
      audioBlob: new Blob(audioChunksRef.current, { type: "audio/webm" }),
      duration: recordingDuration,
    }
  }, [isRecording, recordingDuration])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    isRecording,
    recordingDuration,
    audioLevel,
    silenceCounter,
    startRecording,
    stopRecording,
  }
}

const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio()
    const handleEnd = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const audio = audioRef.current

    audio.addEventListener("ended", handleEnd)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)

    return () => {
      audio.removeEventListener("ended", handleEnd)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.pause()
    }
  }, [])

  const play = useCallback((url: string, volume = 1) => {
    if (audioRef.current) {
      audioRef.current.src = url
      audioRef.current.volume = volume
      audioRef.current.play().catch(console.error)
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  return { isPlaying, play, stop }
}

export default function VoiceConversation({
  conversation,
  messages: initialMessages,
  availableVoices: propVoices,
}: VoiceConversationProps) {
  const voicesMap =
    Object.keys(propVoices).length > 0
      ? propVoices
      : {
          en: [
            { id: "alloy", name: "Alloy", gender: "Neutral" },
            { id: "echo", name: "Echo", gender: "Neutral" },
            { id: "fable", name: "Fable", gender: "Neutral" },
            { id: "onyx", name: "Onyx", gender: "Neutral" },
            { id: "nova", name: "Nova", gender: "Neutral" },
            { id: "shimmer", name: "Shimmer", gender: "Neutral" },
          ],
        }

  const [settings, setSettings] = useLocalStorage<VoiceSettings>("voice-settings", {
    language: conversation.language || "en",
    voice: conversation.voice_settings?.voice || "alloy",
    speed: conversation.voice_settings?.speed || 1.0,
    autoSend: true,
    silenceThreshold: 2.5,
    outputVolume: 0.8,
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [messages, setMessages] = useState<VoiceMessage[]>(
    initialMessages.map((msg) => ({
      id: msg.id,
      speaker: msg.role === "user" ? "user" : "ai",
      content: msg.content,
      duration: msg.audio_duration || 0,
      audio_url: msg.audio_path ? `/api/voice/audio/${msg.id}` : undefined,
      created_at: msg.created_at,
    })),
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isRecording, recordingDuration, audioLevel, silenceCounter, startRecording, stopRecording } =
    useAudioRecorder()
  const { isPlaying, play, stop } = useAudioPlayer()

  const voicesForLanguage = useMemo(() => voicesMap[settings.language] || [], [voicesMap, settings.language])

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const duration = messages.reduce((total, msg) => total + msg.duration, 0)
    setTotalDuration(duration)
  }, [messages])

  const handleSilenceDetection = useCallback(() => {
    if (settings.autoSend) {
      stopRecordingAndProcess()
    }
  }, [settings.autoSend])

  const stopRecordingAndProcess = useCallback(async () => {
    const { audioBlob, duration } = stopRecording()
    if (audioBlob.size === 0) {
      toast.error("No audio recorded. Please try again.")
      return
    }

    if (audioBlob.size > 25 * 1024 * 1024) {
      toast.error("Recording too large. Please record a shorter message.")
      return
    }

    setIsProcessing(true)
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
      if (!csrfToken) throw new Error("Security validation failed")

      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")
      formData.append("conversation_id", conversation.id)
      formData.append("duration", duration.toString())

      const tempUserMessage: VoiceMessage = {
        id: Date.now(),
        speaker: "user",
        content: "Processing...",
        duration,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMessage])

      const response = await fetch("/api/voice/process-audio", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data?.user_message && data.data?.ai_response) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMessage.id)
          const userMessage: VoiceMessage = {
            id: data.data.user_message.id,
            speaker: "user",
            content: data.data.user_message.content,
            duration: data.data.user_message.audio_duration,
            created_at: data.data.user_message.created_at,
          }
          const aiMessage: VoiceMessage = {
            id: data.data.ai_response.id,
            speaker: "ai",
            content: data.data.ai_response.content,
            duration: data.data.ai_response.audio_duration,
            audio_url: data.data.ai_response.audio_url,
            created_at: data.data.ai_response.created_at,
          }
          return [...withoutTemp, userMessage, aiMessage]
        })

        if (data.data.ai_response.audio_url) {
          play(data.data.ai_response.audio_url, settings.outputVolume)
        }
        toast.success("Audio processed successfully!")
      } else {
        throw new Error(data.message || "Failed to process audio")
      }
    } catch (error) {
      console.error("Error processing audio:", error)
      setMessages((prev) => prev.filter((m) => m.content !== "Processing..."))
      const errorMessage = error instanceof Error ? error.message : "Failed to process audio"
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [stopRecording, conversation.id, play, settings.outputVolume])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecordingAndProcess()
    } else {
      try {
        await startRecording(handleSilenceDetection, settings.silenceThreshold)
        toast.success(settings.autoSend ? "Recording... (Auto-send enabled)" : "Recording...", {
          duration: 2000,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        let userMessage = "Could not access microphone"
        if (errorMessage.includes("NotAllowedError")) {
          userMessage = "Permission denied. Please allow microphone access."
        } else if (errorMessage.includes("NotFoundError")) {
          userMessage = "No microphone found. Please connect one."
        } else if (errorMessage.includes("NotReadableError")) {
          userMessage = "Microphone is in use. Please close other apps."
        }
        toast.error(userMessage)
      }
    }
  }, [
    isRecording,
    startRecording,
    stopRecordingAndProcess,
    handleSilenceDetection,
    settings.silenceThreshold,
    settings.autoSend,
  ])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    toast.success(!isMuted ? "Microphone muted" : "Microphone active", {
      duration: 2000,
    })
  }, [isMuted])

  const toggleOutputMute = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      outputVolume: prev.outputVolume > 0 ? 0 : 0.8,
    }))
  }, [setSettings])

  const handleLanguageChange = useCallback(
    (language: string) => {
      const newVoices = voicesMap[language] || []
      const newVoice = newVoices[0]?.id || "alloy"
      setSettings((prev) => ({
        ...prev,
        language,
        voice: newVoice,
      }))
      toast.success(`Language changed to ${language.toUpperCase()}`, {
        duration: 2000,
      })
    },
    [voicesMap, setSettings],
  )

  const statusText = useMemo(() => {
    if (isRecording) return `Recording ${formatDuration(recordingDuration)}`
    if (isPlaying) return "Playing response"
    if (isProcessing) return "Processing audio..."
    return "Ready to record"
  }, [isRecording, isPlaying, isProcessing, recordingDuration, formatDuration])

  return (
    <>
      <Head title={`Voice Conversation - ${conversation.title}`} />
      <div className="min-h-screen bg-slate-950 overflow-hidden relative">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-radial from-cyan-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-gradient-radial from-blue-600/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Header - Settings */}
        <div className=" z-10 border-b sticky top-0 border-slate-800/50 bg-slate-950/50 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex justify-between">
            <Button asChild>
                <Link href='/new' preload>
                    <Home />
                    Home
                </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="max-w-lg w-full flex flex-col items-center space-y-12">
            {/* Title */}

            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer glow ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-300",
                  isRecording && "animate-pulse",
                  isRecording
                    ? "bg-gradient-to-br from-cyan-400 to-blue-600"
                    : "bg-gradient-to-br from-cyan-500/40 to-blue-600/40",
                )}
              />

              {/* Main orb with gradient */}
              <div
                className={cn(
                  "absolute inset-2 rounded-full transition-all duration-300",
                  "bg-gradient-to-br from-cyan-300 via-blue-500 to-slate-900",
                  "shadow-2xl shadow-cyan-500/50",
                  isRecording && "shadow-cyan-400/70",
                  isProcessing && "opacity-80",
                )}
              >
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-300/20 to-transparent animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                {isProcessing ? (
                  <Loader2 className="h-16 w-16 animate-spin text-white/80" />
                ) : (
                  <Mic
                    className={cn(
                      "h-16 w-16 transition-colors duration-300",
                      isRecording ? "text-white" : "text-white/70",
                    )}
                  />
                )}
              </div>

              {/* Audio level bars - radial */}
              {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 bg-gradient-to-t from-cyan-400 to-cyan-200 rounded-full origin-bottom transition-all duration-100"
                      style={{
                        height: `${20 + (audioLevel / 100) * 30}px`,
                        transform: `rotate(${(i / 12) * 360}deg) translateY(-60px)`,
                        opacity: 0.6 + (audioLevel / 100) * 0.4,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <p className="text-2xl font-medium text-white text-pretty">
                {isRecording
                  ? `I'm listening${isRecording ? "..." : ""}`
                  : isPlaying
                    ? "Playing response..."
                    : isProcessing
                      ? "Processing..."
                      : "What's on your mind?"}
              </p>
              {isRecording && settings.autoSend && (
                <p className="text-sm text-cyan-300 flex items-center justify-center gap-2">
                  <Zap className="h-3 w-3" />
                  Auto-send in {(settings.silenceThreshold - silenceCounter).toFixed(1)}s
                </p>
              )}
            </div>

            <div className="flex items-center gap-6">
              {/* Stop/Cancel button */}
              <Button
                onClick={() => {
                  if (isRecording) {
                    stopRecording()
                    setMessages((prev) => prev.filter((m) => m.content !== "Processing..."))
                    toast.success("Recording cancelled", { duration: 1500 })
                  }
                }}
                disabled={!isRecording && !isProcessing}
                className="h-14 w-14 rounded-full border-2 border-slate-600 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500 text-slate-300 transition-all"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Main microphone button */}
              <Button
                onClick={toggleRecording}
                disabled={isProcessing || isPlaying}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300 shadow-2xl",
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 border-2 border-red-500 text-white shadow-red-600/50"
                    : "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-2 border-cyan-400 text-white shadow-cyan-500/50",
                )}
              >
                {isRecording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-6 w-6" />}
              </Button>

              {/* Transcript button */}
              <Button
                onClick={() => router.get('/new')}
                className="h-14 w-14 rounded-full border-2 border-slate-600 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500 text-slate-300 transition-all"
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>

            {/* Duration badge */}
            {/* {totalDuration > 0 && (
              <Badge variant="secondary" className="font-mono bg-slate-800 text-cyan-300 border border-slate-700">
                Total: {formatDuration(totalDuration)}
              </Badge>
            )} */}
          </div>
        </div>

        {/* Transcript Sidebar */}
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-96 bg-slate-950/95 backdrop-blur-lg border-l border-slate-800/50 transform transition-transform duration-300 z-50 shadow-2xl",
            showTranscript ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
              <h2 className="font-semibold text-white">Conversation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTranscript(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">No messages yet</p>
                    <p className="text-slate-600 text-xs mt-1">Start recording to begin the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <Card
                      key={msg.id}
                      className={cn(
                        "p-4 border transition-colors",
                        msg.speaker === "user"
                          ? "bg-slate-800/50 border-cyan-500/30 ml-8"
                          : "bg-slate-800/30 border-blue-500/30 mr-8",
                        msg.content === "Processing..." && "opacity-60",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={cn("w-2 h-2 rounded-full", msg.speaker === "user" ? "bg-cyan-400" : "bg-blue-400")}
                        />
                        <p className="text-xs font-medium text-slate-300">{msg.speaker === "user" ? "You" : "AI"}</p>
                        <span className="text-xs text-slate-500">{formatDuration(msg.duration)}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200">{msg.content}</p>
                    </Card>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Voice Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Auto-send */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto-send on silence</Label>
                  <p className="text-sm text-slate-400">Automatically send after detecting silence</p>
                </div>
                <Switch
                  checked={settings.autoSend}
                  onCheckedChange={(checked) => {
                    setSettings((prev) => ({ ...prev, autoSend: checked }))
                    toast.success(checked ? "Auto-send enabled" : "Auto-send disabled", { duration: 2000 })
                  }}
                />
              </div>

              {/* Silence threshold */}
              {settings.autoSend && (
                <div className="space-y-3">
                  <Label className="text-white">Silence threshold: {settings.silenceThreshold.toFixed(1)}s</Label>
                  <Slider
                    value={[settings.silenceThreshold]}
                    onValueChange={([value]) => {
                      setSettings((prev) => ({ ...prev, silenceThreshold: value }))
                    }}
                    min={1.5}
                    max={5}
                    step={0.5}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1.5s</span>
                    <span>3.0s</span>
                    <span>5.0s</span>
                  </div>
                </div>
              )}

              {/* Output volume */}
              <div className="space-y-3">
                <Label className="text-white">Output volume: {Math.round(settings.outputVolume * 100)}%</Label>
                <Slider
                  value={[settings.outputVolume]}
                  onValueChange={([value]) => {
                    setSettings((prev) => ({ ...prev, outputVolume: value }))
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Mute</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="text-white">Language</Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Voice */}
              <div className="space-y-2">
                <Label className="text-white">Voice</Label>
                <Select
                  value={settings.voice}
                  onValueChange={(voice) => {
                    setSettings((prev) => ({ ...prev, voice }))
                    const voiceName = voicesForLanguage.find((v) => v.id === voice)?.name || voice
                    toast.success(`Voice changed to ${voiceName}`, { duration: 2000 })
                  }}
                >
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {voicesForLanguage.length > 0 ? (
                      voicesForLanguage.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled>No voices available for this language</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed */}
              <div className="space-y-3">
                <Label className="text-white">Speed: {settings.speed.toFixed(1)}x</Label>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([value]) => {
                    setSettings((prev) => ({ ...prev, speed: value }))
                  }}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
