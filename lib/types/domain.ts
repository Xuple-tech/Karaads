export type UserSummary = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  avatar?: string | null;
  cover?: string | null;
  bio?: string | null;
  followers_count?: number;
  following_count?: number;
  is_verified?: boolean;
  is_following?: boolean;
  is_followed_by?: boolean;
  follows_you?: boolean;
  is_follower?: boolean;
  referral_code?: string | null;
  referral_link?: string | null;
  referral_invited_count?: number;
  referral_verified_count?: number;
  referral_pending_amount?: number;
  referral_credited_amount?: number;
  is_online?: boolean;
  last_seen?: string | null;
  last_active_at?: string | null;
};

export type PostMedia = {
  id?: string;
  path?: string;
  url?: string;
  type?: string;
  mime_type?: string;
  thumbnail_url?: string;
  name?: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  processing_status?: string;
};

export type Post = {
  id: string;
  content?: string | null;
  type?: string;
  visibility?: string;
  like_count: number;
  comment_count: number;
  repost_count?: number;
  view_count?: number;
  save_count?: number;
  earning_amount?: number;
  earning_currency?: string;
  earning_rate?: number;
  earning_status?: string;
  user_liked?: boolean;
  user_saved?: boolean;
  user_viewed?: boolean;
  user_reshared?: boolean;
  created_at: string;
  user?: UserSummary;
  media?: PostMedia[];
  original_post?: Post | null;
};

export type MomentPost = Post;

export type Conversation = {
  id: string;
  type?: string;
  name?: string;
  participants?: UserSummary[];
  last_message?: Message;
  unread_count?: number;
};

export type Comment = {
  id: string;
  content: string;
  user_id?: string;
  user?: UserSummary;
  post_id?: string;
  parent_id?: string | null;
  reply_count?: number;
  created_at: string;
};

export type Message = {
  id: string;
  content: string;
  message_type?: string;
  attachments?: PostMedia[];
  user_id?: string;
  user?: UserSummary;
  conversation_id?: string;
  read_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  status?: 'pending' | 'sent' | 'failed';
  client_id?: string;
};

export type CallState = {
  id: string;
  conversation_id: string;
  caller_id: string;
  callee_id: string;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  created_at: string;
};

export type CallEvent = {
  call_id: string;
  conversation_id: string;
  from_user_id: string;
  to_user_id?: string;
  initiator_id?: string;
  mode?: 'audio' | 'video' | string;
  participant_ids?: string[];
  participants?: Array<
    UserSummary & {
      state?: string;
      role?: 'initiator' | 'participant' | string;
    }
  >;
  offer_signal_id?: string;
  answer_signal_id?: string;
  candidate?: Record<string, unknown>;
  caller?: UserSummary;
};

export type CallEventType =
  | 'IncomingCall'
  | 'CallAccepted'
  | 'CallDeclined'
  | 'CallOffer'
  | 'CallAnswer'
  | 'CallIceCandidate'
  | 'CallEnded';

export type RealtimeCallEvent = CallEvent & {
  type: CallEventType;
};

export type CallTimelineNote = {
  id: string;
  kind: 'call-note';
  conversation_id: string;
  call_id?: string;
  text: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  created_at: string;
};
