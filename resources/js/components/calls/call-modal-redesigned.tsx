import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCall } from '@/contexts/call-context';
import type { CallPeerUser } from '@/contexts/call-context';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Link2,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Plus,
  Users,
  Video,
  VideoOff,
  UserX,
  User,
  Check,
  X,
  Clock,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { toast } from 'sonner';

function initials(value: string) {
  const trimmed = (value || '').trim();
  if (!trimmed) return 'U';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function resolveAvatarUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return value.startsWith('/') ? value : `/${value}`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getStatusLabel(status: string, isAudioOnly: boolean): string {
  switch (status) {
    case 'incoming':
      return `Incoming ${isAudioOnly ? 'audio' : 'video'} call`;
    case 'awaiting_approval':
      return 'Waiting for approval';
    case 'calling':
      return 'Calling...';
    case 'restoring':
      return 'Restoring call';
    case 'connecting':
      return 'Connecting...';
    case 'reconnecting':
      return 'Reconnecting...';
    case 'in_call':
      return 'Connected';
    default:
      return 'Call';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'in_call':
    case 'connecting':
      return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    case 'reconnecting':
      return 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
    case 'calling':
    case 'incoming':
      return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
    case 'error':
      return 'bg-red-500/20 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
  }
}

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  participants: CallPeerUser[];
  currentUserId?: string;
  isAudioOnly: boolean;
}

