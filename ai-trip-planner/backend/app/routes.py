import random
import re
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional

from app.models import (
    LoginRequest,
    TripPlanRequest,
    FeedbackRequest,
    GeocodeHotelRequest,
    OptimizerBenchmarkRequest
)
from app.auth import (
    create_token,
    verify_credentials,
    require_auth,
)
from app.data.destinations import SEED_DESTINATIONS
from app.data.free_api import FreeAPIClient
from app.ml.semantic_matching import SemanticMatcher
from app.ml.geo_clustering import GeoClusterer, haversine_distance_km
from app.ml.optimizer import OrienteeringOptimizer
from app.ml.personalization import personalization_engine

router = APIRouter()

semantic_matcher = SemanticMatcher()
geo_clusterer = GeoClusterer()
optimizer = OrienteeringOptimizer()

PACE_HOURS_MAP = {
    "relaxed": 5.5,
    "moderate": 7.5,
    "fast": 9.0
}

# No single category may dominate the candidate pool (~40% cap) unless the
# user explicitly asked for that category — fixes data sets skewed toward one
# type (e.g. food-heavy city lists) without hand-editing any data.
CATEGORY_CAP_RATIO = 0.40
# Two selected stops closer than this are effectively the same place.
MIN_STOP_SEPARATION_M = 150
# A day is "under-filled" below this fraction of its time budget and should
# top up with nearby leftover candidates.
DAY_FILL_TARGET = 0.80
# How far (km) a top-up stop may sit from the day's centroid.
TOPUP_RADIUS_KM = 8.0


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

@router.post("/auth/login")
async def login(req: LoginRequest):
    """Validates admin credentials and issues a JWT bearer token."""
    if not verify_credentials(req.username, req.password):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token = create_token(req.username)
    return {"status": "success", "access_token": token, "token_type": "bearer", "username": req.username}


@router.get("/auth/me")
async def auth_me(user: dict = Depends(require_auth)):
    """Returns the currently authenticated user (validates the bearer token)."""
    return {"status": "authenticated", "username": user.get("sub")}


# ---------------------------------------------------------------------------
# Destinations
# ---------------------------------------------------------------------------

def match_seed_destination(query: str) -> Optional[tuple]:
    """
    Word-boundary matching of a user query against seed destination keys/names.
    Fixes bugs like 'rome' matching 'chrome' (substring match) by requiring
    whole-word matches instead of raw substring containment.
    Returns (key, dest_data) or None.
    """
    q = re.sub(r"[^a-z0-9\s]", " ", query.strip().lower())
    q_tokens = set(q.split())
    if not q_tokens:
        return None

    for seed_key, seed_data in SEED_DESTINATIONS.items():
        candidates = {seed_key, seed_data.get("name", "").strip().lower()}
        for cand in candidates:
            cand_tokens = set(re.sub(r"[^a-z0-9\s]", " ", cand).split())
            if not cand_tokens:
                continue
            # Exact set match, seed key inside query ("delhi, india"), or query inside seed key ("new delhi")
            if cand_tokens == q_tokens or cand_tokens <= q_tokens or q_tokens <= cand_tokens:
                return seed_key, seed_data
    return None


