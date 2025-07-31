import React, { useEffect, useState, useMemo } from "react";
import type { User } from "../types";
import { getAllBuilders } from "../services/firebase";
import BuilderCard from "../components/BuilderCard";
import Spinner from "../components/Spinner";

// A simple Search Icon
const SearchIcon = () => (
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
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

// Icon for the "Not Found" state
const NoResultsIcon = () => (
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
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    />
  </svg>
);

const BuildersPage: React.FC = () => {
  const [builders, setBuilders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBuilders = async () => {
      setLoading(true);
      try {
        const allBuilders = await getAllBuilders();
        setBuilders(allBuilders);
      } catch (error) {
        console.error("Failed to fetch builders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuilders();
  }, []);

  const filteredBuilders = useMemo(() => {
    if (!searchTerm) return builders;
    const lowercasedFilter = searchTerm.toLowerCase();
    return builders.filter(
      (builder) =>
        builder.displayName?.toLowerCase().includes(lowercasedFilter) ||
        (builder.skills || []).some((skill) =>
          skill.toLowerCase().includes(lowercasedFilter)
        )
    );
  }, [builders, searchTerm]);

  return (
    // The main wrapper with decorative background blobs for consistency
    <div className="bg-white font-sans antialiased text-slate-800 relative overflow-x-hidden">
      {/* Re-using the background from the homepage. You already have the CSS for this! */}
      <div className="absolute top-0 left-0 w-full h-full" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-10rem] w-[40rem] h-[40rem] bg-blue-200/40 rounded-full filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-[5%] left-[-15rem] w-[50rem] h-[50rem] bg-cyan-200/30 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main content sits on top of the background */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        {/* =================================== */}
        {/* A more dynamic and stylish header/search area */}
        {/* =================================== */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter">
            Find Your{" "}
            <span className="bg-gradient-to-r from-base-blue to-cyan-400 bg-clip-text text-transparent">
              Collaborator
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Search our community of talented builders by name, role, or skill.
          </p>

          {/* A more aesthetic search input */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search by name or skill (e.g., React, Solidity)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white/80 backdrop-blur-sm text-slate-800 rounded-full text-lg 
                           border border-slate-300/70 focus:ring-2 focus:ring-base-blue/80 focus:outline-none 
                           transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredBuilders.length > 0 ? (
              filteredBuilders.map((builder) => (
                <BuilderCard key={builder.uid} builder={builder} />
              ))
            ) : (
              // An improved "No Results" state
              <div className="col-span-full flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-slate-50/50">
                <NoResultsIcon />
                <h3 className="text-2xl font-semibold text-slate-700">
                  No Builders Found
                </h3>
                <p className="mt-2 text-slate-500">
                  Try adjusting your search terms or check back later!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildersPage;
