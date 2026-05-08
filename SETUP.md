# SYA Assignment Tracker — Setup Guide

## 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project" → Name it `sya-tracker`
3. Disable Google Analytics (optional) → Create project

## 2. Enable Firestore

1. In Firebase Console → Build → Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll lock it down after)
4. Select region: `asia-south1` (Mumbai, best for Maharashtra)

## 3. Get Firebase Config

1. Firebase Console → Project Settings (gear icon) → General
2. Scroll to "Your apps" → Click `</>` (Web app)
3. Register app with nickname `sya-web`
4. Copy the `firebaseConfig` object

## 4. Set Config in Code

Open `src/firebase/config.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sya-tracker.firebaseapp.com",
  projectId: "sya-tracker",
  storageBucket: "sya-tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 5. Seed Teachers + Admin

### Get Service Account Key
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" → Download JSON
3. Rename it to `serviceAccountKey.json`
4. Place it in the `scripts/` folder

### Run Seed Script
```bash
npm install firebase-admin
node scripts/seed.js
```

This creates:
- 6 teacher accounts
- 1 admin account

Verify in Firestore Console → `users` collection.

## 6. Install & Run Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 7. Add Students

- Log in as admin: `admin@sya` / `admin@123`
- Go to Students tab
- Add individually OR use bulk add

### Bulk Add Format
```
Omkar Rathod, 21
Priya Sharma, 22
Rahul Patil, 23
```

## 8. Deploy to Firebase Hosting (optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 9. Firestore Rules (after testing)

Deploy rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

---

## Login Credentials Reference

### Admin
| Username | Password |
|----------|----------|
| admin@sya | admin@123 |

### Teachers
| Subject | Username | Password |
|---------|----------|----------|
| EPTD | eptd@sya | eptd@123 |
| EMI  | emi@sya  | emi@123  |
| EE   | ee@sya   | ee@123   |
| T&DMC | tdmc@sya | tdmc@123 |
| PE   | pe@sya   | pe@123   |
| UHV  | uhv@sya  | uhv@123  |

### Students
| Username Format | Password Format |
|-----------------|-----------------|
| firstname+lastname+rollno@sya | rollno@123 |
| e.g. omkarrathod21@sya | e.g. 21@123 |

---

## Firestore Collections

### `users`
```
{
  name: "Omkar Rathod",
  roll_no: "21",
  username: "omkarrathod21@sya",
  password: "21@123",
  role: "student" | "teacher" | "admin",
  subject: "eptd"  // teachers only
}
```

### `submissions`
```
Document ID: {student_id}_{subject_id}
{
  student_id: "abc123",
  subject_id: "eptd",
  status: "submitted" | "late" | "not_submitted",
  updated_by: "teacher_eptd",
  timestamp: Timestamp
}
```

---

## Percentage Calculation

```
% = (submitted + late) / 6 × 100
```

Rounded to nearest integer. Both submitted and late count.
