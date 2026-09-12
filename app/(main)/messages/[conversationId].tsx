import { useQueryClient } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import * as Clipboard from 'expo-clipboard';
import * as Contacts from 'expo-contacts';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ArrowLeft, CameraOff, Check, CheckCheck, ChevronDown, Contact, Ellipsis, FileText, FlipHorizontal2, Grip, Images, Maximize2, MessageCircle, Mic, Pause, Phone, PhoneIncoming, PhoneOff, Play, Plus, Send, Smile, MapPin, Users, UserPlus, Video, Volume2, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    AppState,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';

import { SwipeStackView } from '@/components/navigation/swipe-stack-view';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AppColors, AppGradients, AppRadii } from '@/constants/app-theme';
import { useAuthStore } from '@/features/auth/store';
import { useConversationCall } from '@/features/calls/hooks';
import { SwipeCallActionBar } from '@/features/calls/swipe-call-action-bar';
import { useCallMedia } from '@/features/calls/use-call-media';
import {
    CONVERSATIONS_KEY,
    conversationThreadKey,
    upsertConversationFromRealtimeMessage,
    useConversationMessages,
    useConversations,
    useSendMediaMessage,
    useSendMessage,
} from '@/features/messages/hooks';
import { formatPresenceLabel, isUserOnline } from '@/features/messages/presence';
import { messagesService } from '@/features/messages/service';
import { router, useLocalSearchParams } from '@/lib/navigation/router';
import { reverbService } from '@/lib/realtime/reverb';
import type { CallTimelineNote, Message, PostMedia } from '@/lib/types/domain';

const RTCView: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-webrtc').RTCView;
  } catch {
    return null;
  }
})();

type ChatTimelineItem = Message | CallTimelineNote;
type MessageAttachmentKind = 'image' | 'video' | 'audio';
type ComposerAttachment = {
  uri: string;
  name: string;
  mimeType: string;
  kind: MessageAttachmentKind;
  durationMs?: number;
};
type DeviceContact = Contacts.ExistingContact;

const QUICK_EMOJIS = ['😀', '😂', '😍', '🥹', '🔥', '👏', '🙏', '❤️', '👍', '🎉', '🤝', '😮', '😢', '😡', '🤔', '👀'];
const SHARED_LOCATION_PREFIX = '[Shared location]';
const SHARED_CONTACT_PREFIX = '[Shared contact]';

const isCallNote = (item: ChatTimelineItem): item is CallTimelineNote => {
  return (item as CallTimelineNote).kind === 'call-note';
};

const formatCallDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatMessageTime = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MESSAGE_PLACEHOLDERS = new Set(['[Image]', '[Video]', '[Voice note]']);

const getAttachmentUri = (attachment: PostMedia | undefined) => attachment?.url ?? attachment?.path ?? attachment?.thumbnail_url ?? '';

const getAttachmentKind = (attachment: PostMedia | undefined): MessageAttachmentKind | null => {
  if (!attachment) return null;
  const raw = `${attachment.type ?? attachment.mime_type ?? ''}`.toLowerCase();
  if (raw.includes('audio')) return 'audio';
  if (raw.includes('video')) return 'video';
  if (raw.includes('image')) return 'image';
  const uri = getAttachmentUri(attachment).toLowerCase();
  if (/\.(mp3|m4a|wav|aac|ogg|webm)$/i.test(uri)) return 'audio';
  if (/\.(mp4|mov|m4v|webm|avi)$/i.test(uri)) return 'video';
  if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(uri)) return 'image';
  return null;
};

const getMessageAttachment = (message: Message) => message.attachments?.[0];

const getMessageAttachmentKind = (message: Message): MessageAttachmentKind | null => {
  const fromAttachment = getAttachmentKind(getMessageAttachment(message));
  if (fromAttachment) return fromAttachment;
  const raw = `${message.message_type ?? ''}`.toLowerCase();
  if (raw === 'image' || raw === 'video' || raw === 'audio') return raw;
  return null;
};

const getMessageDisplayText = (message: Message): string => {
  const content = message.content?.trim() ?? '';
  if (!content) return '';
  if (content.startsWith(SHARED_LOCATION_PREFIX) || content.startsWith(SHARED_CONTACT_PREFIX)) return '';
  const attachmentKind = getMessageAttachmentKind(message);
  if (!attachmentKind) return content;
  const prefix = attachmentKind === 'audio' ? '[Voice note]' : attachmentKind === 'video' ? '[Video]' : '[Image]';
  if (content === prefix || MESSAGE_PLACEHOLDERS.has(content)) return '';
  if (content.startsWith(`${prefix} `)) return content.slice(prefix.length + 1).trim();
  return content;
};

const getSharedLocation = (message: Message) => {
  const content = message.content?.trim() ?? '';
  if (!content.startsWith(SHARED_LOCATION_PREFIX)) return null;
  const match = content.match(/https:\/\/maps\.google\.com\/\?q=([-0-9.]+),([-0-9.]+)/);
  const label = content
    .split('\n')
    .find((line) => line.startsWith('Place: '))
    ?.replace('Place: ', '')
    .trim();
  return {
    label: label || 'Current location',
    url: match?.[0] ?? '',
    coordinates: match ? `${match[1]}, ${match[2]}` : '',
  };
};

const getSharedContact = (message: Message) => {
  const content = message.content?.trim() ?? '';
  if (!content.startsWith(SHARED_CONTACT_PREFIX)) return null;
  const readLine = (prefix: string) =>
    content
      .split('\n')
      .find((line) => line.startsWith(prefix))
      ?.replace(prefix, '')
      .trim() ?? '';
  return {
    name: readLine('Name: ') || 'Contact',
    phone: readLine('Phone: '),
    email: readLine('Email: '),
  };
};

