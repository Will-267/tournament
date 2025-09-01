
import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import tournamentRoutes from './routes/tournaments.routes.js';
import { initWebSocketServer } from './services/websocket.service.js';

// --- CRITICAL: Process-level error handling ---
process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
});


const app = express();
// Render provides the PORT environment variable.
const PORT = process.env.PORT || 10000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Simple request logger middleware to help with debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- API Routers ---
app.use('/auth', authRoutes);
app.use('/tournaments', tournamentRoutes);

// --- Global Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('An unexpected error occurred:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// --- Server and WebSocket Setup ---
const server = http.createServer(app);
initWebSocketServer(server);

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
