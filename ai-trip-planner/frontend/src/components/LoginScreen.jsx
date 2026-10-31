import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, LogIn, Loader2 } from 'lucide-react';
import { api } from '../api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign in — TripBuddy';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const data = await api.login(username.trim(), password);
      onLogin(data.access_token, data.username);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex login-bg">
      {/* Editorial photo panel */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80"
          alt="Winding road through mountains"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12">
          <p className="kicker !text-gold mb-4">The Intelligent Itinerary</p>
          <h2 className="font-display text-4xl xl:text-5xl font-semibold text-ivory leading-tight max-w-md">
            Every great trip<br />
            <em className="font-light">starts with a plan.</em>
          </h2>
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10 animate-fade-up">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">TripBuddy</h1>
            <p className="font-sans text-sm text-sage mt-2 leading-relaxed">
              Sign in to build neighbourhood-perfect days in any city on Earth.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            <p className="kicker mb-5">Admin access</p>

            {error && (
              <div className="mb-4 p-3 bg-rust/[0.06] border border-rust/30 text-xs font-sans text-rust flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-sage mb-2">
              Username
            </label>
            <div className="relative mb-6">
              <User className="w-4 h-4 text-sage absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                placeholder="admin"
                className="w-full pl-7 pr-4 py-2.5 font-sans text-sm bg-transparent border-0 border-b border-ink/25 focus:outline-none focus:border-terracotta placeholder:text-sage/60 transition"
              />
            </div>

            <label className="block text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-sage mb-2">
              Password
            </label>
            <div className="relative mb-8">
              <Lock className="w-4 h-4 text-sage absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-7 pr-9 py-2.5 font-sans text-sm bg-transparent border-0 border-b border-ink/25 focus:outline-none focus:border-terracotta placeholder:text-sage/60 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-sage hover:text-ink transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password}
              className={`w-full py-3.5 font-sans text-xs font-bold uppercase tracking-[0.22em] text-ivory flex items-center justify-center gap-2.5 transition-all ${
                isLoading || !username.trim() || !password
                  ? 'bg-sage/50 cursor-not-allowed'
                  : 'bg-terracotta hover:bg-rust active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <p className="text-[11px] font-sans text-sage text-center mt-5">
              Default credentials: <span className="font-semibold text-ink">admin / admin123</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
