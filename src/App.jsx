import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar    from './components/Navbar';
import Footer    from './components/Footer';
import Cursor    from './components/Cursor';
import Preloader from './components/Preloader';

// Lazy-load every page — they only download when first visited
const Home               = lazy(() => import('./pages/Home'));
const About              = lazy(() => import('./pages/About'));
const TechnicalEvents    = lazy(() => import('./pages/TechnicalEvents'));
const NonTechnicalEvents = lazy(() => import('./pages/NonTechnicalEvents'));
const EventDetail        = lazy(() => import('./pages/EventDetail'));
const Schedule           = lazy(() => import('./pages/Schedule'));
const Sponsors           = lazy(() => import('./pages/Sponsors'));
const Contact            = lazy(() => import('./pages/Contact'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));

// Minimal fallback — invisible, no layout shift
const PageFallback = () => <div style={{ minHeight: '100vh' }} />;

function RevealObserver() {
  const { pathname } = useLocation();
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

    const scan = () => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(el => obs.observe(el));
    };

    // Scan immediately, then again after lazy page has painted
    scan();
    const t1 = setTimeout(scan, 100);
    const t2 = setTimeout(scan, 400);

    // Also watch for new .reveal elements added by lazy-loaded pages
    const mut = new MutationObserver(scan);
    mut.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      obs.disconnect();
      mut.disconnect();
    };
  }, [pathname]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ConditionalLayout({ children }) {
  const { pathname } = useLocation();
  const isAdminPage = pathname === '/secure-admin-panel';
  
  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
      {!isAdminPage && <Footer />}
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <BrowserRouter>
        <div className={`app-shell${ready ? ' app-shell--ready' : ''}`}>
          <ScrollToTop />
          <RevealObserver />
          <div className="noise-layer" />
          <Cursor />
          <ConditionalLayout>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/"                      element={<Home />} />
                <Route path="/about"                 element={<About />} />
                <Route path="/events/technical"      element={<TechnicalEvents />} />
                <Route path="/events/non-technical"  element={<NonTechnicalEvents />} />
                <Route path="/events/:slug"          element={<EventDetail />} />
                <Route path="/schedule"              element={<Schedule />} />
                <Route path="/sponsors"              element={<Sponsors />} />
                <Route path="/contact"               element={<Contact />} />
                <Route path="/secure-admin-panel"    element={<AdminDashboard />} />
                <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '150px 20px', minHeight: '60vh' }}>
                    <h1 style={{ fontSize: '4rem', color: 'var(--main-color)' }}>404</h1>
                    <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>The URL you are looking for does not exist.</p>
                  </div>
                } />
              </Routes>
            </Suspense>
          </ConditionalLayout>
        </div>
      </BrowserRouter>
    </>
  );
}
