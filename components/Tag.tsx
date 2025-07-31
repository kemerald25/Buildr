// components/Tag.tsx
import React from 'react';

interface TagProps {
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ children }) => {
  return (
    <span className="inline-block bg-blue-100/80 text-base-blue text-xs font-semibold px-3 py-1.5 rounded-full">
      {children}
    </span>
  );
};

export default Tag;