// resources/js/contexts/PodcastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PodcastEpisode {
  id: number;
  title: string;
  topic: string;
  script: string;
  audio_url: string;
  duration: number;
  genre: string;
  format: string;
  voice: string;
  created_at: string;
  metadata: any;
}

interface PodcastContextType {
  currentEpisode: PodcastEpisode | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  setCurrentEpisode: (episode: PodcastEpisode | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  playEpisode: (episode: PodcastEpisode) => void;
  pauseEpisode: () => void;
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);

  const playEpisode = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
  };

  const pauseEpisode = () => {
    setIsPlaying(false);
  };

  return (
    <PodcastContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        volume,
        progress,
        setCurrentEpisode,
        setIsPlaying,
        setVolume,
        setProgress,
        playEpisode,
        pauseEpisode,
      }}
    >
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcast = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcast must be used within PodcastProvider');
  }
  return context;
};
