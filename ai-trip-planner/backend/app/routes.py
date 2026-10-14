import random
import numpy as np
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from app.models import (
    TripPlanRequest,
    FeedbackRequest,
    SaveTripRequest,
    OptimizerBenchmarkRequest
)
from app.data.destinations import SEED_DESTINATIONS
from app.data.free_api import FreeAPIClient
from app.ml.semantic_matching import SemanticMatcher
from app.ml.geo_clustering import GeoClusterer
from app.ml.optimizer import OrienteeringOptimizer
from app.ml.hotel_ranker import HotelRanker
from app.ml.personalization import personalization_engine

router = APIRouter()

semantic_matcher = SemanticMatcher()
geo_clusterer = GeoClusterer()
optimizer = OrienteeringOptimizer()
hotel_ranker = HotelRanker()

PACE_HOURS_MAP = {
    "relaxed": 5.5,
    "moderate": 7.5,
    "fast": 9.0
}

@router.get("/destinations")
async def get_available_destinations():
    """Returns curated destinations and metadata."""
    summary = []
    for key, data in SEED_DESTINATIONS.items():
        summary.append({
            "key": key,
            "name": data["name"],
            "country": data["country"],
            "lat": data["lat"],
            "lng": data["lng"],
            "description": data["description"],
            "image": data["image"],
            "attractions_count": len(data["attractions"]),
            "hotels_count": len(data["hotels"])
        })
    return {"destinations": summary}

@router.post("/plan-trip")
async def plan_trip(req: TripPlanRequest):
    """
    AI Trip Planning Engine:
    1. Dynamic Geocoding & POI search for ANY city worldwide
    2. Semantic interest matching with user personalization
    3. Diverse attraction candidate sampling (supports discovering different spots on refresh)
    4. Geographic clustering (K-Means) grouping attractions into days
    5. Combinatorial route optimization (Orienteering Problem) under daily time budget
    6. Proximity-aware hotel ranking anchored to daily route centroids
    """
    dest_key = req.destination.strip().lower()
    dest_data = SEED_DESTINATIONS.get(dest_key)

    # Check if known seed destination is contained in user input (e.g. 'Delhi, India' -> 'delhi')
    if not dest_data:
        for seed_k, seed_v in SEED_DESTINATIONS.items():
            if seed_k in dest_key or dest_key in seed_k:
                dest_data = seed_v
                break

    # If not in local seed dictionary, dynamically fetch via free Nominatim & Wikipedia APIs!
    if not dest_data:
        geo = FreeAPIClient.geocode_city(req.destination)
        if geo:
            # Query real live attractions around coordinates using two-stage search
            wiki_sights = FreeAPIClient.fetch_wikipedia_attractions(
                geo["lat"], geo["lng"], city_name=geo["name"], radius_m=10000, limit=35
            )
            if wiki_sights and len(wiki_sights) >= 4:
                dest_data = {
                    "name": geo["name"],
                    "country": geo["country"],
                    "lat": geo["lat"],
                    "lng": geo["lng"],
                    "description": f"Custom destination discovered for {geo['display_name']}.",
                    "image": wiki_sights[0].get("image") or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
                    "attractions": wiki_sights,
                    "hotels": FreeAPIClient.generate_hotels_around(geo["lat"], geo["lng"], geo["name"])
                }
            else:
                # If Wikipedia had sparse coordinates, fall back to London
                dest_key = "london"
                dest_data = SEED_DESTINATIONS["london"]
        else:
            # Search query could not be geocoded, fall back to Paris
            dest_key = "paris"
            dest_data = SEED_DESTINATIONS["paris"]

    candidate_attractions = [dict(a) for a in dest_data["attractions"]]
    candidate_hotels = [dict(h) for h in dest_data["hotels"]]

    # Category intent detection:
    raw_query = f"{req.interests} {' '.join(req.interest_tags)}".lower()
    art_requested = (
        "Art & Museums" in req.interest_tags or
        any(w in raw_query for w in ["art", "museum", "gallery", "paintings", "sculpture", "exhibition"])
    )
    if not art_requested:
        non_art = [a for a in candidate_attractions if a.get("category") != "Art"]
        if len(non_art) >= max(4, req.days * 2):
            candidate_attractions = non_art

    # 1. Feedback personalization weights
    user_pref_weights = personalization_engine.get_category_weights()

    # 2. Semantic Interest Matching
    scores = semantic_matcher.fit_and_score(
        user_interests=req.interests,
        interest_tags=req.interest_tags,
        places=candidate_attractions,
        user_preference_weights=user_pref_weights
    )

    for i, place in enumerate(candidate_attractions):
        place["relevance_score"] = scores[i]

    # 3. Dynamic Selection: Support Discovering Different Spots / Variety
    # Set random seed if variation_seed provided or generate fresh variation
    current_seed = req.variation_seed if req.variation_seed is not None else random.randint(1, 999999)
    rng = random.Random(current_seed)

    # Sort by relevance score
    candidate_attractions.sort(key=lambda x: x["relevance_score"], reverse=True)
    target_pool_size = min(len(candidate_attractions), max(req.days * 3, req.days + 4))

    # Lock in all high-relevance matches (score >= 0.30) so user-requested landmarks are never dropped
    strong_matches = [c for c in candidate_attractions if c["relevance_score"] >= 0.30]
    
    if len(strong_matches) >= target_pool_size:
        selected_pool = strong_matches[:target_pool_size]
    else:
        selected_pool = list(strong_matches)
        remaining_candidates = [c for c in candidate_attractions if c not in selected_pool]
        needed = target_pool_size - len(selected_pool)
        if req.variation_seed is not None and len(remaining_candidates) > needed:
            selected_pool.extend(rng.sample(remaining_candidates[:needed + 4], needed))
        else:
            selected_pool.extend(remaining_candidates[:needed])

    # 4. Geographic Clustering (K-Means) with dynamic cluster alignment
    num_days = min(req.days, len(selected_pool))
    geo_clusterer.random_state = current_seed % 1000
    clusters_by_day, centroids = geo_clusterer.cluster_attractions_by_day(selected_pool, num_days)

    # 5. Hotel Ranking anchored strictly to route centroids & ratings
    ranked_hotels = hotel_ranker.rank_hotels(candidate_hotels, centroids)
    chosen_hotel = ranked_hotels[0] if ranked_hotels else {
        "name": "Central Hotel",
        "lat": dest_data["lat"],
        "lng": dest_data["lng"]
    }

    # 6. Daily Route Optimization (Orienteering Problem)
    daily_routes = []
    max_daily_budget_hours = PACE_HOURS_MAP.get(req.pace_preference.lower(), 7.5)
    hotel_loc = (chosen_hotel["lat"], chosen_hotel["lng"])

    for day_idx in range(num_days):
        day_pool = clusters_by_day.get(day_idx, [])
        if not day_pool:
            continue

        centroid = centroids[day_idx] if day_idx < len(centroids) else {"lat": hotel_loc[0], "lng": hotel_loc[1]}
        start_pt = (hotel_loc[0], hotel_loc[1])

        # Optimize itinerary for the day
        day_solution = optimizer.build_daily_itinerary_with_transit(
            day_attractions=day_pool,
            start_location=start_pt,
            max_time_budget_hours=max_daily_budget_hours,
            use_genetic=req.use_genetic_algorithm
        )

        daily_routes.append({
            "day": day_idx + 1,
            "theme": f"Day {day_idx + 1}: {day_pool[0].get('category', 'Sightseeing')} & Highlights",
            "centroid": centroid,
            "attractions": day_solution["route"],
            "transit_legs": day_solution["transit_legs"],
            "total_score": day_solution["total_score"],
            "total_duration_hours": day_solution["total_duration_hours"],
            "time_budget_hours": day_solution["time_budget_hours"],
            "adherence_rate": day_solution["adherence_rate"],
            "total_distance_km": day_solution["total_distance_km"],
            "algorithm_used": day_solution["algorithm"]
        })

    return {
        "destination": dest_data["name"],
        "country": dest_data.get("country", ""),
        "description": dest_data["description"],
        "image": dest_data["image"],
        "coordinates": {"lat": dest_data["lat"], "lng": dest_data["lng"]},
        "days": req.days,
        "daily_routes": daily_routes,
        "centroids": centroids,
        "recommended_hotel": chosen_hotel,
        "ranked_hotels": ranked_hotels,
        "variation_seed": current_seed,
        "personalization_summary": personalization_engine.get_profile_summary(),
        "optimizer_used": "Genetic Algorithm" if req.use_genetic_algorithm else "Greedy Heuristic"
    }

