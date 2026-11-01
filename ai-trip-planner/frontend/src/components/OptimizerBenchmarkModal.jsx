import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Award, Compass } from 'lucide-react';
import { api } from '../api';

export default function OptimizerBenchmarkModal({
  isOpen,
  onClose,
  destination = 'paris'
}) {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const runBenchmark = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.compareOptimizers({
        destination,
        day: 1,
        max_time_budget_hours: 7.5
      });
      setBenchmarkData(data);
    } catch (err) {
      if (err.status !== 401) setError(err.message || 'Benchmark failed. Please try again.');
      console.error('Benchmark fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runBenchmark();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, destination]);

  if (!isOpen) return null;

  const greedy = benchmarkData?.greedy;
  const genetic = benchmarkData?.genetic;
  const comp = benchmarkData?.comparison;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-ivory max-w-2xl w-full shadow-2xl border border-ink/15 overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="p-6 border-b border-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-terracotta" />
            <div>
              <p className="kicker mb-1">Benchmark</p>
              <h3 className="font-display text-xl font-semibold">
                How the route solver earns its keep
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-sage hover:text-ink hover:bg-ink/[0.05] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sage">
              <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-sans text-xs font-semibold">Testing route variations…</p>
            </div>
          ) : benchmarkData ? (
            <>
              {/* Winner Banner */}
              <div className="bg-ink p-4 text-ivory flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7 text-gold shrink-0" />
                  <div>
                    <div className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-gold">
                      Better route quality
                    </div>
                    <div className="font-display text-base font-semibold">
                      Smart search fits +{comp.percent_gain}% more of your sights in
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs bg-ivory/10 px-3 py-1.5 shrink-0">
                  <div className="text-ivory/60 font-sans">Solve time</div>
                  <div className="font-sans font-bold">{comp.runtime_overhead_ms} ms</div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Method 1: Smart Genetic Search */}
                <div className="p-4 border-2 border-terracotta">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-terracotta" />
                      Smart multi-stop search
                    </span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.12em] px-2 py-0.5 bg-terracotta text-ivory">
                      Default
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-sage mb-3">
                    Tests many stop combinations to fit the most meaningful attractions into your day without backtracking.
                  </p>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Stops visited</span>
                      <strong>{genetic?.places_count} places</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Sightseeing hours</span>
                      <strong>{genetic?.total_duration_hours} hrs</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Route match value</span>
                      <strong className="text-terracotta">{genetic?.total_score} pts</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sage">Day utilisation</span>
                      <strong className="text-rust">{genetic?.adherence_rate}% optimal</strong>
                    </div>
                  </div>
                </div>

                {/* Method 2: Nearest Stop */}
                <div className="p-4 border border-ink/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-sm font-semibold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-gold" />
                      Quick nearest stop
                    </span>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.12em] px-2 py-0.5 border border-ink/20 text-sage">
                      Baseline
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-sage mb-3">
                    Simply heads to whatever attraction is closest right now, which can miss top sights later in the day.
                  </p>

                  <div className="space-y-2 text-xs font-sans">
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Stops visited</span>
                      <strong>{greedy?.places_count} places</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Sightseeing hours</span>
                      <strong>{greedy?.total_duration_hours} hrs</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-ink/10">
                      <span className="text-sage">Route match value</span>
                      <strong>{greedy?.total_score} pts</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sage">Day utilisation</span>
                      <strong className="text-rust">{greedy?.adherence_rate}% optimal</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple Takeaway */}
              <div className="border-l-2 border-terracotta pl-4 py-1 text-xs font-sans text-sage leading-relaxed">
                <strong className="text-ink">Why this matters:</strong> Visiting sights in the right
                sequence prevents travelling back and forth across town — more time enjoying places,
                less time in transit.
              </div>
            </>
          ) : error ? (
            <div className="p-4 bg-rust/[0.06] border border-rust/30 text-xs font-sans text-rust text-center">
              {error}
            </div>
          ) : (
            <p className="text-xs font-sans text-sage text-center">No comparison data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-bone border-t border-ink/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-ink text-ivory text-xs font-sans font-bold uppercase tracking-[0.16em] hover:bg-terracotta transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
