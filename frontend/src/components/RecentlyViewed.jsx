import React, { useState, useEffect } from 'react';
import { Clock, Eye, Trash2, History, Search, Download, ArrowUpRight, Calendar, Zap, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const RecentlyViewed = () => {
  const { darkMode } = useTheme();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewedPincodes');
    if (saved) {
      try { setRecentlyViewed(JSON.parse(saved)); } catch (e) { localStorage.removeItem('recentlyViewedPincodes'); }
    }
  }, []);

  const clearAll = () => {
    if (window.confirm('Wipe timeline history?')) {
      setRecentlyViewed([]);
      localStorage.removeItem('recentlyViewedPincodes');
      toast.success('Timeline reset');
    }
  };

  const filtered = recentlyViewed.filter(item => 
    [item.pincode, item.officeName, item.district].some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 sm:p-10 rounded-[3.5rem] border transition-all duration-700 ${darkMode ? 'bg-[#080a0f] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Clock className="w-4 h-4" /> Temporal Analytics
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-3">Activity <span className="text-indigo-500">Timeline</span></h1>
            <p className="font-bold opacity-40 uppercase tracking-widest text-xs">Sequential record of geospatial node interactions</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 text-indigo-400" />
                <input 
                    type="text" placeholder="Filter Timeline..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-[1.5rem] border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold`}
                />
            </div>
            <button onClick={clearAll} className={`p-4 rounded-[1.5rem] border hover:bg-rose-500/10 hover:text-rose-500 transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <Trash2 className="w-6 h-6" />
            </button>
        </div>
      </div>

      <div className="relative">
        {/* Timeline connector */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 via-indigo-500/20 to-transparent rounded-full hidden sm:block" />

        <div className="space-y-10">
            {filtered.length > 0 ? filtered.map((item, i) => (
                <div key={i} className="relative pl-0 sm:pl-16 group">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-2 w-5 h-5 rounded-full border-4 border-[#080a0f] bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] hidden sm:block transition-transform group-hover:scale-125" />
                    
                    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-2 ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20' : 'bg-white border-gray-100 hover:border-gray-200 shadow-xl shadow-gray-200/20'}`}>
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                                <span className="text-xs font-black opacity-60 leading-none mb-1 text-center truncate px-1 uppercase">{item.state.slice(0,3)}</span>
                                <span className="text-xl font-black leading-none">{item.pincode.slice(-3)}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-2xl font-black tracking-tight">{item.pincode}</h3>
                                    <Zap className="w-4 h-4 text-amber-400 fill-current" />
                                </div>
                                <p className="font-bold opacity-60 uppercase text-[10px] tracking-widest">{item.officeName} • {item.district}</p>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                <Calendar className="w-3 h-3" /> {getTimeAgo(item.viewedAt)}
                            </div>
                            <button className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">
                                <ArrowUpRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                <div className="py-20 text-center opacity-10">
                    <History className="w-32 h-32 mx-auto mb-6" />
                    <p className="text-2xl font-black uppercase tracking-[1em]">Void</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;
