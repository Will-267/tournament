import React, { useState } from 'react';
import { signUp, login } from './utils/auth';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        if (isLogin) {
            const result = await login(username, password);
            if (!result.success) {
                setError(result.message);
            }
        } else {
            const result = await signUp(username, password);
            if (result.success) {
                setMessage(result.message);
                setIsLogin(true);
                setUsername('');
                setPassword('');
            } else {
                setError(result.message);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                 <header className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        PES Tournament Hub
                    </h1>
                </header>
                <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
                    <h2 className="text-3xl font-bold text-center mb-6 text-cyan-400">{isLogin ? 'Login' : 'Sign Up'}</h2>
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
                        {message && <p className="text-green-400 text-sm text-center">{message}</p>}
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-lg py-2 font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="font-semibold text-cyan-400 hover:underline ml-2">
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
