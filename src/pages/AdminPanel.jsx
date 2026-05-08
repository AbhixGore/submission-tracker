// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection, getDocs, addDoc, deleteDoc, doc, query, where
} from 'firebase/firestore';
import { SUBJECTS } from '../utils/constants';

const TABS = ['Students', 'Teachers', 'Overview'];

export default function AdminPanel() {
  const [tab, setTab] = useState('Students');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student form state
  const [sName, setSName] = useState('');
  const [sRoll, setSRoll] = useState('');
  const [sBulk, setSBulk] = useState('');
  const [sMsg, setSMsg] = useState('');

  // Bulk preview
  const [sSearch, setSSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stuSnap, teachSnap, subSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role','==','student'))),
        getDocs(query(collection(db, 'users'), where('role','==','teacher'))),
        getDocs(collection(db, 'submissions')),
      ]);
      setStudents(stuSnap.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b)=>Number(a.roll_no)-Number(b.roll_no)));
      setTeachers(teachSnap.docs.map(d => ({ id:d.id, ...d.data() })));
      setSubmissions(subSnap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  // Add single student
  const addStudent = async () => {
    if (!sName.trim() || !sRoll.trim()) { setSMsg('Name and roll number required'); return; }
    const nameParts = sName.trim().toLowerCase().split(' ');
    const first = nameParts[0] || '';
    const last = nameParts[nameParts.length-1] || '';
    const username = `${first}${last}${sRoll.trim()}@sya`;
    const password = `${sRoll.trim()}@123`;
    try {
      await addDoc(collection(db, 'users'), {
        name: sName.trim(),
        roll_no: sRoll.trim(),
        username,
        password,
        role: 'student',
      });
      setSMsg(`✓ Added ${sName} — login: ${username} / ${password}`);
      setSName(''); setSRoll('');
      fetchAll();
    } catch(e) { setSMsg('Error: ' + e.message); }
  };

  // Bulk add: "Name, RollNo" per line
  const bulkAdd = async () => {
    const lines = sBulk.trim().split('\n').filter(Boolean);
    if (!lines.length) return;
    let added = 0, errors = 0;
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 2) { errors++; continue; }
      const [name, roll] = parts;
      const nameParts = name.toLowerCase().split(' ');
      const first = nameParts[0] || '';
      const last = nameParts[nameParts.length-1] || '';
      const username = `${first}${last}${roll}@sya`;
      const password = `${roll}@123`;
      try {
        await addDoc(collection(db, 'users'), { name, roll_no: roll, username, password, role:'student' });
        added++;
      } catch { errors++; }
    }
    setSMsg(`✓ Added ${added} students${errors ? `, ${errors} failed` : ''}`);
    setSBulk('');
    fetchAll();
  };

  const deleteStudent = async (id, name) => {
    if (!confirm(`Delete ${name}? This also removes their submissions.`)) return;
    await deleteDoc(doc(db, 'users', id));
    fetchAll();
  };

  // Overview stats
  const subjectStats = SUBJECTS.map(sub => {
    const total = students.length;
    const subs = submissions.filter(s => s.subject_id === sub.id);
    const submitted = subs.filter(s => s.status === 'submitted').length;
    const late = subs.filter(s => s.status === 'late').length;
    const notSub = subs.filter(s => s.status === 'not_submitted').length;
    const pending = total - submitted - late - notSub;
    return { ...sub, total, submitted, late, notSub, pending };
  });

  const filtStudents = students.filter(s =>
    s.name.toLowerCase().includes(sSearch.toLowerCase()) ||
    String(s.roll_no).includes(sSearch)
  );

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'var(--text-muted)' }}>
      Loading...
    </div>
  );

  return (
    <div className="page">
      <div className="page-title">Admin Panel</div>
      <div className="page-sub">{students.length} students · {SUBJECTS.length} subjects</div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* STUDENTS TAB */}
      {tab === 'Students' && (
        <div>
          <div className="grid-2" style={{ gap:'1.5rem', alignItems:'start' }}>
            {/* Add single */}
            <div className="card">
              <div style={{ fontWeight:700, marginBottom:'1rem' }}>Add Single Student</div>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Omkar Rathod" value={sName} onChange={e => setSName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" placeholder="21" value={sRoll} onChange={e => setSRoll(e.target.value)} />
              </div>
              {sName && sRoll && (
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.8rem', fontFamily:'var(--font-mono)' }}>
                  Login: {sName.toLowerCase().split(' ')[0]}{sName.toLowerCase().split(' ').at(-1)}{sRoll}@sya / {sRoll}@123
                </div>
              )}
              <button className="btn btn-primary" onClick={addStudent} style={{ width:'100%' }}>Add Student</button>
              {sMsg && <div className={sMsg.startsWith('✓') ? 'success-msg' : 'error-msg'} style={{marginTop:'0.7rem'}}>{sMsg}</div>}
            </div>

            {/* Bulk add */}
            <div className="card">
              <div style={{ fontWeight:700, marginBottom:'0.5rem' }}>Bulk Add Students</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.8rem' }}>
                One per line: <span style={{fontFamily:'var(--font-mono)'}}>Name, RollNo</span>
              </div>
              <div className="form-group">
                <textarea
                  style={{
                    width:'100%', minHeight:140,
                    background:'var(--surface2)', border:'1px solid var(--border)',
                    borderRadius:8, color:'var(--text)', padding:'0.7rem 1rem',
                    fontFamily:'var(--font-mono)', fontSize:'0.82rem', resize:'vertical'
                  }}
                  placeholder={"Omkar Rathod, 21\nPriya Sharma, 22\nRahul Patil, 23"}
                  value={sBulk}
                  onChange={e => setSBulk(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={bulkAdd} style={{ width:'100%' }}>Bulk Add</button>
            </div>
          </div>

          {/* Student list */}
          <div style={{ marginTop:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem' }}>
              <div style={{ fontWeight:700 }}>All Students ({students.length})</div>
              <input className="search-bar" placeholder="Search..." value={sSearch} onChange={e => setSSearch(e.target.value)} style={{width:220}} />
            </div>
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Password</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtStudents.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontFamily:'var(--font-mono)', fontWeight:700 }}>{s.roll_no}</td>
                        <td>{s.name}</td>
                        <td style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--text-muted)' }}>{s.username}</td>
                        <td style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', color:'var(--text-muted)' }}>{s.password}</td>
                        <td>
                          <button className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'0.25rem 0.6rem' }}
                            onClick={() => deleteStudent(s.id, s.name)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {tab === 'Teachers' && (
        <div>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <div style={{ fontWeight:700, marginBottom:'1rem' }}>Teacher Accounts</div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Teacher Name</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map(sub => {
                  const t = teachers.find(t => t.subject === sub.id);
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight:700 }}>{sub.name}</td>
                      <td>{sub.teacherName}</td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem' }}>{sub.id}@sya</td>
                      <td style={{ fontFamily:'var(--font-mono)', fontSize:'0.82rem' }}>{sub.id}@123</td>
                      <td>
                        <span className={`badge ${t ? 'badge-submitted' : 'badge-not'}`}>
                          {t ? 'Active' : 'Not Seeded'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ background:'rgba(108,99,255,0.08)', borderColor:'rgba(108,99,255,0.25)' }}>
            <div style={{ fontWeight:700, marginBottom:'0.5rem' }}>⚡ Seed Teacher Accounts</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
              Run the Firebase seeder script to create all 6 teacher accounts + admin in Firestore.
              See <span style={{fontFamily:'var(--font-mono)'}}>SETUP.md</span> for instructions.
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'0.8rem', background:'var(--surface2)', padding:'0.8rem 1rem', borderRadius:8, color:'var(--text-muted)' }}>
              node scripts/seed.js
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {tab === 'Overview' && (
        <div>
          <div style={{ fontWeight:700, marginBottom:'1rem' }}>Subject-wise Submission Overview</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {subjectStats.map(sub => {
              const total = sub.total || 1;
              const submittedPct = Math.round(((sub.submitted + sub.late) / total) * 100);
              return (
                <div key={sub.id} className="card" style={{ padding:'1.2rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem' }}>
                    <div>
                      <span style={{ fontWeight:800, fontSize:'1rem' }}>{sub.name}</span>
                      <span style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginLeft:'0.7rem' }}>{sub.teacherName}</span>
                    </div>
                    <span style={{ fontWeight:800, color: submittedPct===100?'var(--green)':submittedPct>=50?'var(--accent)':'var(--red)' }}>
                      {submittedPct}%
                    </span>
                  </div>
                  <div style={{ height:8, background:'var(--surface2)', borderRadius:999, overflow:'hidden', marginBottom:'0.8rem' }}>
                    <div style={{
                      height:'100%', width:`${submittedPct}%`, borderRadius:999,
                      background: submittedPct===100?'var(--green)':submittedPct>=50?'var(--accent)':'var(--red)',
                      transition:'width 0.4s'
                    }}/>
                  </div>
                  <div style={{ display:'flex', gap:'1.2rem', fontSize:'0.78rem' }}>
                    {[
                      { label:'Submitted', val:sub.submitted, color:'var(--green)' },
                      { label:'Late',      val:sub.late,      color:'var(--yellow)' },
                      { label:'Not Sub',   val:sub.notSub,    color:'var(--red)' },
                      { label:'Pending',   val:sub.pending,   color:'var(--text-muted)' },
                    ].map(x => (
                      <span key={x.label} style={{ color:x.color, fontWeight:600 }}>
                        {x.label}: {x.val}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
