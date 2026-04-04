import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import toast from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit map bounds to markers
function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [markers, map]);

  return null;
}

const API_URL = 'http://localhost:5000/api';

const MapVisualization = () => {
  const [pincodeData, setPincodeData] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Center of India

  useEffect(() => {
    fetchAllPincodes();
  }, []);

  const fetchAllPincodes = async () => {
    try {
      setLoading(true);
      // Fetch all PIN codes (you might want to add pagination for large datasets)
      const response = await axios.get(`${API_URL}/pincodes?limit=1000`);
      setPincodeData(response.data.pincodes || []);
    } catch (error) {
      toast.error('Failed to load PIN code data for map');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter out entries without coordinates
  const validMarkers = pincodeData.filter(pincode =>
    pincode.latitude && pincode.longitude &&
    !isNaN(pincode.latitude) && !isNaN(pincode.longitude)
  );

  const handleMarkerClick = (pincode) => {
    setSelectedPincode(pincode);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          PIN Code Map Visualization
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Interactive map showing {validMarkers.length} PIN code locations across India
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="h-96 w-full rounded-lg overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {validMarkers.map((pincode, index) => (
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
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {pincode.latitude.toFixed(4)}, Lng: {pincode.longitude.toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            <FitBounds markers={validMarkers} />
          </MapContainer>
        </div>

        {selectedPincode && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
                <span className="font-medium">Division:</span> {selectedPincode.divisionName}
              </div>
              <div>
                <span className="font-medium">Region:</span> {selectedPincode.regionName}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Instructions:</strong> Click on any marker to view PIN code details.
            The map automatically adjusts to show all available locations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;