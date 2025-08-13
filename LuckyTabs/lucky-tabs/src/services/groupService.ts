import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { userService } from './userService';

export interface GroupData {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: string[]; // Array of user IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

class GroupService {
  // Create a new group
  async createGroup(
    creatorId: string,
    groupName: string,
    description?: string
  ): Promise<string> {
    try {
      // Generate a unique group ID based on name and timestamp
      const timestamp = Date.now();
      const groupId = `${groupName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;
      
      const groupData: Omit<GroupData, 'id'> = {
        name: groupName,
        description: description || '',
        createdBy: creatorId,
        members: [creatorId], // Creator is automatically a member
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'groups', groupId), {
        ...groupData,
        createdAt: Timestamp.fromDate(groupData.createdAt),
        updatedAt: Timestamp.fromDate(groupData.updatedAt)
      });

      // Add group to user's groups list
      await userService.joinGroup(creatorId, groupId);

      return groupId;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get group by ID
  async getGroup(groupId: string): Promise<GroupData | null> {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      
      if (groupDoc.exists()) {
        const data = groupDoc.data();
        return {
          id: groupDoc.id,
          name: data.name as string,
          description: (data.description as string) || '',
          createdBy: data.createdBy as string,
          members: (data.members as string[]) || [],
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate()
        } as GroupData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  // Get all groups where user is a member
  async getUserGroups(userId: string): Promise<GroupData[]> {
    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', userId)
      );

      const snapshot = await getDocs(groupsQuery);
      const groups: GroupData[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        groups.push({
          id: doc.id,
          name: data.name as string,
          description: (data.description as string) || '',
          createdBy: data.createdBy as string,
          members: (data.members as string[]) || [],
          createdAt: (data.createdAt as Timestamp).toDate(),
          updatedAt: (data.updatedAt as Timestamp).toDate()
        });
      });

      return groups.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  // Add member to group
  async addMember(groupId: string, userId: string): Promise<void> {
    try {
      // Add user to group's members array
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Add group to user's groups list
      await userService.joinGroup(userId, groupId);
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      // Remove user from group's members array
      await updateDoc(doc(db, 'groups', groupId), {
        members: arrayRemove(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Remove group from user's groups list
      await userService.leaveGroup(userId, groupId);
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  // Get group members with their profile information
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) return [];

      const members: GroupMember[] = [];
      
      for (const memberId of group.members) {
        const memberProfile = await userService.getUserProfile(memberId);
        if (memberProfile) {
          members.push({
            uid: memberProfile.uid,
            displayName: memberProfile.displayName,
            firstName: memberProfile.firstName,
            lastName: memberProfile.lastName,
            avatar: memberProfile.avatar
          });
        }
      }

      return members;
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  // Update group information
  async updateGroup(
    groupId: string,
    updates: Partial<Pick<GroupData, 'name' | 'description'>>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Delete group (only creator can delete)
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await this.getGroup(groupId);
      if (!group) throw new Error('Group not found');
      
      if (group.createdBy !== userId) {
        throw new Error('Only the group creator can delete the group');
      }

      // Remove group from all members' groups lists
      for (const memberId of group.members) {
        await userService.leaveGroup(memberId, groupId);
      }

      // Delete the group document
      await deleteDoc(doc(db, 'groups', groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Search users by display name (for adding to groups)
  async searchUsersForGroup(
    searchTerm: string, 
    excludeUserIds: string[] = []
  ): Promise<GroupMember[]> {
    try {
      return await userService.searchUsers(searchTerm, excludeUserIds);
    } catch (error) {
      console.error('Error searching users for group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();
