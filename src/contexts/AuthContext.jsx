// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sya_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.trim()),
      where('password', '==', password.trim())
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Invalid credentials');
    const userData = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setUser(userData);
    localStorage.setItem('sya_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sya_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
