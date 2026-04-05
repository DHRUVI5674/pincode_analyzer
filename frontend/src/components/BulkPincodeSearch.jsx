import React, { useState } from 'react';
import { Search, Download, Copy, Check, Layers, Zap, FileSpreadsheet, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BulkPincodeSearch = () => {
  const { darkMode } = useTheme();
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  const parsePincodes = (text) => {
    const pincodes = text
      .split(/[,\n\s;]+/)
      .map(pin => pin.trim())
      .filter(pin => pin.length > 0 && /^\d{6}$/.test(pin));
    return [...new Set(pincodes)];
  };

  const handleSearch = async () => {
    const pincodes = parsePincodes(inputText);
    if (pincodes.length === 0) {
      toast.error('Invalid input matrix');
      return;
    }
    if (pincodes.length > 50) {
      toast.error('Queue limit: 50 nodes');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/bulk-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincodes }),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
        toast.success(`Matrix sync: ${data.totalFound}/${data.totalRequested} nodes`);
      }
    } catch (error) {
      toast.error('Sync failure');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const foundResults = results.filter(r => r.found);
    if (foundResults.length === 0) return;
    const csvData = [
      ['PIN Code', 'Post Office', 'Type', 'Status', 'Taluk', 'District', 'State'],
      ...foundResults.map(r => [r.pincode, r.data.officeName, r.data.officeType, r.data.deliveryStatus, r.data.taluk, r.data.district, r.data.state])
    ];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_nodes_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className={`max-w-6xl mx-auto p-8 rounded-[2.5rem] border transition-all duration-500 ${darkMode ? 'bg-[#0b0d14] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers className="w-4 h-4" /> Bulk Sync Engine v2.0
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Node <span className="text-emerald-500">Discovery</span></h1>
          <p className="font-medium opacity-50">Ingest multiple pincodes for parallel data retrieval and csv export</p>
        </div>
        <div className="flex gap-4">
            {results.length > 0 && (
                <button onClick={exportToCSV} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                    <FileSpreadsheet className="w-5 h-5" /> Export Matrix
                </button>
            )}
            <button onClick={() => {setInputText(''); setResults([]);}} className={`p-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <Trash2 className="w-5 h-5 opacity-50" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input area */}
        <div className="lg:col-span-4 space-y-6">
            <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className="block text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">Input Matrix</label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="110001, 400001, 560001..."
                    className={`w-full h-64 p-4 rounded-2xl border-none focus:ring-0 resize-none font-mono text-sm ${darkMode ? 'bg-black/20' : 'bg-white'}`}
                />
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs font-bold opacity-40">{parsePincodes(inputText).length} Nodes Detected</span>
                    <button onClick={handleSearch} disabled={loading || !inputText} className="bg-emerald-500 p-3 rounded-xl text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-30">
                        {loading ? <Zap className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>

        {/* Results area */}
        <div className="lg:col-span-8 flex flex-col min-h-[400px]">
            {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full content-start">
                    {results.map((r, i) => (
                        <div key={i} className={`p-5 rounded-2xl border transition-all ${r.found ? (darkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100') : (darkMode ? 'bg-rose-500/5 border-rose-500/20 opacity-50' : 'bg-rose-50 border-rose-100')}`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-2xl font-black ${r.found ? 'text-emerald-500' : 'text-rose-500'}`}>{r.pincode}</span>
                                {r.found && <Check className="w-4 h-4 text-emerald-500" />}
                            </div>
                            {r.found ? (
                                <div className="space-y-1">
                                    <div className="font-bold truncate">{r.data.officeName}</div>
                                    <div className="text-[10px] font-black uppercase opacity-40 tracking-wider font-mono">{r.data.district}, {r.data.state}</div>
                                </div>
                            ) : (
                                <div className="text-[10px] font-black uppercase opacity-40 tracking-wider">Node not indexed</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-gray-500/20 rounded-[2.5rem]">
                    <Layers className="w-16 h-16 mb-4" />
                    <p className="font-black uppercase tracking-[0.4em]">Awaiting Ingestion</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BulkPincodeSearch;
