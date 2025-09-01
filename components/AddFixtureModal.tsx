import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { CloseIcon } from './IconComponents';

interface CreateMatchModalProps {
    players: Player[];
    onClose: () => void;
    onSave: (homePlayerId: string, awayPlayerId: string) => void;
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ players, onClose, onSave }) => {
    const [homePlayerId, setHomePlayerId] = useState<string>('');
    const [awayPlayerId, setAwayPlayerId] = useState<string>('');
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
        if (!homePlayerId || !awayPlayerId) {
            setError('Please select both players.');
            return;
        }
        if (homePlayerId === awayPlayerId) {
            setError('Players cannot play against themselves.');
            return;
        }

        setError('');
        onSave(homePlayerId, awayPlayerId);
    };

    const awayPlayerOptions = players.filter(p => p.id !== homePlayerId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg text-white" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-cyan-400">Create New Match</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                         <div>
                            <label htmlFor="homePlayer" className="block text-sm font-semibold mb-1">Player 1 (White)</label>
                            <select id="homePlayer" value={homePlayerId} onChange={e => setHomePlayerId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                                <option value="" disabled>Select Player</option>
                                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="awayPlayer" className="block text-sm font-semibold mb-1">Player 2 (Black)</label>
                            <select id="awayPlayer" value={awayPlayerId} onChange={e => setAwayPlayerId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" disabled={!homePlayerId}>
                                <option value="" disabled>Select Player</option>
                                {awayPlayerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}

                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold transition-colors">
                            Create Match
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateMatchModal;