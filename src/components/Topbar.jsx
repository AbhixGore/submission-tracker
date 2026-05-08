// src/components/Topbar.jsx
import { useAuth } from '../contexts/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();

  const roleLabel = user?.role === 'admin' ? 'Admin' :
                    user?.role === 'teacher' ? `Teacher · ${user.subject?.toUpperCase()}` :
                    `Roll #${user?.roll_no}`;

  return (
    <div className="topbar">
      <div className="topbar-logo">SYA Tracker</div>
      <div className="topbar-user">
        <div>
          <div style={{ fontSize:'0.9rem', fontWeight:700 }}>{user?.name}</div>
          <div className="topbar-name">{roleLabel}</div>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}
