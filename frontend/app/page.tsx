'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const FEATURES = [
  { icon: '📈', title: 'Story Arc Tracker', desc: 'Watch AI build a complete chronological narrative behind any business story.' },
  { icon: '🎯', title: 'Personalised Feed', desc: 'Your newsfeed, curated by genre preferences you choose — updated every hour.' },
  { icon: '💬', title: 'News Navigator', desc: 'Chat with a deeply analysed mega-report of any breaking event in real time.' },
  { icon: '🎬', title: 'AI Video Studio', desc: 'Transform ET articles into broadcast-quality short videos in seconds.' },
  { icon: '🌍', title: 'Vernacular Engine', desc: 'Complex financial concepts translated into 8 Indian regional languages.' },
];

const STATS = [
  { num: '2.4M+', label: 'Daily Readers' },
  { num: '50k+', label: 'Stories Tracked' },
  { num: '15', label: 'News Genres' },
  { num: '8', label: 'Indian Languages' },
];

const TESTIMONIALS = [
  { quote: 'ET Intelligence feels like having a Bloomberg terminal built specifically for Indian markets.', author: 'Meera K.', role: 'Portfolio Manager, Mumbai' },
  { quote: 'The genre-based feed is the only news experience that doesn\'t waste my time anymore.', author: 'Rahul S.', role: 'Startup Founder, Bangalore' },
  { quote: 'My entire research workflow is now 3× faster. I cannot imagine going back.', author: 'Ananya P.', role: 'Equity Analyst, Delhi' },
];

