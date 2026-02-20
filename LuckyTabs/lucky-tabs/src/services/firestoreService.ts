/**
 * Firestore Service - Platform-aware database operations
 * 
 * On Web: Uses Firestore SDK directly (auth context synced)
 * On Native: Routes through Cloud Functions (bypasses auth sync issue)
 */

import { Capacitor } from '@capacitor/core';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import * as firestoreRest from './firestoreRestClient';

const isNative = Capacitor.isNativePlatform();

// ============================================================================
// USER OPERATIONS
// ============================================================================

export interface UserData {
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date | Timestamp;
  [key: string]: unknown;
}

export async function getUserData(userId: string): Promise<UserData | null> {
  if (isNative) {
    const data = await firestoreRest.getDocument(`users/${userId}`);
    return data as UserData | null;
  } else {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? (userDoc.data() as UserData) : null;
  }
}

export async function updateUserData(userId: string, userData: Partial<UserData>): Promise<void> {
  if (isNative) {
    await firestoreRest.setDocument(`users/${userId}`, userData, true);
  } else {
    await setDoc(doc(db, 'users', userId), userData, { merge: true });
  }
}

// ============================================================================
// FLARE OPERATIONS
// ============================================================================

export interface Flare {
  id?: string;
  userId: string;
  boxId: string;
  locationId: string;
  ticketNumber?: number;
  prize?: number;
  datePlayed?: Date | Timestamp;
  notes?: string;
  photoURL?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  [key: string]: unknown;
}

export interface FlareFilters {
  userId?: string;
  boxId?: string;
  locationId?: string;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
}

export async function getFlares(filters?: FlareFilters): Promise<Flare[]> {
  if (isNative) {
    // Use REST API on native
    const results = await firestoreRest.queryCollection('flares');
    return results as Flare[];
  } else {
    const constraints: QueryConstraint[] = [];
    
    if (filters) {
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }
      if (filters.boxId) {
        constraints.push(where('boxId', '==', filters.boxId));
      }
      if (filters.locationId) {
        constraints.push(where('locationId', '==', filters.locationId));
      }
      if (filters.orderBy) {
        constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction));
      }
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
    }
    
    const q = query(collection(db, 'flares'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flare));
  }
}

export async function getFlare(flareId: string): Promise<Flare | null> {
  if (isNative) {
    // Use REST API on native
    const data = await firestoreRest.getDocument(`flares/${flareId}`);
    return data as Flare;
  } else {
    const flareDoc = await getDoc(doc(db, 'flares', flareId));
    return flareDoc.exists() ? ({ id: flareDoc.id, ...flareDoc.data() } as Flare) : null;
  }
}

