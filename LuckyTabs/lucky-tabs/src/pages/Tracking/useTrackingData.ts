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
import { Capacitor } from '@capacitor/core';
import * as firestoreService from '../../services/firestoreService';

const isNative = Capacitor.isNativePlatform();

export interface Transaction {
  id: string;
  userId: string;
  type: 'bet' | 'win' | 'loss';
  amount: number;
  netAmount?: number; // New field for the net result
  description?: string;
  gameType?: string; // Type of gambling activity
  location?: string;
  createdAt: Timestamp | null;
  transactionDate?: Timestamp | null; // When the gambling activity actually occurred
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

      if (isNative) {
        // Use firestoreService on native platforms
        // Fetch user's budget
        const budgets = await firestoreService.getBudgets(userId);
        if (budgets.length > 0) {
          // Sort by updatedAt if available, or createdAt
          budgets.sort((a, b) => {
            const dateA = a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt : new Date()) : new Date(0);
            const dateB = b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt : new Date()) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          const latestBudget = budgets[0];
          // Ensure amount exists and is a valid number
          const weeklyLimit = typeof latestBudget.amount === 'number' && !isNaN(latestBudget.amount) 
            ? latestBudget.amount 
            : 0;
          
          setUserBudget({
            id: latestBudget.id || '',
            userId: latestBudget.userId,
            weeklyLimit: weeklyLimit,
            createdAt: latestBudget.createdAt ? (latestBudget.createdAt instanceof Date ? Timestamp.fromDate(latestBudget.createdAt) : latestBudget.createdAt as Timestamp) : null,
            updatedAt: latestBudget.updatedAt ? (latestBudget.updatedAt instanceof Date ? Timestamp.fromDate(latestBudget.updatedAt) : latestBudget.updatedAt as Timestamp) : null,
          });
        } else {
          setUserBudget(null);
        }

        // Fetch all transactions (no date filtering on initial query for simplicity)
        const allTransactions = await firestoreService.getTransactions(userId);
        
        // Helper to safely convert any date format to a Date object
        const parseToDate = (val: unknown): Date | null => {
          if (!val) return null;
          if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
          if (typeof val === 'string') { const d = new Date(val); return isNaN(d.getTime()) ? null : d; }
          if (typeof val === 'object' && val !== null && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
            try { return (val as { toDate: () => Date }).toDate(); } catch { return null; }
          }
          if (typeof val === 'object' && val !== null && 'seconds' in val) {
            return new Date((val as { seconds: number }).seconds * 1000);
          }
          return null;
        };

        // Convert to expected format and process
        const transactions: Transaction[] = allTransactions.map(t => {
          const raw = t as Record<string, unknown>;
          // Use transactionDate if available (web-created), fall back to date (native-created)
          const txDate = parseToDate(raw.transactionDate || t.date);
          const created = parseToDate(t.createdAt);
          return {
            id: t.id || '',
            userId: t.userId,
            type: t.type as 'bet' | 'win' | 'loss',
            amount: t.amount,
            netAmount: raw.netAmount !== undefined ? raw.netAmount as number : (t.type === 'win' ? t.amount : t.type === 'loss' ? -t.amount : undefined),
            description: (raw.description as string) || t.notes,
            gameType: (t.gameType as string | undefined) || undefined,
            location: (raw.location as string) || (t.locationId as string) || '',
            createdAt: created ? Timestamp.fromDate(created) : null,
            transactionDate: txDate ? Timestamp.fromDate(txDate) : null,
            weekStart: Timestamp.fromDate(weekStart),
          };
        });

        // Process current week data
        const currentWeekTransactions = transactions.filter(transaction => {
          try {
            const effectiveDate = transaction.transactionDate?.toDate() || 
              (transaction.createdAt ? transaction.createdAt.toDate() : null);
            if (!effectiveDate || isNaN(effectiveDate.getTime())) {
              return false;
            }
            return effectiveDate >= weekStart && effectiveDate <= weekEnd;
          } catch (error) {
            console.error('Error processing transaction date in current week filter:', transaction, error);
            return false;
          }
        });

        // Calculate totals
        let totalSpent = 0;
        let totalWon = 0;

        currentWeekTransactions.forEach(transaction => {
          if (transaction.netAmount !== undefined) {
            if (transaction.netAmount < 0) {
              totalSpent += Math.abs(transaction.netAmount);
            } else if (transaction.netAmount > 0) {
              totalWon += transaction.netAmount;
            }
          } else {
            if (transaction.type === 'bet') {
              totalSpent += transaction.amount;
            } else if (transaction.type === 'win') {
              totalWon += transaction.amount;
            }
          }
        });

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
          try {
            const effectiveDate = transaction.transactionDate?.toDate() || 
              (transaction.createdAt ? transaction.createdAt.toDate() : null);
            if (!effectiveDate || isNaN(effectiveDate.getTime())) {
              return;
            }
            const weekStartDate = getStartOfWeek(effectiveDate);
            const weekStartKey = `${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}-${weekStartDate.getDate()}`;
            
            if (!weeklyGroups.has(weekStartKey)) {
              weeklyGroups.set(weekStartKey, []);
            }
            const weekGroup = weeklyGroups.get(weekStartKey);
            if (weekGroup) {
              weekGroup.push(transaction);
            }
          } catch (error) {
            console.error('Error processing transaction date:', transaction, error);
          }
        });

        const historical: HistoricalWeek[] = Array.from(weeklyGroups.entries())
          .map(([weekStartKey, weekTransactions]) => {
            const [year, month, date] = weekStartKey.split('-').map(Number);
            const weekStartDate = new Date(year, month, date);
            
            if (isNaN(weekStartDate.getTime())) {
              return null;
            }
            
            const weekEndDate = getEndOfWeek(weekStartDate);
            
            let spent = 0;
            let won = 0;

            weekTransactions.forEach(transaction => {
              if (transaction.netAmount !== undefined) {
                if (transaction.netAmount < 0) {
                  spent += Math.abs(transaction.netAmount);
                } else if (transaction.netAmount > 0) {
                  won += transaction.netAmount;
                }
              } else {
                if (transaction.type === 'bet') {
                  spent += transaction.amount;
                } else if (transaction.type === 'win') {
                  won += transaction.amount;
                }
              }
            });

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
          .filter((week): week is HistoricalWeek => week !== null)
          .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

        // Ensure current week is included
        const currentWeekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
        const hasCurrentWeek = weeklyGroups.has(currentWeekKey);
        
        if (!hasCurrentWeek) {
          const currentWeekHistorical: HistoricalWeek = {
            weekStart,
            weekEnd,
            totalSpent: currentWeek.totalSpent,
            totalWon: currentWeek.totalWon,
            netResult: currentWeek.netResult,
            transactionCount: currentWeek.transactionCount,
            transactions: currentWeek.transactions,
          };
          historical.unshift(currentWeekHistorical);
        }

        setHistoricalData(historical);
        setIsLoading(false);
      } else {
        // Use direct Firestore SDK on web with real-time updates
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
            try {
              const effectiveDate = transaction.transactionDate?.toDate() || 
                (transaction.createdAt ? transaction.createdAt.toDate() : null);
              if (!effectiveDate || isNaN(effectiveDate.getTime())) {
                console.warn('Skipping transaction with invalid date in current week filter:', transaction);
                return false;
              }
              return effectiveDate >= weekStart && effectiveDate <= weekEnd;
            } catch (error) {
              console.error('Error processing transaction date in current week filter:', transaction, error);
              return false;
            }
          });

          // Calculate totals
          let totalSpent = 0;
          let totalWon = 0;

          currentWeekTransactions.forEach(transaction => {
            if (transaction.netAmount !== undefined) {
              if (transaction.netAmount < 0) {
                totalSpent += Math.abs(transaction.netAmount);
              } else if (transaction.netAmount > 0) {
                totalWon += transaction.netAmount;
              }
            } else {
              if (transaction.type === 'bet') {
                totalSpent += transaction.amount;
              } else if (transaction.type === 'win') {
                totalWon += transaction.amount;
              }
            }
          });

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
            try {
              const effectiveDate = transaction.transactionDate?.toDate() || 
                (transaction.createdAt ? transaction.createdAt.toDate() : null);
              if (!effectiveDate || isNaN(effectiveDate.getTime())) {
                console.warn('Skipping transaction with invalid date:', transaction);
                return;
              }
              const weekStartDate = getStartOfWeek(effectiveDate);
              const weekStartKey = `${weekStartDate.getFullYear()}-${weekStartDate.getMonth()}-${weekStartDate.getDate()}`;
              
              if (!weeklyGroups.has(weekStartKey)) {
                weeklyGroups.set(weekStartKey, []);
              }
              const weekGroup = weeklyGroups.get(weekStartKey);
              if (weekGroup) {
                weekGroup.push(transaction);
              }
            } catch (error) {
              console.error('Error processing transaction date:', transaction, error);
            }
          });

          const historical: HistoricalWeek[] = Array.from(weeklyGroups.entries())
            .map(([weekStartKey, weekTransactions]) => {
              const [year, month, date] = weekStartKey.split('-').map(Number);
              const weekStartDate = new Date(year, month, date);
              
              if (isNaN(weekStartDate.getTime())) {
                console.warn('Invalid week start date parsed from key:', weekStartKey);
                return null;
              }
              
              const weekEndDate = getEndOfWeek(weekStartDate);
              
              let spent = 0;
              let won = 0;

              weekTransactions.forEach(transaction => {
                if (transaction.netAmount !== undefined) {
                  if (transaction.netAmount < 0) {
                    spent += Math.abs(transaction.netAmount);
                  } else if (transaction.netAmount > 0) {
                    won += transaction.netAmount;
                  }
                } else {
                  if (transaction.type === 'bet') {
                    spent += transaction.amount;
                  } else if (transaction.type === 'win') {
                    won += transaction.amount;
                  }
                }
              });

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
            .filter((week): week is HistoricalWeek => week !== null)
            .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

          // Ensure current week is always included
          const currentWeekKey = `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
          const hasCurrentWeek = weeklyGroups.has(currentWeekKey);
          
          if (!hasCurrentWeek) {
            const currentWeekHistorical: HistoricalWeek = {
              weekStart,
              weekEnd,
              totalSpent: currentWeek.totalSpent,
              totalWon: currentWeek.totalWon,
              netResult: currentWeek.netResult,
              transactionCount: currentWeek.transactionCount,
              transactions: currentWeek.transactions,
            };
            historical.unshift(currentWeekHistorical);
          }

          setHistoricalData(historical);
          setIsLoading(false);
        });

        return unsubscribe;
      }
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
