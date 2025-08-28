import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import tournamentRoutes from './routes/tournaments.routes.js';
import { initWebSocketServer } from './services/websocket.service.js';

const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));
app.use(express.json());

// --- API Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);


// --- Server and WebSocket Setup ---
const server = http.createServer(app);

initWebSocketServer(server);

server.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});