import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import type { User, PortfolioLink } from '../types';
// We assume you have an uploadProfilePicture function in your services
import { updateUserProfile, uploadProfilePicture } from '../services/firebase';
import { X, Save, Github, Twitter, Globe, Camera } from 'lucide-react';

// A specialized, removable tag component for this form
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

const EditProfilePage: React.FC = () => {
    const { user, loading: authLoading, isNewUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Partial<User>>({});
    const [saving, setSaving] = useState(false);
    const [currentSkill, setCurrentSkill] = useState('');
    
    // State for handling profile picture uploads
    const [pfpFile, setPfpFile] = useState<File | null>(null);
    const [pfpPreview, setPfpPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/');
        }
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                headline: user.headline || '', // Set headline from user data
                bio: user.bio || '',
                skills: user.skills || [],
                portfolioLinks: user.portfolioLinks || [],
            });
            setPfpPreview(user.pfpUrl || ''); // Set initial pfp preview
        }
    }, [user, authLoading, navigate]);

    // Handler for when a new profile picture file is selected
    const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPfpFile(file);
            // Create a temporary local URL for immediate preview
            setPfpPreview(URL.createObjectURL(file));
        }
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentSkill.trim()) {
            e.preventDefault();
            const skillToAdd = currentSkill.trim();
            const currentSkills = formData.skills || [];
            if (skillToAdd && !currentSkills.some(s => s.toLowerCase() === skillToAdd.toLowerCase())) {
                setFormData({ ...formData, skills: [...currentSkills, skillToAdd] });
            }
            setCurrentSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const currentSkills = formData.skills || [];
        setFormData({ ...formData, skills: currentSkills.filter(skill => skill !== skillToRemove) });
    };

    const handleLinkChange = (type: PortfolioLink['type'], url: string) => {
        const currentLinks = formData.portfolioLinks || [];
        const existingLinkIndex = currentLinks.findIndex(link => link.type === type);
        let newLinks = [...currentLinks];
        if (existingLinkIndex > -1) {
            if (url) newLinks[existingLinkIndex] = { type, url };
            else newLinks.splice(existingLinkIndex, 1);
        } else if (url) {
            newLinks.push({ type, url });
        }
        setFormData({ ...formData, portfolioLinks: newLinks });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.displayName) {
            alert("Please provide a display name.");
            return;
        }
        setSaving(true);
        try {
            const dataToUpdate = { ...formData };

            // If a new profile picture was selected, upload it and get the URL
            if (pfpFile) {
                const newPfpUrl = await uploadProfilePicture(user.uid, pfpFile);
                dataToUpdate.pfpUrl = newPfpUrl;
            }

            await updateUserProfile(user.uid, dataToUpdate);
            alert("Profile saved successfully!");
            navigate(`/profile/${user.uid}`);
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setSaving(false);
        }
    };
    
    if (authLoading || !user) {
        return <div className="h-screen flex items-center justify-center"><Spinner /></div>;
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
                            {isNewUser ? 'Create Your' : 'Edit Your'} <span className="bg-gradient-to-r from-base-blue to-cyan-400 bg-clip-text text-transparent">Profile</span>
                        </h1>
                        <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">
                            {isNewUser ? 'Let others know who you are and what you can do. Make a great first impression!' : 'Keep your profile fresh and up to date.'}
                        </p>
                    </div>

                    <form onSubmit={handleSave} className="bg-white/70 backdrop-blur-sm p-6 sm:p-10 rounded-2xl ring-1 ring-slate-200/80 shadow-lg">
                        <div className="space-y-8">
                            
                            {/* --- Identity Section: Photo, Name, Headline --- */}
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2 text-center md:text-left">Profile Photo</label>
                                    <div className="relative group">
                                        <img src={pfpPreview || '/default-avatar.png'} alt="Profile preview" className="h-24 w-24 rounded-full object-cover ring-2 ring-white" />
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Change profile photo">
                                            <Camera size={24} />
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handlePfpChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                                    </div>
                                </div>
                                <div className="w-full space-y-4">
                                    <div>
                                        <label htmlFor="displayName" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Display Name</label>
                                        <input type="text" id="displayName" name="displayName" value={formData.displayName || ''} onChange={handleChange} required
                                            className="w-full px-4 py-3 bg-white/80 text-slate-900 text-lg rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label htmlFor="headline" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Headline</label>
                                        <input type="text" id="headline" name="headline" value={formData.headline || ''} onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all"
                                            placeholder="e.g., Senior Frontend Engineer"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <hr className="border-slate-200/80" />
                            
                            {/* Bio Section */}
                            <div>
                                <label htmlFor="bio" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Your Bio</label>
                                <textarea id="bio" name="bio" rows={5} value={formData.bio || ''} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all"
                                    placeholder="Tell everyone a little about yourself, your background, and your ambitions." />
                            </div>
                            
                            {/* Skills Section */}
                            <div>
                                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Your Skills</label>
                                <div className="w-full flex flex-wrap items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-slate-300/70 focus-within:ring-2 focus-within:ring-base-blue/80 focus-within:border-base-blue/80 transition-all">
                                    {(formData.skills || []).map(skill => <RemovableTag key={skill} onRemove={() => removeSkill(skill)}>{skill}</RemovableTag>)}
                                    <input type="text" id="skills" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onKeyDown={handleSkillKeyDown}
                                        className="flex-grow p-1 bg-transparent text-slate-900 focus:outline-none min-w-[150px]" placeholder="Type skill & press Enter" />
                                </div>
                            </div>

                            {/* Portfolio Links Section */}
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-600 uppercase tracking-wider">Social & Portfolio Links</label>
                                {/* Inputs for GitHub, Twitter, Website */}
                                {/* GitHub */}
                               <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Github className="text-slate-400" size={20}/></div>
                                    <input type="url" placeholder="https://github.com/your-username" onChange={e => handleLinkChange('github', e.target.value)} defaultValue={formData.portfolioLinks?.find(l => l.type === 'github')?.url}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                                </div>
                                {/* Twitter */}
                               <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Twitter className="text-slate-400" size={20}/></div>
                                    <input type="url" placeholder="https://twitter.com/your-username" onChange={e => handleLinkChange('twitter', e.target.value)} defaultValue={formData.portfolioLinks?.find(l => l.type === 'twitter')?.url}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                                </div>
                                {/* Website */}
                               <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Globe className="text-slate-400" size={20}/></div>
                                    <input type="url" placeholder="https://your-portfolio.com" onChange={e => handleLinkChange('website', e.target.value)} defaultValue={formData.portfolioLinks?.find(l => l.type === 'website')?.url}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Save Button */}
                        <div className="mt-10 flex justify-end">
                            <button type="submit" disabled={saving} className="group inline-flex items-center justify-center bg-gradient-to-br from-base-blue to-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                                {saving ? 'Saving...' : <><Save size={20} className="mr-2"/> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;