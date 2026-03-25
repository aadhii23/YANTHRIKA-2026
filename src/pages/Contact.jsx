
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './InnerPage.css';

const ALL_EVENTS = [
  'Syntax Wars','Brainware','Verbal Wars','Byte Build',
  'Venture Verse','Old Roll','Squad Siege (BGMI)','Squa Siege (FREEFIRE)','Brainy Bunch','Frame & Fame',
];

const CONTACTS = [
  { role:'Event Coordinator', name:'ASRA FATHIMA', phone:'+91 96119 42600', email:'tensortribetechclub@gmail.com' },
  { role:'Event Coordinator', name:'PAWAN SIMHA R', phone:'+91 93532 04949', email:'tensortribetechclub@gmail.com' },
  { role:'Overall Coordinator', name:'NIDHI PRASAD ZALKI', phone:'+91 91087 03568', email:'tensortribetechclub@gmail.com' },
];

export default function Contact() {
  const location = useLocation();
  const preEvent = location.state?.event || '';
  const [tab, setTab]         = useState('register');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [reg, setReg] = useState({ name:'', email:'', phone:'', college:'', event:preEvent, teamName:'', teamMembers:'' });
  const [enq, setEnq] = useState({ name:'', email:'', subject:'', message:'' });

  useEffect(() => { if (preEvent) setTab('register'); }, [preEvent]);

  const vReg = () => {
    const e = {};
    if (!reg.name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) e.email = 'Valid email required';
    if (!/^\+?[\d\s-]{10,}$/.test(reg.phone)) e.phone = 'Valid phone required';
    if (!reg.college.trim()) e.college = 'Required';
    if (!reg.event) e.event = 'Please select an event';
    return e;
  };
const EVENT_GOOGLE_FORMS = {
    'old-roll': {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLScoZIRnrdFXxN8sY0UF3bd-CUfJJyW4UN5bR2JzVLtnODa4NQ/formResponse',
      f: { college:'entry.2020977115', leaderName:'entry.1656110094', leaderEmail:'entry.1962413621', leaderPhone:'entry.913795825' },
    },
    'syntax-wars': {
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSdbnfluXL_3HtJvMGqdweZBYsZDlQDdr4r364z3gSqRU8K_Yg/formResponse',
      f: { college:'entry.1644343270', teamName:'entry.2020977115', leaderName:'entry.1273111505', leaderEmail:'entry.686138351', leaderPhone:'entry.491958267', member2Name:'entry.1962413621', member2Email:'entry.1602789966', member2Phone:'entry.1562713426' },
    },
    // Add other events matching RegisterEvent.jsx FORMS as needed
  };

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzLQaVq2hlf_l-wsivMU26Tm6R3ToHlMCO7vYLvW3mA1tcPBscBtm8JIHOWJqRdUKK_/exec';

  const vEnq = () => {
    const e = {};
    if (!enq.name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enq.email)) e.email = 'Valid email required';
    if (!enq.message.trim()) e.message = 'Required';
    return e;
  };

  const onR = e => setReg(p => ({ ...p, [e.target.name]: e.target.value }));
  const onE = e => setEnq(p => ({ ...p, [e.target.name]: e.target.value }));

  const submitReg = async (e) => {
    e.preventDefault();
    const errs = vReg(); if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);

    const formConfig = EVENT_GOOGLE_FORMS[reg.event];
    if (!formConfig) {
      setSuccess('No Google Form configured for this event yet. Please contact admin.');
      setLoading(false);
      return;
    }

    // URLSearchParams for form fields
    const f = formConfig.f;
    const params = new URLSearchParams();
    params.append(f.college || 'entry.1644343270', reg.college);
    params.append(f.leaderName || 'entry.1273111505', reg.name);
    params.append(f.leaderEmail || 'entry.686138351', reg.email);
    params.append(f.leaderPhone || 'entry.491958267', reg.phone);
    if (f.teamName) params.append(f.teamName, reg.teamName);
    if (reg.teamMembers) params.append('entry.1962413621', reg.teamMembers); // fallback

    // Hidden iframe POST to Google Form
    const iframeName = 'gf_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;border:none;';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = formConfig.url;
    form.target = iframeName;
    form.style.display = 'none';

    params.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      try { document.body.removeChild(form); } catch(e) {}
      try { document.body.removeChild(iframe); } catch(e) {}

      // Apps Script call
      fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: params })
        .catch(err => console.error('Script failed:', err));

      console.log('Data sent:', params.toString());
      localStorage.setItem('reg-log-' + Date.now(), params.toString());
    }, 1000);

    setSuccess('Registration submitted! Check email/Google Sheets.');
    setReg({ name:'', email:'', phone:'', college:'', event:'', teamName:'', teamMembers:'' });
    setLoading(false);
  };

  const submitEnq = async (e) => {
    e.preventDefault();
    const errs = vEnq(); if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setLoading(true);
    try {
      const res = await fetch('/api/contact/enquire', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(enq) });
      const d = await res.json();
      setSuccess(d.success ? "Message received! We'll reply within 24 hours." : 'Something went wrong.');
      if (d.success) setEnq({ name:'', email:'', subject:'', message:'' });
    } catch { setSuccess('Cannot reach server. Email us directly.'); }
    setLoading(false);
  };

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage:'url(/images/background/3.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Register <span>&amp; Contact</span></h2>
          <div className="breadcrumb-nav"><Link to="/">Home</Link><span className="sep">/</span>Contact</div>
        </div>
      </div>
      <section className="contact-section">
        <div className="auto-container">
          <div className="contact-grid">

            {/* FORM COLUMN */}
            <div className="reveal">
              {success && (
                <div className="success-banner">
                  ✓ &nbsp;{success}
                  <button onClick={() => setSuccess('')} style={{ float:'right', background:'none', color:'#fff', fontSize:18, cursor:'pointer', lineHeight:1 }}>×</button>
                </div>
              )}
              <div className="contact-tabs">
                <button className={`contact-tab${tab==='register'?' active':''}`} onClick={() => setTab('register')}>🎫 Register for Event</button>
                <button className={`contact-tab${tab==='enquiry'?' active':''}`}  onClick={() => setTab('enquiry')}>💬 General Enquiry</button>
              </div>

              {tab === 'register' ? (
                <form className="contact-form" onSubmit={submitReg} noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input name="name" value={reg.name} onChange={onR} placeholder="Your full name" className={errors.name?'err':''} />
                      {errors.name && <span className="field-err">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input name="email" type="email" value={reg.email} onChange={onR} placeholder="you@college.edu" className={errors.email?'err':''} />
                      {errors.email && <span className="field-err">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input name="phone" value={reg.phone} onChange={onR} placeholder="+91 XXXXX XXXXX" className={errors.phone?'err':''} />
                      {errors.phone && <span className="field-err">{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label>College Name *</label>
                      <input name="college" value={reg.college} onChange={onR} placeholder="Your college / university" className={errors.college?'err':''} />
                      {errors.college && <span className="field-err">{errors.college}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Select Event *</label>
                    <select name="event" value={reg.event} onChange={onR} className={errors.event?'err':''}>
                      <option value="">-- Choose an event --</option>
                      <optgroup label="Technical Events">{ALL_EVENTS.slice(0,8).map(ev=><option key={ev}>{ev}</option>)}</optgroup>
                      <optgroup label="Non-Technical Events">{ALL_EVENTS.slice(8).map(ev=><option key={ev}>{ev}</option>)}</optgroup>
                    </select>
                    {errors.event && <span className="field-err">{errors.event}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Team Name</label>
                      <input name="teamName" value={reg.teamName} onChange={onR} placeholder="Your team name (optional)" />
                    </div>
                    <div className="form-group">
                      <label>Team Members (comma-separated)</label>
                      <input name="teamMembers" value={reg.teamMembers} onChange={onR} placeholder="Alice, Bob, Charlie" />
                    </div>
                  </div>
                  <button type="submit" className="btn-style-one form-submit" disabled={loading}>
                    <div className="btn-wrap"><span className="text-one">{loading?'Submitting...':'Register Now'}</span><span className="text-two">{loading?'Submitting...':'Register Now'}</span></div>
                  </button>
                </form>
              ) : (
                <form className="contact-form" onSubmit={submitEnq} noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input name="name" value={enq.name} onChange={onE} placeholder="Your full name" className={errors.name?'err':''} />
                      {errors.name && <span className="field-err">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input name="email" type="email" value={enq.email} onChange={onE} placeholder="you@example.com" className={errors.email?'err':''} />
                      {errors.email && <span className="field-err">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input name="subject" value={enq.subject} onChange={onE} placeholder="What is this about?" />
                  </div>
                  <div className="form-group">
                    <label>Message *</label>
                    <textarea name="message" value={enq.message} onChange={onE} placeholder="Your message..." rows={5} className={errors.message?'err':''} />
                    {errors.message && <span className="field-err">{errors.message}</span>}
                  </div>
                  <button type="submit" className="btn-style-one form-submit" disabled={loading}>
                    <div className="btn-wrap"><span className="text-one">{loading?'Sending...':'Send Message'}</span><span className="text-two">{loading?'Sending...':'Send Message'}</span></div>
                  </button>
                </form>
              )}
            </div>

            {/* INFO COLUMN */}
            <div className="reveal delay-2">
              <h2 className="contact-info-title">We'd Love To Hear From You</h2>
              <p className="contact-info-desc">Questions about registration, events, or sponsorships? Our team responds within 24 hours.</p>
              <div className="contact-cards">
                {CONTACTS.map((c,i)=>(
                  <div key={i} className="contact-card">
                    <div className="contact-card-role">{c.role}</div>
                    <div className="contact-card-name">{c.name}</div>
                    <a href={`tel:${c.phone}`} className="contact-card-detail">{c.phone}</a>
                    <a href={`mailto:${c.email}`} className="contact-card-detail email">{c.email}</a>
                  </div>
                ))}
              </div>
              <div className="contact-address">
                <p style={{ color:'var(--main-color)', letterSpacing:'0.22em', marginBottom:10, fontSize:10 }}>VENUE</p>
                <p>SAPTHAGIRI NPS UNIVERSITY</p>
                <p>Chikkasandra, Hesaraghatta Main Road</p>
                <p>Bangalore — 560090, Karnataka</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
