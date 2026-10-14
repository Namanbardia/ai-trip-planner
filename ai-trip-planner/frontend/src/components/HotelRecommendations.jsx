import React from 'react';
import { Hotel, Star, MapPin, Navigation, Award, CheckCircle } from 'lucide-react';

export default function HotelRecommendations({
  recommendedHotel,
  rankedHotels,
  onSelectHotel
}) {
  if (!recommendedHotel && (!rankedHotels || rankedHotels.length === 0)) {
    return null;
  }

  const activeHotel = recommendedHotel || (rankedHotels && rankedHotels[0]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Where to Stay</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Suggested accommodations chosen to keep travel time to your daily sightseeing stops as short as possible.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1 w-fit">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          Closest to your daily routes
        </span>
      </div>

      {/* Primary Recommended Hotel Feature Card */}
      {activeHotel && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-5 text-white mb-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Recommended Base Hotel
                </span>
                <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                  ★ {activeHotel.rating} / 5.0
                </span>
              </div>
              <h4 className="text-xl font-bold tracking-tight text-white mb-1">
                {activeHotel.name}
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-3">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                {activeHotel.ranking_rationale || `Average ${activeHotel.avg_distance_to_route_km} km to all your sightseeing stops`}
              </p>

              {/* Location Highlights */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-slate-300 text-[11px]">Location Score: </span>
                  <strong className="text-emerald-400">Prime Spot ({Math.round((activeHotel.proximity_score || 0.9) * 100)}% fit)</strong>
                </div>
                <div className="bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-slate-300 text-[11px]">Average Transit: </span>
                  <strong className="text-yellow-300">{activeHotel.avg_distance_to_route_km} km to stops</strong>
                </div>
              </div>
            </div>

            {activeHotel.amenities && (
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 min-w-[160px]">
                <div className="text-xs font-semibold text-slate-200 mb-1.5">Hotel Perks</div>
                <div className="space-y-1">
                  {activeHotel.amenities.map((am, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1">
                      <span className="text-emerald-400">✓</span> {am}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alternative Candidate Hotels */}
      {rankedHotels && rankedHotels.length > 1 && (
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
            Other Good Hotel Options Nearby
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rankedHotels.map((h, i) => {
              const isSelected = activeHotel && activeHotel.name === h.name;
              return (
                <div
                  key={h.id || i}
                  className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-900 line-clamp-1">{h.name}</span>
                      <span className="text-[11px] font-semibold text-amber-600">★ {h.rating}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mb-2">
                      ~{h.avg_distance_to_route_km} km from your daily route
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      {h.amenities ? h.amenities[0] : 'Central Stay'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectHotel && onSelectHotel(h)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected Base' : 'Set as Base'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
