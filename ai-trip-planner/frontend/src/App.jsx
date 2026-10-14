import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TripForm from './components/TripForm';
import TripMap from './components/MapContainer';
import ItineraryView from './components/ItineraryView';
import HotelRecommendations from './components/HotelRecommendations';
import PersonalizationDrawer from './components/PersonalizationDrawer';
import OptimizerBenchmarkModal from './components/OptimizerBenchmarkModal';
import { Sparkles, MapPin, BookmarkPlus, CheckCircle2, Shuffle } from 'lucide-react';

export default function App() {
  const [tripPlan, setTripPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [feedbackState, setFeedbackState] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [lastParams, setLastParams] = useState({
    destination: 'delhi',
    days: 3,
    interests: '',
    interest_tags: [],
    pace_preference: 'moderate',
    use_genetic_algorithm: true
  });

  useEffect(() => {
    fetchInitialPlan();
    fetchUserProfile();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user-profile');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      }
    } catch (e) {
      console.error('Failed to fetch user profile:', e);
    }
  };

  const fetchInitialPlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastParams)
      });
      if (res.ok) {
        const data = await res.json();
        setTripPlan(data);
        setActiveDay(1);
        setIsSaved(false);
      }
    } catch (e) {
      console.error('Error fetching initial trip plan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanTrip = async (formData) => {
    setIsLoading(true);
    setIsSaved(false);
    setLastParams(formData);
    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        setTripPlan(data);
        setActiveDay(1);
        showToast(`Trip plan for ${data.destination} is ready!`);
      } else {
        showToast('Could not create trip plan. Please try again.');
      }
    } catch (e) {
      console.error('Error planning trip:', e);
      showToast('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate completely different alternative spots
  const handleDiscoverDifferentSpots = () => {
    const freshSeed = Math.floor(Math.random() * 1000000);
    const updatedParams = {
      ...lastParams,
      variation_seed: freshSeed
    };
    handlePlanTrip(updatedParams);
    showToast('Finding alternative sights and refreshing your route...');
  };

  const handleFeedback = async (placeId, placeName, category, action) => {
    try {
      setFeedbackState((prev) => ({ ...prev, [placeId]: action }));

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          place_name: placeName,
          category,
          action
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.personalization);
        if (action === 'like') {
          showToast(`Saved preference: You like ${placeName} (${category})!`);
        } else if (action === 'dislike') {
          showToast(`Saved preference: Less places like ${placeName}.`);
        } else {
          showToast(`Skipped ${placeName}.`);
        }
      }
    } catch (e) {
      console.error('Feedback error:', e);
    }
  };

  const handleSelectHotel = (hotel) => {
    if (!tripPlan) return;
    const updatedPlan = {
      ...tripPlan,
      recommended_hotel: hotel
    };
    setTripPlan(updatedPlan);
    showToast(`Base hotel set to ${hotel.name}.`);
  };

  const handleSaveTrip = async () => {
    if (!tripPlan) return;
    try {
      const res = await fetch('/api/save-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: tripPlan.destination,
          days: tripPlan.days,
          hotel: tripPlan.recommended_hotel,
          daily_routes: tripPlan.daily_routes
        })
      });
      if (res.ok) {
        setIsSaved(true);
        fetchUserProfile();
        showToast('Itinerary saved to your profile!');
      }
    } catch (e) {
      console.error('Failed to save trip:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        savedTripsCount={userProfile?.total_saved_trips || 0}
        likesCount={userProfile?.total_likes || 0}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Planner Input Section */}
        <TripForm 
          onPlanTrip={handlePlanTrip} 
          isLoading={isLoading} 
          onShuffleVariation={handleDiscoverDifferentSpots}
        />

        {/* Generated Itinerary Section */}
        {tripPlan && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={tripPlan.image}
                  alt={tripPlan.destination}
                  className="w-20 h-20 rounded-xl object-cover shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {tripPlan.country}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {tripPlan.days}-Day Itinerary
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                    Your {tripPlan.destination} Trip Plan
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-2">
                    {tripPlan.description}
                  </p>
                </div>
              </div>

              {/* Actions: Discover Different Spots & Save Trip */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleDiscoverDifferentSpots}
                  disabled={isLoading}
                  title="Generate an alternative set of sights and a fresh route"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discover Different Spots</span>
                </button>

                <button
                  onClick={handleSaveTrip}
                  disabled={isSaved}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    isSaved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Saved in My Trips</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Save This Trip</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Map & Itinerary Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Map */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Interactive Trip Map
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeDay === 0 ? 'Showing All Days' : `Showing Day ${activeDay}`}
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

            {/* Hotel Recommendations */}
            <HotelRecommendations
              recommendedHotel={tripPlan.recommended_hotel}
              rankedHotels={tripPlan.ranked_hotels}
              onSelectHotel={handleSelectHotel}
            />
          </div>
        )}
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
      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TripBuddy • Smart Personalized Itinerary Planner</span>
          <span className="text-slate-400">
            Neighborhood clustering • Minimal travel time • Learns from your feedback
          </span>
        </div>
      </footer>
    </div>
  );
}
