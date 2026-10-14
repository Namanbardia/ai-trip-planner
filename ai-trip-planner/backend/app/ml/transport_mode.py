from typing import Dict, Any

class TransportModeAssigner:
    """
    Assigns optimal local travel mode per route leg based on distance and transit time.
    Supported modes:
    - Walking (0 - 1.2 km)
    - Auto / Rickshaw (1.2 - 4.0 km)
    - Public Transit / Metro / Bus (4.0 - 8.0 km)
    - Cab / Taxi (> 8.0 km)
    """
    @staticmethod
    def assign_mode(distance_km: float) -> Dict[str, Any]:
        d = round(distance_km, 2)
        if d <= 1.2:
            speed_kmh = 4.5
            duration_mins = round((d / speed_kmh) * 60)
            mode = "walking"
            icon = "Footprints"
            rationale = "Short walkable distance; healthy and scenic"
        elif d <= 4.0:
            speed_kmh = 22.0
            duration_mins = round(((d / speed_kmh) * 60) + 3) # 3 min dispatch
            mode = "auto_rickshaw"
            icon = "Car"
            rationale = "Ideal short hop; quick and agile through urban streets"
        elif d <= 8.0:
            speed_kmh = 28.0
            duration_mins = round(((d / speed_kmh) * 60) + 5) # 5 min headway
            mode = "public_transit"
            icon = "Train"
            rationale = "Rapid transit corridor (Metro / Bus line)"
        else:
            speed_kmh = 38.0
            duration_mins = round(((d / speed_kmh) * 60) + 4) # 4 min pickup
            mode = "cab"
            icon = "CarTaxiFront"
            rationale = "Longer cross-town distance; fastest direct transport"

        return {
            "mode": mode,
            "display_name": mode.replace("_", " ").title(),
            "distance_km": d,
            "duration_mins": max(5, duration_mins),
            "icon": icon,
            "rationale": rationale
        }
