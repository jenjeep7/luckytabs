import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where, 
  onSnapshot, 
  Timestamp,
  arrayUnion,
  arrayRemove,
  getCountFromServer,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  friends: string[]; // Array of user IDs
  groups: string[]; // Array of group IDs
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: string[];
  type: 'public' | 'group';
  groupId?: string;
  edited?: boolean;
  editedAt?: Date;
  media?: Array<{
    url: string;
    width?: number;
    height?: number;
    contentType?: string; // image/jpeg, image/png, image/webp
  }>;
  topicId?: string; // optional: for public topics
}


export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorDisplayName: string; // Store the author's display name when comment is created
  content: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
}

export interface PaginatedPosts {
  posts: Post[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export interface PaginatedComments {
  comments: Comment[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[]; // Array of user IDs
  admins: string[]; // Array of admin user IDs
  isPrivate: boolean;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}
interface FirestorePostData {
  authorId: string;
  content: string;
  timestamp: Timestamp;
  likes?: string[];
  type: 'public' | 'group';
  groupId?: string;
  edited?: boolean;
  editedAt?: Timestamp;
  media?: { url: string; width?: number; height?: number; contentType?: string }[];
}
class CommunityService {
  // Posts
 // services/communityService.ts
async createPost(
  authorId: string,
  content: string,
  type: 'public' | 'group',
  groupId?: string,
  media?: Array<{ url: string; width?: number; height?: number; contentType?: string }>
): Promise<string> {
  const postData = {
    authorId,
    content,
    timestamp: new Date(),
    likes: [],
    type,
    ...(groupId && { groupId }),
    ...(media && media.length ? { media } : {}),
  };

  const docRef = await addDoc(collection(db, 'posts'), {
    ...postData,
    timestamp: Timestamp.fromDate(postData.timestamp),
  });
  return docRef.id;
}


  async getPosts(type: 'public' | 'group', groupId?: string, pageSize = 10, lastDoc?: QueryDocumentSnapshot): Promise<PaginatedPosts> {
    const postsRef = collection(db, 'posts');
    let q = query(postsRef, where('type', '==', type), orderBy('timestamp', 'desc'), limit(pageSize));
    
    if (type === 'group' && groupId) {
      q = query(
        postsRef,
        where('type', '==', type),
        where('groupId', '==', groupId),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
    }
    
    if (lastDoc) {
      q = query(postsRef, where('type', '==', type), orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(pageSize));
      if (type === 'group' && groupId) {
        q = query(
          postsRef,
          where('type', '==', type),
          where('groupId', '==', groupId),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }
    }

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestorePostData;
      return {
        id: docSnap.id,
        authorId: data.authorId,
        content: data.content,
        timestamp: (data.timestamp).toDate(),
        likes: (data.likes as string[]) || [],
        type: data.type,
        ...(data.groupId && { groupId: data.groupId }),
        ...(data.edited && { edited: data.edited as boolean }),
        ...(data.editedAt && { editedAt: (data.editedAt).toDate() }),
        media: (data.media as Array<{ url: string; width?: number; height?: number; contentType?: string }>) || [],
      } as Post;
    });

    return {
      posts,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === pageSize
    };
  }

  // Wrapper method for backward compatibility - maintains old API
  async getPostsSimple(type: 'public' | 'group', groupId?: string): Promise<Post[]> {
    const result = await this.getPosts(type, groupId, 50); // Use larger page size for simple method
    return result.posts;
  }

  // Legacy method for backward compatibility - will be deprecated
  async getPostsLegacy(type: 'public' | 'group', groupId?: string): Promise<Post[]> {
    const result = await this.getPosts(type, groupId, 50); // Get more posts for legacy usage
    return result.posts;
  }


  async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (postDoc.exists()) {
      const data = postDoc.data();
      const currentLikes = (data.likes as string[]) || [];
      const isLiked = currentLikes.includes(userId);
      
      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    }
  }

  async updatePost(postId: string, content: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      content,
      edited: true,
      editedAt: Timestamp.fromDate(new Date())
    });
  }

