
import React from 'react';
import { Group, Standing, Match } from '../types';

interface GroupStageViewProps {
    groups: Group[];
    standings: Record<string, Standing[]>;
    matches: Match[];
    onMatchClick: (match: Match) => void;
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

const FixtureList: React.FC<{ matches: Match[], onMatchClick: (match: Match) => void }> = ({ matches, onMatchClick }) => {
    const pendingMatches = matches.filter(m => !m.played);
    const playedMatches = matches.filter(m => m.played);

    return (
        <div>
            <h4 className="font-semibold text-lg mt-4 mb-2 text-cyan-300">Pending Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pendingMatches.length > 0 ? pendingMatches.map(match => (
                    <button key={match.id} onClick={() => onMatchClick(match)} className="text-left w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-2 text-sm transition-colors">
                        <div className="flex justify-between items-center">
                            <span>{match.homeTeam.name}</span>
                            <span className="text-cyan-400 font-bold">vs</span>
                            <span>{match.awayTeam.name}</span>
                        </div>
                    </button>
                )) : <p className="text-gray-400 text-sm italic col-span-2">All matches played!</p>}
            </div>

            <h4 className="font-semibold text-lg mt-4 mb-2 text-gray-400">Completed Matches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {playedMatches.map(match => (
                    <div key={match.id} className="bg-gray-800 rounded-lg p-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className={match.homeScore! > match.awayScore! ? 'font-bold' : 'text-gray-400'}>{match.homeTeam.name}</span>
                            <span className="font-bold bg-gray-700 px-2 rounded">{match.homeScore} - {match.awayScore}</span>
                            <span className={match.awayScore! > match.homeScore! ? 'font-bold' : 'text-gray-400'}>{match.awayTeam.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const GroupStageView: React.FC<GroupStageViewProps> = ({ groups, standings, matches, onMatchClick }) => {
    return (
        <div>
            <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Group Stage</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                {groups.map(group => (
                    <div key={group.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col">
                        <h3 className="text-2xl font-bold mb-4 text-center">{group.name}</h3>
                        <StandingsTable standings={standings[group.id] || []} />
                        <FixtureList matches={matches.filter(m => m.group === group.id)} onMatchClick={onMatchClick} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupStageView;
