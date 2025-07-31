
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Idea, User } from '../types';
import { getIdeaById, getUserProfile, findOrCreateChat } from '../services/firebase';
import Spinner from '../components/Spinner';
import Tag from '../components/Tag';
import { useAuth } from '../hooks/useAuth';
import BuilderCard from '../components/BuilderCard';
import { MessageSquare, Users, Edit, Lock, Wrench, FileText } from 'lucide-react';

const IdeaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIdeaData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const ideaData = await getIdeaById(id);
        if (ideaData) {
          setIdea(ideaData);
          const creatorData = await getUserProfile(ideaData.creatorUid);
          if (creatorData) setCreator(creatorData);
        }
      } catch (error) {
        console.error("Failed to fetch idea details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeaData();
  }, [id]);

  const handleChat = async () => {
      if (!user || !creator) return;
      try {
        const chatId = await findOrCreateChat(user.uid, creator.uid);
        navigate(`/chat/${chatId}`);
      } catch (error) {
        console.error("Failed to create or find chat:", error);
        alert("Could not start a chat. Please try again.");
      }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner /></div>;
  if (!idea || !creator) return <div className="text-center py-20 text-black">Idea not found.</div>;

  const isOwnIdea = user?.uid === idea.creatorUid;

  return (
    // Main wrapper with consistent background and font settings
    <div className="bg-slate-50 font-sans antialiased text-slate-800 relative min-h-screen">
        <div className="absolute overflow-x-hidden top-0 left-0 w-full h-full" aria-hidden="true">
            <div className="absolute top-[5%] left-[-10rem] w-[40rem] h-[40rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            <div className="absolute bottom-[-10%] right-[-10rem] w-[50rem] h-[50rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Left Column: Idea Details */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Idea Header */}
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full">
                                <Users size={16} /> {idea.status}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 mt-4">{idea.title}</h1>
                        {/* Creator Byline */}
                        <div className="mt-4 flex items-center gap-3">
                            <img src={creator.pfpUrl || '/default-avatar.png'} alt={creator.displayName} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <span className="text-sm text-slate-500">Posted by</span>
                                <Link to={`/profile/${creator.uid}`} className="block font-semibold text-slate-700 hover:text-base-blue">{creator.displayName}</Link>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-200/80" />
                    
                    {/* Description Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-4"><FileText size={24}/> The Vision</h2>
                        <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                    </div>
                    
                    {/* Skills Needed Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-4"><Wrench size={24}/> Skills Needed</h2>
                        <div className="flex flex-wrap gap-3">
                            {idea.skillsNeeded.map(skill => <Tag key={skill}>{skill}</Tag>)}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar): Creator Info & Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl ring-1 ring-slate-200/80 shadow-lg p-6 sticky top-28">
                        <h3 className="text-xl font-bold mb-4">About the Creator</h3>
                        {/* Streamlined Creator Info */}
                        <div className="flex items-center gap-4">
                            <img src={creator.pfpUrl || '/default-avatar.png'} alt={creator.displayName} className="w-16 h-16 rounded-full object-cover" />
                            <div className="flex-grow">
                                <h4 className="text-lg font-bold text-slate-800">{creator.displayName}</h4>
                                <p className="text-sm text-slate-500">{creator.headline || "Innovator & Builder"}</p>
                                <Link to={`/profile/${creator.uid}`} className="text-sm font-semibold text-base-blue hover:underline mt-1 block">View Profile</Link>
                            </div>
                        </div>
                        
                        <hr className="my-6 border-slate-200/60" />

                        {/* Conditional Action Block */}
                        <div className="text-center">
                            {isOwnIdea ? (
                                <div className="text-center bg-slate-100 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-slate-600">You are the creator of this idea.</p>
                                    <Link to={`/ideas/edit/${idea.id}`} className="mt-2 group inline-flex items-center text-sm font-bold text-base-blue hover:underline">
                                        <Edit size={14} className="mr-1.5" /> Edit Idea
                                    </Link>
                                </div>
                            ) : user ? (
                                <button
                                    onClick={handleChat}
                                    className="w-full group inline-flex items-center justify-center bg-gradient-to-br from-base-blue to-cyan-400 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30"
                                >
                                    <MessageSquare size={20} className="mr-2"/> Collaborate
                                </button>
                            ) : (
                                <div className="text-center bg-slate-100 p-4 rounded-lg">
                                    <Lock size={20} className="mx-auto text-slate-400 mb-2"/>
                                    <p className="font-semibold text-slate-700">Ready to build?</p>
                                    {/* <p className="text-sm text-slate-500 mt-1">
                                        <button onClick={signIn} className="font-semibold text-base-blue hover:underline">Sign in</button> to contact the creator.
                                    </p> */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
};

export default IdeaDetailPage;