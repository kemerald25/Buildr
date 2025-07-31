import React from "react";
import { Link } from "react-router-dom";
import type { User } from "../types";
import Tag from "./Tag"; // We will create this component next

interface BuilderCardProps {
  builder: User;
}

const BuilderCard: React.FC<BuilderCardProps> = ({ builder }) => {
  return (
    // The link wrapper is a block element and a group for hover states
    <Link to={`/profile/${builder.uid}`} className="block group text-center">
      
      {/* The main card container with all styling and transitions */}
      <div 
        className="bg-white p-6 rounded-xl h-full border border-slate-200/90 
                   transition-all duration-300 ease-in-out 
                   group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1.5 group-hover:border-base-blue/30"
      >
        <div className="flex flex-col items-center">
          
          {/* Avatar with a subtle border effect on hover */}
          <img
            className="h-24 w-24 rounded-full object-cover mb-4 border-4 border-slate-100 
                       transition-colors duration-300 group-hover:border-blue-200/80"
            src={builder.pfpUrl || '/default-avatar.png'} // Recommended: Use a default placeholder
            alt={builder.displayName}
          />

          {/* User's Name */}
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">
            {builder.displayName}
          </h3>

          {/* User's Bio/Headline. The line-clamp ensures consistent layout */}
          <p className="text-slate-500 text-sm mt-1.5 h-10 line-clamp-2">
            {builder.bio || 'Innovator, creator, and passionate builder.'}
          </p>

          {/* Skills Section. Uses whitespace (mt-5) instead of a harsh border-t */}
          <div className="mt-5 pt-2 w-full">
            <div className="flex flex-wrap justify-center gap-2">
              {Array.isArray(builder.skills) &&
                builder.skills
                  .slice(0, 3) // Show a max of 3 skills on the card
                  .map((skill, index) => <Tag key={index}>{skill}</Tag>)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BuilderCard;