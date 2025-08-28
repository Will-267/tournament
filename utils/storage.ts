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

export const createTournament = async (tournamentData: Omit<Tournament, 'id'>): Promise<Tournament> => {
    return api.post<Tournament>('/tournaments', tournamentData);
};

export const updateTournament = async (tournament: Tournament): Promise<Tournament> => {
    return api.put<Tournament>(`/tournaments/${tournament.id}`, tournament);
};
