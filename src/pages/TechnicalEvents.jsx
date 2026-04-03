import { Link } from 'react-router-dom';
import './InnerPage.css';

const EVENTS = [
  { slug:'byte-build-sw',  name:'Byte Build (Software)', category:'Technical', subtitle:'SOFTWARE EXHIBITION', teamSize:'Team of 2–4', prize:'Exclusive Gift Hampers', img:'4.webp' },
  { slug:'byte-build-hw',  name:'Byte Build (Hardware)', category:'Technical', subtitle:'HARDWARE EXHIBITION', teamSize:'Team of 2–4', prize:'Exclusive Gift Hampers', img:'5.webp' },
  { slug:'syntax-wars',   name:'Syntax Wars',           category:'Technical', subtitle:'CODING & DEBUGGING',   teamSize:'Team of 2',   prize:'Exclusive Gift Hampers', img:'9.webp' },
  { slug:'verbal-wars',    name:'Verbal Wars',          category:'Technical', subtitle:'TECH DEBATE',         teamSize:'Team of 2',   prize:'Exclusive Gift Hampers', img:'7.webp' },
  { slug:'brainware',      name:'Brainware',            category:'Technical', subtitle:'IT QUIZ',             teamSize:'Team of 2',   prize:'Exclusive Gift Hampers', img:'8.webp' },
];

export default function TechnicalEvents() {
  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage: 'url(/images/background/1.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Technical <span>Events</span></h2>
          <div className="breadcrumb-nav">
            <Link to="/">Home</Link><span className="sep">/</span>
            <Link to="/events/technical">Events</Link><span className="sep">/</span>Technical
          </div>
        </div>
      </div>

      <section className="events-page-section">
        <div className="auto-container">
          <div className="events-header reveal">
            <div>
              <span style={{ fontFamily:'var(--font-heading)', fontSize:11, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--main-color)' }}>5 Events</span>
              <h2 className="sec-title_heading" style={{ marginTop:8 }}>Engineer Your Victory</h2>
              <p className="events-intro">IT quizzes, code debugging, tech debates, and project expos — compete, collaborate, and innovate.</p>
            </div>
            <div className="category-toggle">
              <Link to="/events/technical"     className="cat-btn active">Technical</Link>
              <Link to="/events/non-technical" className="cat-btn">Non-Technical</Link>
            </div>
          </div>

          <div className="events-cards-grid">
            {EVENTS.map((e, i) => (
              <div key={e.slug} className={`event-card reveal delay-${(i % 3) + 1}`}>
                <div className="event-card-img">
                  <img src={`/images/gallery/${e.img}`} alt={e.name} loading="lazy" />
                  <span className="event-card-cat">{e.category}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-sub">{e.subtitle}</div>
                  <h3 className="event-card-name">{e.name}</h3>
                  <div className="event-card-meta">
                    <span>{e.teamSize}</span>
                    <span>1st: {e.prize}</span>
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
