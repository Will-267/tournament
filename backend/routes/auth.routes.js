import { Router } from 'express';
import * as db from '../services/database.service.js';

const router = Router();

router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    if (db.findUserByUsername(username)) {
        return res.status(409).json({ message: 'Username already exists.' });
    }
    db.createUser(username, password);
    res.status(201).json({ message: 'Sign up successful! Please log in.' });
});

router.post('/login', (req, res) => {
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