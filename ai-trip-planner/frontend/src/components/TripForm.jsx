import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Search, 
  Check, 
  Compass, 
  Shuffle 
} from 'lucide-react';

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

export default function TripForm({ onPlanTrip, isLoading, onShuffleVariation }) {
  const [destination, setDestination] = useState('delhi');
  const [customCity, setCustomCity] = useState('');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [pacePreference, setPacePreference] = useState('moderate');
  const [useGeneticAlgorithm, setUseGeneticAlgorithm] = useState(true);

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalDest = customCity.trim() ? customCity.trim() : destination;
    onPlanTrip({
      destination: finalDest,
      days: Number(days),
      interests,
      interest_tags: selectedTags,
      pace_preference: pacePreference,
      use_genetic_algorithm: useGeneticAlgorithm,
      variation_seed: Math.floor(Math.random() * 1000000)
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Where would you like to travel?
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Pick any city in the world. Our AI organizes sights into neighborhood days so you spend less time in transit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            1. Choose a city or search any destination
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3">
            {POPULAR_DESTINATIONS.map((dest) => {
              const isSelected = !customCity && destination === dest.key;
              return (
                <button
                  type="button"
                  key={dest.key}
                  onClick={() => handleSelectPopular(dest.key)}
                  className={`relative overflow-hidden rounded-xl p-2 text-left transition-all border ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <img
                    src={dest.img}
                    alt={dest.name}
                    className="w-full h-14 object-cover rounded-lg mb-1.5"
                  />
                  <div className="font-semibold text-xs text-slate-900">{dest.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{dest.country}</div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="Or search any city in the world (e.g. Dubai, Sydney, Berlin, Kyoto, New York, Amsterdam)..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
          {customCity.trim() && (
            <div className="mt-1.5 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
              <span>Ready to search live sights for "{customCity}"</span>
            </div>
          )}
        </div>

        {/* Days & Daily Pace */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Trip Duration */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                2. Trip Length
              </label>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                {days} {days === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
              <span>Quick 1-Day Trip</span>
              <span>3 Days (Popular)</span>
              <span>Full 5 Days</span>
            </div>
          </div>

          {/* Daily Pace */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              3. How busy should each day be?
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
              {[
                { key: 'relaxed', label: 'Relaxed', desc: '5-6 hrs / day' },
                { key: 'moderate', label: 'Balanced', desc: '7-8 hrs / day' },
                { key: 'fast', label: 'Packed', desc: '9+ hrs / day' }
              ].map((p) => (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => setPacePreference(p.key)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition text-center ${
                    pacePreference === p.key
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-[10px] opacity-80">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interests & Travel Style */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              4. What do you enjoy doing?
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Describe your dream style</span>
          </div>
          <textarea
            rows="2"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="E.g. I love exploring food markets, historic monuments, quiet parks, and scenic viewpoints..."
            className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
          />

          {/* Quick tags */}
          <div className="mt-2.5">
            <div className="text-[11px] font-medium text-slate-500 mb-1.5">
              Click to quickly add travel themes:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      active
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
        <div className="flex items-center justify-between bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Route Planning: {useGeneticAlgorithm ? 'Smart Multi-Stop Search' : 'Quick Nearest Stop'}
              </div>
              <div className="text-[11px] text-slate-500">
                {useGeneticAlgorithm
                  ? 'Tests multiple combinations to fit the most relevant attractions into your day without backtracking.'
                  : 'Visits places by choosing the closest unvisited stop step-by-step.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUseGeneticAlgorithm(!useGeneticAlgorithm)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 ml-3 whitespace-nowrap"
          >
            Switch to {useGeneticAlgorithm ? 'Quick Route' : 'Smart Search'}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all ${
            isLoading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Matching top sights and organizing your daily schedule...</span>
            </>
          ) : (
            <>
              <span>Create My Personalized Itinerary</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
