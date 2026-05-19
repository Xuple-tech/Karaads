import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { downloadImageWithKwatiWatermark, getKwatiWatermarkLogoUrl } from '@/lib/image-watermark';

interface ImageGeneratorProps {
    className?: string;
}

export default function ImageGenerator({ className = '' }: ImageGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/image-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    toast.error('Please verify your email address to generate images');
                } else if (response.status === 429) {
                    toast.error('Daily image generation limit reached. Please try again tomorrow.');
                } else {
                    throw new Error(data.error || 'Failed to generate image');
                }
                return;
            }

            if (data.success) {
                setGeneratedImage(data.image_urls[0]); // Assuming the first image
                setRemainingGenerations(data.remaining_generations);
                toast.success(`${data.remaining_generations} generations remaining today`);
            }
        } catch (error) {
            toast.error('An error occurred while generating the image');
            console.error('Image generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        void (async () => {
            try {
                await downloadImageWithKwatiWatermark(
                    generatedImage,
                    `kwati-image-${Date.now()}`,
                );
            } catch (error) {
                window.open(generatedImage, '_blank');
            }
        })();
    };

    return (
        <div className={`p-4 ${className}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-200 mb-2">
                        Image Prompt
                    </label>
                    <Input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        disabled={loading}
                        className="w-full"
                    />
                </div>

                {remainingGenerations !== null && (
                    <p className="text-sm text-gray-400">
                        {remainingGenerations} generations remaining today
                    </p>
                )}

                <Button type="submit" disabled={loading || !prompt.trim()}>
                    {loading ? 'Generating...' : 'Generate Image'}
                </Button>
            </form>

            {generatedImage && (
                <div className="mt-6">
                    <div className="relative inline-block max-w-full">
                        <img
                            src={generatedImage}
                            alt="Generated"
                            className="rounded-lg shadow-lg max-w-full"
                        />
                        <img
                            src={getKwatiWatermarkLogoUrl()}
                            alt="Kwati AI watermark"
                            className="pointer-events-none absolute bottom-4 right-4 w-24 max-w-[28%] opacity-90 drop-shadow-md"
                        />
                    </div>
                    <div className="mt-3">
                        <Button type="button" variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Image
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
