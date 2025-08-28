
import React from 'react';
import { KnockoutMatch, Match, Player } from '../types';

interface KnockoutBracketProps {
    bracket: KnockoutMatch;
    onMatchClick: (match: Match) => void;
}

const MatchCard: React.FC<{ match: Match | null; onMatchClick: (match: Match) => void; }> = ({ match, onMatchClick }) => {
    if (!match) return <div className="bg-gray-700/80 rounded-lg w-full h-[36px]"></div>;

    const isClickable = !match.played && match.homeTeam.id !== 'TBD' && match.awayTeam.id !== 'TBD';
    
    const getPlayerName = (player: Player) => player.id === 'TBD' ? '...' : player.name;
    const getPlayerClasses = (player: Player, score: number | null, otherScore: number | null) => {
        let classes = "flex-1 px-3 py-1 truncate";
        if (match && match.played && score !== null && otherScore !== null) {
            if (score > otherScore) classes += " font-bold text-white";
            else classes += " text-gray-400";
        } else {
             classes += " text-gray-200";
        }
        if (player.id === 'TBD') classes += " italic";
        return classes;
    };

    return (
        <div className={`bg-gray-700/80 rounded-lg w-full min-w-[200px] ${isClickable ? 'cursor-pointer hover:bg-gray-700 transition-colors' : 'cursor-default'}`} onClick={() => isClickable && onMatchClick(match)}>
            <div className="flex items-center text-sm">
                <span className={getPlayerClasses(match.homeTeam, match.homeScore, match.awayScore)} title={getPlayerName(match.homeTeam)}>{getPlayerName(match.homeTeam)}</span>
                <span className={`px-2 py-1 rounded-md font-bold text-xs ${match.played ? 'bg-cyan-600' : 'bg-gray-600'}`}>
                    {match.played ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                </span>
                <span className={getPlayerClasses(match.awayTeam, match.awayScore, match.homeScore)} title={getPlayerName(match.awayTeam)}>{getPlayerName(match.awayTeam)}</span>
            </div>
        </div>
    );
};

const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ bracket, onMatchClick }) => {
    const { rounds = [] } = bracket;

    if (rounds.length === 0) {
        return <p>Knockout bracket will be generated once the group stage is complete.</p>;
    }
    
    return (
        <div className="flex space-x-4 md:space-x-8 overflow-x-auto pb-4">
            {rounds.map((round, roundIndex) => (
                <div key={roundIndex} className="flex flex-col flex-shrink-0">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400 text-center">{round[0]?.round || `Round ${roundIndex + 1}`}</h3>
                    <div className={`flex flex-col gap-8 justify-around h-full`}>
                        {round.map((match, matchIndex) => (
                            <MatchCard key={match ? match.id : `empty-r${roundIndex}-m${matchIndex}`} match={match} onMatchClick={onMatchClick} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KnockoutBracket;
