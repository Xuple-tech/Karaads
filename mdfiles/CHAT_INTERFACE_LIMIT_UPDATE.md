# ChatInterface Update Guide - Limit Response Handling

This guide shows how to integrate the new limit response system into the existing ChatInterface component.

## Overview

The ChatInterface needs to:
1. Handle 429 responses from the API
2. Display the LimitNotification component
3. Prevent further requests when limits are exceeded
4. Show user-friendly prompts for upgrading or signing in

## Step-by-Step Integration

### 1. Update Imports

Add these imports to `resources/js/components/chat/ChatInterface.tsx`:

```typescript
import { useState } from 'react';
import LimitNotification from '@/components/LimitNotification';
import { useApiLimitHandler } from '@/hooks/useApiLimitHandler';
import toast from 'react-hot-toast';

interface LimitErrorData {
    success?: boolean;
    error?: string;
    message?: string;
    action?: 'upgrade' | 'login';
    type?: string;
    code?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    reset_at?: string;
    reset_type?: string;
    plan_name?: string;
    action_label?: string;
    action_url?: string;
}
```

### 2. Add State Management

Inside the ChatInterface component, add:

```typescript
export default function ChatInterface({ isAuthenticated }: ChatInterfaceProps) {
    // ... existing state ...
    
    const [limitError, setLimitError] = useState<LimitErrorData | null>(null);
    const { limitError: handlerLimitError, handleResponse } = useApiLimitHandler();
    
    // Use whichever limit error is set (from state or handler)
    const currentLimitError = limitError || handlerLimitError;
```

### 3. Update the handleSubmit Function

Modify the `handleSubmit` function to handle 429 responses:

```typescript
const handleSubmit = async (e: React.FormEvent, type: 'text' | 'image', files?: File[]) => {
    e.preventDefault();

    const prompt = inputRef.current?.value || '';
    if (!prompt.trim()) return;

    // Clear any previous limit errors
    setLimitError(null);

    const userMessageContent = prompt.trim();
    const timestamp = new Date().toISOString();

    // Convert uploaded files to file attachments for display
    const fileAttachments = files?.map(file => ({
        filename: file.name,
        mime_type: file.type,
        file_size: file.size
    })) || [];

    setMessages((prev) => [...prev, {
        role: 'user',
        content: userMessageContent,
        type,
        timestamp,
        files: fileAttachments
    }]);

    if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.style.height = 'auto';
    }

    setIsLoading(true);
    let conversationId = conversation.conversation_id || null;

    // Create conversation if needed
    if (!conversation.conversation_id) {
        const newConversationId = await createConversation(userMessageContent);
        if (newConversationId) {
            setConversation({ conversation_id: newConversationId });
            conversationId = newConversationId;
            history.replaceState({}, '', `/c/${newConversationId}`);
        } else {
            setIsLoading(false);
            return; // Error already handled in createConversation
        }
    }

    // Initialize assistant message for streaming
    setMessages((prev) => [...prev, {
        role: 'assistant',
        tool_call_id: null,
        tool_calls: null,
        tool_name: "",
        content: '',
        thinking: '',
        isStreaming: true,
        type
    }]);

    // Process files
    let processedFiles = [];
    if (files && files.length > 0) {
        try {
            processedFiles = await processFiles(files);
        } catch (error) {
            setError({
                message: 'Unable to process attached files. Please try again.',
                retryAction: () => handleSubmit(e, type, files)
            });
            setIsLoading(false);
            return;
        }
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
        const endpoint = '/api/create/challenge/message';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
            body: JSON.stringify({
                message: userMessageContent,
                stream: true,
                type: mode,
                conversation_id: conversationId,
                files: processedFiles,
            }),
            signal: abortControllerRef.current.signal,
        });

        // CHECK FOR LIMIT ERRORS (429)
        if (response.status === 429) {
            try {
                const limitData = await response.json() as LimitErrorData;
                setLimitError(limitData);
                
                // Remove the loading assistant message
                setMessages((prev) => prev.slice(0, -1));
                setIsLoading(false);
                
                // Show toast with the error message
                toast.error(limitData.message || 'You\'ve reached your usage limit.');
                return;
            } catch (parseError) {
                const fallbackError: LimitErrorData = {
                    error: 'limit_exceeded',
                    message: 'You\'ve reached your usage limit. Please upgrade to continue.',
                    action: 'upgrade'
                };
                setLimitError(fallbackError);
                setMessages((prev) => prev.slice(0, -1));
                setIsLoading(false);
                return;
            }
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to get response');
        }

        if (!response.body) {
            throw new Error('Response has no body');
        }

        const reader = response.body.getReader();
        let buffer = '';
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;

                    const eventData = line.substring(6);

                    try {
                        const data = JSON.parse(eventData);

                        if (data.error) {
                            if (data.message_id) {
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    const lastMessage = newMessages[newMessages.length - 1];
                                    if (lastMessage?.role === 'assistant') {
                                        lastMessage.id = data.message_id;
                                    }
                                    return newMessages;
                                });
                            }
                            throw new Error(data.error);
                        }

                        if (data.message_id) {
                            setMessages((prev) => {
                                const newMessages = [...prev];
                                const lastMessage = newMessages[newMessages.length - 1];
                                if (lastMessage?.role === 'assistant') {
                                    lastMessage.id = data.message_id;
                                }
                                return newMessages;
                            });
                        }

                        if (data.done) break;

                        // ... rest of the streaming handling code ...
                    } catch (parseError) {
                        console.error('Error parsing stream data:', parseError);
                    }
                }
            }
        } catch (streamError) {
            if (streamError instanceof DOMException && streamError.name === 'AbortError') {
                console.log('Stream aborted');
            } else {
                console.error('Stream error:', streamError);
                setError({
                    message: 'Connection was interrupted. Please try again.',
                    retryAction: () => handleSubmit(e, type, files)
                });
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        setError({
            message: 'Failed to send message. Please try again.',
            retryAction: () => handleSubmit(e, type, files)
        });
    } finally {
        setIsLoading(false);
        scrollToBottom();
    }
};
```

