/* eslint-disable react-hooks/preserve-manual-memoization */
import { useEffect, useRef, useState, useMemo, useCallback, memo, useDeferredValue } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAuth } from '@/hooks/use-auth';
import { useCall } from '@/contexts/call-context';
import { RealtimeConversationMessage, useRealtimeConversations } from '@/hooks/use-realtime-conversations';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import {
  isNativeContactsAvailable,
  pickSharedDeviceContact,
  supportsAnyDeviceContactSelection,
} from '@/lib/native-contacts';
import { getPresenceState } from '@/lib/presence';
import { format } from 'date-fns';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmojiStickerPicker } from '@/components/emoji-sticker-picker';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileActionSheet } from '@/components/mobile-action-sheet';
import { MobileEmptyState } from '@/components/mobile-empty-state';
import { 
  ArrowLeft, 
  ArrowUp, 
  Ban,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckSquare,
  Contact,
  Copy,
  FileAudio,
  FileText,
  Eye,
  Loader2, 
  MapPin,
  Mic,
  MoreVertical, 
  Paperclip, 
  Pause,
  Phone, 
  Play,
  Plus,
  Reply,
  Search, 
  UserPlus,
  Video,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Users,
  X
} from 'lucide-react';

// ---------- Types ----------
interface User {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  is_online?: boolean;
  last_seen_at?: string | null;
  avatar_variants?: {
    sm?: string | null;
    md?: string | null;
    lg?: string | null;
    original?: string | null;
  } | null;
}

interface Attachment {
  id: string;
  url?: string;
  thumbnail_url?: string | null;
  name?: string;
  mime_type?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
  story_id?: string;
  emoji?: string;
  label?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  map_url?: string;
  live?: boolean;
  live_session_id?: string;
  last_updated_at?: string;
  expires_at?: string;
  phone?: string;
  email?: string;
  organization?: string;
  options?: string[];
  total_votes?: number;
  event_title?: string;
  starts_at?: string;
  ends_at?: string;
  venue?: string;
  notes?: string;
}

interface ReplyMessage {
  id: string;
  content?: string | null;
  user_id: string;
  conversation_id?: string;
  message_type: Message['message_type'];
  attachments?: Attachment[];
  created_at?: string;
  user?: User;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  conversation_id: string;
  reply_to_message_id?: string | null;
  reply_to?: ReplyMessage | null;
  message_type: 'text' | 'image' | 'video' | 'file' | 'call' | 'audio' | 'document' | 'location' | 'contact' | 'poll' | 'event';
  attachments?: Attachment[];
  created_at: string;
  read_at?: string | null;
  delivered_at?: string | null;
  user: User;
  is_optimistic?: boolean;
}

interface StoryMessageSummary {
  story: {
    id: string;
    view_count?: number;
  };
}

interface Conversation {
  id: string;
  type?: 'private' | 'group';
  name?: string | null;
  avatar?: string | null;
  invite_url?: string | null;
  invite_token?: string | null;
  invite_enabled?: boolean;
  created_by?: string | null;
  participants: User[];
  last_message?: Message | null;
  updated_at: string;
  unread_count?: number;
}

interface BusinessPageSummary {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  avatar?: string | null;
  follower_count?: number;
  is_owner?: boolean;
  is_following?: boolean;
}

type CreateConversationPayload = {
  participantIds: string[];
  type?: 'private' | 'group';
  name?: string;
  avatar?: File | null;
};

type CallStatus =
  | 'idle'
  | 'incoming'
  | 'calling'
  | 'restoring'
  | 'awaiting_approval'
  | 'connecting'
  | 'reconnecting'
  | 'in_call'
  | 'ended'
  | 'error';

// ---------- Utility Functions ----------
const resolveAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

const getAvatarCandidates = (user?: User | null): string[] => {
  if (!user) return [];
  const variants = user.avatar_variants;
  return [
    variants?.md,
    variants?.sm,
    variants?.lg,
    variants?.original,
    user.avatar,
  ]
    .map(v => resolveAvatarUrl(v))
    .filter((v): v is string => Boolean(v));
};

const getUsernameLabel = (user?: User | null): string => {
  const username = user?.username?.trim();

  if (username) {
    return username.startsWith('@') ? username : `@${username}`;
  }

  return user?.name?.trim() || 'User';
};

const getProfileFallbackUrl = (user?: User | null): string =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.username || user?.name || 'User'
  )}&background=1f2937&color=ffffff`;

const handleAvatarError = (
  e: React.SyntheticEvent<HTMLImageElement>, 
  user?: User | null
) => {
  const img = e.currentTarget;
  const candidates = getAvatarCandidates(user);
  const current = img.currentSrc || img.src;
  const index = candidates.indexOf(current);
  if (index >= 0 && index < candidates.length - 1) {
    img.src = candidates[index + 1];
  } else {
    img.src = getProfileFallbackUrl(user);
  }
};

function UserProfileImage({
  user,
  className = 'h-10 w-10',
}: {
  user?: User | null;
  className?: string;
}) {
  const candidates = getAvatarCandidates(user);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const src = candidates[candidateIndex] || getProfileFallbackUrl(user);

  useEffect(() => {
    setCandidateIndex(0);
  }, [user?.id, user?.avatar, user?.avatar_variants]);

  return (
    <img
      src={src}
      alt={getUsernameLabel(user)}
      className={cn('shrink-0 rounded-full border border-border bg-muted object-cover', className)}
      loading="lazy"
      onError={() => {
        setCandidateIndex((current) => (current < candidates.length - 1 ? current + 1 : current));
      }}
    />
  );
}

function GroupProfileStack({
  participants,
  avatar,
  name,
  className = 'h-10 w-10',
}: {
  participants?: User[];
  avatar?: string | null;
  name?: string | null;
  className?: string;
}) {
  const avatarUrl = resolveAvatarUrl(avatar);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarUrl]);

  if (avatarUrl && !avatarFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Group chat'}
        className={cn('shrink-0 rounded-full border border-border bg-muted object-cover', className)}
        loading="lazy"
        onError={() => setAvatarFailed(true)}
      />
    );
  }

  const visibleMembers = (participants || []).slice(0, 3);

  if (visibleMembers.length === 0) {
    return (
      <div className={cn('flex shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground', className)}>
        <Users className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className={cn('relative shrink-0', className)}>
      {visibleMembers.map((member, index) => (
        <UserProfileImage
          key={member.id}
          user={member}
          className={cn(
            'absolute border-2 border-[#0b111c]',
            visibleMembers.length === 1 && 'inset-0 h-full w-full',
            visibleMembers.length > 1 && index === 0 && 'left-0 top-0 h-[72%] w-[72%]',
            visibleMembers.length > 1 && index === 1 && 'bottom-0 right-0 h-[72%] w-[72%]',
            visibleMembers.length > 2 && index === 2 && 'bottom-0 left-1 h-[50%] w-[50%]',
          )}
        />
      ))}
    </div>
  );
}

const isOlderThan24Hours = (date: string): boolean => {
  const timestamp = new Date(date).getTime();
  return Date.now() - timestamp >= 24 * 60 * 60 * 1000;
};

const formatMessageTime = (date: string): string => {
  const parsed = new Date(date);
  return isOlderThan24Hours(date) ? format(parsed, 'MMM d') : format(parsed, 'h:mm a');
};

const formatMessageTimestamp = (date: string): string => {
  const parsed = new Date(date);
  return isOlderThan24Hours(date) ? format(parsed, 'MMM d, yyyy') : format(parsed, 'h:mm a');
};

const formatLastMessageMeta = (message?: Message | null, currentUserId?: string): string => {
  if (!message?.created_at) {
    return 'No messages yet';
  }

  const direction = message.user_id === currentUserId ? 'Sent' : 'Received';

  return `${direction} ${formatMessageTimestamp(message.created_at)}`;
};

const getInboxDisplayName = (user?: User | null): string => {
  const username = user?.username?.trim();
  const trimmedName = user?.name?.trim();

  if (trimmedName) {
    return trimmedName.split(/\s+/)[0] || trimmedName;
  }

  if (username) {
    return username.startsWith('@') ? username : `@${username}`;
  }

  return 'User';
};

const isGroupConversation = (conversation?: Conversation | null): boolean =>
  conversation?.type === 'group' || (conversation?.participants?.length ?? 0) > 2;

const messageUrlPattern = /(https?:\/\/[^\s]+|\/messages\?join=[^\s]+)/gi;

const renderLinkedMessageText = (content: string) => {
  const parts = content.split(messageUrlPattern);

  return parts.map((part, index) => {
    if (!part.match(messageUrlPattern)) {
      return <span key={`text-${index}`}>{part}</span>;
    }

    const href = part.startsWith('http') ? part : part;
    const isGroupInvite = part.includes('/messages?join=') || part.startsWith('/messages?join=');

    return (
      <a
        key={`link-${index}`}
        href={href}
        className="font-black text-foreground underline decoration-foreground/30 underline-offset-4 hover:text-foreground"
      >
        {isGroupInvite ? 'Join group chat' : part}
      </a>
    );
  });
};

const getConversationDisplayName = (
  conversation: Conversation,
  currentUserId?: string,
): string => {
  if (isGroupConversation(conversation)) {
    return conversation.name?.trim() || `${conversation.participants.length} members`;
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  return getInboxDisplayName(otherParticipant);
};

type GeolocationBrowserError = GeolocationPositionError & {
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
};

const getGeolocationErrorMessage = (
  error: GeolocationBrowserError | null | undefined,
  label = 'location',
): string => {
  if (!error) {
    return `Unable to get your ${label}.`;
  }

  const permissionDeniedCode = error.PERMISSION_DENIED ?? 1;
  const positionUnavailableCode = error.POSITION_UNAVAILABLE ?? 2;
  const timeoutCode = error.TIMEOUT ?? 3;

  if (error.code === permissionDeniedCode) {
    return `Location access was denied. Please allow location permission for this site and try again.`;
  }

  if (error.code === positionUnavailableCode) {
    return `Your device could not determine your ${label}. Try turning on location services and moving to an area with better signal.`;
  }

  if (error.code === timeoutCode) {
    return `Getting your ${label} took too long. Please try again in a moment.`;
  }

  return error.message?.trim() || `Unable to get your ${label}.`;
};

const requestBrowserLocation = async (
  label = 'location',
): Promise<GeolocationPosition> => {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    throw new Error('Location sharing requires a secure HTTPS connection.');
  }

  if (!navigator.geolocation) {
    throw new Error('Location sharing is not supported on this device.');
  }

  const attempt = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  try {
    return await attempt({
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 0,
    });
  } catch (error) {
    const geoError = error as GeolocationBrowserError;

    if ((geoError?.code ?? 0) === (geoError?.PERMISSION_DENIED ?? 1)) {
      throw new Error(getGeolocationErrorMessage(geoError, label));
    }

    try {
      return await attempt({
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 60_000,
      });
    } catch (fallbackError) {
      throw new Error(
        getGeolocationErrorMessage(fallbackError as GeolocationBrowserError, label),
      );
    }
  }
};

const getMessageStatus = (message: Message) => {
  if (message.is_optimistic) {
    return {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: 'Sending',
      shortLabel: '...',
    };
  }

  if (message.read_at) {
    return {
      icon: <CheckCheck className="h-3.5 w-3.5 text-[#1d9bf0]" />,
      label: 'Opened',
      shortLabel: '✓✓',
    };
  }

  if (message.delivered_at) {
    return {
      icon: <Check className="h-3.5 w-3.5 text-white/75" />,
      label: 'Delivered',
      shortLabel: '✓',
    };
  }

  return {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: 'Sending',
    shortLabel: '...',
  };
};

const getStoryReactionAttachment = (message?: Message | null): Attachment | undefined =>
  message?.attachments?.find((attachment) => attachment.type === 'story_reaction');

const normalizeRealtimeMessage = (message: RealtimeConversationMessage): Message => ({
  id: message.id,
  content: message.content,
  user_id: message.user_id,
  conversation_id: message.conversation_id,
  reply_to_message_id: message.reply_to_message_id ?? null,
  reply_to: message.reply_to ?? null,
  message_type: (message.message_type as Message['message_type'] | undefined) ?? 'text',
  attachments: message.attachments ?? [],
  created_at: message.created_at,
  read_at: message.read_at ?? null,
  delivered_at: message.delivered_at ?? null,
  user: {
    id: message.user?.id ?? message.user_id,
    name: message.user?.name ?? 'User',
    avatar: message.user?.avatar,
    avatar_variants: message.user?.avatar_variants,
    username: message.user?.username,
  },
});

// ---------- API Functions ----------
const fetchConversations = async (): Promise<Conversation[]> => {
  const { data } = await axiosInstance.get('/api/conversations');
  return data.data ?? data;
};

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await axiosInstance.get(`/api/conversations/${conversationId}/messages`);
  return (data.data ?? data).sort((a: Message, b: Message) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

const fetchMessage = async (conversationId: string, messageId: string): Promise<Message> => {
  const { data } = await axiosInstance.get(`/api/conversations/${conversationId}/messages/${messageId}`);
  return data.data ?? data;
};

const fetchUser = async (userId: string): Promise<User> => {
  const { data } = await axiosInstance.get(`/api/users/${userId}`);
  return data.data ?? data;
};

const fetchStoryMessageSummary = async (storyId: string): Promise<StoryMessageSummary> => {
  const { data } = await axiosInstance.get(`/api/stories/${storyId}`);
  return data.data ?? data;
};

const sendMessage = async ({ 
  conversationId, 
  content, 
  replyToMessageId,
  socketId 
}: { 
  conversationId: string; 
  content: string; 
  replyToMessageId?: string | null;
  socketId?: string;
}): Promise<Message> => {
  const { data } = await axiosInstance.post(
    `/api/conversations/${conversationId}/messages`,
    { content, reply_to_message_id: replyToMessageId || undefined },
    { headers: socketId ? { 'X-Socket-ID': socketId } : undefined }
  );
  return data.data ?? data;
};

const uploadAttachment = async ({
  conversationId,
  file
}: {
  conversationId: string;
  file: File;
}): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosInstance.post(
    `/api/conversations/${conversationId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.attachment ?? data;
};