  async deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, 'posts', postId));
    
    // Also delete all comments for this post
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const deletePromises = commentsSnapshot.docs.map(commentDoc => 
      deleteDoc(doc(db, 'comments', commentDoc.id))
    );
    
    await Promise.all(deletePromises);
  }

  // Comments
  async createComment(postId: string, authorId: string, authorDisplayName: string, content: string): Promise<string> {
    const commentData: Omit<Comment, 'id'> = {
      postId,
      authorId,
      authorDisplayName,
      content,
      timestamp: new Date()
    };

    const docRef = await addDoc(collection(db, 'comments'), {
      ...commentData,
      timestamp: Timestamp.fromDate(commentData.timestamp)
    });
    
    return docRef.id;
  }

  async getComments(postId: string, pageSize = 20, lastDoc?: QueryDocumentSnapshot): Promise<PaginatedComments> {
    let commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc'),
      limit(pageSize)
    );

    if (lastDoc) {
      commentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('timestamp', 'asc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const snapshot = await getDocs(commentsQuery);
    const comments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: data.postId as string,
        authorId: data.authorId as string,
        authorDisplayName: data.authorDisplayName as string || 'Unknown User',
        content: data.content as string,
        timestamp: (data.timestamp as Timestamp).toDate(),
        ...(data.edited && { edited: data.edited as boolean }),
        ...(data.editedAt && { editedAt: (data.editedAt as Timestamp).toDate() })
      } as Comment;
    });

    return {
      comments,
      lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
      hasMore: snapshot.docs.length === pageSize
    };
  }

  // Legacy method for backward compatibility - will be deprecated
  async getCommentsLegacy(postId: string): Promise<Comment[]> {
    const result = await this.getComments(postId, 100); // Get more comments for legacy usage
    return result.comments;
  }

  // Wrapper method for backward compatibility - maintains old API
  async getCommentsSimple(postId: string): Promise<Comment[]> {
    const result = await this.getComments(postId, 50);
    return result.comments;
  }

  async deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, 'comments', commentId));
  }

  // Users
  async createUserProfile(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: Timestamp.fromDate(userData.createdAt)
    });
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data() as Omit<User, 'id'>;
      return {
        id: userDoc.id,
        ...data,
        createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt)
      } as User;
    }
    return null;
  }

  async getUserProfiles(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];
    
    const userPromises = userIds.map(id => this.getUserProfile(id));
    const users = await Promise.all(userPromises);
    return users.filter(user => user !== null) as User[];
  }

  // Friends
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<string> {
    const requestData: Omit<FriendRequest, 'id'> = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'friendRequests'), {
      ...requestData,
      createdAt: Timestamp.fromDate(requestData.createdAt)
    });
    
    return docRef.id;
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    const requestRef = doc(db, 'friendRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (requestDoc.exists()) {
      const data = requestDoc.data();
      const fromUserId = data.fromUserId as string;
      const toUserId = data.toUserId as string;
      
      // Update both users' friend lists
      await Promise.all([
        updateDoc(doc(db, 'users', fromUserId), {
          friends: arrayUnion(toUserId)
        }),
        updateDoc(doc(db, 'users', toUserId), {
          friends: arrayUnion(fromUserId)
        }),
        updateDoc(requestRef, { status: 'accepted' })
      ]);
    }
  }

  async declineFriendRequest(requestId: string): Promise<void> {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'declined'
    });
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await Promise.all([
      updateDoc(doc(db, 'users', userId), {
        friends: arrayRemove(friendId)
      }),
      updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(userId)
      })
    ]);
  }

  // Real-time listeners
  onPostsChange(type: 'public' | 'group', callback: (posts: Post[]) => void, groupId?: string): () => void {
  const postsRef = collection(db, 'posts');
  let q = query(postsRef, where('type', '==', type), orderBy('timestamp', 'desc'));
  if (type === 'group' && groupId) {
    q = query(
      postsRef,
      where('type', '==', type),
      where('groupId', '==', groupId),
      orderBy('timestamp', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(docSnap => {
      const data = docSnap.data() as FirestorePostData;
      return {
        id: docSnap.id,
        authorId: data.authorId ,
        content: data.content ,
        timestamp: (data.timestamp ).toDate(),
        likes: (data.likes as string[]) || [],
        type: data.type ,
        ...(data.groupId && { groupId: data.groupId  }),
        ...(data.edited && { edited: data.edited as boolean }),
        ...(data.editedAt && { editedAt: (data.editedAt ).toDate() }),
        media: (data.media as Array<{ url: string; width?: number; height?: number; contentType?: string }>) || [],
      } as Post;
    });
    callback(posts);
  });
}

  async getCommentsCount(postId: string): Promise<number> {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );
    const snap = await getCountFromServer(q);
    return snap.data().count;
  }

  onCommentsChange(postId: string, callback: (comments: Comment[]) => void): () => void {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          postId: data.postId as string,
          authorId: data.authorId as string,
          content: data.content as string,
          timestamp: (data.timestamp as Timestamp).toDate(),
          ...(data.edited && { edited: data.edited as boolean }),
          ...(data.editedAt && { editedAt: (data.editedAt as Timestamp).toDate() })
        } as Comment;
      });
      callback(comments);
    });
  }
}

export const communityService = new CommunityService();
