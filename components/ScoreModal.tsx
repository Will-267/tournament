
import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { CloseIcon } from './IconComponents';

interface ScoreModalProps {
    match: Match;
    onClose: () => void;
    onSave: (matchId: string, homeScore: number, awayScore: number) => void;
    isKnockout: boolean;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ match, onClose, onSave, isKnockout }) => {
    const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() ?? '');
    const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() ?? '');
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

    const handleSave = () => {
        const home = parseInt(homeScore, 10);
        const away = parseInt(awayScore, 10);

        if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
            setError('Please enter valid, non-negative scores.');
            return;
        }
        
        if (isKnockout && home === away) {
            setError('Draws are not allowed in the knockout stage. Please determine a winner (e.g., via penalties).');
            return;
        }

        setError('');
        onSave(match.id, home, away);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">Enter Score</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="flex items-center justify-around text-center my-6">
                        <div className="flex-1">
                            <label htmlFor="homeScore" className="block text-lg font-semibold mb-2">{match.homeTeam.name}</label>
                            <input
                                id="homeScore"
                                type="number"
                                value={homeScore}
                                onChange={(e) => setHomeScore(e.target.value)}
                                min="0"
                                className="w-24 bg-gray-700 text-white text-3xl font-bold text-center rounded-lg p-2 border-2 border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                autoFocus
                            />
                        </div>
                        <div className="text-4xl font-bold text-gray-500 mx-4">-</div>
                        <div className="flex-1">
                            <label htmlFor="awayScore" className="block text-lg font-semibold mb-2">{match.awayTeam.name}</label>
                            <input
                                id="awayScore"
                                type="number"
                                value={awayScore}
                                onChange={(e) => setAwayScore(e.target.value)}
                                min="0"
                                className="w-24 bg-gray-700 text-white text-3xl font-bold text-center rounded-lg p-2 border-2 border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Save Result
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreModal;
