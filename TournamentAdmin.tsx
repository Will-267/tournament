import React, { useState, useMemo } from 'react';
import { Tournament, Match, TournamentStage, Player, Group } from './types';
import { generateGroupsAndFixtures, generateFixturesForGroups, calculateAllStandings, determineKnockoutQualifiers, generateKnockoutBracket } from './utils/tournament';
import { TrophyIcon, ArrowRightIcon, UsersIcon, CloseIcon } from './components/IconComponents';
import GroupStageView from './components/GroupStageView';
import KnockoutBracket from './components/KnockoutBracket';
import ScoreModal from './components/ScoreModal';

const MIN_PLAYERS = 4;

interface TournamentHostViewProps {
    tournament: Tournament;
    onTournamentUpdate: (updatedTournament: Tournament) => Promise<void>;
}

const LobbyRegistration: React.FC<{ tournament: Tournament, onStart: () => void }> = ({ tournament, onStart }) => (
    <div className="text-center max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">Tournament Lobby</h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <UsersIcon /> Registered Players ({tournament.players.length})
            </h3>
            {tournament.players.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                    {tournament.players.map(p => <li key={p.id} className="bg-gray-700 rounded p-2 text-sm truncate" title={p.name}>{p.name}</li>)}
                </ul>
            ) : (
                <p className="text-gray-500 italic mt-8">Waiting for players to join...</p>
            )}
        </div>
        <p className="text-gray-400 text-sm mt-4">Other logged-in users can now join this tournament from the dashboard.</p>
        {tournament.players.length >= MIN_PLAYERS && (
            <button onClick={onStart} className="mt-6 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 w-full flex items-center justify-center gap-2">
                Start Tournament <ArrowRightIcon />
            </button>
        )}
    </div>
);

