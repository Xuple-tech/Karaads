import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { useAuthStore } from '@/features/auth/store';
import { callsService } from '@/features/calls/service';
import { createLogger } from '@/lib/logging/logger';
import type { RealtimeCallEvent } from '@/lib/types/domain';

type WebRtcModule = {
  RTCPeerConnection: new (configuration?: any) => any;
  RTCSessionDescription: new (descriptionInitDict: any) => any;
  RTCIceCandidate: new (candidateInitDict: any) => any;
  registerGlobals?: () => void;
  mediaDevices: {
    getUserMedia: (constraints: any) => Promise<any>;
  };
};

const logger = createLogger('call');

const getWebRtc = (): WebRtcModule | null => {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    const module = require('react-native-webrtc') as WebRtcModule;
    module.registerGlobals?.();
    return module;
  } catch {
    return null;
  }
};

const decodeBase64 = (value: string) => {
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(value);
  }
  return value;
};

const ensureMediaPermissions = async (mode: 'audio' | 'video') => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions: string[] = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  if (mode === 'video') {
    permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  }
  const result = (await PermissionsAndroid.requestMultiple(permissions as any)) as Record<string, string>;
  return permissions.every((permission) => result[permission] === PermissionsAndroid.RESULTS.GRANTED);
};

type UseCallMediaParams = {
  callId: string | null;
  mode: 'audio' | 'video';
  direction: 'incoming' | 'outgoing' | null;
  status: 'idle' | 'dialing' | 'ringing' | 'accepted' | 'declined' | 'ended' | 'failed';
  peerUserId?: string;
};

