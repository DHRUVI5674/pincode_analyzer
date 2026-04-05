import React, { useState, useRef } from 'react';
import { Printer, Download, FileText, Settings, Eye, Package, Sparkles, QrCode, Map as MapIcon, ChevronRight } from 'lucide-react';
import PincodeAutocomplete from './PincodeAutocomplete';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

import { API_BASE_URL as API_URL } from '../services/api';

const PrintLabel = () => {
  const { darkMode } = useTheme();
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [labelData, setLabelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labelSettings, setLabelSettings] = useState({
    size: 'standard', // 'small', 'standard', 'large'
    includeBarcode: true,
    includeMap: true,
    copies: 1,
    format: 'detailed' // 'address', 'compact', 'detailed'
  });

  const generateLabel = async () => {
    if (!selectedPincode) {
      toast.error('Select target node');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/print-label/${selectedPincode.pincode}`);
      const data = await response.json();
      if (data.success) {
        setLabelData(data.labelData);
        toast.success('Label manifest generated');
      }
    } catch (error) {
      toast.error('Dispatch system error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const labelHTML = document.getElementById('label-content').innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Dispatch Label - ${selectedPincode.pincode}</title>
          <style>
            body { font-family: 'Inter', sans-serif; background: white; margin: 0; padding: 20px; }
            .label-box { border: 2px solid black; padding: 20px; width: 400px; margin-bottom: 20px; }
            .barcode { font-family: 'Courier', monospace; font-size: 20px; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          ${labelHTML}
          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Finalize Print</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`max-w-6xl mx-auto p-4 sm:p-8 rounded-[3rem] transition-all duration-500 border overflow-hidden ${darkMode ? 'bg-[#0b0d14] border-white/5 text-white' : 'bg-white border-gray-100 text-gray-900 shadow-2xl'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-widest mb-4">
                <Printer className="w-4 h-4" /> Dispatch Manifest v4.0
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Label <span className="text-indigo-500">Generator</span></h1>
            <p className="font-medium opacity-50 uppercase tracking-widest text-[10px]">Professional logistics label synthesis</p>
        </div>
        <div className="flex gap-4">
            {labelData && (
                <button onClick={handlePrint} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-xl shadow-indigo-600/20 flex items-center gap-3">
                    <Printer className="w-5 h-5" /> Execute Print
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Configuration */}
        <div className="lg:col-span-5 space-y-8">
            <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Config Matrix
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase opacity-40 mb-3 ml-1">Target Hub</label>
                        <PincodeAutocomplete onSelect={setSelectedPincode} placeholder="Enter Hub Pincode..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase opacity-40 mb-2">Label Scale</label>
                            <select value={labelSettings.size} onChange={e => setLabelSettings({...labelSettings, size: e.target.value})} className={`w-full p-4 rounded-2xl border ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200'} font-bold focus:ring-2 focus:ring-indigo-500 outline-none`}>
                                <option value="small">Small (3x2)</option>
                                <option value="standard">Standard (4x2.5)</option>
                                <option value="large">Industrial (6x4)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase opacity-40 mb-2">Volume</label>
                            <input type="number" min="1" max="100" value={labelSettings.copies} onChange={e => setLabelSettings({...labelSettings, copies: parseInt(e.target.value)})} className={`w-full p-4 rounded-2xl border ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200'} font-bold outline-none`} />
                        </div>
                    </div>

                    <button 
                        onClick={generateLabel}
                        disabled={loading || !selectedPincode}
                        className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${selectedPincode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]' : 'bg-gray-500/20 opacity-50'}`}
                    >
                        {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                        Generate Manifest
                    </button>
                </div>
            </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-7">
            <div className={`p-8 rounded-[3rem] border min-h-[400px] flex flex-col items-center justify-center relative perspective-1000 ${darkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200 shadow-inner'}`}>
                <div className="absolute top-6 left-8 text-xs font-black uppercase opacity-20 tracking-widest">3D Dispatch Preview</div>
                
                {labelData ? (
                    <div id="label-content" className={`bg-white text-black p-10 border-4 border-black shadow-2xl transition-all duration-700 hover:rotate-2 hover:scale-105 cursor-default ${labelSettings.size === 'small' ? 'w-64 h-40' : labelSettings.size === 'large' ? 'w-96 h-64' : 'w-80 h-52'}`}>
                        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                            <div>
                                <h4 className="text-3xl font-black leading-none">{labelData.pincode}</h4>
                                <div className="text-[8px] font-black uppercase tracking-tighter mt-1">{labelData.officeType} • {labelData.deliveryStatus}</div>
                            </div>
                            <QrCode className="w-12 h-12 stroke-[2.5px]" />
                        </div>
                        <div className="space-y-1">
                            <div className="font-black text-sm uppercase">{labelData.officeName}</div>
                            <div className="text-[10px] font-bold uppercase opacity-60 leading-none">{labelData.address.district}, {labelData.address.state}</div>
                            <div className="text-[8px] font-medium uppercase opacity-40">{labelData.address.circle} / {labelData.address.region}</div>
                        </div>
                        <div className="mt-6 flex justify-between items-end">
                            <div className="barcode tracking-widest text-[14px]">||||| {labelData.pincode} |||||</div>
                            <div className="text-[6px] font-black opacity-30">V.4.0.2 SYNCED</div>
                        </div>
                    </div>
                ) : (
                    <div className="opacity-10 text-center animate-pulse">
                        <Package className="w-24 h-24 mx-auto mb-6" />
                        <p className="font-black uppercase tracking-[0.5em]">No Data Manifest</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabel;
