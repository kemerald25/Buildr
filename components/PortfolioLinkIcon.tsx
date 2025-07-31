
import React from 'react';
import type { PortfolioLink } from '../types';
import { Github, Linkedin, Twitter, Globe } from 'lucide-react';

interface PortfolioLinkIconProps {
  link: PortfolioLink;
}

const PortfolioLinkIcon: React.FC<PortfolioLinkIconProps> = ({ link }) => {
  const getIcon = () => {
    switch (link.type) {
      case 'github':
        return <Github size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      case 'website':
        return <Globe size={20} />;
      default:
        return <Globe size={20} />;
    }
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-base-blue transition-colors"
      aria-label={`Visit ${link.type} profile`}
    >
      {getIcon()}
    </a>
  );
};

// We need to add lucide-react to our project. For this setup, we can use a CDN.
// Let's add it to index.html or assume it's available. Since I can't modify index.html now,
// I'll assume it's bundled. In a real Vite project, you'd `npm install lucide-react`.

export default PortfolioLinkIcon;
