import React, { useState, useMemo } from 'react';
import { Tournament, Match, TournamentStage, Player, Group } from './types';
import { 
    generateGroups, 
    calculateAllStandings, 
    determineKnockoutQualifiers, 
    generateKnockoutBracket
} from './utils/tournament';
import { TrophyIcon, ArrowRightIcon, UsersIcon, CloseIcon } from './components/IconComponents';
import GroupStageView from './components/GroupStageView';
import KnockoutBracket from './components/KnockoutBracket';
import ScoreModal from './components/ScoreModal';
import AddFixtureModal from './components/AddFixtureModal';

const MIN_PLAYERS = 4;

const ManualSetupRegistration: React.FC<{ tournament: Tournament, onUpdate: (t: Tournament) => void, onStart: () => void }> = ({ tournament, onUpdate, onStart }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [playerAddError, setPlayerAddError] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        setPlayerAddError('');
        const trimmedPlayerName = newPlayerName.trim();
        const trimmedTeamName = newTeamName.trim();

        if (!trimmedPlayerName) {
            setPlayerAddError('Player name cannot be empty.');
            return;
        }
        if (!trimmedTeamName) {
            setPlayerAddError('Team name is required.');
            return;
        }

        const isNameTaken = tournament.players.some(p => p.name?.toLowerCase() === trimmedPlayerName.toLowerCase());
        if (isNameTaken) {
            setPlayerAddError(`Player name "${trimmedPlayerName}" is already taken.`);
            return;
        }

        const isTeamTaken = tournament.players.some(p => p.teamName?.toLowerCase() === trimmedTeamName.toLowerCase());
        if (isTeamTaken) {
            setPlayerAddError(`Team "${trimmedTeamName}" is already taken.`);
            return;
        }

        const newPlayer: Player = {
            id: `p${Date.now()}`,
            name: trimmedPlayerName,
            teamName: trimmedTeamName
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

    const canStart = tournament.players.length >= MIN_PLAYERS && unassignedPlayers.length === 0 && tournament.groups.every(g => g.players.length > 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Management */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Player Setup</h3>
                <form onSubmit={handleAddPlayer} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Player Name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Team Name" className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button type="submit" className="sm:col-span-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold text-sm">Add Player</button>
                </form>
                {playerAddError && <p className="text-red-400 text-sm mb-2 text-center">{playerAddError}</p>}
                 <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><UsersIcon /> Registered Players ({tournament.players.length})</h4>
                    <ul className="space-y-2">
                        {tournament.players.map(p => (
                            <li key={p.id} className="flex items-center justify-between bg-gray-700 rounded p-2 text-sm">
                                <span>{p.name} <span className="text-cyan-300 text-xs">({p.teamName})</span></span>
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
                    <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="e.g., Room A" className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold text-sm">Create Group</button>
                 </form>
                 <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
                    {unassignedPlayers.length > 0 && (
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-yellow-400">Unassigned Players ({unassignedPlayers.length})</h4>
                            <ul className="space-y-2">
                               {unassignedPlayers.map(p => (
                                   <li key={p.id} className="flex items-center justify-between bg-gray-700 rounded p-2 text-sm">
                                       <span>{p.name} <span className="text-cyan-300 text-xs">({p.teamName})</span></span>
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
                 {!canStart && <p className="text-xs text-gray-400 mt-2">Requires min. 4 players, all players assigned to a group, and each group to have at least 2 players.</p>}
            </div>
        </div>
    );
};

// Fix: Defined TournamentHostViewProps interface for the component.
interface TournamentHostViewProps {
    tournament: Tournament;
    onTournamentUpdate: (updatedTournament: Tournament) => void;
}

const TournamentHostView: React.FC<TournamentHostViewProps> = ({ tournament, onTournamentUpdate }) => {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [showAddFixtureModalForGroup, setShowAddFixtureModalForGroup] = useState<string | null>(null);

    const standings = useMemo(() => {
        if (tournament.stage !== TournamentStage.REGISTRATION && tournament.groups.length > 0) {
            return calculateAllStandings(tournament.groups, tournament.matches);
        }
        return {};
    }, [tournament]);
    
    const handleStartManualTournament = () => {
         onTournamentUpdate({ 
            ...tournament, 
            stage: TournamentStage.GROUP_STAGE,
        });
    };

    const handleMatchClick = (match: Match) => {
        setSelectedMatch(match);
    };

    const handleSaveScore = (matchId: string, homeScore: number, awayScore: number) => {
        let updatedTournament = { ...tournament };
        
        const updateMatchList = (matches: Match[]) => {
            return matches.map(m =>
                m.id === matchId ? { ...m, homeScore, awayScore, played: true } : m
            );
        };
        
        if (tournament.stage === TournamentStage.GROUP_STAGE) {
            updatedTournament.matches = updateMatchList(tournament.matches);
        } else if (tournament.stage === TournamentStage.KNOCKOUT_STAGE) {
            const newRounds = tournament.knockoutMatches.rounds.map(round => updateMatchList(round));
            updatedTournament.knockoutMatches = { ...tournament.knockoutMatches, rounds: newRounds };

            // Advance winner to the next round
            const match = newRounds.flat().find(m => m.id === matchId);
            if(match) {
                 const winner = homeScore > awayScore ? match.homeTeam : match.awayTeam;
                 const roundIndex = newRounds.findIndex(r => r.some(m => m.id === matchId));
                 const matchIndex = newRounds[roundIndex].findIndex(m => m.id === matchId);

                 if(roundIndex + 1 < newRounds.length) {
                     const nextRoundMatchIndex = Math.floor(matchIndex / 2);
                     const nextMatch = newRounds[roundIndex + 1][nextRoundMatchIndex];
                     if (matchIndex % 2 === 0) {
                         nextMatch.homeTeam = winner;
                     } else {
                         nextMatch.awayTeam = winner;
                     }
                 }
            }
        }
        
        onTournamentUpdate(updatedTournament);
        setSelectedMatch(null);
    };
    
    const handleSaveNewFixture = (groupId: string, homePlayerId: string, awayPlayerId: string) => {
        const homeTeam = tournament.players.find(p => p.id === homePlayerId);
        const awayTeam = tournament.players.find(p => p.id === awayPlayerId);
        
        if (!homeTeam || !awayTeam) return;

        const newMatch: Match = {
            id: `m${Date.now()}`,
            homeTeam,
            awayTeam,
            homeScore: null,
            awayScore: null,
            played: false,
            group: groupId,
        };

        const updatedTournament = {
            ...tournament,
            matches: [...tournament.matches, newMatch]
        };
        
        onTournamentUpdate(updatedTournament);
        setShowAddFixtureModalForGroup(null);
    };

    const handleProceedToKnockout = () => {
        if (!standings) return;
        const qualifiers = determineKnockoutQualifiers(standings, tournament.groups, tournament.players.length);
        const knockoutBracket = generateKnockoutBracket(qualifiers);
        
        onTournamentUpdate({
            ...tournament,
            stage: TournamentStage.KNOCKOUT_STAGE,
            knockoutMatches: knockoutBracket
        });
    };

    const winner = useMemo(() => {
        if (!tournament || !tournament.knockoutMatches?.rounds || tournament.knockoutMatches.rounds.length === 0) return null;
        const lastRound = tournament.knockoutMatches.rounds[tournament.knockoutMatches.rounds.length - 1];
        const final = lastRound?.[0];
        if (final && final.played) {
            return final.homeScore! > final.awayScore! ? final.homeTeam : final.awayTeam;
        }
        return null;
    }, [tournament]);

    if (winner) {
         return (
            <div className="text-center flex flex-col items-center justify-center h-full py-12">
                <TrophyIcon className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                <h2 className="text-5xl font-bold mt-4 text-yellow-300">Tournament Champion!</h2>
                <p className="text-7xl font-extrabold mt-2 text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                    {winner.name}
                </p>
            </div>
        );
    }

    const renderContent = () => {
        switch (tournament.stage) {
            case TournamentStage.REGISTRATION:
                return <ManualSetupRegistration tournament={tournament} onUpdate={onTournamentUpdate} onStart={handleStartManualTournament} />;

            case TournamentStage.GROUP_STAGE:
                return (
                    <div>
                        <GroupStageView 
                            groups={tournament.groups} 
                            standings={standings} 
                            matches={tournament.matches} 
                            onMatchClick={handleMatchClick} 
                            isHostView={true}
                            onAddFixture={setShowAddFixtureModalForGroup}
                        />
                        <div className="text-center mt-8">
                            <button onClick={handleProceedToKnockout} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 mx-auto">
                                Proceed to Knockout Stage <ArrowRightIcon />
                            </button>
                        </div>
                    </div>
                );
            
            case TournamentStage.KNOCKOUT_STAGE:
                 return (
                    <div>
                        <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Knockout Stage</h2>
                        <KnockoutBracket bracket={tournament.knockoutMatches} onMatchClick={handleMatchClick} />
                    </div>
                );
            
            default:
                return <p>Unknown stage</p>;
        }
    };

    const groupForAddModal = useMemo(() => 
        tournament.groups.find(g => g.id === showAddFixtureModalForGroup) || null,
    [tournament.groups, showAddFixtureModalForGroup]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            {renderContent()}
            {selectedMatch && (
                <ScoreModal 
                    match={selectedMatch} 
                    onClose={() => setSelectedMatch(null)} 
                    onSave={handleSaveScore}
                    isKnockout={tournament.stage === TournamentStage.KNOCKOUT_STAGE}
                />
            )}
             {showAddFixtureModalForGroup && groupForAddModal && (
                <AddFixtureModal 
                    group={groupForAddModal}
                    onClose={() => setShowAddFixtureModalForGroup(null)}
                    onSave={handleSaveNewFixture}
                />
            )}
        </div>
    );
};

export default TournamentHostView;
