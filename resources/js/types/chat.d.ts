export interface ChatAttachment {
    id: string;
    kind: 'file' | 'image' | 'audio' | 'video';
    name: string;
    mime_type?: string | null;
    size?: number | null;
    url?: string | null;
    path?: string | null;
}

export interface ChatToolRun {
    id: string;
    tool_name: string;
    status: 'started' | 'completed' | 'failed';
    summary?: string | null;
    arguments?: Record<string, unknown> | null;
    result?: Record<string, unknown> | null;
    error_message?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Message {
    id: string;
    conversation_id?: string;
    role: 'user' | 'assistant' | 'tool';
    status?: 'pending' | 'streaming' | 'completed' | 'failed';
    provider?: string | null;
    model?: string | null;
    content: string;
    content_markdown?: string;
    content_text?: string;
    created_at?: string;
    type?: 'text' | 'image' | 'mixed' | 'file';
    attachments?: ChatAttachment[];
    tool_runs?: ChatToolRun[];
    isStreaming?: boolean;
    error_message?: string | null;
}

export interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    ai_generated_title?: boolean;
    title_generated_at?: string | null;
    last_message?: string | null;
    messages_count?: number;
}

export interface ChatProps {
    auth: {
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
    };
    conversation?: Conversation;
    chats?: Message[];
}
