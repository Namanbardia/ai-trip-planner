import React from 'react';
import { 
  X, 
  Heart, 
  ThumbsDown, 
  BookmarkCheck, 
  Sliders, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Lightbulb
} from 'lucide-react';

export default function PersonalizationDrawer({
  isOpen,
  onClose,
  userProfile
}) {
  if (!isOpen) return null;

  const {
    total_likes = 0,
    total_dislikes = 0,
    total_skipped = 0,
    total_saved_trips = 0,
    category_weights = {},
    liked_places = [],
    disliked_places = [],
    saved_trips = []
  } = userProfile || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Travel Preferences</h3>
              <p className="text-[11px] text-slate-500">
                Learns what you like to customize your recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Helpful Tip */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>How it works:</strong> Click <strong>Like</strong> (👍) or <strong>Dislike</strong> (👎) on any stop in your itinerary. The AI updates your preferences and customizes your next plan!
            </span>
          </div>

          {/* Activity Counters */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-lg font-bold text-emerald-700">{total_likes}</div>
              <div className="text-[10px] font-semibold text-emerald-800">Liked</div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <div className="text-lg font-bold text-rose-700">{total_dislikes}</div>
              <div className="text-[10px] font-semibold text-rose-800">Disliked</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
              <div className="text-lg font-bold text-amber-700">{total_skipped}</div>
              <div className="text-[10px] font-semibold text-amber-800">Skipped</div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-lg font-bold text-indigo-700">{total_saved_trips}</div>
              <div className="text-[10px] font-semibold text-indigo-800">Saved Trips</div>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Category Preferences
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Auto-updated</span>
            </div>

            {Object.keys(category_weights).length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                You haven't rated any places yet. Like or dislike places on your itinerary to see your personal taste profile build up here!
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(category_weights).map(([cat, weight]) => {
                  const isBoosted = weight > 1.0;
                  const isPenalized = weight < 1.0;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <div className="flex items-center gap-1.5">
                        {isBoosted && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Preferred
                          </span>
                        )}
                        {isPenalized && (
                          <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Less frequent
                          </span>
                        )}
                        {!isBoosted && !isPenalized && (
                          <span className="text-[11px] text-slate-500">Neutral</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Places You Liked */}
          {liked_places.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Places You Liked ({liked_places.length})
              </h4>
              <div className="space-y-1.5">
                {liked_places.map((place, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">{place.place_name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {place.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Places You Disliked */}
          {disliked_places.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                Places You Skipped / Disliked ({disliked_places.length})
              </h4>
              <div className="space-y-1.5">
                {disliked_places.map((place, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-xs flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700">{place.place_name}</span>
                    <span className="text-[10px] text-rose-600">{place.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Trips */}
          {saved_trips.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
                Your Saved Itineraries ({saved_trips.length})
              </h4>
              <div className="space-y-2">
                {saved_trips.map((trip) => (
                  <div
                    key={trip.trip_id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="font-bold text-slate-900 mb-0.5">
                      {trip.destination} ({trip.days} Days)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Base Hotel: {trip.hotel_name} • {trip.attractions_count} stops organized
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
