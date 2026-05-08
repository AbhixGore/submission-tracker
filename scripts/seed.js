// scripts/seed.js
// Run once to seed teachers + admin into Firestore
// Usage: node scripts/seed.js
//
// REQUIREMENTS:
//   npm install firebase-admin
//   Set GOOGLE_APPLICATION_CREDENTIALS env variable pointing to your serviceAccountKey.json
//   OR paste your service account JSON below

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// ============================================================
// OPTION A: Use service account key file (recommended)
// Download from Firebase Console → Project Settings → Service Accounts
// ============================================================
const serviceAccount = require('./serviceAccountKey.json'); // put key file in scripts/

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const TEACHERS = [
  { name: 'S. A. Ali',        subject: 'eptd', username: 'eptd@sya', password: 'eptd@123' },
  { name: 'A. K. Roy',        subject: 'emi',  username: 'emi@sya',  password: 'emi@123'  },
  { name: 'N. A. Sonkamble',  subject: 'ee',   username: 'ee@sya',   password: 'ee@123'   },
  { name: 'S. B. Khan',       subject: 'tdmc', username: 'tdmc@sya', password: 'tdmc@123' },
  { name: 'T. H. Shaikh',     subject: 'pe',   username: 'pe@sya',   password: 'pe@123'   },
  { name: 'R. B. Palwe',      subject: 'uhv',  username: 'uhv@sya',  password: 'uhv@123'  },
];

const ADMIN = {
  name: 'Admin',
  username: 'admin@sya',
  password: 'admin@123',
  role: 'admin',
};

async function seed() {
  const batch = db.batch();

  for (const t of TEACHERS) {
    const ref = db.collection('users').doc(`teacher_${t.subject}`);
    batch.set(ref, { ...t, role: 'teacher' });
    console.log(`Teacher: ${t.username} / ${t.password}`);
  }

  const adminRef = db.collection('users').doc('admin');
  batch.set(adminRef, ADMIN);
  console.log(`Admin: ${ADMIN.username} / ${ADMIN.password}`);

  await batch.commit();
  console.log('\n✅ Seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
