'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { apiGetNews, apiSyncNews, NewsArticle } from '../../services/authApi';
import API from "@/services/api";
import { TrendingUp, Target, MessageSquare, Video, Globe } from 'lucide-react';

const tools = [
  { id: 'story', title: 'Story Arc Tracker', desc: 'Pick any ongoing business story and watch AI build a complete chronological narrative and predictive map.', icon: <TrendingUp size={20} strokeWidth={1.5} />, href: '/story' },
  { id: 'my-et', title: 'My ET Personalized', desc: 'A completely custom newsfeed tailored specifically to your exact investment portfolio or persona focus.', icon: <Target size={20} strokeWidth={1.5} />, href: '/my-et' },
  { id: 'navigator', title: 'News Navigator', desc: 'An interactive intelligence briefing. Chat with a deeply analyzed mega-report of specific events.', icon: <MessageSquare size={20} strokeWidth={1.5} />, href: '/navigator' },
  { id: 'studio', title: 'AI Video Studio', desc: 'Instantly transform any breaking ET article into a broadcast-quality short video with dynamic narration.', icon: <Video size={20} strokeWidth={1.5} />, href: '/studio' },
  { id: 'vernacular', title: 'Vernacular Engine', desc: 'Real-time, context-aware translations of complex financial concepts into localized Indian languages.', icon: <Globe size={20} strokeWidth={1.5} />, href: '/vernacular' },
];

// Duplicate for seamless infinite loop
const CAROUSEL_ITEMS = [...tools, ...tools, ...tools];

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await API.get(`/search?query=${encodeURIComponent(query)}`);
      const storyId = res.data?.story_id;
      if (!storyId) {
        alert('No matching story found. Try a different search term.');
        setSearching(false);
        return;
      }
      router.push(`/story/${storyId}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Search failed. Please try again.';
      alert(message);
      setSearching(false);
    }
  };

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

          <div className="dash-header-anim" style={{ marginTop: '48px', maxWidth: '640px', margin: '48px auto 0' }}>
            <p className="hero-eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>Story Arc Tracker</p>
            <form onSubmit={handleSearch} className="search-form">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Zomato earnings, Tesla autopilot..."
                className="search-input"
                disabled={searching}
              />
              <button type="submit" className="search-button" disabled={searching}>
                {searching ? "Searching..." : "Search Stories"}
              </button>
            </form>
          </div>
        </header>


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
                <div
                  key={item.id}
                  className="news-card"
                  onClick={() => {
                    sessionStorage.setItem(`article_${item.id}`, JSON.stringify(item));
                    router.push(`/article/${item.id}`);
                  }}
                >
                  {/* Image Left */}
                  {item.image && (
                    <div className="news-card-img-wrap">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    </div>
                  )}

                  {/* Content Right */}
                  <div className="news-card-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Economic Times
                      </span>
                      {item.genres && item.genres.map(g => (
                        <span key={g} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(229, 62, 62, 0.1)', borderRadius: '4px', color: 'var(--gold)' }}>
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
                    <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '0.75rem', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>
                      READ IN APP →
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
