import React, { useState, useEffect } from 'react';
import { CloseIcon } from './IconComponents';

interface JoinTournamentModalProps {
    onClose: () => void;
    onJoin: (teamName: string) => void;
    isJoining: boolean;
}

const JoinTournamentModal: React.FC<JoinTournamentModalProps> = ({ onClose, onJoin, isJoining }) => {
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

    const handleJoinClick = () => {
        if (!teamName.trim()) {
            setError('Please enter a team name.');
            return;
        }
        setError('');
        onJoin(teamName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">Join Tournament</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white" disabled={isJoining}>
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="my-6">
                         <label htmlFor="teamName" className="block text-lg font-semibold mb-2">Choose your Team</label>
                         <input
                            id="teamName"
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g., Manchester United"
                            className="w-full bg-gray-700 text-white text-lg rounded-lg p-2 border-2 border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            autoFocus
                            disabled={isJoining}
                        />
                    </div>
                    
                    {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors" disabled={isJoining}>
                            Cancel
                        </button>
                        <button onClick={handleJoinClick} className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isJoining}>
                            {isJoining ? 'Joining...' : 'Confirm & Join'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinTournamentModal;
