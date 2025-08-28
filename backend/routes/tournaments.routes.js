import { Router } from 'express';
import * as db from '../services/database.service.js';
import { broadcastUpdate } from '../services/websocket.service.js';

const router = Router();

router.get('/', (req, res) => {
    res.json(db.getAllTournaments());
});

router.post('/', (req, res) => {
    const newTournament = db.createTournament(req.body);
    res.status(201).json(newTournament);
});

router.get('/:id', (req, res) => {
    const tournament = db.getTournamentById(req.params.id);
    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404).json({ message: 'Tournament not found' });
    }
});

router.put('/:id', (req, res) => {
    const updatedTournament = db.updateTournament(req.params.id, req.body);
    if (updatedTournament) {
        broadcastUpdate(req.params.id);
        res.json(updatedTournament);
    } else {
        res.status(404).json({ message: 'Tournament not found' });
    }
});

export default router;