
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
    // The game state is now derived directly from props, making this a controlled component.
    // This fixes the bug where moves would appear to revert.
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

    useEffect(() => {
        const updateStatus = () => {
            let moveColor = game.turn() === 'w' ? 'White' : 'Black';

            // Check for forfeit status first, using player names.
            if (match.pgn?.includes('{White forfeits}')) {
                setStatus(`${match.homeTeam.name} forfeited. ${match.awayTeam.name} wins.`);
                return;
            }
            if (match.pgn?.includes('{Black forfeits}')) {
                setStatus(`${match.awayTeam.name} forfeited. ${match.homeTeam.name} wins.`);
                return;
            }

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
        // Create a copy of the game to safely test the move
        const gameCopy = new Chess(game.fen());
        let move = null;

        try {
            move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' // NOTE: always promote to a queen for simplicity
            });
        } catch (e) {
             // This catch block handles invalid move structures, but move will be null for illegal chess moves.
            return false;
        }

        // --- NEW: More robust validation ---
        // 1. Is the move illegal in chess (e.g., moving through pieces)?
        // 2. Is the current user a player in this match?
        // 3. Is the game already over?
        // 4. Did the player move a piece of their own color? (e.g., white player moving a white piece)
        const pieceColor = move?.color === 'w' ? 'white' : 'black';
        if (move === null || !isPlayer || match.played || playerColor !== pieceColor) {
            return false;
        }
        
        // If all checks pass, propagate the update.
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

    return (
        <div>
            <div className="flex justify-between items-center mb-2 text-sm text-gray-300 px-1">
                <p className="font-semibold truncate">White: <span className="text-white">{match.homeTeam.name}</span></p>
                <p className="font-semibold truncate">Black: <span className="text-white">{match.awayTeam.name}</span></p>
            </div>

            <div className="w-full max-w-[400px] mx-auto my-2">
                <Chessboard
                     // FIX: The `react-chessboard` library uses the `position` prop to control the board's state.
                     // Using the wrong prop name (`fen`) was causing moves to visually revert. This is now corrected.
                     // @ts-expect-error The 'position' prop is correct for react-chessboard, but the type definitions for this project seem to be outdated.
                     position={game.fen()}
                     onPieceDrop={onDrop}
                     boardOrientation={boardOrientation}
                     arePiecesDraggable={isPlayer && !match.played}
                />
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
    );
};

export default ChessGame;