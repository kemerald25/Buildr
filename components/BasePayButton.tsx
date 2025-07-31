
import React from 'react';

interface BasePayButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const BasePayButton: React.FC<BasePayButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center px-4 py-3 bg-base-blue border-none rounded-lg cursor-pointer font-sans min-w-[180px] h-11 text-white hover:bg-base-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* In a real app, you would use an img tag for the logo */}
      <span className="text-lg font-bold tracking-wide">Base Pay</span>
    </button>
  );
};

export default BasePayButton;
