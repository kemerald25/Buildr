
import React from 'react';

interface SignInWithBaseButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const SignInWithBaseButton: React.FC<SignInWithBaseButtonProps> = ({ onClick, loading = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-base-blue border-none rounded-lg cursor-pointer font-sans text-sm font-medium text-black min-w-[180px] h-11 shadow-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-wait"
    >
      <div className="w-4 h-4 bg-white rounded-sm flex-shrink-0"></div>
      <span className="text-white">{loading ? 'Connecting...' : 'Sign in with Base'}</span>
    </button>
  );
};

export default SignInWithBaseButton;
