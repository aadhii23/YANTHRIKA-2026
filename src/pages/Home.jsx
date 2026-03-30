import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroModel from '../components/HeroModel';
import './Home.css';


const STATS = [
  { value: 10,   suffix: '+',  label: 'Events',          icon: '' },
  { value: 2,    suffix: '',   label: '2nd Edition',      icon: '' },
  { value: 50,   suffix: '+',  label: 'Colleges participated', icon: '' },
  { value: 700,  suffix: '+',  label: 'Participants',    icon: '' },
];

const EVENTS = [
  { slug:'squad-siege',      name:'Squad Siege (BGMI)',        tag:'E-SPORTS',            prize:'Exclusive Gift Hampers', img:'10.webp' },
  { slug:'old-roll',         name:'Old Roll',                  tag:'NON-TECH',            prize:'Exclusive Gift Hampers', img:'2.webp' },
  { slug:'vlogging',         name:'Vlogging',                  tag:'MEDIA',               prize:'Exclusive Gift Hampers', img:'3.webp' },
  { slug:'byte-build-sw',    name:'Byte Build (Software)',     tag:'SOFTWARE EXHIBITION', prize:'Exclusive Gift Hampers', img:'4.webp' },
  { slug:'byte-build-hw',    name:'Byte Build (Hardware)',     tag:'HARDWARE EXHIBITION', prize:'Exclusive Gift Hampers', img:'5.webp' },
  { slug:'venture-verse',    name:'Venture Verse',             tag:'STARTUP PITCH',       prize:'Exclusive Gift Hampers', img:'6.webp' },
  { slug:'squad-siege-fire', name:'Squad Siege (Free Fire)',   tag:'ONLINE E-SPORTS',     prize:'Exclusive Gift Hampers', img:'1.webp' },
  { slug:'verbal-wars',      name:'Verbal Wars',               tag:'DEBATE',              prize:'Exclusive Gift Hampers', img:'7.webp' },
  { slug:'syntax-wars',      name:'Syntax Wars',               tag:'CODING & DEBUGGING',  prize:'Exclusive Gift Hampers', img:'9.webp' },
  { slug:'brainware',        name:'Brainware',                 tag:'TECH QUIZ',           prize:'Exclusive Gift Hampers', img:'8.webp' },
];

const MARQUEE = [
  'SQUAD SIEGE', 'OLD ROLL', 'VLOGGING', 'BYTE BUILD SOFTWARE',
  'BYTE BUILD HARDWARE', 'VENTURE VERSE', 'SQUAD SIEGE FREE FIRE',
  'VERBAL WARS', 'SYNTAX WARS', 'BRAINWARE',
];

function MagLink({ to, children, cls }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.2}px,${(e.clientY-r.top-r.height/2)*0.2}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)'; };
  return <Link to={to} ref={ref} className={cls} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</Link>;
}

