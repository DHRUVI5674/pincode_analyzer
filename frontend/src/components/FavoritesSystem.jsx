import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Star, MapPin, Search, Download, Sparkles, Filter, MoreVertical, Archive } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const FavoritesSystem = () => {
  const { darkMode } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const saved = localStorage.getItem('pincodeFavorites');
    if (saved) {
      try { setFavorites(JSON.parse(saved)); } catch (e) { localStorage.removeItem('pincodeFavorites'); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pincodeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = () => {
    if (!selectedPincode) { toast.error('Select target node'); return; }
    if (favorites.some(fav => fav.pincode === selectedPincode.pincode)) {
      toast.error('Node already in Elite Cluster');
      return;
    }
    setFavorites(prev => [{ ...selectedPincode, addedAt: new Date().toISOString(), id: Date.now().toString() }, ...prev]);
    setSelectedPincode(null);
    toast.success('Node encrypted to favorites');
  };

  const filteredFavorites = favorites
    .filter(fav => [fav.pincode, fav.officeName, fav.district, fav.state].some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'name') return a.officeName.localeCompare(b.officeName);
      if (sortBy === 'pincode') return a.pincode.localeCompare(b.pincode);
      return new Date(b.addedAt) - new Date(a.addedAt);
    });

  return (
    <div className={`max-w-6xl mx-auto p-8 rounded-[3rem] border transition-all duration-500 overflow-hidden ${darkMode ? 'bg-[#0b101a] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 text-rose-500 text-xs font-black uppercase tracking-widest mb-4">
                <Star className="w-4 h-4 fill-current" /> Elite Clusters
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Vault <span className="text-rose-500">Access</span></h1>
            <p className="font-medium opacity-50 uppercase tracking-widest text-[10px]">Encrypted storage for high-priority logistics nodes</p>
        </div>
        <div className="flex gap-3">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30 group-focus-within:opacity-100 text-rose-400" />
                <input 
                    type="text" placeholder="Search Vault..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className={`pl-12 pr-4 py-3 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-4 focus:ring-rose-500/10 font-bold text-sm`}
                />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`p-3 rounded-2xl border font-bold text-xs ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <option value="date">Latest</option>
                <option value="name">Alpha</option>
                <option value="pincode">Numerical</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
            <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-6">Ingest Node</h3>
                <div className="space-y-6">
                    <PincodeAutocomplete onSelect={setSelectedPincode} placeholder="Search Hub..." />
                    <button 
                        onClick={addToFavorites}
                        disabled={!selectedPincode}
                        className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${selectedPincode ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20 hover:scale-[1.02]' : 'bg-gray-500/20 opacity-30'}`}
                    >
                        <Heart className="w-5 h-5 fill-current" /> Encrypt to Vault
                    </button>
                    {selectedPincode && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 animate-in fade-in slide-in-from-bottom-2">
                             <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black">{selectedPincode.pincode.slice(0,2)}</div>
                             <div>
                                <div className="font-black text-sm">{selectedPincode.officeName}</div>
                                <div className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">{selectedPincode.district}</div>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-8">
            {filteredFavorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFavorites.map(fav => (
                        <div key={fav.id} className={`group p-6 rounded-[2rem] border transition-all hover:shadow-xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-gray-200 shadow-lg shadow-gray-200/20'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <button onClick={() => setFavorites(prev => prev.filter(f => f.id !== fav.id))} className="p-2 opacity-10 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="font-black text-xl mb-1">{fav.pincode}</div>
                            <div className="font-bold opacity-60 text-sm mb-4 truncate">{fav.officeName}</div>
                            <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{fav.state}</span>
                                <Star className="w-4 h-4 text-rose-400 fill-current" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 border-4 border-dashed border-gray-500/10 rounded-[3rem] p-20">
                    <Archive className="w-24 h-24 mb-6" />
                    <p className="font-black uppercase tracking-[0.6em]">Vault Empty</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesSystem;
