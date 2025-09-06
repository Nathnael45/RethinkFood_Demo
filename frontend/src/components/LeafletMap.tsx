import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix for default markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LeafletMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Trigger map resize after fullscreen toggle
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
  };

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      // Initialize the map and set its view to NYC center (between Brooklyn and Queens) with zoom level 11
      const map = L.map(mapContainer.current).setView([40.6892, -73.9442], 11);
      mapRef.current = map;

      // Define NYC bounds (all 5 boroughs)
      const nycBounds = L.latLngBounds(
        [40.4774, -74.2591], // Southwest corner (Staten Island)
        [40.9176, -73.7004]  // Northeast corner (Bronx)
      );

      // Set max bounds to lock the map to NYC area
      map.setMaxBounds(nycBounds);
      map.setMinZoom(10);
      map.setMaxZoom(18);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Food places with random locations and meal numbers (70-1000)
      const foodPlaces = [
        { name: "Food Place 1", coords: [40.7589, -73.9851] as [number, number], meals: 342 }, // Times Square area
        { name: "Food Place 2", coords: [40.6892, -73.9442] as [number, number], meals: 789 }, // Center Brooklyn/Queens
        { name: "Food Place 3", coords: [40.8176, -73.9482] as [number, number], meals: 156 }, // Bronx
        { name: "Food Place 4", coords: [40.7505, -73.8370] as [number, number], meals: 923 }, // Flushing, Queens
        { name: "Food Place 5", coords: [40.6602, -73.9690] as [number, number], meals: 234 }, // Prospect Park, Brooklyn
        { name: "Food Place 6", coords: [40.5795, -74.1502] as [number, number], meals: 567 }, // Staten Island
        { name: "Food Place 7", coords: [40.7282, -73.7949] as [number, number], meals: 678 }, // Jamaica, Queens
        { name: "Food Place 8", coords: [40.6439, -74.0806] as [number, number], meals: 445 }  // Bay Ridge, Brooklyn
      ];

      // Add markers for each food place
      foodPlaces.forEach((place, index) => {
        const marker = L.marker(place.coords).addTo(map);
        marker.bindPopup(
          `<b>${place.name}</b><br>` +
          `<strong>Meal Numbers:</strong> ${place.meals}<br>` +
          `Location: ${place.coords[0].toFixed(4)}, ${place.coords[1].toFixed(4)}`
        );
        
        // Add click event to zoom into the marker
        marker.on('click', function(e) {
          // Zoom to level 15 and center on the marker
          map.setView(e.latlng, 15, {
            animate: true,
            duration: 0.8 // Animation duration in seconds
          });
        });
        
        // Open the first marker popup by default
        if (index === 0) {
          marker.openPopup();
        }
      });

      // Add popup for standalone popup in the Bronx
      L.popup()
        .setLatLng([40.8448, -73.8648])
        .setContent("Welcome to the Bronx!")
        .openOn(map);

      // Add click event handler
      const onMapClick = (e: L.LeafletMouseEvent) => {
        L.popup()
          .setLatLng(e.latlng)
          .setContent("You clicked the map at " + e.latlng.toString())
          .openOn(map);
      };

      map.on('click', onMapClick);

      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h2>NYC Food Distribution Network - 8 Active Locations</h2>
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#007bff'}
        >
          {isFullscreen ? '📉 Exit Fullscreen' : '📈 Fullscreen'}
        </button>
      </div>
      
      <div 
        ref={mapContainer} 
        style={{ 
          height: isFullscreen ? '100vh' : '500px', 
          width: isFullscreen ? '100vw' : '100%',
          border: '2px solid #333',
          borderRadius: '8px',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 9999 : 'auto',
          backgroundColor: 'white'
        }} 
      />
      
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 10000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c82333'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc3545'}
        >
          ✕ Exit Fullscreen
        </button>
      )}
      
      {!isFullscreen && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>NYC Food Distribution Network:</h3>
          <ul>
            <li>�️ Food Place 1 - Times Square (342 meals)</li>
            <li>�️ Food Place 2 - Brooklyn/Queens Center (789 meals)</li>
            <li>🍽️ Food Place 3 - Bronx (156 meals)</li>
            <li>�️ Food Place 4 - Flushing, Queens (923 meals)</li>
            <li>�️ Food Place 5 - Prospect Park, Brooklyn (234 meals)</li>
            <li>🍽️ Food Place 6 - Staten Island (567 meals)</li>
            <li>🍽️ Food Place 7 - Jamaica, Queens (678 meals)</li>
            <li>🍽️ Food Place 8 - Bay Ridge, Brooklyn (445 meals)</li>
          </ul>
          <p><strong>Distribution Stats:</strong></p>
          <ul>
            <li>Total Food Places: 8 locations</li>
            <li>Total Meals Available: 4,134 meals</li>
            <li>Coverage: All 5 NYC boroughs</li>
            <li>Range: 156 - 923 meals per location</li>
            <li>🔒 Map locked to NYC boundaries</li>
            <li>📈 Fullscreen mode available</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
