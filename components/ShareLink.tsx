
import React, { useState } from 'react';
import { LinkIcon } from './IconComponents';

const ShareLink: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const url = window.location.href;

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="relative">
            <button
                onClick={handleCopy}
                aria-label="Copy tournament link"
                className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-full px-4 py-1 text-sm text-cyan-300 transition-colors"
            >
                <LinkIcon className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Share Tournament'}</span>
            </button>
        </div>
    );
};

export default ShareLink;
