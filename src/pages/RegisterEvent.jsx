import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './InnerPage.css';
import { ALL_EVENTS } from '../data/events';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLQaVq2hlf_l-wsivMU26Tm6R3ToHlMCO7vYLvW3mA1tcPBscBtm8JIHOWJqRdUKK_/exec';

const FORMS = {
  'old-roll': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScoZIRnrdFXxN8sY0UF3bd-CUfJJyW4UN5bR2JzVLtnODa4NQ/formResponse',
    f: { college:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1962413621', leaderPhone:'entry.913795825' },
  },
  'syntax-wars': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdbnfluXL_3HtJvMGqdweZBYsZDlQDdr4r364z3gSqRU8K_Yg/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1273111505', leaderEmail:'entry.686138351', leaderPhone:'entry.491958267', member2Name:'entry.1962413621', member2Email:'entry.1602789966', member2Phone:'entry.1562713426' },
  },
  'verbal-wars': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdBnuAgoNqmsATLsvyGumzSOKrXFTP3R3-Lj2HA7BrSVod7GA/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1273111505', leaderEmail:'entry.686138351', leaderPhone:'entry.491958267', member2Name:'entry.1962413621', member2Email:'entry.671394127', member2Phone:'entry.90471058' },
  },
  'brainware': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeLhQLKK4xBT5AN8mTzzu_nHpcVPv10FoTGjmvryJWI5p860g/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1273111505', leaderEmail:'entry.686138351', leaderPhone:'entry.491958267', member2Name:'entry.1962413621', member2Email:'entry.574874117', member2Phone:'entry.1565094205' },
  },
  'byte-build-sw': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScZBE1omgmOB6s3d4cnS3zViS-vlXBF7rTthVzoibcx76RvBA/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1962413621', member2Phone:'entry.373209964' },
  },
  'byte-build-hw': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeMpxCe_g5nehU34JiQXG7a1auYdMWf01zZ7mNl8SPkwB9vCA/formResponse',
    f: { college:'entry.1353816731', teamName:'entry.115037846', leaderName:'entry.816823511', leaderEmail:'entry.1332142200', leaderPhone:'entry.469418177', member2Name:'entry.221907826', member2Email:'entry.1373804212', member2Phone:'entry.657479789' },
  },
  'vlogging': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfGbJdOy_cqIbPcUNjE5kt1IGBg75nI4ubJl3oG07oi8Rd-pw/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1962413621', member2Phone:'entry.2144296463' },
  },
  'venture-verse': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScbeynRXupd1JZw3NxMnGu7oKQF77J5tMHJ9bvH-tnNIUWqUA/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1211611053', member2Phone:'entry.868840516', member3Name:'entry.49339764', member3Email:'entry.1962413621', member3Phone:'entry.1497552059' },
  },
  'squad-siege': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc_ndMVmRcgs8sk7OhwUPt7F9TvJdp7qSgvNrlEasnLmsERmw/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1211611053', member2Phone:'entry.868840516', member3Name:'entry.49339764', member3Email:'entry.225167225', member3Phone:'entry.145861267', member4Name:'entry.2138743259', member4Email:'entry.1962413621', member4Phone:'entry.313246885' },
  },
  'squad-siege-fire': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd8aeq7RzZ14fdB8zB9kUsolvNDUrbnqK2_kBS566wFIpc4wQ/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1211611053', member2Phone:'entry.868840516', member3Name:'entry.49339764', member3Email:'entry.225167225', member3Phone:'entry.145861267', member4Name:'entry.2138743259', member4Email:'entry.1962413621', member4Phone:'entry.1414820483' },
  },
  'brainy-bunch': {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSeRXCOqnJjUJUsLKaFQ3OEhjAa4s9k5t14mNWA7n8CWv00AbQ/formResponse',
    f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1273111505', leaderPhone:'entry.686138351', member2Name:'entry.491958267', member2Email:'entry.1211611053', member2Phone:'entry.868840516', member3Name:'entry.49339764', member3Email:'entry.348675986', member3Phone:'entry.1100481065', member4Name:'entry.577991750', member4Email:'entry.1962413621', member4Phone:'entry.243748604' },
  },
};

