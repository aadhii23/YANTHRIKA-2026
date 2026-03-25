import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../components/useReveal';
import './InnerPage.css';
import './Sponsors.css';

const TIERS = [
  {
    tier: 'Platinum',
    label: 'Title Sponsor',
    amount: '₹30,000+',
    color: '#e8e8e8',
    glow: 'rgba(232,232,232,0.15)',
    slots: 1,
    featured: true,
    perks: [
      'Logo on all event materials',
      'Main stage branding',
      'Prime exhibition stall',
      'Homepage banner placement',
      'Dedicated social media spotlight',
      'Certificate of appreciation',
      'Exclusive branding rights',
    ],
  },
  {
    tier: 'Gold',
    label: 'Gold Sponsor',
    amount: '₹20,000+',
    color: '#FFD700',
    glow: 'rgba(255,215,0,0.12)',
    slots: 2,
    featured: false,
    perks: [
      'Logo on selected materials',
      'Exhibition stall space',
      'Social media mention',
      'Website listing',
      'Certificate of appreciation',
    ],
  },
  {
    tier: 'Silver',
    label: 'Silver Sponsor',
    amount: '₹15,000+',
    color: '#C0C0C0',
    glow: 'rgba(192,192,192,0.1)',
    slots: 3,
    featured: false,
    perks: [
      'Event banners',
      'Social media mention',
      'Website listing',
      'Certificate of appreciation',
    ],
  },
];

const SPONSORS = [
  {
    name: 'Bengaluru Esports',
    filename: 'bengaluru-esports.webp',
    link: '#', // Update with actual website
    tier: 'Platinum'
  },
  {
    name: 'Anime Garage',
    filename: 'animegarage.webp',
    link: '#', // Update with actual website
    tier: 'Gold'
  },
  {
    name: 'Certisured',
    filename: 'certisured.webp',
    link: '#', // Update with actual website
    tier: 'Silver'
  }
];


/* 3D tilt card */
function TierCard({ tier, index }) {
  const cardRef = useRef(null);
  const [vis, setVis] = [useRef(false), () => {}];

  useEffect(() => {
    const el = cardRef.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => el.classList.add('tier-visible'), index * 150);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const onMove = (e) => {
    const el = cardRef.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
  };
  const onLeave = (e) => {
    const el = cardRef.current; if (!el) return;
    el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  };

  return (
    <div
      ref={cardRef}
      className={`tier-card${tier.featured ? ' tier-card--featured' : ''}`}
      style={{ '--tc': tier.color, '--tg': tier.glow }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {tier.featured && <div className="tier-card__crown">★ PLATINUM SPONSOR</div>}

      {/* Glowing top border */}
      <div className="tier-card__top-line" />

      {/* Header */}
      <div className="tier-card__head">
        <div className="tier-card__badge">
          <span className="tier-card__badge-text">{tier.tier}</span>
        </div>
        <div className="tier-card__amount">{tier.amount}</div>
        <div className="tier-card__slots">{tier.slots} slot{tier.slots > 1 ? 's' : ''} available</div>
      </div>

      {/* Perks */}
      <ul className="tier-card__perks">
        {tier.perks.map((p, i) => (
          <li key={i}>
            <span className="tier-card__check">✓</span>
            {p}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link to="/contact" className="tier-card__cta">
        <span>Become a {tier.tier} Sponsor</span>
        <span className="tier-card__cta-arrow">→</span>
      </Link>

      {/* 3D shine layer */}
      <div className="tier-card__shine" />
    </div>
  );
}

export default function Sponsors() {
  const ref = useInView();

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage:'url(/images/background/2.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Sponsors <span>&amp; Partners</span></h2>
          <div className="breadcrumb-nav"><Link to="/">Home</Link><span className="sep">/</span>Sponsors</div>
        </div>
      </div>

      <section className="sponsors-page">
        <div className="auto-container">

          {/* Intro */}
          <div className="sponsors-intro reveal" ref={ref}>
            <span className="sponsors-overline">Partner With Us</span>
            <h2 className="sponsors-heading">Sponsor <em>Yanthrika 2026</em></h2>
            <div className="sponsors-rule" />
            <p>Reach 700+ students from 50+ colleges across Karnataka. Get your brand in front of the next generation of innovators, engineers and entrepreneurs.</p>
          </div>

          {/* 3D Tier cards */}
          <div className="tiers-grid">
            {TIERS.map((t, i) => (
              <TierCard key={t.tier} tier={t} index={i} />
            ))}
          </div>

          {/* Existing sponsors placeholder */}
          <div className="sponsors-current reveal">
            <h3>Current Sponsors</h3>
            <div className="sponsors-slots">
{SPONSORS.map((sponsor) => (
                <a 
                  href={sponsor.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  key={sponsor.name} 
                  className="sponsor-logo"
                  title={`Visit ${sponsor.name} (${sponsor.tier} Sponsor)`}
                >
                  <img 
                    src={`/images/sponsors/${sponsor.filename}`} 
                    alt={`${sponsor.name} Logo`} 
                    loading="lazy" 

                  />
                </a>
              ))}
            </div>

          </div>

          {/* Bottom CTA */}
          <div className="sponsors-cta reveal">
            <h2>Ready to Partner?</h2>
            <p>Download our sponsorship brochure or reach us directly.</p>
            <div className="sponsors-cta-btns">
              <Link to="/contact" className="btn-style-one">
                <div className="btn-wrap">
                  <span className="text-one">Get Brochure</span>
                  <span className="text-two">Get Brochure</span>
                </div>
              </Link>
              <a href="mailto:tensortribetechclub@gmail.com" className="btn-style-two">
                <div className="btn-wrap">
                  <span className="text-one">Email Us</span>
                  <span className="text-two">Email Us</span>
                </div>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