export async function createFlare(flareData: Omit<Flare, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (isNative) {
    // Use REST API on native - generate a new ID and create document
    const flareId = `flare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestoreRest.setDocument(`flares/${flareId}`, {
      ...flareData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return flareId;
  } else {
    const flareRef = doc(collection(db, 'flares'));
    await setDoc(flareRef, {
      ...flareData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return flareRef.id;
  }
}

export async function updateFlare(flareId: string, flareData: Partial<Flare>): Promise<void> {
  if (isNative) {
    // Use REST API on native
    await firestoreRest.setDocument(
      `flares/${flareId}`,
      {
        ...flareData,
        updatedAt: new Date().toISOString(),
      },
      true // merge mode
    );
  } else {
    await updateDoc(doc(db, 'flares', flareId), {
      ...flareData,
      updatedAt: Timestamp.now(),
    });
  }
}

export async function deleteFlare(flareId: string): Promise<void> {
  if (isNative) {
    // Use REST API on native
    await firestoreRest.deleteDocument(`flares/${flareId}`);
  } else {
    await deleteDoc(doc(db, 'flares', flareId));
  }
}

// ============================================================================
// BOX OPERATIONS (READ-ONLY)
// ============================================================================

export interface Box {
  id?: string;
  locationId: string;
  boxName: string;
  boxNumber?: string;
  pricePerTicket?: string;
  startingTickets?: number;
  winningTickets?: Array<{
    prize: string;
    totalPrizes: number;
    claimedTotal: number;
  }>;
  ocrProcessed?: boolean;
  lastUpdated?: Date | Timestamp;
  [key: string]: unknown;
}

export interface BoxFilters {
  locationId?: string;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
}

export async function getBoxes(filters?: BoxFilters): Promise<Box[]> {
  if (isNative) {
    // Use REST API on native
    const results = await firestoreRest.queryCollection('boxes');
    return results as Box[];
  } else {
    const constraints: QueryConstraint[] = [];
    
    if (filters) {
      if (filters.locationId) {
        constraints.push(where('locationId', '==', filters.locationId));
      }
      if (filters.orderBy) {
        constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction));
      }
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
    }
    
    const q = query(collection(db, 'boxes'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Box));
  }
}

export async function getBox(boxId: string): Promise<Box | null> {
  if (isNative) {
    // Use REST API on native
    const data = await firestoreRest.getDocument(`boxes/${boxId}`);
    return data as Box;
  } else {
    const boxDoc = await getDoc(doc(db, 'boxes', boxId));
    return boxDoc.exists() ? ({ id: boxDoc.id, ...boxDoc.data() } as Box) : null;
  }
}

export async function deleteBox(boxId: string): Promise<void> {
  if (isNative) {
    // Use REST API on native
    await firestoreRest.deleteDocument(`boxes/${boxId}`);
  } else {
    await deleteDoc(doc(db, 'boxes', boxId));
  }
}

// ============================================================================
// LOCATION OPERATIONS (READ-ONLY)
// ============================================================================

export interface Location {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  [key: string]: unknown;
}

export interface LocationFilters {
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
}

export async function getLocations(filters?: LocationFilters): Promise<Location[]> {
  if (isNative) {
    // Use REST API on native
    const results = await firestoreRest.queryCollection('locations');
    return results as Location[];
  } else {
    const constraints: QueryConstraint[] = [];
    
    if (filters) {
      if (filters.orderBy) {
        constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction));
      }
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
    }
    
    const q = query(collection(db, 'locations'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
  }
}

export async function getLocation(locationId: string): Promise<Location | null> {
  if (isNative) {
    // Use REST API on native
    const data = await firestoreRest.getDocument(`locations/${locationId}`);
    return data as Location;
  } else {
    const locationDoc = await getDoc(doc(db, 'locations', locationId));
    return locationDoc.exists() ? ({ id: locationDoc.id, ...locationDoc.data() } as Location) : null;
  }
}
// ============================================================================
// GROUP OPERATIONS
// ============================================================================

export interface Group {
  id?: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  [key: string]: unknown;
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  if (isNative) {
    // Use REST API for native platforms
    const groups = await firestoreRest.queryCollection('groups', [
      { field: 'members', op: 'array-contains', value: userId }
    ]);
    return groups.map(group => ({
      ...group,
      createdAt: group.createdAt instanceof Date ? group.createdAt : new Date(),
      updatedAt: group.updatedAt instanceof Date ? group.updatedAt : new Date(),
    })) as Group[];
  } else {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId)
    );
    const snapshot = await getDocs(groupsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
  }
}

export async function getGroup(groupId: string): Promise<Group | null> {
  if (isNative) {
    const data = await firestoreRest.getDocument(`groups/${groupId}`);
    return data as Group | null;
  } else {
    const groupDoc = await getDoc(doc(db, 'groups', groupId));
    return groupDoc.exists() ? ({ id: groupDoc.id, ...groupDoc.data() } as Group) : null;
  }
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'win' | 'loss';
  boxId?: string;
  locationId?: string;
  notes?: string;
  date: Date | Timestamp;
  createdAt?: Date | Timestamp;
  [key: string]: unknown;
}

export async function getTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
  if (isNative) {
    const whereClauses: Array<{ field: string; op: string; value: unknown }> = [
      { field: 'userId', op: '==', value: userId }
    ];
    const transactions = await firestoreRest.queryCollection('transactions', whereClauses);
    return transactions as Transaction[];
  } else {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }
    if (endDate) {
      constraints.push(where('date', '<=', endDate));
    }
    constraints.push(orderBy('date', 'desc'));
    
    const q = query(collection(db, 'transactions'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
  if (isNative) {
    const transactionData = {
      ...transaction,
      // Keep date and transactionDate as Date objects so convertValue stores as timestampValue
      date: transaction.date instanceof Date ? transaction.date : typeof transaction.date === 'string' ? new Date(transaction.date) : transaction.date,
      transactionDate: (transaction as Record<string, unknown>).transactionDate instanceof Date ? (transaction as Record<string, unknown>).transactionDate : transaction.date instanceof Date ? transaction.date : new Date(),
      createdAt: new Date()
    };
    const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestoreRest.setDocument(`transactions/${docId}`, transactionData);
    return docId;
  } else {
    const transactionRef = doc(collection(db, 'transactions'));
    await setDoc(transactionRef, {
      ...transaction,
      createdAt: Timestamp.now()
    });
    return transactionRef.id;
  }
}

export async function updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
  if (isNative) {
    await firestoreRest.setDocument(`transactions/${transactionId}`, updates, true);
  } else {
    await updateDoc(doc(db, 'transactions', transactionId), updates);
  }
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  if (isNative) {
    await firestoreRest.deleteDocument(`transactions/${transactionId}`);
  } else {
    await deleteDoc(doc(db, 'transactions', transactionId));
  }
}

// ============================================================================
// BUDGET OPERATIONS
// ============================================================================

export interface Budget {
  id?: string;
  userId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp;
  createdAt?: Date | Timestamp;
  [key: string]: unknown;
}

export async function getBudgets(userId: string): Promise<Budget[]> {
  if (isNative) {
    const budgets = await firestoreRest.queryCollection('budgets', [
      { field: 'userId', op: '==', value: userId }
    ]);
    return budgets as Budget[];
  } else {
    const q = query(collection(db, 'budgets'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
  }
}

export async function createBudget(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<string> {
  if (isNative) {
    const budgetData = {
      ...budget,
      startDate: budget.startDate instanceof Date ? budget.startDate.toISOString() : budget.startDate,
      endDate: budget.endDate instanceof Date ? budget.endDate.toISOString() : budget.endDate,
      createdAt: new Date().toISOString()
    };
    const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestoreRest.setDocument(`budgets/${docId}`, budgetData);
    return docId;
  } else {
    const budgetRef = doc(collection(db, 'budgets'));
    await setDoc(budgetRef, {
      ...budget,
      createdAt: Timestamp.now()
    });
    return budgetRef.id;
  }
}

export async function updateBudget(budgetId: string, updates: Partial<Budget>): Promise<void> {
  if (isNative) {
    await firestoreRest.setDocument(`budgets/${budgetId}`, updates, true);
  } else {
    await updateDoc(doc(db, 'budgets', budgetId), updates);
  }
}

export async function deleteBudget(budgetId: string): Promise<void> {
  if (isNative) {
    await firestoreRest.deleteDocument(`budgets/${budgetId}`);
  } else {
    await deleteDoc(doc(db, 'budgets', budgetId));
  }
}

// ============================================================================
// SAVINGS OPERATIONS
// ============================================================================

export interface Saving {
  id?: string;
  userId: string;
  amount: number;
  goal?: number;
  notes?: string;
  date: Date | Timestamp;
  createdAt?: Date | Timestamp;
  [key: string]: unknown;
}

export async function getSavings(userId: string): Promise<Saving[]> {
  if (isNative) {
    const savings = await firestoreRest.queryCollection('savings', [
      { field: 'userId', op: '==', value: userId }
    ]);
    return savings as Saving[];
  } else {
    const q = query(collection(db, 'savings'), where('userId', '==', userId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Saving));
  }
}

export async function createSaving(saving: Omit<Saving, 'id' | 'createdAt'>): Promise<string> {
  if (isNative) {
    const savingData = {
      ...saving,
      date: saving.date instanceof Date ? saving.date.toISOString() : saving.date,
      createdAt: new Date().toISOString()
    };
    const docId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestoreRest.setDocument(`savings/${docId}`, savingData);
    return docId;
  } else {
    const savingRef = doc(collection(db, 'savings'));
    await setDoc(savingRef, {
      ...saving,
      createdAt: Timestamp.now()
    });
    return savingRef.id;
  }
}

export async function updateSaving(savingId: string, updates: Partial<Saving>): Promise<void> {
  if (isNative) {
    await firestoreRest.setDocument(`savings/${savingId}`, updates, true);
  } else {
    await updateDoc(doc(db, 'savings', savingId), updates);
  }
}

export async function deleteSaving(savingId: string): Promise<void> {
  if (isNative) {
    await firestoreRest.deleteDocument(`savings/${savingId}`);
  } else {
    await deleteDoc(doc(db, 'savings', savingId));
  }
}

// ============================================================================
// BOX WRITE OPERATIONS
// ============================================================================

export interface BoxUpdate {
  boxName?: string;
  pricePerTicket?: string;
  isActive?: boolean;
  estimatedRemainingTickets?: number;
  estimatedTicketsUpdated?: Date;
  claimedPrizes?: Array<{
    prizeAmount: number;
    row: number;
    positionInRow: number;
    claimedAt: Date;
  }>;
  shares?: Array<{
    sharedWith: string[];
    sharedBy: string;
    sharedAt: Date;
    shareType: 'user' | 'group';
  }>;
  rows?: { rowNumber: number; estimatedTicketsRemaining: number }[];
  rowEstimates?: {
    row1: number;
    row2: number;
    row3: number;
    row4: number;
  };
  lastUpdated?: Date;
  [key: string]: unknown;
}

export async function updateBox(boxId: string, updates: BoxUpdate): Promise<void> {
  if (isNative) {
    const updateData: Record<string, unknown> = { ...updates };
    if (updates.lastUpdated) {
      updateData.lastUpdated = updates.lastUpdated.toISOString();
    }
    if (updates.estimatedTicketsUpdated) {
      updateData.estimatedTicketsUpdated = updates.estimatedTicketsUpdated.toISOString();
    }
    await firestoreRest.setDocument(`boxes/${boxId}`, updateData, true);
  } else {
    await updateDoc(doc(db, 'boxes', boxId), updates);
  }
}

export async function getUserBoxes(userId: string, locationId?: string): Promise<Box[]> {
  if (isNative) {
    const whereClauses: Array<{ field: string; op: string; value: unknown }> = [
      { field: 'ownerId', op: '==', value: userId }
    ];
    if (locationId) {
      whereClauses.push({ field: 'locationId', op: '==', value: locationId });
    }
    const boxes = await firestoreRest.queryCollection('boxes', whereClauses);
    // Filter out inactive boxes
    return boxes.filter((box: Record<string, unknown>) => box.isActive !== false) as Box[];
  } else {
    const boxesRef = collection(db, 'boxes');
    let q = query(boxesRef, where('ownerId', '==', userId));
    
    if (locationId) {
      q = query(boxesRef, where('ownerId', '==', userId), where('locationId', '==', locationId));
    }

    const snapshot = await getDocs(q);
    const allBoxes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Box));
    
    // Filter out inactive boxes
    return allBoxes.filter(box => box.isActive !== false);
  }
}

export async function getAllBoxesForLocation(locationId: string): Promise<Box[]> {
  if (isNative) {
    const boxes = await firestoreRest.queryCollection('boxes', [
      { field: 'locationId', op: '==', value: locationId }
    ]);
    return boxes.filter((box: Record<string, unknown>) => box.isActive !== false) as Box[];
  } else {
    const q = query(collection(db, 'boxes'), where('locationId', '==', locationId));
    const snapshot = await getDocs(q);
    const allBoxes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Box));
    return allBoxes.filter(box => box.isActive !== false);
  }
}

// ============================================================================
// POSTS OPERATIONS
// ============================================================================

export async function getPosts(
  type: 'public' | 'group',
  groupId?: string,
  limitCount = 50
): Promise<Array<Record<string, unknown>>> {
  if (isNative) {
    const filters: Array<{ field: string; op: '=='; value: string }> = [
      { field: 'type', op: '==', value: type }
    ];
    if (type === 'group' && groupId) {
      filters.push({ field: 'groupId', op: '==', value: groupId });
    }
    
    // Query posts - ordering and limiting done client-side for now
    const posts = await firestoreRest.queryCollection('posts', filters);
    
    // Sort by timestamp descending and limit
    return posts
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, limitCount);
  } else {
    // Web uses direct SDK (not needed here, communityService handles it)
    throw new Error('getPosts should only be called on native');
  }
}

export async function createPost(postData: Record<string, unknown>): Promise<string> {
  if (isNative) {
    // Generate a unique ID for the post
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await firestoreRest.setDocument(`posts/${postId}`, postData);
    return postId;
  } else {
    // Web uses direct SDK (not needed here, communityService handles it)
    throw new Error('createPost should only be called on native');
  }
}

// Comments operations for native
export async function getComments(postId: string): Promise<Record<string, unknown>[]> {
  if (isNative) {
    const comments = await firestoreRest.queryCollection('comments', [
      { field: 'postId', op: '==', value: postId }
    ]);
    // Sort by timestamp ascending
    return comments.sort((a, b) => {
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return aTime - bTime;
    });
  }
  throw new Error('getComments should only be called on native');
}

export async function createComment(commentData: Record<string, unknown>): Promise<string> {
  if (isNative) {
    const docId = await firestoreRest.addDocument('comments', commentData);
    return docId;
  }
  throw new Error('createComment should only be called on native');
}

export async function deleteComment(commentId: string): Promise<void> {
  if (isNative) {
    await firestoreRest.deleteDocument(`comments/${commentId}`);
    return;
  }
  throw new Error('deleteComment should only be called on native');
}

export async function updatePost(postId: string, content: string): Promise<void> {
  if (isNative) {
    await firestoreRest.setDocument(`posts/${postId}`, {
      content,
      edited: true,
      editedAt: new Date().toISOString(),
    }, true);
    return;
  }
  throw new Error('updatePost should only be called on native');
}

export async function deletePost(postId: string): Promise<void> {
  if (isNative) {
    // Delete the post document
    await firestoreRest.deleteDocument(`posts/${postId}`);
    
    // Also delete all comments for this post
    const comments = await firestoreRest.queryCollection('comments', [
      { field: 'postId', op: '==', value: postId }
    ]);
    
    const deletePromises = comments.map((comment) =>
      firestoreRest.deleteDocument(`comments/${comment.id as string}`)
    );
    
    await Promise.all(deletePromises);
    return;
  }
  throw new Error('deletePost should only be called on native');
}

export async function likePost(postId: string, userId: string): Promise<void> {
  if (isNative) {
    // Get current post data
    const post = await firestoreRest.getDocument(`posts/${postId}`);
    if (!post) throw new Error('Post not found');
    
    const currentLikes = (post.likes as string[]) || [];
    const isLiked = currentLikes.includes(userId);
    
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== userId)
      : [...currentLikes, userId];
    
    await firestoreRest.setDocument(`posts/${postId}`, { likes: newLikes }, true);
    return;
  }
  throw new Error('likePost should only be called on native');
}