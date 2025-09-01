import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Match, User, ChatMessage } from '../types';
import Chat from './Chat';
import { ChatIcon, CloseIcon } from './IconComponents';

interface ChessGameProps {
    match: Match;
    onUpdateMatch: (updatedMatch: Match) => void;
    currentUser: User;
    chatMessages: ChatMessage[];
    onSendMessage: (messageText: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    isHost: boolean;
}

const ChessGame: React.FC<ChessGameProps> = ({ 
    match, onUpdateMatch, currentUser, 
    chatMessages, onSendMessage, onDeleteMessage, isHost 
}) => {
    const game = useMemo(() => {
        const g = new Chess();
        if (match.fen) {
            try {
                g.load(match.fen);
            } catch (e) {
                console.error("Invalid FEN string from props, starting new game.", e);
            }
        }
        return g;
    }, [match.fen]);

    const [status, setStatus] = useState('');
    const [isChatVisible, setIsChatVisible] = useState(false);

    useEffect(() => {
        const updateStatus = () => {
            let moveColor = game.turn() === 'w' ? 'White' : 'Black';
            
            const whitePlayerName = match.homeTeam.name;
            const blackPlayerName = match.awayTeam.name;

            if (match.pgn?.includes('{White forfeits}')) {
                setStatus(`${whitePlayerName} forfeited. ${blackPlayerName} wins.`);
                return;
            }
            if (match.pgn?.includes('{Black forfeits}')) {
                setStatus(`${blackPlayerName} forfeited. ${whitePlayerName} wins.`);
                return;
            }

            if (game.isCheckmate()) {
                setStatus(`Checkmate! ${moveColor === 'White' ? blackPlayerName : whitePlayerName} wins.`);
            } else if (game.isDraw()) {
                setStatus('Draw!');
            } else {
                setStatus(`${moveColor}'s turn`);
                if (game.inCheck()) {
                    setStatus(prev => `${prev} - Check!`);
                }
            }
        };
        updateStatus();
    }, [game, match]);

    const isPlayer = useMemo(() => {
        return currentUser.id === match.homeTeam.id || currentUser.id === match.awayTeam.id;
    }, [currentUser, match]);

    const playerColor = useMemo(() => {
        if (currentUser.id === match.homeTeam.id) return 'white';
        if (currentUser.id === match.awayTeam.id) return 'black';
        return undefined;
    }, [currentUser, match]);

    function onDrop(sourceSquare: string, targetSquare: string) {
        const gameCopy = new Chess(game.fen());
        let move = null;

        try {
            move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });
        } catch (e) {
            return false;
        }

        const pieceColor = move?.color === 'w' ? 'white' : 'black';
        if (move === null || !isPlayer || match.played || playerColor !== pieceColor) {
            return false;
        }
        
        const updatedMatch = { ...match };
        updatedMatch.fen = gameCopy.fen();
        updatedMatch.pgn = gameCopy.pgn();

        if (gameCopy.isGameOver()) {
            updatedMatch.played = true;
            if (gameCopy.isCheckmate()) {
                updatedMatch.homeScore = gameCopy.turn() === 'b' ? 1 : 0;
                updatedMatch.awayScore = gameCopy.turn() === 'w' ? 1 : 0;
            } else {
                updatedMatch.homeScore = 0.5;
                updatedMatch.awayScore = 0.5;
            }
        }
        
        onUpdateMatch(updatedMatch);
        return true;
    }
    
    const handleForfeit = () => {
        if (!isPlayer || match.played) return;

        if (window.confirm("Are you sure you want to forfeit this match? This action cannot be undone.")) {
            const isHomePlayer = currentUser.id === match.homeTeam.id;
            
            const updatedMatch = {
                ...match,
                played: true,
                homeScore: isHomePlayer ? 0 : 1,
                awayScore: isHomePlayer ? 1 : 0,
                pgn: (match.pgn || '') + (isHomePlayer ? ' {White forfeits}' : ' {Black forfeits}'),
            };
            onUpdateMatch(updatedMatch);
        }
    };

    const boardOrientation = playerColor || 'white';
    const isChatLocked = match.played;

    return (
        <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-2 text-sm text-gray-300 px-1">
                        <p className="font-semibold truncate">White: <span className="text-white">{match.homeTeam.name}</span></p>
                        <p className="font-semibold truncate">Black: <span className="text-white">{match.awayTeam.name}</span></p>
                    </div>

                    <div className="w-full max-w-[400px] mx-auto my-2">
                         <div className="aspect-square">
                            <Chessboard
                                 position={game.fen()}
                                 onPieceDrop={onDrop}
                                 boardOrientation={boardOrientation}
                                 arePiecesDraggable={isPlayer && !match.played}
                            />
                        </div>
                    </div>
                    
                    <div className="text-center font-semibold text-lg my-2 h-8 bg-gray-900/50 rounded-lg flex items-center justify-center">
                        <p>{status}</p>
                    </div>

                    {isPlayer && !match.played && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleForfeit}
                                className="bg-red-700 hover:bg-red-60-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                            >
                                Forfeit Match
                            </button>
                        </div>
                    )}
                </div>

                <div className="hidden lg:block lg:col-span-1">
                     <Chat 
                        messages={chatMessages || []}
                        currentUser={currentUser}
                        onSendMessage={onSendMessage}
                        isHost={isHost}
                        onDeleteMessage={isHost ? onDeleteMessage : undefined}
                        isLocked={isChatLocked}
                    />
                </div>
            </div>

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
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsChatVisible(false)}
                    ></div>
                    <div className="absolute bottom-0 left-0 right-0 h-[85%] bg-gray-900 border-t border-gray-700 shadow-2xl rounded-t-2xl p-4 flex flex-col">
                        <div className="flex-shrink-0 flex items-center justify-between pb-4">
                            <h3 className="text-xl font-bold text-cyan-400">Match Chat</h3>
                            <button onClick={() => setIsChatVisible(false)} className="text-gray-400 hover:text-white p-1 rounded-full">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <Chat 
                            messages={chatMessages || []}
                            currentUser={currentUser}
                            onSendMessage={onSendMessage}
                            isHost={isHost}
                            onDeleteMessage={isHost ? onDeleteMessage : undefined}
                            hideTitle={true}
                            isLocked={isChatLocked}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChessGame;