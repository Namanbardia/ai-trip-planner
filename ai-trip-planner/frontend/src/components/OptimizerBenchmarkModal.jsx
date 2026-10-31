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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                How AI Organizes Your Route
              </h3>
              <p className="text-xs text-slate-500">
                Comparing two ways the planner organizes your sightseeing stops
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold">Testing route variations...</p>
            </div>
          ) : benchmarkData ? (
            <>
              {/* Winner Banner */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-4 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <Award className="w-7 h-7 text-yellow-300 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                      Better Route Quality
                    </div>
                    <div className="text-base font-bold">
                      Smart Search includes +{comp.percent_gain}% more of your favorite sights
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 shrink-0">
                  <div className="text-violet-200">Calculation speed</div>
                  <div className="font-bold">{comp.runtime_overhead_ms} ms (Instant)</div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Method 1: Smart Genetic Search */}
                <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Smart Multi-Stop Search
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Tests many stop combinations to fit the most meaningful attractions into your day without backtracking.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-slate-500">Stops visited:</span>
                      <strong className="text-slate-800">{genetic?.places_count} places</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-slate-500">Sightseeing hours:</span>
                      <strong className="text-slate-800">{genetic?.total_duration_hours} hrs</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-indigo-100">
                      <span className="text-slate-500">Route match value:</span>
                      <strong className="text-indigo-700 font-bold">{genetic?.total_score} pts</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Travel efficiency:</span>
                      <strong className="text-emerald-700 font-semibold">{genetic?.adherence_rate}% optimal</strong>
                    </div>
                  </div>
                </div>

                {/* Method 2: Nearest Stop */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Quick Nearest Stop
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Simple Baseline
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Simply heads to whatever attraction is closest right now, which can miss top sights later in the day.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Stops visited:</span>
                      <strong className="text-slate-800">{greedy?.places_count} places</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Sightseeing hours:</span>
                      <strong className="text-slate-800">{greedy?.total_duration_hours} hrs</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Route match value:</span>
                      <strong className="text-slate-700 font-bold">{greedy?.total_score} pts</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Travel efficiency:</span>
                      <strong className="text-emerald-700 font-semibold">{greedy?.adherence_rate}% optimal</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple Takeaway */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed">
                <strong>Why this matters for your trip:</strong> Visiting sights in the right sequence prevents unnecessary travel back and forth across town, letting you spend more time enjoying places and less time in transit.
              </div>
            </>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center">
              {error}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center">No comparison data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
