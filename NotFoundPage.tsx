import React from 'react';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-9xl font-extrabold text-cyan-400">404</h1>
            <h2 className="text-4xl font-bold mt-4">Oops! Page Not Found.</h2>
            <p className="text-gray-400 mt-2 max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <a 
                href="#/" 
                className="mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105"
            >
                Go to Dashboard
            </a>
        </div>
    );
};

export default NotFoundPage;
