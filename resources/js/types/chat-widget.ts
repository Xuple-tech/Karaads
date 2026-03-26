// types/chat-widget.ts
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'pending' | 'sent' | 'delivered' | 'failed';
  isWelcome?: boolean;
  attachments?: any[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface ChatConfig {
  apiKey?: string | null;
  apiBaseUrl: string;
  agentSlug: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  botName: string;
  botAvatar: string;
  welcomeMessage: string;
  placeholder: string;
  autoOpen: boolean;
  showHeader: boolean;
  showFooter: boolean;
  enableFiles: boolean;
  enableVoice: boolean;
  theme: 'light' | 'dark';
  language: string;
  sessionExpiry: number;
  maxMessages: number;
  rateLimit: number;
  debug: boolean;
  mobileBreakpoint: number;
  tabletBreakpoint: number;
  maxMobileWidth: string;
  maxMobileHeight: string;
  maxDesktopWidth: string;
  maxDesktopHeight: string;
  expandedWidth: string;
  expandedHeight: string;
}

export interface WidgetState {
  isOpen: boolean;
  isExpanded: boolean;
  isTyping: boolean;
  isLoading: boolean;
  messages: Message[];
  sessionId: string | null;
  conversationId: string | null;
  unreadCount: number;
  lastActivity: Date | null;
  isOnline: boolean;
  isMobile: boolean;
  isTablet: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  shadow: string;
  overlay: string;
}