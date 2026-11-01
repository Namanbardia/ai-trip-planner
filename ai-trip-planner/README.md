# AI-Powered End-to-End Trip Planner (TripBuddy)

A full-stack trip planning system that combines **semantic interest matching**, **spatial clustering**, **combinatorial route optimization**, and **feedback-based personalization** — with admin authentication and a polished React UI.

> **No LLM / API key required.** All "AI" is classical machine learning running locally:
> TF-IDF matching, K-Means clustering, and a genetic-algorithm route optimizer.
> External data comes from 100% free, keyless APIs.

---

## Core Pillars Implemented

### 1. Semantic Interest Matching
- **Engine**: Multi-gram TF-IDF latent concept representations with a keyword-ontology expansion (`TAG_EXPANSIONS` in `backend/app/ml/semantic_matching.py`) mapping themes like *fine arts, serene gardens, ancient ruins, street cuisine, panoramas*.
- **Hybrid Scoring**: Cosine similarity between the user query and attraction documents (names, categories, tags, descriptions), plus landmark-name salience, category alignment, rating priors, and personalization multipliers.
- **Caching**: The TF-IDF model is fitted once per distinct attraction corpus instead of on every request (measured ~2× faster repeat planning).

### 2. Geographic Clustering (K-Means)
- **Algorithm**: `sklearn.cluster.KMeans` groups high-relevance candidate attractions into *K = number of trip days* spatial clusters.
- **Centroids**: Geographic hubs for each day eliminate backtracking and minimize inter-attraction transit.

### 3. Feedback-Based Personalization
- Tracks **Likes** (👍), **Dislikes** (👎), **Skips** (⏭), and **Saved trips** (🔖).
- Dynamic category weights (+0.25 like, −0.40 dislike, −0.10 skip) immediately re-weight subsequent scoring.
- A transparency drawer shows the learned preference profile live.

### 4. Combinatorial Route Optimization (Orienteering Problem)
- Daily sightseeing is formulated as an Orienteering Problem with per-day time budgets.
- **Solvers**:
  - **Genetic Algorithm (GA)**: population-based search with order crossover (OX) and 2-opt mutations.
  - **Greedy Heuristic**: nearest-stop baseline.
  - **Benchmark Modal**: live side-by-side comparison (open it via **Compare Optimizers** in the trip header).

### 5. Proximity-Aware Hotel Ranking
- `S = 0.70 · S_proximity + 0.30 · S_rating`, where proximity is the average distance from a hotel to all daily cluster centroids.

### 6. Local Transport Mode Assignment
- Walking (≤ 1.2 km), auto/rickshaw (1.2–4.0 km), public transit (4.0–8.0 km), cab (> 8.0 km).

---

## Authentication

Single-admin JWT auth (default credentials **`admin` / `admin123`**):

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/login` | Returns a JWT bearer token |
| `GET /api/auth/me` | Validates the current token |

- All planning endpoints (`plan-trip`, `feedback`, `geocode-hotel`, `user-profile`, `compare-optimizers`, `destinations`) require `Authorization: Bearer <token>`; without it they return **401**.
- Passwords are verified against a **PBKDF2-SHA256** hash (never plaintext).
- Configure via `backend/.env` (copy from `backend/.env.example`): `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `JWT_EXPIRY_SECONDS`, `ALLOWED_ORIGINS`.

Generate a new password hash:
```bash
cd backend
python -c "from app.auth import hash_password; print(hash_password('your-new-password'))"
```

---

## 100% Free Data Sources
- **OpenStreetMap Nominatim**: free geocoding for any global city (no API key).
- **Wikipedia API**: category + search + geosearch retrieval of genuine attractions with summaries, coordinates, and thumbnails.
- **Curated high-fidelity destinations** (instant, zero-latency): Paris, Tokyo, London, Rome, Barcelona, Jaipur, Delhi (+ "New Delhi" alias).

> Unknown cities are geocoded live; if a city can't be resolved, the API returns a clear
> **404 error** explaining what to try — it never silently substitutes another city.

---

## Running the Application

### Prerequisites
- Python 3.11+ and Node.js 18+

### One-shot (Windows)
```bat
run-app.bat
```
Starts the backend on http://127.0.0.1:8000 and the frontend on http://localhost:5173.

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python run.py
# Runs on http://127.0.0.1:8000
# Interactive API docs: http://127.0.0.1:8000/docs
```

### Frontend (React + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (proxies /api to the backend)
```

### Production build
```bash
cd frontend
npm run build      # outputs to frontend/dist
```
> Note: the dev server proxies `/api` to the backend. When serving the production build,
> host it behind the same reverse proxy as the API (or expose the API origin directly).

---

## Project Structure

```
ai-trip-planner/
├─ backend/
│  ├─ run.py                 # uvicorn entry point
│  ├─ requirements.txt
│  ├─ .env.example           # configuration template
│  └─ app/
│     ├─ main.py             # FastAPI app, CORS allow-list, health route
│     ├─ auth.py             # PBKDF2 password verify + JWT issue/verify
│     ├─ routes.py           # API endpoints + planning pipeline
│     ├─ models.py           # Pydantic request models
│     ├─ data/               # seed destinations + free API client
│     └─ ml/                 # semantic_matching, geo_clustering,
│                             # optimizer, personalization,
│                             # transport_mode
└─ frontend/
   └─ src/
      ├─ api.js              # fetch wrapper: JWT header + 401 handling
      ├─ App.jsx             # auth gate, hero, layout
      └─ components/         # LoginScreen, TripForm, MapContainer,
                             # ItineraryView,
                             # PersonalizationDrawer, OptimizerBenchmarkModal,
                             # PlanSkeleton, Navbar
```
