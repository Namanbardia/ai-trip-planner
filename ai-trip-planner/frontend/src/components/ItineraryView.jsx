import React from 'react';
import {
  Clock,
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

const MODE_LABEL_MAP = {
  walking: 'Walk',
  public_transit: 'Metro / Bus',
  auto_rickshaw: 'Short Ride',
  cab: 'Taxi'
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

  const { daily_routes, start_location: startLocation } = tripPlan;
  const currentDayPlan = activeDay === 0
    ? null
    : daily_routes.find((d) => d.day === activeDay) || daily_routes[0];

  const daysToRender = activeDay === 0 ? daily_routes : [currentDayPlan];
  const startName = startLocation?.name || 'City centre';

  return (
    <div className="space-y-8">
      {/* Day selector — editorial tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 rule-hairline pt-3">
        <button
          onClick={() => setActiveDay(0)}
          className={`px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-[0.14em] transition whitespace-nowrap border ${
            activeDay === 0
              ? 'bg-ink text-ivory border-ink'
              : 'border-ink/15 text-sage hover:border-ink/40 hover:text-ink'
          }`}
        >
          Full Trip · {daily_routes.length} Days
        </button>

        {daily_routes.map((dayPlan) => (
          <button
            key={dayPlan.day}
            onClick={() => setActiveDay(dayPlan.day)}
            className={`px-4 py-2 text-[11px] font-sans font-bold uppercase tracking-[0.14em] transition whitespace-nowrap border flex items-center gap-2 ${
              activeDay === dayPlan.day
                ? 'bg-terracotta text-ivory border-terracotta'
                : 'border-ink/15 text-sage hover:border-ink/40 hover:text-ink'
            }`}
          >
            <span>Day {dayPlan.day}</span>
            <span className="text-[9px] font-normal opacity-70">
              {dayPlan.attractions?.length || 0} stops
            </span>
          </button>
        ))}
      </div>

      {/* Render Days as chapters */}
      {daysToRender.map((dayPlan) => {
        if (!dayPlan) return null;
        const attractions = dayPlan.attractions || [];
        const transitLegs = dayPlan.transit_legs || [];

        return (
          <article key={`day-${dayPlan.day}`} className="animate-fade-up">
            {/* Chapter heading */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-display text-6xl font-light text-terracotta/35 leading-none">
                  {String(dayPlan.day).padStart(2, '0')}
                </span>
                <div className="rule-hairline flex-1 pt-2">
                  <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-sage">
                    {dayPlan.attractions?.length || 0} stops · ~{dayPlan.total_duration_hours} hrs · {dayPlan.total_distance_km} km transit
                  </div>
                </div>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                {dayPlan.theme}
              </h3>
            </header>

            {/* The day's story: start marker → stops → transit connectors */}
            <div className="space-y-0">
              {/* Day start */}
              <div className="flex items-center gap-4 pb-4">
                <div className="w-8 flex flex-col items-center self-stretch">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink mt-1.5" />
                  <div className="w-px flex-1 bg-ink/20" />
                </div>
                <div className="text-xs font-sans text-sage italic">
                  Your day begins at <span className="font-semibold not-italic text-ink">{startName}</span>
                </div>
              </div>

              {attractions.map((place, stopIdx) => {
                const leg = transitLegs[stopIdx];
                const ModeIcon = leg ? MODE_ICON_MAP[leg.mode] || Car : Car;
                const fb = feedbackState[place.id];

                return (
                  <React.Fragment key={place.id || stopIdx}>
                    {/* Transit leg connector */}
                    {leg && (
                      <div className="flex items-center gap-4 py-1">
                        <div className="w-8 flex flex-col items-center self-stretch">
                          <div className="w-px flex-1 bg-ink/20" />
                          <div className="w-6 h-6 rounded-full bg-bone text-ink flex items-center justify-center border border-ink/10 my-1">
                            <ModeIcon className="w-3 h-3 text-terracotta" />
                          </div>
                          <div className="w-px flex-1 bg-ink/20" />
                        </div>
                        <div className="text-[11px] font-sans text-sage flex flex-wrap items-center gap-x-2">
                          <span className="font-bold text-ink uppercase tracking-[0.1em]">
                            {MODE_LABEL_MAP[leg.mode] || 'Ride'}
                          </span>
                          <span className="text-ink/25">·</span>
                          <span>{leg.distance_km} km</span>
                          <span className="text-ink/25">·</span>
                          <span>~{leg.duration_mins} min</span>
                          <span className="italic text-ink/40 hidden sm:inline">{leg.rationale}</span>
                        </div>
                      </div>
                    )}

                    {/* The stop — editorial row */}
                    <div className="flex items-stretch gap-4 group">
                      {/* Stop number on the timeline */}
                      <div className="w-8 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-terracotta text-ivory font-display font-bold text-sm flex items-center justify-center shrink-0">
                          {stopIdx + 1}
                        </div>
                        <div className="w-px flex-1 bg-ink/20 mt-2" />
                      </div>

                      {/* Stop content */}
                      <div className="flex-1 pb-8 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-display text-lg font-semibold leading-tight">{place.name}</h4>
                              <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.16em] text-terracotta border border-terracotta/30 px-2 py-0.5">
                                {place.category}
                              </span>
                            </div>
                            <p className="font-sans text-xs text-sage leading-relaxed mb-2 line-clamp-2">
                              {place.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-sans text-sage">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> ~{place.duration_hours} hrs
                              </span>
                              <span className="text-gold font-bold">★ {place.rating}</span>
                              <span className="flex items-center gap-1 text-terracotta font-semibold">
                                <Sparkles className="w-3 h-3" />
                                {Math.round((place.relevance_score || 0.8) * 100)}% match
                              </span>
                              {place.reviews && place.reviews.length > 0 && (
                                <span className="italic text-ink/40 line-clamp-1 flex-1 min-w-[140px]">
                                  “{place.reviews[0]}”
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Feedback — minimal text buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            {[
                              { action: 'like', icon: ThumbsUp, on: 'bg-ink text-ivory border-ink', off: 'border-ink/15 text-sage hover:border-ink hover:text-ink', title: 'Like — more like this' },
                              { action: 'dislike', icon: ThumbsDown, on: 'bg-rust text-white border-rust', off: 'border-ink/15 text-sage hover:border-rust hover:text-rust', title: 'Dislike — fewer like this' },
                              { action: 'skip', icon: SkipForward, on: 'bg-gold text-ink border-gold', off: 'border-ink/15 text-sage hover:border-gold hover:text-gold', title: 'Skip — not for me' }
                            ].map(({ action, icon: Icon, on, off, title }) => (
                              <button
                                key={action}
                                onClick={() => onFeedback(place.id, place.name, place.category, action)}
                                title={title}
                                aria-label={title}
                                className={`p-1.5 border transition ${fb === action ? on : off}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Day end */}
              <div className="flex items-center gap-4">
                <div className="w-8 flex flex-col items-center">
                  <div className="w-px h-5 bg-ink/20" />
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-ink" />
                </div>
                <div className="text-[11px] font-sans text-sage italic">
                  Back to {startName} · day fits your {tripPlan.daily_routes[0]?.time_budget_hours || 7.5}-hour pace
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
