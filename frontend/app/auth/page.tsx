'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiSignIn, apiSignUp, saveSession } from '@/services/authApi';

type Tab = 'signin' | 'signup';

function AuthForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    (searchParams.get('tab') as Tab) === 'signup' ? 'signup' : 'signin'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const router = useRouter();

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiSignIn(email.trim(), password);
      saveSession(data.access_token, data.user);
      // If they have preferences, go straight to dashboard; else ask them
      router.push(data.has_preferences ? '/dashboard' : '/preferences');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Sign in failed. Please check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiSignUp(name.trim(), email.trim(), password);
      if (data.access_token) {
        saveSession(data.access_token, data.user);
      }
      // New users always go to preferences
      router.push('/preferences');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Sign up failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="story-root login-page">
      <Link href="/" className="auth-back-link">← Back to ET Intelligence</Link>

      <div className="login-wrapper">
        <div className="login-brand anim anim-1">
          <div className="login-brand-eyebrow">Economic Times</div>
          <h1 className="login-brand-title">ET — <em>The Personalized Newsroom</em></h1>
        </div>

        <div className="login-card anim anim-2">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'signin' ? 'auth-tab--active' : ''}`}
              onClick={() => switchTab('signin')}
            >Sign In</button>
            <button
              className={`auth-tab ${tab === 'signup' ? 'auth-tab--active' : ''}`}
              onClick={() => switchTab('signup')}
            >Sign Up</button>
          </div>

          {/* ── Sign In ── */}
          {tab === 'signin' && (
            <>
              <div className="login-card-header">
                <p className="login-label">Returning Member</p>
                <h2 className="login-heading">Welcome Back</h2>
                <p className="login-subtext">Your curated financial newsroom awaits.</p>
              </div>

              <form onSubmit={handleSignIn} className="login-form">
                <div className="login-field">
                  <label className="login-field-label" htmlFor="si-email">Email Address</label>
                  <input
                    id="si-email" type="email" className="login-input"
                    placeholder="e.g. analyst@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="si-password">Password</label>
                  <input
                    id="si-password" type="password" className="login-input"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                {error && <div className="login-error"><span className="login-error-icon">⚠</span>{error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading ? <span className="login-loading"><span className="login-loading-ring" />Signing In…</span> : 'Sign In'}
                </button>
              </form>

              <div className="auth-switch-hint">
                New to ET?{' '}
                <button className="auth-switch-btn" onClick={() => switchTab('signup')}>Create an account →</button>
              </div>
            </>
          )}

          {/* ── Sign Up ── */}
          {tab === 'signup' && (
            <>
              <div className="login-card-header">
                <p className="login-label">New Member</p>
                <h2 className="login-heading">Create Account</h2>
                <p className="login-subtext">Join ET Intelligence. Personalise your newsroom in 60 seconds.</p>
              </div>

              <form onSubmit={handleSignUp} className="login-form">
                <div className="login-field">
                  <label className="login-field-label" htmlFor="su-name">Full Name</label>
                  <input
                    id="su-name" type="text" className="login-input"
                    placeholder="e.g. Priya Sharma"
                    value={name} onChange={(e) => setName(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="su-email">Email Address</label>
                  <input
                    id="su-email" type="email" className="login-input"
                    placeholder="e.g. analyst@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="su-password">Password</label>
                  <input
                    id="su-password" type="password" className="login-input"
                    placeholder="Min. 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                <div className="login-field">
                  <label className="login-field-label" htmlFor="su-confirm">Confirm Password</label>
                  <input
                    id="su-confirm" type="password" className="login-input"
                    placeholder="••••••••"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading} required
                  />
                </div>
                {error && <div className="login-error"><span className="login-error-icon">⚠</span>{error}</div>}
                <button type="submit" className="login-submit" disabled={loading}>
                  {loading
                    ? <span className="login-loading"><span className="login-loading-ring" />Creating Account…</span>
                    : 'Create Account & Set Preferences →'}
                </button>
              </form>

              <div className="auth-switch-hint">
                Already have an account?{' '}
                <button className="auth-switch-btn" onClick={() => switchTab('signin')}>Sign In →</button>
              </div>
            </>
          )}
        </div>

        <p className="login-tagline anim anim-3">Intelligence at the speed of markets.</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="story-root login-page" />}>
      <AuthForm />
    </Suspense>
  );
}
