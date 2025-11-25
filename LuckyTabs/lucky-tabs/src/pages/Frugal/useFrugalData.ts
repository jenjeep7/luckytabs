import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export interface SavingsEntry {
  id: string;
  userId: string;
  itemName: string; // e.g., "Starbucks Coffee", "Fast Food", "Impulse Purchase"
  amount: number;
  category: string; // e.g., "Food & Drink", "Shopping", "Entertainment"
  description?: string;
  savedDate: Timestamp;
  createdAt: Timestamp;
  status: 'pending' | 'saved' | 'missed'; // pending, saved (moved to goal), or missed opportunity
  destination?: string; // Where the money went if status is 'saved': 'Bank Savings', 'Goal', etc.
}

export interface WeeklySavingsData {
  weekStartDate: Date;
  totalSaved: number; // Amount with status 'saved'
  totalPending: number; // Amount with status 'pending'
  totalMissed: number; // Amount with status 'missed'
  entries: SavingsEntry[];
}

export const useFrugalData = (userId: string | undefined) => {
  const [weeklySavings, setWeeklySavings] = useState<WeeklySavingsData[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalMissed, setTotalMissed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const q = query(
      collection(db, 'frugalSavings'),
      where('userId', '==', userId),
      orderBy('savedDate', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: SavingsEntry[] = [];
        snapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as SavingsEntry);
        });

        // Calculate totals by status
        const saved = entries.reduce((sum, entry) => sum + (entry.status === 'saved' ? entry.amount : 0), 0);
        const pending = entries.reduce((sum, entry) => sum + (entry.status === 'pending' ? entry.amount : 0), 0);
        const missed = entries.reduce((sum, entry) => sum + (entry.status === 'missed' ? entry.amount : 0), 0);
        
        setTotalSaved(saved);
        setTotalPending(pending);
        setTotalMissed(missed);

        // Group by week
        const weeklyMap = new Map<string, WeeklySavingsData>();
        
        entries.forEach((entry) => {
          const date = entry.savedDate.toDate();
          const weekStart = getStartOfWeek(date);
          const weekKey = weekStart.toISOString();

          if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, {
              weekStartDate: weekStart,
              totalSaved: 0,
              totalPending: 0,
              totalMissed: 0,
              entries: [],
            });
          }

          const weekData = weeklyMap.get(weekKey);
          if (weekData) {
            if (entry.status === 'saved') {
              weekData.totalSaved += entry.amount;
            } else if (entry.status === 'pending') {
              weekData.totalPending += entry.amount;
            } else if (entry.status === 'missed') {
              weekData.totalMissed += entry.amount;
            }
            weekData.entries.push(entry);
          }
        });

        const weeklyArray = Array.from(weeklyMap.values()).sort(
          (a, b) => b.weekStartDate.getTime() - a.weekStartDate.getTime()
        );

        setWeeklySavings(weeklyArray);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        console.error('Error fetching frugal data:', err);
        setError('Failed to load savings data');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const refreshData = async () => {
    // Data refreshes automatically via onSnapshot
  };

  return {
    weeklySavings,
    totalSaved,
    totalPending,
    totalMissed,
    isLoading,
    error,
    refreshData,
  };
};

// Helper function to get start of week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};
