import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import About from './pages/About';
import TechnicalEvents from './pages/TechnicalEvents';
import NonTechnicalEvents from './pages/NonTechnicalEvents';
import EventDetail from './pages/EventDetail';
import Schedule from './pages/Schedule';
import Sponsors from './pages/Sponsors';
import Contact from './pages/Contact';

function RevealObserver() {
  const { pathname } = useLocation();
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    const id = setTimeout(() => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach(el => obs.observe(el));
    }, 100);
    return () => { clearTimeout(id); obs.disconnect(); };
  }, [pathname]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
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
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events/technical" element={<TechnicalEvents />} />
            <Route path="/events/non-technical" element={<NonTechnicalEvents />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </>
  );
}
