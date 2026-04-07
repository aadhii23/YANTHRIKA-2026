import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './RegistrationModal.css';

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

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState('');
  const [error, setError] = useState('');

  const [collegeName, setCollegeName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [leader, setLeader] = useState({ name: '', email: '', phone: '' });
  // Fixed-size array — exactly additionalCount slots, always
  const [members, setMembers] = useState(
    Array.from({ length: additionalCount }, () => ({ name: '', email: '', phone: '' }))
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLeaderChange = (e) => setLeader({ ...leader, [e.target.name]: e.target.value });
  const handleMemberChange = (idx, field, value) => {
    const updated = [...members];
    updated[idx] = { ...updated[idx], [field]: value };
    setMembers(updated);
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

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          college_name: collegeName,
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

          {error && <span className="error-text">{error}</span>}

          {/* ── STEP 1: College + Leader ── */}
          {step === 1 && (
            <div className="form-step">
              <h4 className="form-step-title">
                {isTeam ? 'College & Team Leader' : 'Your Details'}
              </h4>

              <div className="form-group">
                <label>College / University Name *</label>
                <input
                  value={collegeName}
                  onChange={e => setCollegeName(e.target.value)}
                  placeholder="Enter your college name"
                />
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
                {isTeam ? (
                  <button className="btn-style-one" onClick={() => { if (validateStep1()) setStep(2); }}>
                    <div className="btn-wrap">
                      <span className="text-one">Team Details &rarr;</span>
                      <span className="text-two">Team Details &rarr;</span>
                    </div>
                  </button>
                ) : (
                  <button className="btn-style-one" onClick={() => { if (validateStep1()) handleSubmit(); }} disabled={loading}>
                    <div className="btn-wrap">
                      <span className="text-one">{loading ? 'Submitting...' : 'Complete Registration'}</span>
                      <span className="text-two">{loading ? 'Submitting...' : 'Complete Registration'}</span>
                    </div>
                  </button>
                )}
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
                <button className="btn-style-one" onClick={handleSubmit} disabled={loading}>
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
