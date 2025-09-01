import { API_BASE_URL } from './config';

const getWebSocketURL = () => {
    // Fallback for local development or if the URL hasn't been set in config.ts
    if (!API_BASE_URL || API_BASE_URL.includes('your-backend-service-url')) {
        console.warn('API_BASE_URL not set in config.ts, falling back to window.location.host for WebSocket.');
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }

    try {
        const apiUrl = new URL(API_BASE_URL);
        // Convert http/https protocol from the API base URL to ws/wss for the WebSocket connection
        const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${apiUrl.host}`;
    } catch (e) {
        console.error("Invalid API_BASE_URL in config.ts:", e);
        // Fallback to the current host if the config URL is malformed
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${window.location.host}`;
    }
};

const WS_URL = getWebSocketURL();

let socket: WebSocket | null = null;
const subscribers = new Map<string, Array<(data: any) => void>>();

export const websocketClient = {
    connect: () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            return;
        }

        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (subscribers.has(message.type)) {
                    subscribers.get(message.type)?.forEach(callback => callback(message));
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            socket = null;
        };
        
        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            socket?.close();
        };
    },

    subscribe: (type: string, callback: (data: any) => void) => {
        if (!subscribers.has(type)) {
            subscribers.set(type, []);
        }
        subscribers.get(type)?.push(callback);

        // Return an unsubscribe function
        return () => {
            const callbacks = subscribers.get(type);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    },

    disconnect: () => {
        if (socket) {
            socket.close();
            socket = null;
        }
        subscribers.clear();
    }
};
