import React, { useMemo } from 'react';
import { Tournament, TournamentStage, Player, User } from './types';
import { calculateAllStandings } from './utils/tournament';
import GroupStageView from './components/GroupStageView';
import KnockoutBracket from './components/KnockoutBracket';
import { TrophyIcon, UsersIcon } from './components/IconComponents';

interface TournamentPublicViewProps {
    tournament: Tournament;
    currentUser: User | null;
    onTournamentUpdate: (updatedTournament: Tournament) => Promise<void>;
}

const RegistrationView: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
     <div className="text-center max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">Tournament Setup</h2>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 min-h-[200px]">
            <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <UsersIcon /> Registered Players ({tournament.players.length})
            </h3>
            {tournament.players.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                    {tournament.players.map(p => <li key={p.id} className="bg-gray-700 rounded p-2 text-sm truncate" title={`${p.name} (${p.teamName})`}>{p.name} <span className="text-cyan-400 text-xs">({p.teamName})</span></li>)}
                </ul>
            ) : (
                <p className="text-gray-500 italic mt-8">The host is setting up the tournament...</p>
            )}
        </div>
    </div>
);

const ManualSetupView: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
    <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">Tournament Setup in Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                 <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <UsersIcon /> Registered Players ({tournament.players.length})
                </h3>
                <ul className="space-y-2">
                    {tournament.players.map(p => (
                        <li key={p.id} className="bg-gray-700 rounded p-2 text-sm">
                            {p.name} <span className="text-cyan-300 text-xs">({p.teamName})</span>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                 <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Groups
                </h3>
                {tournament.groups.length > 0 ? (
                    <div className="space-y-4">
                        {tournament.groups.map(g => (
                            <div key={g.id}>
                                <h4 className="font-semibold text-cyan-300">{g.name} ({g.players.length} players)</h4>
                                <ul className="text-sm text-gray-300 pl-4 list-disc list-inside">
                                    {g.players.map(p => <li key={p.id}>{p.name}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 italic">The host is setting up the groups.</p>}
            </div>
        </div>
    </div>
);


const TournamentPublicView: React.FC<TournamentPublicViewProps> = ({ tournament, currentUser, onTournamentUpdate }) => {

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
                return <ManualSetupView tournament={tournament} />;
            case TournamentStage.GROUP_STAGE:
                return <GroupStageView 
                            groups={tournament.groups} 
                            standings={standings} 
                            matches={tournament.matches} 
                            onMatchClick={() => {}} 
                            isHostView={false} 
                        />;
            case TournamentStage.KNOCKOUT_STAGE:
                return (
                    <div>
                        <h2 className="text-4xl font-bold text-center mb-8 text-cyan-400">Knockout Stage</h2>
                        <KnockoutBracket bracket={tournament.knockoutMatches} onMatchClick={() => {}} />
                    </div>
                );
            default:
                return <p className="text-center text-gray-400">The tournament has not started yet.</p>;
        }
    };

    return (
         <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl shadow-cyan-500/10">
            {renderContent()}
        </div>
    );
};

export default TournamentPublicView;