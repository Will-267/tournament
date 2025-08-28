import React, { useState, useEffect } from 'react';
import { getTournamentById } from './utils/storage';
import { Tournament } from './types';
import { User } from './utils/auth';
import TournamentHostView from './TournamentAdmin';
import TournamentPublicView from './TournamentViewer';

interface TournamentPageProps {
    tournamentId: string;
    currentUser: User;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ tournamentId, currentUser }) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());


    useEffect(() => {
        const loadState = () => {
            const loadedState = getTournamentById(tournamentId);
            setTournament(loadedState);
        };

        loadState();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'tournaments') {
                loadState();
                setLastUpdated(Date.now());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        const intervalId = setInterval(loadState, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, [tournamentId]);
    
    const handleTournamentUpdate = (updatedTournament: Tournament) => {
        setTournament(updatedTournament);
    }

    if (!tournament) {
        return <div className="text-center p-8">Loading tournament...</div>;
    }

    const isHost = currentUser.username === tournament.createdBy;

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        {tournament.name}
                    </h1>
                     <p className="text-gray-400 mt-2">
                        Hosted by {tournament.createdBy} | 
                        <a href="#/" className="text-cyan-400 hover:underline ml-2">Back to Dashboard</a>
                    </p>
                </header>
                <main key={lastUpdated} className="animate-[fadeIn_0.5s_ease-in-out]">
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