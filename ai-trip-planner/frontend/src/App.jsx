import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TripForm from './components/TripForm';
import TripMap from './components/MapContainer';
import ItineraryView from './components/ItineraryView';
import PersonalizationDrawer from './components/PersonalizationDrawer';
import OptimizerBenchmarkModal from './components/OptimizerBenchmarkModal';
import LoginScreen from './components/LoginScreen';
import PlanSkeleton from './components/PlanSkeleton';
import { api, getToken, getUser, setSession, clearSession } from './api';
import {
  Sparkles, MapPin, Shuffle, LineChart, AlertCircle,
  Compass, Route, Hotel
} from 'lucide-react';

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Name your city & your hotel',
    body: 'Any city on Earth works. Tell us where you are staying and every day is anchored at your hotel door — no dead time at either end of the day.'
  },
  {
    n: '02',
    title: 'The engine reads your taste',
    body: 'A semantic matcher scores every landmark against your interests and past likes, so foodies get food and historians get ruins — never one-size-fits-all days.'
  },
  {
    n: '03',
    title: 'Neighbourhoods become days',
    body: 'Attractions are clustered by geography, then a route solver packs each day under your chosen pace — fewer kilometres, more sights, no zig-zagging.'
  }
];

const SHOWCASE = [
  { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', span: 'lg:col-span-7 lg:row-span-2', h: 'h-[26rem] lg:h-full' },
  { name: 'Rome', country: 'Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80', span: 'lg:col-span-5', h: 'h-64' },
  { name: 'Barcelona', country: 'Spain', img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80', span: 'lg:col-span-5', h: 'h-64' },
  { name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', span: 'lg:col-span-4', h: 'h-56' },
  { name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80', span: 'lg:col-span-4', h: 'h-56' },
  { name: 'Delhi', country: 'India', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80', span: 'lg:col-span-4', h: 'h-56' }
];

export default function App() {
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));
  const [username, setUsername] = useState(getUser()?.username || 'admin');
  const [tripPlan, setTripPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [feedbackState, setFeedbackState] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastParams, setLastParams] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const showError = useCallback((msg) => {
    setErrorMessage(msg);
    setToastMessage(null);
    setTimeout(() => setErrorMessage(null), 6000);
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setIsAuthed(false);
    setTripPlan(null);
    setUserProfile(null);
    setIsProfileOpen(false);
    setIsBenchmarkOpen(false);
  }, []);

  // Global 401 handler: any apiFetch 401 kicks the user back to login
  useEffect(() => {
    const onUnauthorized = () => handleLogout();
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, [handleLogout]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setUserProfile(await api.userProfile());
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
  }, []);

  // After login: load profile only — no auto-planned trip on page load
  useEffect(() => {
    if (!isAuthed) return;
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const handleLogin = (token, name) => {
    setSession(token, name);
    setUsername(name);
    setIsAuthed(true);
    showToast(`Welcome back, ${name}!`);
  };

  const handlePlanTrip = async (formData) => {
    setIsLoading(true);
    setLastParams(formData);
    try {
      const data = await api.planTrip(formData);
      setTripPlan(data);
      setActiveDay(1);
      showToast(`Your ${data.destination} itinerary is ready.`);
      // Bring the itinerary into view once generated
      setTimeout(() => {
        document.getElementById('itinerary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (e) {
      if (e.status !== 401) showError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate completely different alternative spots
  const handleDiscoverDifferentSpots = () => {
    if (!lastParams) return;
    const freshSeed = Math.floor(Math.random() * 1000000);
    handlePlanTrip({ ...lastParams, variation_seed: freshSeed });
  };

  const handleFeedback = async (placeId, placeName, category, action) => {
    try {
      setFeedbackState((prev) => ({ ...prev, [placeId]: action }));
      const data = await api.feedback({ place_id: placeId, place_name: placeName, category, action });
      setUserProfile(data.personalization);
      if (action === 'like') {
        showToast(`Preference saved: more ${category.toLowerCase()} like ${placeName}.`);
      } else if (action === 'dislike') {
        showToast(`Preference saved: fewer places like ${placeName}.`);
      } else {
        showToast(`Skipped ${placeName}.`);
      }
    } catch (e) {
      if (e.status !== 401) showError(e.message || 'Could not save your feedback.');
    }
  };

  if (!isAuthed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans text-ink">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={handleLogout}
        username={username}
        likesCount={userProfile?.total_likes || 0}
      />

      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-ivory px-4 py-2.5 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-slide-in">
          <Sparkles className="w-4 h-4 text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rust text-white px-4 py-2.5 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-slide-in max-w-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <main className="flex-1">
        {/* ============================================================
            1. FULL-BLEED HERO
        ============================================================ */}
        {!tripPlan && !isLoading && (
          <section className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80"
              alt="Traveller looking over a mountain valley"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/25" />
            <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-28 sm:py-36 lg:py-44">
              <div className="max-w-3xl animate-fade-up">
                <p className="kicker !text-gold mb-5">The Intelligent Itinerary — Est. 2026</p>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-ivory leading-[1.02] tracking-tight">
                  Travel days,<br />
                  <em className="font-light">perfectly composed.</em>
                </h1>
                <p className="font-sans text-base sm:text-lg text-ivory/80 mt-6 max-w-xl leading-relaxed">
                  Name a city — any city — and TripBuddy assembles neighbourhood-perfect days:
                  your hotel as the anchor, your tastes as the compass, zero wasted transit.
                </p>
                <div className="flex flex-wrap items-center gap-x-10 gap-y-3 mt-10 text-ivory/70 text-xs font-sans">
                  <span className="flex items-center gap-2 uppercase tracking-[0.18em] font-semibold">
                    <Route className="w-4 h-4 text-gold" /> GA route solver
                  </span>
                  <span className="flex items-center gap-2 uppercase tracking-[0.18em] font-semibold">
                    <Compass className="w-4 h-4 text-gold" /> Any city worldwide
                  </span>
                  <span className="flex items-center gap-2 uppercase tracking-[0.18em] font-semibold">
                    <Hotel className="w-4 h-4 text-gold" /> Hotel-anchored days
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            2. EDITORIAL STRIP + HOW IT WORKS (pre-plan only)
        ============================================================ */}
        {!tripPlan && !isLoading && (
          <>
            <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
              <div className="rule-hairline grid grid-cols-2 lg:grid-cols-4 gap-y-8 pt-8">
                {[
                  ['7', 'Curated seed cities'],
                  ['∞', 'Cities via live OSM + Wikipedia'],
                  ['1–7', 'Days per itinerary'],
                  ['0', ' kilometres backtracked twice']
                ].map(([big, small]) => (
                  <div key={small} className="px-2">
                    <div className="font-display text-4xl font-semibold text-terracotta leading-none">{big}</div>
                    <div className="text-[11px] font-sans uppercase tracking-[0.18em] text-sage mt-2">{small}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
              <p className="kicker mb-4">How it works</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mb-12">
                Three steps between a city name and a perfect week.
              </h2>
              <div className="rule-hairline grid grid-cols-1 md:grid-cols-3">
                {HOW_IT_WORKS.map((step, i) => (
                  <article
                    key={step.n}
                    className={`py-10 md:px-8 ${i === 0 ? 'md:pl-0' : ''} ${i < HOW_IT_WORKS.length - 1 ? 'md:border-r border-ink/10' : 'md:pr-0'}`}
                  >
                    <div className="font-display text-5xl font-light text-terracotta/40 leading-none mb-5">{step.n}</div>
                    <h3 className="font-display text-xl font-semibold mb-3 leading-snug">{step.title}</h3>
                    <p className="font-sans text-sm text-sage leading-relaxed">{step.body}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* Destinations magazine grid */}
            <section className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-24">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="kicker mb-3">Destinations</p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                    Seven cities, hand-mapped.
                  </h2>
                </div>
                <p className="hidden md:block font-sans text-sm text-sage max-w-xs text-right leading-relaxed">
                  Or type any city in the world — we discover its landmarks live.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {SHOWCASE.map((d) => (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      window.dispatchEvent(new CustomEvent('destination:picked', { detail: d.name }));
                    }}
                    className={`group relative overflow-hidden img-overlay text-left ${d.span} ${d.h}`}
                  >
                    <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover img-zoom" />
                    <div className="absolute bottom-0 left-0 p-5 z-10">
                      <div className="font-display text-2xl font-semibold text-ivory">{d.name}</div>
                      <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-ivory/70 mt-1">{d.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ============================================================
            3. THE PLANNER
        ============================================================ */}
        <section id="planner" className={tripPlan ? '' : 'max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-24'}>
          <TripForm onPlanTrip={handlePlanTrip} isLoading={isLoading} />
        </section>

        {/* Loading skeleton */}
        {isLoading && !tripPlan && (
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 pb-24">
            <PlanSkeleton />
          </div>
        )}

        {/* ============================================================
            4. THE ITINERARY — story timeline + map
        ============================================================ */}
        <div id="itinerary">
          {tripPlan && (
            <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-16">
              {/* Trip masthead */}
              <header className="rule-hairline pt-10 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex items-end gap-6">
                  <img
                    src={tripPlan.image}
                    alt={tripPlan.destination}
                    className="w-28 h-28 lg:w-36 lg:h-36 object-cover shadow-lg"
                  />
                  <div>
                    <p className="kicker mb-2">
                      {tripPlan.country} — {tripPlan.days}-day itinerary
                    </p>
                    <h1 className="font-display text-4xl lg:text-5xl font-semibold tracking-tight leading-none">
                      {tripPlan.destination}
                    </h1>
                    <p className="font-sans text-sm text-sage mt-3 max-w-xl leading-relaxed line-clamp-2">
                      {tripPlan.description}
                    </p>
                    {tripPlan.start_location && (
                      <p className="font-sans text-xs text-terracotta mt-2 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        Each day begins at {tripPlan.start_location.name}
                      </p>
                    )}
                    {tripPlan.hotel_warning && (
                      <p className="font-sans text-xs text-rust mt-1 italic">{tripPlan.hotel_warning}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDiscoverDifferentSpots}
                    disabled={isLoading || !lastParams}
                    title="Generate an alternative set of sights and a fresh route"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-bold text-ink border border-ink/20 hover:bg-ink hover:text-ivory transition disabled:opacity-40"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Different Spots</span>
                  </button>

                  <button
                    onClick={() => setIsBenchmarkOpen(true)}
                    title="Compare the Genetic Algorithm against the greedy baseline"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-bold text-ivory bg-terracotta hover:bg-rust transition"
                  >
                    <LineChart className="w-3.5 h-3.5" />
                    <span>Benchmark Optimizers</span>
                  </button>
                </div>
              </header>

              {/* Map & Itinerary Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Interactive Map */}
                <div className="lg:col-span-5 sticky top-24 space-y-4">
                  <div className="flex items-center justify-between rule-hairline pt-3">
                    <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      The Route
                    </h3>
                    <span className="text-[10px] font-sans uppercase tracking-[0.18em] text-sage">
                      {activeDay === 0 ? 'All days' : `Day ${activeDay}`}
                    </span>
                  </div>
                  <TripMap tripPlan={tripPlan} activeDay={activeDay} />
                </div>

                {/* Right Column: Detailed Day Itinerary */}
                <div className="lg:col-span-7">
                  <ItineraryView
                    tripPlan={tripPlan}
                    activeDay={activeDay}
                    setActiveDay={setActiveDay}
                    onFeedback={handleFeedback}
                    feedbackState={feedbackState}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Personalization Drawer */}
      <PersonalizationDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
      />

      {/* Optimizer Benchmark Modal */}
      <OptimizerBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        destination={tripPlan?.destination || 'paris'}
      />

      {/* Footer */}
      <footer className="mt-16 bg-ink text-ivory/70">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="font-display text-2xl font-semibold text-ivory mb-3">TripBuddy</div>
              <p className="font-sans text-sm leading-relaxed max-w-xs">
                An intelligent itinerary engine: semantic taste matching, neighbourhood
                clustering, and a route solver that respects your time.
              </p>
            </div>
            <div className="font-sans text-xs space-y-2 uppercase tracking-[0.16em]">
              <div className="text-gold font-semibold mb-3">The Craft</div>
              <p>TF-IDF semantic matching</p>
              <p>K-Means day clustering</p>
              <p>Orienteering route optimisation</p>
              <p>Feedback personalisation</p>
            </div>
            <div className="font-sans text-xs space-y-2">
              <div className="text-gold font-semibold mb-3 uppercase tracking-[0.16em]">Session</div>
              <p className="capitalize">Signed in as {username}</p>
              <p className="text-ivory/50">Data from OpenStreetMap &amp; Wikipedia — free, open sources.</p>
            </div>
          </div>
          <div className="rule-hairline mt-12 pt-6 border-ivory/15 flex flex-col sm:flex-row justify-between gap-2 text-[11px] font-sans">
            <span>© 2026 TripBuddy — crafted for travellers who plan.</span>
            <span className="uppercase tracking-[0.18em]">Less transit · More seeing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
