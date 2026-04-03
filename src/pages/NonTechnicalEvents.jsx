import { Link } from 'react-router-dom';
import './InnerPage.css';

const EVENTS = [
  { slug:'squad-siege',      name:'Squad Siege (BGMI)',       subtitle:'E-SPORTS (BGMI)',       teamSize:'Squad of 4',    prize:'Exciting Prizes', img:'10.webp' },
  { slug:'squad-siege-fire', name:'Squad Siege (Free Fire)',  subtitle:'ONLINE FREE FIRE',      teamSize:'Squad of 4',    prize:'Exciting Prizes', img:'1.webp' },
  { slug:'old-roll',         name:'Old Roll',                 subtitle:'PHOTOGRAPHY CHALLENGE', teamSize:'Individual',    prize:'Exciting Prizes', img:'2.webp' },
  { slug:'vlogging',         name:'Frame & Fame',             subtitle:'VLOGGING CHALLENGE',    teamSize:'Team of 2',     prize:'Exciting Prizes', img:'3.webp' },
  { slug:'venture-verse',    name:'Venture Verse',            subtitle:'STARTUP PITCH',         teamSize:'Team of 3',     prize:'Exciting Prizes', img:'6.webp' },
  { slug:'brainy-bunch',     name:'Brainy Bunch',             subtitle:'TREASURE HUNT',         teamSize:'Team of 4',     prize:'Exciting Prizes', img:'11.webp' },
  { slug:'decipher', name:'Decipher', subtitle:'ESCAPE ROOM', teamSize:'Golden Ticket', prize:'Exciting Prizes', img:'12.webp', exclusive: true },
];

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
              <p className="events-intro">"Dominate in BGMI and Free Fire, crack the escape room, pitch your start-up, or hunt for treasure — open to every student, every discipline.</p>
            </div>
            <div className="category-toggle">
              <Link to="/events/technical" className="cat-btn">Technical</Link>
              <Link to="/events/non-technical" className="cat-btn active">Non-Technical</Link>
            </div>
          </div>
          <div className="events-cards-grid">
            {EVENTS.map((e, i) => (
              <div key={e.slug} className={`event-card reveal delay-${(i % 3) + 1}${e.exclusive ? ' event-card--exclusive' : ''}`}>
                <div className="event-card-img">
                  <img src={`/images/gallery/${e.img}`} alt={e.name} loading="lazy" />
                  <span className="event-card-cat">{e.exclusive ? '🎟️ Exclusive' : 'Non-Technical'}</span>
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