const getDeviceContactName = (contact: DeviceContact) =>
  contact.name?.trim() || [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || 'Contact';

const getDeviceContactPhone = (contact: DeviceContact) => contact.phoneNumbers?.[0]?.number?.trim() ?? '';

const getDeviceContactEmail = (contact: DeviceContact) => contact.emails?.[0]?.email?.trim() ?? '';

const formatAudioDuration = (milliseconds?: number) => {
  const totalSeconds = Math.max(0, Math.round((milliseconds ?? 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const MessageReceiptIcon = ({ message }: { message: Message }) => {
  if (message.status === 'failed') {
    return <Text style={styles.failedIndicator}>!</Text>;
  }

  if (message.status === 'pending') {
    return <Check size={12} stroke="rgba(255,255,255,0.7)" strokeWidth={2.4} />;
  }

  if (message.read_at) {
    return <CheckCheck size={13} stroke="#70BBFF" strokeWidth={2.4} />;
  }

  return <CheckCheck size={13} stroke="rgba(255,255,255,0.78)" strokeWidth={2.4} />;
};

export default function ConversationScreen() {
  const params = useLocalSearchParams<{ conversationId: string; mode?: string }>();
  const { width } = useWindowDimensions();
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId;
  const routeMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatTimelineItem>>(null);
  const inputRef = useRef<TextInput>(null);
  const appStateRef = useRef(AppState.currentState);
  const wasConnectedRef = useRef(false);
  const replayedCallIdsRef = useRef<Set<string>>(new Set());

  const [connectionActive, setConnectionActive] = useState(false);
  const [composer, setComposer] = useState('');
  const [composerAttachment, setComposerAttachment] = useState<ComposerAttachment | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [callPickerOpen, setCallPickerOpen] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [actionMessage, setActionMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [callMode, setCallMode] = useState<'audio' | 'video'>(routeMode === 'video' ? 'video' : 'audio');
  const [localPreviewExpanded, setLocalPreviewExpanded] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const previewSize = 100;
  const previewPosition = useRef(new Animated.ValueXY({ x: Math.max(width - previewSize - 20, 12), y: 92 })).current;

  const conversationsQuery = useConversations();
  const messagesQuery = useConversationMessages(conversationId ?? '', !connectionActive);
  const sendMessage = useSendMessage(conversationId ?? '');
  const sendMediaMessage = useSendMediaMessage(conversationId ?? '');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const {
    acceptCall,
    applyRealtimeEvent,
    callId,
    canAccept,
    canEnd,
    canStart,
    declineCall,
    direction,
    endCall,
    notes,
    startCall,
    status,
    syncActiveCall,
  } = useConversationCall({
    conversationId,
    websocketConnected: connectionActive,
    currentUserId: currentUser?.id,
  });

  const conversation = useMemo(
    () => (conversationsQuery.data ?? []).find((item) => item.id === conversationId),
    [conversationId, conversationsQuery.data],
  );
  const forwardTargets = useMemo(
    () => (conversationsQuery.data ?? []).filter((item) => item.id !== conversationId),
    [conversationId, conversationsQuery.data],
  );

  const peer = useMemo(() => {
    const participants = conversation?.participants ?? [];
    if (!participants.length) return undefined;
    return participants.find((participant) => participant.id !== currentUser?.id) ?? participants[0];
  }, [conversation?.participants, currentUser?.id]);
  const isGroup = conversation?.type === 'group' || (conversation?.participants?.length ?? 0) > 2;
  const groupCallParticipants = useMemo(() => {
    const participants = conversation?.participants ?? [];
    const others = participants.filter((participant) => participant.id !== currentUser?.id);
    return [
      {
        id: currentUser?.id ?? 'you',
        name: 'You',
        avatar: currentUser?.avatar,
        isLocal: true,
        muted: micMuted,
      },
      {
        id: peer?.id ?? 'peer',
        name: peer?.name ?? conversation?.name ?? 'Stacy',
        avatar: peer?.avatar,
        isRemote: true,
        active: true,
      },
      {
        id: others[1]?.id ?? 'alex',
        name: others[1]?.name ?? 'Alex',
        avatar: others[1]?.avatar,
        muted: true,
      },
      {
        id: others[2]?.id ?? 'charlie',
        name: others[2]?.name ? `${others[2].name} (Joining...)` : 'Charlie (Joining...)',
        avatar: others[2]?.avatar,
        initials: 'CJ',
        joining: true,
      },
    ];
  }, [conversation?.name, conversation?.participants, currentUser?.avatar, currentUser?.id, micMuted, peer?.avatar, peer?.id, peer?.name]);
  const media = useCallMedia({
    callId,
    mode: callMode,
    direction,
    status,
    peerUserId: peer?.id,
  });
  const { handleRealtimeEvent } = media;

  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);
  const peerOnline = isUserOnline(peer);
  const peerStatusLabel = formatPresenceLabel(peer);
  const showCallScreen = status === 'dialing' || status === 'ringing' || status === 'accepted';
  const callSubLabel =
    status === 'dialing'
      ? 'Connecting...'
      : status === 'ringing'
        ? direction === 'incoming'
          ? 'Incoming call'
          : 'Waiting for answer'
        : 'In call';
  const callRoleLabel = direction === 'incoming' ? 'Participant' : 'Caller';
  const callModeLabel = callMode === 'video' ? 'Video call' : 'Audio call';
  const audioCallTopLabel = status === 'accepted' ? formatCallDuration(callDurationSeconds) : 'Calling...';
  const callStatusChip =
    status === 'dialing'
      ? 'Starting'
      : status === 'ringing'
        ? direction === 'incoming'
          ? 'Incoming'
          : 'Ringing'
        : media.transportState === 'connected'
          ? 'Live'
          : 'Connecting';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        previewPosition.setOffset({
          x: (previewPosition.x as unknown as { _value?: number })._value ?? 0,
          y: (previewPosition.y as unknown as { _value?: number })._value ?? 0,
        });
        previewPosition.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: previewPosition.x, dy: previewPosition.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        previewPosition.flattenOffset();
      },
    }),
  ).current;
  const timeline = useMemo<ChatTimelineItem[]>(() => {
    const merged: ChatTimelineItem[] = [...messages, ...notes];
    merged.sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
    return merged;
  }, [messages, notes]);
  const canSend = Boolean(composer.trim() || composerAttachment);

  useEffect(() => {
    if (!token || !conversationId || !currentUser?.id) return;

    reverbService.connect(token);
    reverbService.subscribeConversation(conversationId);

    const removeConnectionListener = reverbService.onConnectionState((connected) => {
      if (connected && !wasConnectedRef.current && conversationId) {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: conversationThreadKey(conversationId) }).catch(() => undefined);
      }
      wasConnectedRef.current = connected;
      setConnectionActive(connected);
    });

    const removeMessageListener = reverbService.onMessage((payload) => {
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), (current = []) => {
        if (current.some((item) => item.id === payload.id)) return current;
        return [...current, { ...payload, status: 'sent' }];
      });

      upsertConversationFromRealtimeMessage(queryClient, conversationId, { ...payload, status: 'sent' }, {
        currentUserId: currentUser.id,
        isConversationOpen: true,
      });
    });

    const removeCallListener = reverbService.onCallEvent((event) => {
      applyRealtimeEvent(event);
      handleRealtimeEvent(event);
    });

    return () => {
      removeConnectionListener();
      removeMessageListener();
      removeCallListener();
      reverbService.unsubscribeConversation(conversationId);
    };
  }, [applyRealtimeEvent, conversationId, currentUser?.id, handleRealtimeEvent, queryClient, token]);

  useEffect(() => {
    if (!callId) return;
    reverbService.subscribeCall(callId);
    return () => {
      reverbService.unsubscribeCall(callId);
    };
  }, [callId]);

  useEffect(() => {
    if (!callId || replayedCallIdsRef.current.has(callId)) {
      return;
    }

    replayedCallIdsRef.current.add(callId);
    reverbService.getRecentCallEvents(callId).forEach((event) => {
      applyRealtimeEvent(event);
      handleRealtimeEvent(event);
    });
  }, [applyRealtimeEvent, callId, handleRealtimeEvent]);

  useEffect(() => {
    if (routeMode === 'video' || routeMode === 'audio') {
      setCallMode(routeMode);
    }
  }, [routeMode]);

  useEffect(() => {
    if (!callId || status !== 'accepted') {
      setCallDurationSeconds(0);
      return;
    }

    setCallDurationSeconds(0);
    const timer = setInterval(() => {
      setCallDurationSeconds((current) => current + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [callId, status]);

  useEffect(() => {
    if (!callId || direction !== 'incoming') {
      return;
    }

    const removeCallModeListener = reverbService.onCallEvent((event) => {
      if (event.call_id !== callId || event.conversation_id !== conversationId) {
        return;
      }

      if (event.mode === 'video' || event.mode === 'audio') {
        setCallMode(event.mode);
      }
    });

    return () => {
      removeCallModeListener();
    };
  }, [callId, conversationId, direction]);

  useEffect(() => {
    if (!conversationId) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;

      if ((previous === 'background' || previous === 'inactive') && nextState === 'active') {
        queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }).catch(() => undefined);
        queryClient.invalidateQueries({ queryKey: conversationThreadKey(conversationId) }).catch(() => undefined);
        syncActiveCall().catch(() => undefined);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [conversationId, queryClient, syncActiveCall]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      const activeRecording = recordingRef.current;
      if (activeRecording) {
        activeRecording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, []);

  const onSend = async () => {
    if (!conversationId) return;
    const content = composer.trim();
    if (!content && !composerAttachment) return;
    const nextAttachment = composerAttachment;
    const replyTarget = replyingTo;
    setComposer('');
    setComposerAttachment(null);
    setReplyingTo(null);

    if (nextAttachment) {
      await sendMediaMessage.mutateAsync({
        ...nextAttachment,
        caption: content,
      });
      return;
    }

    await sendMessage.mutateAsync({ content, replyToId: replyTarget?.id });
  };

  const pickComposerMedia = async () => {
    setEmojiPickerOpen(false);
    setAttachmentMenuOpen(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to send media messages.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      quality: 0.85,
    });

    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
    const isVideo = asset.type === 'video' || mimeType.startsWith('video/');
    const extension = mimeType.split('/')[1] ?? (isVideo ? 'mp4' : 'jpg');

    setComposerAttachment({
      uri: asset.uri,
      name: asset.fileName ?? `message-${Date.now()}.${extension}`,
      mimeType,
      kind: isVideo ? 'video' : 'image',
    });
  };

  const showAttachmentPlaceholder = (title: string, message: string) => {
    setAttachmentMenuOpen(false);
    Alert.alert(title, message);
  };

  const shareCurrentLocation = async () => {
    if (!conversationId || sendMessage.isPending) return;
    setAttachmentMenuOpen(false);
    setEmojiPickerOpen(false);

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow location access to share your current location.');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const latitude = Number(location.coords.latitude.toFixed(6));
      const longitude = Number(location.coords.longitude.toFixed(6));
      const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      await sendMessage.mutateAsync({
        content: `${SHARED_LOCATION_PREFIX}\nPlace: Current location\nCoordinates: ${latitude}, ${longitude}\n${mapUrl}`,
      });
    } catch {
      Alert.alert('Location failed', 'Unable to get your current location right now.');
    }
  };

  const shareDeviceContact = async () => {
    if (!conversationId || sendMessage.isPending) return;
    setAttachmentMenuOpen(false);
    setEmojiPickerOpen(false);

    if (Platform.OS === 'web') {
      Alert.alert('Contacts unavailable', 'Contact sharing from the device address book is only available in the mobile app.');
      return;
    }

    const available = await Contacts.isAvailableAsync();
    if (!available) {
      Alert.alert('Contacts unavailable', 'This device does not support contact sharing.');
      return;
    }

    const permission = await Contacts.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow contacts access to share a contact from this device.');
      return;
    }

    try {
      setContactsLoading(true);
      const response = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image],
        sort: Contacts.SortTypes.FirstName,
        pageSize: 500,
      });
      const shareableContacts = response.data.filter((contact) => getDeviceContactPhone(contact) || getDeviceContactEmail(contact));
      setDeviceContacts(shareableContacts);
      setContactPickerOpen(true);

      if (shareableContacts.length === 0) {
        Alert.alert('No contacts found', 'No contacts with a phone number or email were found on this device.');
      }
    } catch {
      Alert.alert('Contact failed', 'Unable to load contacts from this device right now.');
    } finally {
      setContactsLoading(false);
    }
  };

  const sendSelectedContact = async (contact: DeviceContact) => {
    const phone = getDeviceContactPhone(contact);
    const email = getDeviceContactEmail(contact);
    const name = getDeviceContactName(contact);

    if (!phone && !email) {
      Alert.alert('No contact detail', 'Choose a contact with a phone number or email to share.');
      return;
    }

    try {
      setContactPickerOpen(false);
      await sendMessage.mutateAsync({
        content: [
          SHARED_CONTACT_PREFIX,
          `Name: ${name}`,
          phone ? `Phone: ${phone}` : '',
          email ? `Email: ${email}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
    } catch {
      Alert.alert('Contact failed', 'Unable to share that contact right now.');
    }
  };

  const stopVoiceRecording = async () => {
    const activeRecording = recordingRef.current;
    recordingRef.current = null;
    if (!activeRecording) return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setRecording(false);
    setRecordingElapsedMs(0);

    try {
      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      if (!uri) return;

      const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : undefined;
      setComposerAttachment({
        uri,
        name: `voice-note-${Date.now()}.m4a`,
        // Android's HIGH_QUALITY preset records MPEG-4 AAC. audio/mp4 is the
        // portable MIME type accepted by multipart validators for .m4a files.
        mimeType: 'audio/mp4',
        kind: 'audio',
        durationMs,
      });
    } catch {
      Alert.alert('Recording failed', 'Unable to save the voice note right now.');
    } finally {
      recordingStartedAtRef.current = null;
    }
  };

  const toggleVoiceRecording = async () => {
    setEmojiPickerOpen(false);
    if (recording) {
      await stopVoiceRecording();
      return;
    }

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow microphone access to record a voice note.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const nextRecording = new Audio.Recording();
      await nextRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await nextRecording.startAsync();
      recordingRef.current = nextRecording;
      recordingStartedAtRef.current = Date.now();
      setComposerAttachment(null);
      setRecording(true);
      setRecordingElapsedMs(0);
      recordingTimerRef.current = setInterval(() => {
        if (!recordingStartedAtRef.current) return;
        setRecordingElapsedMs(Date.now() - recordingStartedAtRef.current);
      }, 250);
    } catch {
      Alert.alert('Recording unavailable', 'Unable to start recording on this device right now.');
      recordingRef.current = null;
      recordingStartedAtRef.current = null;
      setRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const appendEmoji = (emoji: string) => {
    setComposer((current) => `${current}${emoji}`);
    inputRef.current?.focus();
  };

  const openCallOptions = () => {
    setCallPickerOpen(true);
  };

  const openMessageActions = (message: Message) => {
    setActionMessage(message);
  };

  const replyToMessage = () => {
    if (!actionMessage) return;
    setReplyingTo(actionMessage);
    setActionMessage(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const copyMessage = async () => {
    if (!actionMessage?.content) return;
    await Clipboard.setStringAsync(actionMessage.content);
    setActionMessage(null);
  };

  const openForwardPicker = () => {
    if (!actionMessage) return;
    setActionMessage(null);
    setForwardOpen(true);
  };

  const forwardMessage = async (targetConversationId: string) => {
    if (!actionMessage?.content || !targetConversationId) return;
    try {
      setForwarding(true);
      await messagesService.sendMessage(targetConversationId, actionMessage.content);
      setForwardOpen(false);
      setActionMessage(null);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }).catch(() => undefined);
    } catch {
      Alert.alert('Forward failed', 'Unable to forward this message right now.');
    } finally {
      setForwarding(false);
    }
  };

  const deleteMessage = async () => {
    if (!actionMessage?.id || !conversationId) return;
    const messageId = actionMessage.id;
    try {
      setDeleting(true);
      await messagesService.deleteMessage(conversationId, messageId);
      queryClient.setQueryData<Message[]>(conversationThreadKey(conversationId), (current = []) =>
        current.filter((item) => item.id !== messageId),
      );
      queryClient.invalidateQueries({ queryKey: conversationThreadKey(conversationId) }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }).catch(() => undefined);
      setActionMessage(null);
    } catch {
      Alert.alert('Delete failed', 'Unable to delete this message right now.');
    } finally {
      setDeleting(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('MainTabs', { screen: 'Messages' });
  };

  const startCallWithMode = async (mode: 'audio' | 'video') => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Calls need the mobile app',
        'The web preview can show the call UI, but real audio/video calls need the iOS or Android app because this project uses react-native-webrtc.',
      );
      return;
    }

    if (!canStart) {
      Alert.alert('Call already active', 'End the current call before starting another one.');
      return;
    }

    setCallMode(mode);
    setMicMuted(false);
    setCameraOn(mode === 'video');
    setLocalPreviewExpanded(false);
    await startCall(mode);
  };

  useEffect(() => {
    setMicMuted(!media.micEnabled);
  }, [media.micEnabled]);

  useEffect(() => {
    setCameraOn(media.cameraEnabled);
  }, [media.cameraEnabled]);

  const speakerOn = media.speakerOn;

  return (
    <SwipeStackView>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top + 6 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.iconBtn} hitSlop={10}>
          <ArrowLeft size={20} stroke={AppColors.textPrimary} />
        </Pressable>

        <View style={styles.identity}>
          <View style={styles.headerAvatarWrap}>
            <Avatar uri={peer?.avatar} name={peer?.name ?? conversation?.name} size={40} />
            {peerOnline ? <View style={styles.headerOnlineDot} /> : null}
          </View>
          <View style={styles.identityText}>
            <Text numberOfLines={1} style={styles.name}>
              {conversation?.name ?? peer?.name ?? 'Conversation'}
            </Text>
            <Text style={[styles.statusText, peerOnline && styles.statusTextOnline]}>{peerStatusLabel}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={() => startCallWithMode('audio').catch(() => undefined)}>
            <Phone size={18} stroke={AppColors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => startCallWithMode('video').catch(() => undefined)}>
            <Video size={18} stroke={AppColors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Coming soon', 'Group chat details will be available in a future update.')}>
            <Users size={18} stroke={AppColors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {canAccept ? (
        <View style={styles.callTray}>
          <Pressable style={[styles.callActionBtn, styles.acceptBtn]} onPress={acceptCall}>
            <PhoneIncoming size={15} stroke={AppColors.white} />
            <Text style={styles.callActionText}>Accept</Text>
          </Pressable>
          <Pressable style={[styles.callActionBtn, styles.declineBtn]} onPress={declineCall}>
            <PhoneOff size={15} stroke={AppColors.white} />
            <Text style={styles.callActionText}>Decline</Text>
          </Pressable>
        </View>
      ) : null}

      {messagesQuery.isLoading ? (
        <View style={styles.loader}>
          <Skeleton width="78%" height={44} radius={14} />
          <Skeleton width="64%" height={44} radius={14} />
          <Skeleton width="82%" height={44} radius={14} />
        </View>
      ) : messagesQuery.isError ? (
        <View style={styles.threadErrorWrap}>
          <MessageCircle size={30} stroke={AppColors.accent} />
          <Text style={styles.threadErrorTitle}>Chat could not load</Text>
          <Text style={styles.threadErrorText}>Pull your connection and try again. Your message box is still here.</Text>
          <Pressable
            style={styles.threadRetryBtn}
            onPress={() => {
              messagesQuery.refetch();
            }}>
            <Text style={styles.threadRetryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listWrap}>
          <FlatList
            ref={listRef}
            data={timeline}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => {
              listRef.current?.scrollToEnd({ animated: true });
            }}
            renderItem={({ item }) => {
              if (isCallNote(item)) {
                return (
                  <View style={styles.noteWrap}>
                    <View style={styles.noteBubble}>
                      <Text style={styles.noteText}>{item.text}</Text>
                    </View>
                  </View>
                );
              }

              const isMine = item.user_id && currentUser?.id ? item.user_id === currentUser.id : item.status === 'pending';
              const canRetry = item.status === 'failed';
              const sharedLocation = getSharedLocation(item);
              const sharedContact = getSharedContact(item);

              return (
                <View style={[styles.bubbleWrap, isMine ? styles.mineWrap : styles.otherWrap]}>
                  {isGroup && !isMine && item.user?.name ? (
                    <Text style={styles.groupSenderName}>{item.user.name}</Text>
                  ) : null}
                  <Pressable
                    style={isMine ? styles.messageShellMine : styles.messageShellOther}
                    disabled={false}
                    onLongPress={() => openMessageActions(item)}
                    delayLongPress={240}
                    onPress={async () => {
                      if (!canRetry) return;
                      const attachment = getMessageAttachment(item);
                      const attachmentKind = getMessageAttachmentKind(item);
                      const attachmentUri = getAttachmentUri(attachment);
                      if (attachment && attachmentKind && attachmentUri) {
                        await sendMediaMessage.mutateAsync({
                          uri: attachmentUri,
                          name: attachment.name ?? `retry-${Date.now()}`,
                          mimeType: attachment.mime_type ?? `${attachmentKind}/unknown`,
                          caption: getMessageDisplayText(item),
                          kind: attachmentKind,
                        });
                        return;
                      }
                      await sendMessage.mutateAsync({ content: item.content });
                    }}>
                    <View style={[styles.bubble, isMine ? styles.mineBubble : styles.otherBubble, canRetry && styles.failedBubble]}>
                      {isMine ? (
                        <LinearGradient
                          colors={AppGradients.ownBubble as [string, string, ...string[]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={StyleSheet.absoluteFill}
                        />
                      ) : null}
                      {item.attachments?.length ? <MessageAttachmentPreview message={item} isMine={isMine} /> : null}
                      {sharedLocation ? <SharedLocationCard location={sharedLocation} isMine={Boolean(isMine)} /> : null}
                      {sharedContact ? <SharedContactCard contact={sharedContact} isMine={Boolean(isMine)} /> : null}
                      {getMessageDisplayText(item) ? (
                        <Text style={[styles.bubbleText, !isMine && styles.otherBubbleText]}>{getMessageDisplayText(item)}</Text>
                      ) : null}
                      <View style={[styles.bubbleMeta, isMine ? styles.bubbleMetaMine : styles.bubbleMetaOther]}>
                        <Text style={[styles.bubbleMetaText, !isMine && styles.bubbleMetaTextOther]}>{formatMessageTime(item.created_at)}</Text>
                        {isMine ? <MessageReceiptIcon message={item} /> : null}
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            }}
            ListHeaderComponent={
              <View style={styles.dayWrap}>
                <Text style={styles.dayText}>TODAY</Text>
              </View>
            }
            ListEmptyComponent={<Text style={styles.empty}>Start the conversation.</Text>}
          />
        </View>
      )}

      <View style={[styles.composerWrap, { paddingBottom: keyboardVisible ? 4 : Math.max(6, insets.bottom) }]}>
        {replyingTo ? (
          <View style={styles.replyComposer}>
            <View style={styles.replyComposerBar} />
            <View style={styles.replyComposerCopy}>
              <Text style={styles.replyComposerTitle}>Replying to {replyingTo.user?.name ?? 'message'}</Text>
              <Text style={styles.replyComposerText} numberOfLines={1}>{getMessageDisplayText(replyingTo) || 'Attachment'}</Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)} hitSlop={10}><X size={18} color={AppColors.textMuted} /></Pressable>
          </View>
        ) : null}
        {emojiPickerOpen ? (
          <View style={styles.emojiTray}>
            <View style={styles.emojiGrid}>
              {QUICK_EMOJIS.map((emoji) => (
                <Pressable key={emoji} style={styles.emojiChip} onPress={() => appendEmoji(emoji)}>
                  <Text style={styles.emojiChipText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        {composerAttachment ? (
          <View style={styles.attachmentPreviewCard}>
            <View style={styles.attachmentPreviewMain}>
              <AttachmentPreviewThumb attachment={composerAttachment} />
              <View style={styles.attachmentPreviewTextWrap}>
                <Text style={styles.attachmentPreviewTitle}>
                  {composerAttachment.kind === 'audio' ? 'Voice note ready' : composerAttachment.kind === 'video' ? 'Video ready' : 'Image ready'}
                </Text>
                <Text style={styles.attachmentPreviewMeta}>
                  {composerAttachment.kind === 'audio'
                    ? formatAudioDuration(composerAttachment.durationMs)
                    : composerAttachment.name}
                </Text>
              </View>
            </View>
            <Pressable style={styles.attachmentPreviewRemove} onPress={() => setComposerAttachment(null)}>
              <Text style={styles.attachmentPreviewRemoveText}>Remove</Text>
            </Pressable>
          </View>
        ) : null}
        {recording ? (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording voice note {formatAudioDuration(recordingElapsedMs)}</Text>
          </View>
        ) : null}
        <View style={styles.composerRow}>
          <Pressable
            style={[styles.composerPlusBtn, attachmentMenuOpen && styles.composerPlusBtnActive]}
            onPress={() => {
              setEmojiPickerOpen(false);
              setAttachmentMenuOpen((current) => !current);
            }}>
            <Plus size={20} stroke={AppColors.textSecondary} />
          </Pressable>
          <View style={styles.inputWrap}>
              <TextInput
                ref={inputRef}
                value={composer}
                onChangeText={setComposer}
                style={styles.input}
                placeholder="Message"
                placeholderTextColor={AppColors.textMuted}
                multiline
                maxLength={1200}
            />
            <View style={styles.inputIcons}>
              <Pressable
                style={styles.inputIconBtn}
                onPress={() => {
                  setEmojiPickerOpen((current) => !current);
                  inputRef.current?.focus();
                }}>
                <Smile size={19} stroke={AppColors.textSecondary} />
              </Pressable>
            </View>
          </View>
          {canSend ? (
            <Pressable style={styles.sendBtn} onPress={() => onSend().catch(() => undefined)}>
              <LinearGradient
                colors={AppGradients.primary as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Send size={18} color={AppColors.white} stroke={AppColors.white} strokeWidth={2.8} style={styles.sendIcon} />
            </Pressable>
          ) : (
            <Pressable style={[styles.sendBtn, recording && styles.sendBtnRecording]} onPress={() => toggleVoiceRecording().catch(() => undefined)}>
              <LinearGradient
                colors={AppGradients.primary as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Mic size={18} color={AppColors.white} style={styles.sendIcon} />
            </Pressable>
          )}
        </View>
      </View>

      <Modal transparent visible={callPickerOpen} animationType="fade" onRequestClose={() => setCallPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCallPickerOpen(false)} />
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonBody}>Video & audio calls are under development and will be available shortly.</Text>
          <Pressable style={styles.comingSoonDismiss} onPress={() => setCallPickerOpen(false)}>
            <Text style={styles.comingSoonDismissText}>Got it</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal transparent visible={attachmentMenuOpen} animationType="fade" onRequestClose={() => setAttachmentMenuOpen(false)}>
        <Pressable style={styles.attachmentMenuBackdrop} onPress={() => setAttachmentMenuOpen(false)} />
        <View style={[styles.attachmentMenu, { bottom: Math.max(insets.bottom, 10) + 70 }]}>
          <Pressable
            style={styles.attachmentOption}
            onPress={() => showAttachmentPlaceholder('Document', 'Document sharing will be available after the document picker is added.')}>
            <View style={[styles.attachmentOptionIcon, styles.attachmentOptionDoc]}>
              <FileText size={20} color={AppColors.white} />
            </View>
            <Text style={styles.attachmentOptionText}>Document</Text>
          </Pressable>
          <Pressable style={styles.attachmentOption} onPress={() => pickComposerMedia().catch(() => undefined)}>
            <View style={[styles.attachmentOptionIcon, styles.attachmentOptionMedia]}>
              <Images size={20} color={AppColors.white} />
            </View>
            <Text style={styles.attachmentOptionText}>Images / Videos</Text>
          </Pressable>
          <Pressable
            style={styles.attachmentOption}
            onPress={() => shareCurrentLocation().catch(() => undefined)}>
            <View style={[styles.attachmentOptionIcon, styles.attachmentOptionLocation]}>
              <MapPin size={20} color={AppColors.white} />
            </View>
            <Text style={styles.attachmentOptionText}>Location</Text>
          </Pressable>
          <Pressable
            style={styles.attachmentOption}
            onPress={() => shareDeviceContact().catch(() => undefined)}>
            <View style={[styles.attachmentOptionIcon, styles.attachmentOptionContact]}>
              <Contact size={20} color={AppColors.white} />
            </View>
            <Text style={styles.attachmentOptionText}>Contact</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal transparent visible={contactPickerOpen || contactsLoading} animationType="slide" onRequestClose={() => setContactPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setContactPickerOpen(false)} />
        <View style={[styles.contactPickerSheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.contactPickerHeader}>
            <View>
              <Text style={styles.contactPickerTitle}>Share Contact</Text>
              <Text style={styles.contactPickerSubtitle}>Select from this device</Text>
            </View>
            <Pressable style={styles.contactPickerClose} onPress={() => setContactPickerOpen(false)}>
              <Text style={styles.contactPickerCloseText}>Close</Text>
            </Pressable>
          </View>

          {contactsLoading ? (
            <View style={styles.contactPickerLoading}>
              <ActivityIndicator color={AppColors.accentStrong} />
              <Text style={styles.contactPickerLoadingText}>Loading contacts...</Text>
            </View>
          ) : (
            <ScrollView style={styles.contactList} contentContainerStyle={styles.contactListContent}>
              {deviceContacts.map((contact) => {
                const phone = getDeviceContactPhone(contact);
                const email = getDeviceContactEmail(contact);
                const imageUri = contact.image?.uri;
                return (
                  <Pressable key={contact.id} style={styles.contactRow} onPress={() => sendSelectedContact(contact).catch(() => undefined)}>
                    <Avatar uri={imageUri} name={getDeviceContactName(contact)} size={40} />
                    <View style={styles.contactRowText}>
                      <Text style={styles.contactRowName} numberOfLines={1}>{getDeviceContactName(contact)}</Text>
                      <Text style={styles.contactRowMeta} numberOfLines={1}>{phone || email}</Text>
                    </View>
                    <Contact size={18} color={AppColors.textSecondary} />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>

      <Modal transparent visible={Boolean(actionMessage)} animationType="slide" onRequestClose={() => setActionMessage(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setActionMessage(null)} />
        <View style={styles.actionSheet}>
          <Pressable style={styles.actionButton} onPress={replyToMessage}>
            <Text style={styles.actionLabel}>Reply</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => copyMessage().catch(() => undefined)}>
            <Text style={styles.actionLabel}>Copy</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={openForwardPicker}>
            <Text style={styles.actionLabel}>Forward</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={() => {
              deleteMessage().catch(() => undefined);
            }}
            disabled={deleting}>
            <Text style={[styles.actionLabel, styles.actionLabelDanger]}>{deleting ? 'Deleting...' : 'Delete'}</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal transparent visible={forwardOpen} animationType="slide" onRequestClose={() => setForwardOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setForwardOpen(false)} />
        <View style={styles.forwardCard}>
          <Text style={styles.forwardTitle}>Forward to</Text>
          <FlatList
            data={forwardTargets}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const participants = item.participants ?? [];
              const peerTarget = participants.find((participant) => participant.id !== currentUser?.id) ?? participants[0];
              return (
                <Pressable style={styles.forwardRow} disabled={forwarding} onPress={() => forwardMessage(item.id).catch(() => undefined)}>
                  <Avatar uri={peerTarget?.avatar} name={peerTarget?.name ?? item.name} size={34} />
                  <View>
                    <Text style={styles.forwardName}>{item.name ?? peerTarget?.name ?? 'Conversation'}</Text>
                    <Text style={styles.forwardMeta}>Tap to forward</Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.forwardEmpty}>No other chats yet.</Text>}
          />
        </View>
      </Modal>

      {showCallScreen ? (
        <View style={styles.callFullScreen}>
          {status === 'ringing' && direction === 'incoming' ? (
            <View style={styles.incomingShell}>
              <Text style={styles.incomingName}>{peer?.name ?? conversation?.name ?? 'Caller'}</Text>
              <Text style={styles.incomingContactLine}>@{(peer?.username ?? peer?.name ?? conversation?.name ?? 'caller').toLowerCase().replace(/\s+/g, '')}</Text>
              <Text style={styles.incomingMeta}>{callMode === 'video' ? 'Video Call' : 'Voice Call'}</Text>
              <View style={styles.incomingAvatarHalo}>
                <Avatar uri={peer?.avatar} name={peer?.name ?? conversation?.name} size={190} />
              </View>
              <Pressable style={styles.incomingMessagePill} onPress={goBack}>
                <MessageCircle size={18} color="#4E5F82" />
                <Text style={styles.incomingMessageText}>Message</Text>
              </Pressable>
              <SwipeCallActionBar onDecline={declineCall} onAccept={acceptCall} />
            </View>
          ) : (
            callMode === 'audio' ? (
              <View style={styles.audioCallShell}>
                <Text style={styles.audioCallStatus}>{audioCallTopLabel}</Text>
                <Text style={styles.audioCallName}>{peer?.name ?? conversation?.name ?? 'Caller'}</Text>
                <Text style={styles.audioCallContactLine}>@{(peer?.username ?? peer?.name ?? conversation?.name ?? 'caller').toLowerCase().replace(/\s+/g, '')}</Text>
                <View style={styles.audioCallAvatarHalo}>
                  <Avatar uri={peer?.avatar} name={peer?.name ?? conversation?.name} size={190} />
                </View>

                <View style={styles.audioControlPanel}>
                  <View style={styles.audioControlRow}>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => Alert.alert('Coming soon', 'In-call keypad will be available in a future update.')}>
                        <Grip size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>Keypad</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.toggleMic();
                        }}>
                        <Mic size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>{micMuted ? 'Unmute' : 'Mute'}</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.toggleSpeaker();
                        }}>
                        <Volume2 size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>{speakerOn ? 'Earpiece' : 'Speaker'}</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => Alert.alert('Coming soon', 'Additional call options will be available in a future update.')}>
                        <Ellipsis size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>More</Text>
                    </View>
                  </View>

                  <Pressable style={styles.audioHangupButton} onPress={endCall}>
                    <PhoneOff size={26} color={AppColors.white} />
                  </Pressable>
                </View>
              </View>
            ) : status !== 'accepted' ? (
              <View style={styles.videoOutgoingShell}>
                <Text style={styles.audioCallStatus}>Calling...</Text>
                <Text style={styles.audioCallName}>{peer?.name ?? conversation?.name ?? 'Caller'}</Text>
                <Text style={styles.audioCallContactLine}>@{(peer?.username ?? peer?.name ?? conversation?.name ?? 'caller').toLowerCase().replace(/\s+/g, '')}</Text>

                <View style={styles.videoOutgoingStage}>
                  {peer?.avatar ? (
                    <Image source={{ uri: peer.avatar }} style={styles.videoOutgoingImage} />
                  ) : (
                    <View style={styles.videoOutgoingFallback}>
                      <Avatar uri={peer?.avatar} name={peer?.name ?? conversation?.name} size={160} />
                    </View>
                  )}
                </View>

                <View style={styles.audioControlPanel}>
                  <View style={styles.audioControlRow}>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.toggleMic();
                        }}>
                        <Mic size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>{micMuted ? 'Unmute' : 'Mute'}</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.toggleCamera();
                        }}>
                        <CameraOff size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>{cameraOn ? 'Camera Off' : 'Camera On'}</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.flipCamera();
                        }}>
                        <FlipHorizontal2 size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>Flip</Text>
                    </View>
                    <View style={styles.audioControlItem}>
                      <Pressable
                        style={styles.audioControlButton}
                        onPress={() => {
                          media.toggleSpeaker();
                        }}>
                        <Ellipsis size={22} color="#1D2434" />
                      </Pressable>
                      <Text style={styles.audioControlText}>{speakerOn ? 'Earpiece' : 'Speaker'}</Text>
                    </View>
                  </View>

                  <Pressable style={styles.videoHangupButton} onPress={endCall}>
                    <PhoneOff size={28} color={AppColors.white} />
                  </Pressable>
                </View>
              </View>
            ) : callMode === 'video' ? (
            <View style={styles.singleCallShell}>
              <View style={styles.singleCallStage}>
                {RTCView && media.remoteStreamUrl ? (
                  <RTCView streamURL={media.remoteStreamUrl} style={styles.singleCallRemoteMedia} objectFit="cover" />
                ) : peer?.avatar ? (
                  <Image source={{ uri: peer.avatar }} style={styles.singleCallRemoteMedia} blurRadius={8} />
                ) : (
                  <View style={styles.singleCallRemoteFallback}>
                    <Avatar uri={peer?.avatar} name={peer?.name ?? conversation?.name} size={148} />
                  </View>
                )}

                <View style={styles.singleCallTimerPill}>
                  <Text style={styles.singleCallTimerText}>{formatCallDuration(callDurationSeconds)}</Text>
                </View>

                <View style={styles.singleCallPreview}>
                  {RTCView && media.localStreamUrl ? (
                    <RTCView streamURL={media.localStreamUrl} style={styles.singleCallPreviewMedia} objectFit="cover" mirror />
                  ) : currentUser?.avatar ? (
                    <Image source={{ uri: currentUser.avatar }} style={styles.singleCallPreviewMedia} />
                  ) : (
                    <View style={styles.singleCallPreviewFallback}>
                      <Avatar uri={currentUser?.avatar} name={currentUser?.name ?? 'You'} size={58} />
                    </View>
                  )}
                </View>

                <View style={styles.singleCallControls}>
                  <Pressable
                    style={[styles.singleCallControlBtn, micMuted && styles.singleCallControlBtnActive]}
                    onPress={() => {
                      media.toggleMic();
                    }}>
                    <Mic size={22} color={AppColors.white} />
                  </Pressable>
                  <Pressable style={styles.singleCallHangupBtn} onPress={endCall}>
                    <PhoneOff size={30} color={AppColors.white} />
                  </Pressable>
                  <Pressable
                    style={[styles.singleCallControlBtn, !cameraOn && styles.singleCallControlBtnActive]}
                    onPress={() => {
                      media.toggleCamera();
                    }}>
                    <Video size={22} color={AppColors.white} />
                  </Pressable>
                </View>
              </View>
            </View>
            ) : (
            <View style={styles.ongoingShell}>
              <View style={styles.callTopBlock}>
                <View style={styles.callTopRow}>
                  <View style={styles.callStatusBadge}>
                    <Text style={styles.callStatusBadgeText}>{callStatusChip}</Text>
                  </View>
                  <View style={styles.callTypeBadge}>
                    {callMode === 'video' ? <Video size={14} color={AppColors.white} /> : <Phone size={14} color={AppColors.white} />}
                    <Text style={styles.callTypeBadgeText}>{callModeLabel}</Text>
                  </View>
                </View>
                <Text style={styles.callPeerName}>{peer?.name ?? conversation?.name ?? 'Caller'}</Text>
                <Text style={styles.callPeerMeta}>{media.statusLabel || callSubLabel}</Text>
              </View>
              <View style={styles.remoteStage}>
                {RTCView && media.remoteStreamUrl ? (
                  <RTCView streamURL={media.remoteStreamUrl} style={styles.remoteVideo} objectFit="cover" />
                ) : (
                  <Avatar
                    uri={localPreviewExpanded ? currentUser?.avatar : peer?.avatar}
                    name={localPreviewExpanded ? currentUser?.name ?? 'You' : peer?.name ?? conversation?.name}
                    size={130}
                  />
                )}
                <Text style={styles.remoteName}>{localPreviewExpanded ? currentUser?.name ?? 'You' : peer?.name ?? conversation?.name ?? 'Caller'}</Text>
                <Text style={styles.remoteMeta}>{media.remoteStreamUrl ? 'Remote video connected' : media.statusLabel || callSubLabel}</Text>
                <Text style={styles.remoteRole}>{callRoleLabel}</Text>
              </View>

              {callMode === 'video' ? (
                <Animated.View style={[styles.localPreviewWrap, { transform: previewPosition.getTranslateTransform() }]} {...panResponder.panHandlers}>
                  <Pressable
                    style={styles.expandBtn}
                    onPress={() => {
                      setLocalPreviewExpanded((value) => !value);
                    }}>
                    <Maximize2 size={12} color={AppColors.white} />
                  </Pressable>
                  {RTCView && media.localStreamUrl ? (
                    <RTCView streamURL={media.localStreamUrl} style={styles.localVideo} objectFit="cover" mirror />
                  ) : (
                    <Avatar
                      uri={localPreviewExpanded ? peer?.avatar : currentUser?.avatar}
                      name={localPreviewExpanded ? peer?.name ?? conversation?.name : currentUser?.name ?? 'You'}
                      size={46}
                    />
                  )}
                  <Text style={styles.localPreviewText}>{localPreviewExpanded ? peer?.name ?? 'Caller' : 'You'}</Text>
                </Animated.View>
              ) : null}

              <View style={styles.ongoingControls}>
                <View style={styles.callControlItem}>
                  <Pressable style={[styles.roundAction, styles.rejectRound]} onPress={endCall}>
                    <PhoneOff size={20} color={AppColors.white} />
                  </Pressable>
                  <Text style={styles.callControlLabel}>End</Text>
                </View>
                <View style={styles.callControlItem}>
                  <Pressable
                    style={[styles.roundAction, !micMuted ? styles.controlEnabled : styles.controlDisabled]}
                    onPress={() => {
                      media.toggleMic();
                    }}>
                    <Mic size={20} color={AppColors.white} />
                  </Pressable>
                  <Text style={styles.callControlLabel}>{micMuted ? 'Unmute' : 'Mute'}</Text>
                </View>
                {callMode === 'video' ? (
                  <View style={styles.callControlItem}>
                    <Pressable
                      style={[styles.roundAction, cameraOn ? styles.controlEnabled : styles.controlDisabled]}
                      onPress={() => {
                        media.toggleCamera();
                      }}>
                      <Video size={20} color={AppColors.white} />
                    </Pressable>
                    <Text style={styles.callControlLabel}>{cameraOn ? 'Camera on' : 'Camera off'}</Text>
                  </View>
                ) : null}
                <View style={styles.callControlItem}>
                  <Pressable
                    style={[styles.roundAction, speakerOn ? styles.controlEnabled : styles.controlDisabled]}
                    onPress={() => {
                      media.toggleSpeaker();
                    }}>
                    <Volume2 size={20} color={AppColors.white} />
                  </Pressable>
                  <Text style={styles.callControlLabel}>{speakerOn ? 'Speaker' : 'Earpiece'}</Text>
                </View>
                <View style={styles.callControlItem}>
                  <Pressable
                    style={[styles.roundAction, styles.controlEnabled]}
                    onPress={() => Alert.alert('Coming soon', 'Adding participants will be available in a future update.')}>
                    <UserPlus size={20} color={AppColors.white} />
                  </Pressable>
                  <Text style={styles.callControlLabel}>Add</Text>
                </View>
              </View>
            </View>
            )
          )}
        </View>
      ) : null}
      </KeyboardAvoidingView>
    </SwipeStackView>
  );
}

const SharedLocationCard = ({
  location,
  isMine,
}: {
  location: NonNullable<ReturnType<typeof getSharedLocation>>;
  isMine: boolean;
}) => (
  <Pressable
    style={[styles.sharedCard, isMine ? styles.sharedCardMine : styles.sharedCardOther]}
    onPress={() => {
      if (location.url) {
        Linking.openURL(location.url).catch(() => undefined);
      }
    }}>
    <View style={[styles.sharedIcon, styles.sharedLocationIcon]}>
      <MapPin size={18} color={AppColors.white} />
    </View>
    <View style={styles.sharedCardText}>
      <Text style={styles.sharedCardTitle}>{location.label}</Text>
      <Text style={styles.sharedCardMeta}>{location.coordinates || 'Tap to open map'}</Text>
    </View>
  </Pressable>
);

const SharedContactCard = ({
  contact,
  isMine,
}: {
  contact: NonNullable<ReturnType<typeof getSharedContact>>;
  isMine: boolean;
}) => (
  <View style={[styles.sharedCard, isMine ? styles.sharedCardMine : styles.sharedCardOther]}>
    <View style={[styles.sharedIcon, styles.sharedContactIcon]}>
      <Contact size={18} color={AppColors.white} />
    </View>
    <View style={styles.sharedCardText}>
      <Text style={styles.sharedCardTitle}>{contact.name}</Text>
      {contact.phone ? <Text style={styles.sharedCardMeta}>{contact.phone}</Text> : null}
      {contact.email ? <Text style={styles.sharedCardMeta}>{contact.email}</Text> : null}
    </View>
  </View>
);

const AttachmentPreviewThumb = ({ attachment }: { attachment: ComposerAttachment }) => {
  if (attachment.kind === 'audio') {
    return (
      <View style={[styles.attachmentThumb, styles.audioThumb]}>
        <Mic size={18} color={AppColors.white} />
      </View>
    );
  }

  if (attachment.kind === 'video') {
    return (
      <View style={styles.attachmentThumb}>
        <Image source={{ uri: attachment.uri }} style={styles.attachmentThumbImage} />
        <View style={styles.attachmentThumbOverlay}>
          <Play size={14} color={AppColors.white} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.attachmentThumb}>
      <Image source={{ uri: attachment.uri }} style={styles.attachmentThumbImage} />
    </View>
  );
};

const MessageAttachmentPreview = ({ message, isMine }: { message: Message; isMine: boolean }) => {
  const attachment = getMessageAttachment(message);
  const kind = getMessageAttachmentKind(message);
  const uri = getAttachmentUri(attachment);

  if (!attachment || !kind || !uri) return null;

  if (kind === 'audio') {
    return <AudioMessageBubble uri={uri} durationMs={attachment.duration ? attachment.duration * 1000 : undefined} isMine={isMine} />;
  }

  if (kind === 'video') {
    return <VideoMessageBubble uri={uri} isMine={isMine} />;
  }

  return <Image source={{ uri }} style={styles.messageImage} />;
};

const VideoMessageBubble = ({ uri, isMine }: { uri: string; isMine: boolean }) => {
  const [playing, setPlaying] = useState(false);
  const player = useVideoPlayer({ uri }, (instance) => {
    instance.pause();
    instance.loop = true;
  });

  useEffect(() => {
    if (playing) {
      player.play();
      return;
    }
    player.pause();
  }, [player, playing]);

  return (
    <Pressable
      style={[styles.messageVideoWrap, !isMine && styles.messageVideoWrapOther]}
      onPress={() => setPlaying((current) => !current)}>
      <VideoView style={styles.messageVideo} player={player} nativeControls={false} contentFit="cover" />
      <View style={styles.messageVideoOverlay}>
        {playing ? <Pause size={18} color={AppColors.white} /> : <Play size={18} color={AppColors.white} />}
      </View>
    </Pressable>
  );
};

const AudioMessageBubble = ({ uri, durationMs, isMine }: { uri: string; durationMs?: number; isMine: boolean }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      const sound = soundRef.current;
      soundRef.current = null;
      sound?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const togglePlayback = async () => {
    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setPlaying(false);
          } else {
            setPlaying(status.isPlaying);
          }
        },
      );
      soundRef.current = sound;
      setPlaying(true);
      return;
    }

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setPlaying(false);
      return;
    }
    await soundRef.current.playAsync();
    setPlaying(true);
  };

  return (
    <Pressable
      style={[styles.audioBubbleCard, !isMine && styles.audioBubbleCardOther]}
      onPress={() => togglePlayback().catch(() => undefined)}>
      <View style={styles.audioBubblePlay}>
        {playing ? <Pause size={16} color={AppColors.white} /> : <Play size={16} color={AppColors.white} />}
      </View>
      <View style={styles.audioBubbleWave}>
        <View style={styles.audioWaveBarShort} />
        <View style={styles.audioWaveBarTall} />
        <View style={styles.audioWaveBarShort} />
        <View style={styles.audioWaveBarTall} />
        <View style={styles.audioWaveBarShort} />
      </View>
      <Text style={styles.audioBubbleDuration}>{formatAudioDuration(durationMs)}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07101D',
    borderWidth: 4,
    borderColor: '#21304A',
    borderRadius: 34,
    overflow: 'hidden',
  },
  header: {
    minHeight: 94,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
    backgroundColor: '#07101D',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,20,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9, marginLeft: 8, marginRight: 6 },
  identityText: { flex: 1, minWidth: 0 },
  headerActions: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerAvatarWrap: {
    position: 'relative',
  },
  name: { color: AppColors.textPrimary, fontSize: 15, lineHeight: 18, fontFamily: undefined, fontWeight: '800' },
  statusText: { color: AppColors.textSecondary, fontSize: 11, letterSpacing: 0.2, fontFamily: undefined, fontWeight: '800', textTransform: 'uppercase' },
  statusTextOnline: { color: '#00D7FF', fontFamily: undefined, fontWeight: '800' },
  headerOnlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: AppRadii.pill,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#07101D',
    shadowColor: '#22C55E',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  callBtn: {
    minWidth: 72,
    height: 36,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(14,20,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    paddingHorizontal: 10,
  },
  callTray: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginBottom: 6 },
  callActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  acceptBtn: { backgroundColor: AppColors.success },
  declineBtn: { backgroundColor: AppColors.danger },
  callActionText: { color: AppColors.white, fontSize: 14, fontFamily: undefined, fontWeight: '700' },
  loader: { flex: 1, paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  threadErrorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
    backgroundColor: '#07101D',
  },
  threadErrorTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  threadErrorText: {
    color: AppColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: undefined, fontWeight: '600',
  },
  threadRetryBtn: {
    minHeight: 42,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accent,
  },
  threadRetryText: {
    color: '#06111F',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  listWrap: {
    flex: 1,
    marginHorizontal: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: '#07101D',
    overflow: 'hidden',
  },
  listContent: { paddingHorizontal: 14, gap: 18, paddingBottom: 18, paddingTop: 12, minHeight: '100%' },
  dayWrap: {
    alignSelf: 'center',
    minHeight: 26,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 6,
  },
  dayText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: 0.8,
    fontFamily: undefined, fontWeight: '800',
  },
  bubbleWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  mineWrap: { justifyContent: 'flex-end', alignSelf: 'flex-end', width: '100%' },
  otherWrap: { alignSelf: 'flex-start', width: '100%' },
  groupSenderName: {
    color: AppColors.accent,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 3,
    marginLeft: 4,
    fontFamily: undefined, fontWeight: '700',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  messageShellMine: {
    maxWidth: '76%',
    minWidth: 54,
    alignSelf: 'flex-end',
  },
  messageShellOther: {
    maxWidth: '72%',
    minWidth: 54,
    alignSelf: 'flex-start',
  },
  mineBubble: { backgroundColor: '#1095FF' },
  otherBubble: { backgroundColor: '#171C29', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  failedBubble: { borderColor: AppColors.danger, borderWidth: 1 },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: AppRadii.md,
    marginBottom: 8,
  },
  messageVideoWrap: {
    width: 220,
    height: 220,
    borderRadius: AppRadii.md,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  messageVideoWrapOther: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  messageVideo: {
    width: '100%',
    height: '100%',
  },
  messageVideoOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedCard: {
    minWidth: 210,
    borderRadius: AppRadii.md,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  sharedCardMine: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  sharedCardOther: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sharedIcon: {
    width: 38,
    height: 38,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharedLocationIcon: {
    backgroundColor: '#1EA76A',
  },
  sharedContactIcon: {
    backgroundColor: '#F59E0B',
  },
  sharedCardText: {
    flex: 1,
    minWidth: 0,
  },
  sharedCardTitle: {
    color: AppColors.white,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  sharedCardMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: undefined, fontWeight: '700',
  },
  audioBubbleCard: {
    minWidth: 190,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: AppRadii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  audioBubbleCardOther: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  audioBubblePlay: {
    width: 32,
    height: 32,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBubbleWave: {
    flex: 1,
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  audioWaveBarShort: {
    width: 4,
    height: 10,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  audioWaveBarTall: {
    width: 4,
    height: 18,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.white,
  },
  audioBubbleDuration: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '700',
  },
  bubbleText: { color: AppColors.white, fontSize: 14, lineHeight: 22, fontFamily: undefined, fontWeight: '800' },
  otherBubbleText: { color: AppColors.textPrimary },
  bubbleMeta: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bubbleMetaMine: {
    alignSelf: 'flex-end',
  },
  bubbleMetaOther: {
    alignSelf: 'flex-start',
  },
  bubbleMetaText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '400',
  },
  bubbleMetaTextOther: {
    color: AppColors.textMuted,
  },
  failedIndicator: {
    color: AppColors.danger,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
    lineHeight: 12,
  },
  noteWrap: { alignItems: 'center', marginVertical: 4 },
  noteBubble: {
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(14,20,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  noteText: { color: AppColors.textSecondary, fontSize: 12, fontFamily: undefined, fontWeight: '600' },
  empty: { color: AppColors.textMuted, textAlign: 'center', marginTop: 24, fontFamily: undefined, fontWeight: '400' },
  composerWrap: { backgroundColor: '#07101D', paddingTop: 8 },
  replyComposer: { minHeight: 54, marginHorizontal: 12, marginBottom: 7, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 12, backgroundColor: 'rgba(46,144,255,0.1)' },
  replyComposerBar: { width: 3, alignSelf: 'stretch', marginVertical: 8, borderRadius: 2, backgroundColor: AppColors.accent },
  replyComposerCopy: { flex: 1 },
  replyComposerTitle: { color: AppColors.accent, fontSize: 12, fontWeight: '800' },
  replyComposerText: { marginTop: 2, color: AppColors.textSecondary, fontSize: 12 },
  emojiTray: {
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: 'rgba(10,18,32,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiChip: {
    width: '22%',
    minWidth: 48,
    height: 42,
    borderRadius: AppRadii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,144,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.15)',
  },
  emojiChipText: {
    fontSize: 24,
  },
  attachmentPreviewCard: {
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    backgroundColor: 'rgba(10,18,32,0.95)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  attachmentPreviewMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  attachmentThumb: {
    width: 44,
    height: 44,
    borderRadius: AppRadii.sm,
    overflow: 'hidden',
    backgroundColor: 'rgba(46,144,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioThumb: {
    backgroundColor: AppColors.accentStrong,
  },
  attachmentThumbImage: {
    width: '100%',
    height: '100%',
  },
  attachmentThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  attachmentPreviewTextWrap: {
    flex: 1,
    gap: 2,
  },
  attachmentPreviewTitle: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  attachmentPreviewMeta: {
    color: AppColors.textMuted,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '400',
  },
  attachmentPreviewRemove: {
    minHeight: 34,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,144,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
  },
  attachmentPreviewRemoveText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  recordingBanner: {
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: AppRadii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,80,80,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: AppRadii.pill,
    backgroundColor: '#FF5E5E',
  },
  recordingText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '700',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#1A1F2C',
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
  },
  composerPlusBtn: {
    width: 30,
    height: 30,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerPlusBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inputWrap: {
    flex: 1,
    minHeight: 40,
    borderRadius: AppRadii.pill,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    gap: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: AppColors.textPrimary,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '700',
  },
  inputIcons: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inputIconBtn: {
    width: 32,
    height: 32,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconBtnActive: {
    backgroundColor: AppColors.accentStrong,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.accentStrong,
    overflow: 'hidden',
    shadowColor: '#2E90FF',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  sendIcon: {
    zIndex: 1,
  },
  sendBtnRecording: {
    backgroundColor: AppColors.danger,
  },
  attachmentMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  attachmentMenu: {
    position: 'absolute',
    left: 14,
    right: 14,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#171C29',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  attachmentOption: {
    flex: 1,
    minHeight: 78,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  attachmentOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentOptionDoc: {
    backgroundColor: '#6D5DFB',
  },
  attachmentOptionMedia: {
    backgroundColor: '#00A7D8',
  },
  attachmentOptionLocation: {
    backgroundColor: '#1EA76A',
  },
  attachmentOptionContact: {
    backgroundColor: '#F59E0B',
  },
  attachmentOptionText: {
    color: AppColors.textPrimary,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    fontFamily: undefined, fontWeight: '800',
  },
  contactPickerSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '72%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  contactPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 12,
  },
  contactPickerTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '800',
  },
  contactPickerSubtitle: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  contactPickerClose: {
    minHeight: 34,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  contactPickerCloseText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '800',
  },
  contactPickerLoading: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  contactPickerLoadingText: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '700',
  },
  contactList: {
    maxHeight: 420,
  },
  contactListContent: {
    paddingBottom: 12,
    gap: 8,
  },
  contactRow: {
    minHeight: 58,
    borderRadius: 18,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  contactRowText: {
    flex: 1,
    minWidth: 0,
  },
  contactRowName: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontFamily: undefined, fontWeight: '800',
  },
  contactRowMeta: {
    color: AppColors.textSecondary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  comingSoonCard: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    width: 270,
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.3)',
    backgroundColor: 'rgba(8,14,28,0.98)',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  comingSoonTitle: {
    color: AppColors.textPrimary,
    fontSize: 18,
    fontFamily: undefined, fontWeight: '700',
  },
  comingSoonBody: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  comingSoonDismiss: {
    marginTop: 6,
    minHeight: 38,
    paddingHorizontal: 28,
    borderRadius: AppRadii.pill,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.35)',
    backgroundColor: 'rgba(14,24,44,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonDismissText: {
    color: AppColors.textPrimary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
  },
  modalCard: {
    position: 'absolute',
    right: 12,
    top: 96,
    width: 190,
    borderRadius: AppRadii.md,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(10,18,32,0.98)',
    padding: 10,
    gap: 8,
  },
  modalTitle: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '700', marginBottom: 2 },
  modalBtn: {
    minHeight: 40,
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(14,24,44,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  modalBtnText: { color: AppColors.textPrimary, fontSize: 13, fontFamily: undefined, fontWeight: '600' },
  actionSheet: {
    marginTop: 'auto',
    borderTopLeftRadius: AppRadii.lg,
    borderTopRightRadius: AppRadii.lg,
    padding: 12,
    backgroundColor: 'rgba(8,14,26,0.97)',
    borderTopWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    gap: 8,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.14)',
    backgroundColor: 'rgba(10,20,38,0.95)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionButtonDanger: { borderColor: 'rgba(244,63,94,0.45)' },
  actionLabel: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '600' },
  actionLabelDanger: { color: AppColors.danger, fontFamily: undefined, fontWeight: '700' },
  forwardCard: {
    marginTop: 'auto',
    borderTopLeftRadius: AppRadii.lg,
    borderTopRightRadius: AppRadii.lg,
    padding: 12,
    backgroundColor: 'rgba(8,14,26,0.97)',
    borderTopWidth: 1,
    borderColor: 'rgba(46,144,255,0.2)',
    maxHeight: '65%',
  },
  forwardTitle: { color: AppColors.textPrimary, fontSize: 16, fontFamily: undefined, fontWeight: '700', marginBottom: 10 },
  forwardRow: {
    minHeight: 56,
    borderRadius: AppRadii.sm,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.15)',
    backgroundColor: 'rgba(10,20,38,0.9)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  forwardName: { color: AppColors.textPrimary, fontSize: 14, fontFamily: undefined, fontWeight: '600' },
  forwardMeta: { color: AppColors.textSecondary, fontSize: 12, fontFamily: undefined, fontWeight: '400' },
  forwardEmpty: { color: AppColors.textMuted, textAlign: 'center', marginTop: 10, marginBottom: 10, fontFamily: undefined, fontWeight: '400' },
  callFullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#060B18',
    zIndex: 50,
    paddingHorizontal: 14,
    paddingTop: 56,
    paddingBottom: 36,
  },
  incomingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  incomingAvatarHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7EAF2',
    overflow: 'hidden',
    marginTop: 22,
  },
  incomingName: {
    color: '#12151E',
    fontSize: 34,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
  },
  incomingContactLine: {
    color: '#4F576B',
    fontSize: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  incomingMeta: {
    color: '#5C6480',
    fontSize: 15,
    fontFamily: undefined, fontWeight: '700',
  },
  incomingMessagePill: {
    minHeight: 54,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 26,
    backgroundColor: AppColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  incomingMessageText: {
    color: '#20263A',
    fontSize: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  roundAction: {
    width: 56,
    height: 56,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  rejectRound: {
    backgroundColor: '#DE4F4F',
    borderColor: '#DE4F4F',
  },
  answerRound: {
    backgroundColor: '#2B74EE',
    borderColor: '#2B74EE',
  },
  ongoingShell: {
    flex: 1,
  },
  audioCallShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 28,
    paddingBottom: 12,
  },
  audioCallStatus: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  audioCallName: {
    marginTop: 8,
    color: AppColors.textPrimary,
    fontSize: 34,
    fontFamily: undefined, fontWeight: '800',
    textAlign: 'center',
  },
  audioCallContactLine: {
    marginTop: 4,
    color: '#A7B0C9',
    fontSize: 16,
    fontFamily: undefined, fontWeight: '600',
  },
  audioCallAvatarHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 18,
  },
  audioControlPanel: {
    width: '100%',
    borderRadius: AppRadii.xl,
    backgroundColor: '#E4E8F0',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 20,
    gap: 22,
  },
  audioControlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  audioControlItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  audioControlButton: {
    width: 62,
    height: 62,
    borderRadius: AppRadii.pill,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioControlText: {
    color: '#2D3447',
    fontSize: 13,
    fontFamily: undefined, fontWeight: '600',
    textAlign: 'center',
  },
  audioHangupButton: {
    alignSelf: 'center',
    width: 156,
    height: 66,
    borderRadius: AppRadii.pill,
    backgroundColor: '#C94235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOutgoingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 28,
    paddingBottom: 12,
  },
  videoOutgoingStage: {
    width: '100%',
    flex: 1,
    maxHeight: 540,
    borderRadius: AppRadii.xl,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 18,
  },
  videoOutgoingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOutgoingFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  videoHangupButton: {
    alignSelf: 'center',
    width: 182,
    height: 72,
    borderRadius: AppRadii.pill,
    backgroundColor: '#EE4B3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInCallShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 28,
    paddingBottom: 12,
  },
  videoInCallStage: {
    width: '100%',
    flex: 1,
    maxHeight: 540,
    borderRadius: AppRadii.xl,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 18,
  },
  videoInCallRemoteVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoInCallPreview: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 98,
    height: 136,
    borderRadius: AppRadii.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  videoInCallPreviewVideo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoInCallPreviewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  singleCallShell: {
    flex: 1,
    justifyContent: 'center',
  },
  singleCallStage: {
    flex: 1,
    position: 'relative',
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#171C29',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  singleCallRemoteMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  singleCallRemoteFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  singleCallTimerPill: {
    position: 'absolute',
    top: 68,
    alignSelf: 'center',
    minHeight: 30,
    minWidth: 66,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(53,61,66,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  singleCallTimerText: {
    color: '#00D7FF',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: undefined, fontWeight: '800',
  },
  singleCallPreview: {
    position: 'absolute',
    top: 76,
    right: 28,
    width: 92,
    height: 140,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.46)',
  },
  singleCallPreviewMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  singleCallPreviewFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12,18,30,0.92)',
  },
  singleCallControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  singleCallControlBtn: {
    width: 58,
    height: 58,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(186,177,148,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  singleCallControlBtnActive: {
    backgroundColor: 'rgba(70,78,88,0.82)',
  },
  singleCallHangupBtn: {
    width: 68,
    height: 68,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3D4E',
    shadowColor: '#FF3D4E',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  groupCallShell: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    paddingBottom: 74,
  },
  groupCallGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#101624',
  },
  groupCallTile: {
    width: '50%',
    height: '50%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#171C29',
    borderWidth: 1,
    borderColor: '#060B18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCallTileActive: {
    borderColor: '#00D7FF',
    borderWidth: 2,
  },
  groupCallTileTopLeft: {
    borderTopLeftRadius: 26,
  },
  groupCallTileTopRight: {
    borderTopRightRadius: 26,
  },
  groupCallTileBottomLeft: {
    borderBottomLeftRadius: 26,
  },
  groupCallTileBottomRight: {
    borderBottomRightRadius: 26,
  },
  groupCallMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  groupCallInitialsWrap: {
    width: 92,
    height: 92,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C243D9',
  },
  groupCallInitials: {
    color: AppColors.white,
    fontSize: 30,
    fontFamily: undefined, fontWeight: '800',
  },
  groupCallNamePill: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    maxWidth: '78%',
    minHeight: 28,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,37,52,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  groupCallNameText: {
    color: AppColors.white,
    fontSize: 11,
    fontFamily: undefined, fontWeight: '800',
  },
  groupCallMuteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E83F4E',
  },
  groupCallTimerPill: {
    position: 'absolute',
    top: 76,
    alignSelf: 'center',
    minHeight: 34,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(202,127,101,0.72)',
  },
  groupCallTimerText: {
    color: '#00D7FF',
    fontSize: 12,
    letterSpacing: 1,
    fontFamily: undefined, fontWeight: '800',
  },
  groupCallControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  groupCallControlBtn: {
    width: 58,
    height: 58,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,22,36,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  groupCallControlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  groupCallHangupBtn: {
    width: 72,
    height: 72,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3D4E',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#FF3D4E',
    shadowOpacity: 0.48,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  remoteStage: {
    flex: 1,
    borderRadius: AppRadii.xl,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    backgroundColor: 'rgba(10,18,34,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  remoteName: {
    marginTop: 10,
    color: AppColors.textPrimary,
    fontSize: 24,
    fontFamily: undefined, fontWeight: '700',
  },
  remoteMeta: {
    color: AppColors.textSecondary,
    fontSize: 13,
    fontFamily: undefined, fontWeight: '400',
  },
  remoteRole: {
    marginTop: 4,
    color: '#A7BCE2',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  remoteVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: AppRadii.xl,
  },
  localPreviewWrap: {
    position: 'absolute',
    width: 100,
    height: 132,
    borderRadius: AppRadii.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 8,
    top: 22,
    right: 16,
  },
  localPreviewText: {
    color: AppColors.textPrimary,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  localVideo: {
    width: 68,
    height: 88,
    borderRadius: AppRadii.sm,
    overflow: 'hidden',
  },
  expandBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: AppRadii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 2,
  },
  ongoingControls: {
    width: '100%',
    minHeight: 104,
    borderRadius: AppRadii.lg,
    marginTop: 14,
    backgroundColor: 'rgba(8,14,26,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    gap: 8,
  },
  controlEnabled: {
    backgroundColor: 'rgba(46,144,255,0.15)',
    borderColor: 'rgba(46,144,255,0.3)',
  },
  controlDisabled: {
    backgroundColor: '#45669A',
    borderColor: '#45669A',
  },
  callTopBlock: {
    width: '100%',
    borderRadius: AppRadii.lg,
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    backgroundColor: 'rgba(10,18,34,0.9)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 8,
  },
  callTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  callStatusBadge: {
    minHeight: 30,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(46,144,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.2)',
    justifyContent: 'center',
  },
  callStatusBadgeText: {
    color: '#D5E7FF',
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
    textTransform: 'uppercase',
  },
  callTypeBadge: {
    minHeight: 30,
    borderRadius: AppRadii.pill,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  callTypeBadgeText: {
    color: AppColors.white,
    fontSize: 12,
    fontFamily: undefined, fontWeight: '700',
  },
  callStatusLabel: {
    color: '#9BB0D6',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '600',
  },
  callPeerName: {
    marginTop: 6,
    color: AppColors.textPrimary,
    fontSize: 34,
    fontFamily: undefined, fontWeight: '700',
    textAlign: 'center',
  },
  callPeerMeta: {
    marginTop: 6,
    color: '#9BB0D6',
    fontSize: 14,
    fontFamily: undefined, fontWeight: '400',
  },
  callAvatarWrap: {
    marginTop: 28,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(22,36,64,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIncomingRow: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  callIncomingBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: AppRadii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callIncomingText: {
    color: AppColors.white,
    fontSize: 16,
    fontFamily: undefined, fontWeight: '700',
  },
  callDeclineBig: {
    backgroundColor: AppColors.danger,
  },
  callAcceptBig: {
    backgroundColor: AppColors.success,
  },
  callControlsWrap: {
    marginTop: 'auto',
    width: '100%',
    alignItems: 'center',
    gap: 18,
  },
  callControlsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  callControlItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  callControlCircle: {
    width: 58,
    height: 58,
    borderRadius: AppRadii.pill,
    backgroundColor: 'rgba(22,36,63,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(46,144,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callControlLabel: {
    color: '#A6B5D4',
    fontSize: 11,
    fontFamily: undefined, fontWeight: '600',
    textAlign: 'center',
  },
  callHangupBtn: {
    width: 132,
    height: 52,
    borderRadius: AppRadii.pill,
    backgroundColor: '#D64E4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
