import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes the great-circle distance between two points on the Earth in kilometers."""
    R = 6371.0 # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class GeoClusterer:
    """
    Geographic Clustering engine using K-Means.
    Groups candidate attractions into distinct spatial clusters corresponding to itinerary days
    to minimize zigzagging and unnecessary inter-attraction travel.
    """
    def __init__(self, random_state: int = 42):
        self.random_state = random_state

    def cluster_attractions_by_day(
        self,
        attractions: List[Dict[str, Any]],
        num_days: int
    ) -> Tuple[Dict[int, List[Dict[str, Any]]], List[Dict[str, float]]]:
        """
        Clusters attractions into `num_days` clusters.
        Returns:
            - grouped_by_day: Dict[day_index, List[attractions]]
            - centroids: List[{'day': int, 'lat': float, 'lng': float}]
        """
        if not attractions:
            return {}, []

        k = min(num_days, len(attractions))
        if k <= 1:
            # Single cluster
            avg_lat = float(np.mean([a["lat"] for a in attractions]))
            avg_lng = float(np.mean([a["lng"] for a in attractions]))
            for a in attractions:
                a["cluster_id"] = 0
            return {0: attractions}, [{"day": 0, "lat": avg_lat, "lng": avg_lng}]

        # Prepare 2D coordinates
        coords = np.array([[a["lat"], a["lng"]] for a in attractions])

        # Apply K-Means clustering
        kmeans = KMeans(n_clusters=k, random_state=self.random_state, n_init=10)
        labels = kmeans.fit_predict(coords)
        cluster_centers = kmeans.cluster_centers_

        grouped: Dict[int, List[Dict[str, Any]]] = {i: [] for i in range(k)}
        for idx, attraction in enumerate(attractions):
            cluster_id = int(labels[idx])
            attraction["cluster_id"] = cluster_id
            grouped[cluster_id].append(attraction)

        centroids = [
            {
                "day": i + 1,
                "lat": round(float(center[0]), 5),
                "lng": round(float(center[1]), 5)
            }
            for i, center in enumerate(cluster_centers)
        ]

        # Ensure no empty cluster by reallocating if needed
        # Sort cluster groups in logical order (e.g. from North to South or West to East)
        sorted_cluster_order = sorted(range(k), key=lambda i: cluster_centers[i][0], reverse=True)
        reordered_grouped: Dict[int, List[Dict[str, Any]]] = {}
        reordered_centroids: List[Dict[str, float]] = []

        for new_idx, old_idx in enumerate(sorted_cluster_order):
            items = grouped[old_idx]
            for it in items:
                it["cluster_day"] = new_idx + 1
            reordered_grouped[new_idx] = items
            reordered_centroids.append({
                "day": new_idx + 1,
                "lat": round(float(cluster_centers[old_idx][0]), 5),
                "lng": round(float(cluster_centers[old_idx][1]), 5)
            })

        return reordered_grouped, reordered_centroids
