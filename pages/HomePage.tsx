import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { User, Idea } from '../types';
import { getFeaturedBuilders, getFeaturedIdeas } from '../services/firebase';
import BuilderCard from '../components/BuilderCard';
import IdeaCard from '../components/IdeaCard';
import Spinner from '../components/Spinner';

// A simple arrow icon for "View All" links, you can replace with a library like react-icons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);


const HomePage: React.FC = () => {
  const [builders, setBuilders] = useState<User[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredBuilders, featuredIdeas] = await Promise.all([
          getFeaturedBuilders(),
          getFeaturedIdeas(),
        ]);
        setBuilders(featuredBuilders);
        setIdeas(featuredIdeas);
      } catch (error) {
        console.error("Failed to fetch featured data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    // Add antialiasing for smoother fonts and a neutral background for contrast
    <div className="bg-white font-sans antialiased text-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <section className="text-center py-24 sm:py-32">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Build Together, <span className="text-base-blue">Faster.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600">
            The ultimate platform to connect with innovators, find your next project, or build the perfect team for your vision.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/builders"
              className="group inline-flex items-center justify-center bg-base-blue text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 w-full sm:w-auto"
            >
              Find a Co-builder
            </Link>
             <Link
              to="/ideas/create"
              className="group inline-flex items-center justify-center bg-white text-base-blue font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/10 ring-1 ring-slate-200 w-full sm:w-auto"
            >
              Post an Idea
            </Link>
          </div>
        </section>

        {/* Featured Builders Section */}
        <section className="py-20 border-t border-slate-200/80">
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Featured Builders</h2>
            <Link to="/builders" className="text-base-blue font-semibold hover:text-blue-700 transition-colors duration-300 flex items-center">
              View all <ArrowRightIcon />
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {builders.map(builder => (
                <BuilderCard key={builder.uid} builder={builder} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Ideas Section */}
        <section className="py-20 border-t border-slate-200/80">
          <div className="flex justify-between items-baseline mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Hot Ideas</h2>
            <Link to="/ideas" className="text-base-blue font-semibold hover:text-blue-700 transition-colors duration-300 flex items-center">
              View all <ArrowRightIcon />
            </Link>
          </div>
          {loading ? (
             <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ideas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;