const ManualSetupRegistration: React.FC<{ tournament: Tournament, onUpdate: (t: Tournament) => void, onStart: () => void }> = ({ tournament, onUpdate, onStart }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [newGroupName, setNewGroupName] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;
        const newPlayer: Player = {
            id: `p${Date.now()}`,
            name: newPlayerName.trim(),
            teamName: newTeamName.trim() || undefined
        };
        onUpdate({ ...tournament, players: [...tournament.players, newPlayer] });
        setNewPlayerName('');
        setNewTeamName('');
    };

    const handleRemovePlayer = (playerId: string) => {
        const updatedGroups = tournament.groups.map(g => ({
            ...g,
            players: g.players.filter(p => p.id !== playerId)
        }));
        onUpdate({
            ...tournament,
            players: tournament.players.filter(p => p.id !== playerId),
            groups: updatedGroups
        });
    };
    
    const handleAddGroup = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newGroupName.trim()) return;
        const newGroup: Group = {
            id: `g${Date.now()}`,
            name: newGroupName.trim(),
            players: []
        };
        onUpdate({ ...tournament, groups: [...tournament.groups, newGroup] });
        setNewGroupName('');
    }

    const handleAssignPlayerToGroup = (playerId: string, groupId: string) => {
        const player = tournament.players.find(p => p.id === playerId);
        if (!player) return;

        // Remove player from any previous group
        const groupsWithoutPlayer = tournament.groups.map(g => ({
            ...g,
            players: g.players.filter(p => p.id !== playerId)
        }));

        const targetGroup = groupsWithoutPlayer.find(g => g.id === groupId);
        if (targetGroup) {
            targetGroup.players.push(player);
        }
        onUpdate({ ...tournament, groups: groupsWithoutPlayer });
    };

    const unassignedPlayers = tournament.players.filter(p =>
        !tournament.groups.some(g => g.players.some(gp => gp.id === p.id))
    );

    const canStart = tournament.players.length >= MIN_PLAYERS && unassignedPlayers.length === 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Management */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Player Setup</h3>
                <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
                    <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Player Name" className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team Name (Optional)" className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold text-sm">Add</button>
                </form>
                 <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><UsersIcon /> Registered Players ({tournament.players.length})</h4>
                    <ul className="space-y-2">
                        {tournament.players.map(p => (
                            <li key={p.id} className="flex items-center justify-between bg-gray-700 rounded p-2 text-sm">
                                <span>{p.name} {p.teamName && <span className="text-gray-400 text-xs">({p.teamName})</span>}</span>
                                <button onClick={() => handleRemovePlayer(p.id)} className="text-red-400 hover:text-red-300"><CloseIcon className="w-4 h-4" /></button>
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>

            {/* Group Management */}
            <div>
                 <h3 className="text-2xl font-bold mb-4 text-cyan-400">Group Assignment</h3>
                 <form onSubmit={handleAddGroup} className="flex gap-2 mb-4">
                    <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g., Group A" className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold text-sm">Create Group</button>
                 </form>
                 <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
                    {unassignedPlayers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-yellow-400">Unassigned Players ({unassignedPlayers.length})</h4>
                            <ul className="space-y-2">
                               {unassignedPlayers.map(p => (
                                   <li key={p.id} className="flex items-center justify-between bg-gray-700 rounded p-2 text-sm">
                                       <span>{p.name} {p.teamName && <span className="text-gray-400 text-xs">({p.teamName})</span>}</span>
                                       <select onChange={e => handleAssignPlayerToGroup(p.id, e.target.value)} value="" className="bg-gray-600 text-xs rounded p-1 border-gray-500 focus:outline-none">
                                            <option value="" disabled>Assign to...</option>
                                            {tournament.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                       </select>
                                   </li>
                               ))}
                            </ul>
                        </div>
                    )}
                    {tournament.groups.map(g => (
                        <div key={g.id} className="mb-2">
                            <h4 className="font-semibold text-cyan-300">{g.name} ({g.players.length})</h4>
                             <ul className="text-sm text-gray-300 pl-4 list-disc list-inside">
                                {g.players.map(p => <li key={p.id}>{p.name}</li>)}
                            </ul>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div className="lg:col-span-2 text-center mt-4">
                <button onClick={onStart} disabled={!canStart} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 w-full max-w-md flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100">
                    Lock Groups & Start Tournament <ArrowRightIcon />
                </button>
                 {!canStart && <p className="text-yellow-400 text-sm mt-2">You need at least {MIN_PLAYERS} players and all players must be assigned to a group to start.</p>}
            </div>
        </div>
    )
};


const TournamentHostView: React.FC<TournamentHostViewProps> = ({ tournament, onTournamentUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const startTournament = () => {
        if (tournament.players.length < MIN_PLAYERS) {
            alert(`You need at least ${MIN_PLAYERS} players to start the tournament.`);
            return;
        }

        let updatedTournament: Tournament;

        if (tournament.registrationType === 'LOBBY') {
            const { groups, matches } = generateGroupsAndFixtures(tournament.players);
            updatedTournament = { ...tournament, stage: TournamentStage.GROUP_STAGE, groups, matches };
        } else { // MANUAL
            if (tournament.groups.some(g => g.players.length < 2)) {
                alert('All groups must have at least 2 players to generate fixtures.');
                return;
            }
            const matches = generateFixturesForGroups(tournament.groups);
            updatedTournament = { ...tournament, stage: TournamentStage.GROUP_STAGE, matches };
        }
        
        onTournamentUpdate(updatedTournament);
    };

    const standings = useMemo(() => {
        if ((tournament.stage === TournamentStage.GROUP_STAGE || tournament.stage === TournamentStage.KNOCKOUT_STAGE) && tournament.groups.length > 0) {
            return calculateAllStandings(tournament.groups, tournament.matches);
        }
        return {};
    }, [tournament.matches, tournament.groups, tournament.stage]);

    const handleUpdateScore = (matchId: string, homeScore: number, awayScore: number) => {
        let updatedTournament: Tournament;

        if (tournament.stage === TournamentStage.GROUP_STAGE) {
            updatedTournament = {
                ...tournament,
                matches: tournament.matches.map(m =>
                    m.id === matchId ? { ...m, homeScore, awayScore, played: true } : m
                )
            };
        } else { // KNOCKOUT_STAGE
            const newKnockoutMatches = JSON.parse(JSON.stringify(tournament.knockoutMatches));
            const allMatches = newKnockoutMatches.rounds.flat();
            const matchToUpdate = allMatches.find((m: Match | null) => m && m.id === matchId);

            if (matchToUpdate) {
                matchToUpdate.homeScore = homeScore;
                matchToUpdate.awayScore = awayScore;
                matchToUpdate.played = true;

                for (let i = 0; i < newKnockoutMatches.rounds.length - 1; i++) {
                    const currentRound = newKnockoutMatches.rounds[i];
                    const nextRound = newKnockoutMatches.rounds[i + 1];

                    currentRound.forEach((match: Match, index: number) => {
                        if (match && match.played) {
                            const winner = match.homeScore! > match.awayScore! ? match.homeTeam : match.awayTeam;
                            const nextMatchIndex = Math.floor(index / 2);
                            const nextMatch = nextRound[nextMatchIndex];

                            if (nextMatch && !nextMatch.played) {
                                if (index % 2 === 0) {
                                    if (nextMatch.homeTeam.id === 'TBD') nextMatch.homeTeam = winner;
                                } else {
                                    if (nextMatch.awayTeam.id === 'TBD') nextMatch.awayTeam = winner;
                                }
                            }
                        }
                    });
                }
            }
            updatedTournament = { ...tournament, knockoutMatches: newKnockoutMatches };
        }

        onTournamentUpdate(updatedTournament);
        setIsModalOpen(false);
        setSelectedMatch(null);
    };

    const openModal = (match: Match) => {
        setSelectedMatch(match);
        setIsModalOpen(true);
    };

    const groupStageComplete = useMemo(() => tournament.matches.length > 0 && tournament.matches.every(m => m.played), [tournament.matches]);

    const handleAdvanceToKnockouts = () => {
        const qualifiers = determineKnockoutQualifiers(standings, tournament.groups, tournament.players.length);
        const bracket = generateKnockoutBracket(qualifiers);
        const updatedTournament: Tournament = {
            ...tournament,
            knockoutMatches: bracket,
            stage: TournamentStage.KNOCKOUT_STAGE,
        };
        onTournamentUpdate(updatedTournament);
    };

    const winner = useMemo(() => {
        if (!tournament.knockoutMatches?.rounds || tournament.knockoutMatches.rounds.length === 0) return null;
        const lastRound = tournament.knockoutMatches.rounds[tournament.knockoutMatches.rounds.length - 1];
        const final = lastRound?.[0];
        if (final && final.played) {
            return final.homeScore! > final.awayScore! ? final.homeTeam : final.awayTeam;
        }
        return null;
    }, [tournament.knockoutMatches]);


    const renderContent = () => {
        switch (tournament.stage) {
            case TournamentStage.REGISTRATION:
                if (tournament.registrationType === 'LOBBY') {
                    return <LobbyRegistration tournament={tournament} onStart={startTournament} />;
                }
                return <ManualSetupRegistration tournament={tournament} onUpdate={onTournamentUpdate} onStart={startTournament} />;

            case TournamentStage.GROUP_STAGE:
                return (
                    <div>
                        <GroupStageView groups={tournament.groups} standings={standings} matches={tournament.matches} onMatchClick={openModal} />
                        {groupStageComplete && (
                            <div className="text-center mt-8">
                                <button onClick={handleAdvanceToKnockouts} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                                    Proceed to Knockout Stage <ArrowRightIcon />
                                </button>
                            </div>
                        )}
                    </div>
                );
            case TournamentStage.KNOCKOUT_STAGE:
                 if (winner) {
                     return (
                        <div className="text-center flex flex-col items-center justify-center py-12">
                            <TrophyIcon className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                            <h2 className="text-5xl font-bold mt-4 text-yellow-300">Tournament Champion!</h2>
                            <p className="text-7xl font-extrabold mt-2 text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                                {winner.name}
                            </p>
                        </div>
                    );
                }
                return (
                    <div>
                        <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Knockout Stage</h2>
                        <KnockoutBracket bracket={tournament.knockoutMatches} onMatchClick={openModal} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            {renderContent()}
            {isModalOpen && selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleUpdateScore}
                    isKnockout={tournament.stage === TournamentStage.KNOCKOUT_STAGE}
                />
            )}
        </div>
    );
};

export default TournamentHostView;
