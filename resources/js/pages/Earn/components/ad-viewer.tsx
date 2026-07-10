import axiosInstance from '@/lib/axios';
import { AdRender } from '@/components/ads/ad-render';
import { Button } from '@/components/ui/button';
import { getRewardedClientId } from '@/lib/rewarded-client';
import { getSafeMediaUrl } from '@/lib/url-guard';
import { X, Coins, CheckCircle, Play, Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Ad {
    delivery_id: string;
    signature: string;
    title: string;
    media_url: string;
    media_type?: string;
    description: string;
    ad_type: string;
    reward?: number;
}

interface AdViewerProps {
    ad: Ad;
    onComplete: (
        payload?: { earnings?: unknown; wallet?: unknown },
        options?: { watchNext?: boolean },
    ) => void;
    onClose: () => void;
    minDuration?: number;
    formatCurrency?: (amount: number) => string;
}

export function AdViewer({
    ad,
    onComplete,
    onClose,
    minDuration = 30,
    formatCurrency: formatCurrencyProp,
}: AdViewerProps) {
    const rewardedClientId = getRewardedClientId();
    const [viewDuration, setViewDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showCompletion, setShowCompletion] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completionError, setCompletionError] = useState<string | null>(null);
    const [completionPayload, setCompletionPayload] = useState<{ earnings?: unknown; wallet?: unknown } | null>(null);
    const [completionHandled, setCompletionHandled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const completionSentRef = useRef(false);
    const safeMediaUrl = getSafeMediaUrl(ad.media_url) || '';
    const isVideoAd = ad.media_type === 'video' || safeMediaUrl.toLowerCase().endsWith('.mp4');
    const mediaUnavailable = safeMediaUrl.length === 0;

    const resolveCompletionErrorMessage = (error: any): string => {
        const reason = error?.response?.data?.reason;
        if (reason === 'active_session_conflict') {
            return 'This account is already watching rewarded ads in another tab or device. Close the other session and retry.';
        }
        if (reason === 'session_mismatch' || reason === 'fingerprint_mismatch') {
            return 'This ad was started from a different session/device. Refresh your ad queue and try again.';
        }

        return (
            error?.response?.data?.message ||
            'Could not credit this ad reward right now. Please try another ad.'
        );
    };

    // Format currency
    const formatCurrency = formatCurrencyProp ?? ((amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    });

    useEffect(() => {
        setViewDuration(0);
        setProgress(0);
        setShowCompletion(false);
        setIsSubmitting(false);
        setCompletionError(null);
        setCompletionPayload(null);
        setCompletionHandled(false);
        completionSentRef.current = false;
        setIsPlaying(!isVideoAd);
    }, [ad.delivery_id, isVideoAd]);

    useEffect(() => {
        if (showCompletion) {
            return;
        }
        if (mediaUnavailable) {
            return;
        }
        if (isVideoAd && !isPlaying) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setViewDuration((prev) => {
                const newDuration = prev + 1;
                const newProgress = (newDuration / minDuration) * 100;
                setProgress(newProgress);
                
                // Show completion if time is up
                if (newDuration >= minDuration && !showCompletion) {
                    setShowCompletion(true);
                }
                
                return newDuration;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, isVideoAd, mediaUnavailable, minDuration, showCompletion]);

    const handleComplete = async () => {
        if (mediaUnavailable || viewDuration < minDuration || completionSentRef.current || isSubmitting) {
            return;
        }
        completionSentRef.current = true;
        setIsSubmitting(true);
        setCompletionError(null);

        try {
            const { data } = await axiosInstance.post(
                `/api/v2/rewarded/${ad.delivery_id}/complete`,
                {
                    view_duration: viewDuration,
                    signature: ad.signature,
                    meta: {
                        completed: viewDuration >= minDuration,
                    },
                },
                {
                    headers: {
                        'X-Rewarded-Client-Id': rewardedClientId,
                    },
                },
            );
            setCompletionPayload({ earnings: data?.earnings, wallet: data?.wallet });
        } catch (error: any) {
            completionSentRef.current = true;
            setCompletionError(resolveCompletionErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const remainingSeconds = Math.max(0, minDuration - viewDuration);
    const handleCompletionChoice = (watchNext: boolean) => {
        if (completionHandled) {
            return;
        }
        setCompletionHandled(true);
        onComplete(completionPayload ?? undefined, { watchNext });
    };

    const handleCloseRequest = () => {
        if (completionPayload && !completionError) {
            handleCompletionChoice(false);
            return;
        }
        if (!showCompletion && !mediaUnavailable && !completionError && viewDuration < minDuration) {
            const shouldClose = window.confirm(
                'Cancel this ad now? You will not earn reward for this view.',
            );
            if (!shouldClose) {
                return;
            }
        }
        onClose();
    };

    useEffect(() => {
        if (!showCompletion && !completionError && viewDuration >= minDuration) {
            setShowCompletion(true);
        }
    }, [completionError, minDuration, showCompletion, viewDuration]);

    useEffect(() => {
        if (showCompletion && !completionError && !completionSentRef.current) {
            void handleComplete();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completionError, showCompletion]);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-black">
            {/* Success Overlay */}
            {viewDuration >= minDuration && showCompletion && !completionError && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-2xl">
                            <CheckCircle className="h-16 w-16 text-green-500" fill="currentColor" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Ad Completed!</h3>
                            <div className="flex items-center justify-center gap-2">
                                <Coins className="h-6 w-6 text-yellow-400" />
                                <p className="text-3xl font-bold text-white">
                                    +{formatCurrency(ad.reward || 0)}
                                </p>
                            </div>
                            <p className="text-white/80">Earnings added to your balance</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Viewer */}
            <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
                {/* Header */}
                <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/50 text-white hover:bg-black/70 h-10 w-10"
                        onClick={handleCloseRequest}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                            <div className="flex items-center gap-1 text-sm font-semibold text-white">
                                <Coins className="h-3.5 w-3.5 text-yellow-400" />
                                <span className="text-yellow-400">
                                    +{formatCurrency(ad.reward || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video/Image Content */}
                <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+15.5rem)] top-[calc(env(safe-area-inset-top)+4.5rem)] flex items-center justify-center overflow-hidden px-2 sm:bottom-[13rem] sm:px-6">
                    {mediaUnavailable ? (
                        <div className="flex h-full w-full items-center justify-center bg-black px-6 text-center text-white/80">
                            <div>
                                <h3 className="text-lg font-semibold">Ad media unavailable</h3>
                                <p className="mt-2 text-sm text-white/65">
                                    This ad cannot be played right now. Close and try the next one.
                                </p>
                            </div>
                        </div>
                    ) : isVideoAd ? (
                        <>
                            <video
                                ref={videoRef}
                                src={safeMediaUrl}
                                autoPlay
                                muted={false}
                                playsInline
                                disablePictureInPicture
                                controlsList="nodownload noplaybackrate noremoteplayback"
                                controls={false}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => {
                                    if (viewDuration < minDuration) {
                                        setViewDuration(minDuration);
                                        setProgress(100);
                                        setShowCompletion(true);
                                    }
                                }}
                                className="max-h-full max-w-full object-contain"
                            />
                            
                            {/* Play/Pause Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-16 w-16 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70"
                                    onClick={togglePlayPause}
                                >
                                    {isPlaying ? (
                                        <Pause className="h-8 w-8 text-white" fill="white" />
                                    ) : (
                                        <Play className="h-8 w-8 text-white" fill="white" />
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <AdRender
                            renderMode="internal_asset"
                            mediaUrl={safeMediaUrl}
                            mediaType={ad.media_type}
                            title={ad.title}
                            className="max-h-full max-w-full object-contain"
                        />
                    )}
                </div>

                {/* Progress Bar - Fixed at bottom */}
                {!mediaUnavailable ? (
                    <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+13.5rem)] left-0 right-0 z-20 px-4 sm:bottom-[11.5rem]">
                        <div className="space-y-2">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-black/50">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-white">
                                <span className="font-medium">
                                    {Math.floor(viewDuration)}s / {minDuration}s
                                </span>
                                <span className={`font-semibold ${viewDuration >= minDuration ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {viewDuration >= minDuration ? 'Completing...' : 'Watching...'}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Actions Panel - Fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-30 max-h-[50dvh] overflow-y-auto bg-gradient-to-t from-black/95 via-black/85 to-transparent p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-8">
                    <div className="space-y-4">
                        <div className="text-white">
                            <h3 className="text-lg font-bold line-clamp-1">{ad.title}</h3>
                            <p className="text-sm text-gray-300 line-clamp-2">
                                {ad.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div
                                className={`flex h-12 items-center justify-center rounded-xl text-sm font-semibold ${
                                    completionError
                                        ? 'bg-amber-700/80 text-amber-100'
                                        : showCompletion
                                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                                        : 'bg-gray-600 text-white'
                                }`}
                            >
                                {completionError ? (
                                    <>
                                        <X className="mr-2 h-4 w-4" />
                                        Reward not credited
                                    </>
                                ) : showCompletion ? (
                                    <>
                                        <Coins className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Crediting balance...' : 'Choose what to do next'}
                                    </>
                                ) : (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        {mediaUnavailable ? 'Unavailable' : `${remainingSeconds}s remaining`}
                                    </>
                                )}
                            </div>

                            {completionPayload && !completionError ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        className="h-11 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                                        onClick={() => handleCompletionChoice(true)}
                                        disabled={completionHandled}
                                    >
                                        Watch next ad
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-11 border-white/25 bg-black/30 text-white hover:bg-black/45"
                                        onClick={() => handleCompletionChoice(false)}
                                        disabled={completionHandled}
                                    >
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 border-white/25 bg-black/30 text-white hover:bg-black/45"
                                    onClick={handleCloseRequest}
                                >
                                    {showCompletion ? 'Close' : 'Cancel'}
                                </Button>
                            )}
                        </div>

                        {!showCompletion && !mediaUnavailable && !completionError ? (
                            <p className="text-center text-xs text-white/80">
                                Fullscreen is locked until 30s is completed.
                            </p>
                        ) : null}

                        {completionError ? (
                            <p className="text-center text-xs text-amber-300">
                                {completionError}
                            </p>
                        ) : null}
                        
                        {/* Ad Type Badge */}
                        <div className="flex justify-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 text-xs text-white/80 backdrop-blur-sm border border-white/20">
                                {ad.ad_type} - {ad.reward ? formatCurrency(ad.reward) : formatCurrency(0)} reward
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer Overlay */}
            {!showCompletion && !mediaUnavailable ? (
                <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 transform sm:top-1/2">
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (progress * 283) / 100}
                                transform="rotate(-90 50 50)"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-xl font-bold text-white sm:text-2xl">
                                {remainingSeconds}
                            </span>
                            <p className="text-xs text-white/60">seconds</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
