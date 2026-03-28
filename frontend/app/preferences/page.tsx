'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetPreferences, apiSavePreferences, getToken } from '@/services/authApi';

const GENRES = [
  { id: 'markets', label: 'Markets & Equities', icon: '📈', desc: 'Stocks, indices, and trading insights' },
  { id: 'economy', label: 'Economy & Policy', icon: '🏛️', desc: 'Macro trends, RBI, government policy' },
  { id: 'tech', label: 'Tech & Startups', icon: '💻', desc: 'Unicorns, funding rounds, product launches' },
  { id: 'banking', label: 'Banking & Finance', icon: '🏦', desc: 'Banks, NBFCs, credit, and lending' },
  { id: 'commodities', label: 'Commodities', icon: '🛢️', desc: 'Oil, gold, metals, and agri markets' },
  { id: 'global', label: 'Global Markets', icon: '🌐', desc: 'US, Europe, Asia—what moves the world' },
  { id: 'realestate', label: 'Real Estate', icon: '🏢', desc: 'Property, REITs, infrastructure' },
  { id: 'crypto', label: 'Crypto & Web3', icon: '₿', desc: 'Digital assets, DeFi, and blockchain' },
  { id: 'corporate', label: 'Corporate & M&A', icon: '🤝', desc: 'Mergers, acquisitions, earnings' },
  { id: 'sustainability', label: 'ESG & Sustainability', icon: '🌱', desc: 'Green energy, ESG investing, climate' },
  { id: 'geopolitics', label: 'Geopolitics', icon: '🗺️', desc: 'Trade wars, sanctions, global tensions' },
  { id: 'sme', label: 'SME & MSME', icon: '🏪', desc: 'Small business news and growth stories' },
  { id: 'personal-finance', label: 'Personal Finance', icon: '💰', desc: 'Mutual funds, tax planning, savings' },
  { id: 'healthcare', label: 'Healthcare & Pharma', icon: '💊', desc: 'Drug approvals, hospital chains, health-tech' },
  { id: 'auto', label: 'Auto & Mobility', icon: '🚗', desc: 'EVs, OEMs, auto sector trends' },
];

export default function PreferencesPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [step, setStep] = useState<'choose' | 'done'>('choose');
  const router = useRouter();

  // On mount: load preferences from API if token exists, otherwise from localStorage
  useEffect(() => {
    const token = getToken();
    if (token) {
      apiGetPreferences()
        .then((data) => {
          if (data.genres && data.genres.length > 0) {
            setSelected(data.genres);
            // Also keep localStorage in sync
            localStorage.setItem('et_preferences', JSON.stringify(data.genres));
          } else {
            // Fall back to localStorage for offline/stale data
            const cached = localStorage.getItem('et_preferences');
            if (cached) setSelected(JSON.parse(cached));
          }
        })
        .catch(() => {
          const cached = localStorage.getItem('et_preferences');
          if (cached) setSelected(JSON.parse(cached));
        });
    } else {
      const cached = localStorage.getItem('et_preferences');
      if (cached) setSelected(JSON.parse(cached));
    }
  }, []);

  const toggleGenre = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    setLoadError('');

    const token = getToken();
    if (token) {
      try {
        await apiSavePreferences(selected);
      } catch {
        setLoadError('Could not save to server, but saved locally.');
      }
    }

    // Always persist locally as a fast cache
    localStorage.setItem('et_preferences', JSON.stringify(selected));

    setStep('done');
    setTimeout(() => router.push('/dashboard'), 1200);
  };

  if (step === 'done') {
    return (
      <div className="story-root login-page">
        <div className="prefs-done-wrap anim anim-1">
          <div className="prefs-done-icon">✓</div>
          <p className="prefs-done-label">Preferences Saved</p>
          <h2 className="prefs-done-title">Your newsroom is ready.</h2>
          <p className="prefs-done-sub">Redirecting you to your feed…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="story-root prefs-page">
      <div className="prefs-wrapper">
        {/* Header */}
        <div className="prefs-header anim anim-1">
          <p className="hero-eyebrow" style={{ justifyContent: 'center' }}>Step 1 of 1</p>
          <h1 className="hub-title" style={{ textAlign: 'center', marginBottom: '12px' }}>
            Choose your <em>interests</em>
          </h1>
          <p className="prefs-subtext">
            Select the topics you care about. Your feed will be curated around your choices.
            You can change these anytime from your profile.
          </p>
          <div className="prefs-counter">
            <span className="prefs-counter-num">{selected.length}</span>
            <span className="prefs-counter-label">of {GENRES.length} selected</span>
          </div>
        </div>

        {/* Genre Grid */}
        <div className="prefs-grid anim anim-2">
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                className={`prefs-chip ${isSelected ? 'prefs-chip--selected' : ''}`}
                onClick={() => toggleGenre(genre.id)}
              >
                <span className="prefs-chip-icon">{genre.icon}</span>
                <span className="prefs-chip-body">
                  <span className="prefs-chip-label">{genre.label}</span>
                  <span className="prefs-chip-desc">{genre.desc}</span>
                </span>
                <span className="prefs-chip-check">{isSelected ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="prefs-cta anim anim-3">
          {loadError && (
            <p className="prefs-cta-hint" style={{ color: 'var(--red)' }}>{loadError}</p>
          )}
          {selected.length === 0 && (
            <p className="prefs-cta-hint">Select at least 1 topic to continue</p>
          )}
          <button
            className="prefs-save-btn"
            disabled={selected.length === 0 || saving}
            onClick={handleSave}
          >
            {saving ? (
              <span className="login-loading">
                <span className="login-loading-ring" />
                Saving…
              </span>
            ) : (
              <>Save &amp; Enter Newsroom<span className="prefs-save-arrow">→</span></>
            )}
          </button>
          <button className="prefs-skip-btn" onClick={() => router.push('/dashboard')}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
