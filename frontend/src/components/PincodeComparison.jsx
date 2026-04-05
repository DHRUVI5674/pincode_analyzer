import React, { useState } from 'react';
import { Columns, ArrowRight, MapPin, Calculator, Info, RotateCcw, Zap, Globe, Navigation, ChevronRight, Scale } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const PincodeComparison = () => {
    const { darkMode } = useTheme();
    const [pincode1, setPincode1] = useState(null);
    const [pincode2, setPincode2] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCompare = async () => {
        if (!pincode1 || !pincode2) {
            toast.error('Select two nodes for parity analysis');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/compare-pincodes?pc1=${pincode1.pincode}&pc2=${pincode2.pincode}`);
            const data = await response.json();
            if (data.success) {
                setComparisonData(data);
                toast.success('Matrix parity complete');
            } else {
                toast.error('Parity check failed');
            }
        } catch (error) {
            toast.error('Node sync error');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setPincode1(null);
        setPincode2(null);
        setComparisonData(null);
    };

    return (
        <div className={`max-w-6xl mx-auto p-4 sm:p-8 rounded-[3rem] transition-all duration-500 overflow-hidden border ${darkMode ? 'bg-[#0b0d14] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-widest mb-4">
                        <Scale className="w-4 h-4" /> Parity Matrix v2.0
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">PIN <span className="text-indigo-500">Comparison</span></h1>
                    <p className="font-medium opacity-50 uppercase tracking-widest text-[10px]">Differential analysis between regional logistics hubs</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleCompare} disabled={loading || !pincode1 || !pincode2} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
                        {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : 'Execute Comparison'}
                    </button>
                    <button onClick={reset} className={`p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Node A */}
                <div className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Hub Alpha
                    </label>
                    <PincodeAutocomplete onSelect={setPincode1} placeholder="Search PIN 1..." />
                    {pincode1 && (
                        <div className="mt-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-2xl font-black mb-1">{pincode1.pincode}</div>
                            <div className="text-sm font-bold opacity-50 uppercase">{pincode1.officeName}</div>
                        </div>
                    )}
                </div>

                {/* Node B */}
                <div className={`p-8 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-6 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Hub Beta
                    </label>
                    <PincodeAutocomplete onSelect={setPincode2} placeholder="Search PIN 2..." />
                    {pincode2 && (
                        <div className="mt-8 p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-2xl font-black mb-1">{pincode2.pincode}</div>
                            <div className="text-sm font-bold opacity-50 uppercase">{pincode2.officeName}</div>
                        </div>
                    )}
                </div>
            </div>

            {comparisonData ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className={`p-10 rounded-[3rem] border flex flex-col items-center justify-center relative overflow-hidden ${darkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ background: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                        <div className="text-center relative z-10">
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Linear Geodesic Offset</div>
                            <div className="text-7xl font-black mb-4 flex items-baseline gap-2">
                                {comparisonData.distance} <span className="text-xl font-bold opacity-50">KM</span>
                            </div>
                            <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'}`}>
                                {comparisonData.summary}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" /> Efficiency
                            </div>
                            <div className="text-xl font-black">{comparisonData.insights?.transportEfficiency || 'Optimized'}</div>
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-500" /> Zoning
                            </div>
                            <div className="text-xl font-black">{comparisonData.insights?.zoningInfo || 'Inter-Regional'}</div>
                        </div>
                        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-indigo-500" /> Boundary
                            </div>
                            <div className="text-xl font-black">{pincode1.state === pincode2.state ? 'Intra-State' : 'Cross-Border'}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`mt-8 flex flex-col md:flex-row gap-8 items-center p-12 rounded-[3rem] border border-dashed ${darkMode ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'} opacity-30`}>
                    <Scale className="w-16 h-16" />
                    <div>
                        <h3 className="text-xl font-black">Matrix Idle</h3>
                        <p className="text-sm font-medium">Select two high-priority nodes to initialize parity analysis.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PincodeComparison;
