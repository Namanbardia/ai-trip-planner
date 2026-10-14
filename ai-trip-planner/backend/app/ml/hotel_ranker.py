import math
from typing import List, Dict, Any
from app.ml.geo_clustering import haversine_distance_km

class HotelRanker:
    """
    Multi-Criteria Hotel Ranking Engine:
    Ranks accommodation candidates strictly by:
    1. Proximity to the planned attraction route centroids (70%)
    2. User review rating and guest satisfaction (30%)
    """
    def __init__(
        self,
        weight_proximity: float = 0.70,
        weight_rating: float = 0.30
    ):
        self.w_prox = weight_proximity
        self.w_rating = weight_rating

    def rank_hotels(
        self,
        hotels: List[Dict[str, Any]],
        route_centroids: List[Dict[str, float]]
    ) -> List[Dict[str, Any]]:
        """
        Calculates multi-criteria score for each candidate hotel and returns sorted rankings.
        """
        if not hotels:
            return []

        if not route_centroids:
            route_centroids = [{"lat": hotels[0]["lat"], "lng": hotels[0]["lng"]}]

        ranked_results = []

        for hotel in hotels:
            h_lat = float(hotel["lat"])
            h_lng = float(hotel["lng"])
            rating = float(hotel.get("rating", 4.0))

            # 1. Proximity: Average distance to all daily route centroids
            distances = [
                haversine_distance_km(h_lat, h_lng, c["lat"], c["lng"])
                for c in route_centroids
            ]
            avg_dist_km = sum(distances) / len(distances)

            # Proximity score exponentially decays with distance (half-life around 5.5km)
            proximity_score = math.exp(-avg_dist_km / 5.5)

            # 2. Rating Score (normalized 0-1)
            rating_score = min(1.0, rating / 5.0)

            # Aggregate weighted score
            total_score = (
                self.w_prox * proximity_score +
                self.w_rating * rating_score
            )

            # Generate smart rationale
            if avg_dist_km <= 2.0:
                rationale = f"Prime central location ({round(avg_dist_km, 1)} km from daily sightseeing hubs)"
            elif avg_dist_km <= 4.0:
                rationale = f"Convenient transit access ({round(avg_dist_km, 1)} km to daily route centroids)"
            else:
                rationale = f"Quiet neighborhood setting ({round(avg_dist_km, 1)} km from main sights)"

            hotel_copy = dict(hotel)
            hotel_copy["hotel_score"] = round(total_score, 3)
            hotel_copy["avg_distance_to_route_km"] = round(avg_dist_km, 2)
            hotel_copy["proximity_score"] = round(proximity_score, 2)
            hotel_copy["rating_score"] = round(rating_score, 2)
            hotel_copy["ranking_rationale"] = rationale

            ranked_results.append(hotel_copy)

        # Sort by total score descending
        ranked_results.sort(key=lambda h: h["hotel_score"], reverse=True)

        if ranked_results:
            ranked_results[0]["is_recommended"] = True

        return ranked_results
