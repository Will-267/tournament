
const getWebSocketURL = () => {
    // The backend server runs on localhost:3001, so we connect directly.
    return 'ws://localhost:3001';
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