import { Router } from 'express';
import * as db from '../services/database.service.js';

const router = Router();

router.post('/signup', (req, res) => {
    // Robust validation
    if (!req.body || typeof req.body.username !== 'string' || typeof req.body.password !== 'string' || !req.body.username.trim() || !req.body.password) {
        return res.status(400).json({ message: 'Username and password must be provided as non-empty strings.' });
    }
    const { username, password } = req.body;
    
    if (db.findUserByUsername(username)) {
        return res.status(409).json({ message: 'Username already exists.' });
    }
    
    const newUser = db.createUser(username, password);
    const sessionUser = { id: newUser.id, username: newUser.username };
    res.status(201).json({ user: sessionUser, message: 'User created successfully' });
});

router.post('/login', (req, res) => {
    // Robust validation to prevent crashes
    if (!req.body || typeof req.body.username !== 'string' || typeof req.body.password !== 'string' || !req.body.username.trim() || !req.body.password) {
        return res.status(400).json({ message: 'Username and password must be provided as non-empty strings.' });
    }
    const { username, password } = req.body;
    const user = db.findUserByUsername(username);
    
    // NOTE: In a real app, passwords should be hashed and compared securely.
    if (user && user.password === password) {
        const sessionUser = { id: user.id, username: user.username };
        res.json({ user: sessionUser, message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

export default router;