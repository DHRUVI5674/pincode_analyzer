import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Search, Loader, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds
function FitBounds({ markers, center, radius }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));
      // Include center point in bounds
      bounds.extend([center.lat, center.lng]);
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [markers, center, radius, map]);

  return null;
}

const API_URL = 'http://localhost:5000/api';

const NearbySearch = () => {
  const { darkMode } = useTheme();
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyPincodes, setNearbyPincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [radius, setRadius] = useState(10);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        toast.success('Location found! Click search to find nearby PIN codes.');
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please check permissions.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Search for nearby PIN codes
  const searchNearbyPincodes = async () => {
    if (!userLocation) {
      toast.error('Please get your location first');
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${API_URL}/nearby`, {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: radius
        }
      });

      setNearbyPincodes(response.data.data);
      toast.success(`Found ${response.data.count} PIN codes within ${radius}km`);
    } catch (error) {
      toast.error('Failed to search nearby PIN codes');
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleMarkerClick = (pincode) => {
    setSelectedPincode(pincode);
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Nearby PIN Code Search
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Find PIN codes near your current location
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span>{loading ? 'Getting Location...' : 'Get My Location'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Radius:
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>

          <button
            onClick={searchNearbyPincodes}
            disabled={!userLocation || searching}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {searching ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{searching ? 'Searching...' : 'Search Nearby'}</span>
          </button>

          {userLocation && (
            <button
              onClick={() => setNearbyPincodes([])}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Results</span>
            </button>
          )}
        </div>

        {userLocation && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>
              <strong>Your Location:</strong> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="h-96 w-full rounded-lg overflow-hidden mb-4">
          <MapContainer
            center={mapCenter}
            zoom={userLocation ? 13 : 5}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* User location marker */}
            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={userLocationIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg text-red-600">Your Location</h3>
                    <p className="text-sm">
                      Lat: {userLocation.lat.toFixed(6)}<br />
                      Lng: {userLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Search radius circle */}
            {userLocation && nearbyPincodes.length > 0 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radius * 1000} // Convert km to meters
                pathOptions={{
                  color: 'blue',
                  fillColor: 'blue',
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            )}

            {/* Nearby PIN code markers */}
            {nearbyPincodes.map((pincode, index) => (
              <Marker
                key={`${pincode.pincode}-${index}`}
                position={[pincode.latitude, pincode.longitude]}
                eventHandlers={{
                  click: () => handleMarkerClick(pincode),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-lg">{pincode.pincode}</h3>
                    <p className="text-sm text-gray-600">{pincode.officeName}</p>
                    <p className="text-sm">{pincode.district}, {pincode.state}</p>
                    <p className="text-xs text-green-600 font-medium">
                      Distance: {pincode.distance} km
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            <FitBounds
              markers={nearbyPincodes}
              center={userLocation}
              radius={radius}
            />
          </MapContainer>
        </div>

        {selectedPincode && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2">
              Selected PIN Code: {selectedPincode.pincode}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Office:</span> {selectedPincode.officeName}
              </div>
              <div>
                <span className="font-medium">Type:</span> {selectedPincode.officeType}
              </div>
              <div>
                <span className="font-medium">District:</span> {selectedPincode.district}
              </div>
              <div>
                <span className="font-medium">State:</span> {selectedPincode.state}
              </div>
              <div>
                <span className="font-medium">Distance:</span> {selectedPincode.distance} km
              </div>
              <div>
                <span className="font-medium">Coordinates:</span> {selectedPincode.latitude.toFixed(4)}, {selectedPincode.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        )}

        {nearbyPincodes.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Nearby PIN Codes ({nearbyPincodes.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {nearbyPincodes.map((pincode, index) => (
                <div
                  key={`${pincode.pincode}-${index}`}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => handleMarkerClick(pincode)}
                >
                  <div className="font-bold text-blue-600">{pincode.pincode}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{pincode.officeName}</div>
                  <div className="text-xs text-gray-500">{pincode.district}, {pincode.state}</div>
                  <div className="text-xs text-green-600 font-medium">{pincode.distance} km away</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>How to use:</strong> 1) Click "Get My Location" to detect your position. 2) Select search radius. 3) Click "Search Nearby" to find PIN codes in your area.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NearbySearch;