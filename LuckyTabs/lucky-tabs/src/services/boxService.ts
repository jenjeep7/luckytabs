/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query,
  where,
  arrayUnion, 
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface BoxShare {
  sharedWith: string[]; // Array of user IDs or group IDs
  sharedBy: string; // User ID who shared the box
  sharedAt: Date;
  shareType: 'user' | 'group';
}

export interface BoxItem {
  id: string;
  boxName: string;
  pricePerTicket: string;
  type: "wall" | "bar box";
  locationId: string;
  ownerId: string;
  ownerName?: string; // Display name of the owner
  isActive?: boolean;
  winningTickets?: Array<{
    totalPrizes: number;
    claimedTotal: number;
    prize: string;
  }>;
  estimatedRemainingTickets?: number;
  estimatedTicketsUpdated?: Date | { toDate?: () => Date };
  createdAt?: Date | { toDate?: () => Date };
  lastUpdated?: Date | { toDate?: () => Date };
  shares?: BoxShare[]; // New field for sharing functionality
  flareSheetUrl?: string; // URL to the flare sheet image
}

class BoxService {
  // Get boxes created by a specific user
  async getUserBoxes(userId: string, locationId?: string): Promise<BoxItem[]> {
    try {
      const boxesRef = collection(db, 'boxes');
      let q = query(boxesRef, where('ownerId', '==', userId));
      
      if (locationId) {
        q = query(boxesRef, where('ownerId', '==', userId), where('locationId', '==', locationId));
      }

      const snapshot = await getDocs(q);
      const allBoxes = this.mapBoxData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Filter out inactive boxes
      return allBoxes.filter(box => box.isActive !== false);
    } catch (error) {
      console.error('Error getting user boxes:', error);
      throw error;
    }
  }

  // Get boxes shared with a user through groups they belong to
  async getSharedBoxes(userId: string, userGroups: string[], locationId?: string): Promise<BoxItem[]> {
    try {
      const boxesRef = collection(db, 'boxes');
      
      // Get all boxes and filter in memory since Firestore doesn't support 
      // complex nested array queries efficiently
      const snapshot = await getDocs(boxesRef);
      const allBoxes = this.mapBoxData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Filter boxes that are explicitly shared with user's groups
      const sharedBoxes = allBoxes.filter(box => {
        // Must have shares array and at least one share
        if (!box.shares || box.shares.length === 0) return false;
        
        // Check if any share is with a group that the user belongs to
        return box.shares.some(share => {
          if (share.shareType === 'group' && userGroups.length > 0) {
            return share.sharedWith.some(groupId => userGroups.includes(groupId));
          }
          // Could also check for direct user shares if needed
          if (share.shareType === 'user') {
            return share.sharedWith.includes(userId);
          }
          return false;
        });
      });

      // Filter out inactive boxes and by location if specified
      const activeBoxes = sharedBoxes.filter(box => box.isActive !== false);
      
      if (locationId) {
        return activeBoxes.filter(box => box.locationId === locationId);
      }

      return activeBoxes;
    } catch (error) {
      console.error('Error getting shared boxes:', error);
      throw error;
    }
  }

