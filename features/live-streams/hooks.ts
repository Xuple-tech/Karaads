import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { liveStreamsService, type CreateLiveStreamInput } from './service';

export const LIVE_STREAMS_QUERY_KEY = ['live-streams'] as const;
export const liveStreamQueryKey = (streamId: string) => ['live-streams', streamId] as const;
export const liveStreamChatQueryKey = (streamId: string) => ['live-streams', streamId, 'chat'] as const;
export const liveStreamAnalyticsQueryKey = (streamId: string) => ['live-streams', streamId, 'analytics'] as const;

export const useLiveStreams = () => {
  return useQuery({
    queryKey: LIVE_STREAMS_QUERY_KEY,
    queryFn: liveStreamsService.listStreams,
    refetchInterval: 15000,
  });
};

export const useLiveStream = (streamId: string, enabled = true) => {
  return useQuery({
    queryKey: liveStreamQueryKey(streamId),
    queryFn: () => liveStreamsService.getStream(streamId),
    enabled: enabled && Boolean(streamId),
    refetchInterval: 8000,
  });
};

export const useLiveStreamChat = (streamId: string, enabled = true) => {
  return useQuery({
    queryKey: liveStreamChatQueryKey(streamId),
    queryFn: () => liveStreamsService.getChatMessages(streamId),
    enabled: enabled && Boolean(streamId),
    refetchInterval: 4000,
  });
};

export const useLiveStreamAnalytics = (streamId: string, enabled = true) => {
  return useQuery({
    queryKey: liveStreamAnalyticsQueryKey(streamId),
    queryFn: () => liveStreamsService.getAnalytics(streamId),
    enabled: enabled && Boolean(streamId),
    refetchInterval: 10000,
  });
};

export const useCreateLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLiveStreamInput) => liveStreamsService.createStream(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LIVE_STREAMS_QUERY_KEY });
    },
  });
};

export const useStartLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => liveStreamsService.startStream(streamId),
    onSuccess: async (_, streamId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LIVE_STREAMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: liveStreamQueryKey(streamId) }),
      ]);
    },
  });
};

export const useEndLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => liveStreamsService.endStream(streamId),
    onSuccess: async (_, streamId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: LIVE_STREAMS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: liveStreamQueryKey(streamId) }),
      ]);
    },
  });
};

export const useJoinLiveStream = () => {
  return useMutation({
    mutationFn: (streamId: string) => liveStreamsService.joinStream(streamId),
  });
};

export const useLikeLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => liveStreamsService.likeStream(streamId),
    onSuccess: async (_, streamId) => {
      await queryClient.invalidateQueries({ queryKey: liveStreamQueryKey(streamId) });
    },
  });
};

export const useShareLiveStream = () => {
  return useMutation({
    mutationFn: (streamId: string) => liveStreamsService.shareStream(streamId),
  });
};

export const useSendLiveChatMessage = (streamId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => liveStreamsService.sendChatMessage(streamId, content),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: liveStreamChatQueryKey(streamId) });
    },
  });
};

export const useLiveKitToken = (streamId: string) => {
  return useMutation({
    mutationFn: () => liveStreamsService.getLiveKitToken(streamId),
  });
};
