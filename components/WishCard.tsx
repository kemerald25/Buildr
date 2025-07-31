import React from "react";
import { useNavigate } from "react-router-dom";
import { Wish } from "../types";
import ProgressBar from "./ProgressBar";

interface WishCardProps {
  wish: Wish;
  onContribute: (wish: Wish) => void;
}

const WishCard: React.FC<WishCardProps> = ({ wish, onContribute }) => {
  const navigate = useNavigate();
  const progress = (wish.currentAmount / wish.targetAmount) * 100;
  const isFunded = wish.currentAmount >= wish.targetAmount;

  const handleCardClick = () => {
    navigate(`/wish/${wish.id}`);
  };

  const handleContributeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    onContribute(wish);
  };

  return (
    <div
      className="bg-brand-light rounded-2xl overflow-hidden shadow-lg border border-gray-700 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-base-blue/20 cursor-pointer"
      onClick={handleCardClick}
    >
      <img
        className="w-full h-56 object-cover"
        src={wish.imageUrl}
        alt={wish.name}
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-white">{wish.name}</h3>
        <p className="text-xs text-gray-500 mb-4">
          by{" "}
          {`${wish.creatorAddress.slice(0, 6)}...${wish.creatorAddress.slice(
            -4
          )}`}
        </p>

        <div className="mt-auto">
          <div className="mb-2">
            <ProgressBar progress={progress} />
          </div>
          <div className="flex justify-between items-baseline mb-4">
            <p className="text-base-blue font-semibold text-lg">
              ${wish.currentAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              raised of ${wish.targetAmount.toLocaleString()} goal
            </p>
          </div>
          <button
            onClick={handleContributeClick}
            disabled={isFunded}
            className="w-full bg-base-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-base-blue-dark transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isFunded ? "Fully Funded!" : "Contribute"}
          </button>
          <small className="text-white">
            Powered with <span className="text-base-blue">Base Pay</span>
          </small>
        </div>
      </div>
    </div>
  );
};

export default WishCard;
