
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

// Secure CORS configuration: Only allow requests from the frontend URL.
const allowedOrigin = process.env.FRONTEND_URL;

if (!allowedOrigin) {
    // This message will appear in the Render logs, which is very helpful for debugging.
    console.error('FATAL: The FRONTEND_URL environment variable is not set. CORS will block all requests. Please set this variable in your Render service configuration to your Netlify URL (e.g., https://your-site.netlify.app).');
}

const corsOptions = {
    origin: (origin, callback) => {
        // The `origin` is the URL of the site making the request, e.g., your Netlify URL.
        // We allow the request if the origin matches our configured URL,
        // or if it's not a cross-origin request at all (e.g., from Postman, where `origin` is undefined).
        if (!origin || origin === allowedOrigin) {
            callback(null, true); // Allow the request
        } else {
            // Log the blocked origin for easier debugging.
            console.warn(`CORS: Blocked request from unauthorized origin: ${origin}. Allowed origin is: ${allowedOrigin}`);
            callback(new Error('This origin is not allowed by CORS.')); // Block the request
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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
    // If it's a CORS error, send a specific message
    if (err.message.includes('CORS')) {
        return res.status(403).json({ message: `CORS Error: ${err.message}` });
    }
    res.status(500).json({ message: 'Internal Server Error' });
});

// --- Server and WebSocket Setup ---
const server = http.createServer(app);
initWebSocketServer(server);

// --- Start Server ---
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