export default function LandingPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('et_user');
    if (stored) setUser(JSON.parse(stored));

    // Scroll state for nav glassmorphism
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);

    // GSAP smooth anchor scroll for nav links
    const handleAnchorClick = (e: Event) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      // Native smooth scroll — no plugin required
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.addEventListener('click', handleAnchorClick);

    // GSAP hero entrance
    import('gsap').then(({ default: gsap }) => {
      gsap.from('.landing-anim', {
        opacity: 0,
        y: 36,
        stagger: 0.14,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.15,
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div className="story-root landing-root">
      {/* ── Sticky Nav ── */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <span className="landing-nav-logo">ET</span>
            <span className="landing-nav-name">Intelligence</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#stats" className="landing-nav-link">Impact</a>
            <a href="#testimonials" className="landing-nav-link">Stories</a>
          </div>
          <div className="landing-nav-cta">
            {user ? (
              <>
                <span className="landing-nav-user">Hi, {user.name}</span>
                <Link href="/dashboard" className="landing-btn landing-btn--primary">Go to Dashboard →</Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="landing-btn landing-btn--ghost">Sign In</Link>
                <Link href="/auth?tab=signup" className="landing-btn landing-btn--primary">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero" ref={heroRef}>
        <div className="landing-hero-bg" />
        <div className="landing-hero-content">
          <p className="landing-hero-eyebrow landing-anim">The Economic Times — Reimagined</p>
          <h1 className="landing-hero-title landing-anim">
            News that <em>thinks</em><br />like you do.
          </h1>
          <p className="landing-hero-sub landing-anim">
            ET Intelligence is a AI-powered newsroom that learns your interests,
            tracks stories like a financial journalist, and delivers intelligence
            that is always relevant — always personal.
          </p>
          <div className="landing-hero-actions anim anim-4">
            {user ? (
              <Link href="/dashboard" className="landing-hero-cta">
                Open My Newsroom →
              </Link>
            ) : (
              <>
                <Link href="/auth?tab=signup" className="landing-hero-cta">
                  Get Started Free
                </Link>
                <Link href="/auth" className="landing-hero-cta-secondary">
                  Sign In →
                </Link>
              </>
            )}
          </div>
          <p className="landing-hero-disclaimer anim anim-5">No credit card required. Set up in 60 seconds.</p>
        </div>

        {/* Floating article preview cards */}
        <div className="landing-hero-preview anim anim-3">
          <div className="landing-preview-card landing-preview-card--1">
            <span className="lpc-tag">Markets</span>
            <p className="lpc-headline">Nifty surges 340pts as FII inflows hit 3-month high</p>
            <span className="lpc-time">2 min ago</span>
          </div>
          <div className="landing-preview-card landing-preview-card--2">
            <span className="lpc-tag">Tech</span>
            <p className="lpc-headline">Zepto raises $350M at $5B valuation, eyes profitability</p>
            <span className="lpc-time">12 min ago</span>
          </div>
          <div className="landing-preview-card landing-preview-card--3">
            <span className="lpc-tag">Economy</span>
            <p className="lpc-headline">RBI holds rates; Governor signals easing cycle ahead</p>
            <span className="lpc-time">1 hr ago</span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="landing-stats">
        <div className="landing-section-inner">
          {STATS.map((s) => (
            <div key={s.label} className="landing-stat">
              <p className="landing-stat-num">{s.num}</p>
              <p className="landing-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="landing-section">
        <div className="landing-section-inner landing-section-inner--padded">
          <div className="landing-section-header">
            <p className="section-label">What's Inside</p>
            <h2 className="landing-section-title">
              Five powerful modules.<br /><em>One unified intelligence layer.</em>
            </h2>
          </div>
          <div className="landing-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`landing-feature-card anim anim-${(i % 3) + 2}`}>
                <div className="lfc-icon">{f.icon}</div>
                <h3 className="lfc-title">{f.title}</h3>
                <p className="lfc-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section landing-section--alt">
        <div className="landing-section-inner landing-section-inner--padded">
          <div className="landing-section-header">
            <p className="section-label">How It Works</p>
            <h2 className="landing-section-title">Up and running in <em>three steps.</em></h2>
          </div>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">01</div>
              <h3 className="landing-step-title">Create your account</h3>
              <p className="landing-step-desc">Sign up in seconds — just your name, email, and a password.</p>
            </div>
            <div className="landing-step-connector" />
            <div className="landing-step">
              <div className="landing-step-num">02</div>
              <h3 className="landing-step-title">Choose your interests</h3>
              <p className="landing-step-desc">Pick from 15 news genres — from Markets to Geopolitics. Multi-select.</p>
            </div>
            <div className="landing-step-connector" />
            <div className="landing-step">
              <div className="landing-step-num">03</div>
              <h3 className="landing-step-title">Enter your newsroom</h3>
              <p className="landing-step-desc">Your personalised dashboard is ready. Intelligence begins immediately.</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/auth?tab=signup" className="landing-hero-cta">
              Start Now — It&apos;s Free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="landing-section">
        <div className="landing-section-inner landing-section-inner--padded">
          <div className="landing-section-header">
            <p className="section-label">What Members Say</p>
            <h2 className="landing-section-title">Built for those who <em>think in markets.</em></h2>
          </div>
          <div className="landing-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`landing-testimonial anim anim-${i + 2}`}>
                <p className="landing-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="landing-testimonial-author">
                  <span className="landing-testimonial-name">{t.author}</span>
                  <span className="landing-testimonial-role">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="landing-final-cta">
        <div className="landing-final-cta-inner">
          <p className="landing-eyebrow-sm">Join 2.4 Million Readers</p>
          <h2 className="landing-final-title">Your newsroom.<br /><em>Yours alone.</em></h2>
          <p className="landing-final-sub">
            Create a free account and personalise your ET Intelligence feed in under a minute.
          </p>
          <Link href="/auth?tab=signup" className="landing-hero-cta">
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-footer-brand">ET Intelligence</span>
          <span className="landing-footer-copy">© 2026 The Economic Times. All rights reserved.</span>
          <div className="landing-footer-links">
            <Link href="/auth" className="landing-footer-link">Sign In</Link>
            <Link href="/auth?tab=signup" className="landing-footer-link">Sign Up</Link>
            <Link href="/story" className="landing-footer-link">Story Tracker</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}