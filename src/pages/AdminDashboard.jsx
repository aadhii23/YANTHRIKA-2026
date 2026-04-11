import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './AdminDashboard.css';
import { normalizeCollegeName, normalizeCollegeAnalytics } from '../utils/collegeNormalizer';

/**
 * List of all available events in YANTHRIKA 2026
 */

const ALL_EVENTS = [
  'Brainware',
  'Verbal Wars',
  'Byte Build (Software)',
  'Byte Build (Hardware)',
  'Venture Verse',
  'Old Roll',
  'Frame & Fame',
  'Brainy Bunch',
  'Syntax Wars',
  'Squad Siege (BGMI)',
  'Squad Siege (Free Fire)',
];

export default function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorObj, setErrorObj] = useState('');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(600);

  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('registrations');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editingReg, setEditingReg] = useState(null);
  const [viewingReg, setViewingReg] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const timerRef = useRef(null);

  const [eventStatuses, setEventStatuses] = useState({});
  const [eventControls, setEventControls] = useState({});
  const [togglingEvent, setTogglingEvent] = useState(null);

  useEffect(() => { checkSession(); }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isAuthenticated) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSessionTimeLeft(600);

      timerRef.current = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 1) { handleLogout(true); return 0; }
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
      const res = await fetch('/api/admin?action=session', { credentials: 'include' });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchRegistrations();
        fetchEventStatuses();
        fetchEventControls();
      }
    } catch (err) {
      console.log('No active session.');
    }
  };

  const handleLogout = async (expired = false) => {
    try {
      await fetch('/api/admin?action=logout', { method: 'POST', credentials: 'include' });
    } catch (err) {}
    setIsAuthenticated(false);
    setRegistrations([]);
    setPassword('');
    setUsername('');
    if (expired) setErrorObj('Session expired due to inactivity. Please log in again.');
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorObj('');
    try {
      const res = await fetch('/api/admin?action=get-registrations', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to fetch registrations');
      }
      const data = await res.json();
      setRegistrations(data || []);
      setIsAuthenticated(true);
    } catch (err) {
      setErrorObj(err.message || 'Failed to load registrations');
      setIsAuthenticated(false);
      // Show toast notification
      console.error('Registration fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStatuses = async () => {
    try {
      const res = await fetch('/api/admin?action=get-event-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEventStatuses(data);
      }
    } catch (err) {
      console.error('Failed to fetch event statuses:', err);
    }
  };

  const fetchEventControls = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return;
      }

      const res = await fetch(`${supabaseUrl}/rest/v1/event_registration_control?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const controlsMap = {};
        data.forEach(control => {
          controlsMap[control.event_name] = {
            closeForSnpsu: control.close_for_snpsu,
            closeForAll: control.close_for_all
          };
        });
        setEventControls(controlsMap);
      }
    } catch (err) {
      console.error('Failed to fetch event controls:', err);
    }
  };

  const isEventOpen = (eventName) => {
    if (eventStatuses[eventName] === undefined) return true;
    return eventStatuses[eventName];
  };

  const handleToggleEvent = async (eventName) => {
    const newState = !isEventOpen(eventName);
    setTogglingEvent(eventName);
    try {
      const res = await fetch('/api/admin?action=toggle-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ event_name: eventName, is_open: newState }),
      });
      if (res.ok) {
        setEventStatuses(prev => ({ ...prev, [eventName]: newState }));
      } else {
        alert('Failed to update event status.');
      }
    } catch (err) {
      alert('Error updating event status: ' + err.message);
    } finally {
      setTogglingEvent(null);
    }
  };

  const handleToggleSnpsuClosure = async (eventName) => {
    const currentControl = eventControls[eventName] || { closeForSnpsu: false, closeForAll: false };
    const newState = !currentControl.closeForSnpsu;
    
    setTogglingEvent(eventName + '-snpsu');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/rest/v1/event_registration_control?event_name=eq.${encodeURIComponent(eventName)}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ close_for_snpsu: newState })
      });

      if (res.ok) {
        setEventControls(prev => ({
          ...prev,
          [eventName]: { ...prev[eventName], closeForSnpsu: newState }
        }));
      } else {
        alert('Failed to update SNPSU closure status.');
      }
    } catch (err) {
      alert('Error updating SNPSU closure: ' + err.message);
    } finally {
      setTogglingEvent(null);
    }
  };

  const handleToggleAllClosure = async (eventName) => {
    const currentControl = eventControls[eventName] || { closeForSnpsu: false, closeForAll: false };
    const newState = !currentControl.closeForAll;
    
    setTogglingEvent(eventName + '-all');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/rest/v1/event_registration_control?event_name=eq.${encodeURIComponent(eventName)}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ close_for_all: newState })
      });

      if (res.ok) {
        setEventControls(prev => ({
          ...prev,
          [eventName]: { ...prev[eventName], closeForAll: newState }
        }));
      } else {
        alert('Failed to update global closure status.');
      }
    } catch (err) {
      alert('Error updating global closure: ' + err.message);
    } finally {
      setTogglingEvent(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorObj('');
    try {
      const res = await fetch('/api/admin?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchRegistrations();
        fetchEventStatuses();
        fetchEventControls();
      } else {
        setErrorObj(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setErrorObj('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration completely?')) return;
    
    try {
      const res = await fetch('/api/admin?action=delete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete registration');
      }
      
      setRegistrations(prev => prev.filter(r => r.id !== id));
      alert('Registration deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete registration: ' + err.message);
    }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch('/api/admin?action=update-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editingReg),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update registration');
      }
      
      setRegistrations(prev => prev.map(r => r.id === editingReg.id ? editingReg : r));
      setEditingReg(null);
      alert('Registration updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update registration: ' + err.message);
    }
  };

  const handleChangeEdit = (field, value) => {
    setEditingReg(prev => ({ ...prev, [field]: value }));
  };

  const filteredData = useMemo(() => {
    let filtered = registrations.filter(r => {
      // Search across multiple fields using debounced search
      const matchesSearch = !debouncedSearch || 
        (r.team_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.leader_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.event_id || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.leader_email || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.college_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (r.event_name || '').toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesEvent = filterEvent ? r.event_name === filterEvent : true;
      
      return matchesSearch && matchesEvent;
    });

    // Sort filtered results
    if (sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'event') {
      filtered.sort((a, b) => (a.event_name || '').localeCompare(b.event_name || ''));
    } else if (sortBy === 'college') {
      filtered.sort((a, b) => (a.college_name || '').localeCompare(b.college_name || ''));
    }

    return filtered;
  }, [registrations, debouncedSearch, filterEvent, sortBy]);

  const eventOptions = useMemo(() => {
    return [...new Set(registrations.map(r => r.event_name).filter(Boolean))].sort();
  }, [registrations]);

  const analytics = useMemo(() => {
    const eventCounts = {};
    const normalizedCollegeCounts = normalizeCollegeAnalytics(registrations);
    
    const snpsuCount = registrations.filter(r => {
      const normalized = normalizeCollegeName(r.college_name);
      return normalized === 'Sapthagiri NPS University';
    }).length;
    
    registrations.forEach(r => {
      eventCounts[r.event_name] = (eventCounts[r.event_name] || 0) + 1;
    });

    const topEvents = Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const topColleges = Object.entries(normalizedCollegeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { eventCounts, collegeCounts: normalizedCollegeCounts, topEvents, topColleges, snpsuCount };
  }, [registrations]);

  const exportCSV = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL registrations directly from database (not filtered)
      const res = await fetch('/api/admin?action=get-registrations', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch data from database');
      }
      const allData = await res.json();
      
      if (!allData || !allData.length) {
        alert('No data available in database to export.');
        return;
      }
      
      // Define proper column order matching database schema
      const columnOrder = [
        'id', 'event_id', 'event_name', 'college_name', 'team_name',
        'leader_name', 'leader_email', 'leader_phone',
        'member2_name', 'member2_email', 'member2_phone',
        'member3_name', 'member3_email', 'member3_phone',
        'member4_name', 'member4_email', 'member4_phone',
        'created_at'
      ];
      
      const headerLabels = {
        'id': 'ID',
        'event_id': 'Event ID',
        'event_name': 'Event Name',
        'college_name': 'College',
        'team_name': 'Team Name',
        'leader_name': 'Leader Name',
        'leader_email': 'Leader Email',
        'leader_phone': 'Leader Phone',
        'member2_name': 'Member 2 Name',
        'member2_email': 'Member 2 Email',
        'member2_phone': 'Member 2 Phone',
        'member3_name': 'Member 3 Name',
        'member3_email': 'Member 3 Email',
        'member3_phone': 'Member 3 Phone',
        'member4_name': 'Member 4 Name',
        'member4_email': 'Member 4 Email',
        'member4_phone': 'Member 4 Phone',
        'created_at': 'Registration Date'
      };
      
      const escapeCSV = (str) => {
        if (str === null || str === undefined) return '';
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };
      
      // Create header row with labels
      const headerRow = columnOrder.map(col => headerLabels[col] || col).join(',');
      const csvRows = ['\uFEFF' + headerRow];
      
      // Add all data rows from database
      allData.forEach(r => {
        const row = columnOrder.map(col => {
          let val = r[col];
          if (col === 'created_at' && val) {
            val = new Date(val).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          }
          return escapeCSV(val);
        }).join(',');
        csvRows.push(row);
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.href = url;
      link.setAttribute('download', `YANTHRIKA_All_Registrations_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      console.log(`✅ Exported ${allData.length} total registrations from database`);
      
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="login-container">
          <div className="login-logo">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="12" fill="url(#gradient)" />
              <path d="M30 15L45 25V40L30 50L15 40V25L30 15Z" stroke="white" strokeWidth="2" fill="none" />
              <circle cx="30" cy="30" r="5" fill="white" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="60" y2="60">
                  <stop offset="0%" stopColor="var(--main-color)" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2>Admin Portal</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px', fontSize: '0.9rem' }}>
            Secure access to registration management
          </p>
          {errorObj && <div className="error-banner">{errorObj}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="Enter username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                autoFocus 
                className="login-input" 
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="login-input" 
              />
            </div>
            <button type="submit" className="btn-style-one" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              <div className="btn-wrap">
                <span className="text-one">{loading ? 'Authenticating...' : 'Sign In'}</span>
                <span className="text-two">{loading ? 'Authenticating...' : 'Sign In'}</span>
              </div>
            </button>
          </form>
          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secured with JWT Authentication
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Mobile Hamburger Button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>YANTHRIKA</h3>
          <p>Admin Panel</p>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('registrations'); setSidebarOpen(false); }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            <span>Registrations</span>
            <span className="nav-badge">{registrations.length}</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </span>
            <span>Analytics</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => { setActiveTab('events'); setSidebarOpen(false); }}
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
            <span>Event Control</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className={`session-timer-sidebar ${sessionTimeLeft < 60 ? 'danger' : ''}`}>
            <span className="timer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </span>
            <div>
              <div className="timer-label">Session</div>
              <div className="timer-value">{formatTime(sessionTimeLeft)}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={() => handleLogout(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="admin-main-content">
        <div className="admin-topbar">
          <h1>
            {activeTab === 'registrations' && 'Registration Management'}
            {activeTab === 'analytics' && 'Analytics Dashboard'}
            {activeTab === 'events' && 'Event Controls'}
          </h1>
          <div className="topbar-actions">
            {activeTab === 'registrations' && (
              <>
                <button 
                  className={`icon-btn refresh-btn ${loading ? 'loading' : ''}`} 
                  onMouseDown={(e) => { e.preventDefault(); if (!loading) fetchRegistrations(); }}
                  onClick={(e) => { e.preventDefault(); if (!loading) fetchRegistrations(); }}
                  title="Refresh Data"
                  disabled={loading}
                  type="button"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                </button>
                <button 
                  className="icon-btn export-btn" 
                  onMouseDown={(e) => { e.preventDefault(); if (!loading && !isExporting) exportCSV(); }}
                  onClick={(e) => { e.preventDefault(); if (!loading && !isExporting) exportCSV(); }}
                  title="Export to CSV"
                  disabled={loading || isExporting}
                  type="button"
                >
                  {isExporting ? (
                    <svg className="spin-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {activeTab === 'registrations' && (
          <div className="content-section">
            {errorObj && (
              <div className="error-banner" style={{ marginBottom: '20px' }}>
                {errorObj}
              </div>
            )}
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.6)' }}>
                Loading registrations...
              </div>
            )}
            
            {!loading && (
              <>
                <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{registrations.length}</div>
                  <div className="stat-label">Total Registrations</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{filteredData.length}</div>
                  <div className="stat-label">Filtered Results</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{eventOptions.length}</div>
                  <div className="stat-label">Active Events</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{analytics.snpsuCount}</div>
                  <div className="stat-label">SNPSU Registrations</div>
                </div>
              </div>
            </div>

            <div className="filters-section">
              <div className="filter-group">
                <input 
                  type="text" 
                  className="filter-input" 
                  placeholder="🔍 Search by name, email, college, or ID..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <div className="filter-row">
                <select className="filter-select" value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
                  <option value="">All Events</option>
                  {eventOptions.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="event">Sort by Event</option>
                </select>
                <div className="view-toggle">
                  <button 
                    className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    📋
                  </button>
                  <button 
                    className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => setViewMode('cards')}
                    title="Card View"
                  >
                    🎴
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'table' ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Event</th>
                      <th>College</th>
                      <th>Team Name</th>
                      <th>Leader</th>
                      <th>Contact</th>
                      <th>Team Size</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(reg => {
                      const teamSize = 1 + !!reg.member2_name + !!reg.member3_name + !!reg.member4_name;
                      return (
                        <tr key={reg.id}>
                          <td><span className="event-id-badge">{reg.event_id}</span></td>
                          <td><strong>{reg.event_name}</strong></td>
                          <td>{reg.college_name}</td>
                          <td>{reg.team_name || '-'}</td>
                          <td>
                            <div className="leader-info">
                              <div>{reg.leader_name}</div>
                              <div className="leader-email">{reg.leader_email}</div>
                            </div>
                          </td>
                          <td>{reg.leader_phone}</td>
                          <td><span className="team-size-badge">{teamSize}</span></td>
                          <td>
                            <div className="date-info">
                              <div>{new Date(reg.created_at).toLocaleDateString()}</div>
                              <div className="time-info">{new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn view" onClick={() => setViewingReg(reg)} title="View Details">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                              <button className="action-btn edit" onClick={() => setEditingReg(reg)} title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button className="action-btn delete" onClick={() => handleDelete(reg.id)} title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredData.length === 0 && (
                      <tr><td colSpan="9" className="no-data">No registrations found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredData.map(reg => {
                  const teamSize = 1 + !!reg.member2_name + !!reg.member3_name + !!reg.member4_name;
                  return (
                    <div key={reg.id} className="reg-card">
                      <div className="card-header">
                        <span className="event-id-badge">{reg.event_id}</span>
                        <div className="card-actions">
                          <button className="action-btn view" onClick={() => setViewingReg(reg)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button className="action-btn edit" onClick={() => setEditingReg(reg)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button className="action-btn delete" onClick={() => handleDelete(reg.id)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="card-event">{reg.event_name}</h3>
                      <div className="card-detail">
                        <span className="detail-label">College:</span>
                        <span>{reg.college_name}</span>
                      </div>
                      {reg.team_name && (
                        <div className="card-detail">
                          <span className="detail-label">Team:</span>
                          <span>{reg.team_name}</span>
                        </div>
                      )}
                      <div className="card-detail">
                        <span className="detail-label">Leader:</span>
                        <span>{reg.leader_name}</span>
                      </div>
                      <div className="card-detail">
                        <span className="detail-label">Email:</span>
                        <span className="detail-email">{reg.leader_email}</span>
                      </div>
                      <div className="card-detail">
                        <span className="detail-label">Phone:</span>
                        <span>{reg.leader_phone}</span>
                      </div>
                      <div className="card-footer">
                        <span className="team-size-badge">{teamSize} Members</span>
                        <span className="date-badge">{new Date(reg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
                {filteredData.length === 0 && (
                  <div className="no-data-card">No registrations found</div>
                )}
              </div>
            )}
              </>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="content-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Top 5 Events by Registrations</h3>
                <div className="chart-container">
                  {analytics.topEvents.map(([event, count], idx) => (
                    <div key={event} className="chart-bar-item">
                      <div className="chart-label">
                        <span className="rank-badge">#{idx + 1}</span>
                        <span>{event}</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div 
                          className="chart-bar" 
                          style={{ 
                            width: `${(count / analytics.topEvents[0][1]) * 100}%`,
                            background: `linear-gradient(90deg, var(--main-color), #6366f1)`
                          }}
                        >
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Top 5 Colleges by Registrations</h3>
                <div className="chart-container">
                  {analytics.topColleges.map(([college, count], idx) => (
                    <div key={college} className="chart-bar-item">
                      <div className="chart-label">
                        <span className="rank-badge">#{idx + 1}</span>
                        <span className="college-name">{college}</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <div 
                          className="chart-bar" 
                          style={{ 
                            width: `${(count / analytics.topColleges[0][1]) * 100}%`,
                            background: `linear-gradient(90deg, #f093fb, #f5576c)`
                          }}
                        >
                          <span className="bar-value">{count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Registration Distribution</h3>
                <div className="distribution-stats">
                  <div className="dist-item">
                    <div className="dist-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="dist-content">
                      <div className="dist-value">{Object.keys(analytics.eventCounts).length}</div>
                      <div className="dist-label">Events with Registrations</div>
                    </div>
                  </div>
                  <div className="dist-item">
                    <div className="dist-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <div className="dist-content">
                      <div className="dist-value">{Object.keys(analytics.collegeCounts).length}</div>
                      <div className="dist-label">Participating Colleges</div>
                    </div>
                  </div>
                  <div className="dist-item">
                    <div className="dist-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                    </div>
                    <div className="dist-content">
                      <div className="dist-value">{(registrations.length / Object.keys(analytics.eventCounts).length).toFixed(1)}</div>
                      <div className="dist-label">Avg per Event</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Event Breakdown</h3>
                <div className="event-breakdown-list">
                  {Object.entries(analytics.eventCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([event, count]) => (
                      <div key={event} className="breakdown-item">
                        <span className="breakdown-event">{event}</span>
                        <span className="breakdown-count">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="content-section">
            <div className="event-controls-header">
              <p>Manage event registration availability with two-level control: Close for SNPSU only or Close for all colleges.</p>
              <button className="btn-style-one" onClick={() => { fetchEventStatuses(); fetchEventControls(); }} style={{ padding: '0 20px' }}>
                <div className="btn-wrap">
                  <span className="text-one">Sync Status</span>
                  <span className="text-two">Sync Status</span>
                </div>
              </button>
            </div>

            <div className="event-controls-grid">
              {ALL_EVENTS.map(eventName => {
                const open = isEventOpen(eventName);
                const isToggling = togglingEvent === eventName;
                const isTogglingSnpsu = togglingEvent === eventName + '-snpsu';
                const isTogglingAll = togglingEvent === eventName + '-all';
                const regCount = analytics.eventCounts[eventName] || 0;
                const control = eventControls[eventName] || { closeForSnpsu: false, closeForAll: false };
                
                // Determine status
                let statusText = 'Open for Registration';
                let statusClass = 'open';
                if (control.closeForAll) {
                  statusText = 'Closed for All';
                  statusClass = 'closed-all';
                } else if (control.closeForSnpsu) {
                  statusText = 'Closed for SNPSU';
                  statusClass = 'closed-snpsu';
                }
                
                return (
                  <div key={eventName} className={`event-control-card ${statusClass}`}>
                    <div className="event-control-header">
                      <div>
                        <h4>{eventName}</h4>
                        <div className="event-status-badge">
                          <span className={`status-dot ${statusClass}`} />
                          {statusText}
                        </div>
                      </div>
                    </div>
                    <div className="event-control-stats">
                      <div className="control-stat">
                        <span className="control-stat-label">Total Registrations</span>
                        <span className="control-stat-value">{regCount}</span>
                      </div>
                    </div>
                    <div className="event-control-actions">
                      <button
                        disabled={isTogglingSnpsu || control.closeForAll}
                        onClick={() => handleToggleSnpsuClosure(eventName)}
                        className={`control-action-btn ${control.closeForSnpsu ? 'active' : ''}`}
                        title={control.closeForAll ? 'Cannot toggle - Event closed for all' : control.closeForSnpsu ? 'Open for SNPSU' : 'Close for SNPSU'}
                      >
                        {isTogglingSnpsu ? (
                          <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                          </svg>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                              <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <span>{control.closeForSnpsu ? 'Open SNPSU' : 'Close SNPSU'}</span>
                          </>
                        )}
                      </button>
                      <button
                        disabled={isTogglingAll}
                        onClick={() => handleToggleAllClosure(eventName)}
                        className={`control-action-btn ${control.closeForAll ? 'active danger' : ''}`}
                        title={control.closeForAll ? 'Open for all colleges' : 'Close for all colleges'}
                      >
                        {isTogglingAll ? (
                          <svg className="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                          </svg>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                            </svg>
                            <span>{control.closeForAll ? 'Open ALL' : 'Close ALL'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {viewingReg && (
        <div className="modal-overlay" onClick={() => setViewingReg(null)}>
          <div className="modal-box view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registration Details</h3>
              <button className="close-btn" onClick={() => setViewingReg(null)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="detail-section">
                <h4>Event Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Event ID</span>
                    <span className="detail-value event-id-badge">{viewingReg.event_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Event Name</span>
                    <span className="detail-value">{viewingReg.event_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">College</span>
                    <span className="detail-value">{viewingReg.college_name}</span>
                  </div>
                  {viewingReg.team_name && (
                    <div className="detail-item">
                      <span className="detail-label">Team Name</span>
                      <span className="detail-value">{viewingReg.team_name}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Registration Date</span>
                    <span className="detail-value">{new Date(viewingReg.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Team Leader</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">{viewingReg.leader_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{viewingReg.leader_email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{viewingReg.leader_phone}</span>
                  </div>
                </div>
              </div>

              {(viewingReg.member2_name || viewingReg.member3_name || viewingReg.member4_name) && (
                <div className="detail-section">
                  <h4>Team Members</h4>
                  {[2, 3, 4].map(n => {
                    if (!viewingReg[`member${n}_name`]) return null;
                    return (
                      <div key={n} className="member-card">
                        <h5>Member {n}</h5>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="detail-label">Name</span>
                            <span className="detail-value">{viewingReg[`member${n}_name`]}</span>
                          </div>
                          {viewingReg[`member${n}_email`] && (
                            <div className="detail-item">
                              <span className="detail-label">Email</span>
                              <span className="detail-value">{viewingReg[`member${n}_email`]}</span>
                            </div>
                          )}
                          {viewingReg[`member${n}_phone`] && (
                            <div className="detail-item">
                              <span className="detail-label">Phone</span>
                              <span className="detail-value">{viewingReg[`member${n}_phone`]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setViewingReg(null)}>Close</button>
              <button className="btn-style-one" onClick={() => { setEditingReg(viewingReg); setViewingReg(null); }}>
                <div className="btn-wrap">
                  <span className="text-one">Edit Record</span>
                  <span className="text-two">Edit Record</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {editingReg && (
        <div className="modal-overlay" onClick={() => setEditingReg(null)}>
          <div className="modal-box edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Registration</h3>
              <button className="close-btn" onClick={() => setEditingReg(null)}>✕</button>
            </div>
            <div className="modal-content">
              <div className="form-section">
                <h4>Event Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Event Name</label>
                    <select value={editingReg.event_name || ''} onChange={e => handleChangeEdit('event_name', e.target.value)}>
                      {ALL_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Event ID</label>
                    <input value={editingReg.event_id || ''} onChange={e => handleChangeEdit('event_id', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>College Name</label>
                    <input value={editingReg.college_name || ''} onChange={e => handleChangeEdit('college_name', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>Team Name</label>
                    <input value={editingReg.team_name || ''} onChange={e => handleChangeEdit('team_name', e.target.value)} placeholder="Optional" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Team Leader</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input value={editingReg.leader_name || ''} onChange={e => handleChangeEdit('leader_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input value={editingReg.leader_phone || ''} onChange={e => handleChangeEdit('leader_phone', e.target.value)} />
                  </div>
                  <div className="form-group full-width">
                    <label>Email</label>
                    <input type="email" value={editingReg.leader_email || ''} onChange={e => handleChangeEdit('leader_email', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Team Members</h4>
                {[2, 3, 4].map(n => (
                  <div key={n} className="member-form-card">
                    <h5>Member {n} (Optional)</h5>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Name</label>
                        <input value={editingReg[`member${n}_name`] || ''} onChange={e => handleChangeEdit(`member${n}_name`, e.target.value)} placeholder="Optional" />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input value={editingReg[`member${n}_phone`] || ''} onChange={e => handleChangeEdit(`member${n}_phone`, e.target.value)} placeholder="Optional" />
                      </div>
                      <div className="form-group full-width">
                        <label>Email</label>
                        <input type="email" value={editingReg[`member${n}_email`] || ''} onChange={e => handleChangeEdit(`member${n}_email`, e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingReg(null)}>Cancel</button>
              <button className="btn-style-one" onClick={saveEdit}>
                <div className="btn-wrap">
                  <span className="text-one">Save Changes</span>
                  <span className="text-two">Save Changes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
