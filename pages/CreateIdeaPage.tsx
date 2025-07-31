import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createIdea } from '../services/firebase';
import Tag from '../components/Tag';
import { X, Rocket, Lightbulb } from 'lucide-react';

// A specialized, removable tag component for this form
interface RemovableTagProps {
  children: React.ReactNode;
  onRemove: () => void;
}
const RemovableTag: React.FC<RemovableTagProps> = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-blue-100/80 text-base-blue text-sm font-semibold pl-3 pr-2 py-1.5 rounded-full">
    {children}
    <button
      type="button"
      onClick={onRemove}
      className="text-base-blue/70 hover:text-base-blue hover:bg-black/10 p-0.5 rounded-full transition-colors"
      aria-label={`Remove ${children}`}
    >
      <X size={14} strokeWidth={3} />
    </button>
  </span>
);

const CreateIdeaPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentSkill.trim() !== '') {
      e.preventDefault();
      const skillToAdd = currentSkill.trim();
      if (skillToAdd && !skillsNeeded.includes(skillToAdd)) {
        setSkillsNeeded([...skillsNeeded, skillToAdd]);
      }
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsNeeded(skillsNeeded.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !description || skillsNeeded.length === 0) {
        alert("Please fill out all fields and add at least one skill.");
        return;
    }
    setSubmitting(true);
    try {
      const newIdea = await createIdea({
        title,
        description,
        creatorUid: user.uid,
        // Remove creatorInfo - the createIdea function will handle this internally
        skillsNeeded,
        status: 'recruiting',
      });
      navigate(`/ideas/${newIdea.id}`);
    } catch (error) {
      console.error("Failed to create idea:", error);
      alert("There was an error submitting your idea. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-black">Please sign in to post an idea.</div>;
  }

  return (
    // Main wrapper with consistent background blobs
    <div className="bg-white font-sans antialiased text-slate-800 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-10rem] w-[40rem] h-[40rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-[5%] left-[-15rem] w-[50rem] h-[50rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* A more engaging header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">
              Post a New <span className="bg-gradient-to-r from-base-blue to-cyan-400 bg-clip-text text-transparent">Idea</span>
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-lg text-slate-600">
              Bring your vision to life. Share your concept with a community of builders ready to collaborate.
            </p>
          </div>

          {/* The form, with a modern "glassmorphism" feel */}
          <form 
            onSubmit={handleSubmit} 
            className="bg-white/70 backdrop-blur-sm p-6 sm:p-10 rounded-2xl ring-1 ring-slate-200/80 shadow-lg"
          >
            <div className="space-y-8">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Idea Title</label>
                <input
                  type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 text-slate-900 text-lg rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all"
                  placeholder="e.g., Decentralized Music Streaming App" required
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Detailed Description</label>
                <textarea
                  id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-white/80 text-slate-900 rounded-xl border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:border-base-blue/80 focus:outline-none transition-all"
                  placeholder="Describe your project. What problem does it solve? What's the vision? Who is it for?" required
                />
              </div>
              
              {/* Skills Needed Input - A major redesign */}
              <div>
                <label htmlFor="skills" className="block text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Skills Needed</label>
                <div className="w-full flex flex-wrap items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-slate-300/70 focus-within:ring-2 focus-within:ring-base-blue/80 focus-within:border-base-blue/80 transition-all">
                  {skillsNeeded.map(skill => (
                    <RemovableTag key={skill} onRemove={() => removeSkill(skill)}>
                      {skill}
                    </RemovableTag>
                  ))}
                  <input
                    type="text" id="skills" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="flex-grow p-1 bg-transparent text-slate-900 focus:outline-none min-w-[150px]"
                    placeholder="Type skill & press Enter"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Add skills that collaborators would need, like "React", "Solidity", or "UI/UX Design".</p>
              </div>
            </div>

            {/* Submission Button */}
            <div className="mt-10 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex items-center justify-center bg-gradient-to-br from-base-blue to-cyan-400 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : (
                  <>
                    <Rocket size={20} className="mr-2 transition-transform group-hover:-rotate-12" />
                    Launch Idea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIdeaPage;