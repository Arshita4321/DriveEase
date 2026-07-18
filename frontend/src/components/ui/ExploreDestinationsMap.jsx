import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export const ROAD_TRIPS = [
  {
    id: 'manali-leh',
    name: 'Manali to Leh Expedition',
    description: 'High-altitude adventure through the Himalayas. Perfect for powerful 4x4 SUVs or Adventure Bikes.',
    distance: '428 km',
    duration: '2-3 Days',
    terrain: 'Mountainous / Off-road',
    tags: ['SUV', 'Bike'],
    image: 'https://images.unsplash.com/photo-1626714486984-7a18f4a0a54e?q=80&w=600&auto=format&fit=crop',
    waypoints: [
      [32.2396, 77.1887], // Manali
      [34.1526, 77.5771]  // Leh
    ],
    color: '#06B6D4' // Cyan
  },
  {
    id: 'mumbai-goa',
    name: 'Mumbai to Goa Coastal Cruise',
    description: 'Scenic highway hugging the Western Ghats. Great for comfortable Sedans or Cruiser Bikes.',
    distance: '590 km',
    duration: '10-12 Hours',
    terrain: 'Highway / Coastal',
    tags: ['Car', 'Bike'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop',
    waypoints: [
      [19.0760, 72.8777], // Mumbai
      [15.2993, 74.1240]  // Goa
    ],
    color: '#FB923C' // Orange
  },
  {
    id: 'bangalore-coorg',
    name: 'Bangalore to Coorg Escape',
    description: 'Winding roads through coffee plantations. A peppy Hatchback or sporty SUV is ideal.',
    distance: '265 km',
    duration: '5-6 Hours',
    terrain: 'Hilly / Winding',
    tags: ['Car', 'SUV'],
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=600&auto=format&fit=crop',
    waypoints: [
      [12.9716, 77.5946], // Bangalore
      [12.4244, 75.7382]  // Coorg
    ],
    color: '#10B981' // Emerald
  }
];

export default function ExploreDestinationsMap({ onSelectTrip }) {
  // Center map on India
  const position = [21.1458, 79.0882];
  
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-card dark:shadow-card-dark">
      <MapContainer 
        center={position} 
        zoom={5} 
        scrollWheelZoom={false}
        className="z-0 h-full w-full"
      >
        {/* CartoDB Positron for a clean, minimalist look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {ROAD_TRIPS.map((trip) => (
          <React.Fragment key={trip.id}>
            <Polyline 
              positions={trip.waypoints} 
              pathOptions={{ color: trip.color, weight: 4, opacity: 0.8 }}
              eventHandlers={{
                click: () => onSelectTrip(trip)
              }}
              className="cursor-pointer transition-all hover:opacity-100 hover:stroke-[6px]"
            />
            {trip.waypoints.map((point, idx) => (
              <Marker 
                key={`${trip.id}-pt-${idx}`} 
                position={point} 
                icon={customIcon}
                eventHandlers={{
                  click: () => onSelectTrip(trip)
                }}
              >
                <Popup>
                  <div className="p-1 text-center font-body">
                    <p className="font-bold text-primary-950">{trip.name}</p>
                    <p className="text-xs text-primary-500">Click to explore vehicles</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </React.Fragment>
        ))}
      </MapContainer>
      
      {/* Overlay hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary-950 shadow-lg backdrop-blur-md dark:bg-primary-950/90 dark:text-white">
        Click a route to plan your trip
      </div>
    </div>
  );
}
