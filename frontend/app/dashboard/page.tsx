'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

const tools = [
  { id: 'story',      title: 'Story Arc Tracker',  desc: 'Pick any ongoing business story and watch AI build a complete chronological narrative and predictive map.', icon: '📈', href: '/story' },
  { id: 'my-et',      title: 'My ET Personalized', desc: 'A completely custom newsfeed tailored specifically to your exact investment portfolio or persona focus.',   icon: '🎯', href: '/my-et' },
  { id: 'navigator',  title: 'News Navigator',      desc: 'An interactive intelligence briefing. Chat with a deeply analyzed mega-report of specific events.',         icon: '💬', href: '/navigator' },
  { id: 'studio',     title: 'AI Video Studio',     desc: 'Instantly transform any breaking ET article into a broadcast-quality short video with dynamic narration.',   icon: '🎬', href: '/studio' },
  { id: 'vernacular', title: 'Vernacular Engine',   desc: 'Real-time, context-aware translations of complex financial concepts into localized Indian languages.',       icon: '🌍', href: '/vernacular' },
];

// Duplicate for seamless infinite loop
const CAROUSEL_ITEMS = [...tools, ...tools, ...tools];

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('et_user');
    if (!stored) { router.push('/auth'); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  // GSAP infinite carousel
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !user) return;

    const cards = track.querySelectorAll<HTMLElement>('.carousel-card');
    const cardW = cards[0]?.offsetWidth ?? 360;
    const gap = 24;
    const unitW = cardW + gap;
    const totalW = unitW * tools.length; // one set width

    // Start position so it's already at set-1
    gsap.set(track, { x: 0 });

    tlRef.current = gsap.to(track, {
      x: -totalW,
      duration: tools.length * 4,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    const pause = () => tlRef.current?.pause();
    const play  = () => tlRef.current?.play();
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', play);

    return () => {
      tlRef.current?.kill();
      track.removeEventListener('mouseenter', pause);
      track.removeEventListener('mouseleave', play);
    };
  }, [user]);

  // GSAP entrance animations for header
  useEffect(() => {
    if (!user) return;
    gsap.from('.dash-header-anim', {
      opacity: 0,
      y: 28,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
      delay: 0.1,
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="story-root dash-root">
      {/* Nav */}
      <nav className="hub-nav">
        <Link href="/" className="hub-nav-brand" style={{ textDecoration: 'none' }}>ET Intelligence</Link>
        <div className="hub-nav-right">
          <span className="hub-nav-user">Welcome, {user.name}</span>
          <Link href="/preferences" className="hub-nav-link">Preferences</Link>
          <button
            className="hub-nav-signout"
            onClick={() => { localStorage.removeItem('et_user'); router.push('/'); }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="hub-container">
        {/* Header */}
        <header className="hub-header">
          <p className="hub-subtitle dash-header-anim">Your Personalized Intelligence Hub</p>
          <h1 className="hub-title dash-header-anim">ET — <em>The Personalized Newsroom</em></h1>
          <p className="hub-user-prefs-hint dash-header-anim">
            Your feed is curated based on your preferences.{' '}
            <Link href="/preferences" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              Update preferences →
            </Link>
          </p>
        </header>

        {/* ── Carousel ── */}
        <div className="carousel-section dash-header-anim">
          <p className="carousel-label">Modules</p>
          <div className="carousel-viewport">
            <div className="carousel-track" ref={trackRef}>
              {CAROUSEL_ITEMS.map((tool, i) => (
                <Link
                  key={`${tool.id}-${i}`}
                  href={tool.href}
                  className="carousel-card"
                >
                  <div className="carousel-card-icon">{tool.icon}</div>
                  <h2 className="carousel-card-title">{tool.title}</h2>
                  <p className="carousel-card-desc">{tool.desc}</p>
                  <div className="carousel-card-link">Launch Module</div>
                </Link>
              ))}
            </div>

            {/* Fade edges */}
            <div className="carousel-fade carousel-fade--left" />
            <div className="carousel-fade carousel-fade--right" />
          </div>
        </div>
      </div>
    </div>
  );
}
