
import React, { useState, useEffect } from 'react';
import { Wish } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useWishes } from '../hooks/useWishes';
import { pay, getPaymentStatus } from '../services/baseService';
import BasePayButton from './BasePayButton';
import ProgressBar from './ProgressBar';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  wish: Wish | null;
}

const ContributeModal: React.FC<ContributeModalProps> = ({ isOpen, onClose, wish }) => {
  const { user } = useAuth();
  const { addContribution } = useWishes();
  const [amount, setAmount] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setError('');
      setIsPaying(false);
    }
  }, [isOpen]);

  if (!isOpen || !wish) return null;

  const handlePayment = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setError('');
    setIsPaying(true);

    try {
      const paymentResponse = await pay({
        amount: parseFloat(amount).toFixed(2),
        to: wish.creatorAddress,
        testnet: false,
      });

      // Poll for status
      let statusCheck = await getPaymentStatus({ id: paymentResponse.id, testnet: false });
      if (statusCheck.status === 'completed') {
        await addContribution(wish.id, parseFloat(amount), user);
        onClose();
      } else {
         setError('Payment could not be confirmed.');
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError('An error occurred during payment.');
    } finally {
      setIsPaying(false);
    }
  };

  const remaining = wish.targetAmount - wish.currentAmount;
  const progress = (wish.currentAmount / wish.targetAmount) * 100;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-brand-light p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700 mx-5" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-white">Contribute to</h2>
        <p className="text-lg text-gray-300 mb-6">{wish.name}</p>

        <div className="mb-4">
            <div className="flex justify-between items-baseline mb-2">
                <span className="text-base-blue font-semibold text-lg">${wish.currentAmount.toLocaleString()}</span>
                <span className="text-sm text-gray-400">of ${wish.targetAmount.toLocaleString()}</span>
            </div>
            <ProgressBar progress={progress}/>
        </div>
        
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">Contribution Amount (USD)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-base-blue"
              placeholder={`Up to $${remaining.toFixed(2)}`}
              required
              min="0.01"
              step="0.01"
              max={remaining}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <div className="mt-6">
            {user ? (
                 <BasePayButton onClick={handlePayment} disabled={isPaying || !amount} />
            ) : (
                <p className="text-center text-yellow-400">Please sign in to contribute.</p>
            )}
        </div>
        {isPaying && (
            <div className="flex items-center justify-center mt-4 text-sm text-gray-300">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-base-blue mr-3"></div>
                Processing payment...
            </div>
        )}

      </div>
    </div>
  );
};

export default ContributeModal;
