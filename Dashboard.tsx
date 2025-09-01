import React, { useState, useEffect } from 'react';
import { getTournaments, createTournament, deleteTournament } from './utils/storage';
import { User, Tournament, TournamentStage, TournamentType } from './types';
import { logout } from './utils/auth';
import { CloseIcon } from './components/IconComponents';

interface DashboardProps {
    currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTournamentName, setNewTournamentName] = useState('');
    const [newTournamentGame, setNewTournamentGame] = useState('');
    const [newTournamentType, setNewTournamentType] = useState<TournamentType>('FREE');
    const [participantPrice, setParticipantPrice] = useState(0);
    const [spectatorPrice, setSpectatorPrice] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const fetchTournaments = async () => {
        const data = await getTournaments();
        setTournaments(data);
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newTournamentName.trim();
        if (!trimmedName || isCreating || !currentUser) return;

        setIsCreating(true);
        setCreateError('');

        try {
            const newTournamentData: Omit<Tournament, 'id'> = {
                name: trimmedName,
                game: newTournamentGame.trim() || 'Not specified',
                createdBy: currentUser.username,
                stage: TournamentStage.REGISTRATION,
                tournamentType: newTournamentType,
                participantPrice: newTournamentType !== 'FREE' ? participantPrice : 0,
                spectatorPrice: newTournamentType === 'EXCLUSIVE' ? spectatorPrice : 0,
                players: [],
                groups: [],
                matches: [],
                knockoutMatches: { rounds: [] },
                chatMessages: [],
            };
            
            const createdTournament = await createTournament(newTournamentData);

            if (createdTournament && createdTournament.id) {
                setTournaments(prev => [...prev, createdTournament]);
                setShowCreateModal(false);
                setNewTournamentName('');
                setNewTournamentGame('');
                window.location.hash = `#/tournaments/${createdTournament.id}`;
            } else {
                throw new Error("Server returned an invalid response.");
            }
        } catch (error: any) {
            setCreateError(error.message || "An unknown error occurred.");
        } finally {
            setIsCreating(false);
        }
    };
    
     const handleDeleteTournament = async (id: string) => {
        if (window.confirm('Are you sure you want to permanently delete this tournament?')) {
            await deleteTournament(id);
            await fetchTournaments();
        }
    };

    const getStatusInfo = (t: Tournament): {text: string, color: string} => {
        switch(t.stage) {
            case TournamentStage.REGISTRATION:
                return { text: 'Registration', color: 'bg-yellow-500' };
            case TournamentStage.GROUP_STAGE:
                return { text: 'Group Stage', color: 'bg-cyan-500' };
            case TournamentStage.KNOCKOUT_STAGE:
                return { text: 'Knockouts', color: 'bg-purple-500' };
            case TournamentStage.FINISHED:
                 return { text: 'Finished', color: 'bg-gray-500' };
            default:
                return { text: 'Unknown', color: 'bg-red-500' };
        }
    };

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                           Tournament Dashboard
                        </h1>
                        <p className="text-gray-400">Welcome, {currentUser.username}!</p>
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-white font-semibold mt-4 sm:mt-0">
                        Logout
                    </button>
                </header>

                <main>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold">Tournaments</h2>
                        <button onClick={() => setShowCreateModal(true)} className="bg-cyan-600 hover:bg-cyan-500 font-bold py-2 px-4 rounded-lg">
                            Create Tournament
                        </button>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-cyan-500/10">
                        {tournaments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tournaments.map(t => {
                                    const status = getStatusInfo(t);
                                    return (
                                    <div key={t.id} className="relative group">
                                        <a href={`#/tournaments/${t.id}`} className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 transition-colors h-full">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">{t.name}</h3>
                                                    <p className="text-sm text-cyan-300">{t.game}</p>
                                                    <p className="text-sm text-gray-400 mt-1">Host: {t.createdBy}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${status.color}`}>
                                                    {status.text}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300 mt-2">{t.players.length} players registered</p>
                                        </a>
                                         {currentUser.username === 'admin' && (
                                            <button onClick={() => handleDeleteTournament(t.id)} className="absolute top-2 right-2 p-1 bg-red-800/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete Tournament">
                                                <CloseIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )})}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">No tournaments found. Why not create one?</p>
                        )}
                    </div>
                </main>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md text-white p-6">
                        <h2 className="text-2xl font-bold mb-4">Create New Tournament</h2>
                        <form onSubmit={handleCreateTournament} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block mb-1 font-semibold" htmlFor="tournamentName">Tournament Name</label>
                                    <input
                                        id="tournamentName" type="text" value={newTournamentName}
                                        onChange={(e) => setNewTournamentName(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        placeholder="e.g., Weekend Champions Cup" required autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold" htmlFor="tournamentGame">Game</label>
                                    <input
                                        id="tournamentGame" type="text" value={newTournamentGame}
                                        onChange={(e) => setNewTournamentGame(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        placeholder="e.g., Chess, PES" required
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="block mb-1 font-semibold">Tournament Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                     <label className={`block bg-gray-700 rounded-lg p-3 text-center cursor-pointer border-2 ${newTournamentType === 'FREE' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}`}>
                                        <input type="radio" name="regType" value="FREE" checked={newTournamentType === 'FREE'} onChange={() => setNewTournamentType('FREE')} className="sr-only" />
                                        <span className="font-semibold text-sm">Free for All</span>
                                    </label>
                                     <label className={`block bg-gray-700 rounded-lg p-3 text-center cursor-pointer border-2 ${newTournamentType === 'PAID_PARTICIPANTS' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}`}>
                                        <input type="radio" name="regType" value="PAID_PARTICIPANTS" checked={newTournamentType === 'PAID_PARTICIPANTS'} onChange={() => setNewTournamentType('PAID_PARTICIPANTS')} className="sr-only" />
                                        <span className="font-semibold text-sm">Participants Pay</span>
                                    </label>
                                    <label className={`block bg-gray-700 rounded-lg p-3 text-center cursor-pointer border-2 ${newTournamentType === 'EXCLUSIVE' ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-600'}`}>
                                        <input type="radio" name="regType" value="EXCLUSIVE" checked={newTournamentType === 'EXCLUSIVE'} onChange={() => setNewTournamentType('EXCLUSIVE')} className="sr-only" />
                                        <span className="font-semibold text-sm">Exclusive</span>
                                    </label>
                                </div>
                            </div>

                            {(newTournamentType === 'PAID_PARTICIPANTS' || newTournamentType === 'EXCLUSIVE') && (
                                <div>
                                    <label className="block mb-1 font-semibold">Participant Price ($)</label>
                                    <input type="number" min="0" step="0.01" value={participantPrice} onChange={e => setParticipantPrice(parseFloat(e.target.value))}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                            )}
                            {newTournamentType === 'EXCLUSIVE' && (
                                <div>
                                    <label className="block mb-1 font-semibold">Spectator Price ($)</label>
                                    <input type="number" min="0" step="0.01" value={spectatorPrice} onChange={e => setSpectatorPrice(parseFloat(e.target.value))}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                </div>
                            )}
                            
                            {createError && <p className="text-red-400 text-sm text-center">{createError}</p>}
                            
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isCreating}>Cancel</button>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!newTournamentName.trim() || isCreating}>
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;