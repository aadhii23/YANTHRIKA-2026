import React, { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(600); // 10 minutes in seconds
  
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  
  const [editingReg, setEditingReg] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(600);
      
      timerRef.current = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 1) {
            handleLogout(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const resetTimer = () => setSessionTimeLeft(600);
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);

      return () => {
        clearInterval(timerRef.current);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
      };
    }
  }, [isAuthenticated]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin-session', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchRegistrations();
      }
    } catch (err) {
      console.log('No active session.');
    }
  };

  const handleLogout = async (expired = false) => {
    try {
      await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' });
    } catch(err) {}
    setIsAuthenticated(false);
    setRegistrations([]);
    setPassword('');
    setUsername('');
    if (expired) {
      setErrorObj('Session expired due to inactivity. Please log in again.');
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorObj('');
    try {
      const res = await fetch('/api/get-registrations', {credentials: 'include'});
      if (!res.ok) {
        throw new Error('Unauthorized or Session Expired');
      }
      const data = await res.json();
      setRegistrations(data);
      setIsAuthenticated(true);
    } catch (err) {
      setErrorObj(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorObj('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchRegistrations();
      } else {
        setErrorObj(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setErrorObj('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration completely?')) return;
    
    try {
      const res = await fetch('/api/delete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Failed to delete.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch('/api/update-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editingReg)
      });
      if (res.ok) {
        setRegistrations(prev => prev.map(r => r.id === editingReg.id ? editingReg : r));
        setEditingReg(null);
      } else {
        alert('Failed to update.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeEdit = (field, value) => {
    setEditingReg(prev => ({ ...prev, [field]: value }));
  };

  const filteredData = useMemo(() => {
    return registrations.filter(r => {
      const matchesSearch = (r.team_name || '').toLowerCase().includes(search.toLowerCase()) || 
                            (r.leader_name || '').toLowerCase().includes(search.toLowerCase()) ||
                            (r.event_id || '').toLowerCase().includes(search.toLowerCase()) ||
                            (r.college_name || '').toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterEvent ? r.event_name === filterEvent : true;
      return matchesSearch && matchesFilter;
    });
  }, [registrations, search, filterEvent]);

  // Unique events for the filter dropdown
  const eventOptions = useMemo(() => {
    return [...new Set(registrations.map(r => r.event_name))];
  }, [registrations]);

  const exportCSV = () => {
    if (!filteredData || !filteredData.length) {
      alert("No data available to export.");
      return;
    }
    
    try {
      const headers = Object.keys(filteredData[0] || {});
      if (!headers.length) return;
      
      const escapeCSV = (str) => {
        if (str === null || str === undefined) return '';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      };

      const csvRows = [];
      csvRows.push('\uFEFF' + headers.join(',')); // Add BOM for Excel UTF-8 compatibility

      filteredData.forEach(r => {
        const row = headers.map(header => {
          let val = r[header];
          if (header === 'created_at' && val) {
            val = new Date(val).toLocaleString();
          }
          return escapeCSV(val);
        });
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `YANTHRIKA_Database_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Export Error:", err);
      alert("Failed to export: " + err.message);
    }
  };



  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="login-container">
          <h2>Admin Access</h2>
          {errorObj && <p className="error-text">{errorObj}</p>}
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              autoFocus
              className="login-input"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="login-input"
            />
            <button type="submit" className="btn-style-one" disabled={loading} style={{ width: '100%' }}>
              <div className="btn-wrap"><span className="text-one">{loading ? 'Verifying...' : 'Secure Login'}</span><span className="text-two">{loading ? 'Verifying...' : 'Secure Login'}</span></div>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="admin-page">
      <div className="auto-container" style={{ maxWidth: '1400px', paddingBottom: '100px' }}>
        
        <div className="admin-header">
          <h1>Registrations <span style={{ color: 'var(--main-color)' }}>Portal</span></h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className={`session-timer ${sessionTimeLeft < 60 ? 'danger' : ''}`}>
              Session expires in: {formatTime(sessionTimeLeft)}
            </div>
            <button className="btn-style-two" onClick={exportCSV} style={{ border: 'none' }}>
              <div className="btn-wrap"><span className="text-one">Export CSV</span><span className="text-two">Export CSV</span></div>
            </button>
            <button className="btn-style-one" onClick={() => handleLogout(false)} style={{ border: 'none', background: 'rgba(255, 68, 68, 0.2)', color: '#ff4444' }}>
              <div className="btn-wrap"><span className="text-one">Logout</span><span className="text-two">Logout</span></div>
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-value">{registrations.length}</div>
            <div className="admin-stat-label">Total Registrations</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{filteredData.length}</div>
            <div className="admin-stat-label">Filtered Results</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-value">{eventOptions.length}</div>
            <div className="admin-stat-label">Active Events</div>
          </div>
        </div>

        <div className="admin-controls">
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search Team, College, Leader, or ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <select 
            className="admin-filter-select"
            value={filterEvent}
            onChange={e => setFilterEvent(e.target.value)}
          >
            <option value="">All Events</option>
            {eventOptions.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
          <button className="btn-style-one" onClick={() => fetchRegistrations(password)} style={{ padding: '0 20px', marginLeft: 'auto' }}>
            <div className="btn-wrap"><span className="text-one">Refresh Data</span><span className="text-two">Refresh Data</span></div>
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Event & College</th>
                <th>Team Name</th>
                <th>Leader Name</th>
                <th>Leader Phone</th>
                <th>Team Size</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(reg => {
                const teamSize = 1 + !!reg.member2_name + !!reg.member3_name + !!reg.member4_name;
                return (
                  <tr key={reg.id}>
                    <td><strong style={{ color: 'var(--main-color)' }}>{reg.event_id}</strong></td>
                    <td>
                      <span style={{ display:'block', fontWeight: 'bold' }}>{reg.event_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{reg.college_name}</span>
                    </td>
                    <td>{reg.team_name || '-'}</td>
                    <td>
                      <span style={{ display:'block' }}>{reg.leader_name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{reg.leader_email}</span>
                    </td>
                    <td>{reg.leader_phone}</td>
                    <td>{teamSize} Members</td>
                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    <td>{new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <button className="admin-action-btn" onClick={() => setEditingReg(reg)}>Edit Full DB</button>
                      <button className="admin-action-btn delete" onClick={() => handleDelete(reg.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Editing Modal - Full DB Access */}
      {editingReg && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-box" style={{ width: '800px', maxWidth: '95vw', padding: '40px' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
              Edit Database Record: <span style={{ color: 'var(--main-color)' }}>{editingReg.event_id}</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>General</h4>
                <div className="form-group">
                  <label>Event Name</label>
                  <input value={editingReg.event_name || ''} onChange={e => handleChangeEdit('event_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>College Name</label>
                  <input value={editingReg.college_name || ''} onChange={e => handleChangeEdit('college_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Team Name</label>
                  <input value={editingReg.team_name || ''} onChange={e => handleChangeEdit('team_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Event ID (Token)</label>
                  <input value={editingReg.event_id || ''} onChange={e => handleChangeEdit('event_id', e.target.value)} />
                </div>
              </div>

              <div>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Team Leader</h4>
                <div className="form-group">
                  <label>Leader Name</label>
                  <input value={editingReg.leader_name || ''} onChange={e => handleChangeEdit('leader_name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Leader Email</label>
                  <input value={editingReg.leader_email || ''} onChange={e => handleChangeEdit('leader_email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Leader Phone</label>
                  <input value={editingReg.leader_phone || ''} onChange={e => handleChangeEdit('leader_phone', e.target.value)} />
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '24px 0' }} />
            
            <h4 style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Additional Members</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              {/* Member 2 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ marginBottom: '12px' }}>Member 2</h5>
                <div className="form-group"><label>Name</label><input value={editingReg.member2_name || ''} onChange={e => handleChangeEdit('member2_name', e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input value={editingReg.member2_email || ''} onChange={e => handleChangeEdit('member2_email', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input value={editingReg.member2_phone || ''} onChange={e => handleChangeEdit('member2_phone', e.target.value)} /></div>
              </div>
              
              {/* Member 3 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ marginBottom: '12px' }}>Member 3</h5>
                <div className="form-group"><label>Name</label><input value={editingReg.member3_name || ''} onChange={e => handleChangeEdit('member3_name', e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input value={editingReg.member3_email || ''} onChange={e => handleChangeEdit('member3_email', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input value={editingReg.member3_phone || ''} onChange={e => handleChangeEdit('member3_phone', e.target.value)} /></div>
              </div>

              {/* Member 4 */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px' }}>
                <h5 style={{ marginBottom: '12px' }}>Member 4</h5>
                <div className="form-group"><label>Name</label><input value={editingReg.member4_name || ''} onChange={e => handleChangeEdit('member4_name', e.target.value)} /></div>
                <div className="form-group"><label>Email</label><input value={editingReg.member4_email || ''} onChange={e => handleChangeEdit('member4_email', e.target.value)} /></div>
                <div className="form-group"><label>Phone</label><input value={editingReg.member4_phone || ''} onChange={e => handleChangeEdit('member4_phone', e.target.value)} /></div>
              </div>
            </div>

            <div className="btn-row" style={{ justifyContent: 'flex-end', marginTop: '32px' }}>
              <button className="btn-back" onClick={() => setEditingReg(null)}>Cancel Edits</button>
              <button className="btn-style-one" onClick={saveEdit}>
                <div className="btn-wrap"><span className="text-one">Save to Database</span><span className="text-two">Save to Database</span></div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
