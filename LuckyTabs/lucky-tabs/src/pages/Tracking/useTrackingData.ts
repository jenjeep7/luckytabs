import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';

export interface Transaction {
  id: string;
  userId: string;
  type: 'bet' | 'win';
  amount: number;
  description?: string;
  location?: string;
  createdAt: Timestamp | null;
  weekStart: Timestamp | null;
}

export interface Budget {
  id: string;
  userId: string;
  weeklyLimit: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface WeeklyData {
  totalSpent: number;
  totalWon: number;
  netResult: number;
  transactionCount: number;
  weekStart: Date;
  weekEnd: Date;
  transactions: Transaction[];
}

export interface HistoricalWeek {
  weekStart: Date;
  weekEnd: Date;
  totalSpent: number;
  totalWon: number;
  netResult: number;
  transactionCount: number;
  transactions: Transaction[]; // Add transactions to the historical week data
}

// Helper function to get start of week (Monday)
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  
  // Calculate days to subtract to get to Monday
  // Sunday = 0, Monday = 1, Tuesday = 2, etc.
  // For Sunday (0), we want to go back 6 days to Monday
  // For Monday (1), we want to go back 0 days
  // For Tuesday (2), we want to go back 1 day, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  
  // Use setDate instead of the constructor to properly handle month boundaries
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0); // Set to start of day
  return startOfWeek;
};

// Helper function to get end of week (Sunday)
const getEndOfWeek = (date: Date): Date => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
};

export const useTrackingData = (userId: string | undefined) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalWeek[]>([]);
  const [userBudget, setUserBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current week boundaries
      const now = new Date();
      const weekStart = getStartOfWeek(now);
      const weekEnd = getEndOfWeek(now);

      // Fetch user's budget
      const budgetQuery = query(
        collection(db, 'budgets'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const budgetSnapshot = await getDocs(budgetQuery);
      if (!budgetSnapshot.empty) {
        const budgetDoc = budgetSnapshot.docs[0];
        setUserBudget({ id: budgetDoc.id, ...budgetDoc.data() } as Budget);
      } else {
        setUserBudget(null);
      }

      // Fetch all transactions for historical data
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
        const transactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction);
        });

        // Process current week data
        const currentWeekTransactions = transactions.filter(transaction => {
          if (!transaction.createdAt) return false; // Skip transactions without timestamps
          const transactionDate = transaction.createdAt.toDate();
          return transactionDate >= weekStart && transactionDate <= weekEnd;
        });

        const totalSpent = currentWeekTransactions
          .filter(t => t.type === 'bet')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWon = currentWeekTransactions
          .filter(t => t.type === 'win')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentWeek: WeeklyData = {
          totalSpent,
          totalWon,
          netResult: totalWon - totalSpent,
          transactionCount: currentWeekTransactions.length,
          weekStart,
          weekEnd,
          transactions: currentWeekTransactions,
        };

        setWeeklyData(currentWeek);

        // Process historical data (group by weeks)
        const weeklyGroups = new Map<string, Transaction[]>();
        
        transactions.forEach(transaction => {
          if (!transaction.createdAt) return; // Skip transactions without timestamps
          const transactionDate = transaction.createdAt.toDate();
          const weekStartDate = getStartOfWeek(transactionDate);
          // Use a more reliable key that doesn't depend on timezone
          const weekStartKey = `${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}-${weekStartDate.getDate()}`;
          
          if (!weeklyGroups.has(weekStartKey)) {
            weeklyGroups.set(weekStartKey, []);
          }
          const weekGroup = weeklyGroups.get(weekStartKey);
          if (weekGroup) {
            weekGroup.push(transaction);
          }
        });

        const historical: HistoricalWeek[] = Array.from(weeklyGroups.entries())
          .map(([weekStartKey, weekTransactions]) => {
            // Parse the key back to get the week start date
            const [year, month, date] = weekStartKey.split('-').map(Number);
            const weekStartDate = new Date(year, month, date);
            const weekEndDate = getEndOfWeek(weekStartDate);
            
            const spent = weekTransactions
              .filter(t => t.type === 'bet')
              .reduce((sum, t) => sum + t.amount, 0);
            
            const won = weekTransactions
              .filter(t => t.type === 'win')
              .reduce((sum, t) => sum + t.amount, 0);

            return {
              weekStart: weekStartDate,
              weekEnd: weekEndDate,
              totalSpent: spent,
              totalWon: won,
              netResult: won - spent,
              transactionCount: weekTransactions.length,
              transactions: weekTransactions,
            };
          })
          .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

        // Ensure current week is always included, even if it has no transactions
        const currentWeekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        const hasCurrentWeek = weeklyGroups.has(currentWeekKey);
        
        if (!hasCurrentWeek) {
          // Add current week with zero values if it doesn't exist
          const currentWeekHistorical: HistoricalWeek = {
            weekStart,
            weekEnd,
            totalSpent: currentWeek.totalSpent,
            totalWon: currentWeek.totalWon,
            netResult: currentWeek.netResult,
            transactionCount: currentWeek.transactionCount,
            transactions: currentWeek.transactions,
          };
          
          // Insert at the beginning since it's the most recent
          historical.unshift(currentWeekHistorical);
        }

        setHistoricalData(historical);
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Failed to load tracking data. Please try again.');
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void refreshData();
    } else {
      setWeeklyData(null);
      setHistoricalData([]);
      setUserBudget(null);
      setIsLoading(false);
    }
  }, [userId, refreshData]);

  return {
    weeklyData,
    historicalData,
    userBudget,
    isLoading,
    error,
    refreshData,
  };
};
