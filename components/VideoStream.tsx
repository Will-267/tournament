import React from 'react';

const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.536 0 3.284L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);


const VideoStream: React.FC = () => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">Live Stream</h3>
            <div className="aspect-video bg-black rounded-md flex items-center justify-center relative">
                <div className="text-center text-gray-400">
                    <PlayIcon className="w-16 h-16 text-gray-500/50 mx-auto" />
                    <p className="mt-2 font-semibold">Stream Offline</p>
                    <p className="text-xs">Video integration coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default VideoStream;
