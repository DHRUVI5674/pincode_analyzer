import React, { useState, useEffect } from 'react';
import { MapPin, Search, Layers, ZoomIn, ZoomOut, RotateCcw, Map as MapIcon, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit map bounds to markers
function FitBounds({ center, radius }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      const bounds = L.latLng(center[0], center[1]).toBounds(radius * 1000);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [center, radius, map]);
  return null;
}

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
        `http://localhost:5000/api/nearby?lat=${selectedPincode.latitude}&lng=${selectedPincode.longitude}&radius=${searchRadius}`
      );
      const data = await response.json();

      if (data.success) {
        setMapData({
            center: { latitude: selectedPincode.latitude, longitude: selectedPincode.longitude }
        });
        setNearbyPincodes(data.data || []);
        toast.success(`Found ${data.data?.length || 0} nearby PIN codes`);
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

  return (
    <div className={`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 rounded-[2.5rem] transition-all duration-500 ${darkMode ? 'bg-[#0b0d14] text-white border border-white/5' : 'bg-white text-gray-900 shadow-2xl shadow-gray-200/50 border border-gray-100'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest mb-4">
                <MapIcon className="w-4 h-4" /> Interactive Mapping
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
                Geospatial <span className="text-indigo-500">Intelligence</span>
            </h1>
            <p className={`font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Visualize postal distribution and proximity across the nation
            </p>
        </div>
        
        <div className="flex gap-4">
            <button
              onClick={loadMapData}
              disabled={loading || !selectedPincode}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-indigo-600/20 flex items-center gap-3"
            >
              {loading ? (
                <RotateCcw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Analyze Proximity
            </button>
            <button
              onClick={resetMap}
              className={`p-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 border ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Sidebar Controls */}
        <div className="space-y-6">
            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-4">Central PIN Code</label>
                <PincodeAutocomplete
                    onSelect={handlePincodeSelect}
                    placeholder="Search PIN code..."
                />
                {selectedPincode && (
                    <div className={`mt-6 p-4 rounded-2xl border ${darkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-white border-indigo-100 shadow-sm'}`}>
                        <div className="font-bold text-lg mb-1">{selectedPincode.officeName}</div>
                        <div className="text-sm font-medium opacity-60 uppercase">{selectedPincode.district}, {selectedPincode.state}</div>
                    </div>
                )}
            </div>

            <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-500 mb-4">Proximity Range</label>
                <div className="space-y-4">
                    <input 
                        type="range" 
                        min="5" 
                        max="200" 
                        step="5"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-sm font-bold opacity-60">
                        <span>5km</span>
                        <span className="text-indigo-500">{searchRadius}km</span>
                        <span>200km</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
            <div className={`h-[600px] w-full rounded-[2.5rem] overflow-hidden border relative z-0 ${darkMode ? 'border-white/10' : 'border-gray-200 shadow-inner'}`}>
                {selectedPincode && selectedPincode.latitude ? (
                    <MapContainer
                        center={[selectedPincode.latitude, selectedPincode.longitude]}
                        zoom={10}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url={darkMode 
                                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            }
                            attribution='&copy; CARTO / OpenStreetMap'
                        />
                        
                        <Circle 
                            center={[selectedPincode.latitude, selectedPincode.longitude]} 
                            radius={searchRadius * 1000}
                            pathOptions={{ 
                                fillColor: '#6366f1', 
                                fillOpacity: 0.1, 
                                color: '#6366f1', 
                                weight: 1,
                                dashArray: '5, 10'
                            }}
                        />

                        <Marker position={[selectedPincode.latitude, selectedPincode.longitude]}>
                            <Popup className="custom-popup">
                                <div className="p-2 min-w-[200px]">
                                    <div className="font-bold text-lg text-indigo-600 mb-1">{selectedPincode.pincode}</div>
                                    <div className="font-bold mb-2">{selectedPincode.officeName}</div>
                                    <div className="text-xs uppercase font-black opacity-40">Center Hub</div>
                                </div>
                            </Popup>
                        </Marker>

                        {nearbyPincodes.map((pin) => (
                            <Marker 
                                key={pin.pincode} 
                                position={[pin.latitude, pin.longitude]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div class="w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-lg"></div>`,
                                    iconSize: [12, 12],
                                    iconAnchor: [6, 6]
                                })}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <div className="font-bold">{pin.officeName}</div>
                                        <div className="text-sm opacity-60">PIN: {pin.pincode}</div>
                                        <div className="text-sm text-indigo-500 font-bold mt-2">{pin.distance.toFixed(2)} km away</div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        <FitBounds center={[selectedPincode.latitude, selectedPincode.longitude]} radius={searchRadius} />
                    </MapContainer>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <Compass className="w-12 h-12 text-indigo-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No Location Selected</h3>
                        <p className="max-w-md font-medium opacity-50">Select a PIN code from the sidebar to visualize its position and analyze nearby distribution hubs.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {nearbyPincodes.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Proximity <span className="text-indigo-500">Insights</span></h2>
                <span className={`px-4 py-1.5 rounded-full font-bold text-sm ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{nearbyPincodes.length} hubs found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyPincodes.slice(0, 12).map((pin) => (
                    <div key={pin.pincode} className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="text-lg font-black text-indigo-500">{pin.distance.toFixed(1)}km</div>
                        </div>
                        <div className="font-bold text-lg mb-1 truncate">{pin.officeName}</div>
                        <div className="text-sm font-bold opacity-40 uppercase tracking-widest">{pin.pincode}</div>
                    </div>
                ))}
            </div>
          </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: transparent !important; }
        .leaflet-bar { border: none !important; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important; }
        .leaflet-bar a { background-color: ${darkMode ? '#1f2937' : '#fff'} !important; color: ${darkMode ? '#fff' : '#000'} !important; border-bottom: 1px solid ${darkMode ? '#374151' : '#f3f4f6'} !important; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 1.5rem !important; padding: 0.5rem !important; }
      `}} />
    </div>
  );
};

export default MapIntegration;
