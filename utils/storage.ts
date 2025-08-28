import { Tournament, User } from '../types';

// User Management
export const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
};

export const saveUsers = (users: User[]): void => {
    localStorage.setItem('users', JSON.stringify(users));
};

// Tournament Management
export const getTournaments = (): Tournament[] => {
    try {
        const tournaments = localStorage.getItem('tournaments');
        return tournaments ? JSON.parse(tournaments) : [];
    } catch (e) {
        return [];
    }
};

export const saveTournaments = (tournaments: Tournament[]): void => {
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
};

export const getTournamentById = (id: string): Tournament | null => {
    const tournaments = getTournaments();
    return tournaments.find(t => t.id === id) || null;
};

export const saveTournament = (tournament: Tournament): void => {
    const tournaments = getTournaments();
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index > -1) {
        tournaments[index] = tournament;
    } else {
        tournaments.push(tournament);
    }
    saveTournaments(tournaments);
};