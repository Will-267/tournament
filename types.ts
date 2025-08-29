export enum TournamentStage {
    REGISTRATION = 'REGISTRATION',
    GROUP_STAGE = 'GROUP_STAGE',
    KNOCKOUT_STAGE = 'KNOCKOUT_STAGE',
    FINISHED = 'FINISHED',
}

export type RegistrationType = 'LOBBY' | 'MANUAL';

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

export interface Tournament {
    id: string;
    name: string;
    createdBy: string; // username of creator
    stage: TournamentStage;
    registrationType: RegistrationType; // New field
    players: Player[]; // players who have joined
    groups: Group[];
    matches: Match[];
    knockoutMatches: KnockoutMatch;
}