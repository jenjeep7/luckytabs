import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface FeedbackSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  feedbackText: string;
  submittedAt: Date;
  status: 'new' | 'reviewed' | 'resolved';
  category?: 'bug' | 'feature' | 'improvement' | 'general';
  userAgent?: string; // Browser/device info
  currentUrl?: string; // Page they were on when submitting
}

interface FirestoreFeedbackData {
  userId: string;
  userEmail: string;
  userName: string;
  feedbackText: string;
  submittedAt: Timestamp;
  status: 'new' | 'reviewed' | 'resolved';
  category?: 'bug' | 'feature' | 'improvement' | 'general';
  userAgent?: string;
  currentUrl?: string;
}

class FeedbackService {
  // Submit new feedback
  async submitFeedback(
    userId: string,
    userEmail: string,
    userName: string,
    feedbackText: string,
    category?: 'bug' | 'feature' | 'improvement' | 'general'
  ): Promise<string> {
    const feedbackData = {
      userId,
      userEmail,
      userName,
      feedbackText,
      submittedAt: Timestamp.fromDate(new Date()),
      status: 'new' as const,
      category: category || 'general',
      userAgent: navigator.userAgent,
      currentUrl: window.location.href,
    };

    const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
    return docRef.id;
  }

  // Get all feedback (admin function)
  async getAllFeedback(): Promise<FeedbackSubmission[]> {
    const feedbackQuery = query(
      collection(db, 'feedback'),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(feedbackQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreFeedbackData;
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        feedbackText: data.feedbackText,
        submittedAt: data.submittedAt.toDate(),
        status: data.status,
        category: data.category,
        userAgent: data.userAgent,
        currentUrl: data.currentUrl,
      } as FeedbackSubmission;
    });
  }

  // Get feedback by user
  async getFeedbackByUser(userId: string): Promise<FeedbackSubmission[]> {
    const feedbackQuery = query(
      collection(db, 'feedback'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(feedbackQuery);
    return snapshot.docs.map(doc => {
      const data = doc.data() as FirestoreFeedbackData;
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        feedbackText: data.feedbackText,
        submittedAt: data.submittedAt.toDate(),
        status: data.status,
        category: data.category,
        userAgent: data.userAgent,
        currentUrl: data.currentUrl,
      } as FeedbackSubmission;
    });
  }

  // Get feedback count for analytics
  async getFeedbackCount(): Promise<number> {
    const snapshot = await getDocs(collection(db, 'feedback'));
    return snapshot.size;
  }
}

export const feedbackService = new FeedbackService();