const inferMessageTypeFromFile = (file: File): Message['message_type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  const lowerName = file.name.toLowerCase();
  if (
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.txt')
  ) {
    return 'document';
  }
  return 'file';
};

const getAttachmentByType = (message: Message, type: string): Attachment | undefined =>
  message.attachments?.find((attachment) => attachment.type === type);

type ReplyPreviewSource = Pick<Message, 'id' | 'content' | 'user_id' | 'message_type' | 'attachments' | 'user'> | ReplyMessage;

const getReplySummary = (message?: ReplyPreviewSource | null): string => {
  if (!message) return 'Original message';

  const firstAttachment = message.attachments?.[0];
  const trimmedContent = typeof message.content === 'string' ? message.content.trim() : '';

  if (trimmedContent) {
    return trimmedContent.length > 120 ? `${trimmedContent.slice(0, 117)}...` : trimmedContent;
  }

  if (message.message_type === 'image') return firstAttachment?.name || 'Photo';
  if (message.message_type === 'video') return firstAttachment?.name || 'Video';
  if (message.message_type === 'audio') return firstAttachment?.name || 'Audio';
  if (message.message_type === 'document') return firstAttachment?.name || 'Document';
  if (message.message_type === 'file') return firstAttachment?.name || 'File';
  if (message.message_type === 'location') return firstAttachment?.label || 'Location';
  if (message.message_type === 'contact') return firstAttachment?.name || 'Contact';
  if (message.message_type === 'poll') return firstAttachment?.label || 'Poll';
  if (message.message_type === 'event') return firstAttachment?.event_title || firstAttachment?.label || 'Event';
  if (message.message_type === 'call') return 'Call';

  return 'Original message';
};

const getReplyAuthor = (message?: ReplyPreviewSource | null, currentUserId?: string): string => {
  if (!message) return 'Message';
  if (message.user_id === currentUserId) return 'You';
  return getUsernameLabel(message.user);
};

const ReplyQuote = memo(function ReplyQuote({
  message,
  currentUserId,
  className,
  onClick,
}: {
  message?: ReplyPreviewSource | null;
  currentUserId?: string;
  className?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card px-3 py-2', className)}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 h-8 w-1 shrink-0 rounded-full bg-foreground" />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            {getReplyAuthor(message, currentUserId)}
          </p>
          <p className="line-clamp-2 text-[12px] font-medium leading-4 text-muted-foreground">
            {getReplySummary(message)}
          </p>
        </div>
      </div>
    </div>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button
      type="button"
      className="block w-full text-left"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      aria-label="Go to original message"
    >
      {content}
    </button>
  );
});

const sendAttachmentMessage = async ({
  conversationId,
  content,
  attachments,
  messageType,
  replyToMessageId,
  socketId
}: {
  conversationId: string;
  content?: string;
  attachments?: Attachment[];
  messageType: Message['message_type'];
  replyToMessageId?: string | null;
  socketId?: string;
}): Promise<Message> => {
  const { data } = await axiosInstance.post(
    `/api/conversations/${conversationId}/messages`,
    {
      content: content ?? '',
      reply_to_message_id: replyToMessageId || undefined,
      message_type: messageType,
      attachments: attachments ?? []
    },
    { headers: socketId ? { 'X-Socket-ID': socketId } : undefined }
  );
  return data.data ?? data;
};

const sendStructuredMessage = async ({
  conversationId,
  content,
  messageType,
  attachments,
  replyToMessageId,
  socketId,
}: {
  conversationId: string;
  content?: string;
  messageType: Message['message_type'];
  attachments?: Attachment[];
  replyToMessageId?: string | null;
  socketId?: string;
}): Promise<Message> =>
  sendAttachmentMessage({
    conversationId,
    content,
    messageType,
    attachments,
    replyToMessageId,
    socketId,
  });

const updateStructuredMessage = async ({
  conversationId,
  messageId,
  content,
  messageType,
  attachments,
}: {
  conversationId: string;
  messageId: string;
  content?: string;
  messageType?: Message['message_type'];
  attachments?: Attachment[];
}): Promise<Message> => {
  const { data } = await axiosInstance.patch(
    `/api/conversations/${conversationId}/messages/${messageId}`,
    {
      content,
      message_type: messageType,
      attachments,
    },
  );

  return data.data ?? data;
};

const markConversationAsRead = async (conversationId: string): Promise<void> => {
  await axiosInstance.post(`/api/conversations/${conversationId}/read`);
};

