from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TripPlanRequest(BaseModel):
    destination: str = Field(..., description="Destination city (e.g. Paris, Tokyo, London, Rome, Barcelona, Jaipur, or any global city)")
    days: int = Field(3, ge=1, le=7, description="Number of sightseeing days")
    interests: str = Field("Art, history, scenic viewpoints, local cuisine", description="Free text user interests")
    interest_tags: List[str] = Field(default=["Art", "History", "Food"], description="Selected interest tags")
    pace_preference: str = Field("moderate", description="'relaxed' (5.5h/day), 'moderate' (7.5h/day), or 'fast' (9.0h/day)")
    use_genetic_algorithm: bool = Field(True, description="Whether to optimize with Genetic Algorithm or Greedy Heuristic")
    variation_seed: Optional[int] = Field(None, description="Random seed to explore alternative spots and routes")

class FeedbackRequest(BaseModel):
    place_id: str
    place_name: str
    category: str
    action: str = Field(..., description="'like', 'dislike', or 'skip'")

class SaveTripRequest(BaseModel):
    destination: str
    days: int
    hotel: Dict[str, Any]
    daily_routes: List[Dict[str, Any]]

class OptimizerBenchmarkRequest(BaseModel):
    destination: str = "paris"
    day: int = 1
    max_time_budget_hours: float = 7.5