### 4. Add Limit Notification to the Render

In the component's JSX, add the LimitNotification display:

```typescript
return (
    <>
        {/* Limit Notification - Show when limit is exceeded */}
        {currentLimitError && (
            <div className="fixed top-4 right-4 z-50 max-w-md">
                <LimitNotification
                    error={currentLimitError}
                    onClose={() => setLimitError(null)}
                    onUpgrade={() => window.location.href = '/pricing'}
                    onLogin={() => window.location.href = '/login'}
                />
            </div>
        )}

        {/* Existing error alert */}
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.message}</AlertDescription>
                {error.retryAction && (
                    <Button onClick={error.retryAction} size="sm" className="mt-2">
                        Retry
                    </Button>
                )}
            </Alert>
        )}

        {/* Rest of the chat interface */}
        <SidebarContextProvider.Provider value={sidebarContext}>
            <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                    {messages.map((message, index) => (
                        <Message key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <ChatInput
                    onSend={handleSubmit}
                    ref={inputRef}
                    is_processing={isLoading}
                    handleKeyDown={handleKeyDown}
                    mode={mode}
                    setMode={setMode}
                    files={files}
                    setFiles={setFiles}
                />
            </div>
        </SidebarContextProvider.Provider>
    </>
);
```

## Complete Example Update

Here's a more complete example showing the integration:

