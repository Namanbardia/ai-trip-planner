import time
import random
import numpy as np
from typing import List, Dict, Any, Tuple
from app.ml.geo_clustering import haversine_distance_km
from app.ml.transport_mode import TransportModeAssigner

class OrienteeringOptimizer:
    """
    Formulates and solves the Attraction Itinerary as an Orienteering Problem (OP) /
    Traveling Salesman Problem with Time Windows & Daily Time Budget constraints.
    Supports:
    1. Genetic Algorithm (GA)
    2. Greedy Heuristic
    3. Benchmark Comparison Engine
    """
    def __init__(self):
        pass

    def _calculate_travel_time_hours(self, dist_km: float) -> float:
        # Average urban speed 20 km/h + 5 min overhead
        return (dist_km / 20.0) + (5.0 / 60.0)

    def solve_greedy(
        self,
        candidate_places: List[Dict[str, Any]],
        start_location: Tuple[float, float],
        max_time_budget_hours: float = 7.5
    ) -> Dict[str, Any]:
        """
        Greedy Heuristic:
        Iteratively selects the unvisited attraction that maximizes relevance score per unit of time
        (visit duration + travel time) without exceeding the remaining day time budget.
        """
        start_time = time.perf_counter()
        remaining_candidates = list(candidate_places)
        current_loc = start_location
        route: List[Dict[str, Any]] = []
        elapsed_hours = 0.0
        total_dist_km = 0.0

        while remaining_candidates:
            best_idx = -1
            best_ratio = -1e9
            best_travel_hours = 0.0
            best_dist_km = 0.0

            for i, cand in enumerate(remaining_candidates):
                d_km = haversine_distance_km(current_loc[0], current_loc[1], cand["lat"], cand["lng"])
                t_travel = self._calculate_travel_time_hours(d_km)
                visit_dur = float(cand.get("duration_hours", 1.5))
                projected_time = elapsed_hours + t_travel + visit_dur

                if projected_time <= max_time_budget_hours:
                    score = float(cand.get("relevance_score", 0.5))
                    ratio = score / (t_travel + visit_dur + 0.01)
                    if ratio > best_ratio:
                        best_ratio = ratio
                        best_idx = i
                        best_travel_hours = t_travel
                        best_dist_km = d_km

            if best_idx != -1:
                chosen = remaining_candidates.pop(best_idx)
                chosen["leg_distance_km"] = round(best_dist_km, 2)
                route.append(chosen)
                elapsed_hours += best_travel_hours + float(chosen.get("duration_hours", 1.5))
                total_dist_km += best_dist_km
                current_loc = (chosen["lat"], chosen["lng"])
            else:
                # No more candidates fit within the time budget
                break

        exec_ms = round((time.perf_counter() - start_time) * 1000, 2)
        total_score = sum(p.get("relevance_score", 0.0) for p in route)

        return {
            "algorithm": "Greedy Heuristic",
            "route": route,
            "total_score": round(total_score, 3),
            "total_duration_hours": round(elapsed_hours, 2),
            "time_budget_hours": max_time_budget_hours,
            "adherence_rate": round(min(1.0, elapsed_hours / max_time_budget_hours) * 100, 1),
            "total_distance_km": round(total_dist_km, 2),
            "places_count": len(route),
            "execution_time_ms": exec_ms
        }

    def solve_genetic(
        self,
        candidate_places: List[Dict[str, Any]],
        start_location: Tuple[float, float],
        max_time_budget_hours: float = 7.5,
        population_size: int = 40,
        generations: int = 50
    ) -> Dict[str, Any]:
        """
        Genetic Algorithm (GA):
        Evolves permutation sequences using tournament selection, order crossover (OX),
        and 2-opt swap mutations with penalty function for budget overruns.
        """
        start_time = time.perf_counter()
        n = len(candidate_places)
        if n == 0:
            return self.solve_greedy(candidate_places, start_location, max_time_budget_hours)

        # Fitness function evaluates subset prefix that fits in budget plus total score
        def evaluate_chromosome(chromo: List[int]) -> Tuple[float, List[int], float, float]:
            cur_loc = start_location
            elapsed = 0.0
            score = 0.0
            dist = 0.0
            feasible_prefix = []

            for idx in chromo:
                place = candidate_places[idx]
                d = haversine_distance_km(cur_loc[0], cur_loc[1], place["lat"], place["lng"])
                t_travel = self._calculate_travel_time_hours(d)
                visit = float(place.get("duration_hours", 1.5))

                if elapsed + t_travel + visit <= max_time_budget_hours:
                    feasible_prefix.append(idx)
                    elapsed += t_travel + visit
                    score += float(place.get("relevance_score", 0.5))
                    dist += d
                    cur_loc = (place["lat"], place["lng"])
                else:
                    break

            # Fitness is total score with slight distance penalty
            fitness = score - (0.01 * dist)
            return fitness, feasible_prefix, elapsed, dist

        # Initialize population (permutations of indices)
        population = [random.sample(range(n), n) for _ in range(population_size)]

        best_chromo = population[0]
        best_fitness, best_prefix, best_elapsed, best_dist = evaluate_chromosome(best_chromo)

        for _ in range(generations):
            # Evaluate all
            fitnesses = [evaluate_chromosome(ind) for ind in population]
            for i, (fit, pref, elap, dst) in enumerate(fitnesses):
                if fit > best_fitness:
                    best_fitness = fit
                    best_chromo = population[i]
                    best_prefix = pref
                    best_elapsed = elap
                    best_dist = dst

            # Tournament Selection
            new_pop = []
            for _ in range(population_size):
                i1, i2 = random.sample(range(population_size), 2)
                parent1 = population[i1] if fitnesses[i1][0] >= fitnesses[i2][0] else population[i2]
                i3, i4 = random.sample(range(population_size), 2)
                parent2 = population[i3] if fitnesses[i3][0] >= fitnesses[i4][0] else population[i4]

                # Order Crossover (OX)
                cut1, cut2 = sorted(random.sample(range(n), 2)) if n > 1 else (0, 0)
                child = [-1] * n
                child[cut1:cut2] = parent1[cut1:cut2]
                fill_vals = [item for item in parent2 if item not in child[cut1:cut2]]
                fill_idx = 0
                for pos in range(n):
                    if child[pos] == -1:
                        child[pos] = fill_vals[fill_idx]
                        fill_idx += 1

                # Mutation (Swap)
                if random.random() < 0.2 and n > 1:
                    m1, m2 = random.sample(range(n), 2)
                    child[m1], child[m2] = child[m2], child[m1]

                new_pop.append(child)

            population = new_pop

        exec_ms = round((time.perf_counter() - start_time) * 1000, 2)

        # Build final route sequence
        route: List[Dict[str, Any]] = []
        cur_loc = start_location
        for idx in best_prefix:
            place = dict(candidate_places[idx])
            d = haversine_distance_km(cur_loc[0], cur_loc[1], place["lat"], place["lng"])
            place["leg_distance_km"] = round(d, 2)
            route.append(place)
            cur_loc = (place["lat"], place["lng"])

        total_score = sum(p.get("relevance_score", 0.0) for p in route)

        return {
            "algorithm": "Genetic Algorithm (GA)",
            "route": route,
            "total_score": round(total_score, 3),
            "total_duration_hours": round(best_elapsed, 2),
            "time_budget_hours": max_time_budget_hours,
            "adherence_rate": round(min(1.0, best_elapsed / max_time_budget_hours) * 100, 1),
            "total_distance_km": round(best_dist, 2),
            "places_count": len(route),
            "execution_time_ms": exec_ms
        }

    def build_daily_itinerary_with_transit(
        self,
        day_attractions: List[Dict[str, Any]],
        start_location: Tuple[float, float],
        max_time_budget_hours: float = 7.5,
        use_genetic: bool = True
    ) -> Dict[str, Any]:
        """
        Solves the daily route and enriches each leg with rule-based transport mode assignments.
        """
        if use_genetic and len(day_attractions) >= 4:
            solution = self.solve_genetic(day_attractions, start_location, max_time_budget_hours)
        else:
            solution = self.solve_greedy(day_attractions, start_location, max_time_budget_hours)

        route_places = solution["route"]
        transit_legs = []

        cur_name = "Hotel / Starting Point"
        for i, place in enumerate(route_places):
            leg_dist = place.get("leg_distance_km", 1.0)
            mode_info = TransportModeAssigner.assign_mode(leg_dist)
            mode_info["from"] = cur_name
            mode_info["to"] = place.get("name")
            mode_info["leg_index"] = i + 1
            transit_legs.append(mode_info)
            cur_name = place.get("name")

        solution["transit_legs"] = transit_legs
        return solution

    def compare_optimizers(
        self,
        candidate_places: List[Dict[str, Any]],
        start_location: Tuple[float, float],
        max_time_budget_hours: float = 7.5
    ) -> Dict[str, Any]:
        """Benchmark comparison between Greedy Heuristic and Genetic Algorithm."""
        greedy_res = self.solve_greedy(candidate_places, start_location, max_time_budget_hours)
        genetic_res = self.solve_genetic(candidate_places, start_location, max_time_budget_hours)

        # Calculate solution quality delta
        score_diff = round(genetic_res["total_score"] - greedy_res["total_score"], 3)
        time_diff = round(genetic_res["execution_time_ms"] - greedy_res["execution_time_ms"], 2)

        return {
            "greedy": greedy_res,
            "genetic": genetic_res,
            "comparison": {
                "score_gain_genetic": score_diff,
                "percent_gain": round((score_diff / max(0.01, greedy_res["total_score"])) * 100, 1),
                "runtime_overhead_ms": time_diff,
                "winner": "Genetic Algorithm" if score_diff >= 0 else "Greedy Heuristic"
            }
        }
