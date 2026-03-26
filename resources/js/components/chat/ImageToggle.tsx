import { ImageIcon } from 'lucide-react'

interface ImageToggleProps {
    mode: 'text' | 'image'
    onToggle: (mode: 'text' | 'image') => void
}

export default function ImageToggle({ mode, onToggle }: ImageToggleProps) {
    const isImageMode = mode === 'image'
    
    return (
        <button
            type="button"
            onClick={() => onToggle(isImageMode ? 'text' : 'image')}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
        >
            <ImageIcon className="h-4 w-4" />
            <span>Generate Image</span>
            {isImageMode && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    Active
                </span>
            )}
        </button>
    )
}
