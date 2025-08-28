
import React from 'react';
import { Match } from '../types';

interface MatchListProps {
    matches: Match[];
    onMatchClick: (match: Match) => void;
    isHostView: boolean;
}

const MatchList: React.FC<MatchListProps> = ({ matches, onMatchClick, isHostView }) => {
    if (matches.length === 0) {
        return <p className="text-gray-400 text-sm italic text-center mt-4">No matches played yet.</p>;
    }
    
    // Sort by most recently played
    const sortedMatches = [...matches].sort((a, b) => parseInt(b.id.substring(1)) - parseInt(a.id.substring(1)));

    const MatchItem: React.FC<{match: Match}> = ({ match }) => (
        <div className="flex justify-between items-center w-full">
            <span className={`flex-1 text-right ${match.homeScore! > match.awayScore! ? 'font-bold' : 'text-gray-400'}`}>{match.homeTeam.name}</span>
            <span className="font-bold bg-gray-700 px-2 rounded mx-3">{match.homeScore} - {match.awayScore}</span>
            <span className={`flex-1 text-left ${match.awayScore! > match.homeScore! ? 'font-bold' : 'text-gray-400'}`}>{match.awayTeam.name}</span>
        </div>
    );

    return (
        <div>
            <h4 className="font-semibold text-lg mt-6 mb-2 text-gray-400">Completed Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sortedMatches.map(match => {
                    if (isHostView) {
                        return (
                             <button key={match.id} onClick={() => onMatchClick(match)} className="w-full bg-gray-800 hover:bg-gray-700/50 rounded-lg p-2 text-sm transition-colors text-left">
                                <MatchItem match={match} />
                            </button>
                        );
                    }
                    return (
                        <div key={match.id} className="bg-gray-800 rounded-lg p-2 text-sm">
                            <MatchItem match={match} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MatchList;
