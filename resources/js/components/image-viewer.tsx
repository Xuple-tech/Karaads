import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Share, Info } from 'lucide-react'
import type { Image } from "@/types/image"
import { downloadImageWithKwatiWatermark, getKwatiWatermarkLogoUrl } from '@/lib/image-watermark'

interface ImageViewerModalProps {
  images: Image[]
  currentImageIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function ImageViewerModal({
  images,
  currentImageIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageViewerModalProps) {
  const [zoom, setZoom] = useState(1)
  const [showInfo, setShowInfo] = useState(true)
  const currentImage = images[currentImageIndex]

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1)
  }, [currentImageIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
        case "Escape":
          onClose()
          break
        case "+":
          handleZoomIn()
          break
        case "-":
          handleZoomOut()
          break
        case "i":
          setShowInfo(prev => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentImageIndex, images.length])

  const handlePrevious = () => {
    if (currentImageIndex > 0) {
      onNavigate(currentImageIndex - 1)
    } else {
      // Loop to the end
      onNavigate(images.length - 1)
    }
  }

  const handleNext = () => {
    if (currentImageIndex < images.length - 1) {
      onNavigate(currentImageIndex + 1)
    } else {
      // Loop to the beginning
      onNavigate(0)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = () => {
    if (!currentImage) return
    void (async () => {
      try {
        await downloadImageWithKwatiWatermark(
          currentImage.image_url,
          `kwati-image-${currentImage.id}`,
        )
      } catch {
        window.open(currentImage.image_url, "_blank")
      }
    })()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!currentImage) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-black/95 backdrop-blur-xl overflow-hidden">
        {/* Close button */}
        <Button
          onClick={onClose}
          size="icon"
          variant="ghost"
          className="absolute right-4 top-4 z-50 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Navigation buttons */}
        <Button
          onClick={handlePrevious}
          size="icon"
          variant="ghost"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full h-12 w-12"
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        <Button
          onClick={handleNext}
          size="icon"
          variant="ghost"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full h-12 w-12"
        >
          <ChevronRight className="h-8 w-8" />
        </Button>

        {/* Image container */}
        <div className="flex items-center justify-center h-full w-full overflow-hidden">
          <div
            className="relative transition-transform duration-200 ease-out cursor-move"
            style={{
              transform: `scale(${zoom})`,
              maxHeight: "85vh",
              maxWidth: "100%"
            }}
          >
            <img
              src={currentImage.image_url || "/placeholder.svg"}
              alt={currentImage.prompt}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <img
              src={getKwatiWatermarkLogoUrl()}
              alt="Kwati AI watermark"
              className="pointer-events-none absolute bottom-4 right-4 w-24 max-w-[28%] opacity-90 drop-shadow-md"
            />
          </div>
        </div>

        {/* Controls bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col">
          {/* Image info */}
          {showInfo && (
            <div className="mb-4 text-white animate-fadeIn">
              <h3 className="text-lg font-medium mb-1">{currentImage.prompt}</h3>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Badge variant="outline" className="bg-white/10 border-0">
                  {formatDate(currentImage.created_at)}
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-0">
                  ID: {currentImage.id}
                </Badge>
                <Badge variant="outline" className="bg-white/10 border-0">
                  {currentImageIndex + 1} of {images.length}
                </Badge>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowInfo(prev => !prev)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Info className="h-4 w-4 mr-1" />
                {showInfo ? "Hide Info" : "Show Info"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleZoomOut}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="text-white text-sm w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>

              <Button
                onClick={handleZoomIn}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleDownload}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
