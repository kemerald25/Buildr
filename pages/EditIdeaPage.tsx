// src/pages/EditIdeaPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import type { Idea } from '../types';
import { getIdeaById, updateIdea } from '../services/firebase';
import { X, Save, AlertTriangle } from 'lucide-react';

// You can reuse this component from CreateIdeaPage
interface RemovableTagProps {
    children: React.ReactNode;
    onRemove: () => void;
}
const RemovableTag: React.FC<RemovableTagProps> = ({ children, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 bg-blue-100/80 text-base-blue text-sm font-semibold pl-3 pr-2 py-1.5 rounded-full">
        {children}
        <button type="button" onClick={onRemove} className="text-base-blue/70 hover:text-base-blue hover:bg-black/10 p-0.5 rounded-full transition-colors" aria-label={`Remove ${children}`}>
            <X size={14} strokeWidth={3} />
        </button>
    </span>
);

const EditIdeaPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Idea>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentSkill, setCurrentSkill] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            navigate('/ideas');
            return;
        }

        const fetchAndVerifyIdea = async () => {
            setLoading(true);
            try {
                const ideaData = await getIdeaById(id);
                if (!ideaData) {
                    setError("Idea not found.");
                    return;
                }
                
                // CRITICAL: Authorization check
                if (ideaData.creatorUid !== user?.uid) {
                    setError("You are not authorized to edit this idea.");
                    return;
                }
                
                setFormData({
                    title: ideaData.title,
                    description: ideaData.description,
                    skillsNeeded: ideaData.skillsNeeded,
                });

            } catch (err) {
                console.error(err);
                setError("Failed to load idea data.");
            } finally {
                setLoading(false);
            }
        };

        if (user) { // Only fetch if the user is loaded
            fetchAndVerifyIdea();
        }
    }, [id, user, navigate]);


    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentSkill.trim()) {
            e.preventDefault();
            const skillToAdd = currentSkill.trim();
            const currentSkills = formData.skillsNeeded || [];
            if (skillToAdd && !currentSkills.some(s => s.toLowerCase() === skillToAdd.toLowerCase())) {
                setFormData({ ...formData, skillsNeeded: [...currentSkills, skillToAdd] });
            }
            setCurrentSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const currentSkills = formData.skillsNeeded || [];
        setFormData({ ...formData, skillsNeeded: currentSkills.filter(skill => skill !== skillToRemove) });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !formData.title || !formData.description) {
            alert("Please fill out the title and description.");
            return;
        }
        setSubmitting(true);
        try {
            await updateIdea(id, {
                title: formData.title,
                description: formData.description,
                skillsNeeded: formData.skillsNeeded || [],
            });
            alert("Idea updated successfully!");
            navigate(`/ideas/${id}`);
        } catch (error) {
            console.error("Failed to update idea:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
    }

    // Handle error states (not found, not authorized)
    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center px-4">
                <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700">Access Denied</h2>
                <p className="text-slate-500 mt-2">{error}</p>
                <Link to="/ideas" className="mt-6 bg-base-blue text-white font-bold py-2 px-6 rounded-full">Back to Ideas</Link>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-50 font-sans antialiased text-slate-800 relative overflow-x-hidden min-h-screen">
            <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
                <div className="absolute top-[-10%] right-[-10rem] w-[40rem] h-[40rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute bottom-[5%] left-[-15rem] w-[50rem] h-[50rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">
                            Edit Your <span className="bg-gradient-to-r from-base-blue to-cyan-400 bg-clip-text text-transparent">Idea</span>
                        </h1>
                        <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">
                            Refine your vision and update the details for potential collaborators.
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="bg-white/70 backdrop-blur-sm p-6 sm:p-10 rounded-2xl ring-1 ring-slate-200/80 shadow-lg">
                        <div className="space-y-8">
                            {/* Title Input */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Idea Title</label>
                                <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required
                                    className="w-full px-4 py-3 bg-white/80 text-slate-900 text-lg rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Detailed Description</label>
                                <textarea id="description" name="description" rows={8} value={formData.description || ''} onChange={handleChange} required
                                    className="w-full px-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                            </div>
                            
                            {/* Skills Needed Input */}
                            <div>
                                <label htmlFor="skills" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Skills Needed</label>
                                <div className="w-full flex flex-wrap items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-slate-300/70 focus-within:ring-2 focus-within:ring-base-blue/80 focus-within:border-base-blue/80 transition-all">
                                    {(formData.skillsNeeded || []).map(skill => <RemovableTag key={skill} onRemove={() => removeSkill(skill)}>{skill}</RemovableTag>)}
                                    <input type="text" id="skills" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown}
                                        className="flex-grow p-1 bg-transparent text-slate-900 focus:outline-none min-w-[150px]" placeholder="Type skill & press Enter" />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-10 flex justify-end">
                            <button type="submit" disabled={submitting} className="group inline-flex items-center justify-center bg-gradient-to-br from-base-blue to-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                                {submitting ? 'Saving...' : <><Save size={20} className="mr-2"/> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditIdeaPage;