
import React from 'react';
import { useWishes } from '../hooks/useWishes';
import WishCard from './WishCard';
import { Wish } from '../types';

interface WishlistProps {
  onContribute: (wish: Wish) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ onContribute }) => {
  const { wishes, loading } = useWishes();

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-base-blue"></div>
        </div>
    );
  }
  
  if (wishes.length === 0) {
      return (
          <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">No wishes yet!</h2>
              <p className="text-gray-400">Be the first to create a wish and start funding.</p>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
      {wishes.map(wish => (
        <WishCard key={wish.id} wish={wish} onContribute={onContribute} />
      ))}
    </div>
  );
};

export default Wishlist;
