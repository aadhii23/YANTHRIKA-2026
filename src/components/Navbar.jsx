import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [fixed, setFixed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setFixed(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; }, [mobileOpen]);

  const isEventsActive = pathname.startsWith('/events');

  return (
    <header className={`main-header${fixed ? ' fixed-header' : ''}`}>
      <div className="header-lower">
        <div className="auto-container">
          <div className="inner-container d-flex">
            {/* Logo */}
            <div className="logo-box">
              <Link to="/" className="logo">
                <img src="/images/yanthrika-logo.png" alt="YANTHRIKA" />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="nav-outer">
              <nav className="main-menu">
                <ul className="navigation">
                  <li className={pathname === '/' ? 'current' : ''}>
                    <Link to="/">Home</Link>
                  </li>
                  <li className={pathname === '/about' ? 'current' : ''}>
                    <Link to="/about">About</Link>
                  </li>
                  <li className={`dropdown${isEventsActive ? ' current' : ''}`}>
                    <a href="#" onClick={e => e.preventDefault()}>Events</a>
                    <ul>
                      <li><Link to="/events/technical"><span className="events-nav-pill">Technical</span></Link></li>
                      <li><Link to="/events/non-technical"><span className="events-nav-pill">Non-Technical</span></Link></li>
                    </ul>
                  </li>
                  <li className={pathname === '/schedule' ? 'current' : ''}>
                    <Link to="/schedule">Schedule</Link>
                  </li>
                  <li className={pathname === '/sponsors' ? 'current' : ''}>
                    <Link to="/sponsors">Sponsors</Link>
                  </li>
                  <li className={pathname === '/contact' ? 'current' : ''}>
                    <Link to="/contact">Contact</Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Mobile toggle */}
            <div
              className="mobile-nav-toggler"
              onClick={() => setMobileOpen(v => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${mobileOpen ? ' active' : ''}`}>
        <div className="menu-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="close-btn" onClick={() => setMobileOpen(false)}>
          <i className="fa-solid fa-xmark fa-fw" />
        </div>
        <nav className="menu-box">
          <div className="nav-logo">
            <Link to="/"><img src="/images/yanthrika-logo.png" alt="YANTHRIKA" /></Link>
          </div>
          <div className="menu-outer">
            <ul className="navigation">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li className="dropdown">
                <a href="#" onClick={e => e.preventDefault()}>Events</a>
                <ul style={{ display: 'block', position: 'static', opacity: 1, visibility: 'visible', transform: 'none', boxShadow: 'none' }}>
                  <li><Link to="/events/technical">Technical</Link></li>
                  <li><Link to="/events/non-technical">Non-Technical</Link></li>
                </ul>
              </li>
              <li><Link to="/schedule">Schedule</Link></li>
              <li><Link to="/sponsors">Sponsors</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
