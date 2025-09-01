import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { CloseIcon } from './IconComponents';

interface ChatProps {
    messages: ChatMessage[];
    currentUser: User;
    isHost: boolean;
    onSendMessage: (messageText: string) => void;
    onDeleteMessage?: (messageId: string) => void;
    hideTitle?: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, currentUser, isHost, onSendMessage, onDeleteMessage, hideTitle }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage) {
            onSendMessage(trimmedMessage);
            setNewMessage('');
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col h-full">
            {!hideTitle && <h3 className="text-xl font-bold mb-4 text-cyan-400 flex-shrink-0">Group Chat</h3>}
            <div className="flex-grow overflow-y-auto pr-2">
                {messages.length === 0 ? (
                    <p className="text-gray-500 italic text-center mt-4">No messages yet. Say hi!</p>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className="mb-3 group relative">
                            <div className="flex items-baseline">
                                <p className="font-bold text-sm">
                                    <span className={msg.author === currentUser.username ? "text-cyan-400" : "text-purple-400"}>
                                        {msg.author}
                                    </span>
                                </p>
                                <span className="text-gray-500 text-xs ml-2">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-gray-200 break-words pr-4">{msg.text}</p>
                            {isHost && onDeleteMessage && (
                                <button
                                    onClick={() => onDeleteMessage(msg.id)}
                                    className="absolute top-0 right-0 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Delete message"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 rounded-lg px-4 py-2 font-semibold text-sm">Send</button>
                </div>
            </form>
        </div>
    );
};

export default Chat;