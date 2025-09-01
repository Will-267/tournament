export type TournamentType = 'FREE' | 'PAID_PARTICIPANTS' | 'EXCLUSIVE';

export interface User {
    id: string;
    username: string;
}

export interface Player {
    id: string;
    name: string;
    teamName: string;
}

export interface Match {
    id:string;
    homeTeam: Player;
    awayTeam: Player;
    homeScore: number | null;
    awayScore: number | null;
    played: boolean;
    fen?: string; // Forsyth-Edwards Notation for chess board state
    pgn?: string; // Portable Game Notation for move history
    // FIX: Add optional group and round properties for legacy components.
    group?: string;
    round?: string;
}

export interface ChatMessage {
    id: string;
    author: string;
    text: string;
    timestamp: number;
}

// FIX: Add types for legacy group and knockout components.
export interface Group {
    id: string;
    name: string;
    players: Player[];
}

export interface Standing {
    playerId: string;
    playerName: string;
    teamName: string;
    rank: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDifference: number;
    points: number;
}

export interface KnockoutMatch {
    rounds: (Match | null)[][];
}

export interface Tournament {
    id: string;
    name: string;
    game: string;
    createdBy: string; // username of creator
    tournamentType: TournamentType;
    participantPrice: number;
    spectatorPrice: number;
    players: Player[]; // players who have joined
    matches: Match[];
    chatMessages: ChatMessage[];
    // FIX: Add optional properties for legacy group and knockout components.
    groups?: Group[];
    knockoutBracket?: KnockoutMatch;
}
