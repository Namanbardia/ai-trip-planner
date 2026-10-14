import requests
import random
from typing import List, Dict, Any, Optional

USER_AGENT = "TripBuddyAIPlanner/1.0 (academic.planner.app@gmail.com)"

class FreeAPIClient:
    """
    100% Free Open APIs for Dynamic Global City Discovery:
    - OpenStreetMap Nominatim (Free Geocoding for any city worldwide)
    - Wikipedia GeoSearch (Real sights, coordinates, summaries, and images)
    """

    @staticmethod
    def geocode_city(city_name: str) -> Optional[Dict[str, Any]]:
        """Geocodes any global city using OpenStreetMap Nominatim."""
        if not city_name or not city_name.strip():
            return None
        try:
            url = "https://nominatim.openstreetmap.org/search"
            headers = {"User-Agent": USER_AGENT, "Accept-Language": "en"}
            params = {
                "q": city_name.strip(),
                "format": "json",
                "limit": 1,
                "addressdetails": 1,
                "accept-language": "en"
            }
            resp = requests.get(url, params=params, headers=headers, timeout=6)
            if resp.status_code == 200 and resp.json():
                res = resp.json()[0]
                display_name = res.get("display_name", city_name)
                parts = display_name.split(",")
                clean_name = parts[0].strip()
                country = parts[-1].strip() if len(parts) > 1 else "International"
                
                return {
                    "name": clean_name,
                    "country": country,
                    "display_name": display_name,
                    "lat": float(res.get("lat")),
                    "lng": float(res.get("lon"))
                }
        except Exception as e:
            print(f"Geocode error for {city_name}: {e}")
        return None

    @staticmethod
    def fetch_wikipedia_attractions(lat: float, lng: float, city_name: str = "", radius_m: int = 10000, limit: int = 35) -> List[Dict[str, Any]]:
        """
        Fetches genuine tourist attractions, landmarks, museums, and historic sites.
        Two-stage retrieval:
        1. Query Wikipedia Search API for 'Tourist attractions in {city_name}' to discover
           iconic top-tier landmarks across the metropolitan area.
        2. Supplement with Wikipedia GeoSearch around the city center coordinates.
        3. Strict filter excluding schools, colleges, hospitals, transit, clinics, and municipal offices.
        """
        results = []
        seen_titles = set()

        skip_keywords = [
            "borough", "district", "metro", "county", "built-up", 
            "demographics", "constituency", "railway station", "airport",
            "highway", "championship", "parliamentary", "school", "college",
            "university", "hospital", "clinic", "department of", "police",
            "institute", "academy", "seminary", "campus", "interchange",
            "bus stand", "toll plaza", "administrative", "ministry",
            "embassy", "consulate", "parliament", "representatives",
            "headquarters", "league", "secretariat", "court", "tribunal",
            "prison", "jail", "studios", "broadcasting", "television",
            "radio station", "film festival", "chamber of commerce",
            "corporation", "municipality", "stock exchange", "exchange",
            "bank", "depository", "securities"
        ]

        def parse_category(extract_text: str) -> str:
            ext_lower = extract_text.lower()
            if any(w in ext_lower for w in ["fine art", "art gallery", "art museum", "paintings", "sculpture", "exhibition of art"]):
                return "Art"
            elif any(w in ext_lower for w in ["cathedral", "church", "temple", "shrine", "mosque", "basilica", "gurudwara", "sacred"]):
                return "Spirituality"
            elif any(w in ext_lower for w in ["castle", "palace", "monument", "historic", "ancient", "medieval", "fort", "tomb", "pyramid", "ruins", "heritage"]):
                return "History"
            elif any(w in ext_lower for w in ["park", "garden", "lake", "botanical", "nature", "woods", "wildlife", "safari"]):
                return "Nature"
            elif any(w in ext_lower for w in ["view", "skyline", "panorama", "observation", "bridge", "tower", "square", "promenade"]):
                return "Viewpoint"
            elif any(w in ext_lower for w in ["market", "street food", "cuisine", "bazaar", "haat"]):
                return "Food"
            elif any(w in ext_lower for w in ["architecture", "facade", "building", "hall"]):
                return "Architecture"
            return "History"

        headers = {"User-Agent": USER_AGENT}
        url = "https://en.wikipedia.org/w/api.php"

        # Stage 1: Curated Category & Landmark Search by City Name
        if city_name:
            try:
                candidate_titles = []

                # 1a. Query Wikipedia Category:Tourist attractions in {city_name}
                cat_params = {
                    "action": "query",
                    "list": "categorymembers",
                    "cmtitle": f"Category:Tourist attractions in {city_name}",
                    "cmlimit": "35",
                    "format": "json"
                }
                c_resp = requests.get(url, params=cat_params, headers=headers, timeout=6)
                if c_resp.status_code == 200:
                    for m in c_resp.json().get("query", {}).get("categorymembers", []):
                        t = m.get("title", "")
                        if not t.startswith("Category:") and not t.startswith("Template:") and not t.lower().startswith("list of"):
                            if not any(sk in t.lower() for sk in skip_keywords):
                                candidate_titles.append(t)

                # 1b. Query Wikipedia Search API for top attractions & landmarks
                for search_term in [f"Tourist attractions in {city_name}", f"Landmarks monuments in {city_name}"]:
                    s_params = {
                        "action": "query",
                        "list": "search",
                        "srsearch": search_term,
                        "srlimit": "20",
                        "format": "json"
                    }
                    s_resp = requests.get(url, params=s_params, headers=headers, timeout=6)
                    if s_resp.status_code == 200:
                        for item in s_resp.json().get("query", {}).get("search", []):
                            t = item.get("title", "")
                            t_lower = t.lower()
                            if t_lower.startswith("list of") or t_lower == city_name.lower():
                                continue
                            if any(sk in t_lower for sk in skip_keywords):
                                continue
                            if t not in candidate_titles:
                                candidate_titles.append(t)

                # Batch fetch details for candidate titles
                if candidate_titles:
                    b_params = {
                        "action": "query",
                        "titles": "|".join(candidate_titles[:25]),
                        "prop": "pageimages|extracts|coordinates",
                        "exintro": "1",
                        "explaintext": "1",
                        "exsentences": "2",
                        "piprop": "thumbnail",
                        "pithumbsize": "600",
                        "format": "json"
                    }
                    b_resp = requests.get(url, params=b_params, headers=headers, timeout=7)
                    if b_resp.status_code == 200:
                        b_pages = b_resp.json().get("query", {}).get("pages", {})
                        for pid, p in b_pages.items():
                            title = p.get("title", "")
                            extract = p.get("extract", "").strip()
                            coords = p.get("coordinates", [])
                            if not extract or len(extract) < 25:
                                continue
                            if any(sk in title.lower() for sk in skip_keywords):
                                continue
                            if any(sk in extract.lower()[:150] for sk in ["college", "university", "high school", "railway station", "parliament", "embassy", "ministry"]):
                                continue
                            
                            p_lat = coords[0].get("lat", lat) if coords else lat
                            p_lng = coords[0].get("lon", lng) if coords else lng
                            
                            # Check distance from city coordinates (within 60km)
                            if coords:
                                dist_km = (((p_lat - lat)**2 + ((p_lng - lng) * 0.7)**2)**0.5) * 111
                                if dist_km > 60:
                                    continue

                            cat = parse_category(extract)
                            thumb = p.get("thumbnail", {}).get("source", "")
                            seen_titles.add(title.lower())
                            results.append({
                                "id": f"wiki_{pid}",
                                "name": title,
                                "category": cat,
                                "lat": float(p_lat),
                                "lng": float(p_lng),
                                "rating": round(random.uniform(4.6, 4.9), 1),
                                "duration_hours": round(random.choice([1.5, 2.0, 2.5]), 1),
                                "description": extract,
                                "image": thumb or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
                                "tags": [cat.lower(), "landmark", "top-attraction", "must-see"],
                                "reviews": ["Renowned must-visit destination.", "Incredible architecture and cultural importance."]
                            })
            except Exception as e:
                print(f"Wikipedia landmark search error: {e}")

        # Stage 2: GeoSearch around city coordinates to supplement or if Stage 1 found few results
        if len(results) < limit:
            try:
                geo_params = {
                    "action": "query",
                    "generator": "geosearch",
                    "ggscoord": f"{lat}|{lng}",
                    "ggsradius": "10000",
                    "ggslimit": str(limit),
                    "prop": "pageimages|extracts|coordinates",
                    "exintro": "1",
                    "explaintext": "1",
                    "exsentences": "2",
                    "piprop": "thumbnail",
                    "pithumbsize": "600",
                    "format": "json"
                }
                resp = requests.get(url, params=geo_params, headers=headers, timeout=7)
                if resp.status_code == 200:
                    pages = resp.json().get("query", {}).get("pages", {})
                    for pid, p in pages.items():
                        title = p.get("title", "")
                        if title.lower() in seen_titles:
                            continue
                        extract = p.get("extract", "").strip()
                        coords = p.get("coordinates", [])
                        if not extract or len(extract) < 25:
                            continue
                        if any(sk in title.lower() for sk in skip_keywords):
                            continue
                        if any(sk in extract.lower()[:120] for sk in ["college", "university", "high school", "railway station"]):
                            continue

                        p_lat = coords[0].get("lat", lat) if coords else lat
                        p_lng = coords[0].get("lon", lng) if coords else lng
                        cat = parse_category(extract)
                        thumb = p.get("thumbnail", {}).get("source", "")
                        seen_titles.add(title.lower())
                        results.append({
                            "id": f"wiki_{pid}",
                            "name": title,
                            "category": cat,
                            "lat": float(p_lat),
                            "lng": float(p_lng),
                            "rating": round(random.uniform(4.5, 4.9), 1),
                            "duration_hours": round(random.choice([1.0, 1.5, 2.0, 2.5]), 1),
                            "description": extract,
                            "image": thumb or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
                            "tags": [cat.lower(), "landmark", "sightseeing", "explore"],
                            "reviews": ["Iconic location with rich atmosphere.", "Great place to discover in the city."]
                        })
            except Exception as e:
                print(f"Wikipedia geosearch error: {e}")

        return results

    @staticmethod
    def generate_hotels_around(lat: float, lng: float, city_name: str) -> List[Dict[str, Any]]:
        """Generates realistic well-positioned hotel candidates around city coordinates."""
        offsets = [
            (0.006, 0.005, f"Grand Central Hotel {city_name}", 4.8, ["Central Location", "Concierge", "Free Breakfast"]),
            (-0.005, 0.008, f"The Boutique Heritage Stay", 4.7, ["Boutique Design", "Near Transit", "Quiet Rooms"]),
            (-0.008, -0.006, f"Urban Loft {city_name}", 4.5, ["Modern Rooms", "High-speed WiFi", "Rooftop Terrace"]),
            (0.009, -0.007, f"Plaza Promenade Hotel", 4.6, ["Scenic Views", "Walk to Sights", "24/7 Front Desk"])
        ]
        hotels = []
        for i, (d_lat, d_lng, name, rating, am) in enumerate(offsets):
            hotels.append({
                "id": f"dyn_hotel_{i+1}",
                "name": name,
                "lat": round(lat + d_lat, 5),
                "lng": round(lng + d_lng, 5),
                "rating": rating,
                "amenities": am
            })
        return hotels
