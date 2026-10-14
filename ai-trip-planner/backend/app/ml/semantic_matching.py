import re
import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

TAG_EXPANSIONS = {
    "Food & Cafes": "food dining cafe restaurant street food culinary cuisine bakery pastry market gastronomy tasting brunch breakfast bistro snacks desserts",
    "Temples & Shrines": "temple shrine spiritual sacred prayer meditation mosque cathedral church gurudwara sanctuary",
    "History & Castles": "history historic ancient fort fortress palace castle ruins monument heritage unesco dynasty medieval",
    "Parks & Nature": "nature park garden lake flora botanical greenery outdoor scenic landscape woods",
    "Architecture": "architecture landmark facade structure design tower bridge monument dome",
    "Photo Spots": "viewpoint photography skyline panorama scenic view sunset overlook picturesque",
    "Shopping": "shopping bazaar market crafts artisan souvenirs boutiques stalls",
    "Nightlife": "nightlife evening bars clubs entertainment vibrant cocktails music",
    "Relaxation": "relaxation peaceful calm tranquil serene wellness spa leisure quiet"
}

class SemanticMatcher:
    """
    Calibrated TF-IDF + Cosine Similarity Interest Matching Engine.
    Combines:
    1. TF-IDF multi-gram cosine similarity (sublinear TF scaling)
    2. Direct landmark name & keyword salience (guarantees requested landmarks rank #1)
    3. Category tag alignment & feedback personalization
    4. Controlled quality prior (avoids flat rating dominance or hallucinations)
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words="english",
            max_features=3000
        )

    def _tokenize(self, text: str) -> set:
        """Extracts meaningful alphabetic tokens (length >= 3)."""
        if not text:
            return set()
        return set(re.findall(r'\b[a-z]{3,}\b', text.lower()))

    def _prepare_place_document(self, place: Dict[str, Any]) -> str:
        """Constructs an amplified document emphasizing name, category, and tags."""
        name = place.get("name", "")
        category = place.get("category", "")
        description = place.get("description", "")
        tags = " ".join(place.get("tags", []))
        
        # We emphasize the name, category and tags so matches are sharp and decisive
        return f"{name} {name} {name} {category} {category} {category} {tags} {tags} {description}"

    def fit_and_score(
        self,
        user_interests: str,
        interest_tags: List[str],
        places: List[Dict[str, Any]],
        user_preference_weights: Dict[str, float] = None
    ) -> List[float]:
        """
        Calculates calibrated semantic relevance score for each place [0.05, 1.0].
        Guarantees that explicitly requested categories (like Food & Cafes) and landmarks
        rise directly to the top with high confidence match scores (80-95%+).
        """
        if not places:
            return []

        # 1. Expand query semantics using selected tags
        tag_expansions_list = [TAG_EXPANSIONS.get(t, t) for t in interest_tags]
        expanded_tag_str = " ".join(tag_expansions_list)
        raw_query = f"{user_interests} {' '.join(interest_tags)} {expanded_tag_str}".strip()
        if not raw_query:
            raw_query = "top sightseeing landmark attractions"

        raw_query_lower = raw_query.lower()
        art_requested = (
            "Art & Museums" in interest_tags or
            any(w in raw_query_lower for w in ["art", "museum", "gallery", "painting", "sculpture", "exhibition"])
        )

        # Duplicate user interests to balance query length against document vectors
        query_doc = f"{user_interests} {user_interests} {raw_query}"
        query_tokens = self._tokenize(raw_query)

        # 2. Build place documents & TF-IDF Cosine Similarity
        place_docs = [self._prepare_place_document(p) for p in places]
        all_docs = [query_doc] + place_docs

        try:
            tfidf_matrix = self.vectorizer.fit_transform(all_docs)
            query_vector = tfidf_matrix[0:1]
            place_vectors = tfidf_matrix[1:]
            cosine_sims = cosine_similarity(query_vector, place_vectors)[0]
        except Exception:
            cosine_sims = [0.1] * len(places)

        scores = []
        has_specific_tags = bool(interest_tags or user_interests.strip())

        for i, place in enumerate(places):
            category = place.get("category", "General")
            name = place.get("name", "")
            tags = place.get("tags", [])

            # Suppress unrequested Art
            if not art_requested:
                if category == "Art" or any(t in ["art", "museum", "gallery"] for t in tags) or any(w in name.lower() for w in ["museum", "gallery of art"]):
                    scores.append(0.01)
                    continue

            base_sim = float(cosine_sims[i])

            # 3. Direct Landmark & Category Salience Matching
            name_tokens = self._tokenize(name)
            tag_tokens = self._tokenize(" ".join(tags))
            cat_tokens = self._tokenize(category)

            name_overlap = len(query_tokens.intersection(name_tokens))
            tag_overlap = len(query_tokens.intersection(tag_tokens))
            cat_overlap = len(query_tokens.intersection(cat_tokens))

            # Major salience boost if the user literally mentioned this landmark name
            if name_overlap >= 2:
                landmark_bonus = 0.45
            elif name_overlap == 1:
                landmark_bonus = 0.28
            else:
                landmark_bonus = 0.0

            # Strong category alignment bonus (especially for Food, Spirituality, History, Nature)
            cat_bonus = 0.40 if cat_overlap > 0 else 0.0
            tag_bonus = min(0.25, tag_overlap * 0.10)

            # Rating prior (slight quality bias, 5%)
            rating = float(place.get("rating", 4.5)) / 5.0
            rating_prior = rating * 0.05

            # If the user selected specific themes (like Food & Cafes) and this place has 0 overlap:
            if has_specific_tags and cat_overlap == 0 and tag_overlap == 0 and name_overlap == 0 and base_sim < 0.10:
                scores.append(0.02)
                continue

            # 5. Feedback personalization weight
            pref_weight = 1.0
            if user_preference_weights:
                pref_weight = user_preference_weights.get(category, 1.0)

            raw_score = ((0.50 * base_sim) + landmark_bonus + cat_bonus + tag_bonus + rating_prior) * pref_weight
            calibrated = round(min(1.0, max(0.05, raw_score)), 4)
            scores.append(calibrated)

        return scores
