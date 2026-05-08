// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* bg decoration */}
      <div style={{
        position:'absolute', width:500, height:500,
        background:'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)',
        top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        pointerEvents:'none'
      }}/>

      <div style={{ width:'100%', maxWidth:400, padding:'0 1.5rem', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'2rem', fontWeight:800, letterSpacing:'-0.04em', color:'var(--accent)' }}>
            SYA
          </div>
          <div style={{ fontSize:'1rem', color:'var(--text-muted)', marginTop:'0.3rem' }}>
            Assignment Tracker
          </div>
        </div>

        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontWeight:800, fontSize:'1.2rem', marginBottom:'1.5rem' }}>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="e.g. omkarrathod21@sya"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="e.g. 21@123"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width:'100%', padding:'0.75rem', marginTop:'1rem', fontSize:'0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ textAlign:'center', marginTop:'1.5rem', color:'var(--text-muted)', fontSize:'0.78rem' }}>
          <div>Students: <span style={{fontFamily:'var(--font-mono)'}}>firstname+lastname+rollno@sya</span></div>
          <div style={{marginTop:'0.3rem'}}>Teachers: <span style={{fontFamily:'var(--font-mono)'}}>subject@sya</span></div>
        </div>
      </div>
    </div>
  );
}
