// resources/js/components/Podcast/PodcastPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Share2,
  Heart,
  Repeat,
  ExternalLink,
} from 'lucide-react';

interface PodcastPlayerProps {
  audioUrl: string;
  title?: string;
  showDownload?: boolean;
  showShare?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function PodcastPlayer({
  audioUrl,
  title = 'Podcast Episode',
  showDownload = true,
  showShare = true,
  className = '',
  onPlay,
  onPause,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [loop, setLoop] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (loop) {
        audio.currentTime = 0;
        audio.play();
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [loop, onPlay, onPause]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error('Error playing audio:', e);
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <Card className={`border-2 shadow-lg ${className}`}>
      <CardContent className="p-6">
        {/* Hidden audio element */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" loop={loop} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg truncate">{title}</h3>
              <p className="text-sm text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLiked(!isLiked)}
              className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            {showDownload && (
              <Button variant="ghost" size="icon" asChild>
                <a href={audioUrl.replace('/stream', '/download')} download>
                  <Download className="h-5 w-5" />
                </a>
              </Button>
            )}
            {showShare && (
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(duration - currentTime)}</span>
          </div>
          <Slider
            value={[currentTime]}
            onValueChange={handleSeek}
            max={duration}
            step={1}
            disabled={loading}
            className="cursor-pointer"
          />
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLoop(!loop)}
              className={`${loop ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <Repeat className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={skipBackward}>
              <SkipBack className="h-6 w-6" />
            </Button>
          </div>

          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={togglePlay}
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={skipForward}>
              <SkipForward className="h-6 w-6" />
            </Button>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={isMuted ? 'text-gray-500' : 'text-blue-500'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                <div className="bg-gray-900 text-white p-2 rounded-lg shadow-xl">
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    orientation="vertical"
                    className="h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Speed:</span>
            <div className="flex gap-1">
              {playbackSpeeds.map((speed) => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setPlaybackSpeed(speed)}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {audioUrl.includes('openai') ? 'OpenAI TTS' : 'Custom Audio'}
          </Badge>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-4 space-y-2">
            <Progress value={30} className="h-1" />
            <p className="text-sm text-center text-gray-500">Loading podcast audio...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
