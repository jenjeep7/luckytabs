/* eslint-disable */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const locations = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/locations.json'), 'utf8')
);

function generateIdFromName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

async function importLocations() {
  for (const location of locations) {
    // Ensure the new keys are present and old one is removed from object
    delete location.boxesCount;

    if (!('barBoxesCount' in location)) location.barBoxesCount = 0;
    if (!('wallBoxesCount' in location)) location.wallBoxesCount = 0;

    const locationId = generateIdFromName(location.name);
    const docRef = db.collection('locations').doc(locationId);

    await docRef.set(
      {
        ...location,
        boxesCount: FieldValue.delete(), // explicitly delete old field if it exists
      },
      { merge: true } // merge to update without overwriting entire doc
    );
  }
}

importLocations()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to import locations:', err);
    process.exit(1);
  });