function VideoGrid({ localStream, remoteStreams, participants, currentUserId, isAudioOnly }: VideoGridProps) {
  const isMobile = useIsMobile();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const remoteAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const audioAutoplayToastShownRef = useRef(false);
  const twoPersonContainerRef = useRef<HTMLDivElement>(null);
  const localPreviewRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [localPreviewPosition, setLocalPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  const setVideoElementStream = useCallback((video: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!video) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    if (!stream) return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Remote video may be blocked by autoplay policy until user interaction.
      });
    }
  }, []);

  const bindAudioStream = useCallback((audio: HTMLAudioElement | null, stream: MediaStream | null) => {
    if (!audio) return;

    if (!stream) {
      if (audio.srcObject) {
        audio.srcObject = null;
      }
      return;
    }

    if (audio.srcObject !== stream) {
      audio.srcObject = stream;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (!audioAutoplayToastShownRef.current) {
          audioAutoplayToastShownRef.current = true;
          toast('Tap anywhere to enable call audio.');
        }
      });
    }
  }, []);

  const resumeMediaPlayback = useCallback(() => {
    const nodes: HTMLMediaElement[] = [];
    if (localVideoRef.current) {
      nodes.push(localVideoRef.current);
    }
    for (const node of Object.values(remoteVideoRefs.current)) {
      if (node) {
        nodes.push(node);
      }
    }
    for (const node of Object.values(remoteAudioRefs.current)) {
      if (node) {
        nodes.push(node);
      }
    }

    for (const node of nodes) {
      if (!node.srcObject) continue;
      const playPromise = node.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Some browsers require a fresh gesture after tab/background changes.
        });
      }
    }
  }, []);

  const setLocalVideoElement = useCallback((video: HTMLVideoElement | null) => {
    localVideoRef.current = video;
    if (video) {
      setVideoElementStream(video, localStream);
    }
  }, [localStream, setVideoElementStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      setVideoElementStream(localVideoRef.current, localStream);
    }
  }, [localStream, setVideoElementStream]);

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([id, stream]) => {
      const videoEl = remoteVideoRefs.current[id];
      if (videoEl) {
        setVideoElementStream(videoEl, stream);
      }

      const audioEl = remoteAudioRefs.current[id];
      if (audioEl) {
        bindAudioStream(audioEl, stream);
      }
    });
  }, [bindAudioStream, remoteStreams, setVideoElementStream]);

  useEffect(() => {
    const activeIds = new Set(Object.keys(remoteStreams));

    Object.entries(remoteAudioRefs.current).forEach(([id, node]) => {
      if (!activeIds.has(id) && node) {
        node.srcObject = null;
      }
    });
  }, [remoteStreams]);

  useEffect(() => {
    const retryPlayback = () => {
      resumeMediaPlayback();
    };

    window.addEventListener('pointerdown', retryPlayback, { passive: true });
    window.addEventListener('keydown', retryPlayback);
    window.addEventListener('focus', retryPlayback);
    window.addEventListener('pageshow', retryPlayback);

    return () => {
      window.removeEventListener('pointerdown', retryPlayback);
      window.removeEventListener('keydown', retryPlayback);
      window.removeEventListener('focus', retryPlayback);
      window.removeEventListener('pageshow', retryPlayback);
    };
  }, [resumeMediaPlayback]);

  const remoteEntries = Object.entries(remoteStreams);
  const connectedRemoteIds = new Set(remoteEntries.map(([id]) => id));
  const remoteParticipants = currentUserId
    ? participants.filter(p => p.id !== currentUserId)
    : participants.filter(p => connectedRemoteIds.has(p.id));
  const pendingRemoteParticipants = remoteParticipants.filter(p => !connectedRemoteIds.has(p.id));
  const remoteCount = Math.max(remoteEntries.length, remoteParticipants.length);
  const totalParticipants = 1 + remoteCount; // Local + remotes (including pending)

  const getGridClass = () => {
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const getParticipantInfo = (id: string) => {
    return participants.find(p => p.id === id) || { id, name: 'Participant', username: undefined };
  };

  const getParticipantLabel = (id: string) => {
    const participant = getParticipantInfo(id);
    return participant.name || participant.username || 'Participant';
  };

  const getParticipantShortLabel = (id: string) => {
    const label = getParticipantLabel(id);
    const firstWord = label.trim().split(/\s+/)[0];
    return firstWord || label || 'Participant';
  };

  const renderNamePill = (label: string, status?: string) => (
    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
      <div className="max-w-[70%] rounded-[14px] border border-white/12 bg-[rgba(32,27,34,0.68)] px-3 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <span className="block truncate text-[12px] font-semibold text-white">{label}</span>
      </div>
      {status ? (
        <div className="rounded-[14px] border border-white/12 bg-[rgba(32,27,34,0.68)] px-3 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <span className="text-[11px] font-semibold text-white/88">{status}</span>
        </div>
      ) : null}
    </div>
  );

  const renderLocalTile = (className: string) => (
    <div className={className}>
      {!isAudioOnly && localStream ? (
        <video
          ref={setLocalVideoElement}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">You</span>
          </div>
        </div>
      )}
      {renderNamePill('You', isAudioOnly ? 'Audio' : undefined)}
    </div>
  );

  const renderRemoteTile = (
    id: string,
    stream: MediaStream,
    className: string,
    index = 0,
  ) => {
    const participantLabel = getParticipantLabel(id);
    return (
      <div
        key={id}
        className={className}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {!isAudioOnly ? (
          <video
            ref={el => {
              if (el) {
                remoteVideoRefs.current[id] = el;
                setVideoElementStream(el, stream);
              } else {
                delete remoteVideoRefs.current[id];
              }
            }}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-300">{participantLabel}</span>
            </div>
          </div>
        )}
        {renderNamePill(participantLabel, isAudioOnly ? 'Audio' : undefined)}
      </div>
    );
  };

  const renderPendingRemoteTile = (
    id: string,
    label: string,
    className: string,
    index = 0,
  ) => (
    <div
      key={id}
      className={className}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
      </div>
      {renderNamePill(label, 'Joining...')}
    </div>
  );

  const baseTileClass =
    'relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-300';
  const isTwoParticipantLayout = totalParticipants === 2;

  useEffect(() => {
    if (!isTwoParticipantLayout) {
      setLocalPreviewPosition(null);
      dragStateRef.current = null;
      return;
    }

    const container = twoPersonContainerRef.current;
    const preview = localPreviewRef.current;
    if (!container || !preview || localPreviewPosition) return;

    const margin = 24;
    const x = Math.max(0, container.clientWidth - preview.clientWidth - margin);
    const y = Math.max(0, container.clientHeight - preview.clientHeight - margin);
    setLocalPreviewPosition({ x, y });
  }, [isTwoParticipantLayout, localPreviewPosition]);

  const clampPreviewPosition = useCallback((x: number, y: number) => {
    const container = twoPersonContainerRef.current;
    const preview = localPreviewRef.current;
    if (!container || !preview) return { x, y };

    const maxX = Math.max(0, container.clientWidth - preview.clientWidth);
    const maxY = Math.max(0, container.clientHeight - preview.clientHeight);
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  }, []);

  const handleLocalPreviewPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const preview = localPreviewRef.current;
    if (!preview || !localPreviewPosition) return;

    preview.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - localPreviewPosition.x,
      offsetY: event.clientY - localPreviewPosition.y,
    };
  }, [localPreviewPosition]);

  const handleLocalPreviewPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const x = event.clientX - dragState.offsetX;
    const y = event.clientY - dragState.offsetY;
    setLocalPreviewPosition(clampPreviewPosition(x, y));
  }, [clampPreviewPosition]);

  const handleLocalPreviewPointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const preview = localPreviewRef.current;
    const dragState = dragStateRef.current;
    if (!preview || !dragState || dragState.pointerId !== event.pointerId) return;

    if (preview.hasPointerCapture(event.pointerId)) {
      preview.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current = null;
  }, []);

  if (isTwoParticipantLayout && isMobile && !isAudioOnly) {
    const primaryConnectedRemote = remoteEntries[0];
    const primaryPendingRemote = pendingRemoteParticipants[0];
    const pendingLabel = primaryPendingRemote
      ? primaryPendingRemote.name || primaryPendingRemote.username || 'Participant'
      : 'Participant';

    return (
      <div ref={twoPersonContainerRef} className="relative h-full w-full rounded-[38px] bg-[#06080f] p-[8px] shadow-[0_28px_90px_rgba(0,0,0,0.62)]">
        <div className="absolute inset-[8px] overflow-hidden rounded-[32px] border border-[#2e3a57] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          {primaryConnectedRemote ? (
            <div className="relative h-full w-full">
              <video
                ref={(el) => {
                  if (el) {
                    remoteVideoRefs.current[primaryConnectedRemote[0]] = el;
                    setVideoElementStream(el, primaryConnectedRemote[1]);
                  } else {
                    delete remoteVideoRefs.current[primaryConnectedRemote[0]];
                  }
                }}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.02)_18%,rgba(0,0,0,0.18)_68%,rgba(0,0,0,0.42)_100%)]" />
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(210,185,126,0.18),transparent_30%),linear-gradient(180deg,#2a231b_0%,#100d0b_100%)]">
              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm font-medium text-white/82">
                Connecting to {pendingLabel}...
              </div>
            </div>
          )}
        </div>

        <div
          ref={localPreviewRef}
          className="absolute right-5 top-10 z-10 h-[148px] w-[96px] overflow-hidden rounded-[26px] border border-white/35 bg-black/70 shadow-[0_20px_38px_rgba(0,0,0,0.42),0_0_0_1px_rgba(255,255,255,0.05)]"
        >
          {!isAudioOnly && localStream ? (
            <video
              ref={setLocalVideoElement}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#1b1b1d]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <User className="h-6 w-6 text-white/80" />
              </div>
            </div>
          )}
        </div>

        <div className="hidden" aria-hidden>
          {remoteEntries.map(([participantId, stream]) => (
            <audio
              key={`remote-audio-${participantId}`}
              ref={(node) => {
                remoteAudioRefs.current[participantId] = node;
                bindAudioStream(node, stream);
              }}
              autoPlay
              playsInline
            />
          ))}
        </div>
      </div>
    );
  }

  if (isTwoParticipantLayout) {
    const primaryConnectedRemote = remoteEntries[0];
    const primaryPendingRemote = pendingRemoteParticipants[0];
    const pendingLabel = primaryPendingRemote
      ? primaryPendingRemote.name || primaryPendingRemote.username || 'Participant'
      : 'Participant';

    return (
      <div ref={twoPersonContainerRef} className="relative h-full w-full p-3 sm:p-4">
        {primaryConnectedRemote
          ? renderRemoteTile(primaryConnectedRemote[0], primaryConnectedRemote[1], `${baseTileClass} h-full w-full`)
          : renderPendingRemoteTile('pending-main-remote', pendingLabel, `${baseTileClass} h-full w-full`)}
        <div
          ref={localPreviewRef}
          className="absolute z-10 h-40 w-28 touch-none cursor-grab active:cursor-grabbing sm:h-48 sm:w-36 lg:h-56 lg:w-40"
          style={
            localPreviewPosition
              ? { left: `${localPreviewPosition.x}px`, top: `${localPreviewPosition.y}px` }
              : { right: '24px', bottom: '24px' }
          }
          onPointerDown={handleLocalPreviewPointerDown}
          onPointerMove={handleLocalPreviewPointerMove}
          onPointerUp={handleLocalPreviewPointerUp}
          onPointerCancel={handleLocalPreviewPointerUp}
        >
          {renderLocalTile(`${baseTileClass} h-full w-full shadow-2xl`)}
        </div>
        <div className="hidden" aria-hidden>
          {remoteEntries.map(([participantId, stream]) => (
            <audio
              key={`remote-audio-${participantId}`}
              ref={(node) => {
                remoteAudioRefs.current[participantId] = node;
                bindAudioStream(node, stream);
              }}
              autoPlay
              playsInline
            />
          ))}
        </div>
      </div>
    );
  }

  if (isMobile && !isAudioOnly) {
    const tiles = [
      {
        key: 'local-user',
        type: 'local' as const,
        label: 'You',
      },
      ...remoteEntries.map(([id, stream]) => ({
        key: id,
        type: 'remote' as const,
        id,
        stream,
        label: getParticipantShortLabel(id),
      })),
      ...pendingRemoteParticipants.map((participant) => ({
        key: `pending-${participant.id}`,
        type: 'pending' as const,
        label: participant.name || participant.username || 'Participant',
      })),
    ];

    return (
      <div className="relative h-full w-full rounded-[32px] bg-[#090d16] p-3">
        <div className="grid h-full grid-cols-2 gap-1.5">
          {tiles.map((tile, index) => {
            const isFullHeightLead = index < 2;
            const tileClassName = `relative overflow-hidden rounded-[28px] border ${
              index === 1
                ? 'border-[#08d4ff] shadow-[0_0_0_1px_rgba(8,212,255,0.14),0_0_30px_rgba(8,212,255,0.16)]'
                : 'border-white/6'
            } bg-[#12141d] ${isFullHeightLead ? 'min-h-0' : 'min-h-[10rem]'}`;

            if (tile.type === 'local') {
              return (
                <div key={tile.key} className={tileClassName}>
                  {!isAudioOnly && localStream ? (
                    <video
                      ref={setLocalVideoElement}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#161922]">
                      <div className="flex h-18 w-18 items-center justify-center rounded-full bg-white/10">
                        <User className="h-8 w-8 text-white/80" />
                      </div>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.38)_100%)]" />
                  {renderNamePill('You')}
                </div>
              );
            }

            if (tile.type === 'remote') {
              return (
                <div key={tile.key} className={tileClassName}>
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current[tile.id] = el;
                        setVideoElementStream(el, tile.stream);
                      } else {
                        delete remoteVideoRefs.current[tile.id];
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0)_40%,rgba(0,0,0,0.38)_100%)]" />
                  {renderNamePill(tile.label)}
                </div>
              );
            }

            return (
              <div key={tile.key} className={tileClassName}>
                <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,#181a25_0%,#11131d_100%)]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b3dff_0%,#ef4ca2_100%)] text-[1.9rem] font-bold text-white">
                    {initials(tile.label)}
                  </div>
                </div>
                {renderNamePill(tile.label, 'Joining...')}
              </div>
            );
          })}
        </div>
        <div className="hidden" aria-hidden>
          {remoteEntries.map(([participantId, stream]) => (
            <audio
              key={`remote-audio-${participantId}`}
              ref={(node) => {
                remoteAudioRefs.current[participantId] = node;
                bindAudioStream(node, stream);
              }}
              autoPlay
              playsInline
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className={`grid h-full ${getGridClass()} gap-3 p-3 sm:gap-4 sm:p-4`}>
        {renderLocalTile(`${baseTileClass} ${totalParticipants === 1 ? 'h-full w-full' : 'aspect-video'}`)}
        {remoteEntries.map(([id, stream], index) =>
          renderRemoteTile(id, stream, `${baseTileClass} aspect-video`, index),
        )}
        {pendingRemoteParticipants.map((participant, index) =>
          renderPendingRemoteTile(
            `pending-${participant.id}`,
            participant.name || participant.username || 'Participant',
            `${baseTileClass} aspect-video`,
            remoteEntries.length + index,
          ),
        )}
      </div>
      <div className="hidden" aria-hidden>
        {remoteEntries.map(([participantId, stream]) => (
          <audio
            key={`remote-audio-${participantId}`}
            ref={(node) => {
              remoteAudioRefs.current[participantId] = node;
              bindAudioStream(node, stream);
            }}
            autoPlay
            playsInline
          />
        ))}
      </div>
    </div>
  );
}

interface ParticipantListProps {
  participants: CallPeerUser[];
  connectedParticipantIds: string[];
  currentUserId?: string;
  isHost: boolean;
  onKick?: (userId: string) => void;
}

function ParticipantList({ participants, connectedParticipantIds, currentUserId, isHost, onKick }: ParticipantListProps) {
  return (
    <div className="space-y-2">
      {participants.map(participant => {
        const isConnected = connectedParticipantIds.includes(participant.id);
        const isCurrentUser = participant.id === currentUserId;
        const displayName = participant.name || participant.username || 'Participant';
        
        return (
          <div key={participant.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={resolveAvatarUrl(participant.avatar)} alt={displayName} />
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{displayName}</span>
                  {isCurrentUser && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                  <span className="text-xs text-gray-400">
                    {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
            
            {isHost && !isCurrentUser && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => onKick?.(participant.id)}
                title="Remove participant"
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CallModalRedesigned() {
  const { auth } = useAuth();
  const currentUser = auth?.user ?? null;
  const isMobile = useIsMobile();
  
  const {
    state,
    acceptCall,
    declineCall,
    hangup,
    toggleCamera,
    toggleMic,
    inviteToCall,
    kickFromCall,
    copyJoinLink,
    approveJoinRequest,
    rejectJoinRequest,
  } = useCall();
  
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const [connectedAtMs, setConnectedAtMs] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    if (state.status === 'in_call') {
      setConnectedAtMs(prev => prev ?? Date.now());
      return;
    }

    if (!['connecting', 'reconnecting'].includes(state.status)) {
      setConnectedAtMs(null);
      setElapsedSeconds(0);
    }
  }, [state.status]);

  useEffect(() => {
    if (!connectedAtMs) return;
    const update = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - connectedAtMs) / 1000)));
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [connectedAtMs]);

  // Fetch following users for invite dialog
  const followingUrl = showInviteDialog
    ? `/api/users/following${inviteSearch.trim() ? `?search=${encodeURIComponent(inviteSearch.trim())}` : ''}`
    : '';
  const { data: followingUsers = [], loading: loadingFollowing } = useFetch<CallPeerUser[]>(
    followingUrl,
    { skip: !showInviteDialog, cacheMs: 10000 },
  );
  
  const invitableUsers = useMemo(
    () => (followingUsers || []).filter(u => !state.participants.some(p => p.id === u.id)),
    [followingUsers, state.participants],
  );

  if (state.status === 'idle') return null;

  const showIncoming = state.status === 'incoming';
  const showCalling = state.status === 'calling';
  const showRestoring = state.status === 'restoring';
  const showAwaitingApproval = state.status === 'awaiting_approval';
  const showInCall = state.status === 'connecting' || state.status === 'reconnecting' || state.status === 'in_call' || showRestoring;
  const isAudioOnly = state.mode === 'audio';
  const isHost = state.role === 'caller';
  const peerName = state.peer?.name || state.peer?.username || 'Unknown';
  
  const callDurationLabel = showInCall && connectedAtMs ? formatDuration(elapsedSeconds) : null;
  const statusLabel = getStatusLabel(state.status, isAudioOnly);
  const statusColor = getStatusColor(state.status);

  const renderRingingStage = ({
    title,
    subtitle,
    primaryAction,
    primaryIcon,
    primaryLabel,
    secondaryAction,
    secondaryIcon,
    secondaryLabel,
  }: {
    title: string;
    subtitle: string;
    primaryAction: () => void;
    primaryIcon: React.ReactNode;
    primaryLabel: string;
    secondaryAction?: () => void;
    secondaryIcon?: React.ReactNode;
    secondaryLabel?: string;
  }) => (
    <div className="mx-auto flex h-full w-full max-w-[430px] px-2 py-3 sm:items-center sm:justify-center">
      <div className="relative flex h-full min-h-[780px] w-full flex-col overflow-hidden rounded-[40px] border border-[#243454] bg-[radial-gradient(circle_at_50%_28%,rgba(89,120,82,0.18),transparent_18%),radial-gradient(circle_at_20%_30%,rgba(153,100,63,0.22),transparent_45%),radial-gradient(circle_at_80%_82%,rgba(135,53,9,0.22),transparent_38%),linear-gradient(180deg,#151314_0%,#2d1d17_45%,#130c0a_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.62)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_28%)]" />

        <div className="relative flex flex-1 flex-col items-center px-7 pb-12 pt-24 text-center">
          <div className="relative">
            <div className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(86,184,123,0.26),transparent_65%)] blur-xl" />
            <Avatar className="relative h-[92px] w-[92px] rounded-full border-[5px] border-[#5a4138] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_35px_rgba(0,0,0,0.35)]">
              <AvatarImage src={resolveAvatarUrl(state.peer?.avatar)} alt={peerName} />
              <AvatarFallback className="bg-[#34241f] text-2xl text-white">
                {initials(peerName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-10">
            <h2 className="text-[24px] font-bold tracking-tight text-white sm:text-[26px]">
              {title}
            </h2>
            <div className="mx-auto mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/6 px-4 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
              <span className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#09d7ff]">
                {subtitle}
              </span>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`h-[54px] w-[54px] rounded-full border-white/12 bg-white/6 text-white shadow-[0_14px_30px_rgba(0,0,0,0.28)] backdrop-blur hover:bg-white/12 ${
                state.isMicEnabled ? '' : 'border-red-400/35 bg-red-500/18 text-red-100'
              }`}
              onClick={toggleMic}
              title={state.isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {state.isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              type="button"
              size="icon"
              className="h-[68px] w-[68px] rounded-full border border-[#ff8787]/30 bg-[#ff3347] text-white shadow-[0_0_0_3px_rgba(255,255,255,0.08),0_0_34px_rgba(255,56,78,0.44)] hover:bg-[#ff4457]"
              onClick={primaryAction}
              title={primaryLabel}
            >
              {primaryIcon}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`h-[54px] w-[54px] rounded-full border-white/12 bg-white/6 text-white shadow-[0_14px_30px_rgba(0,0,0,0.28)] backdrop-blur hover:bg-white/12 ${
                !isAudioOnly && !state.isCameraEnabled ? 'border-red-400/35 bg-red-500/18 text-red-100' : ''
              }`}
              onClick={secondaryAction ?? toggleCamera}
              title={secondaryLabel ?? (state.isCameraEnabled ? 'Turn camera off' : 'Turn camera on')}
            >
              {secondaryIcon ?? (state.isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different states
  const renderIncomingCall = () => (
    renderRingingStage({
      title: peerName,
      subtitle: 'Incoming...',
      primaryAction: declineCall,
      primaryIcon: <PhoneOff className="h-7 w-7" />,
      primaryLabel: 'Decline call',
      secondaryAction: acceptCall,
      secondaryIcon: <Phone className="h-5 w-5" />,
      secondaryLabel: 'Accept call',
    })
  );

  const renderCalling = () => (
    renderRingingStage({
      title: peerName,
      subtitle: 'Ringing...',
      primaryAction: hangup,
      primaryIcon: <PhoneOff className="h-7 w-7" />,
      primaryLabel: 'Cancel call',
    })
  );

  const renderInCall = () => {
    const mobileActionCount = (isHost ? 1 : 0) + 1 + (state.callId ? 1 : 0);
    const mobileActionColsClass = mobileActionCount <= 1 ? 'grid-cols-1' : mobileActionCount === 2 ? 'grid-cols-2' : 'grid-cols-3';
    const mobileCallLabel = isAudioOnly ? 'Conference' : 'Conference';
    const audioParticipants = Array.from(
      new Map(
        [
          ...(currentUser ? [[currentUser.id, currentUser]] : []),
          ...state.participants.map((participant) => [participant.id, participant] as const),
          ...Object.keys(state.remoteStreams || {}).map((id) => [id, { id, name: 'Participant' }] as const),
        ].filter((entry): entry is [string, any] => Boolean(entry?.[0])),
      ).values(),
    );

    if (isMobile && !isAudioOnly) {
      return (
        <div className="mx-auto flex h-full w-full max-w-[430px] px-2 py-3">
          <div className="relative flex h-full w-full rounded-[42px] bg-[#02040a] p-[10px] shadow-[0_30px_100px_rgba(0,0,0,0.68)]">
            <div className="pointer-events-none absolute inset-0 rounded-[42px] bg-[radial-gradient(circle_at_top,rgba(65,86,138,0.22),transparent_28%)]" />
            <div className="relative inset-[10px] flex-1 overflow-hidden rounded-[34px] border border-[#253250] bg-[#090c14] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="absolute inset-0 z-0">
                <VideoGrid
                  localStream={state.localStream}
                  remoteStreams={state.remoteStreams}
                  participants={state.participants}
                  currentUserId={currentUser?.id}
                  isAudioOnly={false}
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-10 z-20 flex justify-center">
                <div className="rounded-full border border-white/10 bg-[#70694e]/42 px-4 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
                  <span className="text-[16px] font-bold tracking-[0.16em] text-[#00ddff]">
                    {callDurationLabel || '00:00'}
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_26%,rgba(0,0,0,0.54)_100%)]" />

              <div className="pointer-events-auto absolute inset-x-0 bottom-7 z-30 flex flex-nowrap items-center justify-center gap-5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-[54px] w-[54px] shrink-0 self-center rounded-full border-white/12 bg-[#c8bb98]/32 text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-md hover:bg-[#d4c5a0]/40 ${
                    state.isMicEnabled ? '' : 'border-red-400/35 bg-red-500/18 text-red-100'
                  }`}
                  onClick={toggleMic}
                  title={state.isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {state.isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  type="button"
                  size="icon"
                  className="h-[70px] w-[70px] shrink-0 self-center rounded-full border border-[#ff8e96]/32 bg-[#ff3347] text-white shadow-[0_0_0_4px_rgba(255,255,255,0.07),0_0_36px_rgba(255,56,78,0.45)] hover:bg-[#ff4457]"
                  onClick={hangup}
                  title="End call"
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-[54px] w-[54px] shrink-0 self-center rounded-full border-white/12 bg-[#c8bb98]/32 text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-md hover:bg-[#d4c5a0]/40 ${
                    state.isCameraEnabled ? '' : 'border-red-400/35 bg-red-500/18 text-red-100'
                  }`}
                  onClick={toggleCamera}
                  title={state.isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
                >
                  {state.isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isMobile && isAudioOnly) {
      return (
        <div className="mx-auto flex h-full w-full max-w-[430px] px-2 py-3">
          <div className="relative flex h-full w-full rounded-[42px] bg-[#02040a] p-[10px] shadow-[0_30px_100px_rgba(0,0,0,0.68)]">
            <div className="absolute inset-[10px] overflow-hidden rounded-[34px] border border-[#253250] bg-[#090c14] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="pointer-events-none absolute inset-x-0 top-9 z-20 flex justify-center">
                <div className="rounded-full border border-white/10 bg-[#70694e]/42 px-4 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
                  <span className="text-[14px] font-bold tracking-[0.14em] text-[#00ddff]">
                    {`${mobileCallLabel.toUpperCase()} • ${callDurationLabel || '00:00'}`}
                  </span>
                </div>
              </div>

              <div className="grid h-full grid-cols-2 gap-1.5 p-3 pt-20 pb-28">
                {audioParticipants.slice(0, 4).map((participant, index) => {
                  const isCurrentUser = participant.id === currentUser?.id;
                  const label = isCurrentUser ? 'You' : participant.name || participant.username || 'Participant';
                  const isConnected =
                    isCurrentUser ||
                    state.connectedParticipantIds.includes(participant.id) ||
                    Object.prototype.hasOwnProperty.call(state.remoteStreams || {}, participant.id);

                  return (
                    <div
                      key={participant.id}
                      className={`relative overflow-hidden rounded-[28px] border ${
                        index === 1 ? 'border-[#08d4ff] shadow-[0_0_0_1px_rgba(8,212,255,0.14),0_0_30px_rgba(8,212,255,0.16)]' : 'border-white/6'
                      } bg-[linear-gradient(180deg,#171a25_0%,#10131b_100%)]`}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
                        <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b3dff_0%,#ef4ca2_100%)] text-[2rem] font-bold text-white shadow-[0_20px_36px_rgba(127,58,213,0.25)]">
                          {initials(label)}
                        </div>
                        <div>
                          <p className="truncate text-sm font-semibold text-white">{label}</p>
                          <p className="mt-1 text-xs text-white/65">{isConnected ? 'Connected' : 'Joining...'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-44 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.18)_26%,rgba(0,0,0,0.54)_100%)]" />
              <div className="absolute inset-x-0 bottom-7 z-20 flex flex-nowrap items-center justify-center gap-5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-[54px] w-[54px] shrink-0 self-center rounded-full border-white/12 bg-[#c8bb98]/32 text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-md hover:bg-[#d4c5a0]/40 ${
                    state.isMicEnabled ? '' : 'border-red-400/35 bg-red-500/18 text-red-100'
                  }`}
                  onClick={toggleMic}
                  title={state.isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {state.isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  type="button"
                  size="icon"
                  className="h-[70px] w-[70px] shrink-0 self-center rounded-full border border-[#ff8e96]/32 bg-[#ff3347] text-white shadow-[0_0_0_4px_rgba(255,255,255,0.07),0_0_36px_rgba(255,56,78,0.45)] hover:bg-[#ff4457]"
                  onClick={hangup}
                  title="End call"
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-[54px] w-[54px] shrink-0 self-center rounded-full border-white/12 bg-[#c8bb98]/32 text-white shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-md hover:bg-[#d4c5a0]/40"
                  onClick={() => setShowMobileTools(true)}
                  title="View participants"
                >
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full ${statusColor}`}>
            <span className="text-sm font-medium">{statusLabel}</span>
          </div>
          {callDurationLabel && (
            <div className="flex items-center gap-1 text-gray-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{callDurationLabel}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {state.callId && !isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={copyJoinLink}
              title="Copy join link"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          )}
          {isHost && !isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setShowInviteDialog(true)}
              title="Invite participants"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 min-h-0">
        <VideoGrid
          localStream={state.localStream}
          remoteStreams={state.remoteStreams}
          participants={state.participants}
          currentUserId={currentUser?.id}
          isAudioOnly={isAudioOnly}
        />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex flex-nowrap items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className={`h-14 w-14 shrink-0 self-center rounded-full ${state.isMicEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
            onClick={toggleMic}
          >
            {state.isMicEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {!isAudioOnly && (
            <Button
              variant="outline"
              size="lg"
              className={`h-14 w-14 shrink-0 self-center rounded-full ${state.isCameraEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
              onClick={toggleCamera}
            >
              {state.isCameraEnabled ? (
                <Video className="h-6 w-6" />
              ) : (
                <VideoOff className="h-6 w-6" />
              )}
            </Button>
          )}

          <Button
            size="lg"
            className="h-14 w-14 shrink-0 self-center rounded-full bg-red-500 text-white hover:bg-red-600"
            onClick={hangup}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

        </div>

        {isMobile && (
          <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900/90 p-1 backdrop-blur">
            <div className={`grid gap-1 ${mobileActionColsClass}`}>
              {isHost && (
                <Button
                  variant="ghost"
                  className="h-11 rounded-xl text-gray-200 hover:bg-gray-800"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              )}
              <Button
                variant="ghost"
                className="h-11 rounded-xl text-gray-200 hover:bg-gray-800"
                onClick={() => setShowMobileTools(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                People
              </Button>
              {state.callId && (
                <Button
                  variant="ghost"
                  className="h-11 rounded-xl text-gray-200 hover:bg-gray-800"
                  onClick={copyJoinLink}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

  const renderAwaitingApproval = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
        <Clock className="h-10 w-10 text-blue-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Join Request Sent</h2>
      <p className="text-gray-300 mb-8">
        The host needs to approve your request before you can join the call.
      </p>
      
      <Button
        className="h-14 px-8 bg-red-500 hover:bg-red-600 text-white rounded-2xl"
        onClick={hangup}
      >
        <PhoneOff className="mr-2 h-5 w-5" />
        Cancel Request
      </Button>
    </div>
  );

  const renderRestoring = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="relative mb-8">
        <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Wifi className="h-10 w-10 text-blue-400" />
        </div>
        <div className="absolute -inset-4 animate-ping rounded-full bg-blue-500/20" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Restoring Call</h2>
      <p className="text-gray-300 mb-8">Reconnecting to your active call session...</p>
      
      <Button
        className="h-14 px-8 bg-red-500 hover:bg-red-600 text-white rounded-2xl"
        onClick={hangup}
      >
        <PhoneOff className="mr-2 h-5 w-5" />
        Stop Restoring
      </Button>
    </div>
  );

  // Main render
  const renderContent = () => {
    if (showIncoming) return renderIncomingCall();
    if (showCalling) return renderCalling();
    if (showAwaitingApproval) return renderAwaitingApproval();
    if (showRestoring) return renderRestoring();
    if (showInCall) return renderInCall();
    
    return null;
  };

  const invitePickerContent = (
    <>
      <Input
        value={inviteSearch}
        onChange={(e) => setInviteSearch(e.target.value)}
        placeholder="Search people you follow"
        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
      />
      
      <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
        {loadingFollowing ? (
          <div className="py-8 text-center text-gray-400">Loading...</div>
        ) : invitableUsers.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No available users</div>
        ) : (
          invitableUsers.map(user => (
            <button
              key={user.id}
              className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-gray-800 text-left"
              onClick={() => {
                inviteToCall(user.id);
                setShowInviteDialog(false);
              }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={resolveAvatarUrl(user.avatar)} alt={user.name} />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-sm text-gray-400">@{user.username || 'user'}</div>
              </div>
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
          ))
        )}
      </div>
    </>
  );

  // Invite panel
  const inviteDialog = showInviteDialog && (
    isMobile ? (
      <Sheet open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <SheetContent
          side="bottom"
          overlayClassName="z-[100001] bg-black/70"
          className="z-[100001] max-h-[85vh] rounded-t-3xl border-gray-800 bg-gray-900 px-4 pt-3 pb-4 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <SheetHeader className="px-0 pb-3">
            <SheetTitle className="text-left text-white">Invite to Call</SheetTitle>
          </SheetHeader>
          {invitePickerContent}
        </SheetContent>
      </Sheet>
    ) : (
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="z-[100001] bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to Call</DialogTitle>
          </DialogHeader>
          {invitePickerContent}
        </DialogContent>
      </Dialog>
    )
  );

  // Mobile tools sheet
  const mobileToolsDrawer = isMobile && (
    <Sheet open={showMobileTools} onOpenChange={setShowMobileTools}>
      <SheetContent
        side="bottom"
        overlayClassName="z-[100001] bg-black/70"
        className="z-[100001] max-h-[85vh] rounded-t-3xl border-gray-800 bg-gray-900 px-4 pt-3 pb-4 text-white shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <SheetHeader className="px-0 pb-3">
          <SheetTitle className="text-left text-white">Call Tools</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 overflow-y-auto pr-1">
          <div>
            <h3 className="font-medium text-white mb-3">Participants</h3>
            <ParticipantList
              participants={state.participants}
              connectedParticipantIds={state.connectedParticipantIds}
              currentUserId={currentUser?.id}
              isHost={isHost}
              onKick={kickFromCall}
            />
          </div>
          
          {state.pendingJoinRequests.length > 0 && (
            <div>
              <h3 className="font-medium text-white mb-3">Join Requests</h3>
              <div className="space-y-2">
                {state.pendingJoinRequests.map(request => (
                  <div key={request.id} className="p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={resolveAvatarUrl(request.requested_by.avatar)} alt={request.requested_by.name} />
                        <AvatarFallback>{initials(request.requested_by.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-white">{request.requested_by.name}</div>
                        <div className="text-xs text-gray-400">@{request.requested_by.username || 'user'}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => approveJoinRequest(request.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                        onClick={() => rejectJoinRequest(request.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <div className="fixed inset-0 z-[100000] bg-gray-950 animate-in fade-in duration-300">
        {renderContent()}
      </div>
      {inviteDialog}
      {mobileToolsDrawer}
    </>
  );
}
