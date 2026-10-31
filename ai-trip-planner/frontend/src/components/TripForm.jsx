import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronRight,
  Search,
  Check,
  Compass,
  AlertCircle,
  Hotel,
  Loader2,
  MapPin
} from 'lucide-react';
import { api } from '../api';

const POPULAR_DESTINATIONS = [
  { key: 'delhi', name: 'Delhi', country: 'India', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
  { key: 'paris', name: 'Paris', country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
  { key: 'tokyo', name: 'Tokyo', country: 'Japan', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80' },
  { key: 'london', name: 'London', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80' },
  { key: 'rome', name: 'Rome', country: 'Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
  { key: 'barcelona', name: 'Barcelona', country: 'Spain', img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=400&q=80' },
  { key: 'jaipur', name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80' }
];

const QUICK_TAGS = [
  'Art & Museums', 'History & Castles', 'Parks & Nature', 'Food & Cafes',
  'Architecture', 'Photo Spots', 'Temples & Shrines', 'Shopping', 'Nightlife', 'Relaxation'
];

export default function TripForm({ onPlanTrip, isLoading }) {
  const [destination, setDestination] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [pacePreference, setPacePreference] = useState('moderate');
  const [useGeneticAlgorithm, setUseGeneticAlgorithm] = useState(true);
  const [hotelName, setHotelName] = useState('');
  const [hotelStatus, setHotelStatus] = useState(null); // null | 'checking' | 'found' | 'not-found'
  const [hotelResult, setHotelResult] = useState(null);
  const [formError, setFormError] = useState('');
  const hotelCheckTimer = useRef(null);

  // The destinations showcase grid dispatches this event when a tile is clicked
  useEffect(() => {
    const onPick = (e) => {
      setDestination(String(e.detail || '').toLowerCase());
      setCustomCity('');
    };
    window.addEventListener('destination:picked', onPick);
    return () => window.removeEventListener('destination:picked', onPick);
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSelectPopular = (key) => {
    setDestination(key);
    setCustomCity('');
    setFormError('');
  };

  // Live hotel lookup (debounced) — validates against the geocode endpoint
  const checkHotel = async (query, city) => {
    if (!query.trim()) {
      setHotelStatus(null);
      setHotelResult(null);
      return;
    }
    setHotelStatus('checking');
    try {
      const data = await api.geocodeHotel({ query: query.trim(), city: city || undefined });
      setHotelResult(data);
      setHotelStatus('found');
    } catch (e) {
      if (e.status === 401) return; // session expired; global handler covers it
      setHotelResult(null);
      setHotelStatus('not-found');
    }
  };

  const handleHotelChange = (value) => {
    setHotelName(value);
    setHotelResult(null);
    if (hotelCheckTimer.current) clearTimeout(hotelCheckTimer.current);
    if (!value.trim()) {
      setHotelStatus(null);
      return;
    }
    setHotelStatus('checking');
    const city = customCity.trim() || destination;
    hotelCheckTimer.current = setTimeout(() => checkHotel(value, city), 700);
  };

  const handleHotelBlur = () => {
    if (hotelCheckTimer.current) clearTimeout(hotelCheckTimer.current);
    if (hotelName.trim()) checkHotel(hotelName, customCity.trim() || destination);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDest = customCity.trim() ? customCity.trim() : destination;
    if (!finalDest.trim()) {
      setFormError('Please choose or type a destination first.');
      return;
    }
    setFormError('');
    onPlanTrip({
      destination: finalDest,
      days: Number(days),
      interests,
      interest_tags: selectedTags,
      pace_preference: pacePreference,
      use_genetic_algorithm: useGeneticAlgorithm,
      hotel_name: hotelName.trim() || null,
      variation_seed: Math.floor(Math.random() * 1000000)
    });
  };

  return (
    <div className="rule-hairline pt-12 pb-4">
      <div className="mb-10 max-w-2xl">
        <p className="kicker mb-3">The Planner</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Where shall we send you?
        </h2>
        <p className="font-sans text-sm text-sage mt-2 leading-relaxed">
          Pick a curated city or search anywhere on Earth. Every day is anchored at your hotel
          and packed to your pace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Destination Selection */}
        <div>
          <label className="kicker block mb-4">01 — Choose a city</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = !customCity && destination === dest.key;
              return (
                <button
                  type="button"
                  key={dest.key}
                  onClick={() => handleSelectPopular(dest.key)}
                  className={`group relative overflow-hidden text-left transition-all ${
                    isSelected ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-ivory' : ''
                  }`}
                >
                  <div className="relative img-overlay">
                    <img
                      src={dest.img}
                      alt={dest.name}
                      className={`w-full h-20 object-cover img-zoom ${isSelected ? '' : 'saturate-[0.85] group-hover:saturate-100'}`}
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 p-2 z-10">
                    <div className="font-display text-sm font-semibold text-ivory leading-tight">{dest.name}</div>
                    <div className="text-[9px] font-sans uppercase tracking-[0.15em] text-ivory/70">{dest.country}</div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-terracotta text-white flex items-center justify-center z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-sage absolute left-0 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customCity}
              onChange={(e) => {
                setCustomCity(e.target.value);
                setFormError('');
              }}
              placeholder="…or search any city in the world (Dubai, Sydney, Berlin, Kyoto, New York…)"
              className="w-full pl-7 pr-4 py-2.5 font-sans text-sm bg-transparent border-0 border-b border-ink/25 focus:outline-none focus:border-terracotta placeholder:text-sage/70 transition"
            />
          </div>
          {customCity.trim() && (
            <div className="mt-2 text-[11px] font-sans text-terracotta font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Live landmarks will be discovered for “{customCity}”</span>
            </div>
          )}
        </div>

        {/* Hotel + Duration + Pace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Hotel anchoring */}
          <div className="lg:col-span-5">
            <label className="kicker block mb-4">02 — Where are you staying?</label>
            <div className="relative">
              <Hotel className="w-4 h-4 text-sage absolute left-0 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hotelName}
                onChange={(e) => handleHotelChange(e.target.value)}
                onBlur={handleHotelBlur}
                placeholder="Hotel name (e.g. Taj Palace New Delhi) — optional"
                className="w-full pl-7 pr-8 py-2.5 font-sans text-sm bg-transparent border-0 border-b border-ink/25 focus:outline-none focus:border-terracotta placeholder:text-sage/70 transition"
              />
              {hotelStatus === 'checking' && (
                <Loader2 className="w-4 h-4 text-sage absolute right-0 top-1/2 -translate-y-1/2 animate-spin" />
              )}
              {hotelStatus === 'found' && (
                <Check className="w-4 h-4 text-terracotta absolute right-0 top-1/2 -translate-y-1/2 stroke-[3]" />
              )}
            </div>
            {hotelStatus === 'found' && hotelResult && (
              <p className="mt-2 text-[11px] font-sans text-terracotta font-semibold flex items-start gap-1.5">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Found: {hotelResult.display_name}</span>
              </p>
            )}
            {hotelStatus === 'not-found' && (
              <p className="mt-2 text-[11px] font-sans text-rust font-semibold">
                Couldn’t find “{hotelName}” — add the city (e.g. “Taj Palace New Delhi”), or leave it
                empty to start from the city centre.
              </p>
            )}
            {hotelStatus === null && (
              <p className="mt-2 text-[11px] font-sans text-sage italic">
                Optional — leave empty to anchor each day at the city centre.
              </p>
            )}
          </div>

          {/* Trip Length */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <label className="kicker">03 — Trip length</label>
              <span className="font-display text-lg font-semibold text-terracotta">
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[#c2532c] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-sans uppercase tracking-[0.14em] text-sage mt-2">
              <span>1-Day</span>
              <span>4</span>
              <span>Full 7</span>
            </div>
          </div>

          {/* Daily Pace */}
          <div className="lg:col-span-3">
            <label className="kicker block mb-4">04 — Daily pace</label>
            <div className="flex border border-ink/15 divide-x divide-ink/15">
              {[
                { key: 'relaxed', label: 'Relaxed' },
                { key: 'moderate', label: 'Balanced' },
                { key: 'fast', label: 'Packed' }
              ].map((p) => (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => setPacePreference(p.key)}
                  className={`flex-1 py-2.5 text-xs font-sans font-semibold transition ${
                    pacePreference === p.key
                      ? 'bg-ink text-ivory'
                      : 'text-sage hover:bg-ink/[0.04]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-sans text-sage mt-2 italic">
              {pacePreference === 'relaxed' ? '~5–6 hrs per day' : pacePreference === 'moderate' ? '~7–8 hrs per day' : '9+ hrs per day'}
            </p>
          </div>
        </div>

        {/* Interests & Travel Style */}
        <div className="rule-hairline pt-8">
          <div className="flex items-center justify-between mb-3">
            <label className="kicker">05 — What do you love?</label>
            <span className="text-[11px] font-sans text-sage">Describe your dream style</span>
          </div>
          <textarea
            rows="2"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="E.g. I love street food, historic monuments, quiet gardens, and rooftop views…"
            className="w-full p-3 font-sans text-sm bg-transparent border border-ink/15 focus:outline-none focus:border-terracotta text-ink placeholder:text-sage/70 transition"
          />

          {/* Quick tags */}
          <div className="mt-4">
            <div className="text-[11px] font-sans font-medium text-sage mb-2">
              Or pick a theme:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs font-sans font-medium transition border ${
                      active
                        ? 'bg-terracotta text-ivory border-terracotta'
                        : 'border-ink/20 text-sage hover:border-ink/50 hover:text-ink'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Smart Route Planning Preference */}
        <div className="flex items-center justify-between border-y border-ink/10 py-4">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-terracotta shrink-0" />
            <div>
              <div className="text-xs font-sans font-bold text-ink">
                Route solver: {useGeneticAlgorithm ? 'Smart multi-stop search' : 'Quick nearest stop'}
              </div>
              <div className="text-[11px] font-sans text-sage">
                {useGeneticAlgorithm
                  ? 'Tests many stop combinations to fit the most into your day without backtracking.'
                  : 'Visits places step-by-step by choosing the closest unvisited stop.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUseGeneticAlgorithm(!useGeneticAlgorithm)}
            className="text-xs font-sans font-bold text-terracotta hover:text-rust underline underline-offset-4 ml-3 whitespace-nowrap"
          >
            Switch to {useGeneticAlgorithm ? 'Quick' : 'Smart'}
          </button>
        </div>

        {/* Inline validation error */}
        {formError && (
          <div className="p-3 bg-rust/[0.06] border border-rust/30 text-xs font-sans text-rust flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 font-sans text-sm font-bold uppercase tracking-[0.2em] text-ivory flex items-center justify-center gap-3 transition-all ${
            isLoading
              ? 'bg-sage cursor-not-allowed'
              : 'bg-terracotta hover:bg-rust active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-ivory/40 border-t-ivory rounded-full animate-spin" />
              <span>Composing your days…</span>
            </>
          ) : (
            <>
              <span>Compose my itinerary</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
