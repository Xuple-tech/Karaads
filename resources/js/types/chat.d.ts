export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
}

export interface ToolResult {
    tool_call_id: string;
    content: string;
    tool_name: string;
}

export interface ChatFileAttachment {
    id?: string;
    filename: string;
    filepath?: string;
    mime_type: string;
    file_size: number;
    hash?: string;
    status?: 'pending' | 'processing' | 'processed' | 'failed';
    url?: string;
}

export interface Message {
    id?: number;
    role: 'user' | 'assistant' | 'tool';
    content: string;
    thinking?: string;
    isStreaming?: boolean;
    created_at?: string;
    type?: 'text' | 'image' | 'mixed';
    image?: {
        url: string;
        metadata?: {
            text_response?: string;
            remaining_generations?: number;
        };
    };
    images?: Array<{
        url: string;
        metadata?: {
            text_response?: string;
            remaining_generations?: number;
        };
    }>;
    response?: string;
    message?: string;
    metadata?: {
        prompt?: string;
        remaining_generations?: number;
        text_response?: string;
        tool_status?: 'executing_tool' | 'tool_completed' | 'tool_failed' | 'continuing_conversation';
        tool_name?: string;
        tool_executing_message?: string;
        [key: string]: string | number | boolean | null | undefined;
    };
    conversation_id?: number;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    tool_name?: string;
    files?: ChatFileAttachment[];
    timestamp?: string;
}

export interface Conversation {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface ChatProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    conversation?: Conversation;
    chats?: Message[];
}