export const useCallMedia = ({ callId, mode, direction, status, peerUserId }: UseCallMediaParams) => {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [supported, setSupported] = useState(false);
  const [mediaState, setMediaState] = useState<'idle' | 'initializing' | 'ready' | 'failed'>('idle');
  const [transportState, setTransportState] = useState<'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'>('new');
  const [localStreamUrl, setLocalStreamUrl] = useState<string | null>(null);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(mode === 'video');
  const [lastError, setLastError] = useState<string | null>(null);

  const [speakerOn, setSpeakerOn] = useState(mode === 'video');

  const peerConnectionRef = useRef<any | null>(null);
  const localStreamRef = useRef<any | null>(null);
  const pendingIceRef = useRef<any[]>([]);
  const remoteDescriptionSetRef = useRef(false);
  const targetUserIdRef = useRef<string | null>(peerUserId ?? null);
  const isOfferSentRef = useRef(false);
  const destroyedRef = useRef(false);
  const webRtcRef = useRef<WebRtcModule | null>(null);

  useEffect(() => {
    webRtcRef.current = getWebRtc();
    setSupported(Boolean(webRtcRef.current));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!callId || status !== 'accepted') {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      }).catch(() => {
        logger.warn('audio_mode_reset_failed', { call_id: callId ?? 'none' });
      });
      return;
    }

    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: mode === 'audio',
    }).catch((error) => {
      logger.warn('audio_mode_setup_failed', {
        call_id: callId,
        mode,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }, [callId, mode, status]);

  useEffect(() => {
    targetUserIdRef.current = peerUserId ?? null;
  }, [peerUserId]);

  useEffect(() => {
    setMicEnabled(true);
    setCameraEnabled(mode === 'video');
    setSpeakerOn(mode === 'video');
    setLastError(null);
    destroyedRef.current = false;
  }, [callId, mode]);

  const destroy = useCallback(() => {
    destroyedRef.current = true;
    isOfferSentRef.current = false;
    remoteDescriptionSetRef.current = false;
    pendingIceRef.current = [];
    targetUserIdRef.current = peerUserId ?? null;

    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track: any) => {
          track.enabled = false;
          track.stop();
        });
      } catch {} // eslint-disable-line no-empty
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.close();
      } catch {} // eslint-disable-line no-empty
      peerConnectionRef.current = null;
    }

    setLocalStreamUrl(null);
    setRemoteStreamUrl(null);
    setMediaState('idle');
    setTransportState('new');
    setMicEnabled(true);
    setCameraEnabled(mode === 'video');
    setSpeakerOn(mode === 'video');
    setLastError(null);
  }, [mode, peerUserId]);

  const createPeerConnection = useCallback(async () => {
    const WebRTC = webRtcRef.current;
    if (!WebRTC || !callId || destroyedRef.current) {
      return null;
    }

    const granted = await ensureMediaPermissions(mode);
    if (!granted) {
      setLastError('camera_or_microphone_permission_denied');
      setMediaState('failed');
      return null;
    }

    if (destroyedRef.current) return null;
    setMediaState('initializing');

    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];

    const pc = new WebRTC.RTCPeerConnection({ iceServers });

    let localStream: any;
    try {
      localStream = await Promise.race([
        WebRTC.mediaDevices.getUserMedia({
          audio: true,
          video: mode === 'video',
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('media_timeout')), 15000),
        ),
      ]);
    } catch (error) {
      pc.close();
      const msg = error instanceof Error ? error.message : 'getUserMedia_failed';
      setLastError(msg);
      setMediaState('failed');
      logger.error('get_user_media_failed', { call_id: callId, error: msg });
      return null;
    }

    if (destroyedRef.current) {
      localStream.getTracks().forEach((t: any) => t.stop());
      pc.close();
      return null;
    }

    localStreamRef.current = localStream;
    localStream.getAudioTracks().forEach((track: any) => {
      track.enabled = micEnabled;
    });
    localStream.getVideoTracks().forEach((track: any) => {
      track.enabled = mode === 'video' ? cameraEnabled : false;
    });
    localStream.getTracks().forEach((track: any) => pc.addTrack(track, localStream));
    setLocalStreamUrl(localStream.toURL());
    setMediaState('ready');
    setLastError(null);

    pc.ontrack = (event: any) => {
      const [remote] = event.streams;
      if (remote) {
        setRemoteStreamUrl(remote.toURL());
      }
    };

    pc.onicecandidate = (event: any) => {
      if (destroyedRef.current) return;
      const candidate = event.candidate;
      const targetUserId = targetUserIdRef.current;
      if (!candidate || !targetUserId || !callId) {
        return;
      }
      callsService.sendIceCandidate(callId, targetUserId, candidate.toJSON()).catch(() => {
        logger.warn('send_ice_failed', { call_id: callId, to_user_id: targetUserId });
      });
    };

    pc.onconnectionstatechange = () => {
      if (destroyedRef.current) return;
      const state = pc.connectionState;
      if (state === 'connected') {
        setTransportState('connected');
      } else if (state === 'connecting') {
        setTransportState('connecting');
      } else if (state === 'disconnected') {
        setTransportState('disconnected');
      } else if (state === 'failed') {
        setTransportState('failed');
        setLastError('peer_connection_failed');
      } else {
        setTransportState('new');
      }
      logger.debug('pc_connection_state', { call_id: callId, state });
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [callId, cameraEnabled, micEnabled, mode]);

  const sendOffer = useCallback(async () => {
    const targetUserId = peerUserId ?? targetUserIdRef.current;
    if (!callId || !currentUserId || !targetUserId || isOfferSentRef.current) {
      return;
    }
    targetUserIdRef.current = targetUserId;

    const pc = peerConnectionRef.current ?? (await createPeerConnection());
    if (!pc) {
      return;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await callsService.sendOffer(callId, targetUserId, offer.sdp ?? '');
    isOfferSentRef.current = true;
    logger.info('offer_sent', { call_id: callId, to_user_id: targetUserId });
  }, [callId, createPeerConnection, currentUserId, peerUserId]);

  const flushPendingIce = useCallback(async () => {
    const pc = peerConnectionRef.current;
    const WebRTC = webRtcRef.current;
    if (!pc || !WebRTC || !remoteDescriptionSetRef.current) {
      return;
    }
    while (pendingIceRef.current.length > 0) {
      const candidate = pendingIceRef.current.shift();
      if (!candidate) {
        continue;
      }
      await pc.addIceCandidate(new WebRTC.RTCIceCandidate(candidate));
    }
  }, []);

  const applyOffer = useCallback(
    async (event: RealtimeCallEvent) => {
      if (!callId || !event.offer_signal_id || !event.from_user_id) {
        return;
      }

      targetUserIdRef.current = event.from_user_id;
      const pc = peerConnectionRef.current ?? (await createPeerConnection());
      const WebRTC = webRtcRef.current;
      if (!pc || !WebRTC) {
        return;
      }

      const signal = await callsService.getSignal(callId, 'offer', event.offer_signal_id);
      const sdp = signal.sdp ?? (signal.sdp_b64 ? decodeBase64(signal.sdp_b64) : '');
      if (!sdp) {
        return;
      }

      await pc.setRemoteDescription(new WebRTC.RTCSessionDescription({ type: 'offer', sdp }));
      remoteDescriptionSetRef.current = true;
      await flushPendingIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await callsService.sendAnswer(callId, event.from_user_id, answer.sdp ?? '');
      logger.info('answer_sent', { call_id: callId, to_user_id: event.from_user_id });
    },
    [callId, createPeerConnection, flushPendingIce],
  );

  const applyAnswer = useCallback(
    async (event: RealtimeCallEvent) => {
      if (!callId || !event.answer_signal_id || !event.from_user_id) {
        return;
      }
      const pc = peerConnectionRef.current;
      const WebRTC = webRtcRef.current;
      if (!pc || !WebRTC) {
        return;
      }

      const signal = await callsService.getSignal(callId, 'answer', event.answer_signal_id);
      const sdp = signal.sdp ?? (signal.sdp_b64 ? decodeBase64(signal.sdp_b64) : '');
      if (!sdp) {
        return;
      }

      await pc.setRemoteDescription(new WebRTC.RTCSessionDescription({ type: 'answer', sdp }));
      remoteDescriptionSetRef.current = true;
      await flushPendingIce();
      logger.info('answer_applied', { call_id: callId, from_user_id: event.from_user_id });
    },
    [callId, flushPendingIce],
  );

  const applyIceCandidate = useCallback(async (event: RealtimeCallEvent) => {
    if (!event.candidate) {
      return;
    }

    const candidate = event.candidate as any;
    if (!remoteDescriptionSetRef.current) {
      pendingIceRef.current.push(candidate);
      return;
    }

    const pc = peerConnectionRef.current;
    const WebRTC = webRtcRef.current;
    if (!pc || !WebRTC) {
      return;
    }
    await pc.addIceCandidate(new WebRTC.RTCIceCandidate(candidate));
  }, []);

  const handleRealtimeEvent = useCallback(
    (event: RealtimeCallEvent) => {
      if (!callId || event.call_id !== callId) {
        return;
      }
      if (event.from_user_id && event.from_user_id === currentUserId) {
        return;
      }
      if (event.type === 'CallOffer') {
        applyOffer(event).catch((error) => {
          setLastError('failed_to_apply_offer');
          logger.error('apply_offer_failed', { call_id: callId, error });
        });
        return;
      }
      if (event.type === 'CallAnswer') {
        applyAnswer(event).catch((error) => {
          setLastError('failed_to_apply_answer');
          logger.error('apply_answer_failed', { call_id: callId, error });
        });
        return;
      }
      if (event.type === 'CallIceCandidate') {
        applyIceCandidate(event).catch((error) => {
          logger.warn('apply_ice_failed', { call_id: callId, error });
        });
        return;
      }
      if (event.type === 'CallEnded') {
        destroy();
      }
    },
    [applyAnswer, applyIceCandidate, applyOffer, callId, currentUserId, destroy],
  );

  useEffect(() => {
    if (!callId || status !== 'accepted' || !supported) {
      return;
    }

    if (direction === 'outgoing') {
      sendOffer().catch((error) => {
        setLastError('failed_to_send_offer');
        logger.error('send_offer_failed', { call_id: callId, error });
      });
    }
  }, [callId, direction, peerUserId, sendOffer, status, supported]);

  useEffect(() => {
    if (!callId || status !== 'accepted' || mediaState === 'failed') {
      return;
    }

    const timer = setInterval(() => {
      callsService.heartbeat(callId).catch(() => {
        logger.warn('heartbeat_failed', { call_id: callId });
      });
    }, 20000);

    return () => {
      clearInterval(timer);
    };
  }, [callId, mediaState, status]);

  useEffect(() => {
    if (!callId || status !== 'accepted') {
      destroy();
    }
  }, [callId, destroy, status]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micEnabled;
    stream.getAudioTracks().forEach((track: any) => {
      track.enabled = next;
    });
    setMicEnabled(next);
  }, [micEnabled]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !cameraEnabled;
    stream.getVideoTracks().forEach((track: any) => {
      track.enabled = next;
    });
    setCameraEnabled(next);
  }, [cameraEnabled]);

  const flipCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && typeof videoTrack._switchCamera === 'function') {
      videoTrack._switchCamera();
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (Platform.OS === 'web') return;
    const next = !speakerOn;
    setSpeakerOn(next);
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: !next,
    }).catch((error) => {
      logger.warn('speaker_toggle_failed', { error: error instanceof Error ? error.message : String(error) });
    });
  }, [speakerOn]);

  const statusLabel = useMemo(() => {
    if (!supported) return 'WebRTC unavailable';
    if (lastError) return `Error: ${lastError}`;
    if (mediaState === 'initializing') return 'Initializing media';
    if (transportState === 'connecting') return 'Connecting peer';
    if (transportState === 'connected') return 'Media connected';
    if (status === 'accepted') return 'Waiting for peer media';
    return 'Idle';
  }, [lastError, mediaState, status, supported, transportState]);

  return {
    supported,
    localStreamUrl,
    remoteStreamUrl,
    mediaState,
    transportState,
    micEnabled,
    cameraEnabled,
    speakerOn,
    statusLabel,
    lastError,
    toggleMic,
    toggleCamera,
    flipCamera,
    toggleSpeaker,
    handleRealtimeEvent,
    destroy,
  };
};
