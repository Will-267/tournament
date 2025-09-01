import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Match, User } from '../types';

interface ChessGameProps {
    match: Match;
    onUpdateMatch: (updatedMatch: Match) => void;
    currentUser: User;
}

const ChessGame: React.FC<ChessGameProps> = ({ match, onUpdateMatch, currentUser }) => {
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
        // Prevent spectators or players from moving when it's not their turn
        if (!isPlayer || game.isGameOver()) return false;
        if ((game.turn() === 'w' && playerColor !== 'white') || (game.turn() === 'b' && playerColor !== 'black')) {
            return false;
        }

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
        
        // This local update is for UI responsiveness. The true state will come from the server.
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
        <div>
            <div className="flex justify-between items-center mb-2 text-sm text-gray-300 px-1">
                <p className="font-semibold truncate">White: <span className="text-white">{match.homeTeam.name}</span></p>
                <p className="font-semibold truncate">Black: <span className="text-white">{match.awayTeam.name}</span></p>
            </div>

            <div className="w-full max-w-[400px] mx-auto my-2">
                <Chessboard
                     // FIX: The 'position' prop for react-chessboard was likely renamed to 'boardPosition' in the installed version, causing a type error.
                     boardPosition={game.fen()}
                     onPieceDrop={onDrop}
                     boardOrientation={boardOrientation}
                     arePiecesDraggable={isPlayer && !game.isGameOver()}
                />
            </div>
            
            <div className="text-center font-semibold text-lg my-2 h-6 bg-gray-900/50 rounded-lg flex items-center justify-center">
                <p>{status}</p>
            </div>
        </div>
    );
};

export default ChessGame;
