import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './InnerPage.css';
import { ALL_EVENTS } from '../data/events';
import RegistrationModal from '../components/RegistrationModal';
import '../components/RegistrationModal.css';
import { shouldEventBeClosed } from '../utils/registrationLimits';

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const event = ALL_EVENTS.find(e => e.slug === slug);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capacityReached, setCapacityReached] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // Check registration limit on mount
  useEffect(() => {
    checkRegistrationLimit();
  }, [slug]);

  const checkRegistrationLimit = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) return;

      // Count registrations for this event
      const res = await fetch(
        `${supabaseUrl}/rest/v1/registrations?event_name=eq.${encodeURIComponent(event?.name)}&select=count()`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          }
        }
      );

      if (res.ok) {
        const count = parseInt(res.headers.get('content-range')?.split('/')[1] || '0', 10);
        if (shouldEventBeClosed(event?.name, count)) {
          setCapacityReached(true);
        }
      }
    } catch (err) {
      console.error('Failed to check registration limit:', err);
    }
  };

  if (!event) return (
    <div style={{ padding: '200px 0', textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>Event not found.</p>
      <button className="btn-style-two" onClick={() => navigate('/events/technical')}>
        <div className="btn-wrap"><span className="text-one">Back to Events</span><span className="text-two">Back to Events</span></div>
      </button>
    </div>
  );

  const prevEvent = event.prev ? ALL_EVENTS.find(e => e.slug === event.prev) : null;
  const nextEvent = event.next ? ALL_EVENTS.find(e => e.slug === event.next) : null;
  const backPath = event.category === 'Technical' ? '/events/technical' : '/events/non-technical';

  const handleRegister = () => {
    setIsModalOpen(true);
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
              <div className="event-detail_image" style={{ position: 'relative' }}>
                <img src={event.image} alt={event.name} />
              </div>

              <div className="event-detail_meta">
                {[
                  { label: 'Category', value: event.category },
                  { label: 'Team Size', value: event.teamSize },
                  { label: 'When', value: event.duration },
                  { label: 'Rounds', value: event.rounds },
                  { label: 'Venue', value: event.venue },
                  { label: 'Prize', value: event.prize, accent: true },
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

                {event.slug === 'decipher' ? (
                  <div className="decipher-exclusive-box">
                    <div className="decipher-ticket-icon">🎟️</div>
                    <h4>Exclusive Event</h4>
                    <p>
                      Decipher — Escape Room is an <strong>exclusive event</strong> only available
                      to participants who have found the <strong>Golden Ticket</strong>.
                    </p>
                    <p>
                      Scan the QR code on your Golden Ticket to register.
                      Our team will reach out with further instructions.
                    </p>
                    <a
                      href="https://www.instagram.com/tensortribe/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-style-one"
                      style={{ display: 'inline-block', marginTop: 16, border: 'none' }}
                    >
                      <div className="btn-wrap">
                        <span className="text-one">Follow @tensortribe for Updates →</span>
                        <span className="text-two">Follow @tensortribe for Updates →</span>
                      </div>
                    </a>
                  </div>
                ) : event.registrationClosed || capacityReached ? (
                  <div className="reg-closed-box">
                    <h4>Registrations Closed</h4>
                    <p>Registrations for <strong>{event.name}</strong> are now closed. Thank you for your interest!</p>
                  </div>
                ) : (
                  <>
                    <p>Last date to register: <strong>April 11, 2026</strong></p>
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
                  </>
                )}
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

      {isModalOpen && (
        <RegistrationModal
          eventName={event.name}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}