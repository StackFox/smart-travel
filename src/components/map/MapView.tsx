import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTravelStore } from '../../store/useTravelStore';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MapBounder = ({ destinations }: { destinations: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (destinations.length > 0) {
      const bounds = L.latLngBounds(destinations.map(d => [d.coordinates.lat, d.coordinates.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [destinations, map]);
  return null;
};

const getArrowIcon = (p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) => {
  const dy = p2.lat - p1.lat;
  const dx = p2.lng - p1.lng;
  const angle = Math.atan2(-dy, dx) * (180 / Math.PI);

  return L.divIcon({
    html: `<div style="transform: rotate(${angle}deg); color: #0d9488; background: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid #0d9488;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const MapView = () => {
  const { selectedDestinations, itinerary } = useTravelStore();

  const orderedDestinations = itinerary.flatMap(day => 
    day.items.map(item => {
      const dest = selectedDestinations.find(d => d.id === item.destinationId);
      return dest ? { ...dest, dayNumber: day.dayNumber, activityName: item.activityName } : null;
    })
  ).filter(Boolean) as (any)[];

  const paths = orderedDestinations.map(d => [d.coordinates.lat, d.coordinates.lng] as [number, number]);

  return (
    <div className="w-full h-svh relative">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 left-6 right-6 z-20 pointer-events-none"
      >
        <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-lg border border-teal-100/50 dark:border-slate-700">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-display font-bold text-slate-800 dark:text-slate-200">
            Route Map
          </h1>
          {selectedDestinations.length > 0 && (
            <span className="text-xs text-slate-400 ml-1">
              ({selectedDestinations.length} stops)
            </span>
          )}
        </div>
      </motion.div>

      <MapContainer
        center={[20, 78]}
        zoom={5}
        className="leaflet-container"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedDestinations.length > 0 && <MapBounder destinations={selectedDestinations} />}

        {paths.length > 1 && (
          <Polyline
            positions={paths}
            color="#0d9488"
            weight={3}
            opacity={0.7}
            dashArray="8, 8"
          />
        )}

        {orderedDestinations.map((dest, i) => {
          if (i === orderedDestinations.length - 1) return null;
          const next = orderedDestinations[i + 1];
          if (dest.coordinates.lat === next.coordinates.lat && dest.coordinates.lng === next.coordinates.lng) {
            return null; // Skip drawing arrows for identical consecutive locations
          }
          const mid: [number, number] = [
            (dest.coordinates.lat + next.coordinates.lat) / 2,
            (dest.coordinates.lng + next.coordinates.lng) / 2,
          ];
          return (
            <Marker
              key={`arrow-${dest.id}-${i}`}
              position={mid}
              icon={getArrowIcon(dest.coordinates, next.coordinates)}
            />
          );
        })}

        {selectedDestinations.map((dest) => {
          const daysVisited = itinerary
            .filter(day => day.items.some(item => item.destinationId === dest.id))
            .map(d => d.dayNumber);
          
          const uniqueDays = Array.from(new Set(daysVisited)).sort((a,b) => a-b);
          const dayText = uniqueDays.length > 0 ? ` • Day ${uniqueDays.join(', ')}` : '';

          return (
            <Marker key={dest.id} position={[dest.coordinates.lat, dest.coordinates.lng]}>
              <Popup>
                <div className="font-sans min-w-[140px]">
                  <strong className="text-teal-700 text-sm block mb-1">{dest.name}</strong>
                  <div className="m-0 mt-0.5 text-slate-500 text-xs font-medium">
                    {dest.country}
                    <span className="text-teal-600 font-bold">{dayText}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
