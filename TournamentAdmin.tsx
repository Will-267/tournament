import React, { useState } from 'react';
import { Tournament, Match, Player, User } from './types';
import { UsersIcon, LinkIcon } from './components/IconComponents';
import ChessGame from './components/ChessGame';
import AddFixtureModal from './components/AddFixtureModal';
import { Chess } from 'chess.js';

const MatchListItem: React.FC<{ match: Match; onClick: (matchId: string) => void; isClickable: boolean; }> = ({ match, onClick, isClickable }) => {
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

    const baseClasses = "w-full flex items-center justify-between bg-gray-800 rounded-lg p-3 text-sm transition-colors text-left";
    const clickableClasses = isClickable ? " hover:bg-gray-700/50 cursor-pointer" : " cursor-default";

    return (
        <button onClick={() => isClickable && onClick(match.id)} className={baseClasses + clickableClasses} disabled={!isClickable}>
            <span className={getPlayerClasses(match.homeScore, match.awayScore) + " text-right"}>{match.homeTeam.name}</span>
            <span className={`font-bold px-3 rounded mx-3 text-xs ${match.played ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                {match.played ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
            </span>
            <span className={getPlayerClasses(match.awayScore, match.homeScore) + " text-left"}>{match.awayTeam.name}</span>
        </button>
    );
};


interface TournamentHostViewProps {
    tournament: Tournament;
    onTournamentUpdate: (updatedTournament: Tournament) => void;
    currentUser: User;
    activeMatch: Match | null;
    setActiveMatchId: (matchId: string | null) => void;
}

const TournamentHostView: React.FC<TournamentHostViewProps> = ({ tournament, onTournamentUpdate, currentUser, activeMatch, setActiveMatchId }) => {
    const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleUpdateChessMatch = (updatedMatch: Match) => {
        const updatedTournament = {
            ...tournament,
            matches: tournament.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m)
        };
        onTournamentUpdate(updatedTournament);
    };
    
    const handleSaveNewMatch = (homePlayerId: string, awayPlayerId: string) => {
        const homeTeam = tournament.players.find(p => p.id === homePlayerId);
        const awayTeam = tournament.players.find(p => p.id === awayPlayerId);
        
        if (!homeTeam || !awayTeam) return;

        const chess = new Chess();
        const newMatch: Match = {
            id: `m${Date.now()}`,
            homeTeam,
            awayTeam,
            homeScore: null,
            awayScore: null,
            played: false,
            fen: chess.fen(),
            pgn: chess.pgn(),
        };

        const updatedTournament = {
            ...tournament,
            matches: [...tournament.matches, newMatch]
        };
        
        onTournamentUpdate(updatedTournament);
        setShowCreateMatchModal(false);
    };

    const ongoingMatches = tournament.matches.filter(m => !m.played);
    const completedMatches = tournament.matches.filter(m => m.played);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Players and Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-cyan-400">Lobby</h3>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 mb-4 text-sm">Players can join using the public link. You can start matches between any two joined players.</p>
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold transition-colors"
                            >
                                <LinkIcon />
                                {copied ? 'Link Copied!' : 'Copy Join Link'}
                            </button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-cyan-400">
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
                </div>

                {/* Right Column: Matches or Active Game */}
                <div className="lg:col-span-2">
                    {activeMatch ? (
                        <div>
                             <button 
                                onClick={() => setActiveMatchId(null)} 
                                className="mb-4 bg-gray-600 hover:bg-gray-500 rounded-lg px-4 py-2 font-semibold transition-colors text-sm"
                            >
                                &larr; Back to Matches
                            </button>
                            <ChessGame
                                match={activeMatch}
                                onUpdateMatch={handleUpdateChessMatch}
                                currentUser={currentUser}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-cyan-400">Matches</h3>
                                <button 
                                    onClick={() => setShowCreateMatchModal(true)} 
                                    disabled={tournament.players.length < 2}
                                    className="bg-green-600 hover:bg-green-500 font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    Create Match
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-lg mb-2 text-gray-300">Ongoing Matches ({ongoingMatches.length})</h4>
                                    <div className="space-y-2">
                                        {ongoingMatches.length > 0 ? (
                                            ongoingMatches.map(m => <MatchListItem key={m.id} match={m} onClick={setActiveMatchId} isClickable={true} />)
                                        ) : (
                                            <p className="text-gray-500 italic text-sm">No active matches.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg mb-2 text-gray-300">Completed Matches ({completedMatches.length})</h4>
                                    <div className="space-y-2">
                                        {completedMatches.length > 0 ? (
                                            completedMatches.map(m => <MatchListItem key={m.id} match={m} onClick={setActiveMatchId} isClickable={true}/>)
                                        ) : (
                                            <p className="text-gray-500 italic text-sm">No matches completed yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showCreateMatchModal && (
                <AddFixtureModal 
                    players={tournament.players}
                    onClose={() => setShowCreateMatchModal(false)}
                    onSave={handleSaveNewMatch}
                />
            )}
        </div>
    );
};

export default TournamentHostView;