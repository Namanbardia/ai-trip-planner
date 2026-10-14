import json
from typing import Dict, List, Any

class PersonalizationEngine:
    """
    Feedback-based Personalization Engine.
    Incorporates user interactions (Likes, Dislikes, Skipped places, Saved trips)
    to dynamically adapt recommendation preferences and category weights.
    """
    def __init__(self):
        self.likes: List[Dict[str, Any]] = []
        self.dislikes: List[Dict[str, Any]] = []
        self.skipped: List[Dict[str, Any]] = []
        self.saved_trips: List[Dict[str, Any]] = []

    def record_feedback(
        self,
        place_id: str,
        place_name: str,
        category: str,
        action: str
    ) -> Dict[str, Any]:
        """
        Records an interaction and updates preferences.
        action: 'like' | 'dislike' | 'skip'
        """
        record = {
            "place_id": place_id,
            "place_name": place_name,
            "category": category
        }

        self.likes = [x for x in self.likes if x["place_id"] != place_id]
        self.dislikes = [x for x in self.dislikes if x["place_id"] != place_id]
        self.skipped = [x for x in self.skipped if x["place_id"] != place_id]

        if action == "like":
            self.likes.append(record)
        elif action == "dislike":
            self.dislikes.append(record)
        elif action == "skip":
            self.skipped.append(record)

        return self.get_profile_summary()

    def save_trip(self, trip_plan: Dict[str, Any]) -> Dict[str, Any]:
        """Saves an itinerary into the user's permanent trip history."""
        trip_summary = {
            "trip_id": f"trip_{len(self.saved_trips) + 1}",
            "destination": trip_plan.get("destination", "Custom Trip"),
            "days": trip_plan.get("days", 1),
            "hotel_name": trip_plan.get("hotel", {}).get("name", "N/A"),
            "attractions_count": sum(len(d.get("attractions", [])) for d in trip_plan.get("daily_routes", []))
        }
        self.saved_trips.append(trip_summary)
        return trip_summary

    def get_category_weights(self) -> Dict[str, float]:
        """
        Calculates category affinity multipliers based on user feedback history.
        Likes boost category (+0.25).
        Dislikes penalize category (-0.40).
        Skips cause slight decay (-0.10).
        """
        weights: Dict[str, float] = {}

        for item in self.likes:
            cat = item.get("category", "General")
            weights[cat] = weights.get(cat, 1.0) + 0.25

        for item in self.dislikes:
            cat = item.get("category", "General")
            weights[cat] = weights.get(cat, 1.0) - 0.40

        for item in self.skipped:
            cat = item.get("category", "General")
            weights[cat] = weights.get(cat, 1.0) - 0.10

        bounded_weights = {
            cat: round(max(0.15, min(2.5, w)), 3)
            for cat, w in weights.items()
        }
        return bounded_weights

    def get_profile_summary(self) -> Dict[str, Any]:
        """Returns comprehensive personalization state for frontend visualization."""
        cat_weights = self.get_category_weights()
        top_preferred = [cat for cat, w in sorted(cat_weights.items(), key=lambda x: x[1], reverse=True) if w > 1.0]
        penalized = [cat for cat, w in sorted(cat_weights.items(), key=lambda x: x[1]) if w < 1.0]

        return {
            "total_likes": len(self.likes),
            "total_dislikes": len(self.dislikes),
            "total_skipped": len(self.skipped),
            "total_saved_trips": len(self.saved_trips),
            "category_weights": cat_weights,
            "top_preferred_categories": top_preferred,
            "penalized_categories": penalized,
            "liked_places": self.likes[-10:],
            "disliked_places": self.dislikes[-10:],
            "saved_trips": self.saved_trips
        }

personalization_engine = PersonalizationEngine()
