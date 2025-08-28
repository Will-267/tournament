
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { CloseIcon } from './IconComponents';

interface JoinTournamentModalProps {
    currentUser: User;
    existingTeams: string[];
    existingPlayerNames: string[];
    onClose: () => void;
    onJoin: (playerName: string, teamName: string) => void;
}

const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({ currentUser, existingTeams, existingPlayerNames, onClose, onJoin }) => {
    const [playerName, setPlayerName] = useState(currentUser.username);
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleJoin = () => {
        const trimmedPlayerName = playerName.trim();
        const trimmedTeamName = teamName.trim();

        if (!trimmedPlayerName) {
            setError('Please enter a player name.');
            return;
        }
        if (!trimmedTeamName) {
            setError('Please enter a team name.');
            return;
        }

        const isPlayerNameTaken = existingPlayerNames.some(name => name.toLowerCase() === trimmedPlayerName.toLowerCase());
        if (isPlayerNameTaken) {
            setError(`The player name "${trimmedPlayerName}" is already in use. Please choose another.`);
            return;
        }

        const isTeamTaken = existingTeams.some(t => t.toLowerCase() === trimmedTeamName.toLowerCase());
        if (isTeamTaken) {
            setError(`The team "${trimmedTeamName}" has already been taken. Please choose another.`);
            return;
        }

        setError('');
        onJoin(trimmedPlayerName, trimmedTeamName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">Join Tournament</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>

                    <p className="text-gray-300 mb-4">Enter your details for the tournament. Names and teams are first come, first served!</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="playerName" className="block text-sm font-semibold mb-1">Player Name</label>
                            <input
                                id="playerName"
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                placeholder="Your in-game name"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-semibold mb-1">Team Name</label>
                            <input
                                id="teamName"
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                placeholder="e.g., Real Madrid"
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleJoin} className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Confirm & Join
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinTournamentModal;