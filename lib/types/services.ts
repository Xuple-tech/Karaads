import type { BrowseResult } from '@/features/browse/service';
import type { ProfileBundle } from '@/features/profile/service';
import type {
  MomentPost,
  Post,
  UserSummary,
  Conversation,
  Message,
  CallState,
  RealtimeCallEvent,
} from './domain';

export interface AuthService {
  login(input: { email: string; password: string; two_factor_code?: string }): Promise<{ user: UserSummary; token: string }>;
  register(input: {
    name: string;
    email: string;
    username: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ user: UserSummary; token: string }>;
  me(token: string): Promise<UserSummary>;
  logout(token: string): Promise<void>;
}

export interface FeedService {
  getFeed(page: number): Promise<{ posts: Post[]; meta?: Record<string, unknown> }>;
  likePost(postId: string): Promise<void>;
  unlikePost(postId: string): Promise<void>;
  savePost(postId: string): Promise<void>;
}

export interface BrowseService {
  search(query: string): Promise<BrowseResult>;
  userByUsername(username: string): Promise<UserSummary>;
}

export interface MomentService {
  getMoments(page: number): Promise<{ moments: MomentPost[]; source: 'moments' | 'feed' }>;
}

export interface ProfileService {
  me(): Promise<UserSummary>;
  byUsername(username: string): Promise<UserSummary>;
  follow(userId: string): Promise<void>;
  unfollow(userId: string): Promise<void>;
  getProfileBundle(): Promise<ProfileBundle>;
}

export interface MessageService {
  getConversations(): Promise<Conversation[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(conversationId: string, content: string): Promise<Message>;
  createConversation(participantIds: string[]): Promise<Conversation>;
}

export interface RealtimeService {
  connect(token: string): void;
  subscribeUser(userId: string): void;
  subscribeNotifications(userId: string): void;
  subscribeFeed(userId: string): void;
  subscribeConversation(conversationId: string): void;
  subscribeCall(callId: string): void;
  onConnectionState(listener: (connected: boolean) => void): () => void;
  onMessage(listener: (message: Message) => void): () => void;
  onCallEvent(listener: (event: RealtimeCallEvent) => void): () => void;
  onNotificationEvent(listener: (event: Record<string, unknown>) => void): () => void;
  onActivityEvent(listener: (event: Record<string, unknown>) => void): () => void;
  unsubscribeUser(userId: string): void;
  unsubscribeNotifications(userId: string): void;
  unsubscribeFeed(userId: string): void;
  unsubscribeConversation(conversationId: string): void;
  unsubscribeCall(callId: string): void;
  disconnect(): void;
}

export type StartCallResponse = {
  call_id: string;
  conversation_id: string;
  status: CallState['status'];
  callee?: UserSummary;
};

export interface CallsService {
  getActiveCall(): Promise<CallState | null>;
  getCall(callId: string): Promise<CallState>;
  startCall(conversationId: string, mode?: 'audio' | 'video'): Promise<StartCallResponse>;
  acceptCall(callId: string): Promise<CallState['status']>;
  declineCall(callId: string): Promise<CallState['status']>;
  endCall(callId: string): Promise<void>;
  leaveCall(callId: string): Promise<void>;
  heartbeat(callId: string): Promise<void>;
  sendOffer(callId: string, toUserId: string, sdp: string): Promise<void>;
  sendAnswer(callId: string, toUserId: string, sdp: string): Promise<void>;
  sendIceCandidate(callId: string, toUserId: string, candidate: unknown): Promise<void>;
  getSignal(callId: string, type: 'offer' | 'answer', signalId: string): Promise<{ sdp_b64?: string; sdp?: string }>;
}
