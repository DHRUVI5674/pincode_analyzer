import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Navigation, 
  Route, 
  Locate, 
  Search,
  Calculator,
  RotateCcw,
  ShieldCheck,
  Info
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const DeliveryTimeEstimator = () => {
  const { darkMode } = useTheme();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEstimate = async () => {
    if (source.length !== 6 || destination.length !== 6) {
      toast.error('Enter valid 6-digit PIN codes');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/delivery-estimate`, {
        params: { source, destination }
      });
      setResult(response.data);
      toast.success('Route projection synchronized');
    } catch (error) {
      toast.error('Simulation failed: Geospatial data mismatch');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSource('');
    setDestination('');
    setResult(null);
  };

  return (
    <div className={`max-w-6xl mx-auto space-y-12 pb-24 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      
      {/* Header Section (IMAGE 2 MATCH) */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pt-12">
        <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#1c1f26] border border-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-[#6366f1]">
                <Truck className="w-4 h-4" /> LOGISTICS ENGINE V2.0
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                Delivery <span className="text-[#6366f1]">Estimator</span>
            </h1>
            <p className="text-lg md:text-xl font-bold opacity-30 leading-relaxed max-w-xl">
                Predict intra-state and national shipping times with high-precision routing
            </p>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={handleEstimate}
                disabled={loading || !source || !destination}
                className="px-10 py-5 bg-[#4f46e5]/20 border border-[#4f46e5]/30 text-white rounded-3xl font-black text-sm tracking-widest hover:bg-[#4f46e5]/40 transition-all flex items-center gap-4 group disabled:opacity-50"
            >
                {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5 text-[#6366f1]" />}
                GENERATE ROUTE
            </button>
            <button 
                onClick={handleReset}
                className="px-8 py-5 bg-[#1c1f26] border border-white/5 text-white/50 rounded-2xl font-black text-xs tracking-widest hover:text-white transition-all active:scale-95"
            >
                RESET
            </button>
        </div>
      </div>

      {/* Input Grid (IMAGE 2 MATCH) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Origin Point */}
          <div className="glass-card p-12 border-white/5 relative overflow-hidden group">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px]" />
              <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <MapPin className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                      <h3 className="text-xs font-black opacity-30 tracking-[0.4em] uppercase">ORIGIN POINT</h3>
                  </div>
              </div>
              <div className="relative group/input">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                  <input 
                    type="text" value={source} onChange={(e) => setSource(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-white border-2 border-white/5 rounded-3xl pl-16 pr-8 py-6 text-black font-black text-2xl outline-none focus:border-emerald-500/30 transition-all placeholder:opacity-10"
                    placeholder="176323"
                  />
              </div>
          </div>

          {/* Destination Point */}
          <div className="glass-card p-12 border-white/5 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/5 rounded-full blur-[80px]" />
              <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                      <ShieldCheck className="w-8 h-8 text-rose-500" />
                  </div>
                  <div>
                      <h3 className="text-xs font-black opacity-30 tracking-[0.4em] uppercase">DESTINATION POINT</h3>
                  </div>
              </div>
              <div className="relative group/input">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 opacity-20 group-focus-within/input:opacity-100 transition-opacity" />
                  <input 
                    type="text" value={destination} onChange={(e) => setDestination(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-white border-2 border-white/5 rounded-3xl pl-16 pr-8 py-6 text-black font-black text-2xl outline-none focus:border-rose-500/30 transition-all placeholder:opacity-10"
                    placeholder="176325"
                  />
              </div>
          </div>
      </div>

      {/* Result Metrics Overlay (Dynamic) */}
      {result && (
        <div className="glass-card p-12 animate-fadeIn border-[#4f46e5]/20 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <p className="text-[10px] font-black opacity-30 tracking-[0.4em]">HAUL_DISTANCE</p>
                    <div className="text-5xl font-black tracking-tighter">{result.distance?.toFixed(2)} <span className="text-lg opacity-40">KM</span></div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black opacity-30 tracking-[0.4em]">EST_ARRIVAL</p>
                    <div className="text-5xl font-black tracking-tighter text-[#6366f1]">{result.deliveryEstimate?.estimatedDays} <span className="text-lg opacity-40">DAYS</span></div>
                </div>
                <div className="space-y-4">
                    <p className="text-[10px] font-black opacity-30 tracking-[0.4em]">SERVICE_TYPE</p>
                    <div className="text-2xl font-black tracking-widest">{result.deliveryEstimate?.serviceType?.toUpperCase()}</div>
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ROUTE_OPTIMIZED
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Footer Info (IMAGE 2 MATCH) */}
      <div className="glass-card p-12 md:p-16 border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 mt-12 bg-gradient-to-r from-transparent to-white/[0.02]">
          <div className="flex items-center gap-8 max-w-2xl">
              <div className="w-24 h-24 rounded-4xl bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-10 h-10 text-white" />
              </div>
              <div>
                  <h3 className="text-2xl font-black tracking-tighter mb-4">How it works?</h3>
                  <p className="text-sm font-bold opacity-30 leading-relaxed uppercase tracking-[0.1em]">
                    Our engine calculates the geodesic distance between source and destination centroids, analyzes state boundaries, and applies real-world postal logistics factors to generate your estimate.
                  </p>
              </div>
          </div>

          <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                  {[1, 2, 3].map((n) => (
                      <div key={n} className="w-16 h-16 rounded-full bg-[#4f46e5] border-4 border-[#0d0f14] flex items-center justify-center font-black text-[10px] shadow-xl">
                          HUB
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default DeliveryTimeEstimator;