@router.post("/feedback")
async def record_user_feedback(req: FeedbackRequest):
    """
    Feedback-based personalization endpoint:
    Records Like, Dislike, or Skip for an attraction and updates user preference multipliers.
    """
    summary = personalization_engine.record_feedback(
        place_id=req.place_id,
        place_name=req.place_name,
        category=req.category,
        action=req.action
    )
    return {
        "status": "success",
        "action": req.action,
        "place_name": req.place_name,
        "personalization": summary
    }

@router.post("/save-trip")
async def save_trip(req: SaveTripRequest):
    """Saves planned trip into user history to cement preference learning."""
    saved = personalization_engine.save_trip(req.model_dump())
    return {
        "status": "success",
        "saved_trip": saved,
        "total_saved_trips": len(personalization_engine.saved_trips)
    }

@router.get("/user-profile")
async def get_user_profile():
    """Fetches user feedback state and active personalization multipliers."""
    return personalization_engine.get_profile_summary()

@router.post("/compare-optimizers")
async def compare_optimizers(req: OptimizerBenchmarkRequest):
    """
    Runs both Greedy Heuristic and Genetic Algorithm on destination attractions
    and returns comparative benchmarking metrics.
    """
    dest_key = req.destination.strip().lower()
    dest_data = SEED_DESTINATIONS.get(dest_key, SEED_DESTINATIONS["paris"])
    places = [dict(p) for p in dest_data["attractions"]]

    for p in places:
        p["relevance_score"] = round(float(p.get("rating", 4.0)) / 5.0, 3)

    start_pt = (dest_data["lat"], dest_data["lng"])
    benchmark_res = optimizer.compare_optimizers(
        candidate_places=places,
        start_location=start_pt,
        max_time_budget_hours=req.max_time_budget_hours
    )
    return benchmark_res
