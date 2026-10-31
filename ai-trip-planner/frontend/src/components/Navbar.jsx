import React, { useState, useRef, useEffect } from 'react';
import { Heart, LogOut, ChevronDown, ShieldCheck, User } from 'lucide-react';

export default function Navbar({ onOpenProfile, onLogout, username, likesCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-xl border-b border-ink/10">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Brand — editorial masthead */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">
              TripBuddy
            </span>
            <span className="hidden sm:inline text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-terracotta">
              The Intelligent Itinerary
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold text-ink border border-ink/15 hover:border-ink/40 hover:bg-ink/[0.03] rounded-none transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-terracotta fill-terracotta" />
              <span className="hidden sm:inline">My Preferences</span>
              {likesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-terracotta text-ivory text-[10px] font-bold">
                  {likesCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-none border border-ink/15 hover:bg-ink/[0.03] transition"
              >
                <span className="w-7 h-7 bg-ink text-ivory text-xs font-display font-bold flex items-center justify-center">
                  {(username || 'A').charAt(0).toUpperCase()}
                </span>
                <span className="text-xs font-sans font-semibold text-ink hidden sm:block">{username || 'admin'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-ink/50 transition ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-ivory shadow-xl shadow-ink/10 border border-ink/10 animate-fade-up py-1">
                  <div className="px-3.5 py-2.5 border-b border-ink/10 flex items-center gap-2">
                    <User className="w-4 h-4 text-ink/50" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-ink truncate">{username || 'admin'}</div>
                      <div className="text-[10px] text-terracotta font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Authenticated admin
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-sans font-medium text-ink hover:bg-ink/[0.04] flex items-center gap-2 transition"
                  >
                    <Heart className="w-3.5 h-3.5 text-terracotta" /> My Preferences
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-sans font-semibold text-rust hover:bg-rust/[0.06] flex items-center gap-2 transition border-t border-ink/10"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