```typescript
import { useEffect, useRef, useState, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import LimitNotification from '@/components/LimitNotification';
import { useApiLimitHandler } from '@/hooks/useApiLimitHandler';
import { usePage } from '@inertiajs/react';

interface LimitErrorData {
    success?: boolean;
    error?: string;
    message?: string;
    action?: 'upgrade' | 'login';
    type?: string;
    code?: string;
    limit?: number;
    used?: number;
    remaining?: number;
    reset_at?: string;
    reset_type?: string;
    plan_name?: string;
    action_label?: string;
    action_url?: string;
}

export default function ChatInterface({ isAuthenticated }: ChatInterfaceProps) {
    // Existing state
    const [feedbackFormState, setFeedbackFormState] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<ErrorState>(null);
    const [retryCount, setRetryCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // NEW: Limit error state
    const [limitError, setLimitError] = useState<LimitErrorData | null>(null);

    const { auth, chats: initialChats, conversation: initialConversation } = usePage<PageProps>().props;
    const [messages, setMessages] = useState<MessageType[]>(initialChats || []);
    const sidebarContext = useContext(SidebarContextProvider);
    const [conversation, setConversation] = useState<{ conversation_id: number | null }>({
        conversation_id: initialConversation?.id || null,
    });

    // ... rest of the component implementation with handleSubmit updated as shown above ...

    return (
        <>
            {/* Limit Notification */}
            {limitError && (
                <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2">
                    <LimitNotification
                        error={limitError}
                        onClose={() => setLimitError(null)}
                        onUpgrade={() => window.location.href = '/pricing'}
                        onLogin={() => window.location.href = '/login'}
                    />
                </div>
            )}

            {/* Rest of the UI */}
        </>
    );
}
```

## Handling Different Limit Types

You can also customize the response based on the limit type:

```typescript
if (response.status === 429) {
    const limitData = await response.json() as LimitErrorData;
    
    // Handle specific limit types differently if needed
    switch (limitData.type) {
        case 'image_limit_exceeded':
            toast.warning(`Image limit: ${limitData.used}/${limitData.limit}`);
            break;
        case 'token_limit_exceeded':
            toast.warning('You\'ve used all your tokens for today');
            break;
        case 'unauthenticated':
            // Redirect to login
            window.location.href = '/login';
            return;
        default:
            toast.error(limitData.message);
    }
    
    setLimitError(limitData);
    setMessages((prev) => prev.slice(0, -1)); // Remove loading message
    setIsLoading(false);
    return;
}
```

## Testing the Integration

To test the limit response handling:

1. **Generate a limit error**: Make requests until you hit a limit
2. **Verify notification appears**: Check that LimitNotification component displays
3. **Verify message**: Check that the limit message is correct
4. **Verify action button**: Click upgrade/login button and verify redirection
5. **Verify toast**: Check that toast message appears
6. **Test dismiss**: Click dismiss button to close notification

## Alternative: Using Only Toast Notifications

If you prefer simpler toast notifications instead of the LimitNotification component:

```typescript
if (response.status === 429) {
    const limitData = await response.json() as LimitErrorData;
    
    // Show simple toast
    toast.error(limitData.message || 'Usage limit reached');
    
    // Show action button in toast if upgrade needed
    if (limitData.action === 'upgrade') {
        toast(
            (t) => (
                <div>
                    <p className="mb-2">{limitData.message}</p>
                    <Button 
                        size="sm"
                        onClick={() => {
                            window.location.href = '/pricing';
                            toast.dismiss(t.id);
                        }}
                    >
                        Upgrade Now
                    </Button>
                </div>
            ),
            { duration: 10000 }
        );
    }
    
    setMessages((prev) => prev.slice(0, -1));
    setIsLoading(false);
    return;
}
```

## Key Points

- The 429 status check must happen BEFORE attempting to parse as a normal response
- Always remove the loading assistant message when a limit error occurs
- Show both toast notification and LimitNotification for best UX
- Handle the abort/cleanup properly in finally block
- Reset limit error when starting a new message

## Troubleshooting

**Limit notification doesn't appear:**
- Check that `response.status === 429` check is in place
- Verify JSON is parsed correctly
- Check that state is being set properly

**Redirect buttons don't work:**
- Verify `action_url` is set in the response
- Check that onUpgrade/onLogin callbacks are passed
- Check browser console for errors

**Messages still appear after limit:**
- Make sure you're removing the assistant message: `setMessages((prev) => prev.slice(0, -1))`
- Verify `setIsLoading(false)` is called
