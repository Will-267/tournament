
import React from 'react';
import { Match } from '../types';

interface FixtureListProps {
    matches: Match[];
    onMatchClick: (match: Match) => void;
    isHostView: boolean;
}

const FixtureList: React.FC<FixtureListProps> = ({ matches, onMatchClick, isHostView }) => {
    if (matches.length === 0) {
        return null; // Don't render anything if there are no pending matches
    }

    const MatchItem: React.FC<{match: Match}> = ({ match }) => (
        <div className="flex justify-between items-center w-full">
            <span className="flex-1 text-right">{match.homeTeam.name}</span>
            <span className="font-bold text-gray-500 px-2 rounded mx-3">vs</span>
            <span className="flex-1 text-left">{match.awayTeam.name}</span>
        </div>
    );

    return (
        <div>
            <h4 className="font-semibold text-lg mt-6 mb-2 text-gray-400">Upcoming Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {matches.map(match => {
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

export default FixtureList;
