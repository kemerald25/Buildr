import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWishes } from '../hooks/useWishes';
import { useAuth } from '../hooks/useAuth';
import { Wish } from '../types';
import ProgressBar from './ProgressBar';
import ShareButton from './ShareButton';
import FrameMeta from './FrameMeta';

interface WishPageProps {
  onContribute: (wish: Wish) => void;
}

const WishPage: React.FC<WishPageProps> = ({ onContribute }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wishes, loading } = useWishes();
  const { user } = useAuth();
  const [wish, setWish] = useState<Wish | null>(null);

  useEffect(() => {
    if (!loading && wishes.length > 0 && id) {
      const foundWish = wishes.find(w => w.id === id);
      setWish(foundWish || null);
    }
  }, [wishes, loading, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-base-blue"></div>
      </div>
    );
  }

  if (!wish) {
    return (
      <div className="text-center py-16">
        <FrameMeta />
        <h2 className="text-2xl font-bold mb-4 text-white">Wish Not Found</h2>
        <p className="text-gray-400 mb-6">The wish you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-base-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-base-blue-dark transition-colors"
        >
          Back to Wishlist
        </button>
      </div>
    );
  }

  const progress = (wish.currentAmount / wish.targetAmount) * 100;
  const isFunded = wish.currentAmount >= wish.targetAmount;
  const remaining = wish.targetAmount - wish.currentAmount;
  const isOwner = user?.address === wish.creatorAddress;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FrameMeta wishId={wish.id} wishName={wish.name} />
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Back to Wishlist
      </button>

      <div className="bg-brand-light rounded-2xl overflow-hidden shadow-lg border border-gray-700">
        {/* Image */}
        <div className="relative">
          <img 
            className="w-full h-80 md:h-96 object-cover" 
            src={wish.imageUrl} 
            alt={wish.name}
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/seed/${wish.name.replace(/\s+/g, '-')}/800/400`;
            }}
          />
          {isFunded && (
            <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full font-bold">
              ✓ Fully Funded!
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white">{wish.name}</h1>
              <p className="text-sm text-gray-400 mb-4">
                Created by {`${wish.creatorAddress.slice(0, 6)}...${wish.creatorAddress.slice(-4)}`}
                {isOwner && <span className="ml-2 text-base-blue font-semibold">(You)</span>}
              </p>
            </div>
            <ShareButton wish={wish} />
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-3xl font-bold text-base-blue">
                ${wish.currentAmount.toLocaleString()}
              </span>
              <span className="text-lg text-gray-400">
                of ${wish.targetAmount.toLocaleString()} goal
              </span>
            </div>
            <ProgressBar progress={progress} />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{Math.round(progress)}% funded</span>
              {!isFunded && (
                <span>${remaining.toLocaleString()} remaining</span>
              )}
            </div>
          </div>

          {/* Contributors Section */}
          {wish.contributors && wish.contributors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">
                Contributors ({wish.contributors.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wish.contributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                    <span className="text-gray-300">
                      {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                    </span>
                    <span className="text-base-blue font-semibold">
                      ${contributor.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => onContribute(wish)}
              disabled={isFunded}
              className="flex-1 bg-base-blue text-white font-bold py-4 px-6 rounded-lg hover:bg-base-blue-dark transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
            >
              {isFunded ? 'Fully Funded!' : 'Contribute Now'}
            </button>
            
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishPage;