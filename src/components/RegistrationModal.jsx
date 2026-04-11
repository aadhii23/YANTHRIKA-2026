import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './RegistrationModal.css';
import { ALL_EVENTS } from '../data/events';
import { normalizeCollegeName, COMMON_COLLEGES } from '../utils/collegeNormalizer';
import { isSnpsuCollege, getClosureMessage } from '../utils/snpsuDetector';

/* ─────────────────────────────────────────────────────────────
   Fixed member count per event — no add/remove, exact count only.
   member count = total including leader.
   ───────────────────────────────────────────────────────────── */
const EVENT_MEMBER_COUNT = {
  'Old Roll':                  1,
  'Brainware':                 2,
  'Syntax Wars':               2,
  'Verbal Wars':               2,
  'Byte Build (Software)':     2,
  'Byte Build (Hardware)':     2,
  'Frame & Fame':              2,
  'Venture Verse':             3,
  'Squad Siege (BGMI)':        4,
  'Squad Siege (Free Fire)':   4,
  'Brainy Bunch':              4,
  'Decipher':                  3,
};

function getMemberCount(eventName) {
  // Exact match first
  if (EVENT_MEMBER_COUNT[eventName]) return EVENT_MEMBER_COUNT[eventName];
  // Partial match fallback
  const key = Object.keys(EVENT_MEMBER_COUNT).find(k =>
    eventName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(eventName.toLowerCase())
  );
  return key ? EVENT_MEMBER_COUNT[key] : 1;
}

export default function RegistrationModal({ eventName, onClose }) {
  const totalMembers = getMemberCount(eventName);
  // additional members = everyone except the leader
  const additionalCount = totalMembers - 1;
  const isTeam = totalMembers > 1;

  // Check if this event has registrations hard-closed
  const eventData = ALL_EVENTS.find(e => e.name === eventName);
  const isHardClosed = eventData?.registrationClosed === true;
  const snpsuAllowed = eventData?.snpsuAllowed === true;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [error, setError] = useState('');
  const [eventControl, setEventControl] = useState({ closeForSnpsu: false, closeForAll: false });
  const [isBlocked, setIsBlocked] = useState(isHardClosed);

  const [collegeName, setCollegeName] = useState('');
  const [showOtherCollege, setShowOtherCollege] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [leader, setLeader] = useState({ name: '', email: '', phone: '' });
  // Fixed-size array — exactly additionalCount slots, always
  const [members, setMembers] = useState(
    Array.from({ length: additionalCount }, () => ({ name: '', email: '', phone: '' }))
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';
    if (isHardClosed) {
      setError(`Registrations for ${eventName} are now closed.`);
    } else {
      fetchEventControl();
    }
    return () => { document.body.style.overflow = ''; };
  }, []);

  const fetchEventControl = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return;
      }

      const res = await fetch(`${supabaseUrl}/rest/v1/event_registration_control?event_name=eq.${encodeURIComponent(eventName)}&select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const control = data[0];
          setEventControl({
            closeForSnpsu: control.close_for_snpsu,
            closeForAll: control.close_for_all
          });
          
          // Check if event is closed for all
          if (control.close_for_all) {
            setIsBlocked(true);
            setError(getClosureMessage(true, false, eventName));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch event control:', err);
    }
  };

  const handleLeaderChange = (e) => setLeader({ ...leader, [e.target.name]: e.target.value });
  const handleMemberChange = (idx, field, value) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    setMembers(updated);
  };

  const handleCollegeChange = (value) => {
    setCollegeName(value);
    
    // Hard block: SNPSU students cannot register unless event explicitly allows them
    if (isSnpsuCollege(value) && !snpsuAllowed) {
      setIsBlocked(true);
      setError(`Registrations for ${eventName} are closed for Sapthagiri NPS University students. Students from other colleges can still register.`);
    } else if (eventControl.closeForAll || isHardClosed) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
      setError('');
    }
  };

  const validateStep1 = () => {
    if (!collegeName.trim() || !leader.name.trim() || !leader.email.trim() || !leader.phone.trim()) {
      setError('Please fill in all required fields.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (isTeam && !teamName.trim()) {
      setError('Team name is required.');
      return false;
    }
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim() || !members[i].email.trim() || !members[i].phone.trim()) {
        setError(`Please fill in all details for Member ${i + 2}.`);
        return false;
      }
    }
    setError('');
    return true;
  };

  /**
   * Proceed from step 1 → step 2 (team events) or directly submit (individual).
   */
  const handleStep1Next = async () => {
    if (!validateStep1()) return;
    
    // Final check before proceeding
    if (eventControl.closeForAll || isHardClosed) {
      setError(`Registrations for ${eventName} are now closed.`);
      setIsBlocked(true);
      return;
    }
    
    if (isSnpsuCollege(collegeName) && !snpsuAllowed) {
      setError(`Registrations for ${eventName} are closed for Sapthagiri NPS University students. Students from other colleges can still register.`);
      setIsBlocked(true);
      return;
    }

    if (isTeam) {
      setStep(2);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // Normalize college name before sending
      const normalizedCollege = normalizeCollegeName(collegeName);
      
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          college_name: normalizedCollege,
          team_name: isTeam ? teamName : null,
          leader_name: leader.name,
          leader_email: leader.email,
          leader_phone: leader.phone,
          additional_members: members,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEventId(data.event_id);
        setStep(3);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step labels for indicator
  const totalSteps = isTeam ? 2 : 1;

  return createPortal(
    <div className="registration-modal-overlay">
      <div className="registration-modal-container">
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {step < 3 && (
          <div className="registration-modal-header">
            <h2 className="registration-modal-title">Register for {eventName}</h2>
            <p className="registration-modal-subtitle">
              {totalMembers === 1 ? 'Individual Event' : `Team of ${totalMembers}`}
            </p>
          </div>
        )}

        <div className="registration-modal-body">
          {step < 3 && totalSteps > 1 && (
            <div className="step-indicator">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`step-dot ${step >= i + 1 ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {error && <span className={`error-text ${isBlocked ? 'blocked' : ''}`}>{error}</span>}

          {/* ── STEP 1: College + Leader ── */}
          {step === 1 && (
            <div className="form-step">
              <h4 className="form-step-title">
                {isTeam ? 'College & Team Leader' : 'Your Details'}
              </h4>

              <div className="form-group">
                <label>College / University Name *</label>
                <select
                  value={showOtherCollege ? 'Other' : collegeName}
                  onChange={e => {
                    const value = e.target.value;
                    if (value === 'Other') {
                      setShowOtherCollege(true);
                      setCollegeName('');
                    } else {
                      setShowOtherCollege(false);
                      handleCollegeChange(value);
                    }
                  }}
                  style={{ marginBottom: showOtherCollege ? '12px' : '0' }}
                  disabled={isBlocked}
                >
                  <option value="">Select your college</option>
                  {COMMON_COLLEGES.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
                {showOtherCollege && (
                  <input
                    value={collegeName}
                    onChange={e => handleCollegeChange(e.target.value)}
                    placeholder="Enter your college name"
                    autoFocus
                    disabled={isBlocked}
                  />
                )}
              </div>

              <div className="form-group">
                <label>{isTeam ? 'Leader Full Name *' : 'Full Name *'}</label>
                <input
                  name="name" value={leader.name}
                  onChange={handleLeaderChange}
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group">
                <label>{isTeam ? 'Leader Email *' : 'Email *'}</label>
                <input
                  type="email" name="email" value={leader.email}
                  onChange={handleLeaderChange}
                  placeholder="Email Address"
                />
              </div>
              <div className="form-group">
                <label>{isTeam ? 'Leader Phone *' : 'Phone *'}</label>
                <input
                  type="tel" name="phone" value={leader.phone}
                  onChange={handleLeaderChange}
                  placeholder="Phone Number"
                />
              </div>

              <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn-style-one"
                  onClick={handleStep1Next}
                  disabled={loading || isBlocked}
                >
                  <div className="btn-wrap">
                    <span className="text-one">
                      {loading ? 'Checking...' : isTeam ? 'Team Details →' : 'Complete Registration'}
                    </span>
                    <span className="text-two">
                      {loading ? 'Checking...' : isTeam ? 'Team Details →' : 'Complete Registration'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Team Name + Fixed Members ── */}
          {step === 2 && isTeam && (
            <div className="form-step">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                />
              </div>

              {members.map((member, idx) => (
                <div key={idx} className="member-card">
                  <h5 className="member-card-title">Member {idx + 2} of {totalMembers}</h5>
                  <div className="form-group">
                    <input
                      value={member.name}
                      onChange={e => handleMemberChange(idx, 'name', e.target.value)}
                      placeholder="Full Name *"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="email"
                      value={member.email}
                      onChange={e => handleMemberChange(idx, 'email', e.target.value)}
                      placeholder="Email Address *"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={e => handleMemberChange(idx, 'phone', e.target.value)}
                      placeholder="Phone Number *"
                    />
                  </div>
                </div>
              ))}

              <div className="modal-actions">
                <button className="btn-back" onClick={() => { setError(''); setStep(1); }}>Back</button>
                <button className="btn-style-one" onClick={handleSubmit} disabled={loading || isBlocked}>
                  <div className="btn-wrap">
                    <span className="text-one">{loading ? 'Submitting...' : 'Complete Registration'}</span>
                    <span className="text-two">{loading ? 'Submitting...' : 'Complete Registration'}</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Success ── */}
          {step === 3 && (
            <div className="modal-success">
              <div className="modal-success-icon">✓</div>
              <h3>Registration Successful!</h3>
              <p>
                You're all set for <strong>{eventName}</strong>.<br />
                A confirmation email has been sent to the {isTeam ? 'team leader' : 'registered email'}.
              </p>
              <div className="event-id-box">
                <span>Your Unique Event ID</span>
                <strong>{eventId}</strong>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                Check your inbox (or spam) for your Event ID, WhatsApp group link, and confirmation details.<br /><br />
                We look forward to seeing you at Yanthrika 2026!
              </p>
              <button className="btn-style-two" onClick={onClose} style={{ border: 'none' }}>
                <div className="btn-wrap">
                  <span className="text-one">Close Window</span>
                  <span className="text-two">Close Window</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
