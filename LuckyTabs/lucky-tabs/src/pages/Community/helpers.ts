/**
 * Helper functions for Community component
 * These are pure functions that don't depend on component state or props
 */

/**
 * Formats a date into a relative time string
 * @param date - The date to format
 * @returns A human-readable relative time string
 */
export const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return 'Just now';
  if (diffInHours === 1) return '1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return date.toLocaleDateString();
};

/**
 * Gets initials from a display name
 * @param displayName - The full display name
 * @returns Up to 2 uppercase initials
 */
export const getInitialsFromName = (displayName: string): string => {
  return displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Parses the active tab from URL search parameters
 * @param searchParams - URLSearchParams object
 * @returns Tab index (0=Public, 1=Group, 2=My Groups)
 */
export const parseTabFromUrl = (searchParams: URLSearchParams): number => {
  const tabParam = searchParams.get('tab');
  if (tabParam === '1') return 1; // Group Feed
  if (tabParam === '2') return 2; // My Groups
  return 0; // Default to Public Feed
};

/**
 * Generates a fallback user ID display
 * @param authorId - The user ID
 * @returns A truncated user ID for display
 */
export const getFallbackUserDisplay = (authorId: string): string => {
  return `User ${authorId.slice(0, 8)}`;
};

/**
 * Gets initials from a user ID as a fallback
 * @param authorId - The user ID
 * @returns 2 uppercase characters from the user ID
 */
export const getInitialsFromUserId = (authorId: string): string => {
  return authorId.slice(0, 2).toUpperCase();
};
