
import React from 'react';
import { Group, Standing, Match } from '../types';
import MatchList from './MatchList';
import FixtureList from './FixtureList';

interface GroupStageViewProps {
    groups: Group[];
    standings: Record<string, Standing[]>;
    matches: Match[];
    onMatchClick: (match: Match) => void;
    isHostView: boolean;
    onAddFixture?: (groupId: string) => void;
}

const StandingsTable: React.FC<{ standings: Standing[] }> = ({ standings }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-cyan-400 uppercase bg-gray-700/50">
                <tr>
                    <th scope="col" className="pl-4 pr-2 py-2 text-center">#</th>
                    <th scope="col" className="px-2 py-2">Team</th>
                    <th scope="col" className="px-2 py-2 text-center">P</th>
                    <th scope="col" className="px-2 py-2 text-center">W</th>
                    <th scope="col" className="px-2 py-2 text-center">D</th>
                    <th scope="col" className="px-2 py-2 text-center">L</th>
                    <th scope="col" className="px-2 py-2 text-center">GD</th>
                    <th scope="col" className="px-2 py-2 text-center font-bold">Pts</th>
                </tr>
            </thead>
            <tbody>
                {standings.map((s, index) => (
                    <tr key={s.playerId} className={`border-b border-gray-700 ${index < 2 ? 'bg-cyan-900/40' : index === 2 ? 'bg-purple-900/30' : ''}`}>
                        <td className="pl-4 pr-2 py-2 text-center">{s.rank}</td>
                        <td className="px-2 py-2 font-medium text-white truncate">{s.playerName}</td>
                        <td className="px-2 py-2 text-center">{s.played}</td>
                        <td className="px-2 py-2 text-center">{s.wins}</td>
                        <td className="px-2 py-2 text-center">{s.draws}</td>
                        <td className="px-2 py-2 text-center">{s.losses}</td>
                        <td className="px-2 py-2 text-center">{s.goalDifference > 0 ? `+${s.goalDifference}`: s.goalDifference}</td>
                        <td className="px-2 py-2 text-center font-bold text-white">{s.points}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const GroupStageView: React.FC<GroupStageViewProps> = ({ groups, standings, matches, onMatchClick, isHostView, onAddFixture }) => {
    
    const pendingMatches = matches.filter(m => !m.played);
    const completedMatches = matches.filter(m => m.played);

    return (
        <div>
            <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Group Stage</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {groups.map(group => (
                    <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col">
                        <h3 className="text-2xl font-bold mb-4 text-center">{group.name}</h3>
                        <StandingsTable standings={standings[group.id] || []} />
                         {isHostView && onAddFixture && (
                            <div className="mt-4">
                                <button onClick={() => onAddFixture(group.id)} className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold transition-colors">
                                    Add Fixture
                                </button>
                            </div>
                        )}
                        <FixtureList 
                            matches={pendingMatches.filter(m => m.group === group.id)}
                            onMatchClick={onMatchClick}
                            isHostView={isHostView}
                        />
                        <MatchList 
                            matches={completedMatches.filter(m => m.group === group.id)} 
                            onMatchClick={onMatchClick}
                            isHostView={isHostView} 
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupStageView;
