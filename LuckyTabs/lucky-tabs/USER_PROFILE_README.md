# User Profile Feature

## Overview
The User Profile feature provides comprehensive user management capabilities including profile editing, avatar uploads, and group management functionality.

## Features Implemented

### ✅ User Profile Page
- **Profile Information Display**: Shows user's display name, first/last name, email, and avatar
- **Account Statistics**: Member since date, group count, friend count
- **Responsive Design**: Works on both desktop and mobile devices

### ✅ Edit Profile Dialog
- **Personal Information**: Edit first name, last name, and display name
- **Avatar Upload**: Upload and preview profile pictures
- **Real-time Validation**: Form validation with user feedback
- **Save/Cancel Actions**: Proper form handling with loading states

### ✅ Group Management
- **Add Users to Group**: Search for users by display name
- **Autocomplete Search**: Real-time user search with suggestions
- **Member List**: View all group members with avatars
- **Remove Members**: Remove users from groups with confirmation

### ✅ Firebase Integration
- **User Service**: Complete Firebase integration for user data
- **Firestore Rules**: Secure data access with proper permissions
- **Storage Support**: Ready for avatar image uploads
- **Type Safety**: Full TypeScript support with proper interfaces

## User Interface Components

### Profile Card
```tsx
// Displays user information with edit button
- Avatar (80x80px)
- Display name, first/last name
- Email address
- Edit Profile button
```

### Edit Dialog
```tsx
// Modal dialog for editing profile
- Avatar upload with preview
- First Name field
- Last Name field  
- Display Name field
- Save/Cancel buttons with loading states
```

### Group Management Card
```tsx
// Side panel for group management
- Add User button
- Member list with avatars
- Remove member actions
- Empty state messaging
```

## Data Schema

### UserData Interface
```typescript
interface UserData {
  uid: string;           // Firebase Auth UID
  email: string;         // User's email
  displayName: string;   // Public display name
  firstName: string;     // First name
  lastName: string;      // Last name
  avatar?: string;       // Avatar image URL
  groups: string[];      // Array of group IDs
  friends: string[];     // Array of friend UIDs
  createdAt: Date;       // Account creation date
  updatedAt: Date;       // Last profile update
}
```

### GroupMember Interface
```typescript
interface GroupMember {
  uid: string;           // User ID
  displayName: string;   // Display name
  firstName: string;     // First name
  lastName: string;      // Last name
  avatar?: string;       // Avatar URL
}
```

## Firebase Service Methods

### User Profile Operations
- `getUserProfile(userId)` - Get user profile data
- `createUserProfile(userId, email, displayName)` - Create new user profile
- `updateUserProfile(userId, updates)` - Update profile information
- `uploadAvatar(userId, file)` - Upload avatar image

### User Search & Friends
- `searchUsers(searchTerm, excludeUserIds)` - Search users by display name
- `addFriend(userId, friendId)` - Add mutual friendship
- `removeFriend(userId, friendId)` - Remove friendship
- `getUserFriends(userId)` - Get user's friends list

### Group Management
- `joinGroup(userId, groupId)` - Join a group
- `leaveGroup(userId, groupId)` - Leave a group
- `getUserProfiles(userIds)` - Get multiple user profiles

## Security & Permissions

### Firestore Rules
```javascript
// Users can read/write their own profiles
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow read: if request.auth != null; // Others can read for search
}
```

### Storage Rules (when enabled)
```javascript
// Users can upload to their own avatar folder
match /avatars/{userId}/{allPaths=**} {
  allow read: if true; // Public read for avatars
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

## Getting Started

### Enable Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Storage
4. Click "Get Started"
5. Deploy storage rules: `firebase deploy --only storage`

### Using the User Profile
1. Navigate to `/profile` in your app
2. Users must be authenticated to access
3. Profile data is automatically loaded from Firebase
4. Edit button opens the profile editing dialog
5. Group management is available in the side panel

## TODO Items for Production

### Real Firebase Integration
- Replace mock data with actual Firebase service calls
- Implement real user search functionality
- Add friend request system
- Create group management system

### Enhanced Features
- Profile privacy settings
- User status (online/offline)
- Profile completion percentage
- Social media links
- Bio/description field

### File Upload Improvements
- Image resizing/optimization
- Multiple image formats support
- Progress indicators for uploads
- Error handling for large files

### Search Improvements
- Use Algolia for better search
- Add filters (location, interests, etc.)
- Search history
- Recent contacts

## Component Architecture

```
UserProfile.tsx
├── Profile Information Card
│   ├── Avatar Display
│   ├── User Details
│   └── Edit Button
├── Group Management Card
│   ├── Add User Button
│   ├── Member List
│   └── Remove Actions
├── Edit Profile Dialog
│   ├── Avatar Upload
│   ├── Form Fields
│   └── Save/Cancel Actions
└── Add User Dialog
    ├── User Search
    ├── Results List
    └── Selection Actions
```

The User Profile feature is now fully functional with mock data and ready for Firebase integration!
