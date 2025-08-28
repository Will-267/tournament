import React, { useState, useEffect } from 'react';
import { getTournaments, saveTournament } from './utils/storage';
import { User, Tournament, TournamentStage, RegistrationType } from './types';
import { logout } from './utils/auth';

interface DashboardProps {
    currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTournamentName, setNewTournamentName] = useState('');
    const [registrationType, setRegistrationType] = useState<RegistrationType>('LOBBY');

    useEffect(() => {
        const fetchTournaments = async () => {
            const data = await getTournaments();
            setTournaments(data);
        };
        fetchTournaments();
    }, []);

    const handleCreateTournament = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newTournamentName.trim();
        if (!trimmedName) return;

        const newTournamentData: Omit<Tournament, 'id'> = {
            name: trimmedName,
            createdBy: currentUser.username,
            stage: TournamentStage.REGISTRATION,
            registrationType: registrationType,
            players: [],
            groups: [],
            matches: [],
            knockoutMatches: { rounds: [] },
        };
        
        // The backend will generate the ID
        const createdTournament = await saveTournament(newTournamentData as Tournament);
        
        setTournaments(prev => [...prev, createdTournament]);
        setShowCreateModal(false);
        setNewTournamentName('');
        window.location.hash = `#/tournaments/${createdTournament.id}`;
    };
    
    const getStatusInfo = (t: Tournament): {text: string, color: string} => {
        switch(t.stage) {
            case TournamentStage.REGISTRATION:
                return { text: t.registrationType === 'LOBBY' ? 'Recruiting' : 'Setup', color: 'bg-yellow-500' };
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
                    <div>
                        <button onClick={logout} className="text-gray-400 hover:text-white font-semibold mt-4 sm:mt-0">
                            Logout
                        </button>
                    </div>
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
                                    <a key={t.id} href={`#/tournaments/${t.id}`} className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{t.name}</h3>
                                                <p className="text-sm text-gray-400">Host: {t.createdBy}</p>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${status.color}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-2">{t.players.length} players registered</p>
                                    </a>
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
                            <div>
                                <label className="block mb-1 font-semibold" htmlFor="tournamentName">Tournament Name</label>
                                <input
                                    id="tournamentName"
                                    type="text"
                                    value={newTournamentName}
                                    onChange={(e) => setNewTournamentName(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                    placeholder="e.g., Weekend Champions Cup"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold">Registration Method</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setRegistrationType('LOBBY')} className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${registrationType === 'LOBBY' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                                        <h3 className="font-bold">Public Lobby</h3>
                                        <p className="font-normal text-xs text-gray-300">Players log in and join themselves.</p>
                                    </button>
                                     <button type="button" onClick={() => setRegistrationType('MANUAL')} className={`flex-1 p-3 rounded-lg border-2 text-sm font-semibold transition-colors ${registrationType === 'MANUAL' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}>
                                        <h3 className="font-bold">Manual Setup</h3>
                                        <p className="font-normal text-xs text-gray-300">Host manually enters players and groups.</p>
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-600 hover:bg-gray-500 rounded-lg px-6 py-2 font-semibold">Cancel</button>
                                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-6 py-2 font-semibold">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
