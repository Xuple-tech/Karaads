import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Ad {
    id: string;
    title: string;
    description: string;
    image: string;
    video?: string;
    media_type: 'image' | 'video';
    advertiser?: string;
    cta_text?: string;
}

interface ShortVideoAdProps {
    ad: Ad;
    isActive: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
    variant?: 'card' | 'fullscreen';
}

export function ShortVideoAd({
    ad,
    isActive,
    isMuted,
    onToggleMute,
    variant = 'card',
}: ShortVideoAdProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => undefined);
        } else {
            videoRef.current?.pause();
        }
    }, [isActive]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const isFullscreen = variant === 'fullscreen';

    return (
        <div
            className={`karads-mobile relative w-full snap-start bg-[#0b0e13] flex items-center justify-center ${
                isFullscreen ? 'h-screen' : ''
            }`}
        >
            <div
                className={`${
                    isFullscreen
                        ? 'w-full h-full lg:max-w-[480px] xl:max-w-[520px] lg:px-4 lg:py-6'
                        : 'w-full px-4 pt-4 pb-6 lg:max-w-[760px] lg:px-6 lg:mx-auto'
                }`}
            >
                <div
                    className={`relative w-full overflow-hidden bg-[#11141a] ${
                        isFullscreen
                            ? 'h-full rounded-none shadow-none lg:rounded-[32px] lg:border lg:border-white/10 lg:shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
                            : 'h-[68vh] rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.45)]'
                    }`}
                >
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                        {ad.media_type === 'video' ? (
                            <video
                                ref={videoRef}
                                src={ad.video || ad.image}
                                className="h-full w-full object-cover"
                                loop
                                playsInline
                                muted={isMuted}
                            />
                        ) : (
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>

            {/* Sponsored Badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                        {/* <Sparkles className="w-3 h-3 text-yellow-400" /> */}
                        <span className="text-xs font-bold text-white uppercase tracking-wide">Sponsored</span>
                    </div>

            {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pb-20">
                        <div className="max-w-[100%] space-y-2">
                            <h3 className="karads-heading text-xl font-semibold text-white">
                                {ad.title}
                            </h3>
                    
                    <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
                        {ad.description}
                    </p>

                    {ad.advertiser && (
                        <p className="text-xs font-medium text-white/70">
                            Promoted by {ad.advertiser}
                        </p>
                    )}

                    <Button 
                        className="mx-auto mt-4 w-full bg-white text-[#0b0e13] font-semibold hover:bg-white/90"
                        // onClick={() => console.log('Ad clicked')}
                    >
                        {ad.cta_text || 'Learn More'} <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                        </div>
                    </div>

            {/* Mute Control */}
                    <div className="absolute top-4 right-4 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute();
                    }}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
