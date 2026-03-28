'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Store mock user session
      localStorage.setItem('et_user', JSON.stringify({ email, name: email.split('@')[0] }));

      // Check if user has already set preferences
      const prefs = localStorage.getItem('et_preferences');
      if (prefs) {
        router.push('/');
      } else {
        router.push('/preferences');
      }
    } catch {
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="story-root login-page">
      <div className="login-wrapper">
        {/* Brand Header */}
        <div className="login-brand anim anim-1">
          <div className="login-brand-eyebrow">Economic Times</div>
          <h1 className="login-brand-title">ET — <em>The Personalized Newsroom</em></h1>
        </div>

        {/* Login Card */}
        <div className="login-card anim anim-2">
          <div className="login-card-header">
            <p className="login-label">Access Your Intelligence</p>
            <h2 className="login-heading">Sign In</h2>
            <p className="login-subtext">
              Your curated financial newsroom awaits.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label className="login-field-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="e.g. analyst@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-field">
              <label className="login-field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="login-error">
                <span className="login-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="login-loading">
                  <span className="login-loading-ring" />
                  Authenticating...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">New to ET?</span>
              <span className="login-divider-line" />
            </div>
            <Link href="/preferences" className="login-register-link">
              Create Account &amp; Set Preferences →
            </Link>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="login-tagline anim anim-3">
          Intelligence at the speed of markets.
        </p>
      </div>
    </div>
  );
}
