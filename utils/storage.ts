import { Tournament } from '../types';
import { api } from '../apiClient';

// Tournament Management via API
export const getTournaments = async (): Promise<Tournament[]> => {
    return api.get<Tournament[]>('/tournaments');
};

export const getTournamentById = async (id: string): Promise<Tournament | null> => {
    try {
        return await api.get<Tournament>(`/tournaments/${id}`);
    } catch (e) {
        console.error('Failed to fetch tournament', e);
        return null;
    }
};

export const saveTournament = async (tournament: Tournament): Promise<Tournament> => {
    if (tournaments.some(t => t.id === tournament.id)) {
        // Existing tournament, use PUT to update
        return api.put<Tournament>(`/tournaments/${tournament.id}`, tournament);
    } else {
        // New tournament, use POST to create
        return api.post<Tournament>('/tournaments', tournament);
    }
};

// Local cache to determine if a tournament is new or existing for save logic
let tournaments: Tournament[] = [];
getTournaments().then(data => tournaments = data);
