import { Link } from 'react-router-dom';
import './InnerPage.css';



export default function About() {
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
                <div className="about-director-scan" />
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

      {/* ── Milestones ── */}
    </div>
  );
}
