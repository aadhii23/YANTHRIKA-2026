import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './InnerPage.css';
import { ALL_EVENTS } from '../data/events';

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const event = ALL_EVENTS.find(e => e.slug === slug);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!event) return (
    <div style={{ padding:'200px 0', textAlign:'center' }}>
      <p style={{ color:'rgba(255,255,255,0.4)', fontFamily:'var(--font-heading)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:24 }}>Event not found.</p>
      <button className="btn-style-two" onClick={() => navigate('/events/technical')}>
        <div className="btn-wrap"><span className="text-one">Back to Events</span><span className="text-two">Back to Events</span></div>
      </button>
    </div>
  );

  const prevEvent = event.prev ? ALL_EVENTS.find(e => e.slug === event.prev) : null;
  const nextEvent = event.next ? ALL_EVENTS.find(e => e.slug === event.next) : null;
  const backPath = event.category === 'Technical' ? '/events/technical' : '/events/non-technical';

  const handleRegister = () => {
    if (event.formUrl) {
      window.open(event.formUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage: `url(${event.image})` }}>
        <div className="auto-container">
          <h2 className="page-title_heading"><span>{event.name}</span></h2>
          <div className="breadcrumb-nav">
            <Link to="/">Home</Link><span className="sep">/</span>
            <Link to={backPath}>Events</Link><span className="sep">/</span>
            {event.name}
          </div>
        </div>
      </div>

      <section className="event-detail">
        <div className="auto-container">
          <div className="event-detail-grid">
            <div className="reveal">
              <div className="event-detail_image">
                <img src={event.image} alt={event.name} />
              </div>
              <div className="event-detail_meta">
                {[
                  { label:'Category', value:event.category },
                  { label:'Team Size', value:event.teamSize },
                  { label:'When', value:event.duration },
                  { label:'Rounds', value:event.rounds },
                  { label:'Venue', value:event.venue },
                  { label:'Prize', value:event.prize, accent:true },
                ].map(m => (
                  <div key={m.label} className="event-detail_meta-item">
                    <span className="event-detail_meta-label">{m.label}</span>
                    <div className={`event-detail_meta-value${m.accent ? ' accent' : ''}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal delay-2">
              <h3 className="event-detail_title">{event.name}</h3>
              <div className="event-detail_content">
                <h4>About This Event</h4>
                <p>{event.description}</p>
                <h4>Rules &amp; Regulations</h4>
                <ul className="event-detail_rules">
                  {event.rules.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              <div className="event-register-box">
                <h3>Ready to Compete?</h3>
                <p>Last date to register: <strong>April 11, 2026</strong></p>
                {event.formUrl ? (
                  <button
                    className="btn-style-one"
                    onClick={handleRegister}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    <div className="btn-wrap">
                      <span className="text-one">Register Now →</span>
                      <span className="text-two">Register Now →</span>
                    </div>
                  </button>
                ) : (
                  <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13, fontFamily:'var(--font-display)', letterSpacing:'0.08em' }}>
                    Registration opening soon
                  </div>
                )}
                <p style={{ marginTop:12, fontSize:12, color:'rgba(255,255,255,0.30)', fontFamily:'var(--font-display)' }}>
                  You will be redirected to the official Google Form to complete your registration.
                </p>
              </div>
            </div>
          </div>

          <div className="event-nav">
            <Link to={backPath} className="event-nav-back">&larr; Back to All Events</Link>
            {prevEvent && (
              <Link to={`/events/${prevEvent.slug}`} className="btn-style-two">
                <div className="btn-wrap"><span className="text-one">&larr; {prevEvent.name}</span><span className="text-two">&larr; {prevEvent.name}</span></div>
              </Link>
            )}
            {nextEvent && (
              <Link to={`/events/${nextEvent.slug}`} className="btn-style-one">
                <div className="btn-wrap"><span className="text-one">{nextEvent.name} &rarr;</span><span className="text-two">{nextEvent.name} &rarr;</span></div>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
