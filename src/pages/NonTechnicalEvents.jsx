import { Link } from 'react-router-dom';
import './InnerPage.css';
import { ALL_EVENTS } from '../data/events';

const EVENTS = ALL_EVENTS.filter(e => e.category === 'Non-Technical').map(e => ({
  slug: e.slug,
  name: e.name,
  subtitle: e.subtitle,
  teamSize: e.teamSize,
  prize: 'Exciting Prizes',
  img: e.image.replace('/images/gallery/', ''),
  exclusive: e.slug === 'decipher',
  registrationClosed: e.registrationClosed || false,
}));

export default function NonTechnicalEvents() {
  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage: 'url(/images/background/2.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Non-Technical <span>Events</span></h2>
          <div className="breadcrumb-nav">
            <Link to="/">Home</Link><span className="sep">/</span>
            <Link to="/events/non-technical">Events</Link><span className="sep">/</span>Non-Technical
          </div>
        </div>
      </div>

      <section className="events-page-section">
        <div className="auto-container">
          <div className="events-header reveal">
            <div>
              <span style={{ fontFamily:'var(--font-heading)', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--main-color)' }}>7 Events</span>
              <h2 className="sec-title_heading" style={{ marginTop:8 }}>Beyond Engineering</h2>
              <p className="events-intro">
                "Dominate in BGMI and Free Fire, crack the escape room, pitch your start-up, or hunt for treasure — open to every student, every discipline."
              </p>
            </div>

            <div className="category-toggle">
              <Link to="/events/technical" className="cat-btn">Technical</Link>
              <Link to="/events/non-technical" className="cat-btn active">Non-Technical</Link>
            </div>
          </div>

          <div className="events-cards-grid">
            {EVENTS.map((e, i) => (
              <div
                key={e.slug}
                className={`event-card reveal delay-${(i % 3) + 1}${e.exclusive ? ' event-card--exclusive' : ''}${e.registrationClosed ? ' event-card--closed' : ''}`}
              >
                <div className="event-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
                  <img src={`/images/gallery/${e.img}`} alt={e.name} loading="lazy" />

                  <span className="event-card-cat">
                    {e.exclusive ? '🎟️ Exclusive' : 'Non-Technical'}
                  </span>

                  {e.registrationClosed && (
                    <span className="event-card-closed-badge">Registrations Closed</span>
                  )}
                  {e.showRemainingSlots && !e.registrationClosed && (
                    <span className="event-card-slots-badge">Only 9 More Slots</span>
                  )}
                </div>

                <div className="event-card-body">
                  <div className="event-card-sub">{e.subtitle}</div>
                  <h3 className="event-card-name">{e.name}</h3>

                  <div className="event-card-meta">
                    <span>{e.teamSize}</span>
                    <span>Prize: {e.prize}</span>
                  </div>

                  <Link to={`/events/${e.slug}`} className="event-card-more">
                    View Details <i className="fa-solid fa-arrow-right fa-fw" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
