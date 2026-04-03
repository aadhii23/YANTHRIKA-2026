import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './InnerPage.css';

/* ─────────────────────────────────────────────────────────────
   GALLERY DATA — add as many .webp images as you want here.
   Drop files in /public/images/gallery2/ and add an entry below.
   ───────────────────────────────────────────────────────────── */
const GALLERY_ITEMS = [
  { src: '/images/gallery2/1.webp'  },
  { src: '/images/gallery2/2.webp'  },
  { src: '/images/gallery2/3.webp'  },
  { src: '/images/gallery2/4.webp'  },
  { src: '/images/gallery2/5.webp'  },
  { src: '/images/gallery2/6.webp'  },
  { src: '/images/gallery2/7.webp'  },
  { src: '/images/gallery2/8.webp'  },
  { src: '/images/gallery2/9.webp'  },
  { src: '/images/gallery2/10.webp' },
  { src: '/images/gallery2/11.webp' },
  { src: '/images/gallery2/12.webp' },
  { src: '/images/gallery2/13.webp' },
  { src: '/images/gallery2/14.webp' },
  { src: '/images/gallery2/15.webp' },
  // { src: '/images/gallery2/16.webp' },
];

const INITIAL_COUNT = 4;
function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const videoRefs = useRef({});

  const visibleItems = showAll ? GALLERY_ITEMS : GALLERY_ITEMS.slice(0, INITIAL_COUNT);
  const hasMore = GALLERY_ITEMS.length > INITIAL_COUNT;

  useEffect(() => {
    if (lightbox === null) {
      Object.values(videoRefs.current).forEach(v => v && v.pause());
    }
  }, [lightbox]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  const prev = () => setLightbox(i => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  const next = () => setLightbox(i => (i + 1) % GALLERY_ITEMS.length);

  return (
    <section className="zetronica-sec">
      <div className="zetronica-bg-word" aria-hidden="true">ZETRONICA</div>
      <div className="auto-container">
        <div className="zetronica-hdr reveal">
          <span className="overline">Last Edition · 2024</span>
          <h2 className="sec-h2">Zetronica <em>Highlights</em></h2>
          <div className="red-bar" />
          <p className="zetronica-sub">
            A glimpse into the energy, passion, and brilliance of Zetronica 2024 —
            the fest that set the stage for Yanthrika 2026.
          </p>
        </div>

        <div className="gallery-grid">
          {visibleItems.map((item, i) => (
            <button
              key={i}
              className="zg-item gallery-grid__item reveal"
              data-delay={i * 60}
              onClick={() => setLightbox(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={item.src} alt="" className="zg-media" loading="lazy" />
              <div className="zg-overlay" />
            </button>
          ))}
        </div>

        {/* View More / Show Less */}
        {hasMore && (
          <div className="gallery-more-wrap">
            <button className="gallery-more-btn" onClick={() => setShowAll(s => !s)}>
              {showAll
                ? <>Show Less <span className="gallery-more-arrow">↑</span></>
                : <>View More <span className="gallery-more-arrow">↓</span> <span className="gallery-more-count">+{GALLERY_ITEMS.length - INITIAL_COUNT} more</span></>
              }
            </button>
          </div>
        )}

        <div className="zetronica-foot reveal" data-delay="200">
          <span className="zetronica-foot-line" />
          <span className="zetronica-foot-text">Yanthrika 2026 will be even bigger</span>
          <span className="zetronica-foot-line" />
        </div>
      </div>

      {/* Lightbox — rendered via portal so it's always on top */}
      {lightbox !== null && createPortal(
        <div className="zg-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <button className="zg-lb-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
          <button className="zg-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          <button className="zg-lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          <div className="zg-lb-content" onClick={e => e.stopPropagation()}>
            <img src={GALLERY_ITEMS[lightbox].src} alt="" className="zg-lb-media" />
            <div className="zg-lb-caption">
              <span>{lightbox + 1} / {GALLERY_ITEMS.length}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}



export default function About() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = parseInt(e.target.dataset.delay || 0);
        if (delay) setTimeout(() => e.target.classList.add('in-view'), delay);
        else e.target.classList.add('in-view');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    requestAnimationFrame(() => {
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    });
    return () => obs.disconnect();
  }, []);
  return (
    <div className="page-wrapper">

      {/* ── Banner ── */}
      <div className="page-title" style={{ backgroundImage: 'url(/images/background/2.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">About <span>Yanthrika</span></h2>
          <div className="breadcrumb-nav">
            <Link to="/">Home</Link><span className="sep">/</span>About
          </div>
        </div>
      </div>

      {/* ── What is Yanthrika ── */}
      <section className="about-one">
        <div className="auto-container">
          <div className="about-row">
            <div className="about-one_image reveal">
              <img src="/images/background/1.webp" alt="Yanthrika Fest" />
            </div>
            <div className="about-one_content reveal delay-2">
              <span className="about-one_subtitle">What is Yanthrika?</span>
              <div className="about-one_line" />
              <h2 className="about-one_title">
                Sapthagiri NPS University's<br /><strong>Annual Technical Fest</strong>
              </h2>
              <p className="about-one_text">
                Yanthrika is the flagship annual technical fest of the School of Applied Science,
                Sapthagiri NPS University, Bangalore. Since its inception, it has grown into one
                of the most anticipated fests in Karnataka — bringing together students from
                across the state for two days of intense competition, creativity and collaboration.
              </p>
              <p className="about-one_text">
                The name "Yanthrika" is derived from Sanskrit, meaning "mechanical" or
                "of machines" — a nod to the engineering and applied science spirit that
                drives every event, every workshop, and every moment of the fest.
              </p>
              <p className="about-one_text">
                From IT - Debate, quiz to e-sports and photography,
                Yanthrika is a platform where talent meets opportunity and students walk
                away with memories, connections, and skills that last a lifetime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tensor Tribe ── */}
      <section className="about-org-section">
        <div className="auto-container">
          <div className="about-org-row reveal">
            <div className="about-org-logo-box">
              <img src="/images/tensor-tribe-logo.png" alt="Tensor Tribe" className="about-org-logo" />
            </div>
            <div className="about-org-content">
              <span className="about-one_subtitle">The Club Behind It</span>
              <div className="about-one_line" />
              <h2 className="about-one_title">Tensor Tribe</h2>
              <p className="about-one_text">
                Tensor Tribe is the official technical club of the School of Applied Science,
                Sapthagiri NPS University. Founded by a group of passionate students and
                faculty, the club is the driving force behind Yanthrika and several other
                technical initiatives throughout the year.
              </p>
              <div className="about-vm-grid">
                <div className="about-vm-card">
                  <h4>Our Vision</h4>
                  <p>
                    To build a thriving community of curious, skilled, and innovative minds
                    who push the boundaries of applied science and technology — and inspire
                    others to do the same.
                  </p>
                </div>
                <div className="about-vm-card">
                  <h4>Our Mission</h4>
                  <p>
                    To create platforms, events, and experiences that nurture technical talent,
                    encourage cross-disciplinary thinking, and connect students with industry
                    and academia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── School of Applied Science ── */}
      <section className="about-school-section">
        <div className="auto-container">
          <div className="sec-title reveal" style={{ marginBottom: 48 }}>
            <span className="about-one_subtitle">Our Home</span>
            <h2 className="sec-title_heading">School of Applied Science</h2>
          </div>
          <div className="about-school-inner reveal delay-1">
            <div className="about-school-img-box">
              <img src="/images/school-of-applied-science.png" alt="School of Applied Science" className="about-school-img" />
            </div>
            <div className="about-school-text">
              <p className="about-one_text">
                The School of Applied Science at Sapthagiri NPS University is a centre of
                academic excellence focused on bridging the gap between theory and real-world
                application. With state-of-the-art labs, experienced faculty, and a culture
                of innovation, the school prepares students to solve tomorrow's challenges.
              </p>
              <p className="about-one_text">
                Home to disciplines spanning Physics, Chemistry, Mathematics, Computer Science
                and more, the School of Applied Science provides the ideal launchpad for
                interdisciplinary collaboration — which is exactly what Yanthrika celebrates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Director — Dr. Jagannatha S ── */}
      <section className="about-director-section">
        <div className="auto-container">
          <div className="about-director-inner">

            {/* Left — photo */}
            <div className="about-director-photo-col reveal">
              <div className="about-director-photo-frame">
                <div className="about-director-glow" />
                <img
                  src="/images/team/dr-jagannatha-s.webp"
                  alt="Dr. Jagannatha S"
                  className="about-director-img"
                />
                <div className="about-director-border" />
                <div className="photo-corner tl" />
                <div className="photo-corner tr" />
                <div className="photo-corner bl" />
                <div className="photo-corner br" />
              </div>
            </div>

            {/* Right — content */}
            <div className="about-director-content reveal delay-2">
              <span className="about-one_subtitle">Director, School of Applied Science</span>
              <div className="about-one_line" />
              <h2 className="about-one_title">Dr. Jagannatha S</h2>

              {/* Quote block */}
              <div className="about-director-quote-block">
                <div className="about-director-quote-mark">"</div>
                <blockquote className="about-director-quote">
                  At the School of Applied Science, we believe education is not confined to
                  classrooms. Yanthrika was born from a simple conviction — that students
                  learn best when they are challenged, inspired, and given a stage to shine.
                  Every edition of this fest is a testament to what young minds can achieve
                  when given the right environment and the freedom to innovate.
                </blockquote>
              </div>

              <div className="about-director-quote-block" style={{ marginTop: 20 }}>
                <div className="about-director-quote-mark">"</div>
                <blockquote className="about-director-quote">
                  I am immensely proud of every student who has participated, every team
                  that has competed, and every volunteer who has worked tirelessly behind
                  the scenes. Yanthrika is not just a fest — it is a movement. And it is
                  only getting bigger.
                </blockquote>
              </div>

              <div className="about-director-meta">
                <div className="about-director-meta-item">
                  <span className="adm-label">Institution</span>
                  <span className="adm-value">Sapthagiri NPS University</span>
                </div>
                <div className="about-director-meta-sep" />
                <div className="about-director-meta-item">
                  <span className="adm-label">Department</span>
                  <span className="adm-value">School of Applied Science</span>
                </div>
                <div className="about-director-meta-sep" />
                <div className="about-director-meta-item">
                  <span className="adm-label">Role</span>
                  <span className="adm-value">Director & Event Patron</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      <section className="mission-section">
        <div className="auto-container">
          <div className="sec-title reveal" style={{ marginBottom: 48 }}>
            <span className="about-one_subtitle">What Drives Us</span>
            <h2 className="sec-title_heading">Our Values</h2>
          </div>
          <div className="mission-grid">
            <div className="mission-card reveal delay-1">
              <h4>Innovation</h4>
              <p>Push the boundaries of applied science with challenges that demand creative problem-solving and out-of-the-box thinking.</p>
            </div>
            <div className="mission-card reveal delay-2">
              <h4>Collaboration</h4>
              <p>Build connections between students, faculty and industry professionals that last well beyond the two days of the fest.</p>
            </div>
            <div className="mission-card reveal delay-3">
              <h4>Excellence</h4>
              <p>Recognise and reward the best minds across technical disciplines with meaningful prizes and certificates.</p>
            </div>
            <div className="mission-card reveal delay-4">
              <h4>Growth</h4>
              <p>Create a platform where every participant walks away having learned something new — whether they win or not.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <Gallery />

    </div>
  );
}
