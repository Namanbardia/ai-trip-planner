import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Compass } from 'lucide-react';

const DAY_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0284c7'];

const createAttractionIcon = (dayIndex, stopIndex) => {
  const color = DAY_COLORS[dayIndex % DAY_COLORS.length];
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${stopIndex}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const createHotelIcon = () => {
  return L.divIcon({
    className: 'custom-hotel-marker',
    html: `
      <div style="
        background-color: #0f172a;
        color: #facc15;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        border: 2px solid white;
      ">
        🏨
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

/** Fits the map view to every visible stop (+ hotel) when routes change. */
function FitBounds({ positions, boundsKey }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    // Defer so tiles/markers have laid out first
    const t = setTimeout(() => {
      try {
        map.fitBounds(positions, { padding: [40, 40], maxZoom: 14, animate: true });
      } catch {
        /* map may be unmounting */
      }
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundsKey, map]);
  return null;
}

export default function TripMap({ tripPlan, activeDay }) {
  if (!tripPlan || !tripPlan.daily_routes || tripPlan.daily_routes.length === 0) {
    return (
      <div className="h-96 w-full bg-bone flex flex-col items-center justify-center text-sage border border-ink/10">
        <Compass className="w-10 h-10 mb-2 stroke-[1.5]" />
        <p className="font-sans text-sm">Your route map will appear once an itinerary is generated</p>
      </div>
    );
  }

  const { coordinates, start_location: startLocation, daily_routes } = tripPlan;
  const initialCenter = coordinates || { lat: 48.8566, lng: 2.3522 };

  const displayedRoutes = activeDay === 0 || activeDay === null
    ? daily_routes
    : daily_routes.filter((r) => r.day === activeDay);

  const activeCenter = activeDay && activeDay > 0 && daily_routes[activeDay - 1]?.centroid
    ? daily_routes[activeDay - 1].centroid
    : initialCenter;

  // Collect every visible point so the map can auto-fit to them
  const allPositions = [];
  if (startLocation?.lat) allPositions.push([startLocation.lat, startLocation.lng]);
  displayedRoutes.forEach((d) =>
    (d.attractions || []).forEach((p) => {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') allPositions.push([p.lat, p.lng]);
    })
  );
  // Stable identity for the effect: serialize so it only refits when points change
  const boundsKey = allPositions.map((p) => p.join(',')).join('|');

  return (
    <div className="relative w-full h-[540px] overflow-hidden border border-ink/15">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapRecenter center={activeCenter} />
        <FitBounds positions={allPositions} boundsKey={boundsKey} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {startLocation && (
          <Marker
            position={[startLocation.lat, startLocation.lng]}
            icon={createHotelIcon()}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-xs text-slate-900">{startLocation.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {startLocation.source === 'user_hotel'
                    ? 'Your stay — every day starts here'
                    : 'City centre — add a hotel to start from your door'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {displayedRoutes.map((dayPlan) => {
          const color = DAY_COLORS[(dayPlan.day - 1) % DAY_COLORS.length];
          const stops = dayPlan.attractions || [];

          const polylineCoords = [];
          if (startLocation) {
            polylineCoords.push([startLocation.lat, startLocation.lng]);
          }
          stops.forEach((p) => {
            polylineCoords.push([p.lat, p.lng]);
          });

          return (
            <React.Fragment key={`day-layer-${dayPlan.day}`}>
              {polylineCoords.length > 1 && (
                <Polyline
                  positions={polylineCoords}
                  pathOptions={{
                    color,
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '6, 6'
                  }}
                />
              )}

              {stops.map((place, stopIdx) => (
                <Marker
                  key={`stop-${place.id || stopIdx}`}
                  position={[place.lat, place.lng]}
                  icon={createAttractionIcon(dayPlan.day - 1, stopIdx + 1)}
                >
                  <Popup>
                    <div className="p-1 max-w-[220px]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          Day {dayPlan.day} • Stop #{stopIdx + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          ★ {place.rating}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">{place.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {place.description}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-100">
                        <span>Duration: {place.duration_hours}h</span>
                        <span className="text-indigo-600 font-semibold">
                          Match: {Math.round((place.relevance_score || 0.8) * 100)}%
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[1000] bg-ivory/95 backdrop-blur-xs p-2.5 shadow-md border border-ink/15 text-xs">
        <div className="font-sans font-semibold text-ink text-[11px] mb-1.5 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-terracotta" />
          Legend
        </div>
        <div className="flex items-center gap-2 mb-1 text-[11px] text-sage">
          <span className="w-3.5 h-3.5 bg-ink rounded text-center text-[10px] leading-3 text-yellow-300">🏨</span>
          <span>{startLocation?.source === 'user_hotel' ? 'Your hotel' : 'City centre'}</span>
        </div>
        {tripPlan.daily_routes.map((d, i) => (
          <div key={d.day} className="flex items-center gap-2 text-[11px] text-sage mb-0.5">
            <span
              className="w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }}
            >
              {d.day}
            </span>
            <span>Day {d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
