const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUsers() {
  try {
    console.log('Starting user migration to add isAdmin field...');
    
    // Get all users from the users collection
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      console.log('No users found to migrate.');
      return;
    }
    
    const batch = db.batch();
    let updateCount = 0;
    let skipCount = 0;
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      
      // Check if isAdmin field already exists
      if (userData.hasOwnProperty('isAdmin')) {
        console.log(`User ${doc.id} already has isAdmin field, skipping...`);
        skipCount++;
        return;
      }
      
      // Add isAdmin field set to false
      batch.update(doc.ref, {
        isAdmin: false,
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      updateCount++;
      console.log(`Queued update for user ${doc.id} (${userData.displayName || userData.email})`);
    });
    
    if (updateCount > 0) {
      console.log(`\nCommitting updates for ${updateCount} users...`);
      await batch.commit();
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('No users needed migration.');
    }
    
    console.log(`\nSummary:`);
    console.log(`- Users updated: ${updateCount}`);
    console.log(`- Users skipped (already had isAdmin): ${skipCount}`);
    console.log(`- Total users: ${updateCount + skipCount}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    // Clean up
    await admin.app().delete();
    console.log('Migration script finished.');
  }
}

// Run the migration
migrateUsers();
