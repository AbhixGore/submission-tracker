import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDTeVWmIIm8Bj4TjKm8uEqOA7xPp1m2gLY",
  authDomain: "submission-web-e86cb.firebaseapp.com",
  projectId: "submission-web-e86cb",
  storageBucket: "submission-web-e86cb.firebasestorage.app",
  messagingSenderId: "39223381250",
  appId: "1:39223381250:web:4203c326160ed13646c61b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;