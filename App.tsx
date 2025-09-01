import React, { useState, useEffect } from 'react';
import { getCurrentUser, User } from './utils/auth';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import TournamentPage from './TournamentPage';
import NotFoundPage from './NotFoundPage';

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

    if (!currentUser) {
        return <AuthPage />;
    }

    const renderContent = () => {
        const path = hash.replace(/^#/, '');

        // Handle root/dashboard route
        if (path === '/' || path === '') {
            return <Dashboard currentUser={currentUser} />;
        }

        // Handle tournament route
        const tournamentMatch = path.match(/^\/tournaments\/([^/]+)/);
        if (tournamentMatch) {
            const tournamentId = tournamentMatch[1];
            return <TournamentPage tournamentId={tournamentId} currentUser={currentUser} />;
        }
        
        // Fallback for any other route
        return <NotFoundPage />;
    };

    return <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">{renderContent()}</div>;
};

export default App;