import { WebSocketServer } from 'ws';

let wss;

export const initWebSocketServer = (server) => {
    wss = new WebSocketServer({ server });

    wss.on('connection', ws => {
        console.log('Client connected');
        ws.on('close', () => console.log('Client disconnected'));
        ws.on('error', (error) => console.error('WebSocket error:', error));
    });

    console.log('WebSocket server initialized');
};

export const broadcastUpdate = (tournamentId) => {
    if (!wss) {
        console.error('WebSocket server not initialized.');
        return;
    }

    const message = JSON.stringify({ type: 'tournament-update', tournamentId });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
};