  // Share a box with users or groups
  async shareBox(boxId: string, sharedBy: string, shareWith: string[], shareType: 'user' | 'group'): Promise<void> {
    try {
      const boxRef = doc(db, 'boxes', boxId);
      const newShare: BoxShare = {
        sharedWith: shareWith,
        sharedBy,
        sharedAt: new Date(),
        shareType
      };

      const firestoreShare = {
        ...newShare,
        sharedAt: Timestamp.fromDate(newShare.sharedAt)
      };

      await updateDoc(boxRef, {
        shares: arrayUnion(firestoreShare),
        lastUpdated: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error sharing box:', error);
      throw error;
    }
  }

  // Unshare a box
  async unshareBox(boxId: string, shareToRemove: BoxShare): Promise<void> {
    try {
      const boxRef = doc(db, 'boxes', boxId);
      
      const firestoreShare = {
        ...shareToRemove,
        sharedAt: Timestamp.fromDate(shareToRemove.sharedAt)
      };

      await updateDoc(boxRef, {
        shares: arrayRemove(firestoreShare),
        lastUpdated: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error unsharing box:', error);
      throw error;
    }
  }

  // Get all boxes for a location (both user's and shared)
  async getAllBoxesForLocation(userId: string, userGroups: string[], locationId: string): Promise<{
    myBoxes: BoxItem[];
    sharedBoxes: BoxItem[];
  }> {
    try {
      const [myBoxes, sharedBoxes] = await Promise.all([
        this.getUserBoxes(userId, locationId),
        this.getSharedBoxes(userId, userGroups, locationId)
      ]);

      return { myBoxes, sharedBoxes };
    } catch (error) {
      console.error('Error getting all boxes for location:', error);
      throw error;
    }
  }

  // Helper method to map Firestore data to BoxItem interface
  private mapBoxData(boxes: any[]): BoxItem[] {
    return boxes.map(box => ({
      ...box,
      pricePerTicket: String(box.pricePerTicket || ''), // Ensure pricePerTicket is always a string
      boxName: String(box.boxName || ''), // Ensure boxName is always a string
      isActive: box.isActive !== false,
      createdAt: this.convertTimestamp(box.createdAt),
      lastUpdated: this.convertTimestamp(box.lastUpdated),
      estimatedTicketsUpdated: this.convertTimestamp(box.estimatedTicketsUpdated),
      shares: box.shares?.map((share: any) => ({
        ...share,
        sharedAt: this.convertTimestamp(share.sharedAt)
      })) || []
    }));
  }

  // Helper method to convert Firestore timestamps
  private convertTimestamp(timestamp: any): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === 'object' && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'string') return new Date(timestamp);
    return undefined;
  }

  // Get owner information for boxes
  async enrichBoxesWithOwnerInfo(boxes: BoxItem[]): Promise<BoxItem[]> {
    try {
      const uniqueOwnerIds = boxes.map(box => box.ownerId).filter((id, index, arr) => arr.indexOf(id) === index);
      const ownerInfo: { [key: string]: string } = {};

      // Fetch owner information
      for (const ownerId of uniqueOwnerIds) {
        if (ownerId) {
          const userDoc = await getDoc(doc(db, 'users', ownerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            ownerInfo[ownerId] = userData.displayName || String(userData.firstName || '') + ' ' + String(userData.lastName || '') || 'Unknown User';
          }
        }
      }

      // Add owner names to boxes
      return boxes.map(box => ({
        ...box,
        ownerName: ownerInfo[box.ownerId] || 'Unknown User'
      }));
    } catch (error) {
      console.error('Error enriching boxes with owner info:', error);
      return boxes;
    }
  }

  // Debug method to inspect group sharing data - can be called from browser console
  async debugGroupSharing(userId: string, userGroups: string[]): Promise<void> {
    try {
      const boxesRef = collection(db, 'boxes');
      const snapshot = await getDocs(boxesRef);
      const allBoxes = this.mapBoxData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      console.log('=== GROUP SHARING DEBUG ===');
      console.log('User ID:', userId);
      console.log('User Groups:', userGroups);
      console.log('Total boxes:', allBoxes.length);
      
      const boxesWithShares = allBoxes.filter(box => box.shares && box.shares.length > 0);
      console.log('Boxes with shares:', boxesWithShares.length);
      
      boxesWithShares.forEach(box => {
        console.log(`\nBox: ${box.boxName} (${box.id})`);
        console.log('Owner:', box.ownerId);
        console.log('Location:', box.locationId);
        console.log('Shares:', box.shares);
        
        const groupShares = box.shares?.filter(share => share.shareType === 'group') || [];
        if (groupShares.length > 0) {
          console.log('Group shares found:');
          groupShares.forEach((share, index) => {
            console.log(`  Group Share ${index + 1}:`, {
              sharedWithGroups: share.sharedWith,
              sharedBy: share.sharedBy,
              shareType: share.shareType,
              sharedAt: share.sharedAt,
              userIsInAnyGroup: share.sharedWith.some(groupId => userGroups.includes(groupId))
            });
          });
        }
      });
      
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}

export const boxService = new BoxService();

// Make boxService available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).boxService = boxService;
}
