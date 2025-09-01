import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Match, User } from '../types';
import { CloseIcon } from './IconComponents';

interface ChessGameProps {
    match: Match;
    onClose: () => void;
    onUpdateMatch: (updatedMatch: Match) => void;
    currentUser: User;
}

const ChessGame: React.FC<ChessGameProps> = ({ match, onClose, onUpdateMatch, currentUser }) => {
    const [game, setGame] = useState(new Chess());
    const [status, setStatus] = useState('');

    useEffect(() => {
        const newGame = new Chess();
        if (match.fen) {
            try {
                newGame.load(match.fen);
            } catch (e) {
                console.error("Failed to load FEN, starting new game.", e);
            }
        }
        setGame(newGame);
    }, [match.fen]);
    
     useEffect(() => {
        const updateStatus = () => {
            let moveColor = game.turn() === 'w' ? 'White' : 'Black';

            if (game.isCheckmate()) {
                setStatus(`Checkmate! ${moveColor === 'White' ? 'Black' : 'White'} wins.`);
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
    }, [game]);

    const isPlayer = useMemo(() => {
        return currentUser.id === match.homeTeam.id || currentUser.id === match.awayTeam.id;
    }, [currentUser, match]);

    const playerColor = useMemo(() => {
        if (currentUser.id === match.homeTeam.id) return 'white';
        if (currentUser.id === match.awayTeam.id) return 'black';
        return undefined;
    }, [currentUser, match]);

    function onDrop(sourceSquare: string, targetSquare: string) {
        if (!isPlayer || game.isGameOver()) return false;

        const gameCopy = new Chess(game.fen());
        let move = null;
        try {
            move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // NOTE: always promote to a queen for simplicity
            });
        } catch (e) {
            return false;
        }

        // illegal move
        if (move === null) {
            return false;
        }
        
        setGame(gameCopy);
        
        const updatedMatch = { ...match };
        updatedMatch.fen = gameCopy.fen();
        updatedMatch.pgn = gameCopy.pgn();

        if (gameCopy.isGameOver()) {
            updatedMatch.played = true;
            if (gameCopy.isCheckmate()) {
                updatedMatch.homeScore = gameCopy.turn() === 'b' ? 1 : 0;
                updatedMatch.awayScore = gameCopy.turn() === 'w' ? 1 : 0;
            } else { // Draw
                updatedMatch.homeScore = 0.5;
                updatedMatch.awayScore = 0.5;
            }
        }
        
        onUpdateMatch(updatedMatch);

        return true;
    }

    const boardOrientation = playerColor || 'white';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg text-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cyan-400 truncate">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="w-full max-w-[400px] mx-auto my-4">
                        <Chessboard 
                             position={game.fen()} 
                             onPieceDrop={onDrop}
                             boardOrientation={boardOrientation}
                             arePiecesDraggable={isPlayer && !game.isGameOver()}
                        />
                    </div>
                    
                    <div className="text-center font-semibold text-lg my-2 h-6">
                        <p>{status}</p>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            {game.isGameOver() ? 'Close' : 'Close Match'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;