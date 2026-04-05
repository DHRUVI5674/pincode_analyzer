import React, { useState } from 'react';
import { Search, MapPin, Navigation, ScanLine, RotateCcw, Zap, Globe, ChevronRight } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NearbySearch = () => {
    const { darkMode } = useTheme();
    const [selectedPincode, setSelectedPincode] = useState(null);
    const [radius, setRadius] = useState(10);
    const [nearbyResults, setNearbyResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!selectedPincode) {
            toast.error('Select a central node for proximity radar');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/nearby?lat=${selectedPincode.latitude}&lng=${selectedPincode.longitude}&radius=${radius}`);
            const data = await response.json();
            if (data.success) {
                setNearbyResults(data.data);
                toast.success(`Nodes discovered: ${data.data.length}`);
            } else {
                toast.error('Radar sweep failed');
            }
        } catch (error) {
            toast.error('Proximity system offline');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setSelectedPincode(null);
        setNearbyResults([]);
        setRadius(10);
    };

    return (
        <div className={`max-w-6xl mx-auto p-4 sm:p-10 rounded-[3.5rem] transition-all duration-700 overflow-hidden border ${darkMode ? 'bg-[#080b12] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <ScanLine className="w-4 h-4" /> Proximity Radar v3.2
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Nearby <span className="text-emerald-500">Discovery</span></h1>
                    <p className="font-bold opacity-30 uppercase tracking-[0.3em] text-[10px]">Omni-directional logistics node mapping</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleSearch} disabled={loading || !selectedPincode} className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black transition-all hover:scale-105 shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-30">
                        {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : 'Start Sweep'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Search Settings */}
                <div className="lg:col-span-4 space-y-8">
                    <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-8 flex items-center gap-2">
                             <Zap className="w-4 h-4" /> Radar Central
                        </label>
                        <PincodeAutocomplete onSelect={setSelectedPincode} placeholder="Search Focal PIN..." />
                        
                        <div className="mt-12">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Scan Distance</span>
                                <span className="text-lg font-black text-emerald-500">{radius} KM</span>
                            </div>
                            <input 
                                type="range" min="1" max="100" value={radius} onChange={e => setRadius(parseInt(e.target.value))}
                                className="w-full h-2 bg-emerald-500/20 rounded-full appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>

                    {selectedPincode && (
                        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20 shadow-xl shadow-indigo-500/20' : 'bg-indigo-50 border-indigo-200'} animate-in fade-in slide-in-from-left-4`}>
                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Central Hub Analysis</h4>
                            <div className="text-3xl font-black mb-1">{selectedPincode.pincode}</div>
                            <div className="text-xs font-bold opacity-60 uppercase">{selectedPincode.officeName}</div>
                            <div className="mt-6 flex gap-2">
                                <div className="px-3 py-1 rounded-full bg-black/10 text-[8px] font-black uppercase">{selectedPincode.district}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-8">
                    {nearbyResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {nearbyResults.map((node, i) => (
                                <div key={i} className={`p-6 rounded-[2rem] border transition-all hover:translate-x-1 ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                            <Navigation className="w-5 h-5" />
                                        </div>
                                        <div className="text-xl font-black text-emerald-500">+{node.distance} <span className="text-[10px] opacity-40">KM</span></div>
                                    </div>
                                    <div className="font-bold text-lg mb-1 truncate">{node.officeName}</div>
                                    <div className="text-xs font-black opacity-30 uppercase tracking-widest">{node.pincode}</div>
                                    <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all cursor-default">Target Node Sync Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] rounded-[3.5rem] border-4 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center p-12 text-center opacity-10">
                            <ScanLine className="w-24 h-24 mb-6" />
                            <p className="text-2xl font-black uppercase tracking-[1em]">Scanning Void</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbySearch;
