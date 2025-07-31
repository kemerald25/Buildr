import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface FrameMetaProps {
  wishId?: string;
  wishName?: string;
}

const FrameMeta: React.FC<FrameMetaProps> = ({ wishId, wishName }) => {
  const location = useLocation();

  useEffect(() => {
    // Remove existing frame meta
    const existingMeta = document.querySelector('meta[property="fc:frame"]');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Clean up the pathname to remove leading slash for proper URL construction
    const cleanPath = location.pathname.startsWith('/') ? location.pathname.slice(1) : location.pathname;
    const frameUrl = cleanPath ? `https://Buildr.vercel.app/${cleanPath}` : 'https://Buildr.vercel.app/';

    // Create new frame metadata
    const frameMetadata = {
      version: "next",
      imageUrl: "https://Buildr.vercel.app/bg.png",
      button: {
        title: wishName ? `Fund: ${wishName}` : "Fund A Wish",
        action: {
          type: "launch_frame",
          name: "Buildr",
          url: frameUrl,
          splashImageUrl: "https://Buildr.vercel.app/logo.png",
          splashBackgroundColor: "#ffffff"
        }
      }
    };

    console.log('Setting frame metadata:', {
      currentPath: location.pathname,
      frameUrl: frameUrl,
      wishId,
      wishName
    });

    // Add new frame meta
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'fc:frame');
    meta.setAttribute('content', JSON.stringify(frameMetadata));
    document.head.appendChild(meta);

    // Update title
    document.title = wishName ? `${wishName} - Buildr` : 'Buildr';
  }, [location.pathname, wishId, wishName]);

  return null;
};

export default FrameMeta;