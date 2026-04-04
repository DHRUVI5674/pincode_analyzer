import React, { useState, useEffect } from 'react';
import { MapPin, Search, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const MapIntegration = () => {
  const { darkMode } = useTheme();
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState('single'); // 'single' or 'multiple'
  const [nearbyPincodes, setNearbyPincodes] = useState([]);
  const [searchRadius, setSearchRadius] = useState(50); // km

  const handlePincodeSelect = (pincodeData) => {
    setSelectedPincode(pincodeData);
  };

  const loadMapData = async () => {
    if (!selectedPincode) {
      toast.error('Please select a PIN code first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/map-data?pincode=${selectedPincode.pincode}&radius=${searchRadius}`
      );
      const data = await response.json();

      if (data.success) {
        setMapData(data);
        setNearbyPincodes(data.nearbyPincodes || []);
        toast.success(`Loaded ${data.nearbyPincodes?.length || 0} nearby PIN codes`);
      } else {
        toast.error('Failed to load map data');
      }
    } catch (error) {
      console.error('Map data error:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const resetMap = () => {
    setSelectedPincode(null);
    setMapData(null);
    setNearbyPincodes([]);
  };

  // Simple map visualization (since we don't have actual map library)
  const renderSimpleMap = () => {
    if (!mapData) return null;

    const centerLat = mapData.center.latitude;
    const centerLng = mapData.center.longitude;

    return (
      <div className="relative bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-700">
        {/* Map Title */}
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            📍 {selectedPincode.officeName}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {selectedPincode.pincode} • {selectedPincode.district}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button className="bg-white dark:bg-gray-800 p-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700">
            <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="bg-white dark:bg-gray-800 p-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700">
            <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="bg-white dark:bg-gray-800 p-2 rounded shadow hover:bg-gray-50 dark:hover:bg-gray-700">
            <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 p-2 rounded shadow">
          <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Legend</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Selected PIN</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Nearby PINs</span>
          </div>
        </div>

        {/* Simple coordinate display */}
        <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow text-xs">
          <div className="text-gray-600 dark:text-gray-400">
            Lat: {centerLat.toFixed(4)}, Lng: {centerLng.toFixed(4)}
          </div>
        </div>

        {/* Central PIN marker */}
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            {/* Central marker */}
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="w-0.5 h-8 bg-red-500"></div>
              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded shadow text-xs font-medium text-gray-900 dark:text-white">
                {selectedPincode.pincode}
              </div>
            </div>

            {/* Nearby markers (simplified) */}
            {nearbyPincodes.slice(0, 8).map((pin, index) => {
              const angle = (index / 8) * 2 * Math.PI;
              const radius = 80 + (index * 10); // pixels
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={pin.pincode}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${x}px - 8px)`,
                    top: `calc(50% + ${y}px - 8px)`,
                  }}
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
                  <div className="w-0.5 h-4 bg-blue-500 opacity-50"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Radius indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded shadow text-xs text-gray-600 dark:text-gray-400">
          Search Radius: {searchRadius} km
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        🗺️ Map Integration
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Visualize PIN codes on an interactive map with nearby locations
      </p>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* PIN Code Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📍 Select PIN Code
          </label>
          <PincodeAutocomplete
            onSelect={handlePincodeSelect}
            placeholder="Enter PIN code to map..."
          />
          {selectedPincode && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
              <div className="font-medium text-blue-800 dark:text-blue-200">
                {selectedPincode.officeName}
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                {selectedPincode.district}, {selectedPincode.state}
              </div>
            </div>
          )}
        </div>

        {/* Search Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔍 Search Radius (km)
          </label>
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
            <option value={200}>200 km</option>
          </select>
        </div>

        {/* View Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            👁️ View Mode
          </label>
          <select
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="single">Single PIN Code</option>
            <option value="multiple">Multiple PIN Codes</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={loadMapData}
          disabled={loading || !selectedPincode}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading Map...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Load Map Data
            </>
          )}
        </button>

        <button
          onClick={resetMap}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Reset Map
        </button>
      </div>

      {/* Map Display */}
      {renderSimpleMap()}

      {/* Nearby PIN Codes List */}
      {nearbyPincodes.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📍 Nearby PIN Codes ({nearbyPincodes.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyPincodes.map((pin) => (
              <div
                key={pin.pincode}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {pin.officeName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      PIN: {pin.pincode}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {pin.district}, {pin.state}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {pin.distance} km
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!mapData && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 How to use:</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• Select a PIN code to center the map on</li>
            <li>• Choose search radius to find nearby PIN codes</li>
            <li>• Click "Load Map Data" to display the map and nearby locations</li>
            <li>• Red marker shows selected PIN code, blue markers show nearby PIN codes</li>
            <li>• Use view mode to switch between single and multiple PIN code display</li>
          </ul>
        </div>
      )}

      {/* Map Statistics */}
      {mapData && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📊 Map Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Center PIN</div>
              <div className="text-blue-600 dark:text-blue-400">{selectedPincode.pincode}</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Nearby PINs</div>
              <div className="text-blue-600 dark:text-blue-400">{nearbyPincodes.length}</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Search Radius</div>
              <div className="text-blue-600 dark:text-blue-400">{searchRadius} km</div>
            </div>
            <div>
              <div className="font-medium text-blue-800 dark:text-blue-300">Coordinates</div>
              <div className="text-blue-600 dark:text-blue-400 text-xs">
                {mapData.center.latitude.toFixed(4)}, {mapData.center.longitude.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapIntegration;