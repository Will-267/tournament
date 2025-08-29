import React, { useState, useEffect } from 'react';
import { getCurrentUser, User } from './utils/auth';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import TournamentPage from './TournamentPage';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleAuthChange = () => {
            setCurrentUser(getCurrentUser());
        };

        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        window.addEventListener('auth-change', handleAuthChange);
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const renderContent = () => {
        const parts = hash.replace(/^#\//, '').split('/');
        
        if (parts[0] === 'login') {
             if (currentUser) {
                window.location.hash = '/';
                return <Dashboard currentUser={currentUser} />;
            }
            return <AuthPage />;
        }

        if (parts[0] === 'tournaments' && parts[1]) {
            return <TournamentPage tournamentId={parts[1]} currentUser={currentUser} />;
        }
        
        return <Dashboard currentUser={currentUser} />;
    };

    return <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">{renderContent()}</div>;
};

export default App;