@router.get("/destinations")
async def get_available_destinations(user: dict = Depends(require_auth)):
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
async def plan_trip(req: TripPlanRequest, user: dict = Depends(require_auth)):
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

    # Check if known seed destination matches the user input word-for-word
    # (e.g. 'Delhi, India' -> 'delhi'), avoiding substring bugs like 'rome' in 'chrome'.
    if not dest_data:
        matched = match_seed_destination(req.destination)
        if matched:
            dest_key, dest_data = matched

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
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Found '{geo['name']}', but couldn't gather enough attractions for it. "
                        "Try a larger nearby city or one of the curated destinations."
                    ),
                )
        else:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Couldn't find a destination called '{req.destination}'. "
                    "Check the spelling, or try a curated city (Paris, Tokyo, London, Rome, Barcelona, Jaipur, Delhi)."
                ),
            )

    candidate_attractions = [dict(a) for a in dest_data["attractions"]]

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

    # Sort by relevance score
    candidate_attractions.sort(key=lambda x: x["relevance_score"], reverse=True)
    # Bigger candidate pool (days x 5) gives clustering/top-up enough material
    # so days don't end up with a single stop.
    target_pool_size = min(len(candidate_attractions), max(req.days * 5, req.days + 4))

    # Detect which categories the user explicitly asked for (tags or free text).
    requested_categories: set = set()
    TAG_CATEGORY_MAP = {
        "Art & Museums": "Art",
        "History & Castles": "History",
        "Parks & Nature": "Nature",
        "Food & Cafes": "Food",
        "Architecture": "Architecture",
        "Photo Spots": "Viewpoint",
        "Temples & Shrines": "Spirituality",
    }
    for tag in req.interest_tags:
        cat = TAG_CATEGORY_MAP.get(tag)
        if cat:
            requested_categories.add(cat)
    for word, cat in [
        ("food", "Food"), ("cuisine", "Food"), ("restaurant", "Food"), ("cafe", "Food"),
        ("art", "Art"), ("museum", "Art"), ("gallery", "Art"),
        ("history", "History"), ("historic", "History"), ("heritage", "History"),
        ("nature", "Nature"), ("park", "Nature"), ("garden", "Nature"),
        ("architecture", "Architecture"),
        ("view", "Viewpoint"), ("viewpoint", "Viewpoint"), ("panorama", "Viewpoint"),
        ("temple", "Spirituality"), ("church", "Spirituality"), ("shrine", "Spirituality"),
    ]:
        if word in raw_query:
            requested_categories.add(cat)

    # Lock in all high-relevance matches (score >= 0.30) so user-requested landmarks are never dropped
    strong_matches = [c for c in candidate_attractions if c["relevance_score"] >= 0.30]

    # ---- Pool selection: strong matches first, then the best of the rest,
    # ---- enforcing a category balance cap and a minimum spatial separation.
    category_cap = max(2, int(target_pool_size * CATEGORY_CAP_RATIO)) if not requested_categories else target_pool_size
    category_counts: Dict[str, int] = {}
    selected_pool: List[Dict[str, Any]] = []
    selected_ids: set = set()

    def _too_close(place: Dict[str, Any]) -> bool:
        """True if within MIN_STOP_SEPARATION_M of an already-selected place."""
        for sel in selected_pool:
            d_m = haversine_distance_km(place["lat"], place["lng"], sel["lat"], sel["lng"]) * 1000.0
            if d_m < MIN_STOP_SEPARATION_M:
                return True
        return False

    def _try_add(place: Dict[str, Any], enforce_caps: bool) -> bool:
        if place["id"] in selected_ids or _too_close(place):
            return False
        cat = place.get("category", "History")
        if enforce_caps and cat not in requested_categories and category_counts.get(cat, 0) >= category_cap:
            return False
        selected_pool.append(place)
        selected_ids.add(place["id"])
        category_counts[cat] = category_counts.get(cat, 0) + 1
        return True

    # Strong matches get priority (still de-duplicated spatially so two
    # landmarks 100m apart don't both consume a day).
    for cand in strong_matches:
        if len(selected_pool) >= target_pool_size:
            break
        _try_add(cand, enforce_caps=False)

    # Fill the rest by score, respecting the category balance cap.
    for cand in candidate_attractions:
        if len(selected_pool) >= target_pool_size:
            break
        _try_add(cand, enforce_caps=True)

    # If caps + de-dup left the pool too small, relax the cap (never the de-dup).
    if len(selected_pool) < target_pool_size:
        for cand in candidate_attractions:
            if len(selected_pool) >= target_pool_size:
                break
            if cand["id"] not in selected_ids and not _too_close(cand):
                selected_pool.append(cand)
                selected_ids.add(cand["id"])

    # Leftovers feed the per-day top-up pass below.
    leftover_candidates = [c for c in candidate_attractions if c["id"] not in selected_ids]

    # 4. Geographic Clustering (K-Means) with dynamic cluster alignment
    num_days = min(req.days, len(selected_pool))
    geo_clusterer.random_state = current_seed % 1000
    clusters_by_day, centroids = geo_clusterer.cluster_attractions_by_day(selected_pool, num_days)

    # 5. Start location: user's hotel if provided, else the city center.
    start_location: Dict[str, Any]
    hotel_warning: Optional[str] = None
    hotel_query = (req.hotel_name or "").strip()
    if hotel_query:
        hotel_geo = FreeAPIClient.geocode_hotel(hotel_query, city=dest_data["name"])
        if hotel_geo:
            start_location = {
                "name": hotel_geo["name"],
                "display_name": hotel_geo.get("display_name", hotel_geo["name"]),
                "lat": hotel_geo["lat"],
                "lng": hotel_geo["lng"],
                "source": "user_hotel"
            }
        else:
            hotel_warning = (
                f"Couldn't locate '{hotel_query}' — planned from the {dest_data['name']} city center instead."
            )
            start_location = {
                "name": f"{dest_data['name']} city center",
                "lat": dest_data["lat"],
                "lng": dest_data["lng"],
                "source": "city_center"
            }
    else:
        start_location = {
            "name": f"{dest_data['name']} city center",
            "lat": dest_data["lat"],
            "lng": dest_data["lng"],
            "source": "city_center"
        }

    start_pt = (start_location["lat"], start_location["lng"])

    # 6. Daily Route Optimization (Orienteering Problem) with under-filled day top-up
    daily_routes = []
    max_daily_budget_hours = PACE_HOURS_MAP.get(req.pace_preference.lower(), 7.5)
    topup_pool = list(leftover_candidates)

    for day_idx in range(num_days):
        day_pool = clusters_by_day.get(day_idx, [])
        if not day_pool:
            continue

        centroid = centroids[day_idx] if day_idx < len(centroids) else {"lat": start_pt[0], "lng": start_pt[1]}

        # Optimize itinerary for the day
        day_solution = optimizer.build_daily_itinerary_with_transit(
            day_attractions=day_pool,
            start_location=start_pt,
            max_time_budget_hours=max_daily_budget_hours,
            use_genetic=req.use_genetic_algorithm
        )

        # ---- Day top-up: if the day uses < 80% of its budget, pull in the
        # ---- best leftover candidates near this day's centroid and re-optimize.
        if topup_pool and day_solution["adherence_rate"] < DAY_FILL_TARGET * 100:
            day_used_ids = {p["id"] for p in day_solution["route"]}
            nearby_leftovers = sorted(
                (
                    c for c in topup_pool
                    if c["id"] not in day_used_ids
                    and haversine_distance_km(c["lat"], c["lng"], centroid["lat"], centroid["lng"]) <= TOPUP_RADIUS_KM
                ),
                key=lambda c: c["relevance_score"],
                reverse=True
            )[:3]
            if nearby_leftovers:
                merged_pool = day_pool + nearby_leftovers
                topped_solution = optimizer.build_daily_itinerary_with_transit(
                    day_attractions=merged_pool,
                    start_location=start_pt,
                    max_time_budget_hours=max_daily_budget_hours,
                    use_genetic=req.use_genetic_algorithm
                )
                # Keep the top-up only if it actually fills the day better.
                if topped_solution["adherence_rate"] > day_solution["adherence_rate"]:
                    day_solution = topped_solution
                # Consumed top-ups are no longer available to other days.
                merged_ids = {p["id"] for p in day_solution["route"]}
                topup_pool = [c for c in topup_pool if c["id"] not in merged_ids]

        # Theme from the dominant categories of the final route (not the raw pool)
        route_cats: Dict[str, int] = {}
        for p in day_solution["route"]:
            c = p.get("category", "Sightseeing")
            route_cats[c] = route_cats.get(c, 0) + 1
        top_cats = sorted(route_cats, key=lambda c: route_cats[c], reverse=True)[:2]
        theme = f"Day {day_idx + 1}: " + " & ".join(top_cats) if top_cats else f"Day {day_idx + 1}: Highlights"

        daily_routes.append({
            "day": day_idx + 1,
            "theme": theme,
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
        "start_location": start_location,
        "hotel_warning": hotel_warning,
        "variation_seed": current_seed,
        "personalization_summary": personalization_engine.get_profile_summary(),
        "optimizer_used": "Genetic Algorithm" if req.use_genetic_algorithm else "Greedy Heuristic"
    }

@router.post("/feedback")
async def record_user_feedback(req: FeedbackRequest, user: dict = Depends(require_auth)):
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

@router.post("/geocode-hotel")
async def geocode_hotel(req: GeocodeHotelRequest, user: dict = Depends(require_auth)):
    """
    Geocodes a hotel/accommodation name via OpenStreetMap Nominatim (free, keyless).
    Appends the destination city when provided so bare hotel names resolve in the
    right place. Results are cached in-memory.
    """
    hotel = FreeAPIClient.geocode_hotel(req.query, city=req.city or "")
    if not hotel:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Couldn't find '{req.query}'. "
                "Try adding the city (e.g. 'Taj Palace New Delhi')."
            )
        )
    return {
        "status": "success",
        "name": hotel["name"],
        "display_name": hotel["display_name"],
        "lat": hotel["lat"],
        "lng": hotel["lng"]
    }

@router.get("/user-profile")
async def get_user_profile(user: dict = Depends(require_auth)):
    """Fetches user feedback state and active personalization multipliers."""
    return personalization_engine.get_profile_summary()

@router.post("/compare-optimizers")
async def compare_optimizers(req: OptimizerBenchmarkRequest, user: dict = Depends(require_auth)):
    """
    Runs both Greedy Heuristic and Genetic Algorithm on destination attractions
    and returns comparative benchmarking metrics.
    """
    dest_key = req.destination.strip().lower()
    dest_data = SEED_DESTINATIONS.get(dest_key)
    if not dest_data:
        matched = match_seed_destination(req.destination)
        if matched:
            dest_data = matched[1]
        else:
            dest_data = SEED_DESTINATIONS["paris"]
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