/* ── Derive team size from event.teamSize string ── */
function getMemberCount(teamSize = '') {
  if (!teamSize) return 1;
  const s = teamSize.toLowerCase();
  if (s.includes('individual') || s.includes('1 ')) return 1;
  if (s.includes('squad of 4') || s.includes('team of 4')) return 4;
  if (s.includes('team of 3') || s.includes('3 member')) return 3;
  if (s.includes('team of 2') || s.includes('squad of 2') || s.includes('2 member')) return 2;
  const m = s.match(/(\d)/);
  return m ? parseInt(m[1], 10) : 1;
}

/* ── Reusable field ── */
function Field({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span className="req-star"> *</span>}</label>
      {children}
      {error && <span className="field-err">⚠ {error}</span>}
    </div>
  );
}

/* ── Text / email / tel input ── */
function Input({ type = 'text', value, onChange, placeholder, hasError }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={hasError ? 'err' : ''}
      autoComplete="off"
    />
  );
}

/* ── Member block ── */
function MemberBlock({ title, prefix, data, onChange, errors, accent }) {
  return (
    <div className={`member-block${accent ? ' member-block--leader' : ''}`}>
      <div className="member-block-header">
        {accent && <span className="member-leader-badge">TEAM LEADER</span>}
        <h4 className="member-block-title">{title}</h4>
      </div>
      <div className="form-row">
        <Field label="Full Name" required error={errors[`${prefix}Name`]}>
          <Input
            value={data.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Full name"
            hasError={!!errors[`${prefix}Name`]}
          />
        </Field>
        <Field label="Email Address" required error={errors[`${prefix}Email`]}>
          <Input
            type="email"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="email@college.edu"
            hasError={!!errors[`${prefix}Email`]}
          />
        </Field>
      </div>
      <div className="form-row">
        <Field label="Phone Number" required error={errors[`${prefix}Phone`]}>
          <Input
            type="tel"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            hasError={!!errors[`${prefix}Phone`]}
          />
        </Field>
        <div className="form-group" />
      </div>
    </div>
  );
}

/* ================================================================ */
export default function RegisterEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const event = ALL_EVENTS.find(e => e.slug === slug);
  const memberCount = event ? getMemberCount(event.teamSize) : 1;
  const isTeam = memberCount > 1;

  /* ── State ── */
  const [college,   setCollege]   = useState('');
  const [teamName,  setTeamName]  = useState('');
  const [leader,    setLeader]    = useState({ name: '', email: '', phone: '' });
  const [member2,   setMember2]   = useState({ name: '', email: '', phone: '' });
  const [member3,   setMember3]   = useState({ name: '', email: '', phone: '' });
  const [member4,   setMember4]   = useState({ name: '', email: '', phone: '' });
  const [errors,    setErrors]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!event) return (
    <div style={{ padding:'200px 0', textAlign:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.4)', fontFamily:'var(--font-heading)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:24 }}>Event not found.</p>
      <button className="btn-style-two" onClick={() => navigate('/events/technical')}>
        <div className="btn-wrap"><span className="text-one">Back to Events</span><span className="text-two">Back to Events</span></div>
      </button>
    </div>
  );

  /* ── Validation ── */
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRx = /^\+?[\d\s\-]{10,}$/;

  const validateMember = (m, prefix, errs) => {
    if (!m.name.trim())       errs[`${prefix}Name`]  = 'Name is required';
    if (!emailRx.test(m.email)) errs[`${prefix}Email`] = 'Valid email required';
    if (!phoneRx.test(m.phone)) errs[`${prefix}Phone`] = 'Valid phone number required';
  };

  const validate = () => {
    const errs = {};
    if (!college.trim()) errs.college = 'College name is required';
    if (isTeam && !teamName.trim()) errs.teamName = 'Team name is required';
    validateMember(leader, 'leader', errs);
    if (memberCount >= 2) validateMember(member2, 'member2', errs);
    if (memberCount >= 3) validateMember(member3, 'member3', errs);
    if (memberCount >= 4) validateMember(member4, 'member4', errs);
    return errs;
  };

  /* ── Submit (Rebuilt with native iframe proxy to bypass CORS) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTimeout(() => {
        const el = document.querySelector('.err, .field-err');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setErrors({});
    setLoading(true);

    const config = FORMS[slug];

    if (!config) {
      alert('Registration unavailable for this event. Please contact the organizers directly.');
      setLoading(false);
      return;
    }

    // Generate unique names for this submission cycle
    const iframeName = 'gf_iframe_' + Date.now();
    
    // Create the hidden iframe
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.id = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create the hidden form linked to the iframe target
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = config.url;
    form.target = iframeName;
    form.style.display = 'none';

    // Helper to add hidden inputs for each Google Form entry ID
    const addInput = (name, value) => {
      if (!name) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value || '';
      form.appendChild(input);
    };

    // Populate data based on Google Form config
    addInput(config.f.college, college);
    if (isTeam) addInput(config.f.teamName, teamName);

    addInput(config.f.leaderName, leader.name);
    addInput(config.f.leaderEmail, leader.email);
    addInput(config.f.leaderPhone, leader.phone);

    if (memberCount >= 2) {
      addInput(config.f.member2Name, member2.name);
      addInput(config.f.member2Email, member2.email);
      addInput(config.f.member2Phone, member2.phone);
    }
    if (memberCount >= 3) {
      addInput(config.f.member3Name, member3.name);
      addInput(config.f.member3Email, member3.email);
      addInput(config.f.member3Phone, member3.phone);
    }
    if (memberCount >= 4) {
      addInput(config.f.member4Name, member4.name);
      addInput(config.f.member4Email, member4.email);
      addInput(config.f.member4Phone, member4.phone);
    }

    document.body.appendChild(form);

    // Track submission state to avoid firing on initial empty iframe load
    let isSubmitted = false;

    // Listen for the iframe loading Google's response page
    iframe.onload = () => {
      if (!isSubmitted) return; // Ignore the very first time the empty iframe loads

      setLoading(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clean up the DOM to prevent memory leaks
      setTimeout(() => {
        try { document.body.removeChild(form); } catch(e) {}
        try { document.body.removeChild(iframe); } catch(e) {}
      }, 2000);
    };

    // Execute the POST request
    try {
      isSubmitted = true;
      form.submit();
      
      // Secondary backup: POST to App Script if you still use it for emails
      if (config.scriptUrl) {
        const formData = new FormData(form);
        fetch(config.scriptUrl, { method: 'POST', mode: 'no-cors', body: formData }).catch(()=>{});
      }
    } catch (error) {
      setLoading(false);
      alert('Network error. Please try again.');
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="page-wrapper">
        <section style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <div className="reg-success-box" style={{ opacity: 1, transform: 'none' }}>
            <div className="reg-success-icon">✓</div>
            <h2 className="reg-success-title">You're Registered!</h2>
            <p className="reg-success-sub">
              {isTeam
                ? <>Team <strong>{teamName}</strong> has been registered for <strong>{event.name}</strong>.</>
                : <><strong>{leader.name}</strong> has been registered for <strong>{event.name}</strong>.</>
              }
            </p>
            <p className="reg-success-note">
              ✅ Data successfully secured.<br />
              Please check your spam folder if confirmation email is not received within 5 mins.<br />
              Report to the venue 15 mins early.
            </p>
            <div className="reg-success-actions">
              <Link to={`/events/${event.slug}`} className="btn-style-two">
                <div className="btn-wrap"><span className="text-one">Back to Event</span><span className="text-two">Back to Event</span></div>
              </Link>
              <Link to="/" className="btn-style-one">
                <div className="btn-wrap"><span className="text-one">Home</span><span className="text-two">Home</span></div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const backPath = event.category === 'Technical' ? '/events/technical' : '/events/non-technical';

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Register — <span>{event.name}</span></h2>
          <div className="breadcrumb-nav">
            <Link to="/">Home</Link><span className="sep">/</span>
            <Link to={backPath}>Events</Link><span className="sep">/</span>
            {event.name}
          </div>
        </div>
      </div>

      <section className="contact-section">
        <div className="auto-container">
          <div className="contact-grid">

            {/* ── FORM ── */}
            <div className="reveal">

              <div className="reg-event-strip">
                <div className="reg-event-strip-item">
                  <span className="res-strip-label">Event</span>
                  <span className="res-strip-val">{event.name}</span>
                </div>
                <div className="reg-event-strip-sep" />
                <div className="reg-event-strip-item">
                  <span className="res-strip-label">Team Size</span>
                  <span className="res-strip-val">{event.teamSize}</span>
                </div>
                <div className="reg-event-strip-sep" />
                <div className="reg-event-strip-item">
                  <span className="res-strip-label">When</span>
                  <span className="res-strip-val">{event.duration}</span>
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="reg-error-banner">
                  ⚠ &nbsp;Please fill all required fields before submitting.
                </div>
              )}

              <form className="contact-form reg-form" onSubmit={handleSubmit} noValidate>

                <div className="reg-section-label">Event Details</div>
                <div className="form-row">
                  <Field label="College / University" required error={errors.college}>
                    <Input
                      value={college}
                      onChange={e => setCollege(e.target.value)}
                      placeholder="Your college or university name"
                      hasError={!!errors.college}
                    />
                  </Field>
                  {isTeam && (
                    <Field label="Team Name" required error={errors.teamName}>
                      <Input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Your team name"
                        hasError={!!errors.teamName}
                      />
                    </Field>
                  )}
                </div>

                <div className="reg-section-label" style={{ marginTop: 28 }}>
                  {isTeam ? 'Team Leader Details' : 'Participant Details'}
                </div>
                <MemberBlock
                  title={isTeam ? 'Team Leader' : leader.name || 'Your Details'}
                  prefix="leader"
                  data={leader}
                  onChange={(k, v) => setLeader(p => ({ ...p, [k]: v }))}
                  errors={errors}
                  accent={isTeam}
                />

                {memberCount >= 2 && (
                  <>
                    <div className="reg-section-label" style={{ marginTop: 28 }}>Member 2</div>
                    <MemberBlock
                      title="Member 2"
                      prefix="member2"
                      data={member2}
                      onChange={(k, v) => setMember2(p => ({ ...p, [k]: v }))}
                      errors={errors}
                      accent={false}
                    />
                  </>
                )}

                {memberCount >= 3 && (
                  <>
                    <div className="reg-section-label" style={{ marginTop: 28 }}>Member 3</div>
                    <MemberBlock
                      title="Member 3"
                      prefix="member3"
                      data={member3}
                      onChange={(k, v) => setMember3(p => ({ ...p, [k]: v }))}
                      errors={errors}
                      accent={false}
                    />
                  </>
                )}

                {memberCount >= 4 && (
                  <>
                    <div className="reg-section-label" style={{ marginTop: 28 }}>Member 4</div>
                    <MemberBlock
                      title="Member 4"
                      prefix="member4"
                      data={member4}
                      onChange={(k, v) => setMember4(p => ({ ...p, [k]: v }))}
                      errors={errors}
                      accent={false}
                    />
                  </>
                )}

                <button
                  type="submit"
                  className="btn-style-one form-submit"
                  disabled={loading}
                  style={{ marginTop: 36, width: '100%' }}
                >
                  <div className="btn-wrap">
                    <span className="text-one">{loading ? 'Securely Submitting...' : 'Register Now'}</span>
                    <span className="text-two">{loading ? 'Securely Submitting...' : 'Register Now'}</span>
                  </div>
                </button>

                <p className="reg-deadline">Last date to register: <strong>April 11, 2026</strong></p>
              </form>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="reveal delay-2">
              <div className="reg-sidebar">
                <h3 className="reg-sidebar-title">Event Info</h3>
                <ul className="reg-sidebar-list">
                  <li><span>Category</span><strong>{event.category}</strong></li>
                  <li><span>Team Size</span><strong>{event.teamSize}</strong></li>
                  <li><span>When</span><strong>{event.duration}</strong></li>
                  <li><span>Rounds</span><strong>{event.rounds}</strong></li>
                  <li><span>Venue</span><strong>{event.venue}</strong></li>
                  <li className="prize-row"><span>Prize</span><strong className="prize-val">{event.prize}</strong></li>
                </ul>

                <div className="reg-sidebar-divider" />

                <h4 className="reg-sidebar-sub">Quick Rules</h4>
                <ul className="reg-sidebar-rules">
                  {event.rules.slice(0, 4).map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <Link to={`/events/${event.slug}`} className="reg-sidebar-more">
                  View all rules →
                </Link>

                <div className="reg-sidebar-divider" />

                <p className="reg-help-text">
                  Need help? Email us at<br />
                  <a href="mailto:tensortribetechclub@gmail.com">tensortribetechclub@gmail.com</a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}