import React, { useMemo, useState } from 'react';
import { Tournament, User, Player, Match } from './types';
import { UsersIcon } from './components/IconComponents';
import JoinTournamentModal from './components/JoinTournamentModal';
import ChessGame from './components/ChessGame';

const MatchListItem: React.FC<{ match: Match; onClick: (match: Match) => void; }> = ({ match, onClick }) => {
    const getPlayerClasses = (score: number | null, otherScore: number | null) => {
        let classes = "flex-1 truncate";
        if (match.played && score !== null && otherScore !== null) {
            if (score > otherScore) classes += " font-bold text-white";
            else classes += " text-gray-400";
        } else {
            classes += " text-gray-200";
        }
        return classes;
    };
    
    return (
        <button onClick={() => onClick(match)} className="w-full flex items-center justify-between bg-gray-800 hover:bg-gray-700/50 rounded-lg p-3 text-sm transition-colors text-left cursor-pointer">
            <span className={getPlayerClasses(match.homeScore, match.awayScore) + " text-right"}>{match.homeTeam.name}</span>
            <span className={`font-bold px-3 rounded mx-3 text-xs ${match.played ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                {match.played ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
            </span>
            <span className={getPlayerClasses(match.awayScore, match.homeScore) + " text-left"}>{match.awayTeam.name}</span>
        </button>
    );
};

interface TournamentPublicViewProps {
    tournament: Tournament;
    currentUser: User;
    onTournamentUpdate: (updatedTournament: Tournament) => void;
}

const TournamentPublicView: React.FC<TournamentPublicViewProps> = ({ tournament, currentUser, onTournamentUpdate }) => {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const handleJoin = () => {
        if (!currentUser) return;
        setIsJoining(true);
        const newPlayer: Player = {
            id: currentUser.id,
            name: currentUser.username,
            // Team name isn't relevant for chess, but the data structure requires it.
            teamName: currentUser.username
        };
        const updatedTournament = {
            ...tournament,
            players: [...tournament.players, newPlayer]
        };
        onTournamentUpdate(updatedTournament);
        setShowJoinModal(false);
        setIsJoining(false);
    };

    const handleUpdateChessMatch = (updatedMatch: Match) => {
        const updatedTournament = {
            ...tournament,
            matches: tournament.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m)
        };
        onTournamentUpdate(updatedTournament);

        // Close modal if game is over
        if (updatedMatch.played) {
            setSelectedMatch(null);
        }
    };

    const isPlayerRegistered = useMemo(() => tournament.players.some(p => p.id === currentUser?.id), [tournament.players, currentUser]);
    const canJoin = currentUser && !isPlayerRegistered;

    const ongoingMatches = tournament.matches.filter(m => !m.played);
    const completedMatches = tournament.matches.filter(m => m.played);

    return (
         <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            {canJoin && (
                <div className="text-center mb-6">
                    <button onClick={() => setShowJoinModal(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105">
                        Join Game Room
                        {tournament.tournamentType !== 'FREE' && ` ($${tournament.participantPrice})`}
                    </button>
                </div>
            )}
            {isPlayerRegistered && (
                 <p className="text-center text-green-400 mb-6 font-semibold">You have joined this room!</p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Players */}
                <div className="lg:col-span-1">
                     <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
                        <UsersIcon /> Players ({tournament.players.length})
                    </h3>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                        {tournament.players.length > 0 ? (
                            <ul className="space-y-2">
                                {tournament.players.map(p => (
                                    <li key={p.id} className="bg-gray-700 rounded p-2 text-sm">
                                        {p.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No players have joined yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Matches */}
                <div className="lg:col-span-2">
                    <h3 className="text-2xl font-bold mb-4 text-cyan-400">Matches</h3>
                     <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-gray-300">Ongoing Matches ({ongoingMatches.length})</h4>
                            <div className="space-y-2">
                                {ongoingMatches.length > 0 ? (
                                    ongoingMatches.map(m => <MatchListItem key={m.id} match={m} onClick={setSelectedMatch} />)
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No active matches.</p>
                                )}
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-lg mb-2 text-gray-300">Completed Matches ({completedMatches.length})</h4>
                            <div className="space-y-2">
                                {completedMatches.length > 0 ? (
                                    completedMatches.map(m => <MatchListItem key={m.id} match={m} onClick={setSelectedMatch} />)
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No matches completed yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {showJoinModal && (
                <JoinTournamentModal 
                    onClose={() => setShowJoinModal(false)}
                    onJoin={handleJoin}
                    isJoining={isJoining}
                />
            )}

            {selectedMatch && (
                <ChessGame
                    match={selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    onUpdateMatch={handleUpdateChessMatch}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default TournamentPublicView;