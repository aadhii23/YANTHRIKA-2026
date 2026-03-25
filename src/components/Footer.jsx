import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-topline" />

      <div className="auto-container">
        <div className="widgets-section">
          <div className="footer-shell">
            <div className="footer-grid">
              <div className="footer-col footer-col--brand">
                <span className="footer-kicker">Sapthagiri NPS University</span>

                <div className="footer-logo-row">
                  <img src="/images/yanthrika-logo.png" alt="Yanthrika" className="footer-logo" />
                  <div className="footer-wordmark-wrap">
                    <span className="footer-wordmark">YANTHRIKA</span>
                    <span className="footer-wordmark-sub">Annual Technical Fest 2026</span>
                  </div>
                </div>

                <p className="footer-tagline">
                  Built for creators, coders, gamers, and builders who want to turn ideas into momentum.
                </p>

                <div className="footer-brand-meta">
                  <div className="footer-brand-chip">10+ Events</div>
                  <div className="footer-brand-chip">2 Days</div>
                  <div className="footer-brand-chip">700+ Participants</div>
                </div>

                <a href="mailto:tensortribetechclub@gmail.com" className="footer-email">
                  tensortribetechclub@gmail.com
                </a>

                <div className="footer-socials">
                  <a
                    href="https://www.instagram.com/tensortribe/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-btn"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    <span>@tensortribe</span>
                  </a>
                </div>
              </div>

              <div className="footer-col footer-col--nav">
                <h4 className="footer-col-heading">Navigate</h4>
                <ul className="footer-navs">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/events/technical">Technical Events</Link></li>
                  <li><Link to="/events/non-technical">Non-Technical Events</Link></li>
                  <li><Link to="/schedule">Schedule</Link></li>
                  <li><Link to="/sponsors">Sponsors</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                </ul>
              </div>

              <div className="footer-col footer-col--map">
                <h4 className="footer-col-heading">Find Us</h4>

                <address className="footer-address">
                  <div className="footer-address-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                  </div>
                  <div>
                    #14/5, Chikkasandra,<br />
                    Hesarghatta Main Road,<br />
                    Bengaluru - 560057
                  </div>
                </address>

                <div className="footer-map-wrap">
                  <div className="footer-map-frame">
                    <iframe
                      title="Sapthagiri NPS University Location"
                      src="https://maps.google.com/maps?q=Sapthagiri+NPS+University,+%2314%2F5+Chikkasandra,+Hesarghatta+Main+Road,+Bengaluru+560057&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.85)' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="footer-map-overlay" />
                  </div>

                  <a
                    href="https://maps.app.goo.gl/RYDfrsseuMiygucp9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-map-cta"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="auto-container">
          <div className="footer-bottom-inner">
            <div className="footer-copyright">
              Copyright 2026 YANTHRIKA | Sapthagiri NPS University
            </div>
            <div className="footer-bottom-right">
              <a
                href="https://www.instagram.com/tensortribe/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-bottom-ig"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @tensortribe
              </a>
              <button
                className="backtop"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