function Counter({ end, suffix }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const dur = 1800, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now-t0)/dur, 1);
        setV(Math.round((1-Math.pow(1-p,3)) * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{v}{suffix}</span>;
}


/* ─── Team data ─────────────────────────────────── */
const TEAM_MEMBERS = [
  { name: 'YAMUNA P',           role: 'Event Head',          img: '/images/team/yamuna-p.webp'           },
  { name: 'PAWAN SIMHA R',      role: 'Event Coordinator',   img: '/images/team/pawan-simha-r.webp'      },
  { name: 'ASRA FATHIMA',       role: 'Event Coordinator',   img: '/images/team/asra-fathima.webp'       },
  { name: 'NIDHI PRASAD ZALKI', role: 'Overall Coordinator', img: '/images/team/nidhi-prasad-zalki.webp' },
  { name: 'SRIRAM PAGA',        role: 'Developer',           img: '/images/team/sriram-paga.webp'        },
  { name: 'YASHWANTH N',        role: 'Developer',           img: '/images/team/yashwanth-y.webp'        },
];

/* Preload all team images immediately at module load — before any scroll */
TEAM_MEMBERS.forEach(m => { const i = new Image(); i.src = m.img; });

/* ─── Cinema carousel — infinite auto-slide, no arrows ── */
function TeamCarousel() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState({});
  const total    = TEAM_MEMBERS.length;
  const timerRef = useRef(null);

  /* Preload all images immediately on mount */
  useEffect(() => {
    // already preloaded at module level
  }, []);

  const advance = () => setActive(a => (a + 1) % total);
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 3000);
  };
  useEffect(() => {
    timerRef.current = setInterval(advance, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => { if (idx === active) return; setActive(idx); resetTimer(); };

  function slot(i) {
    let s = ((i - active) % total + total) % total;
    if (s > total / 2) s -= total;
    return s;
  }

  function cardStyle(i) {
    const s   = slot(i);
    const abs = Math.abs(s);
    if (abs > 2) return null;
    const tx      = s * 260;
    const tz      = abs === 0 ? 0 : abs === 1 ? -100 : -200;
    const rotY    = s * 22;
    const scale   = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.65;
    const opacity = abs === 0 ? 1 : abs === 1 ? 0.72 : 0.45;
    return {
      transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`,
      opacity, zIndex: 10 - abs,
      cursor: abs > 0 ? 'pointer' : 'default',
    };
  }

  const m = TEAM_MEMBERS[active];

  return (
    <section className="tc-section">
      <div className="auto-container">
        <div className="tc-header reveal">
          <span className="overline">The People Behind It</span>
          <h2 className="sec-h2">Event Organising <em>Team</em></h2>
        </div>
      </div>

      <div className="tc-stage">
        <div className="tc-perspective">
          {TEAM_MEMBERS.map((member, i) => {
            const style    = cardStyle(i);
            if (!style) return null;
            const abs      = Math.abs(slot(i));
            const isActive = abs === 0;
            const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2);
            const imgReady = loaded[i] === true;
            const imgError = loaded[i] === 'error';
            return (
              <div
                key={member.name}
                className={`tc-card${isActive ? ' tc-card--active' : ''}`}
                style={style}
                onClick={() => goTo(i)}
              >
                {isActive && <div className="tc-card__topline" />}
                <div className="tc-card__img" data-initials={initials}>
                  {/* Shimmer skeleton while loading */}
                  {!imgReady && !imgError && (
                    <div className="tc-card__skeleton" />
                  )}
                  {!imgError && (
                    <img
                      src={member.img}
                      alt={member.name}
                      loading="eager"
                      fetchpriority="high"
                      draggable={false}
                      style={{ opacity: imgReady ? 1 : 0, transition: 'opacity 0.3s ease' }}
                      onLoad={() => setLoaded(prev => ({ ...prev, [i]: true }))}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.classList.add('tc-no-photo');
                        setLoaded(prev => ({ ...prev, [i]: 'error' }));
                      }}
                    />
                  )}
                  <div className="tc-card__shade" />
                  {isActive && <div className="tc-card__inner-glow" />}
                </div>
                <div className="tc-card__info">
                  <p className="tc-card__role">{member.role}</p>
                  <h3 className="tc-card__name">{member.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tc-active-info">
        <div className="tc-active-info__name">{m.name}</div>
        <div className="tc-active-info__role">{m.role}</div>
      </div>

      <div className="tc-dots">
        {TEAM_MEMBERS.map((_, i) => (
          <button
            key={i}
            className={`tc-dot${i === active ? ' tc-dot--on' : ''}`}
            onClick={() => goTo(i)}
            aria-label={TEAM_MEMBERS[i].name}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.dataset.delay || 0);
        if (delay) {
          setTimeout(() => e.target.classList.add('in-view'), delay);
        } else {
          e.target.classList.add('in-view');
        }
        obs.unobserve(e.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    // Batch observe after paint
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="home-wrap">

      {/* ══ HERO ══════════════════════════════════════ */}
      <section className="hero">

        {/* Fullscreen background image */}
        <div className="hero-vid-wrap">
          <img
            src="/images/background/1.webp"
            alt=""
            className="hero-vid"
            style={{ objectFit:'cover', width:'100%', height:'100%' }}
          />
          <div className="hero-vid-overlay" />
        </div>

        {/* 3D model — right side */}
        <div className="hero-model-wrap enhanced-hero-model">
          <HeroModel />
        </div>


        {/* Scanlines */}
        <div className="hero-scanlines" />
        <div className="hero-bottom-glow" />

        {/* Text content — left side */}
        <div className="auto-container hero-body">

          {/* Location pill */}
          <div className="hero-location-pill reveal" data-delay="60">
            <span className="hlp-dot" />
            <span>Sapthagiri NPS University, Bengaluru</span>
          </div>

          {/* Presenter block */}
          <div className="hero-presenter reveal" data-delay="130">
            <span className="hero-presenter-line">
              <span className="hp-org">School of Applied Science</span>
<span className="hp-x">×</span>
              <span className="hp-org">Tensor Tribe</span>
            </span>
            <span className="hp-presents">presents</span>
            <span className="hp-tagline">State Level Inter College Tech Fest</span>
          </div>

          {/* Main title */}
          <h1 className="hero-title reveal" data-delay="220">
            <span className="hero-word">YANTHRIKA</span>
            <span className="hero-year-separate">2026</span>
          </h1>

          {/* Sub info */}
          <div className="hero-meta-pills reveal" data-delay="420">
<span className="hmp">April 16–17</span>
<span className="hmp hmp--red">Exclusive Prizes</span>
<span className="hmp">10+ Events</span>
          </div>

          {/* Buttons */}
          <div className="hero-btns reveal" data-delay="520">
            <MagLink to="/events/technical" cls="btn-mag btn-mag--solid">
              <span className="btn-inner">
                <span className="btn-label">Explore Events</span>
                <span className="btn-arrow">→</span>
              </span>
            </MagLink>
            <a href="https://github.com/aadhii23/YANTHRIKA-2026/releases/download/v1.0/yanthrika-brochure.pdf" download className="btn-mag btn-mag--ghost">
              <span className="btn-inner">
                <span className="btn-label">Download Brochure</span>
                <span className="btn-arrow">↓</span>
              </span>
            </a>
          </div>



        </div>

      </section>

      {/* ══ MARQUEE ═══════════════════════════════════ */}
      <div className="marquee-belt" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i}>{t}<span className="mdot"> · </span></span>
          ))}
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════ */}
      <section className="stats-sec">
        <div className="auto-container stats-row">
          {STATS.map((s, i) => (
            <div key={i} className="stat-box reveal" data-delay={i * 80}>
              <div className="stat-num"><Counter end={s.value} suffix={s.suffix} /></div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ABOUT ═════════════════════════════════════ */}
      <section className="about-sec">
        <div className="about-bg-word" aria-hidden="true">YANTHRIKA</div>
        <div className="auto-container about-layout">
          <div className="about-visual reveal" data-delay="0">
            <div className="about-frame">
              <img src="/images/background/2.webp" alt="Yanthrika" />
              <div className="about-frame__border" />
              <div className="about-frame__badge">EST. 2024</div>
            </div>
          </div>
          <div className="about-copy reveal" data-delay="150">
            <span className="overline">About the Fest</span>
            <h2 className="sec-h2">Where Engineers<br /><em>Come Alive</em></h2>
            <div className="red-bar" />
            <p>Yanthrika is Sapthagiri NPS University's flagship annual symposium — two days of intense competition, creative exploration and industry interaction that brings together the brightest minds from across Karnataka.</p>
            <div className="about-chips">
              <div className="chip"><b>1000+</b><span>Students yearly</span></div>
              <div className="chip"><b>30+</b><span>Colleges</span></div>
              <div className="chip"><b>2</b><span>Years running</span></div>
            </div>
            <MagLink to="/about" cls="btn-mag btn-mag--ghost">Our Story →</MagLink>
          </div>
        </div>
      </section>

      {/* ══ EVENTS ════════════════════════════════════ */}
      <section className="events-sec">
        <div className="auto-container">
          <div className="events-hdr reveal">
            <div>
              <span className="overline">Compete · Create · Conquer</span>
              <h2 className="sec-h2">Featured Events</h2>
            </div>
            <div className="events-toggle">
              <Link to="/events/technical"     className="tog-btn tog-btn--on">Technical</Link>
              <Link to="/events/non-technical" className="tog-btn">Non-Technical</Link>
            </div>
          </div>
          <div className="ev-grid">
            {EVENTS.map((ev, i) => (
              <Link key={ev.slug} to={`/events/${ev.slug}`}
                className={`ev-card reveal${i === 0 ? ' ev-card--big' : ''}`} data-delay={i * 55}>
                <div className="ev-card__img">
                  <img src={`/images/gallery/${ev.img}`} alt={ev.name} loading="lazy" />
                  <div className="ev-card__shade" />
                </div>
                <div className="ev-card__info">
                  <span className="ev-card__tag">{ev.tag}</span>
                  <h3>{ev.name}</h3>
                  <span className="ev-card__prize">{ev.prize}</span>
                  <span className="ev-card__btn">View Details →</span>
                </div>
                <div className="ev-card__line" />
              </Link>
            ))}
          </div>
          <div className="events-foot reveal" data-delay="100">
            <MagLink to="/events/technical" cls="btn-mag btn-mag--solid">View All 10+ Events</MagLink>
          </div>
        </div>
      </section>

      {/* ══ SCHEDULE TEASER ════════════════════════════ */}
      <section className="sched-sec">
        <div className="sched-bg" style={{ backgroundImage: 'url(/images/background/3.webp)' }} />
        <div className="sched-overlay" />
        <div className="auto-container sched-inner reveal">
          <div className="sched-days">
{[
              { d:'16', events:['Inauguration','Tech Events','BGMI'] },
              { d:'17', events:['Non Tech Events','Free Fire','Finals & Prize Distribution'] },
            ].map((day, i) => (
              <div key={i} className="sched-day">
                <div className="sched-day__num">{day.d}</div>
                <div className="sched-day__month">APRIL 2026</div>
                <ul>{day.events.map((e, j) => <li key={j}>{e}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="sched-cta">
            <h2>Two Days.<br />Infinite Possibilities.</h2>
            <MagLink to="/schedule" cls="btn-mag btn-mag--solid">Full Schedule</MagLink>
          </div>
        </div>
      </section>

      {/* ══ TEAM CAROUSEL ════════════════════════════════ */}
      <TeamCarousel />

      {/* ══ CTA ═══════════════════════════════════════ */}
      <section className="cta-sec">
        <div className="cta-noise" />
        <div className="auto-container cta-inner reveal">
          <span className="overline">Don&apos;t miss out</span>
          <h2 className="cta-h2">Ready to <span className="cta-glitch" data-text="Compete?">Compete?</span></h2>
          <p>Secure your spot at Yanthrika 2026 before registrations close.</p>
          <div className="cta-btns">
            <MagLink to="/contact"  cls="btn-mag btn-mag--solid">Register Now</MagLink>
            <MagLink to="/sponsors" cls="btn-mag btn-mag--ghost">Become a Sponsor</MagLink>
          </div>
        </div>
        <div className="cta-bg-word" aria-hidden="true">REGISTER</div>
      </section>

    </div>
  );
}
