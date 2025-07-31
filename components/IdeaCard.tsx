import React from "react";
import { Link } from "react-router-dom";
import type { Idea } from "../types";
import Tag from "./Tag"; // Assumes you are using the redesigned Tag component

interface IdeaCardProps {
  idea: Idea;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  const pfpUrl = idea.creatorInfo?.pfpUrl || "/default-avatar.png";
  const displayName = idea.creatorInfo?.displayName || "A Builder";
  return (
    // The link wrapper is a block and a group for hover states.
    // h-full ensures it takes the full height of the grid cell.
    <Link to={`/ideas/${idea.id}`} className="block group h-full">
      <div
        className="bg-white border border-slate-200/90 rounded-xl p-6 h-full 
                 transition-all duration-300 ease-in-out flex flex-col
                 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1.5 group-hover:border-base-blue/30"
      >
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-base-blue transition-colors">
            {idea.title}
          </h3>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed line-clamp-3">
            {idea.description}
          </p>
        </div>

        <div className="mt-6">
          {/* Creator Info - Now using our safe variables */}
          <div className="flex items-center">
            <img
              src={pfpUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover mr-3 border-2 border-slate-100"
            />
            <div className="text-sm">
              <span className="font-medium text-slate-700">{displayName}</span>
            </div>
          </div>

          {/* Skills Needed Section */}
          <div className="mt-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Skills Needed
            </h4>
            <div className="flex flex-wrap gap-2">
              {(idea.skillsNeeded || []).slice(0, 4).map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IdeaCard;
