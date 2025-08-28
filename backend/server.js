import express from 'express';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.routes.js';
import tournamentRoutes from './routes/tournaments.routes.js';
import { initWebSocketServer } from './services/websocket.service.js';

// --- CRITICAL: Process-level error handling ---
// This acts as a last-resort safety net. If an error occurs that would
// normally crash the entire Node.js process, this will catch it.
process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
    // In a real production app, you might want to gracefully shut down here.
    // For this app, we'll log it to ensure it's visible.
});


const app = express();
const port = 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Simple request logger middleware to help with debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- API Routers ---
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);


// --- Server and WebSocket Setup ---
const server = http.createServer(app);

initWebSocketServer(server);

// --- Global Error Handling Middleware ---
// This is a catch-all for any unhandled errors within the Express request-response cycle.
app.use((err, req, res, next) => {
    console.error('An unexpected error occurred:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});


server.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
