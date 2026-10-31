from pydantic import BaseModel, Field
from typing import List, Optional

class TripPlanRequest(BaseModel):
    destination: str = Field(..., description="Destination city (e.g. Paris, Tokyo, London, Rome, Barcelona, Jaipur, or any global city)")
    days: int = Field(3, ge=1, le=7, description="Number of sightseeing days")
    interests: str = Field("", description="Free text user interests")
    interest_tags: List[str] = Field(default_factory=list, description="Selected interest tags")
    pace_preference: str = Field("moderate", description="'relaxed' (5.5h/day), 'moderate' (7.5h/day), or 'fast' (9.0h/day)")
    use_genetic_algorithm: bool = Field(True, description="Whether to optimize with Genetic Algorithm or Greedy Heuristic")
    variation_seed: Optional[int] = Field(None, description="Random seed to explore alternative spots and routes")
    hotel_name: Optional[str] = Field(None, description="Optional hotel name to anchor the itinerary at (e.g. 'Taj Palace New Delhi')")

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)

class FeedbackRequest(BaseModel):
    place_id: str
    place_name: str
    category: str
    action: str = Field(..., description="'like', 'dislike', or 'skip'")

class GeocodeHotelRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=200, description="Hotel name, ideally with city (e.g. 'Taj Palace New Delhi')")
    city: Optional[str] = Field(None, description="Optional city to disambiguate the hotel search")

class OptimizerBenchmarkRequest(BaseModel):
    destination: str = "paris"
    day: int = 1
    max_time_budget_hours: float = 7.5
