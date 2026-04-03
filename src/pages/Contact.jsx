import { useState } from 'react';
import { Link } from 'react-router-dom';
import './InnerPage.css';

const CONTACTS = [
  { role:'Event Coordinator', name:'ASRA FATHIMA', phone:'+91 96119 42600', email:'tensortribetechclub@gmail.com' },
  { role:'Event Coordinator', name:'PAWAN SIMHA R', phone:'+91 93532 04949', email:'tensortribetechclub@gmail.com' },
  { role:'Overall Coordinator', name:'NIDHI PRASAD ZALKI', phone:'+91 91087 03568', email:'tensortribetechclub@gmail.com' },
];

export default function Contact() {
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [enq, setEnq] = useState({ name:'', email:'', subject:'', message:'' });

  const vEnq = () => {
    const e = {};
    if (!enq.name.trim()) e.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enq.email)) e.email = 'Valid email required';
    if (!enq.message.trim()) e.message = 'Required';
    return e;
  };

  const onE = e => setEnq(p => ({ ...p, [e.target.name]: e.target.value }));

  const submitEnq = async (e) => {
    e.preventDefault();
    const errs = vEnq(); 
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    setErrors({}); 
    setLoading(true);
    console.log('📧 Enquiry:', enq);
    // TODO: Replace with EmailJS or real backend when ready
    setTimeout(() => {
      setSuccess('Enquiry sent! Reply within 24h or email directly.');
      setEnq({ name:'', email:'', subject:'', message:'' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage:'url(/images/background/3.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Contact <span>Us</span></h2>
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
            </div>

            {/* INFO COLUMN */}
            <div className="reveal delay-2">
              <h2 className="contact-info-title">We'd Love To Hear From You</h2>
              <p className="contact-info-desc">Questions about events or sponsorships? Our team responds within 24 hours.</p>
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
