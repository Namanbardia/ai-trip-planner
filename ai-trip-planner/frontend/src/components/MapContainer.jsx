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

export default function TripMap({ tripPlan, activeDay }) {
  if (!tripPlan || !tripPlan.daily_routes || tripPlan.daily_routes.length === 0) {
    return (
      <div className="h-96 w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200">
        <Compass className="w-10 h-10 mb-2 stroke-[1.5]" />
        <p className="text-sm">Submit your preferences to generate the interactive route map</p>
      </div>
    );
  }

  const { coordinates, recommended_hotel, daily_routes } = tripPlan;
  const initialCenter = coordinates || { lat: 48.8566, lng: 2.3522 };

  const displayedRoutes = activeDay === 0 || activeDay === null
    ? daily_routes
    : daily_routes.filter((r) => r.day === activeDay);

  const activeCenter = activeDay && activeDay > 0 && daily_routes[activeDay - 1]?.centroid
    ? daily_routes[activeDay - 1].centroid
    : initialCenter;

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <MapRecenter center={activeCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {recommended_hotel && (
          <Marker
            position={[recommended_hotel.lat, recommended_hotel.lng]}
            icon={createHotelIcon()}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold text-xs text-slate-900">{recommended_hotel.name}</div>
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  ★ {recommended_hotel.rating} / 5.0
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Anchor Hotel: Selected for route proximity
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {displayedRoutes.map((dayPlan) => {
          const color = DAY_COLORS[(dayPlan.day - 1) % DAY_COLORS.length];
          const stops = dayPlan.attractions || [];

          const polylineCoords = [];
          if (recommended_hotel) {
            polylineCoords.push([recommended_hotel.lat, recommended_hotel.lng]);
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

      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-slate-200/80 text-xs">
        <div className="font-semibold text-slate-700 text-[11px] mb-1.5 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-indigo-600" />
          Map Legend
        </div>
        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-600">
          <span className="w-3.5 h-3.5 bg-slate-900 rounded text-center text-[10px] leading-3 text-yellow-300">🏨</span>
          <span>Anchor Hotel</span>
        </div>
        {tripPlan.daily_routes.map((d, i) => (
          <div key={d.day} className="flex items-center gap-2 text-[11px] text-slate-600 mb-0.5">
            <span
              className="w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }}
            >
              {d.day}
            </span>
            <span>Day {d.day} Itinerary</span>
          </div>
        ))}
      </div>
    </div>
  );
}
