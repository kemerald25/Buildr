
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ChatConversation, ChatMessage as ChatMessageType, User } from '../types';
import { listenToChatsForUser, listenToChatMessages, sendMessage } from '../services/firebase';
import Spinner from '../components/Spinner';
import ChatMessage from '../components/ChatMessage';
import { Send, ArrowLeft, MessageSquare, Search } from 'lucide-react';

// A placeholder icon for the "select a chat" state
const MessagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16 text-slate-300 mb-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72.16c-1.144.049-2.024.96-2.024 2.097v3.286c0 1.136-.847 2.1-1.98 2.193l-3.72.16c-1.144.049-2.024.96-2.024 2.097v3.286c0 1.136-.847 2.1-1.98 2.193l-3.72.16c-1.144.049-2.024.96-2.024 2.097v3.286c0 1.136-.847 2.1-1.98 2.193l-3.72.16c-1.144.049-2.024.96-2.024 2.097v3.286" transform="translate(0 -5)" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75Zm.75 5.25a.75.75 0 0 0-1.5 0v.01a.75.75 0 0 0 1.5 0v-.01Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
    </svg>
);

const ChatPage: React.FC = () => {
    const { chatId } = useParams<{ chatId?: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeChatMessages, setActiveChatMessages] = useState<ChatMessageType[]>([]);
    const [activeChatParticipant, setActiveChatParticipant] = useState<Partial<User> | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Listen to conversation list
    useEffect(() => {
        if (!user) return;
        setLoadingConversations(true);
        const unsubscribe = listenToChatsForUser(user.uid, (convos) => {
            setConversations(convos);
            setLoadingConversations(false);
            // If user is on /chat and has convos, redirect to the first one.
            if (!chatId && convos.length > 0 && window.location.hash.endsWith('/chat')) {
                navigate(`/chat/${convos[0].id}`, { replace: true });
            }
        });
        return () => unsubscribe();
    }, [user, navigate, chatId]);

    // Listen to messages for the active chat and set participant info
    useEffect(() => {
        if (!chatId || !user) {
            setActiveChatMessages([]);
            setActiveChatParticipant(null);
            return;
        }

        const currentConvo = conversations.find(c => c.id === chatId);
        if (currentConvo) {
            const otherParticipantUid = currentConvo.participants.find(p => p !== user.uid);
            if (otherParticipantUid) {
                const pInfo = currentConvo.participantInfo[otherParticipantUid];
                setActiveChatParticipant({ 
                    uid: otherParticipantUid, 
                    displayName: pInfo.displayName,
                    pfpUrl: pInfo.pfpUrl 
                });
            }
        }

        const unsubscribe = listenToChatMessages(chatId, (messages) => {
            setActiveChatMessages(messages);
        });

        return () => unsubscribe();
    }, [chatId, user, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatId) return;

        try {
            await sendMessage(chatId, user.uid, newMessage.trim());
            setNewMessage('');
        } catch(error) {
            console.error("Failed to send message:", error);
            alert("Error sending message.");
        }
    };
    
    if (!user) {
        return <div className="text-center text-black py-20">Please sign in to view your chats.</div>;
    }

    return (
        <div className="bg-slate-50">
            <div className="container mx-auto h-screen max-h-screen p-0 sm:p-4">
                <div className="flex h-full bg-white rounded-none sm:rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
                    
                    {/* Conversations List (Sidebar) */}
                    <aside className={`w-full md:w-[320px] lg:w-[360px] bg-white border-r border-slate-200/80 flex-shrink-0 ${chatId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}>
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-slate-200/80">
                            <h2 className="text-2xl text-slate-800 font-bold tracking-tight">Messages</h2>
                        </div>
                        
                        {/* Conversation List */}
                        {loadingConversations ? <div className="p-8 flex justify-center"><Spinner /></div> : (
                            <div className="overflow-y-auto flex-grow">
                                {conversations.map(convo => {
                                    const otherParticipantUid = convo.participants.find(p => p !== user.uid);
                                    const otherUser = otherParticipantUid ? convo.participantInfo[otherParticipantUid] : null;
                                    if (!otherUser) return null;
                                    
                                    const isActive = convo.id === chatId;
                                    return (
                                        <div
                                            key={convo.id}
                                            className={`p-4 cursor-pointer flex items-center gap-4 transition-colors duration-200 border-l-4 ${isActive ? 'bg-blue-50 border-base-blue' : 'border-transparent hover:bg-slate-50'}`}
                                            onClick={() => navigate(`/chat/${convo.id}`)}
                                        >
                                            <img src={otherUser.pfpUrl || '/default-avatar.png'} alt={otherUser.displayName} className="w-12 h-12 rounded-full object-cover" />
                                            <div className="flex-grow overflow-hidden">
                                                <h3 className={`font-bold ${isActive ? 'text-slate-800' : 'text-slate-700'}`}>{otherUser.displayName}</h3>
                                                <p className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-500'} truncate`}>{convo.lastMessage.text}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </aside>

                    {/* Chat Window */}
                    <main className={`flex-grow flex flex-col bg-slate-50 ${!chatId ? 'hidden md:flex' : 'flex'}`}>
                        {chatId && activeChatParticipant ? (
                            <>
                                {/* Chat Header */}
                                <header className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/80 flex items-center gap-4 flex-shrink-0 z-10">
                                    <button onClick={() => navigate('/chat')} className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900">
                                        <ArrowLeft size={24}/>
                                    </button>
                                    <img src={activeChatParticipant.pfpUrl || '/default-avatar.png'} alt={activeChatParticipant.displayName} className="w-10 h-10 rounded-full object-cover" />
                                    <h2 className="text-lg font-bold text-slate-800">{activeChatParticipant.displayName}</h2>
                                </header>
                                
                                {/* Messages Area */}
                                <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
                                    <div className="space-y-4">
                                        {activeChatMessages.map(msg => (
                                            <ChatMessage key={msg.id} message={msg} isSender={msg.senderUid === user.uid} />
                                        ))}
                                    </div>
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                {/* Message Input Area */}
                                <div className="p-4 border-t border-slate-200/80 flex-shrink-0 bg-white">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full px-5 py-3 text-slate-800 bg-slate-100 border-transparent rounded-full focus:ring-2 focus:ring-base-blue focus:outline-none transition"
                                            autoFocus
                                        />
                                        <button type="submit" className="bg-gradient-to-br from-base-blue to-cyan-400 text-white p-3.5 rounded-full hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!newMessage.trim()}>
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-col items-center justify-center h-full text-slate-500 flex p-8 text-center">
                               <MessagesIcon />
                               <h3 className="text-xl font-semibold text-slate-600">Your Messages</h3>
                               {loadingConversations ? <Spinner/> : conversations.length > 0 ? 'Select a conversation to start chatting' : 'You have no conversations yet!'}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;