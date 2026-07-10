import { useEffect, useState, useCallback } from 'react';

interface Message {
    id: string;
    content: string;
    user_id: string;
    conversation_id: string;
    created_at: string;
    [key: string]: any;
}

export function useWebSocket(url: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Only connect if WebSocket protocol is available
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}${url}`;

        try {
            const websocket = new WebSocket(wsUrl);

            websocket.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'message') {
                        setMessages((prev) => [...prev, data.payload]);
                    }
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            websocket.onclose = () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
            };

            setWs(websocket);

            return () => {
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.close();
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }, [url]);

    const sendMessage = useCallback(
        (data: any) => {
            if (ws && isConnected) {
                ws.send(JSON.stringify(data));
            }
        },
        [ws, isConnected]
    );

    return { messages, isConnected, sendMessage };
}
