# AI-Powered End-to-End Trip Planner

A full-stack, research-grade intelligent trip planning system combining semantic embeddings, spatial clustering, combinatorial route optimization, and feedback-based personalization.

---

## Core Pillars Implemented

### 1. Semantic Interest Matching
- **Concept & Model**: Understands natural language interests and attraction descriptions through dense semantic embeddings rather than shallow keyword matching.
- **Engine**: Combines multi-gram TF-IDF latent concept representations with semantic ontology expansion (mapping themes like *fine arts, impressionism, serene gardens, ancient ruins, local street cuisine, panoramas*).
- **Hybrid Scoring**: Computes cosine similarities between user query vectors and attraction documents (names, categories, visitor reviews, descriptions) weighted against popularity priors.

### 2. Geographic Clustering (K-Means)
- **Algorithm**: `sklearn.cluster.KMeans` groups high-relevance candidate attractions into $K = \text{number of trip days}$ spatial clusters based on coordinates.
- **Centroids**: Calculates geographic hub centroids for each sightseeing day to eliminate backtracking and minimize inter-attraction transit times.

### 3. Feedback-Based Personalization
- **Reinforcement & Learning**: Tracks user interactions: **Likes** (👍), **Dislikes** (👎), **Skipped places** (⏭), and **Saved trips** (🔖).
- **Dynamic Category Weights**: Dynamically updates affinity multipliers (+0.25 on Like, -0.40 on Dislike, -0.10 on Skip) which immediately re-weight subsequent semantic scoring and ranking.
- **Transparency Drawer**: Users can inspect their learned preference profile in real-time.

### 4. Combinatorial Route Optimization (Orienteering Problem)
- **Formulation**: Formulates daily sightseeing as an Orienteering Problem (a variant of the Traveling Salesman Problem with daily time budgets).
- **Solvers**:
  - **Genetic Algorithm (GA)**: Population-based stochastic search with order crossover (OX) and 2-opt swap mutations.
  - **Greedy Heuristic**: Sequential highest value-to-travel-cost ratio baseline.
  - **Benchmark Modal**: Live comparative evaluation displaying score gains, schedule adherence, and execution runtime (ms).

### 5. Proximity-Aware Hotel Ranking
- **Centroid Anchoring**: Ranks candidate accommodations based on a multi-criteria utility function:
  $$S = 0.70 \cdot S_{\text{proximity}} + 0.30 \cdot S_{\text{rating}}$$
  where proximity measures average distance from the hotel to all daily attraction cluster centroids.

### 6. Local Transport Mode Assignment
- Evaluates each inter-attraction leg by distance:
  - Walking ($\le 1.2$ km)
  - Auto / Rickshaw ($1.2 - 4.0$ km)
  - Public Transit / Metro ($4.0 - 8.0$ km)
  - Cab / Taxi ($> 8.0$ km)

---

## 100% Free Data Sources
- **OpenStreetMap Nominatim**: Free geocoding for any global city without API keys.
- **OpenStreetMap Overpass API**: Free live point-of-interest extraction for cultural monuments, museums, viewpoints, and lodging.
- **Wikipedia REST API**: Free rich summaries and image thumbnails.
- **Curated High-Fidelity Destinations**: Paris, Tokyo, Rome, Barcelona, Jaipur for instant, zero-latency demonstration.

---

## Running the Application

### Backend (FastAPI)
```bash
cd backend
python run.py
# Runs on http://127.0.0.1:8000
```

### Frontend (React + Tailwind CSS)
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```
