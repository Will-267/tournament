const getWebSocketURL = () => {
    // The WebSocket server is assumed to be running on the same host as the web server.
    // This logic constructs the correct WebSocket URL (ws:// or wss://) based on the page's protocol.
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
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