
import React, { useState, createContext, useContext, useMemo, useCallback, ReactNode, useEffect } from 'react';
import { Wish, User, NewWish } from '../types';
import { db } from '../services/firebase';
import { 
    collection, 
    getDocs, 
    addDoc, 
    doc, 
    runTransaction, 
    serverTimestamp,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';

interface WishContextType {
  wishes: Wish[];
  loading: boolean;
  addWish: (wishData: NewWish, user: User) => Promise<void>;
  addContribution: (wishId: string, amount: number, contributor: User) => Promise<void>;
}

const WishContext = createContext<WishContextType | undefined>(undefined);

export const WishProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishes = useCallback(async () => {
    setLoading(true);
    try {
      const wishesCollection = collection(db, 'wishes');
      // Order by creation date, newest first
      const q = query(wishesCollection, orderBy('createdAt', 'desc'));
      const wishSnapshot = await getDocs(q);
      const wishesList = wishSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Wish;
      });
      setWishes(wishesList);
    } catch (error) {
      console.error("Error fetching wishes: ", error);
      // It might be a good idea to show an error to the user
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // A check to prevent connecting to Firebase without configuration
    if (db.app.options.apiKey !== process.env.REACT_APP_FIREBASE_API_KEY) {
        fetchWishes();
    } else {
        console.warn("Firebase config is not set. Please update services/firebase.ts");
        setLoading(false);
    }
  }, [fetchWishes]);

  const addWish = useCallback(async (wishData: NewWish, user: User) => {
    console.log('Adding new wish to Firestore:', wishData);
    try {
        await addDoc(collection(db, 'wishes'), {
            ...wishData,
            creatorAddress: user.address,
            currentAmount: 0,
            createdAt: serverTimestamp() // To order wishes by creation time
        });
        await fetchWishes(); // Refetch wishes to show the new one
    } catch (error) {
        console.error("Error adding wish: ", error);
        throw error; // Rethrow to be caught in the component
    }
  }, [fetchWishes]);

  const addContribution = useCallback(async (wishId: string, amount: number, contributor: User) => {
    console.log(`Adding contribution of ${amount} to wish ${wishId} in Firestore`);
    const wishRef = doc(db, 'wishes', wishId);
    // Path to the subcollection
    const contributionsCollectionRef = collection(wishRef, 'contributions');
    const newContributionRef = doc(contributionsCollectionRef); // Create a new doc reference in the subcollection

    try {
        await runTransaction(db, async (transaction) => {
            const wishDoc = await transaction.get(wishRef);
            if (!wishDoc.exists()) {
                throw new Error("Wish document does not exist!");
            }

            const newCurrentAmount = (wishDoc.data().currentAmount || 0) + amount;

            transaction.update(wishRef, { currentAmount: newCurrentAmount });
            
            transaction.set(newContributionRef, {
                amount,
                contributorAddress: contributor.address,
                timestamp: serverTimestamp()
            });
        });

        // Optimistically update the local state to give instant feedback
        setWishes(prevWishes => 
            prevWishes.map(w => w.id === wishId ? { ...w, currentAmount: w.currentAmount + amount } : w)
        );

    } catch (error) {
        console.error("Contribution transaction failed: ", error);
        throw error; // Rethrow to be caught in the component
    }
  }, []);

  const value = useMemo(() => ({ wishes, loading, addWish, addContribution }), [wishes, loading, addWish, addContribution]);

  return (
    <WishContext.Provider value={value}>
      {children}
    </WishContext.Provider>
  );
};

export const useWishes = (): WishContextType => {
  const context = useContext(WishContext);
  if (context === undefined) {
    throw new Error('useWishes must be used within a WishProvider');
  }
  return context;
};