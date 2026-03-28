'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { apiGetNews, apiSyncNews, NewsArticle } from '../../services/authApi';

const tools = [
  { id: 'story', title: 'Story Arc Tracker', desc: 'Pick any ongoing business story and watch AI build a complete chronological narrative and predictive map.', icon: '📈', href: '/story' },
  { id: 'my-et', title: 'My ET Personalized', desc: 'A completely custom newsfeed tailored specifically to your exact investment portfolio or persona focus.', icon: '🎯', href: '/my-et' },
  { id: 'navigator', title: 'News Navigator', desc: 'An interactive intelligence briefing. Chat with a deeply analyzed mega-report of specific events.', icon: '💬', href: '/navigator' },
  { id: 'studio', title: 'AI Video Studio', desc: 'Instantly transform any breaking ET article into a broadcast-quality short video with dynamic narration.', icon: '🎬', href: '/studio' },
  { id: 'vernacular', title: 'Vernacular Engine', desc: 'Real-time, context-aware translations of complex financial concepts into localized Indian languages.', icon: '🌍', href: '/vernacular' },
];

// Duplicate for seamless infinite loop
const CAROUSEL_ITEMS = [...tools, ...tools, ...tools];

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('et_user');
    if (!stored) { router.push('/auth'); return; }
    setUser(JSON.parse(stored));

    // Fetch News Feed
    const loadNews = async () => {
      try {
        setLoadingNews(true);
        const data = await apiGetNews();
        setNews(data);

        // Silently sync latest articles in the background, then refresh the feed
        apiSyncNews().then(async () => {
          const freshData = await apiGetNews();
          setNews(freshData);
        }).catch(err => console.error("Background sync failed", err));

      } catch (err: any) {
        console.error("Failed to load news", err);
        if (err.response?.status === 401) {
          localStorage.removeItem('et_user');
          localStorage.removeItem('et_token');
          router.push('/auth');
        }
      } finally {
        setLoadingNews(false);
      }
    };

    loadNews();
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
    const play = () => tlRef.current?.play();
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
    <div className="story-root dash-root" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
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
          <p className="carousel-label">AI Intelligence Modules</p>
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

        {/* ── Personalized News Feed ── */}
        <section className="news-feed-section dash-header-anim" style={{ marginTop: '4rem' }}>
          <h2 className="hub-subtitle" style={{ color: 'var(--gold)', fontSize: '1.2rem', marginBottom: '1.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Latest For You
          </h2>

          {loadingNews ? (
            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Loading curated news...</p>
          ) : news.length === 0 ? (
            <p style={{ color: 'var(--text-dim)' }}>No news found based on your current preferences. We are syncing fresh articles in the background!</p>
          ) : (
            <div className="news-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {news.map((item) => (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1.5rem',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s ease',
                    alignItems: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; // subtle gold border
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  {/* Image Left */}
                  {item.image && (
                    <div style={{ flexShrink: 0, width: '240px', height: '160px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                  )}

                  {/* Content Right */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Economic Times
                      </span>
                      {item.genres && item.genres.map(g => (
                        <span key={g} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '4px', color: 'var(--gold)' }}>
                          {g}
                        </span>
                      ))}
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.8rem 0', lineHeight: 1.3, color: 'var(--text-light)' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                      {item.description || item.content?.substring(0, 200)}...
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
