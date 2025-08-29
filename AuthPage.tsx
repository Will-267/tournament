import React, { useState } from 'react';
import { login } from './utils/auth';

const AuthPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);
        if (!result.success) {
            setError(result.message);
        }
        // On success, the 'auth-change' event will trigger a re-render in App.tsx,
        // which will then handle redirecting away from the login page.
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                 <header className="text-center mb-8">
                    <a href="#/" className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        PES Tournament Hub
                    </a>
                </header>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                    <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">Admin Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-semibold" htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-lg py-2 font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;