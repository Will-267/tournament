import React, { useState, useEffect, useCallback } from 'react';
import { getTournamentById, updateTournament } from './utils/storage';
import { Tournament, ChatMessage, Match } from './types';
import { User } from './utils/auth';
import TournamentHostView from './TournamentAdmin';
import TournamentPublicView from './TournamentViewer';
import ShareLink from './components/ShareLink';
import { websocketClient } from './websocket';
import Chat from './components/Chat';
import NotFoundPage from './NotFoundPage';
import { ChatIcon, CloseIcon } from './components/IconComponents';

interface TournamentPageProps {
    tournamentId: string;
    currentUser: User;
}

const TournamentPage: React.FC<TournamentPageProps> = ({ tournamentId, currentUser }) => {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [isChatVisible, setIsChatVisible] = useState(false);

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
    const isChatLocked = !!(activeMatch && activeMatch.played);

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
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                             {isHost ? (
                                <TournamentHostView 
                                    tournament={tournament} 
                                    onTournamentUpdate={handleTournamentUpdate} 
                                    currentUser={currentUser}
                                    activeMatch={activeMatch}
                                    setActiveMatchId={setActiveMatchId}
                                />
                            ) : (
                                <TournamentPublicView 
                                    tournament={tournament} 
                                    currentUser={currentUser} 
                                    onTournamentUpdate={handleTournamentUpdate} 
                                    activeMatch={activeMatch}
                                    setActiveMatchId={setActiveMatchId}
                                />
                            )}
                        </div>
                        <div className="hidden lg:block lg:col-span-1">
                            <Chat 
                                messages={tournament.chatMessages || []}
                                currentUser={currentUser}
                                onSendMessage={handleSendChatMessage}
                                isHost={isHost}
                                onDeleteMessage={isHost ? handleDeleteChatMessage : undefined}
                                isLocked={isChatLocked}
                            />
                        </div>
                    </div>
                </main>

                {/* Mobile Chat FAB */}
                <div className="lg:hidden fixed bottom-5 right-5 z-30">
                    <button 
                        onClick={() => setIsChatVisible(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110"
                        aria-label="Open Chat"
                    >
                        <ChatIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Chat Overlay */}
                {isChatVisible && (
                    <div className="lg:hidden fixed inset-0 z-40 transition-opacity">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsChatVisible(false)}
                        ></div>
                        {/* Chat Panel */}
                        <div className="absolute bottom-0 left-0 right-0 h-[85%] bg-gray-900 border-t border-gray-700 shadow-2xl rounded-t-2xl p-4 flex flex-col">
                            <div className="flex-shrink-0 flex items-center justify-between pb-4">
                                <h3 className="text-xl font-bold text-cyan-400">Group Chat</h3>
                                <button onClick={() => setIsChatVisible(false)} className="text-gray-400 hover:text-white p-1 rounded-full">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <Chat 
                                messages={tournament.chatMessages || []}
                                currentUser={currentUser}
                                onSendMessage={handleSendChatMessage}
                                isHost={isHost}
                                onDeleteMessage={isHost ? handleDeleteChatMessage : undefined}
                                hideTitle={true}
                                isLocked={isChatLocked}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentPage;