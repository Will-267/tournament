export enum TournamentStage {
    REGISTRATION = 'REGISTRATION',
    GROUP_STAGE = 'GROUP_STAGE',
    KNOCKOUT_STAGE = 'KNOCKOUT_STAGE',
    FINISHED = 'FINISHED',
}

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
    group?: string;
    round?: string;
}

export interface Group {
    id: string;
    name: string;
    players: Player[];
}

export interface Standing {
    playerId: string;
    playerName: string;
    teamName: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    rank: number;
    groupName: string;
}

export interface KnockoutMatch {
    rounds: Match[][];
}

export interface ChatMessage {
    id: string;
    author: string;
    text: string;
    timestamp: number;
}

export interface Tournament {
    id: string;
    name: string;
    game: string;
    createdBy: string; // username of creator
    stage: TournamentStage;
    tournamentType: TournamentType;
    participantPrice: number;
    spectatorPrice: number;
    players: Player[]; // players who have joined
    groups: Group[];
    matches: Match[];
    knockoutMatches: KnockoutMatch;
    chatMessages: ChatMessage[];
}