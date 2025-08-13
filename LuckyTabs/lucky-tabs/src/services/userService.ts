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
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  groups: string[];
  friends: string[];
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

class UserService {
  // Get user profile data
  async getUserProfile(userId: string): Promise<UserData | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Safely handle timestamp fields that might be undefined
        const createdAt = data.createdAt 
          ? (data.createdAt as Timestamp).toDate() 
          : new Date();
        const updatedAt = data.updatedAt 
          ? (data.updatedAt as Timestamp).toDate() 
          : new Date();
        
        return {
          uid: userDoc.id,
          email: data.email as string || '',
          displayName: data.displayName as string || 'Anonymous User',
          firstName: data.firstName as string || '',
          lastName: data.lastName as string || '',
          avatar: data.avatar as string | undefined,
          groups: (data.groups as string[]) || [],
          friends: (data.friends as string[]) || [],
          createdAt,
          updatedAt
        } as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Create user profile (called after successful authentication)
  async createUserProfile(
    userId: string, 
    email: string, 
    displayName: string, 
    firstName = '', 
    lastName = ''
  ): Promise<void> {
    try {
      const userData: Omit<UserData, 'uid'> = {
        email,
        displayName,
        firstName: firstName || displayName.split(' ')[0] || '',
        lastName: lastName || displayName.split(' ')[1] || '',
        groups: [],
        friends: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        updatedAt: Timestamp.fromDate(userData.updatedAt)
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(
    userId: string, 
    updates: Partial<Pick<UserData, 'displayName' | 'firstName' | 'lastName' | 'avatar'>>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(doc(db, 'users', userId), updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Upload avatar image
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);
      await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(avatarRef);
      
      // Update user profile with new avatar URL
      await this.updateUserProfile(userId, { avatar: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }

  // Search users by display name
  async searchUsers(searchTerm: string, excludeUserIds: string[] = []): Promise<GroupMember[]> {
    try {
      if (!searchTerm.trim()) return [];

      // Note: This is a basic search. For production, consider using
      // Algolia or similar for better search capabilities
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );

      const snapshot = await getDocs(q);
      const users = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            displayName: data.displayName as string,
            firstName: data.firstName as string,
            lastName: data.lastName as string,
            avatar: data.avatar as string | undefined
          } as GroupMember;
        })
        .filter(user => !excludeUserIds.includes(user.uid));

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Add friend to user's friends list
  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Add friend to current user's friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(friendId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Add current user to friend's friends list (mutual friendship)
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayUnion(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }

  // Remove friend from user's friends list
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      // Remove friend from current user's friends list
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(friendId),
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Remove current user from friend's friends list
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(userId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  // Get user's friends
  async getUserFriends(userId: string): Promise<GroupMember[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile || userProfile.friends.length === 0) return [];

      // Get friend profiles
      const friendProfiles: GroupMember[] = [];
      
      for (const friendId of userProfile.friends) {
        const friendProfile = await this.getUserProfile(friendId);
        if (friendProfile) {
          friendProfiles.push({
            uid: friendProfile.uid,
            displayName: friendProfile.displayName,
            firstName: friendProfile.firstName,
            lastName: friendProfile.lastName,
            avatar: friendProfile.avatar
          });
        }
      }

      return friendProfiles;
    } catch (error) {
      console.error('Error getting user friends:', error);
      throw error;
    }
  }

  // Join a group
  async joinGroup(userId: string, groupId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        groups: arrayUnion(groupId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Leave a group
  async leaveGroup(userId: string, groupId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        groups: arrayRemove(groupId),
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Get multiple user profiles by IDs
  async getUserProfiles(userIds: string[]): Promise<GroupMember[]> {
    try {
      const profiles: GroupMember[] = [];
      
      for (const userId of userIds) {
        const profile = await this.getUserProfile(userId);
        if (profile) {
          profiles.push({
            uid: profile.uid,
            displayName: profile.displayName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatar
          });
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting user profiles:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
