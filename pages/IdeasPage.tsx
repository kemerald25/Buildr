import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Idea } from "../types";
import { getAllIdeas } from "../services/firebase";
import IdeaCard from "../components/IdeaCard";
import Spinner from "../components/Spinner";
import { Plus } from "lucide-react";

// A simple Filter Icon
const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 text-slate-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

// Icon for the "Not Found" state
const NoIdeasIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-16 h-16 text-slate-300 mb-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421 0-2.8-.468-4.005-1.317a7.5 7.5 0 0 1-1.056-10.518c1.1-1.874 2.9-3.237 4.9-3.886a11.95 11.95 0 0 1 7.723 0c2 .65 3.8 2.012 4.9 3.886a7.5 7.5 0 0 1-1.056 10.518c-1.205.85-2.584 1.317-4.005 1.317Z"
    />
  </svg>
);

const IdeasPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      try {
        const allIdeas = await getAllIdeas();
        setIdeas(allIdeas);
      } catch (error) {
        console.error("Failed to fetch ideas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIdeas();
  }, []);

  const filteredIdeas = useMemo(() => {
    if (!filter) return ideas;
    const lowercasedFilter = filter.toLowerCase();
    return ideas.filter((idea) =>
      idea.skillsNeeded.some((skill) =>
        skill.toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [ideas, filter]);

  return (
    // Main wrapper with consistent background and font settings
    <div className="bg-white font-sans antialiased text-slate-800 relative overflow-x-hidden min-h-screen">
      {/* Re-using the background from other pages. You should have the CSS for this. */}
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="absolute top-[5%] left-[-10rem] w-[40rem] h-[40rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-[-10%] right-[-10rem] w-[50rem] h-[50rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main content sits on top of the background */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        {/* =================================== */}
        {/* A unified header block with title, filter, and CTA */}
        {/* =================================== */}
        <div className="relative">
          {/* "Post an Idea" button is positioned absolutely for a clean layout */}
          {/* <div className="absolute top-0 right-0 z-20">
            <Link
              to="/ideas/new" // Changed from /create to /new for convention, adjust as needed
              className="group inline-flex items-center justify-center bg-base-blue text-white font-bold py-3 px-6 rounded-full text-base transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 w-full sm:w-auto"
            >
              <Plus
                size={20}
                className="mr-2 transition-transform group-hover:rotate-90"
              />
              Post an Idea
            </Link>
          </div> */}

          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">
              Explore Project{" "}
              <span className="bg-gradient-to-r from-base-blue to-cyan-400 bg-clip-text text-transparent">
                Ideas
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              Find the next big thing or get inspired to start your own.
            </p>

            {/* A more aesthetic filter input */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
                  <FilterIcon />
                </div>
                <input
                  type="text"
                  placeholder="Filter by skill needed (e.g., UI/UX, Backend)..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full text-lg 
                             border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:outline-none 
                             transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIdeas.length > 0 ? (
              filteredIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))
            ) : (
              // An improved "No Results" state that encourages action
              <div className="col-span-full flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-slate-50/50">
                <NoIdeasIcon />
                <h3 className="text-2xl font-semibold text-slate-700">
                  No Ideas Found
                </h3>
                <p className="mt-2 max-w-md text-slate-500">
                  No ideas match your filter. Try a different skill, or be the
                  first to spark inspiration!
                </p>
                <Link
                  to="/ideas/new"
                  className="mt-6 group inline-flex items-center justify-center bg-base-blue text-white font-bold py-3 px-6 rounded-full text-base transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  Post Your Idea
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeasPage;
