import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './InnerPage.css';
import './Schedule.css';

const DAYS = [
  { day:1, label:'Day 1', date:'April 16, 2026', slots:[
    { time:'8:30 AM',  label:'Registrations',               type:'allotment',      venue:'Main Entrance',                        desc:'Participant check-in, team verification and badge distribution.' },
    { time:'9:00 AM',  label:'Inauguration & Keynote',       type:'ceremony',       venue:'B Block - Seminar Hall',               desc:'Grand opening, lamp lighting and chief guest address.' },
    { time:'10:00 AM', label:'IT Quiz (Brainware)',           type:'technical',      venue:'C Block, Room 213',                    desc:'Head-to-head tech trivia — only the sharpest minds rise to the top.' },
    { time:'10:00 AM', label:'IT Exhibition (ByteBuild)',     type:'workshop',       venue:'C Block - Ground Floor',               desc:'Live project demonstrations and innovative tech showcases.' },
    { time:'2:00 PM',  label:'Coding & Debugging (Syntax Wars)', type:'technical',  venue:'C Block, Room 312',                    desc:'Algorithmic challenges, live coding and rapid bug fixing.' },
    { time:'3:30 PM',  label:'IT Debate (Verbal Wars)',       type:'technical',      venue:'C Block, Rooms 303 & 305',             desc:'Clash of ideas on emerging tech and digital ethics.' },
    { time:'5:00 PM',  label:'BGMI (Squad Siege)',            type:'non-technical',  venue:'Online',                               desc:'Squad up, survive the drop, and claim ultimate victory.' },
  ]},
  { day:2, label:'Day 2', date:'April 17, 2026', slots:[
    { time:'9:00 AM',  label:'Registrations',                type:'allotment',      venue:'Main Entrance',                        desc:'Participant check-in, team verification and badge distribution.' },
    { time:'10:00 AM', label:'Treasure Hunt (Brainy Bunch)', type:'non-technical',  venue:'B Block - Seminar Hall',               desc:'Decode cryptic clues, solve puzzles and uncover the hidden prize.' },
    { time:'10:00 AM', label:'Photography (Old Roll)',        type:'non-technical',  venue:'Room 205',                             desc:'Find the perfect angle, capture the moment and tell a visual story.' },
    { time:'10:00 AM', label:'Vlogging (Frame & Fame)',       type:'non-technical',  venue:'Room 203',                             desc:'Dynamic event coverage, creative storytelling and on-the-fly editing.' },
    { time:'2:00 PM',  label:'Startup Pitch (Venture Verse)', type:'non-technical', venue:'C Block, Room 303',                    desc:'Pitch innovative ideas, outline business models and win over the judges.' },
    { time:'2:00 PM',  label:'Escape Room (Decipher)',        type:'non-technical',  venue:'C Block, Rooms 403, 405, 407 & 307',  desc:'Decode the mystery, outsmart the traps and secure your exit under pressure.' },
    { time:'5:00 PM',  label:'Free Fire (Squad Siege)',       type:'non-technical',  venue:'Online',                               desc:'Fast-paced survival, strategic drops, and intense combat rounds.' },
  ]},
];

const TYPE_META = {
  ceremony:      { color: '#ff1e1e', bg: 'rgba(255,30,30,0.08)',   label: 'Ceremony'      },
  technical:     { color: '#ff1e1e', bg: 'rgba(255,30,30,0.08)',   label: 'Technical'     },
  workshop:      { color: '#f97316', bg: 'rgba(249,115,22,0.08)',  label: 'non-technical'      },
  allotment:         { color: '#6b7280', bg: 'rgba(107,114,128,0.06)', label: 'allotment'         },
  'non-technical':{ color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', label: 'Non-Technical' },
  cultural:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', label: 'Cultural'      },
};

function SlotCard({ slot, index, active, onClick }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), index * 90); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const meta = TYPE_META[slot.type] || TYPE_META.ceremony;
  return (
    <div
      ref={ref}
      className={`slot-card${vis ? ' slot-visible' : ''}${active ? ' slot-active' : ''}`}
      style={{ '--slot-color': meta.color, '--slot-bg': meta.bg, '--slot-delay': `${index * 0.08}s` }}
      onClick={onClick}
    >
      {/* Time column */}
      <div className="slot-time">
        <span className="slot-time__text">{slot.time}</span>
        <div className="slot-time__line" />
      </div>

      {/* Dot */}
      <div className="slot-dot">
        <div className="slot-dot__ring" />
        <div className="slot-dot__core" />
      </div>

      {/* Content */}
      <div className="slot-body">
        <div className="slot-header">
          <div className="slot-info">
            <h4 className="slot-label">{slot.label}</h4>
            <span className="slot-type">{meta.label}</span>
            <span className="slot-venue">{slot.venue}</span>
          </div>
          <span className="slot-arrow">›</span>
        </div>
        {/* Expandable description */}
        <div className="slot-desc">
          <p>{slot.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Schedule() {
  const [activeDay, setActiveDay] = useState(1);
  const [activeSlot, setActiveSlot] = useState(null);
  const [switching, setSwitching] = useState(false);
  const day = DAYS.find(d => d.day === activeDay);

  const switchDay = (d) => {
    if (d === activeDay) return;
    setSwitching(true);
    setActiveSlot(null);
    setTimeout(() => { setActiveDay(d); setSwitching(false); }, 320);
  };

  return (
    <div className="page-wrapper">
      <div className="page-title" style={{ backgroundImage:'url(/images/background/1.webp)' }}>
        <div className="auto-container">
          <h2 className="page-title_heading">Event <span>Schedule</span></h2>
          <div className="breadcrumb-nav"><Link to="/">Home</Link><span className="sep">/</span>Schedule</div>
        </div>
      </div>

      <section className="sched-page">
        <div className="auto-container">

          {/* Header + tabs */}
          <div className="sched-top reveal">
            <div className="sched-top__left">
              <span className="sched-overline">2 Days · 12 Sessions</span>
              <h2 className="sched-title">Full Schedule</h2>
            </div>
            <div className="sched-tabs">
              {DAYS.map(d => (
                <button
                  key={d.day}
                  className={`sched-tab${activeDay === d.day ? ' sched-tab--on' : ''}`}
                  onClick={() => switchDay(d.day)}
                >
                  <strong>{d.label}</strong>
                  <span>{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Day banner */}
          <div className="sched-banner">
            <div className="sched-banner__date">{day.date.split(',')[0].split(' ')[1]}</div>
            <div className="sched-banner__info">
              <span className="sched-banner__month">April 2026</span>
              <h3>{day.label}</h3>
              <span className="sched-banner__count">{day.slots.length} sessions scheduled</span>
            </div>
            <div className="sched-banner__rule" />
          </div>

          {/* Timeline */}
          <div className={`sched-timeline${switching ? ' sched-timeline--out' : ''}`}>
            {day.slots.map((slot, i) => (
              <SlotCard
                key={`${activeDay}-${i}`}
                slot={slot}
                index={i}
                active={activeSlot === i}
                onClick={() => setActiveSlot(activeSlot === i ? null : i)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="sched-legend reveal">
            {Object.entries(TYPE_META).map(([key, val]) => (
              <div key={key} className="legend-item" style={{ '--lc': val.color }}>
                <span className="legend-dot" />
                <span>{val.label}</span>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
