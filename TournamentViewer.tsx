import React, { useMemo, useState } from 'react';
import { Tournament, TournamentStage, User, Player, Match } from './types';
import { calculateAllStandings } from './utils/tournament';
import GroupStageView from './components/GroupStageView';
import KnockoutBracket from './components/KnockoutBracket';
import { TrophyIcon, UsersIcon } from './components/IconComponents';
import JoinTournamentModal from './components/JoinTournamentModal';
import ChessGame from './components/ChessGame';

interface TournamentPublicViewProps {
    tournament: Tournament;
    currentUser: User;
    onTournamentUpdate: (updatedTournament: Tournament) => void;
}

const RegistrationView: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">Registration is Open</h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
             <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <UsersIcon /> Registered Players ({tournament.players.length})
            </h3>
            {tournament.players.length > 0 ? (
                <ul className="space-y-2">
                    {tournament.players.map(p => (
                        <li key={p.id} className="bg-gray-700 rounded p-2 text-sm">
                            {p.name} <span className="text-cyan-300 text-xs">({p.teamName})</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500 italic">No players have registered yet.</p>}
        </div>
    </div>
);

const TournamentPublicView: React.FC<TournamentPublicViewProps> = ({ tournament, currentUser, onTournamentUpdate }) => {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);


    const standings = useMemo(() => {
        if ((tournament.stage === TournamentStage.GROUP_STAGE || tournament.stage === TournamentStage.KNOCKOUT_STAGE) && tournament.groups.length > 0) {
            return calculateAllStandings(tournament.groups, tournament.matches);
        }
        return {};
    }, [tournament]);

    const winner = useMemo(() => {
        if (!tournament || !tournament.knockoutMatches?.rounds || tournament.knockoutMatches.rounds.length === 0) return null;
        const lastRound = tournament.knockoutMatches.rounds[tournament.knockoutMatches.rounds.length - 1];
        const final = lastRound?.[0];
        if (final && final.played) {
            return final.homeScore! > final.awayScore! ? final.homeTeam : final.awayTeam;
        }
        return null;
    }, [tournament]);
    
    const handleJoin = (teamName: string) => {
        if (!currentUser) return;
        setIsJoining(true);
        // In a real app, this would trigger a payment flow for paid tournaments.
        // For now, we just add the player.
        const newPlayer: Player = {
            id: currentUser.id,
            name: currentUser.username,
            teamName: teamName.trim()
        };
        const updatedTournament = {
            ...tournament,
            players: [...tournament.players, newPlayer]
        };
        onTournamentUpdate(updatedTournament);
        setShowJoinModal(false);
        setIsJoining(false);
    };

    const handleMatchClick = (match: Match) => {
        if (tournament.game === 'Chess') {
            setSelectedMatch(match);
        }
    };
    
    const isPlayerRegistered = useMemo(() => tournament.players.some(p => p.id === currentUser?.id), [tournament.players, currentUser]);
    const canJoin = currentUser && !isPlayerRegistered && tournament.stage === TournamentStage.REGISTRATION;

    const renderContent = () => {
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

        switch (tournament.stage) {
            case TournamentStage.REGISTRATION:
                return <RegistrationView tournament={tournament} />;
            case TournamentStage.GROUP_STAGE:
                return <GroupStageView 
                            groups={tournament.groups} 
                            standings={standings} 
                            matches={tournament.matches} 
                            onMatchClick={handleMatchClick} 
                            isHostView={false} 
                        />;
            case TournamentStage.KNOCKOUT_STAGE:
                return (
                    <div>
                        <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Knockout Stage</h2>
                        <KnockoutBracket bracket={tournament.knockoutMatches} onMatchClick={handleMatchClick} />
                    </div>
                );
            default:
                return <p className="text-center text-gray-400">The tournament has not started yet.</p>;
        }
    };

    return (
         <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            {canJoin && (
                <div className="text-center mb-6">
                    <button onClick={() => setShowJoinModal(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
                        Join Tournament 
                        {tournament.tournamentType !== 'FREE' && ` ($${tournament.participantPrice})`}
                    </button>
                    {tournament.tournamentType === 'EXCLUSIVE' && (
                        <p className="text-xs text-gray-400 mt-1">Spectator Fee: ${tournament.spectatorPrice}</p>
                    )}
                </div>
            )}
            {isPlayerRegistered && tournament.stage === TournamentStage.REGISTRATION && (
                 <p className="text-center text-green-400 mb-6 font-semibold">You are registered for this tournament!</p>
            )}

            {renderContent()}
            
            {showJoinModal && (
                <JoinTournamentModal 
                    onClose={() => setShowJoinModal(false)}
                    onJoin={handleJoin}
                    isJoining={isJoining}
                />
            )}

            {selectedMatch && tournament.game === 'Chess' && (
                <ChessGame
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    onUpdateMatch={() => {}} // Spectators cannot update the match
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default TournamentPublicView;