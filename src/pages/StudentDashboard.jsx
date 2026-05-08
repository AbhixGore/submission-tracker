// src/pages/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { SUBJECTS } from '../utils/constants';

const statusDisplay = {
  submitted: { label: 'Submitted', cls: 'badge-submitted', color: 'var(--green)' },
  late:      { label: 'Late Submitted', cls: 'badge-late', color: 'var(--yellow)' },
  not_submitted: { label: 'Not Submitted', cls: 'badge-not', color: 'var(--red)' },
  pending:   { label: 'Pending', cls: 'badge-pending', color: 'var(--text-muted)' },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'submissions'), where('student_id', '==', user.id));
      const snap = await getDocs(q);
      const map = {};
      snap.forEach(doc => {
        const d = doc.data();
        map[d.subject_id] = d.status;
      });
      setSubmissions(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const countedStatuses = ['submitted', 'late'];
  const completed = SUBJECTS.filter(s => countedStatuses.includes(submissions[s.id])).length;
  const pct = Math.round((completed / SUBJECTS.length) * 100);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Loading your submissions...
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-title">My Assignments</div>
      <div className="page-sub">Roll #{user.roll_no} · {user.name}</div>

      {/* Progress Card */}
      <div className="card" style={{ marginBottom:'2rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'0.8rem' }}>
          <div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.3rem' }}>
              Submission Progress
            </div>
            <div style={{ fontSize:'2.5rem', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1 }}>
              {pct}%
            </div>
          </div>
          <div style={{ textAlign:'right', color:'var(--text-muted)', fontSize:'0.85rem' }}>
            {completed} / {SUBJECTS.length} subjects
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height:10, background:'var(--surface2)', borderRadius:999, overflow:'hidden' }}>
          <div style={{
            height:'100%',
            width:`${pct}%`,
            background: pct === 100 ? 'var(--green)' : pct >= 50 ? 'var(--accent)' : 'var(--accent2)',
            borderRadius: 999,
            transition: 'width 0.5s ease',
          }}/>
        </div>

        {/* Quick stats */}
        <div style={{ display:'flex', gap:'1.5rem', marginTop:'1rem' }}>
          {['submitted','late','not_submitted'].map(s => {
            const count = SUBJECTS.filter(sub => submissions[sub.id] === s).length;
            const d = statusDisplay[s];
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:d.color }}/>
                <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
                  {d.label}: <strong style={{ color:'var(--text)' }}>{count}</strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Cards */}
      <div className="grid-2" style={{ gap:'1rem' }}>
        {SUBJECTS.map(subject => {
          const status = submissions[subject.id] || 'pending';
          const d = statusDisplay[status];
          return (
            <div key={subject.id} className="card" style={{
              borderLeft: `3px solid ${d.color}`,
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', letterSpacing:'-0.01em' }}>{subject.name}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginTop:'0.2rem' }}>{subject.teacherName}</div>
                </div>
                <span className={`badge ${d.cls}`}>{d.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:'2rem', color:'var(--text-muted)', fontSize:'0.78rem', textAlign:'center' }}>
        Late submissions count toward your percentage · Refresh to see updates
      </div>
    </div>
  );
}
