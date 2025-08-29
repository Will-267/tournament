import React, { useState, useEffect, useCallback } from 'react';
import { getTournamentById, updateTournament } from './utils/storage';
import { Tournament, TournamentStage } from './types';
import { User } from './utils/auth';
import TournamentHostView from './TournamentAdmin';
import TournamentPublicView from './TournamentViewer';
import ShareLink from './components/ShareLink';
import { websocketClient } from './websocket';
import ExportPDF from './components/ExportPDF';

interface TournamentPageProps {
    tournamentId: string;
    currentUser: User;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ tournamentId, currentUser }) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadTournament = useCallback(async () => {
        const loadedTournament = await getTournamentById(tournamentId);
        setTournament(loadedTournament);
        setIsLoading(false);
    }, [tournamentId]);

    useEffect(() => {
        loadTournament();
        
        websocketClient.connect();

        const unsubscribe = websocketClient.subscribe('tournament-update', (data) => {
            if (data.tournamentId === tournamentId) {
                console.log('Received update for this tournament, reloading...');
                loadTournament();
            }
        });

        return () => {
            unsubscribe();
            // Disconnect if this is the last page using it, or manage centrally.
            // For simplicity, we can disconnect on leave.
            websocketClient.disconnect();
        };
    }, [tournamentId, loadTournament]);
    
    const handleTournamentUpdate = async (updatedTournament: Tournament) => {
        setTournament(updatedTournament); // Optimistic update
        await updateTournament(updatedTournament); // API call
    }

    if (isLoading) {
        return <div className="text-center p-8">Loading tournament...</div>;
    }
    
    if (!tournament) {
        return <div className="text-center p-8">Tournament not found.</div>;
    }

    const isHost = currentUser.username === tournament.createdBy;

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        {tournament.name}
                    </h1>
                     <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-2">
                        <p className="text-gray-400">Hosted by {tournament.createdBy}</p>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <a href="#/" className="text-cyan-400 hover:underline">Back to Dashboard</a>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <ShareLink />
                        {(tournament.stage === TournamentStage.GROUP_STAGE || tournament.stage === TournamentStage.KNOCKOUT_STAGE || tournament.stage === TournamentStage.FINISHED) && (
                            <>
                                <span className="text-gray-600 hidden sm:inline">|</span>
                                <ExportPDF tournament={tournament} />
                            </>
                        )}
                     </div>
                </header>
                <main className="animate-[fadeIn_0.5s_ease-in-out]">
                    <style>{`@keyframes fadeIn { 0% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
                    {isHost ? (
                        <TournamentHostView tournament={tournament} onTournamentUpdate={handleTournamentUpdate} />
                    ) : (
                        <TournamentPublicView tournament={tournament} currentUser={currentUser} onTournamentUpdate={handleTournamentUpdate} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default TournamentPage;