const createConversation = async ({
  participantIds,
  type = participantIds.length > 1 ? 'group' : 'private',
  name,
  avatar,
}: CreateConversationPayload): Promise<Conversation> => {
  const formData = new FormData();
  participantIds.forEach((id) => formData.append('participant_ids[]', id));
  formData.append('type', type);
  if (name?.trim()) formData.append('name', name.trim());
  if (avatar) formData.append('avatar', avatar);

  const { data } = await axiosInstance.post('/api/conversations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data ?? data;
};

const updateGroupConversation = async ({
  conversationId,
  name,
  avatar,
}: {
  conversationId: string;
  name?: string;
  avatar?: File | null;
}): Promise<Conversation> => {
  const formData = new FormData();
  if (name?.trim()) formData.append('name', name.trim());
  if (avatar) formData.append('avatar', avatar);

  const { data } = await axiosInstance.post(`/api/conversations/${conversationId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data ?? data;
};

const addGroupMembers = async ({
  conversationId,
  participantIds,
}: {
  conversationId: string;
  participantIds: string[];
}): Promise<Conversation> => {
  const { data } = await axiosInstance.post(`/api/conversations/${conversationId}/members`, {
    participant_ids: participantIds,
  });

  return data.data ?? data;
};

const removeGroupMember = async ({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<Conversation> => {
  const { data } = await axiosInstance.delete(`/api/conversations/${conversationId}/members/${userId}`);
  return data.data ?? data;
};

const blockGroupMember = async ({
  conversationId,
  userId,
}: {
  conversationId: string;
  userId: string;
}): Promise<Conversation> => {
  const { data } = await axiosInstance.post(`/api/conversations/${conversationId}/members/${userId}/block`);
  return data.data ?? data;
};

const leaveGroupConversation = async (conversationId: string): Promise<void> => {
  await axiosInstance.post(`/api/conversations/${conversationId}/leave`);
};

const joinGroupByInvite = async (token: string): Promise<Conversation> => {
  const { data } = await axiosInstance.post(`/api/conversations/join/${token}`);
  return data.data ?? data;
};

const fetchBusinessPages = async (scope: 'mine' | 'following'): Promise<BusinessPageSummary[]> => {
  const { data } = await axiosInstance.get('/api/business-pages', { params: { scope } });
  return data.data ?? data;
};

const VOICE_WAVEFORM_BARS = [
  8, 12, 18, 10, 22, 15, 9, 19, 13, 24, 10, 16, 21,
  12, 18, 9, 15, 23, 13, 17, 10, 21, 16, 9, 19, 12,
];

const formatVoiceTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

function VoiceNotePlayer({ src, isOwn }: { src: string; isOwn: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const activeBarCount = Math.round(progress * VOICE_WAVEFORM_BARS.length);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
      return;
    }

    audio.pause();
  }, []);

  const seekVoiceNote = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const nextProgress = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    audio.currentTime = nextProgress * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  return (
    <div className="flex min-w-[190px] items-center gap-2 rounded-[16px] bg-muted/80 px-2 py-1.5">
      <button
        type="button"
        onClick={togglePlayback}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition active:scale-95',
          isOwn ? 'bg-white text-[#262626]' : 'bg-[#2fd26f] text-[#06160b]',
        )}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
      </button>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={seekVoiceNote}
          className="flex h-8 w-full items-center gap-[2px] rounded-full px-0.5"
          aria-label="Seek voice note"
        >
          {VOICE_WAVEFORM_BARS.map((height, index) => {
            const isActive = index < activeBarCount;

            return (
              <span
                key={`${height}-${index}`}
                className={cn(
                  'w-[2px] rounded-full transition-colors duration-150',
                  isActive ? 'bg-[#2fd26f]' : 'bg-white/35',
                )}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </button>
        <div className="flex items-center justify-between px-1 text-[10px] font-bold text-muted-foreground">
          <span>{formatVoiceTime(currentTime)}</span>
          <span>{duration > 0 ? formatVoiceTime(duration) : '--:--'}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        loop
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}

// ---------- Components ----------

// Message Bubble
const MessageBubble = memo(function MessageBubble({ 
  message, 
  isOwn, 
  currentUserId,
  showTimestamp,
  showStatus,
  showSenderName,
  isSelected,
  onReply,
  onJumpToMessage,
}: { 
  message: Message; 
  isOwn: boolean; 
  currentUserId?: string;
  showTimestamp: boolean;
  showStatus: boolean;
  showSenderName?: boolean;
  isSelected?: boolean;
  onReply?: (message: Message) => void;
  onJumpToMessage?: (messageId: string) => void;
}) {
  const firstAttachment = message.attachments?.[0];
  const storyReactionAttachment = getStoryReactionAttachment(message);
  const locationAttachment = getAttachmentByType(message, 'location_share');
  const contactAttachment = getAttachmentByType(message, 'contact_share');
  const pollAttachment = getAttachmentByType(message, 'poll_share');
  const eventAttachment = getAttachmentByType(message, 'event_share');
  const navigate = useNavigate();
  const storyId = storyReactionAttachment?.story_id;
  const { data: linkedStory } = useQuery({
    queryKey: ['story-message-summary', storyId],
    queryFn: () => fetchStoryMessageSummary(storyId as string),
    enabled: Boolean(storyId),
    staleTime: 30_000,
  });
  const isImage = message.message_type === 'image' && firstAttachment?.url;
  const isVideo = message.message_type === 'video' && firstAttachment?.url;
  const isFile = message.message_type === 'file' && firstAttachment?.url;
  const isAudio = message.message_type === 'audio' && firstAttachment?.url;
  const isDocument = message.message_type === 'document' && firstAttachment?.url;
  const messageStatus = getMessageStatus(message);
  const storyViewCount = linkedStory?.story?.view_count;
  const showSenderProfile = Boolean(showSenderName && !isOwn);
  const senderProfileUrl = !isOwn && message.user?.username ? `/@${message.user.username}` : null;
  const bubbleClassName = cn(
    'rounded-[18px] px-3.5 py-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.18)]',
    isOwn
      ? 'rounded-br-[6px] bg-primary text-primary-foreground'
      : 'rounded-bl-[6px] bg-muted text-foreground',
    (isImage || isVideo) ? 'overflow-hidden px-2.5 py-2.5' : '',
  );
  const handleSelectReply = useCallback(() => {
    if (!message.is_optimistic) {
      onReply?.(message);
    }
  }, [message, onReply]);

  return (
    <div
      className={cn(
        `flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-1.5 rounded-[24px] px-0.5 py-0.5 transition`,
        isSelected ? 'bg-muted ring-1 ring-white/25' : '',
      )}
      onDoubleClick={handleSelectReply}
      onContextMenu={(event) => {
        event.preventDefault();
        handleSelectReply();
      }}
    >
      {showSenderProfile ? (
        <button
          type="button"
          className="mb-4 shrink-0"
          onClick={() => message.user?.username && navigate(`/@${message.user.username}`)}
          aria-label={`View ${getUsernameLabel(message.user)} profile`}
        >
          <UserProfileImage user={message.user} className="h-8 w-8" />
        </button>
      ) : null}
      <div className={`group/message max-w-[78%] sm:max-w-[66%] ${message.is_optimistic ? 'opacity-70' : ''}`}>
        {showSenderName ? (
          <p className={`mb-0.5 px-1 text-[10px] font-black uppercase tracking-[0.08em] ${isOwn ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}`}>
            {senderProfileUrl ? (
              <button
                type="button"
                className="rounded-full transition hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                onClick={() => navigate(senderProfileUrl)}
                aria-label={`View ${getUsernameLabel(message.user)} profile`}
              >
                {getUsernameLabel(message.user)}
              </button>
            ) : (
              isOwn ? 'You' : getUsernameLabel(message.user)
            )}
          </p>
        ) : null}
        <div
          className={bubbleClassName}
        >
          {message.reply_to ? (
            <ReplyQuote
              message={message.reply_to}
              currentUserId={currentUserId}
              className="mb-1.5"
              onClick={() => onJumpToMessage?.(message.reply_to!.id)}
            />
          ) : message.reply_to_message_id ? (
            <ReplyQuote
              currentUserId={currentUserId}
              className="mb-1.5"
              onClick={() => onJumpToMessage?.(message.reply_to_message_id!)}
            />
          ) : null}
          {isImage ? (
            <div className="grid space-y-2">
              <img
                src={firstAttachment.url}
                alt={firstAttachment.name || 'Image'}
                className="max-h-64 w-full rounded-[18px] object-cover"
                loading="lazy"
              />
              {message.content && (
                <p className="text-[13px] font-medium break-words">{renderLinkedMessageText(message.content)}</p>
              )}
            </div>
          ) : isVideo ? (
            <div className="grid space-y-2">
              <video
                src={firstAttachment.url}
                className="max-h-72 w-full rounded-[18px] bg-black object-cover"
                controls
                playsInline
                preload="metadata"
              />
              <p className="text-[13px] font-medium break-words text-foreground">
                {firstAttachment.name || 'Video'}
              </p>
            </div>
          ) : isFile ? (
            <a
              href={firstAttachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-1 py-1"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black tracking-[0.12em]">
                FILE
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">
                  {firstAttachment.name || 'Attachment'}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {firstAttachment.mime_type || 'File'}
                </p>
              </div>
            </a>
          ) : isAudio ? (
            <VoiceNotePlayer src={firstAttachment.url} isOwn={isOwn} />
          ) : isDocument ? (
            <a
              href={firstAttachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[18px] bg-muted px-3 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">
                  {firstAttachment.name || 'Document'}
                </p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {firstAttachment.mime_type || 'Document'}
                </p>
              </div>
            </a>
          ) : message.message_type === 'location' && locationAttachment ? (
            <a
              href={locationAttachment.map_url || '#'}
              target="_blank"
              rel="noreferrer"
              className="block rounded-[18px] bg-muted px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold">
                      {locationAttachment.label || 'Shared location'}
                    </p>
                    {locationAttachment.live ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        Live
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {locationAttachment.address || `${locationAttachment.latitude}, ${locationAttachment.longitude}`}
                  </p>
                  {locationAttachment.last_updated_at ? (
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      Updated {new Date(locationAttachment.last_updated_at).toLocaleTimeString()}
                    </p>
                  ) : null}
                </div>
              </div>
            </a>
          ) : message.message_type === 'contact' && contactAttachment ? (
            <div className="rounded-[18px] bg-muted px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
                  <Contact className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">
                    {contactAttachment.name || 'Shared contact'}
                  </p>
                  {contactAttachment.organization ? (
                    <p className="truncate text-[13px] text-muted-foreground">{contactAttachment.organization}</p>
                  ) : null}
                </div>
              </div>
              {contactAttachment.phone ? (
                <p className="mt-3 text-[14px] font-medium text-foreground/80">{contactAttachment.phone}</p>
              ) : null}
              {contactAttachment.email ? (
                <p className="mt-1 text-[13px] text-muted-foreground">{contactAttachment.email}</p>
              ) : null}
            </div>
          ) : message.message_type === 'poll' && pollAttachment ? (
            <div className="rounded-[18px] bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-[#7ee7ff]" />
                <p className="text-[15px] font-semibold">{pollAttachment.label || 'Poll'}</p>
              </div>
              <div className="mt-3 space-y-2">
                {(pollAttachment.options || []).map((option) => (
                  <div key={option} className="rounded-xl border border-border px-3 py-2 text-[13px] text-foreground">
                    {option}
                  </div>
                ))}
              </div>
              {typeof pollAttachment.total_votes === 'number' ? (
                <p className="mt-3 text-[12px] text-muted-foreground">{pollAttachment.total_votes} total votes</p>
              ) : null}
            </div>
          ) : message.message_type === 'event' && eventAttachment ? (
            <div className="rounded-[18px] bg-muted px-4 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#7ee7ff]" />
                <p className="text-[15px] font-semibold">{eventAttachment.event_title || eventAttachment.label || 'Event'}</p>
              </div>
              {eventAttachment.starts_at ? (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {new Date(eventAttachment.starts_at).toLocaleString()}
                  {eventAttachment.ends_at ? ` - ${new Date(eventAttachment.ends_at).toLocaleString()}` : ''}
                </p>
              ) : null}
              {eventAttachment.venue ? (
                <p className="mt-1 text-[13px] text-muted-foreground">{eventAttachment.venue}</p>
              ) : null}
              {eventAttachment.notes ? (
                <p className="mt-2 text-[13px] text-muted-foreground">{eventAttachment.notes}</p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-1">
              {storyReactionAttachment ? (
                <button
                  type="button"
                  onClick={() => {
                    if (storyId) {
                      navigate(`/app?story=${storyId}`);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#7ee7ff]"
                >
                  <MessageCircle className="h-3 w-3" />
                  <span>{isOwn ? 'Reply from status' : 'Message from status'}</span>
                  {typeof storyViewCount === 'number' ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{storyViewCount}</span>
                    </span>
                  ) : null}
                </button>
              ) : null}
              <p className="text-[15px] font-medium leading-[1.35] break-words whitespace-pre-wrap">
                {renderLinkedMessageText(message.content)}
              </p>
            </div>
          )}
        </div>
        <div className={`mt-0.5 flex items-center gap-1 px-1 text-[10px] font-semibold text-muted-foreground ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <button
            type="button"
            className="mr-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover/message:opacity-100"
            onClick={handleSelectReply}
            disabled={message.is_optimistic}
            aria-label="Reply to this message"
          >
            <Reply className="h-2.5 w-2.5" />
            <span>Reply</span>
          </button>
          {showTimestamp && (
            <span>{formatMessageTimestamp(message.created_at)}</span>
          )}
          {isOwn && showStatus && (
            <span title={messageStatus.label} aria-label={messageStatus.label}>
              {messageStatus.icon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// Message List with Virtualization
const MessageList = memo(function MessageList({ 
  messages, 
  currentUserId,
  isLoading,
  onLoadMore,
  hasMore,
  isGroup,
  conversationId,
  replyingToMessageId,
  onReply,
}: { 
  messages: Message[]; 
  currentUserId?: string;
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isGroup?: boolean;
  conversationId?: string;
  replyingToMessageId?: string | null;
  onReply?: (message: Message) => void;
}) {
  const queryClient = useQueryClient();
  const parentRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [jumpedMessageId, setJumpedMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const didInitialScrollRef = useRef(false);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  // Scroll to bottom on new messages if user was near bottom
  const handleScroll = useCallback(() => {
    if (!parentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    const el = parentRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = parentRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    didInitialScrollRef.current = false;
    setJumpedMessageId(null);
  }, [conversationId]);

  const revealMessage = useCallback((messageId: string, list: Message[] = messages) => {
    const index = list.findIndex((message) => message.id === messageId);

    if (index === -1) {
      return false;
    }

    rowVirtualizer.scrollToIndex(index, { align: 'center' });
    setJumpedMessageId(messageId);
    window.setTimeout(() => {
      setJumpedMessageId((current) => (current === messageId ? null : current));
    }, 1800);
    return true;
  }, [messages, rowVirtualizer]);

  const handleJumpToMessage = useCallback(async (messageId: string) => {
    if (revealMessage(messageId)) {
      return;
    }

    if (!conversationId) {
      window.alert('The original message could not be opened.');
      return;
    }

    try {
      const loadedMessage = await fetchMessage(conversationId, messageId);
      const nextMessages = [...messages.filter((message) => message.id !== loadedMessage.id), loadedMessage].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      queryClient.setQueryData<Message[]>(['messages', conversationId], nextMessages);
      window.setTimeout(() => {
        revealMessage(messageId, nextMessages);
      }, 120);
    } catch {
      window.alert('The original message could not be loaded.');
    }
  }, [conversationId, messages, queryClient, revealMessage]);

  // Jump to latest message when opening/loading a conversation, then keep smooth auto-scroll near the bottom.
  useEffect(() => {
    if (!parentRef.current) return;
    if (!didInitialScrollRef.current && messages.length > 0 && !isLoading) {
      requestAnimationFrame(() => {
        scrollToBottom('auto');
        setShowScrollButton(false);
      });
      didInitialScrollRef.current = true;
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (isNearBottom || messages.length === 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden">
      <div
        ref={parentRef}
        className="h-full overflow-y-auto px-4 py-3 sm:px-5 sm:py-4"
        onScroll={handleScroll}
      >
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-muted px-6 py-1.5 text-[12px] font-black text-foreground">
            Today
          </div>
        </div>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const message = messages[virtualRow.index];
            const nextMessage = messages[virtualRow.index + 1];
            const isOwn = message.user_id === currentUserId;
            const showTimestamp = true;
            const showStatus = isOwn && virtualRow.index === messages.length - 1;

            return (
              <div
                key={message.id}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  currentUserId={currentUserId}
                  showTimestamp={showTimestamp}
                  showStatus={showStatus}
                  showSenderName={isGroup}
                  isSelected={message.id === replyingToMessageId || message.id === jumpedMessageId}
                  onReply={onReply}
                  onJumpToMessage={handleJumpToMessage}
                />
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#71767b]" />
          </div>
        )}
      </div>
      {showScrollButton && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full border-border bg-background/90 text-foreground hover:bg-muted"
          onClick={scrollToBottom}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
});

// Conversation Item
const ConversationItem = memo(function ConversationItem({ 
  conversation, 
  currentUserId,
  isSelected,
  onClick
}: { 
  conversation: Conversation; 
  currentUserId?: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  const isGroup = isGroupConversation(conversation);
  const displayName = getConversationDisplayName(conversation, currentUserId);
  const lastMessage = conversation.last_message;
  const isUnread = conversation.unread_count && conversation.unread_count > 0;
  const presence = getPresenceState(otherParticipant);
  const lastMessageMeta = formatLastMessageMeta(lastMessage, currentUserId);

  let lastMessagePreview = '';
  if (lastMessage) {
    const storyReactionAttachment = getStoryReactionAttachment(lastMessage);
    const ownPrefix =
      lastMessage.user_id === currentUserId
        ? `${getMessageStatus(lastMessage).shortLabel} You: `
        : isGroup
          ? `${getInboxDisplayName(lastMessage.user)}: `
          : '';
    lastMessagePreview = ownPrefix;
    if (storyReactionAttachment) {
      const emoji = storyReactionAttachment.emoji || lastMessage.content || 'Message';
      lastMessagePreview += lastMessage.user_id === currentUserId
        ? `From status ${emoji}`
        : `Sent from status ${emoji}`;
    } else if (lastMessage.message_type === 'image') {
      lastMessagePreview += '📷 Photo';
    } else if (lastMessage.message_type === 'video') {
      lastMessagePreview += '🎬 Video';
    } else if (lastMessage.message_type === 'file') {
      lastMessagePreview += '📎 File';
    } else if (lastMessage.message_type === 'audio') {
      lastMessagePreview += '🎵 Audio';
    } else if (lastMessage.message_type === 'document') {
      lastMessagePreview += '📄 Document';
    } else if (lastMessage.message_type === 'location') {
      lastMessagePreview += '📍 Location';
    } else if (lastMessage.message_type === 'contact') {
      lastMessagePreview += '👤 Contact';
    } else if (lastMessage.message_type === 'poll') {
      lastMessagePreview += '📊 Poll';
    } else if (lastMessage.message_type === 'event') {
      lastMessagePreview += '🗓️ Event';
    } else if (lastMessage.message_type === 'call') {
      const callRecord = lastMessage.attachments?.find(a => (a as any).type === 'call_record');
      const status = (callRecord as any)?.status;
      const isOutgoing = lastMessage.user_id === currentUserId;
      if (status === 'missed') {
        lastMessagePreview += isOutgoing ? 'No answer' : 'Missed call';
      } else {
        lastMessagePreview += isOutgoing ? 'Outgoing call' : 'Incoming call';
      }
    } else {
      lastMessagePreview += lastMessage.content || 'No message';
    }
  } else {
    lastMessagePreview = 'No messages yet';
  }

  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-[26px] border border-border bg-card px-4 py-4 transition-colors hover:bg-muted ${
        isSelected ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <button
        type="button"
        className="flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          if (!isGroup && otherParticipant?.username) navigate(`/@${otherParticipant.username}`);
        }}
        aria-label={isGroup ? `Open ${displayName}` : `View ${otherParticipant?.name}'s profile`}
      >
      <div className="relative">
        {isGroup ? (
          <GroupProfileStack
            participants={conversation.participants}
            avatar={conversation.avatar}
            name={displayName}
            className="h-12 w-12"
          />
        ) : (
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage
              src={resolveAvatarUrl(otherParticipant?.avatar)}
              alt={otherParticipant?.name}
              onError={(e) => handleAvatarError(e, otherParticipant)}
            />
            <AvatarFallback>{otherParticipant?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`truncate text-[16px] ${isUnread ? 'font-extrabold text-foreground' : 'font-bold text-foreground'}`}>
              {displayName}
            </span>
            {!isGroup && presence.isOnline ? (
              <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]" />
            ) : null}
          </div>
          {lastMessage && (
            <span className={`${isUnread ? 'text-foreground font-bold' : 'text-muted-foreground'} whitespace-nowrap text-xs font-semibold`}>
              {formatMessageTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        <p className={`mt-1 text-sm truncate ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
          {lastMessagePreview}
        </p>
        <div className="mt-1 flex items-center gap-2">
          {isGroup ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {conversation.participants.length} members
            </span>
          ) : !presence.isOnline ? (
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {presence.statusLabel}
            </span>
          ) : null}
          {!isGroup && !presence.isOnline ? (
            <span className="truncate text-[11px] text-muted-foreground">{presence.detailLabel}</span>
          ) : null}
        </div>
        {isGroup && conversation.created_by === currentUserId ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Created by you
          </p>
        ) : null}
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{lastMessageMeta}</p>
        {isUnread ? (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Unread message
          </p>
        ) : null}
      </div>
      {isUnread && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">
          {Math.min(conversation.unread_count || 0, 9)}
        </div>
      )}
    </div>
  );
});

// Conversation List
const ConversationList = memo(function ConversationList({ 
  conversations, 
  currentUserId,
  selectedId,
  onSelect,
  isLoading,
  searchQuery,
  onSearchChange,
  suggestedUsers,
  onStartNewChat,
  onCreateGroup,
  onOpenActions,
}: { 
  conversations: Conversation[]; 
  currentUserId?: string;
  selectedId?: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestedUsers: User[];
  onStartNewChat: (user: User) => void;
  onCreateGroup: () => void;
  onOpenActions: () => void;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"messages" | "groups" | "pages">("messages");
  const { data: ownedPages = [], isLoading: ownedPagesLoading } = useQuery({
    queryKey: ['business-pages', 'messages-tab', 'mine'],
    queryFn: () => fetchBusinessPages('mine'),
    enabled: activeTab === 'pages',
    staleTime: 30_000,
  });
  const { data: followedPages = [], isLoading: followedPagesLoading } = useQuery({
    queryKey: ['business-pages', 'messages-tab', 'following'],
    queryFn: () => fetchBusinessPages('following'),
    enabled: activeTab === 'pages',
    staleTime: 30_000,
  });
  const visibleConversations = useMemo(() => {
    if (activeTab === 'groups') {
      return conversations.filter((conversation) => isGroupConversation(conversation));
    }

    return conversations;
  }, [activeTab, conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return visibleConversations;
    const lower = searchQuery.toLowerCase();
    return visibleConversations.filter(conv =>
      conv.name?.toLowerCase().includes(lower) ||
      conv.participants.some(p => 
        p.name.toLowerCase().includes(lower) || 
        p.username?.toLowerCase().includes(lower)
      )
    );
  }, [searchQuery, visibleConversations]);

  const visiblePages = useMemo(() => {
    const map = new Map<string, BusinessPageSummary>();
    [...ownedPages, ...followedPages].forEach((page) => map.set(page.id, page));
    const pages = Array.from(map.values());

    if (!searchQuery.trim()) {
      return pages;
    }

    const lower = searchQuery.toLowerCase();
    return pages.filter((page) =>
      page.name.toLowerCase().includes(lower) ||
      page.slug.toLowerCase().includes(lower) ||
      page.category?.toLowerCase().includes(lower)
    );
  }, [followedPages, ownedPages, searchQuery]);
  const pagesLoading = ownedPagesLoading || followedPagesLoading;

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent md:border-r md:border-border md:bg-background/95">
      {/* Header */}
      <div className="mobile-safe-top sticky top-0 z-10 px-3 pt-4 md:border-b md:border-border md:bg-background/90 md:px-0 md:pt-0 md:backdrop-blur-xl">
        <div className="mx-auto max-w-[430px] overflow-hidden rounded-[38px] border border-border bg-card shadow-sm md:max-w-none md:rounded-none md:border-0 md:bg-transparent md:shadow-none">
          <div className="px-5 pb-4 pt-5 md:px-4 md:pb-3 md:pt-3">
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] font-black tracking-tight text-foreground md:text-xl md:font-bold">
                Inbox
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  onClick={onCreateGroup}
                  aria-label="Create group chat"
                >
                  <Users className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-border bg-muted text-white/75 hover:text-white"
                  onClick={onOpenActions}
                  aria-label="Open message actions"
                >
                  <Search className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/pages')}
              className="mt-4 flex w-full items-center justify-between rounded-[22px] border border-border bg-muted/50 px-4 py-3 text-left text-sm font-black text-foreground transition hover:bg-muted"
            >
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4" />
                Create business page
              </span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Pages
              </span>
            </button>

            <div className="mt-5 flex items-center gap-6 border-b border-border pb-4">
              {[
                { id: "messages" as const, label: "Messages" },
                { id: "groups" as const, label: "Groups" },
                { id: "pages" as const, label: "Pages" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-1 text-[15px] font-extrabold ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                    {isActive ? (
                      <span className="absolute inset-x-0 -bottom-4 h-[3px] rounded-full bg-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search messages"
                  className="h-11 rounded-2xl border border-border bg-muted pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71767b]" />
                <Input
                  placeholder="Search messages"
                  className="h-11 rounded-2xl border border-border bg-muted pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 md:px-0 md:pt-0">
        {isLoading && conversations.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[26px] border border-border bg-muted/30 px-4 py-4">
                <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-muted" />
                  <Skeleton className="h-3 w-40 bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'pages' ? (
          pagesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[26px] border border-border bg-muted/30 px-4 py-4">
                  <Skeleton className="h-12 w-12 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 bg-muted" />
                    <Skeleton className="h-3 w-40 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : visiblePages.length > 0 ? (
            <div className="space-y-3">
              <div className="rounded-[26px] border border-border bg-muted/40 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                  Your pages
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pages you created or follow
                </p>
              </div>
              {visiblePages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => navigate(`/pages/${page.slug}`)}
                  className="flex w-full items-center gap-3 rounded-[26px] border border-border bg-card px-4 py-4 text-left transition hover:bg-muted"
                >
                  {page.avatar ? (
                    <img src={page.avatar} alt={page.name} className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                      <BriefcaseBusiness className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[16px] font-extrabold text-foreground">{page.name}</p>
                      {page.is_owner ? (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary">
                          Yours
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {page.category || 'Business page'} · {page.follower_count ?? 0} followers
                    </p>
                    {page.is_following && !page.is_owner ? (
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        Following
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-1">
              <MobileEmptyState
                icon={BriefcaseBusiness}
                title="No pages yet"
                description="Create a business page or follow pages to see them here."
              />
            </div>
          )
        ) : activeTab === 'groups' && filteredConversations.length > 0 ? (
          <div className="space-y-3">
            <div className="rounded-[26px] border border-border bg-muted/40 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                Your groups
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredConversations.length} group{filteredConversations.length === 1 ? '' : 's'} available
              </p>
            </div>
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                isSelected={conv.id === selectedId}
                onClick={() => onSelect(conv)}
              />
            ))}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                isSelected={conv.id === selectedId}
                onClick={() => onSelect(conv)}
              />
            ))}
          </div>
        ) : activeTab === 'groups' ? (
          <div className="px-1">
            <MobileEmptyState
              icon={Users}
              title="No groups yet"
              description="Tap the group button at the top to create your first group chat."
            />
          </div>
        ) : searchQuery ? (
          <div className="p-1">
            {suggestedUsers.length > 0 ? (
              <>
                <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">People</p>
                {suggestedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="mb-2 flex cursor-pointer items-center gap-3 rounded-[22px] border border-border bg-muted/30 p-3 hover:bg-white/[0.08]"
                    onClick={() => onStartNewChat(user)}
                  >
                    <UserProfileImage user={user} className="h-10 w-10" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{getUsernameLabel(user)}</p>
                      <p className="text-xs text-[#71767b] truncate">{user.name}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No results found</p>
            )}
          </div>
        ) : (
          <div className="px-1">
            <MobileEmptyState
              icon={MessageCircle}
              title="No conversations yet"
              description="Search for people to start chatting."
            />
          </div>
        )}
      </div>
    </div>
  );
});

// Chat Header
const ChatHeader = memo(function ChatHeader({ 
  user, 
  conversation,
  presence,
  onBack,
  onAudioCall,
  onVideoCall,
  canCall,
  callStatus,
  activeCallMode,
  onOpenActions,
}: { 
  user: User; 
  conversation?: Conversation;
  presence: {
    isOnline: boolean;
    statusLabel: string;
    detailLabel: string;
  };
  onBack: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  canCall: boolean;
  callStatus: CallStatus;
  activeCallMode?: 'audio' | 'video';
  onOpenActions?: () => void;
}) {
  const navigate = useNavigate();
  const isGroup = isGroupConversation(conversation);
  const displayName = conversation && isGroup
    ? getConversationDisplayName(conversation, user.id)
    : getInboxDisplayName(user);
  const callStatusLabelMap: Record<CallStatus, string> = {
    idle: '',
    incoming: 'Incoming',
    calling: 'Calling',
    restoring: 'Restoring',
    awaiting_approval: 'Awaiting approval',
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    in_call: 'In call',
    ended: 'Ended',
    error: 'Error',
  };
  const showStatus = callStatus !== 'idle';
  const callUnavailableReason = !canCall ? 'You can start a new call only when no active call is running.' : undefined;

  return (
    <div className="mobile-safe-top sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mobile-safe-x flex items-center gap-3 px-3 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-10 w-10 rounded-full text-foreground hover:bg-muted hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="h-7 w-7" />
      </Button>

      <button
        type="button"
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer text-left"
        onClick={() => !isGroup && user.username && navigate(`/@${user.username}`)}
        aria-label={isGroup ? `Open ${displayName}` : `View ${displayName}'s profile`}
      >
      {isGroup ? (
        <GroupProfileStack
          participants={conversation?.participants}
          avatar={conversation?.avatar}
          name={displayName}
          className="h-12 w-12"
        />
      ) : (
        <Avatar className="h-12 w-12 border-2 border-emerald-400/80">
          <AvatarImage
            src={resolveAvatarUrl(user.avatar)}
            alt={user.name}
            onError={(e) => handleAvatarError(e, user)}
          />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[18px] font-extrabold text-foreground">{displayName}</p>
          {!isGroup && presence.isOnline ? (
            <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.85)]" />
          ) : null}
        </div>
        {showStatus ? (
          <div className="flex items-center gap-2">
            <p className="text-xs font-extrabold tracking-[0.14em] text-foreground uppercase truncate">
              {callStatusLabelMap[callStatus]}
            </p>
            <span className="rounded-full border border-amber-200/25 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-100">
              {callStatusLabelMap[callStatus]}{activeCallMode ? ` · ${activeCallMode}` : ''}
            </span>
          </div>
        ) : (
          <div className="min-w-0">
            {isGroup ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] truncate text-muted-foreground">
                  {conversation?.participants.length ?? 0} members
                </p>
            ) : !presence.isOnline ? (
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] truncate text-muted-foreground">
                  {presence.statusLabel}
                </p>
              </div>
            ) : null}
            {!isGroup && !presence.isOnline ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{presence.detailLabel}</p>
            ) : null}
          </div>
        )}
      </div>
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        disabled={!canCall}
        onClick={onVideoCall}
        title={callUnavailableReason}
      >
        <Video className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        disabled={!canCall}
        onClick={onAudioCall}
        title={callUnavailableReason}
      >
        <Phone className="h-6 w-6" />
      </Button>
      {onOpenActions ? (
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-10 w-10 rounded-full text-foreground hover:bg-muted hover:text-white sm:inline-flex"
          onClick={onOpenActions}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      ) : null}
      </div>
    </div>
  );
});

const GroupChatTools = memo(function GroupChatTools({
  conversation,
  currentUserId,
  isAdmin,
  isOpen,
  onToggleOpen,
  groupSearch,
  onGroupSearchChange,
  availableUsers,
  isSearching,
  onAddUser,
  onBlockUser,
  onMessageUser,
  addPending,
  blockPending,
}: {
  conversation: Conversation;
  currentUserId?: string;
  isAdmin: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  groupSearch: string;
  onGroupSearchChange: (value: string) => void;
  availableUsers: User[];
  isSearching: boolean;
  onAddUser: (user: User) => void;
  onBlockUser: (user: User) => void;
  onMessageUser: (user: User) => void;
  addPending: boolean;
  blockPending: boolean;
}) {
  const inviteUrl = conversation.invite_url || '';
  const copyInvite = () => {
    if (!inviteUrl) {
      window.alert('Invite link is being prepared. Refresh this group and try again.');
      return;
    }

    navigator.clipboard?.writeText(inviteUrl);
    window.alert('Group invite link copied.');
  };

  return (
    <div className="border-b border-border bg-background/95 px-3 py-3 backdrop-blur-xl sm:px-4">
      <div className="rounded-[22px] border border-border bg-muted/40 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              Group chat
            </p>
            <p className="mt-1 truncate text-sm font-bold text-foreground">
              {conversation.participants.length} members
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              size="sm"
              className="h-10 shrink-0 rounded-2xl bg-primary px-4 text-xs font-black text-primary-foreground hover:bg-primary/90"
              onClick={onToggleOpen}
            >
              <Users className="mr-2 h-4 w-4" />
              Members
              {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
            {isOpen ? (
              <Button
                type="button"
                size="sm"
                className="h-10 shrink-0 rounded-2xl bg-white px-4 text-xs font-black text-[#03111f] hover:bg-white/90"
                onClick={copyInvite}
                disabled={!inviteUrl}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy join link
              </Button>
            ) : null}
          </div>
        </div>

        {isOpen ? (
          <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {isAdmin ? (
            <div className="rounded-2xl border border-border bg-card p-3">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Add user inside group
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={groupSearch}
                  onChange={(event) => onGroupSearchChange(event.target.value)}
                  placeholder="Search users to add"
                  className="h-10 rounded-2xl border border-border bg-muted pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              {groupSearch.trim() ? (
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                  {isSearching ? (
                    <div className="flex items-center justify-center rounded-2xl bg-muted py-4 text-xs text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </div>
                  ) : availableUsers.length > 0 ? (
                    availableUsers.slice(0, 5).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-2xl bg-muted/50 p-2 text-left hover:bg-white/[0.09]"
                        disabled={addPending}
                        onClick={() => onAddUser(user)}
                      >
                        <UserProfileImage user={user} className="h-9 w-9" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-foreground">{getUsernameLabel(user)}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{user.name}</p>
                        </div>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-muted py-4 text-center text-xs text-muted-foreground">No users found</p>
                  )}
                </div>
              ) : null}
            </div>
            ) : null}

            <div className={cn('rounded-2xl border border-border bg-card p-3', !isAdmin && 'xl:col-span-2')}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                Members
              </p>
              <div className="flex max-h-44 flex-col gap-2 overflow-y-auto pr-1">
                {conversation.participants.map((member) => {
                  const isMe = member.id === currentUserId;
                  const isGroupAdmin = member.id === conversation.created_by;

                  return (
                    <div key={member.id} className="flex items-center gap-2 rounded-2xl bg-muted/50 p-2">
                      <UserProfileImage user={member} className="h-9 w-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">
                          {getUsernameLabel(member)}{isMe ? ' (You)' : ''}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {isGroupAdmin ? 'Group admin' : member.name}
                        </p>
                      </div>
                      {!isMe ? (
                        <button
                          type="button"
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[11px] font-black text-primary"
                          onClick={() => onMessageUser(member)}
                        >
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </button>
                      ) : null}
                      {isAdmin && !isMe && !isGroupAdmin ? (
                        <button
                          type="button"
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-black text-red-200"
                          disabled={blockPending}
                          onClick={() => onBlockUser(member)}
                        >
                          <Ban className="h-3 w-3" />
                          Block
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
});

type ShareMode = 'menu' | 'location' | 'contact' | 'poll' | 'event';

type StructuredSharePayload = {
  content?: string;
  messageType: Message['message_type'];
  attachments: Attachment[];
};

// Message Input
const MessageInput = memo(function MessageInput({ 
  onSendMessage, 
  onSendAttachment,
  onSendStructuredMessage,
  onShareLiveLocation,
  onStopLiveLocation,
  isSending,
  isUploading,
  isSharing,
  isLiveSharingActive,
  initialText,
  replyingTo,
  currentUserId,
  onCancelReply,
}: { 
  onSendMessage: (text: string) => void;
  onSendAttachment: (file: File) => void;
  onSendStructuredMessage: (payload: StructuredSharePayload) => void;
  onShareLiveLocation: (label?: string) => void;
  onStopLiveLocation: () => void;
  isSending: boolean;
  isUploading: boolean;
  isSharing: boolean;
  isLiveSharingActive: boolean;
  initialText?: string;
  replyingTo?: Message | null;
  currentUserId?: string;
  onCancelReply?: () => void;
}) {
  const [text, setText] = useState('');
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('menu');
  const [locationLabel, setLocationLabel] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [eventTitle, setEventTitle] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventStartsAt, setEventStartsAt] = useState('');
  const [eventEndsAt, setEventEndsAt] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const vcfInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<BlobPart[]>([]);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const canPickDeviceContact = supportsAnyDeviceContactSelection();
  const usesNativeContacts = isNativeContactsAvailable();

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  useEffect(() => {
    if (!initialText) return;
    setText((current) => (current.trim() ? current : initialText));
    textareaRef.current?.focus();
  }, [initialText]);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current !== null) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const stopVoiceStream = useCallback(() => {
    voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
    voiceStreamRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopRecordingTimer();
      stopVoiceStream();
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [stopRecordingTimer, stopVoiceStream]);

  const handleSend = useCallback(() => {
    if (text.trim() && !isSending && !isUploading) {
      onSendMessage(text);
      setText('');
    }
  }, [text, isSending, isUploading, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendAttachment(file);
      e.target.value = '';
    }
  }, [onSendAttachment]);

  const handleStartVoiceRecording = useCallback(async () => {
    if (isSending || isUploading || isSharing || isRecordingVoice) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      audioInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      voiceStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopRecordingTimer();
        stopVoiceStream();
        setIsRecordingVoice(false);

        const audioBlob = new Blob(voiceChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        voiceChunksRef.current = [];

        if (audioBlob.size === 0) {
          return;
        }

        const extension = (recorder.mimeType || 'audio/webm').includes('mp4') ? 'm4a' : 'webm';
        const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${extension}`, {
          type: audioBlob.type || 'audio/webm',
        });
        onSendAttachment(audioFile);
      };

      recorder.start();
      setRecordingSeconds(0);
      setIsRecordingVoice(true);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch {
      window.alert('Unable to access your microphone. Please allow microphone permission and try again.');
      stopRecordingTimer();
      stopVoiceStream();
      setIsRecordingVoice(false);
    }
  }, [isRecordingVoice, isSending, isSharing, isUploading, onSendAttachment, stopRecordingTimer, stopVoiceStream]);

  const handleStopVoiceRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }

    stopRecordingTimer();
    stopVoiceStream();
    setIsRecordingVoice(false);
  }, [stopRecordingTimer, stopVoiceStream]);

  const insertText = useCallback((value: string) => {
    setText((current) => `${current}${value}`);
    textareaRef.current?.focus();
  }, []);

  const resetShareForms = useCallback(() => {
    setShareMode('menu');
    setLocationLabel('');
    setPollQuestion('');
    setPollOptions(['', '']);
    setEventTitle('');
    setEventVenue('');
    setEventStartsAt('');
    setEventEndsAt('');
    setEventNotes('');
  }, []);

  const closeShareSheet = useCallback(() => {
    setShareSheetOpen(false);
    resetShareForms();
  }, [resetShareForms]);

  const submitStructuredMessage = useCallback((payload: StructuredSharePayload) => {
    if (isSending || isUploading || isSharing) return;
    onSendStructuredMessage(payload);
    closeShareSheet();
  }, [closeShareSheet, isSending, isSharing, isUploading, onSendStructuredMessage]);

  const handleShareCurrentLocation = useCallback(async () => {
    try {
      const position = await requestBrowserLocation('current location');
      const { latitude, longitude } = position.coords;
      submitStructuredMessage({
        messageType: 'location',
        attachments: [
          {
            id: `location-${Date.now()}`,
            type: 'location_share',
            label: locationLabel.trim() || 'Current location',
            latitude,
            longitude,
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            map_url: `https://maps.google.com/?q=${latitude},${longitude}`,
          },
        ],
      });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Unable to get your current location.',
      );
    }
  }, [locationLabel, submitStructuredMessage]);

  const handleShareLiveLocation = useCallback(() => {
    onShareLiveLocation(locationLabel.trim() || undefined);
    closeShareSheet();
  }, [closeShareSheet, locationLabel, onShareLiveLocation]);

  const handlePickDeviceContact = useCallback(async () => {
    try {
      const selected = await pickSharedDeviceContact();
      if (!selected) {
        return;
      }

      submitStructuredMessage({
        messageType: 'contact',
        attachments: [
          {
            id: `contact-${Date.now()}`,
            type: 'contact_share',
            name: selected.name,
            phone: selected.phone,
            email: selected.email,
            organization: selected.organization ?? '',
          },
        ],
      });
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to select a contact from this device.',
      );
    }
  }, [submitStructuredMessage]);

  const handleVcfContactChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const lines = content.split(/\r?\n/);
      const parsed = {
        name: '',
        phone: '',
        email: '',
        organization: '',
      };

      for (const line of lines) {
        const normalizedLine = line.trim();

        if (!parsed.name && /^FN[:;]/i.test(normalizedLine)) {
          parsed.name = normalizedLine.replace(/^FN[^:]*:/i, '').trim();
          continue;
        }

        if (!parsed.phone && /^TEL[:;]/i.test(normalizedLine)) {
          parsed.phone = normalizedLine.replace(/^TEL[^:]*:/i, '').trim();
          continue;
        }

        if (!parsed.email && /^EMAIL[:;]/i.test(normalizedLine)) {
          parsed.email = normalizedLine.replace(/^EMAIL[^:]*:/i, '').trim();
          continue;
        }

        if (!parsed.organization && /^ORG[:;]/i.test(normalizedLine)) {
          parsed.organization = normalizedLine.replace(/^ORG[^:]*:/i, '').trim();
        }
      }

      if (!parsed.name && !parsed.phone && !parsed.email) {
        window.alert('This contact file could not be read.');
        return;
      }

      submitStructuredMessage({
        messageType: 'contact',
        attachments: [
          {
            id: `contact-${Date.now()}`,
            type: 'contact_share',
            name: parsed.name || file.name.replace(/\.vcf$/i, '') || 'Shared contact',
            phone: parsed.phone,
            email: parsed.email,
            organization: parsed.organization,
          },
        ],
      });
    } catch {
      window.alert('Unable to read this contact file.');
    }
  }, [submitStructuredMessage]);

  const handleSharePoll = useCallback(() => {
    const normalizedOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
    if (!pollQuestion.trim() || normalizedOptions.length < 2) {
      window.alert('Add a poll question and at least two options.');
      return;
    }

    submitStructuredMessage({
      messageType: 'poll',
      attachments: [
        {
          id: `poll-${Date.now()}`,
          type: 'poll_share',
          label: pollQuestion.trim(),
          options: normalizedOptions,
          total_votes: 0,
        },
      ],
    });
  }, [pollOptions, pollQuestion, submitStructuredMessage]);

  const handleShareEvent = useCallback(() => {
    if (!eventTitle.trim() || !eventStartsAt) {
      window.alert('Add an event title and start time.');
      return;
    }

    submitStructuredMessage({
      messageType: 'event',
      attachments: [
        {
          id: `event-${Date.now()}`,
          type: 'event_share',
          event_title: eventTitle.trim(),
          label: eventTitle.trim(),
          venue: eventVenue.trim(),
          starts_at: new Date(eventStartsAt).toISOString(),
          ends_at: eventEndsAt ? new Date(eventEndsAt).toISOString() : undefined,
          notes: eventNotes.trim(),
        },
      ],
    });
  }, [eventEndsAt, eventNotes, eventStartsAt, eventTitle, eventVenue, submitStructuredMessage]);

  return (
    <div className="mobile-safe-bottom border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur-xl">
      {isLiveSharingActive ? (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] border border-emerald-300/20 bg-emerald-400/10 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-emerald-100">Live location sharing active</p>
            <p className="text-xs text-emerald-100/70">Your shared pin updates automatically in this chat.</p>
          </div>
          <Button
            variant="outline"
            className="border-emerald-300/20 bg-transparent text-emerald-100 hover:bg-emerald-400/10"
            onClick={onStopLiveLocation}
          >
            Stop
          </Button>
        </div>
      ) : null}
      {replyingTo ? (
        <div className="mb-3 flex items-center gap-2 rounded-[22px] border border-border bg-muted/40 p-2.5">
          <ReplyQuote message={replyingTo} currentUserId={currentUserId} className="min-w-0 flex-1 border-border bg-card" />
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={onCancelReply}
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={vcfInputRef}
        type="file"
        accept=".vcf,text/vcard"
        className="hidden"
        onChange={handleVcfContactChange}
      />
      <div className="relative flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 flex-shrink-0 rounded-full text-foreground hover:bg-muted hover:text-foreground"
          disabled={isSending || isUploading || isSharing || isRecordingVoice}
          onClick={() => setShareSheetOpen(true)}
        >
          {isUploading || isSharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>

        {isRecordingVoice ? (
          <div className="absolute -top-10 left-14 right-14 flex items-center justify-center rounded-full bg-red-500/18 px-3 py-1.5 text-xs font-black text-red-100 ring-1 ring-red-300/20">
            <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-red-300" />
            Recording {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 items-end gap-2 rounded-full bg-muted px-4 py-2 shadow-inner">
          <textarea
            ref={textareaRef}
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="max-h-28 min-h-6 flex-1 resize-none bg-transparent py-0.5 text-[15px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{ minHeight: '24px' }}
          />
          <EmojiStickerPicker onSelect={insertText} />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 flex-shrink-0 rounded-full text-foreground hover:bg-muted hover:text-foreground"
          disabled={isSending || isUploading || isSharing || isRecordingVoice}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Send photo or video"
        >
          <Camera className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant={text.trim() ? 'default' : 'ghost'}
          className={cn(
            '-ml-2 h-11 w-11 flex-shrink-0 rounded-full text-foreground hover:text-white',
            text.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-transparent hover:bg-muted',
          )}
          onClick={text.trim() ? handleSend : isRecordingVoice ? handleStopVoiceRecording : handleStartVoiceRecording}
          disabled={isSending || isUploading || isSharing}
          aria-label={text.trim() ? 'Send message' : isRecordingVoice ? 'Stop and send voice note' : 'Record voice note'}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : text.trim() ? (
            <ArrowUp className="h-4 w-4" />
          ) : isRecordingVoice ? (
            <Check className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </div>
      <MobileActionSheet
        open={shareSheetOpen}
        onOpenChange={(open) => {
          setShareSheetOpen(open);
          if (!open) resetShareForms();
        }}
        title="Share"
        description="Send media, files, or rich shares in this conversation."
      >
        {shareMode === 'menu' ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'gallery', label: 'Photo or Video', icon: Paperclip, action: () => fileInputRef.current?.click() },
              { key: 'audio', label: 'Audio', icon: FileAudio, action: () => audioInputRef.current?.click() },
              { key: 'document', label: 'Document', icon: FileText, action: () => documentInputRef.current?.click() },
              { key: 'location', label: 'Location', icon: MapPin, action: () => setShareMode('location') },
              { key: 'contact', label: 'Contact', icon: Contact, action: () => setShareMode('contact') },
              { key: 'poll', label: 'Poll', icon: CheckSquare, action: () => setShareMode('poll') },
              { key: 'event', label: 'Event', icon: CalendarDays, action: () => setShareMode('event') },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-border bg-white/5 px-3 py-4 text-center text-sm font-semibold text-foreground"
                onClick={() => {
                  item.action();
                  if (item.key === 'gallery' || item.key === 'audio' || item.key === 'document') {
                    setShareSheetOpen(false);
                  }
                }}
              >
                <item.icon className="mb-2 h-5 w-5 text-[#7ee7ff]" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ) : null}

        {shareMode === 'location' ? (
          <div className="space-y-3">
            <Input
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="Location label"
              className="border-border bg-white/5 text-foreground"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border bg-white/5 text-foreground" onClick={() => setShareMode('menu')}>
                Back
              </Button>
              <Button className="flex-1 bg-white text-[#03111f]" onClick={handleShareLiveLocation}>
                Share live
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleShareCurrentLocation}>
                Share once
              </Button>
            </div>
          </div>
        ) : null}

        {shareMode === 'contact' ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-white/5 p-4">
              <p className="text-sm font-bold text-foreground">Share from device contacts</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {usesNativeContacts
                  ? 'Select a saved contact using the native mobile contact picker.'
                  : 'Select a saved contact directly from this device.'}
              </p>
              {!canPickDeviceContact ? (
                <p className="mt-3 text-xs text-amber-200/80">
                  This browser does not support direct contact access. You can choose a saved `.vcf` contact file from this device instead.
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border bg-white/5 text-foreground" onClick={() => setShareMode('menu')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground"
                onClick={() => {
                  if (canPickDeviceContact) {
                    void handlePickDeviceContact();
                    return;
                  }

                  vcfInputRef.current?.click();
                }}
              >
                {canPickDeviceContact
                  ? usesNativeContacts
                    ? 'Open phone contacts'
                    : 'Select contact'
                  : 'Choose contact file'}
              </Button>
            </div>
          </div>
        ) : null}

        {shareMode === 'poll' ? (
          <div className="space-y-3">
            <Input value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll question" className="border-border bg-white/5 text-foreground" />
            {pollOptions.map((option, index) => (
              <Input
                key={index}
                value={option}
                onChange={(e) => setPollOptions((current) => current.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}
                placeholder={`Option ${index + 1}`}
                className="border-border bg-white/5 text-foreground"
              />
            ))}
            <Button variant="outline" className="w-full border-border bg-white/5 text-foreground" onClick={() => setPollOptions((current) => [...current, ''])}>
              Add option
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border bg-white/5 text-foreground" onClick={() => setShareMode('menu')}>
                Back
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleSharePoll}>
                Share poll
              </Button>
            </div>
          </div>
        ) : null}

        {shareMode === 'event' ? (
          <div className="space-y-3">
            <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event title" className="border-border bg-white/5 text-foreground" />
            <Input value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} placeholder="Venue" className="border-border bg-white/5 text-foreground" />
            <Input type="datetime-local" value={eventStartsAt} onChange={(e) => setEventStartsAt(e.target.value)} className="border-border bg-white/5 text-foreground" />
            <Input type="datetime-local" value={eventEndsAt} onChange={(e) => setEventEndsAt(e.target.value)} className="border-border bg-white/5 text-foreground" />
            <textarea
              value={eventNotes}
              onChange={(e) => setEventNotes(e.target.value)}
              placeholder="Notes"
              className="min-h-24 w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-border bg-white/5 text-foreground" onClick={() => setShareMode('menu')}>
                Back
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground" onClick={handleShareEvent}>
                Share event
              </Button>
            </div>
          </div>
        ) : null}
      </MobileActionSheet>
    </div>
  );
});

// Main Messages Page Component
export default function MessagesPage() {
  const navigate = useNavigate();
  const params = useParams<{ userId?: string; '*': string }>();
  const wildcardSegments = params['*']?.split('/').filter(Boolean) ?? [];
  const routeConversationId = wildcardSegments[0] === 'c' ? wildcardSegments[1] : undefined;
  const routeUserId = params.userId ?? (wildcardSegments[0] !== 'c' ? wildcardSegments[0] : undefined);
  const hasOpenThread = Boolean(routeConversationId || routeUserId);
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();
  const { startCall, joinCallById, state: callState } = useCall();
  const { reset: resetUnreadCount } = useUnreadMessagesCount();
  const queryClient = useQueryClient();

  const currentUser = auth?.user;
  const callIdFromQuery = searchParams.get('call_id') || searchParams.get('call');
  const sharedMessageText = searchParams.get('share') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [showInboxActions, setShowInboxActions] = useState(false);
  const [showThreadActions, setShowThreadActions] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [groupComposerMode, setGroupComposerMode] = useState<'create' | 'manage'>('create');
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [groupSearch, setGroupSearch] = useState('');
  const deferredGroupSearch = useDeferredValue(groupSearch);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<User[]>([]);
  const [isLiveSharingActive, setIsLiveSharingActive] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const liveLocationRef = useRef<{
    watchId: number | null;
    conversationId: string | null;
    messageId: string | null;
  }>({
    watchId: null,
    conversationId: null,
    messageId: null,
  });
  const liveLocationLastUpdateRef = useRef<number>(0);
  const joinTokenHandledRef = useRef<string | null>(null);

  // ----- Queries -----
  const { 
    data: conversations = [], 
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  });

  const selectedConversation = useMemo(() => {
    if (routeConversationId) {
      return conversations.find(c => c.id === routeConversationId);
    }

    if (routeUserId) {
      return conversations.find(c => !isGroupConversation(c) && c.participants.some(p => p.id === routeUserId));
    }

    return undefined;
  }, [conversations, routeConversationId, routeUserId]);
  const isSelectedGroup = Boolean(selectedConversation && isGroupConversation(selectedConversation));
  const isSelectedGroupAdmin = Boolean(isSelectedGroup && selectedConversation?.created_by === currentUser?.id);

  const { 
    data: messages = [], 
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => fetchMessages(selectedConversation!.id),
    enabled: !!selectedConversation?.id,
    staleTime: 30_000,
    refetchInterval: selectedConversation?.id ? 30_000 : false,
    refetchOnWindowFocus: true,
  });

  const { 
    data: targetUser,
    isLoading: targetUserLoading
  } = useQuery({
    queryKey: ['user', routeUserId],
    queryFn: () => fetchUser(routeUserId!),
    enabled: !!routeUserId && !selectedConversation,
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  });

  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['users', 'search', deferredSearch],
    queryFn: () => axiosInstance.get(`/api/users/search?search=${encodeURIComponent(deferredSearch)}`).then(res => res.data.data ?? res.data),
    enabled: deferredSearch.length > 0 && conversations.filter(c => 
      c.participants.some(p => 
        p.name.toLowerCase().includes(deferredSearch) || 
        p.username?.toLowerCase().includes(deferredSearch)
      )
    ).length === 0,
    staleTime: 10_000,
  });

  const { data: groupSearchResults = [], isLoading: groupSearchLoading } = useQuery<User[]>({
    queryKey: ['users', 'group-search', deferredGroupSearch],
    queryFn: () => axiosInstance.get(`/api/users/search?search=${encodeURIComponent(deferredGroupSearch)}`).then(res => res.data.data ?? res.data),
    enabled: deferredGroupSearch.trim().length > 0,
    staleTime: 10_000,
  });

  // ----- Mutations -----
  const sendMessageMutation = useMutation({
    mutationFn: ({ replyToMessage, ...payload }: {
      conversationId: string;
      content: string;
      replyToMessageId?: string | null;
      replyToMessage?: Message | null;
      socketId?: string;
    }) => sendMessage(payload),
    onMutate: async ({ conversationId, content, replyToMessageId, replyToMessage }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        user_id: currentUser!.id,
        conversation_id: conversationId,
        reply_to_message_id: replyToMessageId ?? null,
        reply_to: replyToMessage ?? null,
        message_type: 'text',
        created_at: new Date().toISOString(),
        user: currentUser!,
        is_optimistic: true,
      };

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages, optimisticId: optimisticMessage.id };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.conversationId], context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendAttachmentMutation = useMutation({
    mutationFn: async ({
      conversationId,
      file,
      replyToMessageId,
    }: {
      conversationId: string;
      file: File;
      replyToMessageId?: string | null;
      replyToMessage?: Message | null;
    }) => {
      const socketId = (window as any).Echo?.socketId();
      const attachment = await uploadAttachment({ conversationId, file });
      return sendAttachmentMessage({
        conversationId,
        attachments: [attachment],
        messageType: inferMessageTypeFromFile(file),
        replyToMessageId,
        socketId,
      });
    },
    onMutate: async ({ conversationId, file, replyToMessageId, replyToMessage }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);
      const messageType = inferMessageTypeFromFile(file);
      const previewUrl = URL.createObjectURL(file);

      const optimisticMessage: Message = {
        id: `temp-img-${Date.now()}`,
        content: '',
        user_id: currentUser!.id,
        conversation_id: conversationId,
        reply_to_message_id: replyToMessageId ?? null,
        reply_to: replyToMessage ?? null,
        message_type: messageType,
        attachments: [{
          id: 'temp',
          url: previewUrl,
          thumbnail_url: messageType === 'image' ? previewUrl : null,
          name: file.name,
          mime_type: file.type,
          size: file.size,
        }],
        created_at: new Date().toISOString(),
        user: currentUser!,
        is_optimistic: true,
      };

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages, optimisticId: optimisticMessage.id };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.conversationId], context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const sendStructuredMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType,
      attachments,
      replyToMessageId,
    }: {
      conversationId: string;
      content?: string;
      messageType: Message['message_type'];
      attachments: Attachment[];
      replyToMessageId?: string | null;
      replyToMessage?: Message | null;
    }) => {
      const socketId = (window as any).Echo?.socketId();
      return sendStructuredMessage({
        conversationId,
        content,
        messageType,
        attachments,
        replyToMessageId,
        socketId,
      });
    },
    onMutate: async ({ conversationId, content, messageType, attachments, replyToMessageId, replyToMessage }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });
      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      const optimisticMessage: Message = {
        id: `temp-share-${Date.now()}`,
        content: content ?? '',
        user_id: currentUser!.id,
        conversation_id: conversationId,
        reply_to_message_id: replyToMessageId ?? null,
        reply_to: replyToMessage ?? null,
        message_type: messageType,
        attachments,
        created_at: new Date().toISOString(),
        user: currentUser!,
        is_optimistic: true,
      };

      queryClient.setQueryData<Message[]>(['messages', conversationId], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', variables.conversationId], context.previousMessages);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (newConversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) => [
        newConversation,
        ...old,
      ]);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: updateGroupConversation,
    onSuccess: (updatedConversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation,
        ),
      );
    },
  });

  const addGroupMembersMutation = useMutation({
    mutationFn: addGroupMembers,
    onSuccess: (updatedConversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation,
        ),
      );
    },
  });

  const removeGroupMemberMutation = useMutation({
    mutationFn: removeGroupMember,
    onSuccess: (updatedConversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation,
        ),
      );
    },
  });

  const blockGroupMemberMutation = useMutation({
    mutationFn: blockGroupMember,
    onSuccess: (updatedConversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.map((conversation) =>
          conversation.id === updatedConversation.id ? updatedConversation : conversation,
        ),
      );
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: leaveGroupConversation,
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) =>
        old.filter((conversation) => conversation.id !== conversationId),
      );
      navigate('/messages', { replace: true });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: joinGroupByInvite,
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) => {
        const existing = old.filter((item) => item.id !== conversation.id);
        return [conversation, ...existing];
      });
      navigate(`/messages/c/${conversation.id}`, { replace: true });
    },
  });

  // ----- Real-time updates -----
  useRealtimeConversations({
    conversationIds: conversations.map(c => c.id),
    onMessageReceived: (incomingMessage) => {
      const message = normalizeRealtimeMessage(incomingMessage);
      // Update messages cache
      queryClient.setQueryData<Message[]>(
        ['messages', message.conversation_id],
        (old = []) => {
          if (old.some(m => m.id === message.id)) return old;
          return [...old, message].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
      );
      // Update conversations list
      queryClient.setQueryData<Conversation[]>(['conversations'], (old = []) => {
        const index = old.findIndex(c => c.id === message.conversation_id);
        if (index === -1) return old;
        const updated = {
          ...old[index],
          last_message: message,
          updated_at: message.created_at,
        };
        return [updated, ...old.slice(0, index), ...old.slice(index + 1)];
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // ----- Effects -----
  // Join call from URL
  useEffect(() => {
    if (callIdFromQuery && callState.status === 'idle') {
      joinCallById(callIdFromQuery).catch(() => {});
    }
  }, [callIdFromQuery, callState.status, joinCallById]);

  useEffect(() => {
    const token = searchParams.get('join');
    if (!token || joinTokenHandledRef.current === token || joinGroupMutation.isPending) return;

    joinTokenHandledRef.current = token;
    joinGroupMutation.mutate(token, {
      onError: (error: any) => {
        window.alert(error?.response?.data?.message || 'Unable to join this group chat.');
        navigate('/messages', { replace: true });
      },
    });
  }, [joinGroupMutation, navigate, searchParams]);

  // Reset unread count on mount
  useEffect(() => {
    resetUnreadCount();
  }, [resetUnreadCount]);

  useEffect(() => {
    return () => {
      if (liveLocationRef.current.watchId !== null) {
        navigator.geolocation.clearWatch(liveLocationRef.current.watchId);
      }
    };
  }, []);

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversation?.id) {
      markConversationAsRead(selectedConversation.id).catch(console.error);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    setShowGroupMembers(false);
    setGroupSearch('');
    setReplyingToMessage(null);
  }, [selectedConversation?.id]);

  // ----- Handlers -----
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    navigate(`/messages/c/${conversation.id}`);
  }, [navigate]);

  const handleStartNewChat = useCallback(async (user: User) => {
    navigate(`/messages/${user.id}`);
    // Create conversation if not exists
    if (!conversations.some(c => !isGroupConversation(c) && c.participants.some(p => p.id === user.id))) {
      try {
        await createConversationMutation.mutateAsync({ participantIds: [user.id] });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to start this conversation.';
        window.alert(message);
      }
    }
  }, [conversations, createConversationMutation, navigate]);

  const toggleGroupUser = useCallback((user: User) => {
    setSelectedGroupUsers((current) => {
      if (current.some((selected) => selected.id === user.id)) {
        return current.filter((selected) => selected.id !== user.id);
      }

      return [...current, user];
    });
  }, []);

  const resetGroupComposer = useCallback(() => {
    setGroupName('');
    setGroupAvatar(null);
    setGroupSearch('');
    setSelectedGroupUsers([]);
  }, []);

  const handleCreateGroup = useCallback(async () => {
    const isManageMode = groupComposerMode === 'manage';
    if (!isManageMode && selectedGroupUsers.length < 2) {
      window.alert('Select at least two people for a group chat.');
      return;
    }

    if (isManageMode && !selectedConversation?.id) {
      window.alert('Open a group chat first.');
      return;
    }

    if (isManageMode && !isSelectedGroupAdmin) {
      window.alert('Only the group admin can change group settings.');
      return;
    }

    try {
      let newConversation: Conversation;
      if (isManageMode && selectedConversation?.id) {
        newConversation = await updateGroupMutation.mutateAsync({
          conversationId: selectedConversation.id,
          name: groupName.trim() || selectedConversation.name || 'Group chat',
          avatar: groupAvatar,
        });

        if (selectedGroupUsers.length > 0) {
          newConversation = await addGroupMembersMutation.mutateAsync({
            conversationId: selectedConversation.id,
            participantIds: selectedGroupUsers.map((user) => user.id),
          });
        }
      } else {
        newConversation = await createConversationMutation.mutateAsync({
          participantIds: selectedGroupUsers.map((user) => user.id),
          type: 'group',
          name: groupName.trim() || 'Group chat',
          avatar: groupAvatar,
        });
      }
      resetGroupComposer();
      setShowCreateGroup(false);
      navigate(`/messages/c/${newConversation.id}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || (isManageMode ? 'Unable to update group chat.' : 'Unable to create group chat.');
      window.alert(message);
    }
  }, [addGroupMembersMutation, createConversationMutation, groupAvatar, groupComposerMode, groupName, isSelectedGroupAdmin, navigate, resetGroupComposer, selectedConversation, selectedGroupUsers, updateGroupMutation]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentUser) return;

    let conversationId = selectedConversation?.id;
    if (!conversationId && routeUserId) {
      try {
        const newConv = await createConversationMutation.mutateAsync({ participantIds: [routeUserId] });
        conversationId = newConv.id;
        navigate(`/messages/c/${conversationId}`, { replace: true });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to send message.';
        window.alert(message);
        return;
      }
    }

    if (conversationId) {
      const socketId = (window as any).Echo?.socketId();
      const replyToMessage = replyingToMessage;
      sendMessageMutation.mutate(
        {
          conversationId,
          content: text,
          replyToMessageId: replyToMessage?.id,
          replyToMessage,
          socketId,
        },
        {
          onSuccess: () => setReplyingToMessage(null),
        },
      );
    }
  }, [currentUser, selectedConversation?.id, routeUserId, createConversationMutation, navigate, replyingToMessage, sendMessageMutation]);

  const handleSendAttachment = useCallback(async (file: File) => {
    if (!currentUser) return;

    let conversationId = selectedConversation?.id;
    if (!conversationId && routeUserId) {
      try {
        const newConv = await createConversationMutation.mutateAsync({ participantIds: [routeUserId] });
        conversationId = newConv.id;
        navigate(`/messages/c/${conversationId}`, { replace: true });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to send media.';
        window.alert(message);
        return;
      }
    }

    if (conversationId) {
      const replyToMessage = replyingToMessage;
      sendAttachmentMutation.mutate(
        {
          conversationId,
          file,
          replyToMessageId: replyToMessage?.id,
          replyToMessage,
        },
        {
          onSuccess: () => setReplyingToMessage(null),
        },
      );
    }
  }, [currentUser, selectedConversation?.id, routeUserId, createConversationMutation, navigate, replyingToMessage, sendAttachmentMutation]);

  const handleSendStructuredMessage = useCallback(async (payload: StructuredSharePayload) => {
    if (!currentUser) return;

    let conversationId = selectedConversation?.id;
    if (!conversationId && routeUserId) {
      try {
        const newConv = await createConversationMutation.mutateAsync({ participantIds: [routeUserId] });
        conversationId = newConv.id;
        navigate(`/messages/c/${conversationId}`, { replace: true });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to send share.';
        window.alert(message);
        return;
      }
    }

    if (conversationId) {
      const replyToMessage = replyingToMessage;
      sendStructuredMessageMutation.mutate({
        conversationId,
        content: payload.content,
        messageType: payload.messageType,
        attachments: payload.attachments,
        replyToMessageId: replyToMessage?.id,
        replyToMessage,
      }, {
        onSuccess: () => setReplyingToMessage(null),
      });
    }
  }, [createConversationMutation, currentUser, navigate, replyingToMessage, routeUserId, selectedConversation?.id, sendStructuredMessageMutation]);

  const stopLiveLocationSharing = useCallback(async () => {
    if (liveLocationRef.current.watchId !== null) {
      navigator.geolocation.clearWatch(liveLocationRef.current.watchId);
    }

    const { conversationId, messageId } = liveLocationRef.current;
    liveLocationRef.current = { watchId: null, conversationId: null, messageId: null };
    liveLocationLastUpdateRef.current = 0;
    setIsLiveSharingActive(false);

    if (!conversationId || !messageId) {
      return;
    }

    const existingMessage = queryClient
      .getQueryData<Message[]>(['messages', conversationId])
      ?.find((message) => message.id === messageId);

    if (!existingMessage) {
      return;
    }

    const nextAttachments = (existingMessage.attachments ?? []).map((attachment) =>
      attachment.type === 'location_share'
        ? {
            ...attachment,
            live: false,
            last_updated_at: new Date().toISOString(),
          }
        : attachment
    );

    try {
      await updateStructuredMessage({
        conversationId,
        messageId,
        content: existingMessage.content,
        messageType: existingMessage.message_type,
        attachments: nextAttachments,
      });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      // Ignore stop errors and let polling reconcile state.
    }
  }, [queryClient]);

  const handleShareLiveLocation = useCallback(async (label?: string) => {
    if (!currentUser) return;

    if (isLiveSharingActive) {
      window.alert('You are already sharing live location in this conversation.');
      return;
    }

    let conversationId = selectedConversation?.id;
    if (!conversationId && routeUserId) {
      try {
        const newConv = await createConversationMutation.mutateAsync({ participantIds: [routeUserId] });
        conversationId = newConv.id;
        navigate(`/messages/c/${conversationId}`, { replace: true });
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to start live location sharing.';
        window.alert(message);
        return;
      }
    }

    if (!conversationId) {
      return;
    }

    try {
      const position = await requestBrowserLocation('live location');
      const { latitude, longitude } = position.coords;
      const locationAttachment: Attachment = {
        id: `live-location-${Date.now()}`,
        type: 'location_share',
        label: label || 'Live location',
        latitude,
        longitude,
        address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        map_url: `https://maps.google.com/?q=${latitude},${longitude}`,
        live: true,
        last_updated_at: new Date().toISOString(),
      };

      try {
        const message = await sendStructuredMessageMutation.mutateAsync({
          conversationId,
          content: '',
          messageType: 'location',
          attachments: [locationAttachment],
        });

        const watchId = navigator.geolocation.watchPosition(
          async (watchPosition) => {
            const now = Date.now();
            if (now - liveLocationLastUpdateRef.current < 15000) {
              return;
            }

            liveLocationLastUpdateRef.current = now;

            const { latitude: nextLatitude, longitude: nextLongitude } = watchPosition.coords;
            const nextAttachment: Attachment = {
              ...locationAttachment,
              latitude: nextLatitude,
              longitude: nextLongitude,
              address: `${nextLatitude.toFixed(5)}, ${nextLongitude.toFixed(5)}`,
              map_url: `https://maps.google.com/?q=${nextLatitude},${nextLongitude}`,
              live: true,
              last_updated_at: new Date().toISOString(),
            };

            try {
              await updateStructuredMessage({
                conversationId,
                messageId: message.id,
                content: '',
                messageType: 'location',
                attachments: [nextAttachment],
              });
              queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
            } catch {
              // Let the next poll catch up if an update fails.
            }
          },
          () => {
            void stopLiveLocationSharing();
          },
          { enableHighAccuracy: false, maximumAge: 30_000, timeout: 30_000 }
        );

        liveLocationRef.current = {
          watchId,
          conversationId,
          messageId: message.id,
        };
        liveLocationLastUpdateRef.current = Date.now();
        setIsLiveSharingActive(true);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Unable to share live location.';
        window.alert(message);
      }
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Unable to get your live location.',
      );
    }
  }, [createConversationMutation, currentUser, isLiveSharingActive, navigate, queryClient, routeUserId, selectedConversation?.id, sendStructuredMessageMutation, stopLiveLocationSharing]);

  const handleBack = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  const handleAudioCall = useCallback(() => {
    if (selectedConversation?.id) {
      startCall(selectedConversation.id, 'audio');
    }
  }, [selectedConversation?.id, startCall]);

  const handleVideoCall = useCallback(() => {
    if (selectedConversation?.id) {
      startCall(selectedConversation.id, 'video');
    }
  }, [selectedConversation?.id, startCall]);

  // ----- Determine active user for chat header -----
  const activeUser = useMemo(() => {
    if (selectedConversation) {
      if (isGroupConversation(selectedConversation)) {
        return {
          id: selectedConversation.id,
          name: getConversationDisplayName(selectedConversation, currentUser?.id),
          avatar: selectedConversation.avatar ?? undefined,
          username: undefined,
        };
      }

      return selectedConversation.participants.find(p => p.id !== currentUser?.id) || selectedConversation.participants[0];
    }
    return targetUser;
  }, [selectedConversation, targetUser, currentUser?.id]);

  const availableGroupUsers = useMemo(() => {
    return groupSearchResults.filter((user) =>
      user.id !== currentUser?.id &&
      !(groupComposerMode === 'manage' && selectedConversation?.participants.some((participant) => participant.id === user.id)) &&
      !selectedGroupUsers.some((selected) => selected.id === user.id)
    );
  }, [currentUser?.id, groupComposerMode, groupSearchResults, selectedConversation?.participants, selectedGroupUsers]);

  const canStartCall = Boolean(selectedConversation?.id) && callState.status === 'idle';
  const isThreadLoading = targetUserLoading || (Boolean(routeConversationId) && conversationsLoading && !selectedConversation);

  return (
    <div className="mobile-page-bg h-svh overflow-hidden text-foreground xl:px-6 xl:py-4">
      <div className="flex h-full w-full xl:mx-auto xl:max-w-7xl xl:overflow-hidden xl:rounded-[32px] xl:border xl:border-border xl:bg-card xl:shadow-sm">
      {/* Left sidebar - Conversation list */}
      <div className={`${hasOpenThread ? 'hidden md:flex' : 'flex'} w-full md:w-96 lg:w-[380px] xl:w-[420px] xl:border-r xl:border-border flex-col min-h-0 overflow-hidden`}>
        <ConversationList
          conversations={conversations}
          currentUserId={currentUser?.id}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          isLoading={conversationsLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          suggestedUsers={suggestedUsers}
          onStartNewChat={handleStartNewChat}
          onCreateGroup={() => {
            setGroupComposerMode('create');
            setShowCreateGroup(true);
          }}
          onOpenActions={() => setShowInboxActions(true)}
        />
      </div>

      {/* Right panel - Chat area */}
      <div className={`${hasOpenThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-h-0 overflow-hidden xl:min-w-0 ${selectedConversation && isGroupConversation(selectedConversation) ? 'mr-[2px]' : ''}`}>
        {hasOpenThread ? (
          isThreadLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#71767b]" />
            </div>
          ) : activeUser ? (
            <>
              <ChatHeader
                user={activeUser}
                conversation={selectedConversation}
                presence={getPresenceState(activeUser)}
                onBack={handleBack}
                onAudioCall={handleAudioCall}
                onVideoCall={handleVideoCall}
                canCall={canStartCall}
                callStatus={callState.status}
                activeCallMode={callState.mode}
                onOpenActions={() => setShowThreadActions(true)}
              />
              {selectedConversation && isGroupConversation(selectedConversation) ? (
                <GroupChatTools
                  conversation={selectedConversation}
                  currentUserId={currentUser?.id}
                  isAdmin={isSelectedGroupAdmin}
                  isOpen={showGroupMembers}
                  onToggleOpen={() => setShowGroupMembers((open) => !open)}
                  groupSearch={groupSearch}
                  onGroupSearchChange={setGroupSearch}
                  availableUsers={availableGroupUsers}
                  isSearching={groupSearchLoading}
                  addPending={addGroupMembersMutation.isPending}
                  blockPending={blockGroupMemberMutation.isPending}
                  onAddUser={(user) => {
                    addGroupMembersMutation.mutate(
                      {
                        conversationId: selectedConversation.id,
                        participantIds: [user.id],
                      },
                      {
                        onSuccess: () => {
                          setGroupSearch('');
                          window.alert(`${getInboxDisplayName(user)} added to the group.`);
                        },
                        onError: (error: any) => {
                          window.alert(error?.response?.data?.message || 'Unable to add this user.');
                        },
                      },
                    );
                  }}
                  onMessageUser={(user) => {
                    void handleStartNewChat(user);
                  }}
                  onBlockUser={(user) => {
                    if (!window.confirm(`Block ${getInboxDisplayName(user)} from this group? They will be removed and cannot join with the invite link.`)) return;
                    blockGroupMemberMutation.mutate(
                      {
                        conversationId: selectedConversation.id,
                        userId: user.id,
                      },
                      {
                        onSuccess: () => {
                          window.alert(`${getInboxDisplayName(user)} blocked from the group.`);
                        },
                        onError: (error: any) => {
                          window.alert(error?.response?.data?.message || 'Unable to block this user.');
                        },
                      },
                    );
                  }}
                />
              ) : null}
              <MessageList
                messages={messages}
                currentUserId={currentUser?.id}
                isLoading={messagesLoading}
                onLoadMore={() => {}}
                hasMore={false}
                isGroup={isGroupConversation(selectedConversation)}
                conversationId={selectedConversation.id}
                replyingToMessageId={replyingToMessage?.id}
                onReply={(message) => setReplyingToMessage(message)}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendAttachment={handleSendAttachment}
                onSendStructuredMessage={handleSendStructuredMessage}
                onShareLiveLocation={handleShareLiveLocation}
                onStopLiveLocation={stopLiveLocationSharing}
                isSending={sendMessageMutation.isPending}
                isUploading={sendAttachmentMutation.isPending}
                isSharing={sendStructuredMessageMutation.isPending}
                isLiveSharingActive={isLiveSharingActive}
                initialText={sharedMessageText}
                replyingTo={replyingToMessage}
                currentUserId={currentUser?.id}
                onCancelReply={() => setReplyingToMessage(null)}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <p className="text-[#71767b]">User not found</p>
              <Button
                variant="outline"
                className="border-[#2f3336] bg-transparent text-foreground hover:bg-[#1d1f23]"
                onClick={handleBack}
              >
                Go back
              </Button>
            </div>
          )
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <MobileEmptyState
              icon={MessageCircle}
              title="Select a message"
              description="Choose from your existing conversations or start a new one."
            />
          </div>
        )}
      </div>
      <MobileActionSheet open={showInboxActions} onOpenChange={setShowInboxActions} title="Messages">
        <div className="space-y-2">
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-left text-sm font-bold text-foreground"
            onClick={() => {
              setShowInboxActions(false);
              setGroupComposerMode('create');
              setShowCreateGroup(true);
            }}
          >
            New group chat
          </button>
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
            onClick={() => {
              setSearchQuery('');
              setShowInboxActions(false);
            }}
          >
            Clear search
          </button>
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
            onClick={() => {
              refetchConversations();
              setShowInboxActions(false);
            }}
          >
            Refresh inbox
          </button>
        </div>
      </MobileActionSheet>
      <MobileActionSheet
        open={showCreateGroup}
        onOpenChange={(open) => {
          setShowCreateGroup(open);
          if (!open) resetGroupComposer();
        }}
        title={groupComposerMode === 'manage' ? 'Group settings' : 'New group chat'}
      >
        <div className="space-y-4">
          {groupComposerMode === 'create' || isSelectedGroupAdmin ? (
            <>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Group name
                </label>
                <Input
                  placeholder="Friends, team, creators..."
                  className="h-12 rounded-2xl border border-border bg-white/5 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Group image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  className="h-12 rounded-2xl border border-border bg-white/5 text-foreground file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-black file:text-primary-foreground focus-visible:ring-0"
                  onChange={(e) => setGroupAvatar(e.target.files?.[0] ?? null)}
                />
                {groupAvatar ? (
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">{groupAvatar.name}</p>
                ) : null}
              </div>
            </>
          ) : selectedConversation ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3">
              <Avatar className="h-14 w-14 border border-border">
                <AvatarImage src={resolveAvatarUrl(selectedConversation.avatar)} alt={getConversationDisplayName(selectedConversation, currentUser?.id)} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <Users className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-black text-foreground">{getConversationDisplayName(selectedConversation, currentUser?.id)}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {selectedConversation.participants.length} members
                </p>
              </div>
            </div>
          ) : null}

          {groupComposerMode === 'manage' && selectedConversation ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">Group invite link</p>
              {selectedConversation.invite_url ? (
                <a
                  href={selectedConversation.invite_url}
                  className="mt-1 block truncate text-xs font-bold text-white/75 underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  {selectedConversation.invite_url}
                </a>
              ) : (
                <p className="mt-1 text-xs font-bold text-muted-foreground">Invite link is being prepared. Refresh this group and try again.</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Anyone with this link can tap it to join this group.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-white text-[#03111f] font-black hover:bg-white/90"
                  disabled={!selectedConversation.invite_url}
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedConversation.invite_url || '');
                    window.alert('Group invite link copied.');
                  }}
                >
                  Copy invite link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-border bg-muted font-black text-foreground hover:bg-muted/80 hover:text-foreground"
                  disabled={!selectedConversation.invite_url}
                  onClick={() => {
                    const inviteUrl = selectedConversation.invite_url || '';
                    if (navigator.share) {
                      navigator.share({
                        title: selectedConversation.name || 'Join my group chat',
                        text: `Join ${selectedConversation.name || 'my group chat'} on Karaads`,
                        url: inviteUrl,
                      }).catch(() => {});
                      return;
                    }

                    navigator.clipboard?.writeText(inviteUrl);
                    window.alert('Group invite link copied. Share it with people so they can join by clicking it.');
                  }}
                >
                  Share invite link
                </Button>
              </div>
            </div>
          ) : null}

          {selectedGroupUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedGroupUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
                  onClick={() => toggleGroupUser(user)}
                >
                  {getUsernameLabel(user)} ×
                </button>
              ))}
            </div>
          ) : null}

          {groupComposerMode === 'manage' && selectedConversation ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-3">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
                Members
              </p>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {selectedConversation.participants.map((member) => {
                  const isAdmin = selectedConversation.created_by === member.id;
                  const isMe = currentUser?.id === member.id;

                  return (
                    <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-muted/30 p-3">
                      <UserProfileImage user={member} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">
                          {getUsernameLabel(member)}{isMe ? ' (You)' : ''}
                        </p>
                        <p className="truncate text-xs text-white/40">{member.name}</p>
                      </div>
                      {isAdmin ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                          Admin
                        </span>
                      ) : isSelectedGroupAdmin ? (
                        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-muted-foreground"
                            disabled={removeGroupMemberMutation.isPending || blockGroupMemberMutation.isPending}
                            onClick={() => {
                              if (!selectedConversation?.id) return;
                              if (!window.confirm(`Remove ${getInboxDisplayName(member)} from this group? They can join again with an invite link.`)) return;
                              removeGroupMemberMutation.mutate({
                                conversationId: selectedConversation.id,
                                userId: member.id,
                              });
                            }}
                          >
                            Remove
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-200"
                            disabled={removeGroupMemberMutation.isPending || blockGroupMemberMutation.isPending}
                            onClick={() => {
                              if (!selectedConversation?.id) return;
                              if (!window.confirm(`Block ${getInboxDisplayName(member)} from this group? They will be removed and cannot rejoin using the invite link.`)) return;
                              blockGroupMemberMutation.mutate({
                                conversationId: selectedConversation.id,
                                userId: member.id,
                              });
                            }}
                          >
                            <Ban className="h-3 w-3" />
                            Block
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {groupComposerMode === 'create' || isSelectedGroupAdmin ? (
            <>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Add people
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users"
                    className="h-12 rounded-2xl border border-border bg-muted pl-9 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {groupSearchLoading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-border bg-white/5 py-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </div>
                ) : availableGroupUsers.length > 0 ? (
                  availableGroupUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/30 p-3 text-left hover:bg-white/[0.08]"
                      onClick={() => toggleGroupUser(user)}
                    >
                      <UserProfileImage user={user} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{getUsernameLabel(user)}</p>
                        <p className="truncate text-xs text-white/40">{user.name}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))
                ) : groupSearch.trim() ? (
                  <p className="rounded-2xl border border-border bg-muted/30 py-6 text-center text-sm text-muted-foreground">
                    No users found
                  </p>
                ) : (
                  <p className="rounded-2xl border border-border bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
                    {groupComposerMode === 'manage'
                      ? 'Search users to add them to this group.'
                      : 'Search and select at least two people to create a group.'}
                  </p>
                )}
              </div>
            </>
          ) : null}

          <Button
            className="h-12 w-full rounded-2xl bg-primary font-black text-primary-foreground hover:bg-primary/90"
            disabled={
              createConversationMutation.isPending ||
              updateGroupMutation.isPending ||
              addGroupMembersMutation.isPending ||
              removeGroupMemberMutation.isPending ||
              blockGroupMemberMutation.isPending ||
              (groupComposerMode === 'create' && selectedGroupUsers.length < 2) ||
              (groupComposerMode === 'manage' && !isSelectedGroupAdmin)
            }
            onClick={handleCreateGroup}
          >
            {groupComposerMode === 'manage'
              ? (updateGroupMutation.isPending || addGroupMembersMutation.isPending ? 'Saving...' : `Save group${selectedGroupUsers.length ? ` + add ${selectedGroupUsers.length}` : ''}`)
              : (createConversationMutation.isPending ? 'Creating...' : `Create group (${selectedGroupUsers.length})`)}
          </Button>

          {groupComposerMode === 'manage' && selectedConversation?.id ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl border-red-400/25 bg-red-500/10 font-black text-red-100 hover:bg-red-500/20 hover:text-white"
              disabled={leaveGroupMutation.isPending}
              onClick={() => {
                if (!selectedConversation?.id) return;
                if (!window.confirm('Leave this group? You will stop receiving messages from it.')) return;
                leaveGroupMutation.mutate(selectedConversation.id);
              }}
            >
              {leaveGroupMutation.isPending ? 'Leaving...' : 'Leave group'}
            </Button>
          ) : null}
        </div>
      </MobileActionSheet>
      <MobileActionSheet open={showThreadActions} onOpenChange={setShowThreadActions} title="Conversation">
        <div className="space-y-2">
          {selectedConversation && isGroupConversation(selectedConversation) ? (
            <>
              <button
                type="button"
                className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-left text-sm font-bold text-foreground"
                onClick={() => {
                  setShowThreadActions(false);
                  setGroupComposerMode('manage');
                  setGroupName(selectedConversation.name || 'Group chat');
                  setSelectedGroupUsers([]);
                  setGroupSearch('');
                  setGroupAvatar(null);
                  setShowCreateGroup(true);
                }}
              >
                {selectedConversation.created_by === currentUser?.id
                  ? 'Group settings, image and members'
                  : 'Group info and members'}
              </button>
              {selectedConversation.invite_url ? (
                <button
                  type="button"
                  className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedConversation.invite_url || '');
                    setShowThreadActions(false);
                    window.alert('Group invite link copied.');
                  }}
                >
                  Copy group invite link
                </button>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            className="h-12 w-full rounded-xl border border-border bg-white/5 px-4 text-left text-sm text-foreground"
            onClick={() => {
              refetchMessages();
              setShowThreadActions(false);
            }}
          >
            Refresh messages
          </button>
          <button
            type="button"
            disabled={!canStartCall}
            className="h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-left text-sm text-foreground disabled:opacity-50"
            onClick={() => {
              setShowThreadActions(false);
              handleVideoCall();
            }}
          >
            Start video call
          </button>
        </div>
      </MobileActionSheet>
      </div>
    </div>
  );
}
