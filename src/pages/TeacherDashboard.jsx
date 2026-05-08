// src/pages/TeacherDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import {
  collection, query, where, getDocs,
  doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { SUBJECTS } from '../utils/constants';

const STATUSES = [
  { key: 'submitted',     label: 'Submitted',     cls: 'btn-success' },
  { key: 'late',          label: 'Late',           cls: 'btn-warn' },
  { key: 'not_submitted', label: 'Not Submitted',  cls: 'btn-danger' },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const subjectId = user.subject?.trim();
  const subject = SUBJECTS.find(s => s.id === subjectId);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all students
      const sq = query(collection(db, 'users'), where('role', '==', 'student'));
      const sSnap = await getDocs(sq);
      const studs = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => Number(a.roll_no) - Number(b.roll_no));
      setStudents(studs);

      // Fetch submissions for this subject
      const subQ = query(collection(db, 'submissions'), where('subject_id', '==', subjectId));
      const subSnap = await getDocs(subQ);
      const map = {};
      subSnap.forEach(d => { map[d.data().student_id] = d.data().status; });
      setSubmissions(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markStatus = async (studentId, status) => {
    const key = `${studentId}_${status}`;
    setSaving(p => ({ ...p, [key]: true }));
    try {
      const docId = `${studentId}_${subjectId}`;
      await setDoc(doc(db, 'submissions', docId), {
        student_id: studentId,
        subject_id: subjectId,
        status,
        updated_by: user.id,
        timestamp: serverTimestamp(),
      });
      setSubmissions(p => ({ ...p, [studentId]: status }));
    } catch (err) {
      alert('Failed to save. Check your connection.');
      console.error(err);
    } finally {
      setSaving(p => { const n={...p}; delete n[key]; return n; });
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    String(s.roll_no).includes(search)
  );

  // Stats
  const counts = { submitted:0, late:0, not_submitted:0, pending:0 };
  students.forEach(s => {
    const st = submissions[s.id] || 'pending';
    counts[st] = (counts[st] || 0) + 1;
  });

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Loading students...
    </div>
  );

  return (
    <div className="page">
      <div className="page-title">{subject?.name} — Submission Marking</div>
      <div className="page-sub">{subject?.teacherName} · {students.length} students total</div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom:'1.5rem', gap:'0.75rem' }}>
        {[
          { label:'Submitted', val: counts.submitted, color:'var(--green)' },
          { label:'Late',      val: counts.late,      color:'var(--yellow)' },
          { label:'Pending/Not', val: (counts.not_submitted + counts.pending), color:'var(--red)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'1rem', textAlign:'center' }}>
            <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <input
          className="search-bar"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
          {filtered.length} students shown
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Roll No</th>
                <th>Name</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => {
                const current = submissions[student.id] || null;
                return (
                  <tr key={student.id}>
                    <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.8rem' }}>{i+1}</td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:700 }}>{student.roll_no}</td>
                    <td style={{ fontWeight:600 }}>{student.name}</td>
                    <td>
                      {current ? (
                        <span className={`badge ${
                          current === 'submitted' ? 'badge-submitted' :
                          current === 'late' ? 'badge-late' : 'badge-not'
                        }`}>
                          {current === 'submitted' ? 'Submitted' :
                           current === 'late' ? 'Late' : 'Not Submitted'}
                        </span>
                      ) : (
                        <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                        {STATUSES.map(s => {
                          const isActive = current === s.key;
                          const isLoading = saving[`${student.id}_${s.key}`];
                          return (
                            <button
                              key={s.key}
                              className={`btn ${s.cls} ${isActive ? 'active-btn' : ''}`}
                              style={{ fontSize:'0.78rem', padding:'0.35rem 0.7rem', opacity: isLoading ? 0.6 : 1 }}
                              onClick={() => markStatus(student.id, s.key)}
                              disabled={isLoading}
                            >
                              {isLoading ? '...' : s.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-muted)' }}>
              No students found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
