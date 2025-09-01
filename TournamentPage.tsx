import React, { useState, useEffect, useCallback } from 'react';
import { getTournamentById, updateTournament } from './utils/storage';
import { Tournament, ChatMessage, Match } from './types';
import { User } from './utils/auth';
import TournamentHostView from './TournamentAdmin';
import TournamentPublicView from './TournamentViewer';
import ShareLink from './components/ShareLink';
import { websocketClient } from './websocket';
import NotFoundPage from './NotFoundPage';

interface TournamentPageProps {
    tournamentId: string;
    currentUser: User;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ tournamentId, currentUser }) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

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
            websocketClient.disconnect();
        };
    }, [tournamentId, loadTournament]);
    
    const handleTournamentUpdate = async (updatedTournament: Tournament) => {
        // Use a functional update to prevent race conditions
        setTournament(current => ({...current, ...updatedTournament})); // Optimistic update
        await updateTournament(updatedTournament); // API call
    }
    
    const handleSendChatMessage = (messageText: string) => {
        if (!tournament) return;

        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            author: currentUser.username,
            text: messageText,
            timestamp: Date.now(),
        };

        const updatedTournament = {
            ...tournament,
            chatMessages: [...tournament.chatMessages, newMessage],
        };
        handleTournamentUpdate(updatedTournament);
    };

    const handleDeleteChatMessage = (messageId: string) => {
        if (!tournament) return;

        const updatedTournament = {
            ...tournament,
            chatMessages: tournament.chatMessages.filter(msg => msg.id !== messageId),
        };
        handleTournamentUpdate(updatedTournament);
    };


    if (isLoading) {
        return <div className="text-center p-8">Loading tournament...</div>;
    }
    
    if (!tournament) {
        return <NotFoundPage />;
    }

    const isHost = currentUser.username === tournament.createdBy;
    const activeMatch = tournament.matches.find(m => m.id === activeMatchId) || null;

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        {tournament.name}
                    </h1>
                    <p className="text-xl text-cyan-300 font-semibold">{tournament.game}</p>
                     <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 mt-2">
                        <p className="text-gray-400">Hosted by {tournament.createdBy}</p>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <a href="#/" className="text-cyan-400 hover:underline">Back to Dashboard</a>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <ShareLink />
                     </div>
                </header>
                <main className="animate-[fadeIn_0.5s_ease-in-out]">
                    <style>{`@keyframes fadeIn { 0% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
                    {isHost ? (
                        <TournamentHostView 
                            tournament={tournament} 
                            onTournamentUpdate={handleTournamentUpdate} 
                            currentUser={currentUser}
                            activeMatch={activeMatch}
                            setActiveMatchId={setActiveMatchId}
                            chatMessages={tournament.chatMessages}
                            onSendMessage={handleSendChatMessage}
                            onDeleteMessage={handleDeleteChatMessage}
                            isHost={isHost}
                        />
                    ) : (
                        <TournamentPublicView 
                            tournament={tournament} 
                            currentUser={currentUser} 
                            onTournamentUpdate={handleTournamentUpdate} 
                            activeMatch={activeMatch}
                            setActiveMatchId={setActiveMatchId}
                            chatMessages={tournament.chatMessages}
                            onSendMessage={handleSendChatMessage}
                            isHost={isHost}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default TournamentPage;