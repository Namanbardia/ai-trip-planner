import React from 'react';
import { 
  Clock, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  SkipForward, 
  Footprints, 
  Car, 
  Train, 
  CarTaxiFront,
  Sparkles
} from 'lucide-react';

const MODE_ICON_MAP = {
  walking: Footprints,
  auto_rickshaw: Car,
  public_transit: Train,
  cab: CarTaxiFront
};

export default function ItineraryView({
  tripPlan,
  activeDay,
  setActiveDay,
  onFeedback,
  feedbackState
}) {
  if (!tripPlan || !tripPlan.daily_routes || tripPlan.daily_routes.length === 0) {
    return null;
  }

  const { daily_routes } = tripPlan;
  const currentDayPlan = activeDay === 0
    ? null
    : daily_routes.find((d) => d.day === activeDay) || daily_routes[0];

  const daysToRender = activeDay === 0 ? daily_routes : [currentDayPlan];

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveDay(0)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeDay === 0
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          View Full Trip ({daily_routes.length} Days)
        </button>

        {daily_routes.map((dayPlan) => (
          <button
            key={dayPlan.day}
            onClick={() => setActiveDay(dayPlan.day)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeDay === dayPlan.day
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Day {dayPlan.day}</span>
            <span className="text-[10px] opacity-80 font-normal">
              ({dayPlan.attractions?.length || 0} stops)
            </span>
          </button>
        ))}
      </div>

      {/* Render Days */}
      {daysToRender.map((dayPlan) => {
        if (!dayPlan) return null;
        const attractions = dayPlan.attractions || [];
        const transitLegs = dayPlan.transit_legs || [];

        return (
          <div key={`day-card-${dayPlan.day}`} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            {/* Day Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Day {dayPlan.day} Itinerary
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Neighborhood-grouped route
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{dayPlan.theme}</h3>
              </div>

              {/* Day Quick Summary */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-slate-500">Sightseeing:</span>
                  <span className="font-bold text-slate-800">
                    ~{dayPlan.total_duration_hours} hrs total
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-slate-500">Transit:</span>
                  <span className="font-bold text-slate-800">{dayPlan.total_distance_km} km</span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-semibold flex items-center gap-1">
                  <span>Fits your planned pace</span>
                </div>
              </div>
            </div>

            {/* Stops Sequence */}
            <div className="space-y-4">
              {attractions.map((place, stopIdx) => {
                const leg = transitLegs[stopIdx];
                const ModeIcon = leg ? MODE_ICON_MAP[leg.mode] || Car : Car;
                const fb = feedbackState[place.id];

                return (
                  <React.Fragment key={place.id || stopIdx}>
                    {/* Transit Leg Between Stops */}
                    {leg && (
                      <div className="flex items-center gap-3 pl-4 py-1">
                        <div className="w-8 flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-slate-200" />
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                            <ModeIcon className="w-3 h-3 text-indigo-600" />
                          </div>
                          <div className="w-0.5 h-4 bg-slate-200" />
                        </div>

                        <div className="flex-1 bg-slate-50/80 rounded-xl px-3.5 py-2 border border-slate-200/70 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 capitalize">
                              {leg.mode === 'walking' ? 'Walk' : leg.mode === 'public_transit' ? 'Metro / Bus' : leg.mode === 'auto_rickshaw' ? 'Short Ride' : 'Taxi'}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">{leg.distance_km} km</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">Takes ~{leg.duration_mins} mins</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {leg.rationale}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Attraction Item Card */}
                    <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition shadow-xs flex flex-col sm:flex-row gap-4 items-start">
                      {/* Sequential Number Badge */}
                      <div className="flex sm:flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {stopIdx + 1}
                        </div>
                        <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider hidden sm:block">
                          Stop #{stopIdx + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-slate-900">{place.name}</h4>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {place.category}
                            </span>
                          </div>

                          {/* Match Score Badge */}
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 font-bold text-xs">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>{Math.round((place.relevance_score || 0.8) * 100)}% Match with your interests</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                          {place.description}
                        </p>

                        {/* Meta: Duration, Rating */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Suggested visit time: <strong>~{place.duration_hours} hrs</strong></span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-amber-500 font-bold">★ {place.rating}</span>
                            <span className="text-slate-400">rating</span>
                          </div>

                          {place.reviews && place.reviews.length > 0 && (
                            <div className="text-[11px] text-slate-400 italic line-clamp-1 flex-1">
                              "{place.reviews[0]}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Feedback Buttons */}
                      <div className="flex sm:flex-col items-center gap-1.5 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onFeedback(place.id, place.name, place.category, 'like')}
                          title="Like: Show me more places like this in future plans"
                          className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition ${
                            fb === 'like'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 bg-slate-50'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Like</span>
                        </button>

                        <button
                          onClick={() => onFeedback(place.id, place.name, place.category, 'dislike')}
                          title="Dislike: Show fewer places like this"
                          className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition ${
                            fb === 'dislike'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50 bg-slate-50'
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Dislike</span>
                        </button>

                        <button
                          onClick={() => onFeedback(place.id, place.name, place.category, 'skip')}
                          title="Skip: Remove from this trip"
                          className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition ${
                            fb === 'skip'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50 bg-slate-50'
                          }`}
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Skip</span>
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
