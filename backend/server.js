import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- In-Memory Database ---
let users = [];
let tournaments = [];

// --- WebSocket Setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

function broadcastUpdate(tournamentId) {
    const message = JSON.stringify({ type: 'tournament-update', tournamentId });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
        }
    });
}

// --- API Endpoints ---

// Auth
app.post('/api/auth/signup', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ message: 'Username already exists.' });
    }
    const newUser = { id: `u${uuidv4()}`, username, password }; // Storing password plaintext for simplicity
    users.push(newUser);
    res.status(201).json({ message: 'Sign up successful! Please log in.' });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
        const sessionUser = { id: user.id, username: user.username };
        res.json({ user: sessionUser, message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

// Tournaments
app.get('/api/tournaments', (req, res) => {
    res.json(tournaments);
});

app.post('/api/tournaments', (req, res) => {
    const newTournament = { ...req.body, id: uuidv4() };
    tournaments.push(newTournament);
    res.status(201).json(newTournament);
});

app.get('/api/tournaments/:id', (req, res) => {
    const tournament = tournaments.find(t => t.id === req.params.id);
    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404).json({ message: 'Tournament not found' });
    }
});

app.put('/api/tournaments/:id', (req, res) => {
    const index = tournaments.findIndex(t => t.id === req.params.id);
    if (index > -1) {
        tournaments[index] = req.body;
        broadcastUpdate(req.params.id);
        res.json(tournaments[index]);
    } else {
        res.status(404).json({ message: 'Tournament not found' });
    }
});


server.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
