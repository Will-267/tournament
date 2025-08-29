
import { Player, Group, Match, Standing, KnockoutMatch } from '../types';

// Helper to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export const calculateStandingsForGroup = (group: Group, groupMatches: Match[]): Standing[] => {
    const standingsMap: Map<string, Standing> = new Map(
        group.players.map(p => [
            p.id,
            {
                playerId: p.id,
                playerName: p.name,
                teamName: p.teamName,
                played: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0,
                rank: 0,
                groupName: group.name,
            }
        ])
    );

    groupMatches.forEach(match => {
        if (!match.played || match.homeScore === null || match.awayScore === null) return;
        
        const homeStanding = standingsMap.get(match.homeTeam.id);
        const awayStanding = standingsMap.get(match.awayTeam.id);

        // A player might be in a group but not involved in a manually added match yet
        if (!homeStanding || !awayStanding) return;

        homeStanding.played++;
        awayStanding.played++;

        homeStanding.goalsFor += match.homeScore;
        homeStanding.goalsAgainst += match.awayScore;
        awayStanding.goalsFor += match.awayScore;
        awayStanding.goalsAgainst += match.homeScore;

        homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
        awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

        if (match.homeScore > match.awayScore) {
            homeStanding.wins++;
            homeStanding.points += 3;
            awayStanding.losses++;
        } else if (match.homeScore < match.awayScore) {
            awayStanding.wins++;
            awayStanding.points += 3;
            homeStanding.losses++;
        } else {
            homeStanding.draws++;
            homeStanding.points += 1;
            awayStanding.draws++;
            awayStanding.points += 1;
        }
    });

    const sortedStandings = Array.from(standingsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.playerName.localeCompare(b.playerName);
    });
    
    return sortedStandings.map((s, index) => ({...s, rank: index + 1}));
};

export const calculateAllStandings = (groups: Group[], matches: Match[]): Record<string, Standing[]> => {
    const allStandings: Record<string, Standing[]> = {};
    groups.forEach(group => {
        const groupMatches = matches.filter(m => m.group === group.id);
        allStandings[group.id] = calculateStandingsForGroup(group, groupMatches);
    });
    return allStandings;
};

const getKnockoutSize = (numPlayers: number): number => {
    if (numPlayers < 8) return 4;
    // Find the largest power of 2 that is less than or equal to the number of players
    let power = 1;
    while (power * 2 <= numPlayers) {
        power *= 2;
    }
    // Usually, we want about half the players to qualify
    return Math.max(4, power);
};

export const determineKnockoutQualifiers = (standings: Record<string, Standing[]>, groups: Group[], numPlayers: number): Player[] => {
    const knockoutSize = getKnockoutSize(numPlayers);
    const qualifiers: Player[] = [];
    const qualifiedIds = new Set<string>();

    const remainingPlayers: Standing[] = [];

    groups.forEach(group => {
        const groupStandings = standings[group.id];
        if (groupStandings && groupStandings.length > 0) {
            remainingPlayers.push(...groupStandings);
        }
    });

    // Sort all players from all groups together to find the best performers overall
    remainingPlayers.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0; // Keep original order if all stats are identical
    });
    
    for (const p of remainingPlayers) {
        if (qualifiers.length < knockoutSize && !qualifiedIds.has(p.playerId)) {
            qualifiers.push({ id: p.playerId, name: p.playerName, teamName: p.teamName });
            qualifiedIds.add(p.playerId);
        }
    }
    
    return qualifiers;
};

const getRoundName = (numMatches: number): string => {
    if (numMatches === 1) return 'Final';
    if (numMatches === 2) return 'Semi-Finals';
    if (numMatches === 4) return 'Quarter-Finals';
    return `Round of ${numMatches * 2}`;
};

export const generateKnockoutBracket = (qualifiers: Player[]): KnockoutMatch => {
    const shuffledQualifiers = shuffleArray(qualifiers);
    const TBD_PLAYER: Player = { id: 'TBD', name: '...', teamName: 'TBD' };
    
    const rounds: Match[][] = [];
    let currentRoundQualifiers = [...shuffledQualifiers];
    let roundCounter = 1;

    while (currentRoundQualifiers.length >= 2) {
        const roundMatches: Match[] = [];
        const numMatches = currentRoundQualifiers.length / 2;
        const roundName = getRoundName(numMatches);

        for (let i = 0; i < numMatches; i++) {
            roundMatches.push({
                id: `R${roundCounter}M${i+1}`,
                homeTeam: currentRoundQualifiers[i * 2] || TBD_PLAYER,
                awayTeam: currentRoundQualifiers[i * 2 + 1] || TBD_PLAYER,
                homeScore: null,
                awayScore: null,
                played: false,
                round: roundName,
            });
        }
        rounds.push(roundMatches);
        currentRoundQualifiers = Array(numMatches).fill(TBD_PLAYER);
        roundCounter++;
    }
    
    return { rounds };
};