// stores/appStore.ts
import { Conversation } from '@/types';

interface Message {
  id: string;
  conversationId?: string;
  role?: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
  [key: string]: any;
}

import { create } from 'zustand';

interface AppState {
  // UI states
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  title: string;

  // Conversations
  currentConversation: Conversation | null;
  conversations: Conversation[];

  // Messages
  messages: Message[];

  // Search
  searchQuery: string;
  searchResults: Conversation[];
  isSearching: boolean;

  // Tools
  activeTools: string[];
  toolStatus: {
    isUsingTools: boolean;
    currentTool: string | null;
    status: string;
  };

  // New conversation states
  isCreatingConversation: boolean;
  conversationSettings: {
    canvasMode: boolean;
    enableTools: boolean;
    model: string;
  };

  // Actions
  // UI actions
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTitle: (title: string) => void;

  // Conversation actions
  setCurrentConversation: (conversation: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;

  // Message actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Conversation[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Tool actions
  setActiveTools: (tools: string[]) => void;
  setToolStatus: (status: { isUsingTools?: boolean; currentTool?: string | null; status?: string }) => void;

  // New conversation actions
  setIsCreatingConversation: (isCreating: boolean) => void;
  setConversationSettings: (settings: Partial<{ canvasMode: boolean; enableTools: boolean; model: string }>) => void;
  createNewConversation: (title?: string) => Promise<Conversation | null>;
  fetchConversations: () => Promise<void>;
  deleteConversationById: (id: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial states
  sidebarOpen: true,
  mobileSidebarOpen: false,
  currentConversation: null,
  conversations: [],
  loading: false,
  error: null,
  title: 'Kwati Ai',
  messages: [],
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  activeTools: [],
  toolStatus: {
    isUsingTools: false,
    currentTool: null,
    status: ''
  },
  isCreatingConversation: false,
  conversationSettings: {
    canvasMode: false,
    enableTools: true,
    model: 'gpt-oss:120b-cloud'
  },

  // UI actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTitle: (title) => set({ title }),

  // Conversation actions
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  updateConversation: (id, updates) => set((state) => ({
    conversations: state.conversations.map(conv =>
      conv.id === id ? { ...conv, ...updates } : conv
    ),
    currentConversation: state.currentConversation?.id === id
      ? { ...state.currentConversation, ...updates }
      : state.currentConversation
  })),
  deleteConversation: (id) => set((state) => ({
    conversations: state.conversations.filter(conv => conv.id !== id),
    currentConversation: state.currentConversation?.id === id ? null : state.currentConversation
  })),

  // Message actions
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    )
  })),
  clearMessages: () => set({ messages: [] }),

  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  performSearch: async (query: string) => {
    set({ isSearching: true, searchQuery: query });

    try {
      const response = await fetch(`/api/conversations/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        set({ searchResults: data.conversations, isSearching: false });
      } else {
        set({ error: 'Search failed', isSearching: false });
      }
    } catch (error) {
      set({ error: 'Search failed', isSearching: false });
    }
  },
  clearSearch: () => set({
    searchQuery: '',
    searchResults: [],
    isSearching: false
  }),

  // Tool actions
  setActiveTools: (tools) => set({ activeTools: tools }),
  setToolStatus: (status) => set((state) => ({
    toolStatus: { ...state.toolStatus, ...status }
  })),

  // New conversation actions
  setIsCreatingConversation: (isCreating) => set({ isCreatingConversation: isCreating }),
  setConversationSettings: (settings) => set((state) => ({
    conversationSettings: { ...state.conversationSettings, ...settings }
  })),

  createNewConversation: async (title = 'New Chat') => {
    const { conversationSettings } = get();
    set({ isCreatingConversation: true });

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          canvas_mode: conversationSettings.canvasMode,
          context: {}
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newConversation = data.conversation;
        get().addConversation(newConversation);
        get().setCurrentConversation(newConversation);
        get().clearMessages();
        set({ isCreatingConversation: false });
        return newConversation;
      } else {
        set({ error: data.error, isCreatingConversation: false });
        return null;
      }
    } catch (error) {
      set({ error: 'Failed to create conversation', isCreatingConversation: false });
      return null;
    }
  },

  fetchConversations: async () => {
    set({ loading: true });

    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();

      if (data.success) {
        set({ conversations: data.conversations, loading: false });
      } else {
        set({ error: 'Failed to fetch conversations', loading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch conversations', loading: false });
    }
  },

  deleteConversationById: async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        get().deleteConversation(id);
      } else {
        set({ error: data.error });
      }
    } catch (error) {
      set({ error: 'Failed to delete conversation' });
    }
  },

  clearAllConversations: async () => {
    try {
      const response = await fetch('/api/conversations/clear', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        set({ conversations: [], currentConversation: null, messages: [] });
      } else {
        set({ error: data.error });
      }
    } catch (error) {
      set({ error: 'Failed to clear conversations' });
    }
  }
}));
